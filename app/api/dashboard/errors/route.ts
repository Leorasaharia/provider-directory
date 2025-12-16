import { NextResponse } from "next/server"
import uploadStore from "@/lib/upload-store"

// GET /api/dashboard/errors - Get top error categories from all uploads
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = Number.parseInt(searchParams.get("limit") || "10")

  const allUploads = uploadStore.listUploads()
  const completedUploads = allUploads.filter((u) => u.status === "completed")
  
  if (completedUploads.length === 0) {
    return NextResponse.json([])
  }

  // Count error types from flagged providers across all uploads
  const errorCounts: Record<string, number> = {}
  
  completedUploads.forEach((uploadSummary) => {
    const upload = uploadStore.getUpload(uploadSummary.upload_id)
    if (!upload) return
    
    upload.providers.forEach((p) => {
      if (p.report && (p.report.status !== "confirmed" || p.report.priority_level !== "LOW")) {
        const reasons = p.report.reasons || ["Needs review"]
        reasons.forEach((reason) => {
          errorCounts[reason] = (errorCounts[reason] || 0) + 1
        })
      }
    })
  })

  const errors = Object.entries(errorCounts)
    .map(([error_type, count]) => ({ error_type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)

  return NextResponse.json(errors)
}
