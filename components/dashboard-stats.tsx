import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react"

interface DashboardStatsProps {
  totalProcessed: number
  percentValidated: number
  flagged: number
  avgConfidence: number
}

export function DashboardStats({ totalProcessed, percentValidated, flagged, avgConfidence }: DashboardStatsProps) {
  const stats = [
    {
      title: "Total Processed",
      value: totalProcessed.toLocaleString(),
      icon: Database,
      description: "Providers in system",
      color: "text-primary",
    },
    {
      title: "Validated",
      value: `${percentValidated}%`,
      icon: CheckCircle2,
      description: "Successfully validated",
      color: "text-success",
    },
    {
      title: "Flagged for Review",
      value: flagged.toLocaleString(),
      icon: AlertTriangle,
      description: "Needs manual review",
      color: "text-destructive",
    },
    {
      title: "Avg Confidence",
      value: `${avgConfidence}%`,
      icon: TrendingUp,
      description: "Overall accuracy",
      color: "text-warning",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
