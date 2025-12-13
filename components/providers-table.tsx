"use client"

import { useState, useMemo, useEffect } from "react"
import type { Provider } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ConfidenceBadge } from "@/components/confidence-badge"
import { StatusBadge } from "@/components/status-badge"
import { ProviderDetailModal } from "@/components/provider-detail-modal"
import { Search, ArrowUpDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type SortField = "name" | "confidence" | "status"
type SortOrder = "asc" | "desc"

export function ProvidersTable() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("confidence")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)

  const [providers, setProviders] = useState<Provider[]>([])

  useEffect(() => {
    async function loadProviders() {
      try {
        // Fetch uploads, pick latest by started_at
        const ul = await fetch('/api/uploads')
        const uploads = await ul.json()
        if (!uploads || uploads.length === 0) return
        const latest = uploads.sort((a: any, b: any) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())[0]
        const resp = await fetch(`/api/uploads/${latest.upload_id}/progress`)
        const data = await resp.json()
        if (data && data.providers) {
          // Map stored providers to the UI Provider shape (best-effort)
          const mapped = data.providers.map((p: any) => {
            const raw = p.raw || {}
            const get = (keys: string[]) => {
              for (const k of keys) if (raw[k] || raw[k.toLowerCase()]) return raw[k] ?? raw[k.toLowerCase()]
              return ""
            }
            const name = get(['name', 'provider_name', 'full_name']) || `Provider ${p.id}`
            const npi = get(['npi', 'npi id', 'npi_id']) || ''
            const specialty = get(['speciality', 'specialty', 'specialization']) || ''
            const phoneOriginal = get(['phone no.', 'phone', 'phone_number', 'phone_no']) || ''
            const phoneValidated = raw['phone_validated'] || raw['phone.validated'] || ''
            const addressValidated = raw['address_validated'] || raw['address.validated'] || get(['address']) || ''
            const confidence = typeof p.confidence === 'number' ? p.confidence : 0
            const status = p.confidence == null ? 'unprocessed' : confidence >= 0.6 ? 'validated' : 'flagged'
            return {
              id: p.id,
              name,
              npi,
              specialty,
              phone: { original: phoneOriginal, validated: phoneValidated },
              address: { validated: addressValidated },
              confidence,
              status,
            }
          })
          setProviders(mapped)
        }
      } catch (e) {
        console.error('Failed to load providers', e)
      }
    }
    loadProviders()
  }, [])

  const filteredAndSortedProviders = useMemo(() => {
    const filtered = providers.filter((provider) => {
      const matchesSearch =
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (provider.npi || '').includes(searchQuery) ||
        (provider.specialty || '').toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || provider.status === statusFilter

      return matchesSearch && matchesStatus
    })

    filtered.sort((a, b) => {
      let comparison = 0
      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name)
      } else if (sortField === "confidence") {
        comparison = a.confidence - b.confidence
      } else if (sortField === "status") {
        comparison = a.status.localeCompare(b.status)
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [providers, searchQuery, statusFilter, sortField, sortOrder])

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  return (
    <>
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-card-foreground">Providers ({filteredAndSortedProviders.length})</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search providers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 sm:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="sm:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="validated">Validated</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="unprocessed">Unprocessed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSort("name")}
                      className="h-auto p-0 font-medium text-foreground hover:text-primary"
                    >
                      Name
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">NPI</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">Specialty</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">Phone (Original)</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">Phone (Validated)</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">Address (Validated)</th>
                  <th className="px-4 py-3 text-left">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSort("confidence")}
                      className="h-auto p-0 font-medium text-foreground hover:text-primary"
                    >
                      Confidence
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSort("status")}
                      className="h-auto p-0 font-medium text-foreground hover:text-primary"
                    >
                      Status
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedProviders.map((provider) => (
                  <tr
                    key={provider.id}
                    onClick={() => setSelectedProvider(provider)}
                    className="cursor-pointer border-b border-border/50 transition-colors hover:bg-secondary/50"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{provider.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{provider.npi}</td>
                    <td className="px-4 py-3 text-muted-foreground">{provider.specialty}</td>
                    <td className="px-4 py-3 text-muted-foreground">{provider.phone.original}</td>
                    <td className="px-4 py-3 text-muted-foreground">{provider.phone.validated}</td>
                    <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">{provider.address.validated}</td>
                    <td className="px-4 py-3">
                      <ConfidenceBadge confidence={provider.confidence} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={provider.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {selectedProvider && (
        <ProviderDetailModal provider={selectedProvider} onClose={() => setSelectedProvider(null)} />
      )}
    </>
  )
}
