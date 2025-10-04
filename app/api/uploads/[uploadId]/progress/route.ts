import { NextResponse } from "next/server"
import { generateMockUploadJobs } from "@/lib/mock-api-data"

// GET /api/uploads/{uploadId}/progress - Get single upload progress
export async function GET(request: Request, { params }: { params: { uploadId: string } }) {
  const uploads = generateMockUploadJobs()
  const upload = uploads.find((u) => u.upload_id === params.uploadId)

  if (!upload) {
    return NextResponse.json({ error: "Upload not found" }, { status: 404 })
  }

  // Simulate progress for processing uploads
  if (upload.status === "processing") {
    const progress = Math.min(upload.processed_count + Math.floor(Math.random() * 5), upload.total_providers)
    upload.processed_count = progress
    upload.validated_count = Math.floor(progress * 0.7)
    upload.flagged_count = progress - upload.validated_count
    upload.eta_seconds = Math.max(0, Math.floor((upload.total_providers - progress) * 3))
  }

  return NextResponse.json(upload)
}
