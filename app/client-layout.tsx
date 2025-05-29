"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/hooks/use-auth"
import { LoadingFallback } from "@/components/loading-fallback"
import { useEffect, useState } from "react"

const inter = Inter({ subsets: ["latin"] })

function ErrorFallback({ error, retry }: { error: string; retry: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-destructive/10 p-6 rounded-lg max-w-md text-center">
        <h2 className="text-xl font-bold mb-2">Configuration Error</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <div className="space-y-2">
          <button
            onClick={retry}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry Connection
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
          >
            Continue Without Auth
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ClientRootLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const checkEnvironment = () => {
    try {
      // Check if we're in the browser
      if (typeof window === "undefined") {
        return
      }

      // Check for required environment variables
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        setError("Missing Supabase configuration. Please check your environment variables.")
        setIsLoading(false)
        return
      }

      // Validate URL format
      try {
        new URL(supabaseUrl)
      } catch {
        setError("Invalid Supabase URL format in configuration.")
        setIsLoading(false)
        return
      }

      // Test basic connectivity (optional, don't fail if this doesn't work)
      fetch(`${supabaseUrl}/rest/v1/`, {
        method: "HEAD",
        headers: {
          apikey: supabaseAnonKey,
        },
      })
        .then((response) => {
          console.log("Supabase connectivity test:", response.ok ? "success" : "failed")
          setIsLoading(false)
          setError(null)
        })
        .catch((err) => {
          console.log("Supabase connectivity test failed (continuing anyway):", err)
          // Don't set error, just continue - connectivity test is optional
          setIsLoading(false)
          setError(null)
        })
    } catch (err) {
      console.error("Environment check failed:", err)
      setError(err instanceof Error ? err.message : "Configuration error")
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Set a maximum timeout to prevent infinite loading
    const maxTimeout = setTimeout(() => {
      if (isLoading) {
        console.log("Layout loading timeout reached")
        setIsLoading(false)
      }
    }, 3000) // Reduced timeout

    checkEnvironment()

    return () => clearTimeout(maxTimeout)
  }, [retryCount, isLoading])

  const handleRetry = () => {
    setIsLoading(true)
    setError(null)
    setRetryCount((prev) => prev + 1)
  }

  if (error) {
    return (
      <html lang="en">
        <body className={inter.className}>
          <ErrorFallback error={error} retry={handleRetry} />
        </body>
      </html>
    )
  }

  if (isLoading) {
    return (
      <html lang="en">
        <body className={inter.className}>
          <LoadingFallback />
        </body>
      </html>
    )
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
