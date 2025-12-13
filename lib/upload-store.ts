import {
  UploadJob,
  ProviderReport,
  ProviderOutput,
  FlaggedProvider,
} from "./api-types"

type ProviderRow = {
  id: string
  raw: Record<string, string>
  confidence?: number | null
  report?: ProviderReport
}

type StoredUpload = UploadJob & {
  providers: ProviderRow[]
  avg_confidence?: number | null
}

const uploads = new Map<string, StoredUpload>()

function makeId() {
  return `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function listUploads(): UploadJob[] {
  return Array.from(uploads.values()).map((u) => ({
    upload_id: u.upload_id,
    filename: u.filename,
    total_providers: u.total_providers,
    processed_count: u.processed_count,
    validated_count: u.validated_count,
    flagged_count: u.flagged_count,
    status: u.status,
    started_at: u.started_at,
    finished_at: u.finished_at,
    last_error: u.last_error,
    eta_seconds: u.eta_seconds,
    avg_confidence: u.avg_confidence ?? null,
  }))
}

export function getUpload(uploadId: string): StoredUpload | undefined {
  return uploads.get(uploadId)
}

export function createUploadFromRows(filename: string, rows: Record<string, string>[]) {
  const id = makeId()
  const now = new Date().toISOString()
  const providers = rows.map((r, i) => ({ id: String(i), raw: r, confidence: null, report: undefined }))
  const job: StoredUpload = {
    upload_id: id,
    filename,
    total_providers: providers.length,
    processed_count: 0,
    validated_count: 0,
    flagged_count: 0,
    status: "processing",
    started_at: now,
    finished_at: null,
    last_error: null,
    eta_seconds: null,
    providers,
    avg_confidence: null,
  }
  uploads.set(id, job)
  return job
}

export function createUploadForZip(filename: string) {
  const id = makeId()
  const now = new Date().toISOString()
  const job: StoredUpload = {
    upload_id: id,
    filename,
    total_providers: 0,
    processed_count: 0,
    validated_count: 0,
    flagged_count: 0,
    status: "processing",
    started_at: now,
    finished_at: null,
    last_error: null,
    eta_seconds: null,
    providers: [],
    avg_confidence: null,
  }
  uploads.set(id, job)
  return job
}

function averageFieldConfidence(output: ProviderOutput): number {
  const fields = [
    output.name?.confidence ?? 0,
    output.npi?.confidence ?? 0,
    output.mobile_no?.confidence ?? 0,
    output.address?.confidence ?? 0,
    output.speciality?.confidence ?? 0,
  ]
  return fields.length ? fields.reduce((a, b) => a + b, 0) / fields.length : 0
}

export function updateUploadProgress(uploadId: string, processedCount: number, validatedCount: number, flaggedCount: number) {
  const job = uploads.get(uploadId)
  if (!job) return

  job.processed_count = processedCount
  job.validated_count = validatedCount
  job.flagged_count = flaggedCount

  // Calculate ETA based on progress
  if (job.processed_count > 0 && job.total_providers > 0) {
    const elapsed = (Date.now() - new Date(job.started_at).getTime()) / 1000
    const rate = job.processed_count / elapsed
    const remaining = job.total_providers - job.processed_count
    job.eta_seconds = rate > 0 ? Math.ceil(remaining / rate) : null
  }

  uploads.set(uploadId, job)
}

export function updateUploadWithReports(uploadId: string, reports: ProviderReport[]) {
  const job = uploads.get(uploadId)
  if (!job) return

  // Map reports back to provider rows
  reports.forEach((r, idx) => {
    const p = job.providers[idx]
    if (!p) return
    p.report = r
    const conf = averageFieldConfidence(r.provider_output)
    p.confidence = conf
  })

  job.processed_count = reports.length
  // Validated: confirmed or updated status (both mean validation passed)
  // Flagged: needs_review status (requires manual review)
  job.validated_count = reports.filter((r) => 
    r.status === "confirmed" || r.status === "updated"
  ).length
  job.flagged_count = reports.filter((r) => 
    r.status === "needs_review"
  ).length

  const confs = job.providers.map((p) => p.confidence ?? 0)
  job.avg_confidence = confs.length ? confs.reduce((a, b) => a + b, 0) / confs.length : null
  job.eta_seconds = 0
  job.status = "completed"
  job.finished_at = new Date().toISOString()

  uploads.set(uploadId, job)
}

export function addReportsToUpload(uploadId: string, reports: ProviderReport[], startIndex: number) {
  const job = uploads.get(uploadId)
  if (!job) return

  // Map reports to provider rows starting from startIndex
  reports.forEach((r, idx) => {
    const providerIndex = startIndex + idx
    const p = job.providers[providerIndex]
    if (!p) return
    p.report = r
    const conf = averageFieldConfidence(r.provider_output)
    p.confidence = conf
  })

  // Update processed count
  job.processed_count = startIndex + reports.length

  // Recalculate validated and flagged counts from all processed reports
  const allProcessedReports = job.providers
    .slice(0, job.processed_count)
    .map(p => p.report)
    .filter((r): r is ProviderReport => Boolean(r))
  
  // Validated: confirmed or updated status (both mean validation passed)
  // Flagged: needs_review status (requires manual review)
  job.validated_count = allProcessedReports.filter((r) => 
    r.status === "confirmed" || r.status === "updated"
  ).length
  job.flagged_count = allProcessedReports.filter((r) => 
    r.status === "needs_review"
  ).length

  // Calculate ETA
  if (job.processed_count > 0 && job.total_providers > 0) {
    const elapsed = (Date.now() - new Date(job.started_at).getTime()) / 1000
    const rate = job.processed_count / elapsed
    const remaining = job.total_providers - job.processed_count
    job.eta_seconds = rate > 0 ? Math.ceil(remaining / rate) : null
  }

  // Check if all providers are processed
  if (job.processed_count >= job.total_providers) {
    const confs = job.providers.map((p) => p.confidence ?? 0).filter(c => c > 0)
    job.avg_confidence = confs.length ? confs.reduce((a, b) => a + b, 0) / confs.length : null
    job.eta_seconds = 0
    job.status = "completed"
    job.finished_at = new Date().toISOString()
  }

  uploads.set(uploadId, job)
}

export function updateUploadWithProvidersAndReports(
  uploadId: string,
  providers: ProviderReport[],
) {
  const job = uploads.get(uploadId)
  if (!job) return

  // Create provider rows from reports
  const providerRows = providers.map((r, i) => ({
    id: String(i),
    raw: {
      name: r.provider_input.name,
      npi: r.provider_input.npi,
      mobile_no: r.provider_input.mobile_no,
      address: r.provider_input.address,
      speciality: r.provider_input.speciality,
      member_impact: String(r.provider_input.member_impact),
    },
    confidence: averageFieldConfidence(r.provider_output),
    report: r,
  }))

  job.providers = providerRows
  job.total_providers = providerRows.length
  job.processed_count = providerRows.length
  // Validated: confirmed or updated status (both mean validation passed)
  // Flagged: needs_review status (requires manual review)
  job.validated_count = providers.filter((r) => 
    r.status === "confirmed" || r.status === "updated"
  ).length
  job.flagged_count = providers.filter((r) => 
    r.status === "needs_review"
  ).length

  const confs = providerRows.map((p) => p.confidence ?? 0)
  job.avg_confidence = confs.length ? confs.reduce((a, b) => a + b, 0) / confs.length : null
  job.eta_seconds = 0
  job.status = "completed"
  job.finished_at = new Date().toISOString()

  uploads.set(uploadId, job)
}

export function getLatestCompletedUpload(): StoredUpload | undefined {
  const completed = Array.from(uploads.values()).filter((u) => u.status === "completed")
  return completed.sort((a, b) => new Date(b.finished_at || b.started_at).getTime() - new Date(a.finished_at || a.started_at).getTime())[0]
}

export function getFlaggedProvidersFromLatest(limit: number, offset: number): { data: FlaggedProvider[]; total: number } {
  // Get all completed uploads, not just the latest
  const allCompleted = Array.from(uploads.values())
    .filter((u) => u.status === "completed")
    .sort((a, b) => new Date(b.finished_at || b.started_at).getTime() - new Date(a.finished_at || a.started_at).getTime())

  if (allCompleted.length === 0) return { data: [], total: 0 }

  // Aggregate flagged providers from all completed uploads
  const allFlagged: FlaggedProvider[] = []

  allCompleted.forEach((upload) => {
    upload.providers.forEach((p, idx) => {
      if (!p.report) return
      
      const report = p.report
      // Include flagged providers (needs_review status)
      if (report.status === "needs_review") {
        const raw = p.raw || {}
        
        // Try to get original mobile from report, or fallback to raw data with various field names
        const originalMobile = report.provider_input.mobile_no || 
                              raw.mobile_no || 
                              raw.phone || 
                              raw.phone_number || 
                              raw.mobile ||
                              raw["phone no."] ||
                              raw.phone_no ||
                              ""
        
        // Get validated mobile from report output, or use original
        const validatedMobile = report.provider_output.mobile_no?.value || originalMobile || ""
        
        allFlagged.push({
          id: `${upload.upload_id}::${idx}`,
          name: report.provider_input.name,
          npi: report.provider_input.npi,
          specialty: report.provider_input.speciality,
          mobile_no: validatedMobile || originalMobile,
          mobile_no_original: originalMobile,
          mobile_no_validated: validatedMobile,
          confidence: averageFieldConfidence(report.provider_output),
          priority_score: report.priority_score,
          error_types: report.reasons?.length ? report.reasons : ["Needs review"],
          last_updated: upload.finished_at || upload.started_at,
        })
      }
    })
  })

  // Sort by priority score (highest first)
  allFlagged.sort((a, b) => b.priority_score - a.priority_score)

  return {
    data: allFlagged.slice(offset, offset + limit),
    total: allFlagged.length,
  }
}

export function getProviderById(providerId: string): { provider: ProviderReport; uploadId: string; index: number } | null {
  // Provider ID format: uploadId::index
  const separatorIndex = providerId.lastIndexOf("::")
  if (separatorIndex === -1) return null

  const uploadId = providerId.substring(0, separatorIndex)
  const index = Number.parseInt(providerId.substring(separatorIndex + 2))

  if (isNaN(index)) return null

  const upload = getUpload(uploadId)
  if (!upload || !upload.providers[index] || !upload.providers[index].report) return null

  return {
    provider: upload.providers[index].report!,
    uploadId,
    index,
  }
}

export function getAllProvidersForReview(): Array<{ report: ProviderReport; index: number; confidence: number; uploadId: string }> {
  // Get all completed uploads, not just the latest
  const allCompleted = Array.from(uploads.values())
    .filter((u) => u.status === "completed")
    .sort((a, b) => new Date(b.finished_at || b.started_at).getTime() - new Date(a.finished_at || a.started_at).getTime())

  if (allCompleted.length === 0) return []

  const allProviders: Array<{ report: ProviderReport; index: number; confidence: number; uploadId: string }> = []

  allCompleted.forEach((upload) => {
    upload.providers.forEach((p, idx) => {
      if (!p.report) return
      
      const report = p.report
      // Include flagged providers (needs_review status)
      if (report.status === "needs_review") {
        allProviders.push({
          report,
          index: idx,
          confidence: p.confidence ?? 0,
          uploadId: upload.upload_id,
        })
      }
    })
  })

  // Sort by confidence (lower first) then priority score (higher first)
  allProviders.sort((a, b) => {
    if (a.confidence !== b.confidence) return a.confidence - b.confidence
    return b.report.priority_score - a.report.priority_score
  })

  return allProviders
}

// Get all flagged providers across all uploads (for comprehensive results)
export function getAllFlaggedProviders(): FlaggedProvider[] {
  const allCompleted = Array.from(uploads.values())
    .filter((u) => u.status === "completed")

  if (allCompleted.length === 0) return []

  const allFlagged: FlaggedProvider[] = []

  allCompleted.forEach((upload) => {
    upload.providers.forEach((p, idx) => {
      if (!p.report) return
      
      const report = p.report
      // Include flagged providers (needs_review status)
      if (report.status === "needs_review") {
        const raw = p.raw || {}
        const originalMobile = report.provider_input.mobile_no || 
                              raw.mobile_no || 
                              raw.phone || 
                              raw.phone_number || 
                              raw.mobile ||
                              raw["phone no."] ||
                              raw.phone_no ||
                              ""
        const validatedMobile = report.provider_output.mobile_no?.value || originalMobile || ""
        
        allFlagged.push({
          id: `${upload.upload_id}::${idx}`,
          name: report.provider_input.name,
          npi: report.provider_input.npi,
          specialty: report.provider_input.speciality,
          mobile_no: validatedMobile || originalMobile,
          mobile_no_original: originalMobile,
          mobile_no_validated: validatedMobile,
          confidence: averageFieldConfidence(report.provider_output),
          priority_score: report.priority_score,
          error_types: report.reasons?.length ? report.reasons : ["Needs review"],
          last_updated: upload.finished_at || upload.started_at,
        })
      }
    })
  })

  return allFlagged.sort((a, b) => b.priority_score - a.priority_score)
}

export default {
  listUploads,
  getUpload,
  createUploadFromRows,
  createUploadForZip,
  updateUploadProgress,
  updateUploadWithReports,
  addReportsToUpload,
  updateUploadWithProvidersAndReports,
  getLatestCompletedUpload,
  getFlaggedProvidersFromLatest,
  getProviderById,
  getAllProvidersForReview,
  getAllFlaggedProviders,
}