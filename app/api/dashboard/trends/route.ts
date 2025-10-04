import { NextResponse } from "next/server"
import { generateMockTrends } from "@/lib/mock-api-data"

// GET /api/dashboard/trends - Get time-series trend data
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const interval = searchParams.get("interval") || "day"
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  // TODO: Implement date range filtering and interval grouping
  const trends = generateMockTrends(7)
  return NextResponse.json(trends)
}
