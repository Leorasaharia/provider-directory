import { NextResponse } from "next/server"
import uploadStore from "@/lib/upload-store"

// GET /api/uploads/{uploadId}/progress - Get single upload progress
export async function GET(request: Request, { params }: { params: { uploadId: string } }) {
  const upload = uploadStore.getUpload(params.uploadId)
  if (!upload) {
    return NextResponse.json({ error: "Upload not found" }, { status: 404 })
  }

  return NextResponse.json(upload)
}
