"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function ErrorTypesInfoDialog() {
  const errorTypes = [
    {
      type: "Address Mismatch",
      description: "Provider's address doesn't match records in authoritative databases",
      severity: "high",
    },
    {
      type: "Phone Invalid",
      description: "Phone number format is incorrect or number is disconnected",
      severity: "high",
    },
    {
      type: "NPI Mismatch",
      description: "NPI number doesn't match provider name or specialty in NPPES database",
      severity: "critical",
    },
    {
      type: "Specialty Inconsistent",
      description: "Provider specialty differs across data sources",
      severity: "medium",
    },
    {
      type: "Missing Data",
      description: "Required fields are empty or incomplete",
      severity: "medium",
    },
    {
      type: "Duplicate Entry",
      description: "Provider appears multiple times with different information",
      severity: "high",
    },
    {
      type: "Outdated Information",
      description: "Data hasn't been updated in over 12 months",
      severity: "low",
    },
  ]

  const severityColors = {
    critical: "border-red-600/20 bg-red-600/10 text-red-600",
    high: "border-red-500/20 bg-red-500/10 text-red-500",
    medium: "border-yellow-500/20 bg-yellow-500/10 text-yellow-500",
    low: "border-blue-500/20 bg-blue-500/10 text-blue-500",
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <AlertCircle className="h-4 w-4" />
          Understanding Error Types
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Understanding Error Types</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Our validation system identifies various types of errors and inconsistencies in provider data. Here's what
            each error type means and how to address it.
          </p>

          <div className="space-y-3">
            {errorTypes.map((error) => (
              <div key={error.type} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="font-semibold text-foreground">{error.type}</h4>
                  <Badge variant="outline" className={severityColors[error.severity as keyof typeof severityColors]}>
                    {error.severity}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{error.description}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-secondary/20 p-4">
            <h4 className="font-semibold text-foreground mb-2">Recommended Actions</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>
                <strong>Critical/High:</strong> Requires immediate manual review and correction
              </li>
              <li>
                <strong>Medium:</strong> Should be reviewed within 7 days
              </li>
              <li>
                <strong>Low:</strong> Can be addressed during regular maintenance cycles
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
