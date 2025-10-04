"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"

export function ConfidenceInfoDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <HelpCircle className="h-4 w-4" />
          Understanding Confidence Scores
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Understanding Confidence Scores</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-foreground mb-2">What is a Confidence Score?</h4>
            <p className="text-sm text-muted-foreground">
              The confidence score represents how certain our AI validation system is about the accuracy of the provider
              data. It's calculated based on multiple factors including data source reliability, consistency across
              sources, and validation checks.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Score Ranges</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-3 rounded-lg border border-green-500/20 bg-green-500/10 p-3">
                <div className="font-semibold text-green-500">90-100%</div>
                <div className="text-sm text-foreground">
                  <strong>High Confidence:</strong> Data verified across multiple authoritative sources with no
                  discrepancies.
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3">
                <div className="font-semibold text-yellow-500">70-89%</div>
                <div className="text-sm text-foreground">
                  <strong>Medium Confidence:</strong> Data verified but with minor inconsistencies or limited sources.
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                <div className="font-semibold text-red-500">Below 70%</div>
                <div className="text-sm text-foreground">
                  <strong>Low Confidence:</strong> Significant discrepancies found or insufficient verification sources.
                  Manual review recommended.
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Factors Affecting Confidence</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Number of authoritative data sources confirming the information</li>
              <li>Consistency of data across different sources</li>
              <li>Recency of the data</li>
              <li>Completeness of provider information</li>
              <li>Historical validation patterns</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
