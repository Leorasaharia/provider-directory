import { NextResponse } from "next/server"
import uploadStore from "@/lib/upload-store"

// GET /api/dashboard/summary - Aggregate across stored uploads
export async function GET(request: Request) {
  const uploads = uploadStore.listUploads()
  const total_processed = uploads.reduce((sum, u) => sum + (u.processed_count ?? 0), 0)
  const total_validated = uploads.reduce((sum, u) => sum + (u.validated_count ?? 0), 0)
  const flagged_count = uploads.reduce((sum, u) => sum + (u.flagged_count ?? 0), 0)
  const avg_conf_vals = uploads
    .map((u) => u.avg_confidence)
    .filter((v): v is number => typeof v === "number")

  const avg_confidence = avg_conf_vals.length
    ? avg_conf_vals.reduce((a, b) => a + b, 0) / avg_conf_vals.length
    : 0
  const validated_pct = total_processed > 0 ? (total_validated / total_processed) * 100 : 0

  const summary = {
    total_processed,
    validated_pct: Number(validated_pct.toFixed(1)),
    flagged_count,
    avg_confidence: Number(avg_confidence.toFixed(2)),
    throughput_per_hour: 0, // not tracked yet
  }

  return NextResponse.json(summary)
}