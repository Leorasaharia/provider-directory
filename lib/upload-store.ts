import { UploadJob } from "./api-types"

type ProviderRow = {
  id: string
  raw: Record<string, string>
  confidence?: number | null
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
  }))
}

export function getUpload(uploadId: string): StoredUpload | undefined {
  return uploads.get(uploadId)
}

export function createUploadFromRows(filename: string, rows: Record<string, string>[]) {
  const id = makeId()
  const now = new Date().toISOString()
  const providers = rows.map((r, i) => ({ id: String(i), raw: r, confidence: null }))
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

export function updateUploadResults(uploadId: string, confidences: { id: string; confidence: number }[]) {
  const job = uploads.get(uploadId)
  if (!job) return

  confidences.forEach((c) => {
    const p = job.providers.find((x) => x.id === String(c.id))
    if (p) p.confidence = c.confidence
  })

  job.processed_count = job.providers.filter((p) => typeof p.confidence === "number").length
  job.validated_count = job.providers.filter((p) => (p.confidence ?? 0) >= 0.6).length
  job.flagged_count = job.providers.filter((p) => (p.confidence ?? 0) < 0.6).length
  const confs = job.providers.map((p) => p.confidence ?? 0)
  job.avg_confidence = confs.length ? confs.reduce((a, b) => a + b, 0) / confs.length : null
  job.eta_seconds = 0
  job.status = "completed"
  job.finished_at = new Date().toISOString()

  uploads.set(uploadId, job)
}

export function createEmptyUpload(filename: string) {
  return createUploadFromRows(filename, [])
}

export default {
  listUploads,
  getUpload,
  createUploadFromRows,
  updateUploadResults,
}
