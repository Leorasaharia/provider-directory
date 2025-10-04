"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { FlaggedProvider } from "@/lib/api-types"
import { ConfidenceBadge } from "./confidence-badge"
import { ExternalLink, CheckCircle } from "lucide-react"

interface FlaggedProvidersTableProps {
  providers: FlaggedProvider[]
  onOpenProvider?: (providerId: string) => void
  onAcceptField?: (providerId: string) => void
  onMarkResolved?: (providerId: string) => void
}

export function FlaggedProvidersTable({
  providers,
  onOpenProvider,
  onAcceptField,
  onMarkResolved,
}: FlaggedProvidersTableProps) {
  if (providers.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <p className="text-lg font-medium text-foreground">No flagged providers</p>
        <p className="text-sm text-muted-foreground">All providers have been validated successfully</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Provider</TableHead>
            <TableHead>NPI</TableHead>
            <TableHead>Specialty</TableHead>
            <TableHead>Confidence</TableHead>
            <TableHead>Error Types</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {providers.map((provider) => (
            <TableRow key={provider.id}>
              <TableCell className="font-medium">{provider.name}</TableCell>
              <TableCell className="font-mono text-sm">{provider.npi}</TableCell>
              <TableCell>{provider.specialty}</TableCell>
              <TableCell>
                <ConfidenceBadge confidence={provider.confidence} />
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {provider.error_types.map((error) => (
                    <Badge key={error} variant="outline" className="text-xs">
                      {error}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
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
                  {provider.priority_score.toFixed(0)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onOpenProvider?.(provider.id)}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onMarkResolved?.(provider.id)}>
                    Resolve
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
