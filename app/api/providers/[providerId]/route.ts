import { NextResponse } from "next/server"
import uploadStore from "@/lib/upload-store"

// GET /api/providers/{providerId} - Get provider details by ID
export async function GET(request: Request, { params }: { params: { providerId: string } }) {
  try {
    const providerId = decodeURIComponent(params.providerId)
    const providerData = uploadStore.getProviderById(providerId)
    
    if (!providerData) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 })
    }

    const { provider, uploadId, index } = providerData
    const upload = uploadStore.getUpload(uploadId)
    
    if (!upload || !upload.providers[index]) {
      return NextResponse.json({ error: "Upload or provider not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: providerId,
      upload_id: uploadId,
      index,
      provider_input: provider.provider_input,
      provider_output: provider.provider_output,
      status: provider.status || "unknown",
      reasons: provider.reasons || [],
      priority_score: provider.priority_score || 0,
      priority_level: provider.priority_level || "MEDIUM",
      confidence: upload.providers[index]?.confidence ?? 0,
    })
  } catch (error) {
    console.error("Error in /api/providers/[providerId]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

