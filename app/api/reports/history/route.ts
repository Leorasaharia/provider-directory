import { NextResponse } from "next/server"
import uploadStore from "@/lib/upload-store"
import type { Report } from "@/lib/api-types"

// GET /api/reports/history - Get report history from completed uploads
export async function GET() {
  try {
    const uploads = uploadStore.listUploads()
    const completedUploads = uploads.filter((u) => u.status === "completed")

    // Generate reports from completed uploads
    const reports: Report[] = completedUploads.map((upload) => {
      const reportId = `report-${upload.upload_id}-csv`
      return {
        id: reportId,
        name: `${upload.filename.replace(/\.[^/.]+$/, "")} - Results`,
        type: "csv" as const,
        status: "ready" as const,
        created_at: upload.finished_at || upload.started_at,
        file_url: `/api/reports/download/${reportId}`,
      }
    })

    // Sort by creation date, newest first
    reports.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return NextResponse.json(reports)
  } catch (error) {
    console.error("Error fetching report history:", error)
    return NextResponse.json({ error: "Failed to fetch report history" }, { status: 500 })
  }
}
