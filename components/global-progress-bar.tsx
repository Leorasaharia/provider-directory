"use client"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { usePolling } from "@/hooks/use-polling"
import type { UploadJob } from "@/lib/api-types"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function GlobalProgressBar() {
  const { data: uploads } = usePolling<UploadJob[]>("/api/uploads", 2000)
  const router = useRouter()
  const [clickedProgressBar, setClickedProgressBar] = useState(false)
  const [autoRedirected, setAutoRedirected] = useState(false)

  if (!uploads) return null

  const activeUploads = uploads.filter((u) => u.status === "processing" || u.status === "queued")
  const completedUploads = uploads.filter((u) => u.status === "completed")

  // Auto-redirect to progress page when upload completes (if user hasn't clicked progress bar)
  useEffect(() => {
    if (completedUploads.length > 0 && !clickedProgressBar && !autoRedirected) {
      const latestCompleted = completedUploads.sort(
        (a, b) => new Date(b.finished_at || b.started_at).getTime() - new Date(a.finished_at || a.started_at).getTime()
      )[0]
      
      // Only redirect if we're on the upload page
      if (typeof window !== "undefined" && window.location.pathname === "/upload") {
        setAutoRedirected(true)
        router.push(`/uploads/${latestCompleted.upload_id}/progress`)
      }
    }
  }, [completedUploads, clickedProgressBar, autoRedirected, router])

  if (activeUploads.length === 0) return null

  // Show the first active upload
  const activeUpload = activeUploads[0]
  const progressPercent =
    activeUpload.total_providers > 0 ? (activeUpload.processed_count / activeUpload.total_providers) * 100 : 0

  const handleClick = () => {
    setClickedProgressBar(true)
  }

  return (
    <Link href={`/uploads/${activeUpload.upload_id}/progress`} className="block" onClick={handleClick}>
      <div className="border-b border-border bg-card px-4 py-2 hover:bg-secondary/50 transition-colors cursor-pointer">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-4">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">
                  {activeUpload.filename} - {activeUpload.processed_count}/{activeUpload.total_providers} processed
                </span>
                {activeUploads.length > 1 && (
                  <Badge variant="outline" className="text-xs">
                    +{activeUploads.length - 1} more
                  </Badge>
                )}
              </div>
              <Progress value={progressPercent} className="h-1" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
