"use client"

import { Navigation } from "@/components/navigation"
import { GlobalProgressBar } from "@/components/global-progress-bar"
import { ReportsBuilder } from "@/components/reports-builder"
import { ScheduledReportsList } from "@/components/scheduled-reports-list"
import { ReportsHistoryList } from "@/components/reports-history-list"
import { Toaster } from "@/components/ui/toaster"
import { usePolling } from "@/hooks/use-polling"
import type { Report, ScheduledReport } from "@/lib/api-types"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function ReportsPage() {
  const { toast } = useToast()
  const [refreshKey, setRefreshKey] = useState(0)

  const { data: reports } = usePolling<Report[]>(`/api/reports/history?_=${refreshKey}`, 10000)

  const { data: schedules } = usePolling<ScheduledReport[]>(`/api/reports/schedules?_=${refreshKey}`, 30000)

  const handleGenerateReport = async (config: { type: "csv" | "pdf"; filters: Record<string, any> }) => {
    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })

      const data = await response.json()

      toast({
        title: "Report generation started",
        description: "You'll be notified when the report is ready for download.",
      })

      setRefreshKey((prev) => prev + 1)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDownloadReport = (reportId: string) => {
    const report = reports?.find((r) => r.id === reportId)
    if (report?.file_url) {
      window.open(report.file_url, "_blank")
      toast({
        title: "Download started",
        description: `Downloading ${report.name}`,
      })
    }
  }

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      await fetch(`/api/reports/schedule/${scheduleId}`, { method: "DELETE" })
      toast({
        title: "Schedule deleted",
        description: "The scheduled report has been removed.",
      })
      setRefreshKey((prev) => prev + 1)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete schedule.",
        variant: "destructive",
      })
    }
  }

  const handleToggleSchedule = async (scheduleId: string, enabled: boolean) => {
    // TODO: Implement toggle endpoint
    toast({
      title: enabled ? "Schedule enabled" : "Schedule disabled",
      description: `The scheduled report has been ${enabled ? "enabled" : "disabled"}.`,
    })
  }

  const handleCreateSchedule = () => {
    // TODO: Open modal for creating new schedule
    toast({
      title: "Coming soon",
      description: "Schedule creation UI will be available soon.",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <GlobalProgressBar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate and schedule provider directory reports</p>
        </div>

        <div className="space-y-6">
          <ReportsBuilder onGenerate={handleGenerateReport} />

          {schedules && (
            <ScheduledReportsList
              schedules={schedules}
              onDelete={handleDeleteSchedule}
              onToggle={handleToggleSchedule}
              onCreate={handleCreateSchedule}
            />
          )}

          {reports && <ReportsHistoryList reports={reports} onDownload={handleDownloadReport} />}
        </div>
      </main>
      <Toaster />
    </div>
  )
}
