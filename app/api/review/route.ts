import { NextResponse } from "next/server"
import uploadStore from "@/lib/upload-store"

// GET /api/review - Get all providers for review queue from all uploads
export async function GET(request: Request) {
  try {
    const providers = uploadStore.getAllProvidersForReview()
    
    if (providers.length === 0) {
      return NextResponse.json({ providers: [] })
    }
    
    // Map to a format suitable for the review queue
    const reviewProviders = providers.map((item) => {
      const { report: r, index, confidence, uploadId } = item
      const providerId = `${uploadId}::${index}`
      
      return {
        id: providerId,
        name: r.provider_input.name,
        npi: r.provider_input.npi,
        specialty: r.provider_input.speciality,
        phone: {
          original: r.provider_input.mobile_no || "",
          validated: r.provider_output.mobile_no?.value || r.provider_input.mobile_no || "",
        },
        address: {
          original: r.provider_input.address || "",
          validated: r.provider_output.address?.value || r.provider_input.address || "",
        },
        confidence: confidence,
        status: "flagged" as const,
        lastUpdated: new Date().toISOString(),
        sources: ["NPI Registry", "Provider Directory"],
        priority_score: r.priority_score,
        error_types: r.reasons?.length ? r.reasons : ["Needs review"],
      }
    })

    return NextResponse.json({ providers: reviewProviders })
  } catch (error) {
    console.error("Error in /api/review:", error)
    return NextResponse.json({ providers: [] }, { status: 500 })
  }
}

