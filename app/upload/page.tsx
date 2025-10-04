import { Navigation } from "@/components/navigation"
import { GlobalProgressBar } from "@/components/global-progress-bar"
import { UploadForm } from "@/components/upload-form"
import { Toaster } from "@/components/ui/toaster"

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <GlobalProgressBar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Upload Provider Data</h1>
          <p className="mt-2 text-muted-foreground">
            Upload a CSV file containing provider information and optional PDF documents for validation.
          </p>
        </div>
        <UploadForm />
      </main>
      <Toaster />
    </div>
  )
}
