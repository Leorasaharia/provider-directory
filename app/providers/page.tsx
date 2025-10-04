import { Navigation } from "@/components/navigation"
import { GlobalProgressBar } from "@/components/global-progress-bar"
import { ProvidersTable } from "@/components/providers-table"
import { Toaster } from "@/components/ui/toaster"

export default function ProvidersPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <GlobalProgressBar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Provider Directory</h1>
          <p className="mt-2 text-muted-foreground">View and manage validated provider information</p>
        </div>
        <ProvidersTable />
      </main>
      <Toaster />
    </div>
  )
}
