"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { TrendPoint } from "@/lib/api-types"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useState } from "react"

interface TrendsChartProps {
  trends: TrendPoint[]
}

export function TrendsChart({ trends }: TrendsChartProps) {
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("7d")

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Processing Trends</h2>
          <p className="text-sm text-muted-foreground">Daily processed vs validated providers</p>
        </div>
        <div className="flex gap-2">
          <Button variant={dateRange === "7d" ? "default" : "outline"} size="sm" onClick={() => setDateRange("7d")}>
            7 Days
          </Button>
          <Button variant={dateRange === "30d" ? "default" : "outline"} size="sm" onClick={() => setDateRange("30d")}>
            30 Days
          </Button>
          <Button variant={dateRange === "90d" ? "default" : "outline"} size="sm" onClick={() => setDateRange("90d")}>
            90 Days
          </Button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={trends}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="processed" stroke="hsl(var(--primary))" strokeWidth={2} name="Processed" />
          <Line type="monotone" dataKey="validated" stroke="#10b981" strokeWidth={2} name="Validated" />
          <Line type="monotone" dataKey="flagged" stroke="#f59e0b" strokeWidth={2} name="Flagged" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
