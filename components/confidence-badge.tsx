import { cn } from "@/lib/utils"

interface ConfidenceBadgeProps {
  confidence: number
  className?: string
}

export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
  const percentage = Math.round(confidence * 100)

  const getColor = () => {
    if (confidence >= 0.8) return "bg-success/20 text-success border-success/30"
    if (confidence >= 0.5) return "bg-warning/20 text-warning border-warning/30"
    return "bg-destructive/20 text-destructive border-destructive/30"
  }

  return (
    <span
      className={cn("inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium", getColor(), className)}
    >
      {percentage}%
    </span>
  )
}
