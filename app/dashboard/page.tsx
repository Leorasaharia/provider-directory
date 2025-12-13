import { Navigation } from "@/components/navigation"
import { GlobalProgressBar } from "@/components/global-progress-bar"
import { DashboardStats } from "@/components/dashboard-stats"
import { DashboardChart } from "@/components/dashboard-chart"
import { mockProviders } from "@/lib/mock-data"
import { Toaster } from "@/components/ui/toaster"

export default function DashboardPage() {
  const totalProcessed = mockProviders.length
  const validated = mockProviders.filter((p) => p.status === "validated").length
  const flagged = mockProviders.filter((p) => p.status === "flagged").length
  const percentValidated = Math.round((validated / totalProcessed) * 100)
  const avgConfidence = Math.round(
    (mockProviders.reduce((sum, p) => sum + p.confidence, 0) / mockProviders.length) * 100,
  )

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <GlobalProgressBar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Overview of provider validation metrics and performance</p>
        </div>

        <DashboardStats
          totalProcessed={totalProcessed}
          percentValidated={percentValidated}
          flagged={flagged}
          avgConfidence={avgConfidence}
        />

        <div className="mt-8">
          <DashboardChart />
        </div>
      </main>
      <Toaster />
    </div>
  )
}
