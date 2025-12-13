import { NextResponse } from "next/server"
import uploadStore from "@/lib/upload-store"
import type { ErrorCategory } from "@/lib/api-types"

// GET /api/dashboard/errors - Get top error categories from flagged providers
export async function GET(request: Request) {
  try {
  const { searchParams } = new URL(request.url)
  const limit = Number.parseInt(searchParams.get("limit") || "10")

    const latest = uploadStore.getLatestCompletedUpload()
    if (!latest) {
      return NextResponse.json([])
    }

    // Count error types from flagged providers
    const errorCounts: Record<string, number> = {}
    latest.providers.forEach((p) => {
      if (p.report && (p.report.status !== "confirmed" || p.report.priority_level === "HIGH")) {
        const reasons = p.report.reasons || []
        if (reasons.length === 0) {
          // If no specific reasons, use a generic category
          const category = "Needs Review"
          errorCounts[category] = (errorCounts[category] || 0) + 1
        } else {
          reasons.forEach((reason) => {
            errorCounts[reason] = (errorCounts[reason] || 0) + 1
          })
        }
      }
    })

    // Convert to ErrorCategory array and sort by count
    const errors: ErrorCategory[] = Object.entries(errorCounts)
      .map(([error_type, count]) => ({ error_type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)

  return NextResponse.json(errors)
  } catch (error) {
    console.error("Error fetching error categories:", error)
    return NextResponse.json({ error: "Failed to fetch error categories" }, { status: 500 })
  }
}
