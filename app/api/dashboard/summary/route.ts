import { NextResponse } from "next/server"
import uploadStore from "@/lib/upload-store"

// GET /api/dashboard/summary - Get dashboard summary stats
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  // Aggregate across stored uploads
  const uploads = uploadStore.listUploads()
  const all = uploads
  const total_processed = all.reduce((sum, u) => sum + (u.processed_count ?? 0), 0)
  const total_validated = all.reduce((sum, u) => sum + (u.validated_count ?? 0), 0)
  const flagged_count = all.reduce((sum, u) => sum + (u.flagged_count ?? 0), 0)
  const avg_confidence_vals = (
    all.map((u) => (u as any).avg_confidence).filter((v) => typeof v === "number") as number[]
  )
  const avg_confidence = avg_confidence_vals.length ? avg_confidence_vals.reduce((a, b) => a + b, 0) / avg_confidence_vals.length : 0
  const validated_pct = total_processed > 0 ? (total_validated / total_processed) * 100 : 0

  const summary = {
    total_processed,
    validated_pct: Number(validated_pct.toFixed(1)),
    flagged_count,
    avg_confidence: Number((avg_confidence || 0).toFixed(2)),
    throughput_per_hour: 0,
  }

  return NextResponse.json(summary)
}
