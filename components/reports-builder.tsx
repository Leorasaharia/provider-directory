"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, Download } from "lucide-react"
import { useState } from "react"

interface ReportsBuilderProps {
  onGenerate: (config: { type: "csv" | "pdf"; filters: Record<string, any> }) => void
}

export function ReportsBuilder({ onGenerate }: ReportsBuilderProps) {
  const [reportType, setReportType] = useState<"csv" | "pdf">("csv")
  const [includeValidated, setIncludeValidated] = useState(true)
  const [includeFlagged, setIncludeFlagged] = useState(true)
  const [includeUnprocessed, setIncludeUnprocessed] = useState(false)

  const handleGenerate = () => {
    const filters = {
      include_validated: includeValidated,
      include_flagged: includeFlagged,
      include_unprocessed: includeUnprocessed,
    }
    onGenerate({ type: reportType, filters })
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Generate Report</h2>
        <p className="text-sm text-muted-foreground">
          Reports may take a few minutes to generate. You'll receive a notification when ready.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Report Format</Label>
          <Select value={reportType} onValueChange={(value) => setReportType(value as "csv" | "pdf")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
              <SelectItem value="pdf">PDF (Document)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Include Providers</Label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox id="validated" checked={includeValidated} onCheckedChange={setIncludeValidated} />
              <label htmlFor="validated" className="text-sm text-foreground cursor-pointer">
                Validated providers
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="flagged" checked={includeFlagged} onCheckedChange={setIncludeFlagged} />
              <label htmlFor="flagged" className="text-sm text-foreground cursor-pointer">
                Flagged providers
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="unprocessed" checked={includeUnprocessed} onCheckedChange={setIncludeUnprocessed} />
              <label htmlFor="unprocessed" className="text-sm text-foreground cursor-pointer">
                Unprocessed providers
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="button" onClick={handleGenerate} className="flex-1">
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
          <Button type="button" variant="outline" onClick={() => onGenerate({ type: "csv", filters: { status: "flagged" } })}>
            <Download className="mr-2 h-4 w-4" />
            Quick Export Flagged
          </Button>
        </div>
      </div>
    </Card>
  )
}
