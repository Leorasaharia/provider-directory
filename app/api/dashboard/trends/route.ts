import { NextResponse } from "next/server"
import uploadStore from "@/lib/upload-store"

// GET /api/dashboard/trends - Get time-series trend data
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const interval = searchParams.get("interval") || "day"
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  // Build simple daily trends from uploads by started_at date
  const uploads = uploadStore.listUploads()
  const byDate: Record<string, { processed: number; validated: number; flagged: number }> = {}

  uploads.forEach((u) => {
    const d = new Date(u.started_at).toISOString().split("T")[0]
    if (!byDate[d]) byDate[d] = { processed: 0, validated: 0, flagged: 0 }
    byDate[d].processed += u.processed_count || 0
    byDate[d].validated += u.validated_count || 0
    byDate[d].flagged += u.flagged_count || 0
  })

  const dates = Object.keys(byDate).sort()
  const trends = dates.map((date) => ({ date, ...byDate[date] }))

  return NextResponse.json(trends)
}
