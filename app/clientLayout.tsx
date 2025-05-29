"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/hooks/use-auth"
import { ErrorBoundary } from "react-error-boundary"
import { LoadingFallback } from "@/components/loading-fallback"
import { useEffect, useState } from "react"

const inter = Inter({ subsets: ["latin"] })

function ErrorFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-destructive/10 p-6 rounded-lg max-w-md text-center">
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-4">
          We're having trouble loading the application. Please try refreshing the page.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Refresh Page
        </button>
      </div>
    </div>
  )
}

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Set a timeout to ensure we show content even if something is hanging
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000)

    // Check if the environment variables are available
    if (
      typeof window !== "undefined" &&
      (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    ) {
      console.error("Missing Supabase environment variables")
    } else {
      setIsLoading(false)
    }

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <LoadingFallback />
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

export default function ClientRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <RootLayoutContent>{children}</RootLayoutContent>
    </ErrorBoundary>
  )
}
