export interface Provider {
  id: string
  name: string
  npi: string
  specialty: string
  phone: {
    original: string
    validated: string
  }
  address: {
    original: string
    validated: string
  }
  email: string
  confidence: number
  status: "unprocessed" | "processing" | "validated" | "flagged"
  lastUpdated: string
  sources: string[]
}

// Generate mock provider data with intentional errors
export function generateMockProviders(count = 200): Provider[] {
  const specialties = [
    "Cardiology",
    "Dermatology",
    "Family Medicine",
    "Internal Medicine",
    "Pediatrics",
    "Orthopedics",
    "Neurology",
    "Psychiatry",
  ]

  const firstNames = [
    "James",
    "Mary",
    "John",
    "Patricia",
    "Robert",
    "Jennifer",
    "Michael",
    "Linda",
    "William",
    "Elizabeth",
  ]
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
  ]

  const streets = ["Main St", "Oak Ave", "Maple Dr", "Cedar Ln", "Park Blvd", "Washington St", "Lake Rd", "Hill Ave"]
  const cities = ["Springfield", "Riverside", "Franklin", "Clinton", "Madison", "Georgetown"]
  const states = ["CA", "NY", "TX", "FL", "IL", "PA", "OH", "GA", "NC", "MI"]

  const providers: Provider[] = []

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const name = `Dr. ${firstName} ${lastName}`

    const streetNum = Math.floor(Math.random() * 9999) + 1
    const street = streets[Math.floor(Math.random() * streets.length)]
    const city = cities[Math.floor(Math.random() * cities.length)]
    const state = states[Math.floor(Math.random() * states.length)]
    const zip = Math.floor(Math.random() * 90000) + 10000

    const originalPhone = `(${Math.floor(Math.random() * 900) + 100}) ${
      Math.floor(Math.random() * 900) + 100
    }-${Math.floor(Math.random() * 9000) + 1000}`

    const originalAddress = `${streetNum} ${street}, ${city}, ${state} ${zip}`

    // Inject errors in ~30% of records
    const hasError = Math.random() < 0.3
    let validatedPhone = originalPhone
    let validatedAddress = originalAddress
    let confidence = 0.95
    let status: Provider["status"] = "validated"

    if (hasError) {
      // Wrong phone number
      if (Math.random() < 0.5) {
        validatedPhone = `(${Math.floor(Math.random() * 900) + 100}) ${
          Math.floor(Math.random() * 900) + 100
        }-${Math.floor(Math.random() * 9000) + 1000}`
      }
      // Moved address
      if (Math.random() < 0.5) {
        const newStreetNum = Math.floor(Math.random() * 9999) + 1
        const newStreet = streets[Math.floor(Math.random() * streets.length)]
        validatedAddress = `${newStreetNum} ${newStreet}, ${city}, ${state} ${zip}`
      }
      confidence = Math.random() * 0.4 + 0.3 // 0.3 to 0.7
      status = confidence < 0.5 ? "flagged" : "validated"
    }

    const npi = `${Math.floor(Math.random() * 9000000000) + 1000000000}`

    providers.push({
      id: `provider-${i + 1}`,
      name,
      npi,
      specialty: specialties[Math.floor(Math.random() * specialties.length)],
      phone: {
        original: originalPhone,
        validated: validatedPhone,
      },
      address: {
        original: originalAddress,
        validated: validatedAddress,
      },
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@healthcare.com`,
      confidence,
      status,
      lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      sources: ["NPI Registry", "Google Maps", "Hospital Directory"],
    })
  }

  return providers
}

export const mockProviders = generateMockProviders(200)
