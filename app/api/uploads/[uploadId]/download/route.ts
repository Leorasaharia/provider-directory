import { NextResponse } from "next/server"
import uploadStore from "@/lib/upload-store"

// GET /api/uploads/{uploadId}/download - download CSV of results
export async function GET(request: Request, { params }: { params: { uploadId: string } }) {
  const upload = uploadStore.getUpload(params.uploadId)
  if (!upload) {
    return NextResponse.json({ error: "Upload not found" }, { status: 404 })
  }

  // Build CSV header from provider raw keys
  const providers = upload.providers || []
  const allKeys = new Set<string>()
  providers.forEach((p) => Object.keys(p.raw || {}).forEach((k) => allKeys.add(k)))
  const keys = Array.from(allKeys)

  const header = [...keys, "confidence", "status"].join(",")
  const rows = providers.map((p) => {
    const raw = p.raw || {}
    const values = keys.map((k) => {
      const v = raw[k] ?? raw[k.toLowerCase()] ?? ""
      // escape double quotes
      if (typeof v === "string" && (v.includes(",") || v.includes('"') || v.includes("\n"))) {
        return `"${String(v).replace(/"/g, '""')}"`
      }
      return String(v)
    })
    const confidence = typeof p.confidence === "number" ? p.confidence.toFixed(4) : ""
    const status = p.confidence == null ? "unprocessed" : (p.confidence >= 0.6 ? "validated" : "flagged")
    return [...values, confidence, status].join(",")
  })

  const csv = [header, ...rows].join("\n")

  const filename = `${upload.filename.replace(/\.[^/.]+$/, "")}-results.csv`
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
