import { NextResponse } from "next/server"
import { generateMockFlaggedProviders } from "@/lib/mock-api-data"

// GET /api/flagged - Get list of flagged providers
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = Number.parseInt(searchParams.get("limit") || "50")
  const offset = Number.parseInt(searchParams.get("offset") || "0")

  const flagged = generateMockFlaggedProviders()
  const paginated = flagged.slice(offset, offset + limit)

  return NextResponse.json({
    data: paginated,
    total: flagged.length,
    limit,
    offset,
  })
}
