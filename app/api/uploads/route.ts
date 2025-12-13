import { NextResponse } from "next/server"
import uploadStore from "@/lib/upload-store"
import { ProviderInput, ProviderReport } from "@/lib/api-types"

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, "")

// GET /api/uploads - List recent upload jobs
export async function GET() {
  const uploads = uploadStore.listUploads()
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

    // Handle ZIP/PDF file (PDF extraction)
    if (fileExtension === 'zip' || fileExtension === 'pdf') {
      // Send ZIP/PDF to Flow-1 ingest-pdf endpoint
      const zipFormData = new FormData()
      zipFormData.append("file", file)

      const resp = await fetch(`${API_BASE}/flow1/ingest-pdf`, {
        method: "POST",
        body: zipFormData,
      })

      if (!resp.ok) {
        const errText = await resp.text()
        return NextResponse.json({ error: "Backend error", details: errText }, { status: 502 })
      }

      const data = await resp.json()
      const extractedProviders: ProviderInput[] = data.providers || []

      if (extractedProviders.length === 0) {
        return NextResponse.json({ error: "No providers extracted from file" }, { status: 400 })
      }

      // Create upload job from extracted providers
      const rows = extractedProviders.map((p) => ({
        name: p.name,
        npi: p.npi,
        mobile_no: p.mobile_no,
        address: p.address,
        speciality: p.speciality,
        member_impact: String(p.member_impact),
      }))

      const job = uploadStore.createUploadFromRows(filename, rows)

      // Process extracted providers in batches
      const BATCH_SIZE = 10
      const batches: ProviderInput[][] = []
      for (let i = 0; i < extractedProviders.length; i += BATCH_SIZE) {
        batches.push(extractedProviders.slice(i, i + BATCH_SIZE))
      }

      // Process batches asynchronously
      const processBatches = async () => {
        const allReports: ProviderReport[] = []
        
        for (let i = 0; i < batches.length; i++) {
          const batch = batches[i]
          
          try {
            const batchResp = await fetch(`${API_BASE}/flow1/validate-batch`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(batch),
            })

            if (!batchResp.ok) {
              const errText = await batchResp.text()
              throw new Error(`Backend error: ${errText}`)
            }

            const { reports } = (await batchResp.json()) as { reports: ProviderReport[] }
            allReports.push(...reports)

            // Update progress incrementally
            const currentJob = uploadStore.getUpload(job.upload_id)
            if (currentJob) {
              currentJob.processed_count = allReports.length
              currentJob.validated_count = allReports.filter(
                (r) => r.status === "confirmed" || r.priority_level === "LOW"
              ).length
              currentJob.flagged_count = allReports.filter(
                (r) => r.status !== "confirmed" || r.priority_level !== "LOW"
              ).length

              reports.forEach((r, idx) => {
                const globalIdx = i * BATCH_SIZE + idx
                const p = currentJob.providers[globalIdx]
                if (p) {
                  p.report = r
                  const avgConf = [
                    r.provider_output?.name?.confidence ?? 0,
                    r.provider_output?.npi?.confidence ?? 0,
                    r.provider_output?.mobile_no?.confidence ?? 0,
                    r.provider_output?.address?.confidence ?? 0,
                    r.provider_output?.speciality?.confidence ?? 0,
                  ]
                  p.confidence = avgConf.length ? avgConf.reduce((a, b) => a + b, 0) / avgConf.length : 0
                }
              })

              const confs = currentJob.providers.map((p) => p.confidence ?? 0).filter((c) => c > 0)
              currentJob.avg_confidence = confs.length ? confs.reduce((a, b) => a + b, 0) / confs.length : null
            }
          } catch (error) {
            console.error(`Error processing batch ${i + 1}:`, error)
          }
        }

        const finalJob = uploadStore.getUpload(job.upload_id)
        if (finalJob) {
          finalJob.status = "completed"
          finalJob.finished_at = new Date().toISOString()
          finalJob.eta_seconds = null
        }
      }

      processBatches().catch((error) => {
        console.error("Batch processing error:", error)
        const errorJob = uploadStore.getUpload(job.upload_id)
        if (errorJob) {
          errorJob.status = "failed"
          errorJob.last_error = error.message || String(error)
        }
      })

      return NextResponse.json({ upload_id: job.upload_id }, { status: 201 })
    }

    // Handle CSV file (original logic)
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

    const job = uploadStore.createUploadFromRows(filename, rows)

    // Map rows into Flow-1 ProviderInput
    const providers: ProviderInput[] = rows.map((r) => ({
      name: r.name ?? r.Name ?? "",
      npi: r.npi ?? r.NPI ?? "",
      mobile_no: r.mobile_no ?? r.phone ?? r.mobile ?? "",
      address: r.address ?? r.Address ?? "",
      speciality: r.speciality ?? r.specialty ?? "",
      member_impact: Number(r.member_impact ?? r.Member_Impact ?? 3) || 3,
    }))

    // Process in batches for real-time progress updates
    const BATCH_SIZE = 10 // Process 10 providers at a time
    const batches: ProviderInput[][] = []
    for (let i = 0; i < providers.length; i += BATCH_SIZE) {
      batches.push(providers.slice(i, i + BATCH_SIZE))
    }

    // Process batches asynchronously
    const processBatches = async () => {
      const allReports: ProviderReport[] = []
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i]
        
        try {
          // Call Flow-1 backend for this batch
          const resp = await fetch(`${API_BASE}/flow1/validate-batch`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(batch),
          })

          if (!resp.ok) {
            const errText = await resp.text()
            throw new Error(`Backend error: ${errText}`)
          }

          const { reports } = (await resp.json()) as { reports: ProviderReport[] }
          allReports.push(...reports)

          // Update progress incrementally
          const currentJob = uploadStore.getUpload(job.upload_id)
          if (currentJob) {
            // Update processed count
            currentJob.processed_count = allReports.length
            
            // Update validated and flagged counts
            currentJob.validated_count = allReports.filter(
              (r) => r.status === "confirmed" || r.priority_level === "LOW"
            ).length
            currentJob.flagged_count = allReports.filter(
              (r) => r.status !== "confirmed" || r.priority_level !== "LOW"
            ).length

            // Update provider reports incrementally
            reports.forEach((r, idx) => {
              const globalIdx = i * BATCH_SIZE + idx
              const p = currentJob.providers[globalIdx]
              if (p) {
                p.report = r
                const avgConf = [
                  r.provider_output?.name?.confidence ?? 0,
                  r.provider_output?.npi?.confidence ?? 0,
                  r.provider_output?.mobile_no?.confidence ?? 0,
                  r.provider_output?.address?.confidence ?? 0,
                  r.provider_output?.speciality?.confidence ?? 0,
                ]
                p.confidence = avgConf.length ? avgConf.reduce((a, b) => a + b, 0) / avgConf.length : 0
              }
            })

            // Update average confidence
            const confs = currentJob.providers.map((p) => p.confidence ?? 0).filter((c) => c > 0)
            currentJob.avg_confidence = confs.length ? confs.reduce((a, b) => a + b, 0) / confs.length : null
          }
        } catch (error) {
          console.error(`Error processing batch ${i + 1}:`, error)
          // Continue with next batch even if one fails
        }
      }

      // Mark as completed
      const finalJob = uploadStore.getUpload(job.upload_id)
      if (finalJob) {
        finalJob.status = "completed"
        finalJob.finished_at = new Date().toISOString()
        finalJob.eta_seconds = null
      }
    }

    // Start processing in background (don't wait for completion)
    processBatches().catch((error) => {
      console.error("Batch processing error:", error)
      const errorJob = uploadStore.getUpload(job.upload_id)
      if (errorJob) {
        errorJob.status = "failed"
        errorJob.last_error = error.message || String(error)
      }
    })

    // Return immediately with upload_id
    return NextResponse.json({ upload_id: job.upload_id }, { status: 201 })
  } catch (e: any) {
    console.error("Upload error:", e)
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 500 })
  }
}