import { NextResponse } from "next/server"
import { listUploads, createUploadFromRows, updateUploadResults, getUpload } from "@/lib/upload-store"

// GET /api/uploads - List recent upload jobs
export async function GET() {
  const uploads = listUploads()
  return NextResponse.json(uploads)
}

// POST /api/uploads - Accept CSV upload, create upload job and call model server
export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const file = form.get("file") as any
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const filename = file.name || `upload-${Date.now()}.csv`

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

    const job = createUploadFromRows(filename, rows)

    // Forward CSV to model server for prediction
    const fm = new FormData()
    const blob = new Blob([text], { type: "text/csv" })
    fm.append("file", blob, filename)

    // Call local model server (ensure it's running on port 8001)
    const modelResp = await fetch("http://127.0.0.1:8001/predict_csv", {
      method: "POST",
      body: fm,
    })

    if (!modelResp.ok) {
      const err = await modelResp.text()
      return NextResponse.json({ error: "Model server error", details: err }, { status: 502 })
    }

    const predictions = await modelResp.json()
    // predictions expected: [{ id: number|string, confidence: number }, ...]
    updateUploadResults(job.upload_id, predictions)

    return NextResponse.json({ upload_id: job.upload_id }, { status: 201 })
  } catch (e: any) {
    console.error("Upload error:", e)
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 500 })
  }
}
