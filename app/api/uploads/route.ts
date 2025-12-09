import { NextResponse } from "next/server"
import {
  listUploads,
  createUploadFromRows,
  updateUploadWithReports,
} from "@/lib/upload-store"
import { ProviderInput, ProviderReport } from "@/lib/api-types"

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, "")

// GET /api/uploads - List recent upload jobs
export async function GET() {
  const uploads = listUploads()
  return NextResponse.json(uploads)
}

// POST /api/uploads - Accept CSV upload, send to Flow-1 backend, store results
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

    // Map rows into Flow-1 ProviderInput
    const providers: ProviderInput[] = rows.map((r) => ({
      name: r.name ?? r.Name ?? "",
      npi: r.npi ?? r.NPI ?? "",
      mobile_no: r.mobile_no ?? r.phone ?? r.mobile ?? "",
      address: r.address ?? r.Address ?? "",
      speciality: r.speciality ?? r.specialty ?? "",
      member_impact: Number(r.member_impact ?? r.Member_Impact ?? 3) || 3,
    }))

    // Call Flow-1 backend
    const resp = await fetch(`${API_BASE}/flow1/validate-batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(providers),
    })

    if (!resp.ok) {
      const errText = await resp.text()
      return NextResponse.json({ error: "Backend error", details: errText }, { status: 502 })
    }

    const { reports } = (await resp.json()) as { reports: ProviderReport[] }
    updateUploadWithReports(job.upload_id, reports)

    return NextResponse.json({ upload_id: job.upload_id }, { status: 201 })
  } catch (e: any) {
    console.error("Upload error:", e)
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 500 })
  }
}