"use client"

import { useState, useMemo } from "react"
import { mockProviders, type Provider } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ConfidenceBadge } from "@/components/confidence-badge"
import { CheckCircle2, X, AlertTriangle, ChevronDown, ChevronUp, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface ReviewItemProps {
  provider: Provider
  onAccept: (id: string) => void
  onReject: (id: string) => void
}

function ReviewItem({ provider, onAccept, onReject }: ReviewItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const phoneChanged = provider.phone.original !== provider.phone.validated
  const addressChanged = provider.address.original !== provider.address.validated

  const handleViewDetails = () => {
    // TODO: Navigate to provider details page or open modal
    console.log("View details for provider:", provider.id)
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between p-4">
        <div className="flex flex-1 items-center gap-4">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <div className="flex-1">
            <h3 className="font-medium text-foreground">{provider.name}</h3>
            <p className="text-sm text-muted-foreground">
              {provider.specialty} • NPI: {provider.npi}
            </p>
          </div>
          <ConfidenceBadge confidence={provider.confidence} />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-border p-4">
          <div className="space-y-4">
            {phoneChanged && (
              <div className="rounded-lg bg-secondary/20 p-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Phone Number Change</p>
                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Original</p>
                    <p className="text-sm text-foreground">{provider.phone.original}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Validated</p>
                    <p className="text-sm font-medium text-primary">{provider.phone.validated}</p>
                  </div>
                </div>
              </div>
            )}

            {addressChanged && (
              <div className="rounded-lg bg-secondary/20 p-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Address Change</p>
                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Original</p>
                    <p className="text-sm text-foreground">{provider.address.original}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Validated</p>
                    <p className="text-sm font-medium text-primary">{provider.address.validated}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 border-t border-border pt-4">
              <Button onClick={handleViewDetails} variant="outline" className="flex-1 gap-2 bg-transparent" size="sm">
                <Eye className="h-4 w-4" />
                View Details
              </Button>
              <Button onClick={() => onAccept(provider.id)} className="flex-1 gap-2" size="sm">
                <CheckCircle2 className="h-4 w-4" />
                Accept Changes
              </Button>
              <Button onClick={() => onReject(provider.id)} variant="destructive" className="flex-1 gap-2" size="sm">
                <X className="h-4 w-4" />
                Reject Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function ReviewQueue() {
  const { toast } = useToast()
  const [processedIds, setProcessedIds] = useState<Set<string>>(new Set())

  const flaggedProviders = useMemo(() => {
    return mockProviders
      .filter((p) => p.status === "flagged" && !processedIds.has(p.id))
      .sort((a, b) => a.confidence - b.confidence) // Lower confidence = higher priority
  }, [processedIds])

  const handleAccept = (id: string) => {
    setProcessedIds((prev) => new Set(prev).add(id))
    toast({
      title: "Changes accepted",
      description: "Provider information has been updated.",
    })
  }

  const handleReject = (id: string) => {
    setProcessedIds((prev) => new Set(prev).add(id))
    toast({
      title: "Changes rejected",
      description: "Original provider information retained.",
      variant: "destructive",
    })
  }

  return (
    <>
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-card-foreground">
              Flagged Providers ({flaggedProviders.length} pending)
            </CardTitle>
            {flaggedProviders.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  flaggedProviders.forEach((p) => handleAccept(p.id))
                }}
              >
                Accept All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {flaggedProviders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="mb-4 h-12 w-12 text-success" />
              <h3 className="mb-2 text-lg font-medium text-foreground">All caught up!</h3>
              <p className="text-sm text-muted-foreground">No providers currently flagged for review.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {flaggedProviders.map((provider) => (
                <ReviewItem key={provider.id} provider={provider} onAccept={handleAccept} onReject={handleReject} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Toaster />
    </>
  )
}
