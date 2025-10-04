// Data models for the new features

export interface UploadJob {
  upload_id: string
  filename: string
  total_providers: number
  processed_count: number
  validated_count: number
  flagged_count: number
  status: "queued" | "processing" | "completed" | "failed"
  started_at: string
  finished_at: string | null
  last_error: string | null
  eta_seconds: number | null
}

export interface DashboardSummary {
  total_processed: number
  validated_pct: number
  flagged_count: number
  avg_confidence: number
  throughput_per_hour: number
}

export interface TrendPoint {
  date: string
  processed: number
  validated: number
  flagged: number
}

export interface ErrorCategory {
  error_type: string
  count: number
}

export interface Report {
  id: string
  name: string
  type: "csv" | "pdf"
  status: "pending" | "processing" | "ready" | "failed"
  created_at: string
  file_url: string | null
}

export interface ScheduledReport {
  id: string
  name: string
  type: "csv" | "pdf"
  cron: string
  filters: Record<string, any>
  recipients: string[]
  enabled: boolean
  created_at: string
}

export interface FlaggedProvider {
  id: string
  name: string
  npi: string
  specialty: string
  confidence: number
  priority_score: number
  error_types: string[]
  last_updated: string
}
