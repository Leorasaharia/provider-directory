"use client"

import type { Provider } from "@/lib/mock-data"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ConfidenceBadge } from "@/components/confidence-badge"
import { StatusBadge } from "@/components/status-badge"
import { CheckCircle2, Flag, Mail, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useState } from "react"

interface ProviderDetailModalProps {
  provider: Provider
  onClose: () => void
}

interface FieldComparisonProps {
  label: string
  original: string
  validated: string
  confidence: number
  onAccept?: () => void
}

function FieldComparison({ label, original, validated, confidence, onAccept }: FieldComparisonProps) {
  const hasChanged = original !== validated

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">{label}</h4>
        {hasChanged && onAccept && (
          <Button variant="outline" size="sm" onClick={onAccept} className="gap-2 bg-transparent">
            <CheckCircle2 className="h-3 w-3" />
            Accept
          </Button>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-secondary/20 p-3">
          <p className="mb-1 text-xs text-muted-foreground">Original</p>
          <p className="text-sm text-foreground">{original}</p>
        </div>
        <div className="rounded-lg border border-border bg-secondary/20 p-3">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Validated</p>
            <ConfidenceBadge confidence={confidence} />
          </div>
          <p className={`text-sm ${hasChanged ? "font-medium text-primary" : "text-foreground"}`}>{validated}</p>
        </div>
      </div>
    </div>
  )
}

export function ProviderDetailModal({ provider, onClose }: ProviderDetailModalProps) {
  const { toast } = useToast()
  const [isFlagged, setIsFlagged] = useState(provider.status === "flagged")

  const handleAcceptField = (field: string) => {
    toast({
      title: "Field accepted",
      description: `${field} has been accepted and updated.`,
    })
  }

  const handleAcceptAll = () => {
    toast({
      title: "All fields accepted",
      description: "All validated fields have been accepted.",
    })
    setTimeout(onClose, 1000)
  }

  const handleFlag = () => {
    setIsFlagged(true)
    toast({
      title: "Provider flagged",
      description: "This provider has been flagged for manual review.",
      variant: "destructive",
    })
  }

  const handleSendEmail = () => {
    toast({
      title: "Email sent",
      description: `Verification email sent to ${provider.email || "provider"}`,
    })
  }

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl">{provider.name}</DialogTitle>
                <p className="mt-1 text-sm text-muted-foreground">{provider.specialty}</p>
              </div>
              <StatusBadge status={provider.status} />
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid gap-4 rounded-lg border border-border bg-card p-4 md:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">NPI Number</p>
                <p className="font-mono text-sm text-foreground">{provider.npi}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm text-foreground">{provider.email || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last Updated</p>
                <p className="text-sm text-foreground">{new Date(provider.lastUpdated).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Overall Confidence</p>
                <ConfidenceBadge confidence={provider.confidence} className="mt-1" />
              </div>
            </div>

            {/* Field Comparisons */}
            <div className="space-y-6">
              <FieldComparison
                label="Phone Number"
                original={provider.phone.original}
                validated={provider.phone.validated}
                confidence={provider.confidence}
                onAccept={() => handleAcceptField("Phone")}
              />

              <FieldComparison
                label="Address"
                original={provider.address.original}
                validated={provider.address.validated}
                confidence={provider.confidence}
                onAccept={() => handleAcceptField("Address")}
              />
            </div>

            {/* Data Sources */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h4 className="mb-3 text-sm font-medium text-foreground">Data Sources</h4>
              <div className="flex flex-wrap gap-2">
                {(provider.sources || []).map((source) => (
                  <Button key={source} variant="outline" size="sm" className="gap-2 bg-transparent">
                    {source}
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 border-t border-border pt-4">
              <Button onClick={handleAcceptAll} className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Accept All Changes
              </Button>
              {isFlagged ? (
                <Button onClick={handleSendEmail} variant="outline" className="gap-2 bg-transparent">
                  <Mail className="h-4 w-4" />
                  Send Follow-up Email
                </Button>
              ) : (
                <Button onClick={handleFlag} variant="destructive" className="gap-2">
                  <Flag className="h-4 w-4" />
                  Flag for Review
                </Button>
              )}
              <Button onClick={handleSendEmail} variant="outline" className="gap-2 bg-transparent">
                <Mail className="h-4 w-4" />
                Send Verification Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  )
}
