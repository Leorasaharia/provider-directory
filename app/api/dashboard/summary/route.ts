import { NextResponse } from "next/server"
import { generateMockDashboardSummary } from "@/lib/mock-api-data"

// GET /api/dashboard/summary - Get dashboard summary stats
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  // TODO: Filter by date range when implementing real backend
  const summary = generateMockDashboardSummary()
  return NextResponse.json(summary)
}
