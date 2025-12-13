"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { TrendPoint } from "@/lib/api-types"

interface DashboardChartProps {
  trends?: TrendPoint[]
}

const chartConfig = {
  processed: {
    label: "Processed",
    color: "hsl(var(--primary))",
  },
  validated: {
    label: "Validated",
    color: "hsl(var(--success))",
  },
  flagged: {
    label: "Flagged",
    color: "hsl(var(--destructive))",
  },
}

export function DashboardChart({ trends }: DashboardChartProps) {
  // Transform trends data for chart
  const chartData = trends
    ? trends.map((t) => {
        const date = new Date(t.date)
        return {
          day: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          processed: t.processed,
          validated: t.validated,
          flagged: t.flagged,
        }
      })
    : []

  if (chartData.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">Providers Processed Per Day</CardTitle>
          <CardDescription>Validation activity over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            <p>No data available yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-card-foreground">Providers Processed Per Day</CardTitle>
        <CardDescription>Validation activity over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="day"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="processed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="validated" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="flagged" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
