import { NextResponse } from "next/server"
import { generateMockReports } from "@/lib/mock-api-data"

// GET /api/reports/{reportId} - Get report status and download URL
export async function GET(request: Request, { params }: { params: { reportId: string } }) {
  const reports = generateMockReports()
  const report = reports.find((r) => r.id === params.reportId)

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 })
  }

  return NextResponse.json(report)
}
