"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import type { ScheduledReport } from "@/lib/api-types"
import { Calendar, Trash2, Plus } from "lucide-react"

interface ScheduledReportsListProps {
  schedules: ScheduledReport[]
  onDelete: (scheduleId: string) => void
  onToggle: (scheduleId: string, enabled: boolean) => void
  onCreate: () => void
}

export function ScheduledReportsList({ schedules, onDelete, onToggle, onCreate }: ScheduledReportsListProps) {
  const formatCron = (cron: string) => {
    // Simple cron formatter
    if (cron === "0 9 * * 1") return "Weekly on Monday at 9:00 AM"
    if (cron === "0 8 * * *") return "Daily at 8:00 AM"
    return cron
  }

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Scheduled Reports</h2>
          <p className="text-sm text-muted-foreground">Automate report generation and delivery</p>
        </div>
        <Button onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Schedule
        </Button>
      </div>

      {schedules.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">No scheduled reports yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-foreground">{schedule.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {schedule.type.toUpperCase()}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{formatCron(schedule.cron)}</p>
                <p className="mt-1 text-xs text-muted-foreground">Recipients: {schedule.recipients.join(", ")}</p>
              </div>
              <div className="flex items-center gap-4">
                <Switch checked={schedule.enabled} onCheckedChange={(enabled) => onToggle(schedule.id, enabled)} />
                <Button variant="ghost" size="sm" onClick={() => onDelete(schedule.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
