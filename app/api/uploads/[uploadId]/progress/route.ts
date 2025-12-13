import { NextResponse } from "next/server"
import { getUploadWithDetails } from "@/lib/upload-store"

// GET /api/uploads/{uploadId}/progress - Get single upload progress
export async function GET(request: Request, { params }: { params: { uploadId: string } }) {
  const upload = getUploadWithDetails(params.uploadId)
  if (!upload) {
    return NextResponse.json({ error: "Upload not found" }, { status: 404 })
  }

  // Return upload job with additional details including providers
  return NextResponse.json({
    upload_id: upload.upload_id,
    filename: upload.filename,
    total_providers: upload.total_providers,
    processed_count: upload.processed_count,
    validated_count: upload.validated_count,
    flagged_count: upload.flagged_count,
    status: upload.status,
    started_at: upload.started_at,
    finished_at: upload.finished_at,
    last_error: upload.last_error,
    eta_seconds: upload.eta_seconds,
    avg_confidence: upload.avg_confidence ?? null,
    zip_file_count: upload.zip_file_count ?? null, // Include ZIP file count if available
    providers: upload.providers || [], // Include providers array
  })
}
