"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { SignUpData, SignInData } from "./types"

export async function signUp(data: SignUpData) {
  const supabase = await createServerSupabaseClient()

  try {
    // Check if username is available
    const { data: existingUser } = await supabase
      .from("users")
      .select("username")
      .eq("username", data.username)
      .single()

    if (existingUser) {
      return { error: "Username is already taken" }
    }

    // 1. Sign up the user with auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          username: data.username,
        },
      },
    })

    if (authError) {
      console.error("Auth error:", authError)
      return { error: authError.message }
    }

    if (!authData.user) {
      return { error: "Failed to create user account" }
    }

    // 2. Create user profile using stored procedure
    const { error: profileError } = await supabase.rpc("create_user_profile", {
      user_id: authData.user.id,
      user_email: data.email,
      user_username: data.username,
      user_full_name: data.full_name,
    })

    if (profileError) {
      console.error("Profile creation error:", profileError)
      return { error: `Failed to create user profile: ${profileError.message}` }
    }

    // 3. Sign in the user immediately after successful signup
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (signInError) {
      console.error("Auto sign-in error:", signInError)
      return {
        success: true,
        message: "Account created successfully! Please sign in with your credentials.",
        shouldRedirect: false,
      }
    }

    return {
      success: true,
      message: "Account created successfully!",
      shouldRedirect: true,
    }
  } catch (error) {
    console.error("Unexpected error during signup:", error)
    return { error: "An unexpected error occurred during signup" }
  }
}

export async function signIn(data: SignInData) {
  const supabase = await createServerSupabaseClient()

  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      return { error: error.message }
    }

    if (!authData.user) {
      return { error: "Failed to sign in" }
    }

    // Verify user profile exists
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single()

    if (profileError || !profile) {
      console.error("Profile not found for user:", authData.user.id)
      return { error: "User profile not found. Please contact support." }
    }

    return { success: true }
  } catch (error) {
    console.error("Unexpected error during signin:", error)
    return { error: "An unexpected error occurred during signin" }
  }
}

export async function signOut() {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Sign out error:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function signInWithProvider(provider: "github" | "google") {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function checkUsernameAvailability(username: string) {
  if (!username || username.length < 3) {
    return { available: false, message: "Username must be at least 3 characters" }
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { available: false, message: "Username can only contain letters, numbers, hyphens, and underscores" }
  }

  const supabase = await createServerSupabaseClient()

  const { data } = await supabase.from("users").select("username").eq("username", username).single()

  return {
    available: !data,
    message: data ? "Username is already taken" : "Username is available",
  }
}
