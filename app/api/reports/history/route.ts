import { NextResponse } from "next/server"
import { generateMockReports } from "@/lib/mock-api-data"

// GET /api/reports/history - Get report history
export async function GET() {
  const reports = generateMockReports()
  return NextResponse.json(reports)
}
