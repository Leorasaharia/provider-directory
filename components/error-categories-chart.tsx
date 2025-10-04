"use client"

import { Card } from "@/components/ui/card"
import type { ErrorCategory } from "@/lib/api-types"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ErrorCategoriesChartProps {
  errors: ErrorCategory[]
  onErrorClick?: (errorType: string) => void
}

export function ErrorCategoriesChart({ errors, onErrorClick }: ErrorCategoriesChartProps) {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Top Error Categories</h2>
        <p className="text-sm text-muted-foreground">Most common validation issues</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={errors} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis dataKey="error_type" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={150} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Bar
            dataKey="count"
            fill="hsl(var(--primary))"
            radius={[0, 4, 4, 0]}
            onClick={(data) => onErrorClick?.(data.error_type)}
            cursor="pointer"
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
