"use client"

import type { FlaggedProvider, ProviderReport } from "@/lib/api-types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ConfidenceBadge } from "@/components/confidence-badge"
import { CheckCircle2, Mail, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"

interface FlaggedProviderDetailModalProps {
  providerId: string | null
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
          <p className="text-sm text-foreground">{original || "-"}</p>
        </div>
        <div className="rounded-lg border border-border bg-secondary/20 p-3">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Validated</p>
            <ConfidenceBadge confidence={confidence} />
          </div>
          <p className={`text-sm ${hasChanged ? "font-medium text-primary" : "text-foreground"}`}>
            {validated || "-"}
          </p>
        </div>
      </div>
    </div>
  )
}

export function FlaggedProviderDetailModal({ providerId, onClose }: FlaggedProviderDetailModalProps) {
  const { toast } = useToast()
  const [providerData, setProviderData] = useState<{
    provider: ProviderReport
    confidence: number | null
  } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!providerId) {
      setProviderData(null)
      return
    }

    setLoading(true)
    fetch(`/api/providers/${encodeURIComponent(providerId)}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Provider not found")
          }
          throw new Error("Failed to fetch provider")
        }
        return res.json()
      })
      .then((data) => {
        if (!data || !data.provider_input) {
          throw new Error("Invalid provider data")
        }
        setProviderData({
          provider: {
            provider_input: data.provider_input,
            provider_output: data.provider_output,
            status: data.status,
            reasons: data.reasons || [],
            priority_score: data.priority_score || 0,
            priority_level: data.priority_level || "MEDIUM",
          },
          confidence: data.confidence ?? 0,
        })
      })
      .catch((error) => {
        console.error("Failed to load provider:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to load provider details.",
          variant: "destructive",
        })
        setProviderData(null)
      })
      .finally(() => setLoading(false))
  }, [providerId, toast])

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

  if (!providerId) return null

  const provider = providerData?.provider
  const confidence = providerData?.confidence ?? 0

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-secondary rounded" />
            <div className="h-48 bg-secondary rounded" />
          </div>
        ) : provider ? (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-2xl">{provider.provider_input.name}</DialogTitle>
                  <p className="mt-1 text-sm text-muted-foreground">{provider.provider_input.speciality}</p>
                </div>
                <div className="flex items-center gap-2">
                  <ConfidenceBadge confidence={confidence} />
                  <Badge
                    variant="outline"
                    className={
                      provider.priority_score > 70
                        ? "border-red-500/20 bg-red-500/10 text-red-500"
                        : provider.priority_score > 40
                          ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-500"
                          : "border-green-500/20 bg-green-500/10 text-green-500"
                    }
                  >
                    Priority: {provider.priority_score.toFixed(0)}
                  </Badge>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid gap-4 rounded-lg border border-border bg-card p-4 md:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">NPI Number</p>
                  <p className="font-mono text-sm text-foreground">{provider.provider_input.npi}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Mobile Number</p>
                  <p className="text-sm text-foreground">
                    {provider.provider_output.mobile_no?.value || provider.provider_input.mobile_no || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Error Types</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {provider.reasons?.map((reason) => (
                      <Badge key={reason} variant="outline" className="text-xs">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Overall Confidence</p>
                  <ConfidenceBadge confidence={confidence} className="mt-1" />
                </div>
              </div>

              {/* Field Comparisons */}
              <div className="space-y-6">
                <FieldComparison
                  label="Mobile Number"
                  original={provider.provider_input.mobile_no}
                  validated={provider.provider_output.mobile_no?.value || provider.provider_input.mobile_no}
                  confidence={provider.provider_output.mobile_no?.confidence || 0}
                  onAccept={() => handleAcceptField("Mobile Number")}
                />

                <FieldComparison
                  label="Address"
                  original={provider.provider_input.address}
                  validated={provider.provider_output.address?.value || provider.provider_input.address}
                  confidence={provider.provider_output.address?.confidence || 0}
                  onAccept={() => handleAcceptField("Address")}
                />

                <FieldComparison
                  label="Name"
                  original={provider.provider_input.name}
                  validated={provider.provider_output.name?.value || provider.provider_input.name}
                  confidence={provider.provider_output.name?.confidence || 0}
                  onAccept={() => handleAcceptField("Name")}
                />

                <FieldComparison
                  label="Specialty"
                  original={provider.provider_input.speciality}
                  validated={provider.provider_output.speciality?.value || provider.provider_input.speciality}
                  confidence={provider.provider_output.speciality?.confidence || 0}
                  onAccept={() => handleAcceptField("Specialty")}
                />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                <Button onClick={handleAcceptAll} className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Accept All Changes
                </Button>
                <Button onClick={onClose} variant="outline" className="gap-2 bg-transparent">
                  <Mail className="h-4 w-4" />
                  Send Verification Email
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Provider not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

