import { cn } from "@/lib/utils"
import { CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react"

interface StatusBadgeProps {
  status: "unprocessed" | "processing" | "validated" | "flagged"
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = {
    unprocessed: {
      label: "Unprocessed",
      icon: Clock,
      className: "bg-muted text-muted-foreground border-border",
    },
    processing: {
      label: "Processing",
      icon: Loader2,
      className: "bg-primary/20 text-primary border-primary/30",
    },
    validated: {
      label: "Validated",
      icon: CheckCircle2,
      className: "bg-success/20 text-success border-success/30",
    },
    flagged: {
      label: "Flagged",
      icon: AlertCircle,
      className: "bg-destructive/20 text-destructive border-destructive/30",
    },
  }

  const { label, icon: Icon, className: statusClassName } = config[status]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium",
        statusClassName,
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  )
}
