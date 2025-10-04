"use client"

import { Navigation } from "@/components/navigation"
import { GlobalProgressBar } from "@/components/global-progress-bar"
import { ResultsKpiGrid } from "@/components/results-kpi-grid"
import { TrendsChart } from "@/components/trends-chart"
import { ErrorCategoriesChart } from "@/components/error-categories-chart"
import { FlaggedProvidersTable } from "@/components/flagged-providers-table"
import { Card } from "@/components/ui/card"
import { Toaster } from "@/components/ui/toaster"
import { usePolling } from "@/hooks/use-polling"
import type { DashboardSummary, TrendPoint, ErrorCategory, FlaggedProvider } from "@/lib/api-types"
import { useState } from "react"
import { ConfidenceInfoDialog } from "@/components/confidence-info-dialog"
import { ErrorTypesInfoDialog } from "@/components/error-types-info-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

export default function ResultsDashboardPage() {
  const [selectedError, setSelectedError] = useState<string | null>(null)
  const [resolvedProviders, setResolvedProviders] = useState<FlaggedProvider[]>([])
  const { toast } = useToast()

  const { data: summary, loading: summaryLoading } = usePolling<DashboardSummary>("/api/dashboard/summary", 10000)

  const { data: trends, loading: trendsLoading } = usePolling<TrendPoint[]>("/api/dashboard/trends", 30000)

  const { data: errors, loading: errorsLoading } = usePolling<ErrorCategory[]>("/api/dashboard/errors?limit=6", 30000)

  const { data: flaggedData, loading: flaggedLoading } = usePolling<{
    data: FlaggedProvider[]
    total: number
  }>("/api/flagged?limit=10", 10000)

  const handleErrorClick = (errorType: string) => {
    setSelectedError(errorType)
    // TODO: Filter flagged providers by error type
  }

  const handleMarkResolved = (providerId: string) => {
    const provider = flaggedData?.data.find((p) => p.id === providerId)
    if (provider) {
      setResolvedProviders((prev) => [...prev, provider])
      toast({
        title: "Issue resolved",
        description: `${provider.name} has been marked as resolved and moved to the Validated tab.`,
      })
    }
  }

  if (summaryLoading && !summary) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <GlobalProgressBar />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-secondary rounded" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-secondary rounded" />
              ))}
            </div>
          </div>
        </div>
        <Toaster />
      </div>
    )
  }

  const activeFlaggedProviders = flaggedData?.data.filter((p) => !resolvedProviders.find((r) => r.id === p.id)) || []

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <GlobalProgressBar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Results Dashboard</h1>
          <p className="text-muted-foreground">Monitor validation performance and identify issues</p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <ConfidenceInfoDialog />
          <ErrorTypesInfoDialog />
        </div>

        <div className="space-y-6">
          {summary && <ResultsKpiGrid summary={summary} />}

          <div className="grid gap-6 lg:grid-cols-2">
            {trends && <TrendsChart trends={trends} />}
            {errors && <ErrorCategoriesChart errors={errors} onErrorClick={handleErrorClick} />}
          </div>

          <Card className="p-6">
            <Tabs defaultValue="flagged" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="flagged">Flagged Providers ({activeFlaggedProviders.length})</TabsTrigger>
                <TabsTrigger value="resolved">Validated Providers ({resolvedProviders.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="flagged">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-foreground">Flagged Providers</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedError ? `Filtered by: ${selectedError}` : "Providers requiring review"}
                  </p>
                </div>
                <FlaggedProvidersTable
                  providers={activeFlaggedProviders}
                  onOpenProvider={(id) => console.log("Open provider:", id)}
                  onMarkResolved={handleMarkResolved}
                />
              </TabsContent>

              <TabsContent value="resolved">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-foreground">Validated Providers</h2>
                  <p className="text-sm text-muted-foreground">Providers that have been reviewed and validated</p>
                </div>
                {resolvedProviders.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-8 text-center">
                    <p className="text-sm text-muted-foreground">No validated providers yet</p>
                  </div>
                ) : (
                  <FlaggedProvidersTable
                    providers={resolvedProviders}
                    onOpenProvider={(id) => console.log("Open provider:", id)}
                  />
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </main>
      <Toaster />
    </div>
  )
}
