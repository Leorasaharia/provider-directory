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
    const fileType = form.get("type") as string
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const filename = file.name || `upload-${Date.now()}.${fileType === "zip" ? "zip" : "csv"}`
    const isZip = fileType === "zip" || filename.toLowerCase().endsWith(".zip")

    let reports: ProviderReport[]
    let job: ReturnType<typeof uploadStore.createUploadFromRows> | ReturnType<typeof uploadStore.createUploadForZip>

    if (isZip) {
      // Create upload job first with status "processing" so progress loader shows
      job = uploadStore.createUploadForZip(filename)

      // Handle ZIP file upload - send to /flow1/ingest-pdf endpoint
      const arrayBuffer = await file.arrayBuffer()
      const blob = new Blob([arrayBuffer])
      
      const formDataForBackend = new FormData()
      formDataForBackend.append("file", blob, filename)

      const resp = await fetch(`${API_BASE}/flow1/ingest-pdf`, {
        method: "POST",
        body: formDataForBackend,
      })

      if (!resp.ok) {
        const errText = await resp.text()
        // Mark job as failed
        const failedJob = uploadStore.getUpload(job.upload_id)
        if (failedJob) {
          failedJob.status = "failed"
          failedJob.last_error = errText
        }
        return NextResponse.json({ error: "Backend error", details: errText }, { status: 502 })
      }

      const result = (await resp.json()) as {
        total_extracted_providers: number
        reports: ProviderReport[]
        review_queue: any[]
      }

      reports = result.reports

      // Update upload with extracted providers and reports
      uploadStore.updateUploadWithProvidersAndReports(job.upload_id, reports)
    } else {
      // Handle CSV file upload with real-time progress
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

      job = uploadStore.createUploadFromRows(filename, rows)

      // Map rows into Flow-1 ProviderInput
      const providers: ProviderInput[] = rows.map((r) => ({
        name: r.name ?? r.Name ?? "",
        npi: r.npi ?? r.NPI ?? "",
        mobile_no: r.mobile_no ?? r.phone ?? r.mobile ?? "",
        address: r.address ?? r.Address ?? "",
        speciality: r.speciality ?? r.specialty ?? "",
        member_impact: Number(r.member_impact ?? r.Member_Impact ?? 3) || 3,
      }))

      // Process providers in batches for real-time progress updates
      const BATCH_SIZE = 10
      const totalBatches = Math.ceil(providers.length / BATCH_SIZE)
      
      // Process asynchronously so API can return immediately
      ;(async () => {
        try {
          for (let i = 0; i < totalBatches; i++) {
            const start = i * BATCH_SIZE
            const end = Math.min(start + BATCH_SIZE, providers.length)
            const batch = providers.slice(start, end)

            // Call Flow-1 backend for this batch
            const resp = await fetch(`${API_BASE}/flow1/validate-batch`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(batch),
            })

            if (!resp.ok) {
              const errText = await resp.text()
              const failedJob = uploadStore.getUpload(job.upload_id)
              if (failedJob) {
                failedJob.status = "failed"
                failedJob.last_error = `Batch ${i + 1} failed: ${errText}`
              }
              return
            }

            const result = (await resp.json()) as { reports: ProviderReport[] }
            const batchReports = result.reports

            // Update upload with this batch's reports
            uploadStore.addReportsToUpload(job.upload_id, batchReports, start)

            // Small delay to allow UI to update
            await new Promise(resolve => setTimeout(resolve, 100))
          }
        } catch (error: any) {
          const failedJob = uploadStore.getUpload(job.upload_id)
          if (failedJob) {
            failedJob.status = "failed"
            failedJob.last_error = error?.message || String(error)
          }
        }
      })()
    }

    return NextResponse.json({ upload_id: job.upload_id }, { status: 201 })
  } catch (e: any) {
    console.error("Upload error:", e)
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 500 })
  }
}