"use client"

import type React from "react"

import { Navigation } from "./navigation"
import { GlobalProgressBar } from "./global-progress-bar"
import { Toaster } from "./ui/toaster"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <GlobalProgressBar />
      {children}
      <Toaster />
    </div>
  )
}
