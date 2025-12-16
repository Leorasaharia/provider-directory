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
  avg_confidence?: number | null
}

export interface ProviderInput {
  name: string
  npi: string
  mobile_no: string
  address: string
  speciality: string
  member_impact: number
}

export interface FieldWithConfidence {
  value: string
  confidence: number
  note?: string | null
}

export interface ProviderOutput {
  name: FieldWithConfidence
  npi: FieldWithConfidence
  mobile_no: FieldWithConfidence
  address: FieldWithConfidence
  speciality: FieldWithConfidence
}

export interface ProviderReport {
  provider_input: ProviderInput
  provider_output: ProviderOutput
  status: string
  reasons: string[]
  priority_score: number
  priority_level: "HIGH" | "MEDIUM" | "LOW"
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
  mobile_no: string
  mobile_no_original?: string
  mobile_no_validated?: string
  confidence: number
  priority_score: number
  error_types: string[]
  last_updated: string
}