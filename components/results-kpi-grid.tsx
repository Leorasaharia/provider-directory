"use client"

import { Card } from "@/components/ui/card"
import type { DashboardSummary } from "@/lib/api-types"
import { TrendingUp, CheckCircle2, AlertTriangle, Target } from "lucide-react"

interface ResultsKpiGridProps {
  summary: DashboardSummary
}

export function ResultsKpiGrid({ summary }: ResultsKpiGridProps) {
  const kpis = [
    {
      label: "Total Processed",
      value: summary.total_processed.toLocaleString(),
      icon: TrendingUp,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Validated %",
      value: `${summary.validated_pct.toFixed(1)}%`,
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Flagged",
      value: summary.flagged_count.toLocaleString(),
      icon: AlertTriangle,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      label: "Avg Confidence",
      value: summary.avg_confidence.toFixed(2),
      icon: Target,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon
        return (
          <Card key={kpi.label} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{kpi.value}</p>
              </div>
              <div className={`rounded-lg p-3 ${kpi.bgColor}`}>
                <Icon className={`h-6 w-6 ${kpi.color}`} />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
