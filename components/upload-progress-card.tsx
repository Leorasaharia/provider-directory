"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { UploadJob } from "@/lib/api-types"
import { FileText, CheckCircle2, AlertCircle, Clock, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadProgressCardProps {
  upload: UploadJob
  onCancel?: () => void
  onViewProviders?: () => void
}

export function UploadProgressCard({ upload, onCancel, onViewProviders }: UploadProgressCardProps) {
  const progressPercent = upload.total_providers > 0 ? (upload.processed_count / upload.total_providers) * 100 : 0

  const statusConfig = {
    queued: { label: "Queued", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", icon: Clock },
    processing: { label: "Processing", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Clock },
    completed: { label: "Completed", color: "bg-green-500/10 text-green-500 border-green-500/20", icon: CheckCircle2 },
    failed: { label: "Failed", color: "bg-red-500/10 text-red-500 border-red-500/20", icon: XCircle },
  }

  const config = statusConfig[upload.status]
  const StatusIcon = config.icon

  const formatETA = (seconds: number | null) => {
    if (!seconds) return null
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="rounded-lg bg-secondary p-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-semibold text-foreground">{upload.filename}</h3>
              <p className="text-sm text-muted-foreground">
                {upload.total_providers === 0 
                  ? upload.zip_file_count 
                    ? `Processing ${upload.zip_file_count} PDF file${upload.zip_file_count > 1 ? 's' : ''} from ZIP...`
                    : "Extracting providers from ZIP file..."
                  : `${upload.processed_count} of ${upload.total_providers} providers processed`}
              </p>
            </div>

            <Progress value={progressPercent} className="h-2" />

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground">
                  <span className="font-medium text-foreground">{upload.validated_count}</span> validated
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span className="text-muted-foreground">
                  <span className="font-medium text-foreground">{upload.flagged_count}</span> flagged
                </span>
              </div>
              {upload.eta_seconds && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">ETA: {formatETA(upload.eta_seconds)}</span>
                </div>
              )}
            </div>

            {upload.last_error && (
              <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3">
                <p className="text-sm text-red-500">{upload.last_error}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <Badge variant="outline" className={cn("border", config.color)}>
            <StatusIcon className="mr-1 h-3 w-3" />
            {config.label}
          </Badge>

          <div className="flex gap-2">
            {upload.status === "processing" && onCancel && (
              <Button variant="outline" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            )}
            {upload.status === "completed" && onViewProviders && (
              <Button size="sm" onClick={onViewProviders}>
                View Providers
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
