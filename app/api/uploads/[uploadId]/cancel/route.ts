import { NextResponse } from "next/server"

// POST /api/uploads/{uploadId}/cancel - Cancel upload job
export async function POST(request: Request, { params }: { params: { uploadId: string } }) {
  // TODO: Implement actual cancellation logic
  return NextResponse.json({ success: true, message: "Upload cancelled" })
}
