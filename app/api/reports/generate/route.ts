import { NextResponse } from "next/server"
import uploadStore from "@/lib/upload-store"

// POST /api/reports/generate - Generate a new report
export async function POST(request: Request) {
  try {
  const body = await request.json()
  const { type, filters } = body

    const latest = uploadStore.getLatestCompletedUpload()
    if (!latest) {
      return NextResponse.json({ error: "No upload data available" }, { status: 404 })
    }

    const reportId = `report-${Date.now()}-${type}`
    const reportName = `Provider Directory Report - ${new Date().toLocaleDateString()}`

    // In a real system, you'd queue this for async processing
    // For now, we'll mark it as ready immediately since we can generate on-demand
    const report = {
      id: reportId,
      name: reportName,
      type: type || "csv",
      status: "ready" as const,
      created_at: new Date().toISOString(),
      file_url: `/api/reports/download/${reportId}`,
    }

  return NextResponse.json({
    report_id: reportId,
      status: "ready",
    message: "Report generation started",
      report,
  })
  } catch (error) {
    console.error("Report generation error:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
