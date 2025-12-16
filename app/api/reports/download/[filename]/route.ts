import { NextResponse } from "next/server"
import { generateMockReports } from "@/lib/mock-api-data"
import { mockProviders } from "@/lib/mock-data"

// GET /api/reports/download/:filename - Serve mock CSV/PDF download files
export async function GET(request: Request, { params }: { params: { filename: string } }) {
  const { filename } = params

  if (!filename) {
    return NextResponse.json({ error: "Filename required" }, { status: 400 })
  }

  // Map filename like `report-1.csv` -> report id `report-1`
  const reportId = filename.replace(/\.(csv|pdf)$/i, "")
  const reports = generateMockReports()
  const report = reports.find((r) => r.id === reportId)

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 })
  }

  // Serve CSV from mock providers
  if (filename.toLowerCase().endsWith(".csv")) {
    const headers = ["id", "name", "npi", "specialty", "phone", "confidence"]
    const rows = mockProviders.map((p) => [p.id, p.name, p.npi, p.specialty, p.phone.validated || p.phone.original || "", String(p.confidence)])

    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => escape(String(c))).join(","))].join("\n")

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  }

  // For non-CSV (e.g. PDF) return a simple downloadable blob (mock)
  const body = `Report: ${report.name}\nGenerated: ${new Date().toISOString()}\n\nThis is a mock ${report.type.toUpperCase()} file.`
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
