import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2, TrendingUp, DollarSign, Users, Clock } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            About Provider Directory Validation
          </h1>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Solving healthcare's most persistent data quality challenge
          </p>
        </div>

        {/* Problem Section */}
        <section className="mb-16 rounded-lg border border-border bg-card p-8">
          <h2 className="mb-4 text-2xl font-bold text-foreground">The Problem</h2>
          <p className="mb-4 text-lg leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">80%+ of provider directories contain errors.</span>
          </p>
          <p className="leading-relaxed text-muted-foreground">
            Inaccurate provider information leads to frustrated patients, wasted time for healthcare staff, regulatory
            penalties, and increased costs. Manual validation is slow, expensive, and error-prone. Healthcare payers
            need a better solution to maintain accurate provider directories at scale.
          </p>
        </section>

        {/* Solution Section */}
        <section className="mb-16 rounded-lg border border-border bg-card p-8">
          <h2 className="mb-4 text-2xl font-bold text-foreground">Our Solution</h2>
          <p className="mb-6 leading-relaxed text-muted-foreground">
            Our AI agents validate provider data (phone numbers, addresses, specialties, licenses) automatically using
            public sources. The system cross-references information from the National Provider Identifier (NPI)
            registry, Google Business listings, hospital directories, and state licensing boards to ensure accuracy.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">Automated Validation</h3>
                <p className="text-sm text-muted-foreground">
                  AI agents verify data across multiple authoritative sources
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">Confidence Scoring</h3>
                <p className="text-sm text-muted-foreground">Each field receives a confidence score for easy review</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">Smart Prioritization</h3>
                <p className="text-sm text-muted-foreground">Flags high-impact errors for manual review first</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">Seamless Integration</h3>
                <p className="text-sm text-muted-foreground">Upload CSV files and get validated results in minutes</p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-16">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground">Key Benefits</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-6 text-center">
              <Clock className="mx-auto mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 font-semibold text-foreground">Faster Validation</h3>
              <p className="text-sm text-muted-foreground">
                Reduce validation time from days to minutes with automated processing
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6 text-center">
              <TrendingUp className="mx-auto mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 font-semibold text-foreground">Higher Accuracy</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered validation ensures 95%+ accuracy across all data fields
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6 text-center">
              <DollarSign className="mx-auto mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 font-semibold text-foreground">Reduced Costs</h3>
              <p className="text-sm text-muted-foreground">
                Cut manual review costs by up to 80% with intelligent automation
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6 text-center">
              <Users className="mx-auto mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 font-semibold text-foreground">Better Patient Experience</h3>
              <p className="text-sm text-muted-foreground">
                Accurate directories help patients find the right care faster
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="rounded-lg border border-border bg-card p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground">Ready to Get Started?</h2>
          <p className="mb-6 text-muted-foreground">
            Upload your provider directory and see the difference AI validation can make.
          </p>
          <Button asChild size="lg">
            <Link href="/upload">Upload Your Data</Link>
          </Button>
        </section>
      </div>
    </div>
  )
}
