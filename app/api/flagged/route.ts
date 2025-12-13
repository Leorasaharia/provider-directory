import { NextResponse } from "next/server"
import uploadStore from "@/lib/upload-store"

// GET /api/flagged - Get list of flagged providers from all completed uploads
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = Number.parseInt(searchParams.get("limit") || "50")
  const offset = Number.parseInt(searchParams.get("offset") || "0")

  const { data, total } = uploadStore.getFlaggedProvidersFromLatest(limit, offset)

  return NextResponse.json({
    data,
    total,
    limit,
    offset,
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  })
}