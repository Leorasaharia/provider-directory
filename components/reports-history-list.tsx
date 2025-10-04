"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Report } from "@/lib/api-types"
import { Download, FileText, Clock, CheckCircle2, XCircle, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ReportsHistoryListProps {
  reports: Report[]
  onDownload: (reportId: string) => void
}

export function ReportsHistoryList({ reports, onDownload }: ReportsHistoryListProps) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  const statusConfig = {
    pending: { label: "Pending", color: "bg-gray-500/10 text-gray-500 border-gray-500/20", icon: Clock },
    processing: { label: "Processing", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Clock },
    ready: { label: "Ready", color: "bg-green-500/10 text-green-500 border-green-500/20", icon: CheckCircle2 },
    failed: { label: "Failed", color: "bg-red-500/10 text-red-500 border-red-500/20", icon: XCircle },
  }

  return (
    <>
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground">Report History</h2>
          <p className="text-sm text-muted-foreground">Download previously generated reports</p>
        </div>

        {reports.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">No reports generated yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => {
              const config = statusConfig[report.status]
              const StatusIcon = config.icon

              return (
                <div key={report.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-secondary p-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{report.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {new Date(report.created_at).toLocaleString()} • {report.type.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={cn("border", config.color)}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {config.label}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => setSelectedReport(report)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                    {report.status === "ready" && report.file_url && (
                      <Button size="sm" onClick={() => onDownload(report.id)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {selectedReport && (
        <Dialog open={true} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Report Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Report Name</p>
                  <p className="text-sm font-medium text-foreground">{selectedReport.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-sm font-medium text-foreground">{selectedReport.type.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant="outline" className={cn("border mt-1", statusConfig[selectedReport.status].color)}>
                    {statusConfig[selectedReport.status].label}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created At</p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(selectedReport.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Report ID</p>
                  <p className="text-sm font-mono text-foreground">{selectedReport.id}</p>
                </div>
                {selectedReport.file_url && (
                  <div>
                    <p className="text-xs text-muted-foreground">File URL</p>
                    <p className="text-sm font-mono text-foreground truncate">{selectedReport.file_url}</p>
                  </div>
                )}
              </div>
              {selectedReport.status === "ready" && selectedReport.file_url && (
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button onClick={() => onDownload(selectedReport.id)} className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
