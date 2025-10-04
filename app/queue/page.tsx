import { Navigation } from "@/components/navigation"
import { GlobalProgressBar } from "@/components/global-progress-bar"
import { ReviewQueue } from "@/components/review-queue"
import { Toaster } from "@/components/ui/toaster"

export default function QueuePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <GlobalProgressBar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Review Queue</h1>
          <p className="mt-2 text-muted-foreground">
            Providers flagged for manual review, sorted by priority (low confidence + high impact)
          </p>
        </div>
        <ReviewQueue />
      </main>
      <Toaster />
    </div>
  )
}
