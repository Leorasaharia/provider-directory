import { NextResponse } from "next/server"
import uploadStore from "@/lib/upload-store"

// GET /api/reports/download/{reportId} - Download a generated report
export async function GET(request: Request, { params }: { params: { reportId: string } }) {
  try {
    // For now, we'll generate reports from the latest upload
    // In a real system, you'd store generated reports separately
    const latest = uploadStore.getLatestCompletedUpload()
    if (!latest) {
      return NextResponse.json({ error: "No upload data available" }, { status: 404 })
    }

    // Extract report type from reportId (e.g., "report-123-csv" -> "csv")
    const reportType = params.reportId.includes("pdf") ? "pdf" : "csv"

    if (reportType === "csv") {
      // Build CSV from upload data
      const providers = latest.providers || []
      const allKeys = new Set<string>()
      providers.forEach((p) => Object.keys(p.raw || {}).forEach((k) => allKeys.add(k)))
      const keys = Array.from(allKeys)

      const header = [...keys, "confidence", "status"].join(",")
      const rows = providers.map((p) => {
        const raw = p.raw || {}
        const values = keys.map((k) => {
          const v = raw[k] ?? raw[k.toLowerCase()] ?? ""
          if (typeof v === "string" && (v.includes(",") || v.includes('"') || v.includes("\n"))) {
            return `"${String(v).replace(/"/g, '""')}"`
          }
          return String(v)
        })
        const confidence = typeof p.confidence === "number" ? p.confidence.toFixed(4) : ""
        const status = p.confidence == null ? "unprocessed" : p.confidence >= 0.6 ? "validated" : "flagged"
        return [...values, confidence, status].join(",")
      })

      const csv = [header, ...rows].join("\n")
      const filename = `report-${params.reportId}.csv`

      return new Response(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      })
    } else {
      // PDF generation would require a PDF library
      return NextResponse.json({ error: "PDF generation not yet implemented" }, { status: 501 })
    }
  } catch (error) {
    console.error("Report download error:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}

