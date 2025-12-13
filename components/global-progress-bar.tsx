"use client"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { usePolling } from "@/hooks/use-polling"
import type { UploadJob } from "@/lib/api-types"
import { Loader2 } from "lucide-react"
import Link from "next/link"

export function GlobalProgressBar() {
  const { data: uploads } = usePolling<UploadJob[]>("/api/uploads", 5000)

  if (!uploads) return null

  const activeUploads = uploads.filter((u) => u.status === "processing" || u.status === "queued")

  if (activeUploads.length === 0) return null

  // Show the first active upload
  const activeUpload = activeUploads[0]
  const progressPercent =
    activeUpload.total_providers > 0 ? (activeUpload.processed_count / activeUpload.total_providers) * 100 : 0

  return (
    <Link href={`/uploads/${activeUpload.upload_id}/progress`} className="block">
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
