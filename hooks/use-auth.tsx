"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User as AppUser } from "@/lib/auth/types"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: AppUser | null
  loading: boolean
  error: string | null
  signOut: () => Promise<void>
  retry: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signOut: async () => {},
  retry: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const router = useRouter()

  const retry = () => {
    setRetryCount((prev) => prev + 1)
    setError(null)
    setLoading(true)
  }

  useEffect(() => {
    let mounted = true
    let authSubscription: any = null

    const initializeAuth = async () => {
      try {
        // Only run on client side
        if (typeof window === "undefined") {
          return
        }

        const supabase = createClient()

        // Set a timeout for the auth check
        const authTimeout = setTimeout(() => {
          if (mounted && loading) {
            console.log("Auth timeout reached")
            setLoading(false) // Don't set error for timeout on homepage
          }
        }, 5000) // Reduced timeout for better UX

        try {
          // Try to get the current session first
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession()

          if (!mounted) return
          clearTimeout(authTimeout)

          // If there's a session error but it's just "Auth session missing", that's normal for logged out users
          if (sessionError) {
            if (
              sessionError.message.includes("Auth session missing") ||
              sessionError.message.includes("session_not_found")
            ) {
              // This is normal for users who aren't logged in
              console.log("No active session found (normal for logged out users)")
              setUser(null)
              setLoading(false)
              return
            } else {
              // This is an actual error
              console.error("Session error:", sessionError)
              setError("Authentication service unavailable. Please try again.")
              setLoading(false)
              return
            }
          }

          // If we have a session, get the user profile
          if (session?.user) {
            try {
              const { data: profile, error: profileError } = await supabase
                .from("users")
                .select("*")
                .eq("id", session.user.id)
                .single()

              if (profileError) {
                if (profileError.message.includes("Supabase not configured")) {
                  setError("Database connection failed. Please check your configuration.")
                } else {
                  console.error("Profile error:", profileError)
                  // Don't set error for missing profile, just log it
                  console.log("User profile not found, user may need to complete signup")
                }
              } else if (profile) {
                setUser(profile)
              }
            } catch (err) {
              console.error("Profile fetch error:", err)
              // Don't set error, just log it
            }
          } else {
            setUser(null)
          }

          // Set up auth state listener
          const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return

            console.log("Auth state changed:", event)

            try {
              if (event === "SIGNED_OUT") {
                setUser(null)
                // Only redirect if we're on a protected route
                if (window.location.pathname.startsWith("/dashboard")) {
                  router.push("/")
                }
              } else if (event === "SIGNED_IN" && session?.user) {
                try {
                  const { data: profile, error: profileError } = await supabase
                    .from("users")
                    .select("*")
                    .eq("id", session.user.id)
                    .single()

                  if (!profileError && profile) {
                    setUser(profile)
                  }
                } catch (err) {
                  console.error("Auth state profile error:", err)
                }
              } else if (event === "TOKEN_REFRESHED" && session?.user) {
                // Token refreshed, user is still logged in
                if (!user) {
                  try {
                    const { data: profile, error: profileError } = await supabase
                      .from("users")
                      .select("*")
                      .eq("id", session.user.id)
                      .single()

                    if (!profileError && profile) {
                      setUser(profile)
                    }
                  } catch (err) {
                    console.error("Token refresh profile error:", err)
                  }
                }
              }
            } catch (err) {
              console.error("Auth state change error:", err)
            }
          })

          authSubscription = data.subscription
        } catch (err) {
          if (!mounted) return
          clearTimeout(authTimeout)

          console.error("Auth initialization error:", err)

          // Check if it's a configuration error
          if (err instanceof Error && err.message.includes("Supabase not configured")) {
            setError("Database connection failed. Please check your configuration.")
          } else {
            // For other errors, don't show error on homepage, just log them
            console.log("Auth initialization failed, continuing without authentication")
          }
        }
      } catch (err) {
        console.error("Auth provider error:", err)
        if (mounted) {
          // Only set error if we're on a protected route
          if (window.location.pathname.startsWith("/dashboard")) {
            setError("Failed to initialize authentication.")
          }
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    return () => {
      mounted = false
      if (authSubscription) {
        authSubscription.unsubscribe()
      }
    }
  }, [router, retryCount, user])

  const signOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      setUser(null)
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
      // Force redirect even if signout fails
      setUser(null)
      router.push("/")
    }
  }

  return <AuthContext.Provider value={{ user, loading, error, signOut, retry }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
