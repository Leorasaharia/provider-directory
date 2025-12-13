import { NextResponse } from "next/server"
import uploadStore from "@/lib/upload-store"

// GET /api/debug/uploads - Debug endpoint to see all uploads and their data
export async function GET() {
  const allUploads = uploadStore.listUploads()
  
  const debugInfo = allUploads.map((u) => ({
    upload_id: u.upload_id,
    filename: u.filename,
    status: u.status,
    total_providers: u.total_providers,
    processed_count: u.processed_count,
    validated_count: u.validated_count,
    flagged_count: u.flagged_count,
    avg_confidence: u.avg_confidence,
    started_at: u.started_at,
    finished_at: u.finished_at,
  }))

  return NextResponse.json({
    total_uploads: allUploads.length,
    uploads: debugInfo,
    summary: {
      total_processed: allUploads.reduce((sum, u) => sum + (u.processed_count ?? 0), 0),
      total_validated: allUploads.reduce((sum, u) => sum + (u.validated_count ?? 0), 0),
      total_flagged: allUploads.reduce((sum, u) => sum + (u.flagged_count ?? 0), 0),
    },
  })
}

