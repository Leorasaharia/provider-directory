import { NextResponse } from "next/server"
import { generateMockUploadJobs } from "@/lib/mock-api-data"

// GET /api/uploads - List recent upload jobs
export async function GET() {
  const uploads = generateMockUploadJobs()
  return NextResponse.json(uploads)
}
