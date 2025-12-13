"use client"

import { Navigation } from "@/components/navigation"
import { GlobalProgressBar } from "@/components/global-progress-bar"
import { DashboardStats } from "@/components/dashboard-stats"
import { DashboardChart } from "@/components/dashboard-chart"
import { Toaster } from "@/components/ui/toaster"
import { usePolling } from "@/hooks/use-polling"
import type { DashboardSummary, TrendPoint } from "@/lib/api-types"

export default function DashboardPage() {
  const { data: summary, loading: summaryLoading } = usePolling<DashboardSummary>("/api/dashboard/summary", 10000)
  const { data: trends } = usePolling<TrendPoint[]>("/api/dashboard/trends", 30000)

  const totalProcessed = summary?.total_processed || 0
  const percentValidated = summary?.validated_pct || 0
  const flagged = summary?.flagged_count || 0
  const avgConfidence = Math.round((summary?.avg_confidence || 0) * 100)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <GlobalProgressBar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Overview of provider validation metrics and performance</p>
        </div>

        {summaryLoading && !summary ? (
          <div className="animate-pulse space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-secondary rounded" />
              ))}
            </div>
          </div>
        ) : (
          <>
        <DashboardStats
          totalProcessed={totalProcessed}
          percentValidated={percentValidated}
          flagged={flagged}
          avgConfidence={avgConfidence}
        />

        <div className="mt-8">
              <DashboardChart trends={trends} />
        </div>
          </>
        )}
      </main>
      <Toaster />
    </div>
  )
}
