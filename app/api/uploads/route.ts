import { NextResponse } from "next/server"
import {
  listUploads,
  createUploadFromRows,
  updateUploadWithReports,
  createUploadForZip,
  updateUploadProviders,
  updateUploadStatus,
  updateUploadProgress,
  setUploadZipFileCount,
  getUpload,
} from "@/lib/upload-store"
import { ProviderInput, ProviderReport } from "@/lib/api-types"

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, "")

// Helper function to process ZIP file asynchronously
async function processZipFile(file: any, filename: string, uploadId: string) {
  try {
    // Count PDF files in ZIP by reading it
    const arrayBuffer = await file.arrayBuffer()
    
    // Simple ZIP file counting - read ZIP structure to count PDF files
    let pdfCount = 0
    try {
      // Read ZIP file entries by looking for PDF file signatures
      const text = new TextDecoder('latin1').decode(arrayBuffer)
      
      // Count occurrences of .pdf in file names (simple heuristic)
      // This is a simple approach - for production, use a proper ZIP parser
      const pdfMatches = text.match(/\.pdf[\x00-\x1F\x20]/gi)
      pdfCount = pdfMatches ? pdfMatches.length : 0
    } catch (e) {
      // If counting fails, continue without count
      console.warn("Could not count ZIP files:", e)
      pdfCount = 0
    }
    
    if (pdfCount > 0) {
      setUploadZipFileCount(uploadId, pdfCount)
    }
    
    // Create a FormData to forward the ZIP file to the backend
    const backendFormData = new FormData()
    const zipBlob = new Blob([arrayBuffer], { type: 'application/zip' })
    backendFormData.append("file", zipBlob, filename)

    // Call Flow-1 backend's ingest-pdf endpoint
    const resp = await fetch(`${API_BASE}/flow1/ingest-pdf`, {
      method: "POST",
      body: backendFormData,
    })

    if (!resp.ok) {
      const errText = await resp.text()
      updateUploadStatus(uploadId, "failed", `Backend error: ${errText}`)
      throw new Error(`Backend error: ${errText}`)
    }

    const result = (await resp.json()) as { 
      total_extracted_providers: number
      reports: ProviderReport[]
      review_queue: ProviderReport[]
    }

    // Check if we have reports
    if (!result.reports || result.reports.length === 0) {
      updateUploadStatus(uploadId, "failed", "No providers were extracted from the ZIP file")
      return
    }

    // Update upload job with extracted providers
    // First, create the provider rows structure to set total_providers
    const providers: ProviderInput[] = result.reports.map((r) => r.provider_input)
    updateUploadProviders(uploadId, providers)
    
    // Then update with reports (this will mark as completed)
    // updateUploadWithReports now handles creating providers array if needed, but we've already created it above
    updateUploadWithReports(uploadId, result.reports)
    
    // Double-check status is completed (safeguard)
    const job = getUpload(uploadId)
    if (job) {
      if (job.processed_count === job.total_providers && job.total_providers > 0 && job.status !== "completed") {
        console.log(`[processZipFile] Force setting status to completed for ${uploadId}`)
        updateUploadStatus(uploadId, "completed")
      }
    }
  } catch (error: any) {
    updateUploadStatus(uploadId, "failed", error?.message || String(error))
    throw error
  }
}

// Helper function to process CSV file in batches with real-time progress
async function processCsvFile(providers: ProviderInput[], uploadId: string, filename: string) {
  try {
    const BATCH_SIZE = 10 // Process 10 providers at a time
    const totalProviders = providers.length
    let processedCount = 0
    const allReports: ProviderReport[] = []

    // Process in batches
    for (let i = 0; i < providers.length; i += BATCH_SIZE) {
      const batch = providers.slice(i, i + BATCH_SIZE)
      
      // Call Flow-1 backend for this batch
      const resp = await fetch(`${API_BASE}/flow1/validate-batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(batch),
      })

      if (!resp.ok) {
        const errText = await resp.text()
        updateUploadStatus(uploadId, "failed", `Backend error: ${errText}`)
        throw new Error(`Backend error: ${errText}`)
      }

      const { reports } = (await resp.json()) as { reports: ProviderReport[] }
      allReports.push(...reports)
      processedCount += reports.length

      // Update progress incrementally
      updateUploadProgress(uploadId, processedCount, allReports)
    }

    // Final update to mark as completed
    updateUploadWithReports(uploadId, allReports)
  } catch (error: any) {
    updateUploadStatus(uploadId, "failed", error?.message || String(error))
    throw error
  }
}

// GET /api/uploads - List recent upload jobs
export async function GET() {
  const uploads = listUploads()
  return NextResponse.json(uploads)
}

// POST /api/uploads - Accept CSV or ZIP upload, send to Flow-1 backend, store results
export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const file = form.get("file") as any
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const filename = file.name || `upload-${Date.now()}`
    const fileExtension = filename.toLowerCase().split('.').pop() || ''

    // Handle ZIP files (containing PDFs)
    if (fileExtension === 'zip') {
      // Create upload job immediately so user can see progress
      const job = createUploadForZip(filename)
      
      // Process ZIP file asynchronously (don't await - return immediately)
      // This allows the user to see the progress page while processing happens
      processZipFile(file, filename, job.upload_id).catch((error) => {
        console.error("ZIP processing error:", error)
        updateUploadStatus(job.upload_id, "failed", error?.message || String(error))
      })

      // Return immediately so user can see progress page
      return NextResponse.json({ upload_id: job.upload_id }, { status: 201 })
    }

    // Handle CSV files - process asynchronously like ZIP
    // Read CSV text and parse headers/rows (simple CSV parser)
    const arrayBuffer = await file.arrayBuffer()
    const text = new TextDecoder().decode(arrayBuffer)
    const lines = text.split(/\r?\n/).filter((l) => l.trim())
    const headers = lines.length ? lines[0].split(",").map((h) => h.trim()) : []
    const rows = lines.slice(1).map((line) => {
      const cells = line.split(",").map((c) => c.trim())
      const obj: Record<string, string> = {}
      headers.forEach((h, i) => (obj[h] = cells[i] ?? ""))
      return obj
    })

    // Create upload job immediately
    const job = createUploadFromRows(filename, rows)

    // Map rows into Flow-1 ProviderInput
    const providers: ProviderInput[] = rows.map((r) => ({
      name: r.name ?? r.Name ?? "",
      npi: r.npi ?? r.NPI ?? "",
      mobile_no: r.mobile_no ?? r.phone ?? r.mobile ?? "",
      address: r.address ?? r.Address ?? "",
      speciality: r.speciality ?? r.specialty ?? "",
      member_impact: Number(r.member_impact ?? r.Member_Impact ?? 3) || 3,
    }))

    // Process CSV file asynchronously in batches (don't await - return immediately)
    processCsvFile(providers, job.upload_id, filename).catch((error) => {
      console.error("CSV processing error:", error)
      updateUploadStatus(job.upload_id, "failed", error?.message || String(error))
    })

    // Return immediately so user can see progress page
    return NextResponse.json({ upload_id: job.upload_id }, { status: 201 })
  } catch (e: any) {
    console.error("Upload error:", e)
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 500 })
  }
}