"use client"

import { Navigation } from "@/components/navigation"
import { GlobalProgressBar } from "@/components/global-progress-bar"
import { useParams, useRouter } from "next/navigation"
import { UploadProgressCard } from "@/components/upload-progress-card"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Toaster } from "@/components/ui/toaster"
import { usePolling } from "@/hooks/use-polling"
import type { UploadJob } from "@/lib/api-types"
import { ArrowLeft, RefreshCw } from "lucide-react"
import { useState } from "react"

export default function UploadProgressPage() {
  const params = useParams()
  const router = useRouter()
  const uploadId = params.uploadId as string

  const [refreshKey, setRefreshKey] = useState(0)

  const { data: upload, loading } = usePolling<UploadJob>(
    `/api/uploads/${uploadId}/progress?_=${refreshKey}`,
    3000,
    true,
  )

  const handleCancel = async () => {
    try {
      await fetch(`/api/uploads/${uploadId}/cancel`, { method: "POST" })
      setRefreshKey((prev) => prev + 1)
    } catch (error) {
      console.error("Failed to cancel upload:", error)
    }
  }

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  if (loading && !upload) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <GlobalProgressBar />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-secondary rounded" />
            <div className="h-48 bg-secondary rounded" />
          </div>
        </div>
        <Toaster />
      </div>
    )
  }

  if (!upload) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <GlobalProgressBar />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Upload not found</p>
          </Card>
        </div>
        <Toaster />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <GlobalProgressBar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Upload Progress</h1>
              <p className="text-muted-foreground">Track validation progress in real-time</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="space-y-6">
          <UploadProgressCard
            upload={upload}
            onCancel={upload.status === "processing" ? handleCancel : undefined}
            onViewProviders={upload.status === "completed" ? () => router.push("/providers") : undefined}
          />

          {upload.status === "processing" && (
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Live Updates</h2>
              <p className="text-sm text-muted-foreground">
                Validation started — {upload.processed_count} of {upload.total_providers} processed. This page
                automatically refreshes every 3 seconds.
              </p>
            </Card>
          )}

          {upload.status === "failed" && (
            <Card className="p-6 border-red-500/20 bg-red-500/5">
              <h2 className="mb-2 text-lg font-semibold text-red-500">Job Failed</h2>
              <p className="text-sm text-muted-foreground">
                The validation job encountered an error. Please check the logs or try uploading again.
              </p>
            </Card>
          )}
        </div>
      </main>
      <Toaster />
    </div>
  )
}
