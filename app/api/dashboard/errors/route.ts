import { NextResponse } from "next/server"
import { generateMockErrorCategories } from "@/lib/mock-api-data"

// GET /api/dashboard/errors - Get top error categories
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = Number.parseInt(searchParams.get("limit") || "10")

  const errors = generateMockErrorCategories().slice(0, limit)
  return NextResponse.json(errors)
}
