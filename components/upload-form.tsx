"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, FileArchive, CheckCircle2, Download, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useRouter } from "next/navigation"

interface CSVPreview {
  headers: string[]
  rows: string[][]
}

export function UploadForm() {
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [csvPreview, setCsvPreview] = useState<CSVPreview | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCsvFile(file)
      // Read and preview first 10 rows
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        const lines = text.split("\n").filter((line) => line.trim())
        const headers = lines[0].split(",").map((h) => h.trim())
        const rows = lines.slice(1, 11).map((line) => line.split(",").map((cell) => cell.trim()))
        setCsvPreview({ headers, rows })
      }
      reader.readAsText(file)
    }
  }

  const handlePDFUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPdfFile(file)
    }
  }

  const handleDownloadCSV = () => {
    if (csvFile) {
      const url = URL.createObjectURL(csvFile)
      const a = document.createElement("a")
      a.href = url
      a.download = csvFile.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast({
        title: "Download started",
        description: "CSV file is being downloaded.",
      })
    }
  }

  const handleDownloadPDF = () => {
    if (pdfFile) {
      const url = URL.createObjectURL(pdfFile)
      const a = document.createElement("a")
      a.href = url
      a.download = pdfFile.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast({
        title: "Download started",
        description: "PDF file is being downloaded.",
      })
    }
  }

  const handleViewDocument = () => {
    if (csvFile) {
      const url = URL.createObjectURL(csvFile)
      window.open(url, "_blank")
      toast({
        title: "Opening document",
        description: "Document opened in new tab.",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!csvFile) {
      toast({
        title: "Error",
        description: "Please upload a CSV file",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    // Simulate upload
    setTimeout(() => {
      setIsUploading(false)
      toast({
        title: "Upload started",
        description: "Validation running... You'll be redirected to the providers page.",
      })
      setTimeout(() => {
        router.push("/providers")
      }, 1500)
    }, 2000)
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">CSV File Upload</CardTitle>
            <CardDescription>Upload a CSV file containing provider information (required)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/20 p-12 transition-colors hover:border-primary/50">
              <label htmlFor="csv-upload" className="flex cursor-pointer flex-col items-center gap-2">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {csvFile ? csvFile.name : "Click to upload CSV"}
                </span>
                <span className="text-xs text-muted-foreground">CSV files only</span>
                <input id="csv-upload" type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
              </label>
            </div>
            {csvFile && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadCSV}
                  className="gap-2 bg-transparent"
                >
                  <Download className="h-4 w-4" />
                  Download CSV
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleViewDocument}
                  className="gap-2 bg-transparent"
                >
                  <Eye className="h-4 w-4" />
                  View Document
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {csvPreview && (
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">CSV Preview</CardTitle>
              <CardDescription>First 10 rows of your uploaded file</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {csvPreview.headers.map((header, i) => (
                        <th key={i} className="px-4 py-2 text-left font-medium text-foreground">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.rows.map((row, i) => (
                      <tr key={i} className="border-b border-border/50">
                        {row.map((cell, j) => (
                          <td key={j} className="px-4 py-2 text-muted-foreground">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">PDF Documents (Optional)</CardTitle>
            <CardDescription>Upload a ZIP file containing scanned provider documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/20 p-12 transition-colors hover:border-primary/50">
              <label htmlFor="pdf-upload" className="flex cursor-pointer flex-col items-center gap-2">
                <FileArchive className="h-12 w-12 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {pdfFile ? pdfFile.name : "Click to upload ZIP"}
                </span>
                <span className="text-xs text-muted-foreground">ZIP files containing PDFs</span>
                <input id="pdf-upload" type="file" accept=".zip" onChange={handlePDFUpload} className="hidden" />
              </label>
            </div>
            {pdfFile && (
              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPDF}
                  className="gap-2 bg-transparent"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {csvFile && (
              <>
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>CSV file ready</span>
              </>
            )}
          </div>
          <Button type="submit" disabled={!csvFile || isUploading} size="lg" className="gap-2">
            <Upload className="h-4 w-4" />
            {isUploading ? "Uploading..." : "Start Validation"}
          </Button>
        </div>
      </form>
      <Toaster />
    </>
  )
}
