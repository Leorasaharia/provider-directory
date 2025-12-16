import type {
  UploadJob,
  DashboardSummary,
  TrendPoint,
  ErrorCategory,
  Report,
  ScheduledReport,
  FlaggedProvider,
} from "./api-types"
import { mockProviders } from "./mock-data"

// Generate mock upload jobs
export function generateMockUploadJobs(): UploadJob[] {
  const now = Date.now()
  return [
    {
      upload_id: "upload-1",
      filename: "providers_batch_001.csv",
      total_providers: 200,
      processed_count: 200,
      validated_count: 140,
      flagged_count: 60,
      status: "completed",
      started_at: new Date(now - 3600000).toISOString(),
      finished_at: new Date(now - 1800000).toISOString(),
      last_error: null,
      eta_seconds: null,
    },
    {
      upload_id: "upload-2",
      filename: "providers_batch_002.csv",
      total_providers: 150,
      processed_count: 95,
      validated_count: 70,
      flagged_count: 25,
      status: "processing",
      started_at: new Date(now - 600000).toISOString(),
      finished_at: null,
      last_error: null,
      eta_seconds: 180,
    },
    {
      upload_id: "upload-3",
      filename: "providers_batch_003.csv",
      total_providers: 100,
      processed_count: 0,
      validated_count: 0,
      flagged_count: 0,
      status: "queued",
      started_at: new Date(now - 60000).toISOString(),
      finished_at: null,
      last_error: null,
      eta_seconds: 300,
    },
  ]
}

// Generate mock dashboard summary
export function generateMockDashboardSummary(): DashboardSummary {
  return {
    total_processed: 450,
    validated_pct: 68.9,
    flagged_count: 140,
    avg_confidence: 0.76,
    throughput_per_hour: 75,
  }
}

// Generate mock trend data
export function generateMockTrends(days = 7): TrendPoint[] {
  const trends: TrendPoint[] = []
  const now = Date.now()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000)
    const processed = Math.floor(Math.random() * 100) + 50
    const validated = Math.floor(processed * (0.6 + Math.random() * 0.2))
    const flagged = processed - validated

    trends.push({
      date: date.toISOString().split("T")[0],
      processed,
      validated,
      flagged,
    })
  }

  return trends
}

// Generate mock error categories
export function generateMockErrorCategories(): ErrorCategory[] {
  return [
    { error_type: "Phone Number Mismatch", count: 45 },
    { error_type: "Address Changed", count: 38 },
    { error_type: "NPI Not Found", count: 22 },
    { error_type: "Specialty Mismatch", count: 18 },
    { error_type: "Duplicate Entry", count: 12 },
    { error_type: "Invalid Format", count: 8 },
  ]
}

// Generate mock flagged providers
export function generateMockFlaggedProviders(): FlaggedProvider[] {
  return mockProviders
    .filter((p) => p.status === "flagged")
    .map((p) => ({
      id: p.id,
      name: p.name,
      npi: p.npi,
      specialty: p.specialty,
      mobile_no: p.phone.validated || p.phone.original || "",
      confidence: p.confidence,
      priority_score: Math.random() * 100,
      error_types:
        p.phone.original !== p.phone.validated
          ? ["Phone Number Mismatch"]
          : p.address.original !== p.address.validated
            ? ["Address Changed"]
            : ["Low Confidence"],
      last_updated: p.lastUpdated,
    }))
    .sort((a, b) => b.priority_score - a.priority_score)
}

// Generate mock reports
export function generateMockReports(): Report[] {
  const now = Date.now()
  return [
    {
      id: "report-1",
      name: "Full Directory Export",
      type: "csv",
      status: "ready",
      created_at: new Date(now - 7200000).toISOString(),
      file_url: "/api/reports/download/report-1.csv",
    },
    {
      id: "report-2",
      name: "Flagged Providers Report",
      type: "pdf",
      status: "ready",
      created_at: new Date(now - 3600000).toISOString(),
      file_url: "/api/reports/download/report-2.pdf",
    },
    {
      id: "report-3",
      name: "Weekly Summary",
      type: "csv",
      status: "processing",
      created_at: new Date(now - 300000).toISOString(),
      file_url: null,
    },
  ]
}

// Generate mock scheduled reports
export function generateMockScheduledReports(): ScheduledReport[] {
  return [
    {
      id: "schedule-1",
      name: "Weekly Full Export",
      type: "csv",
      cron: "0 9 * * 1",
      filters: { status: "all" },
      recipients: ["admin@healthcare.com"],
      enabled: true,
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "schedule-2",
      name: "Daily Flagged Report",
      type: "pdf",
      cron: "0 8 * * *",
      filters: { status: "flagged" },
      recipients: ["qa@healthcare.com", "admin@healthcare.com"],
      enabled: true,
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]
}
