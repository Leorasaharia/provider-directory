"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { TrendPoint } from "@/lib/api-types"

interface DashboardChartProps {
  trends?: TrendPoint[]
}

const chartConfig = {
  processed: {
    label: "Providers Processed",
    color: "hsl(var(--primary))",
  },
}

export function DashboardChart({ trends = [] }: DashboardChartProps) {
  // Format trends data for the chart
  const chartData = trends.length > 0
    ? trends.slice(-7).map((trend) => {
        const date = new Date(trend.date)
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" })
        return {
          day: dayName,
          processed: trend.processed,
        }
      })
    : [
        { day: "Mon", processed: 0 },
        { day: "Tue", processed: 0 },
        { day: "Wed", processed: 0 },
        { day: "Thu", processed: 0 },
        { day: "Fri", processed: 0 },
        { day: "Sat", processed: 0 },
        { day: "Sun", processed: 0 },
      ]

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-card-foreground">Providers Processed Per Day</CardTitle>
        <CardDescription>
          {trends.length > 0 ? `Last ${trends.length} days of validation activity` : "No data available"}
        </CardDescription>
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
              <Bar dataKey="processed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
