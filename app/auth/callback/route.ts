import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if user profile exists
      const { data: profile } = await supabase.from("users").select("*").eq("id", data.user.id).single()

      if (!profile) {
        // Create profile for OAuth users using the stored procedure
        const username =
          data.user.user_metadata?.user_name ||
          data.user.user_metadata?.preferred_username ||
          data.user.email?.split("@")[0] ||
          `user_${data.user.id.slice(0, 8)}`

        const { error: profileError } = await supabase.rpc("create_user_profile", {
          user_id: data.user.id,
          user_email: data.user.email!,
          user_username: username,
          user_full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || "User",
        })

        if (profileError) {
          console.error("Failed to create OAuth user profile:", profileError)
          return NextResponse.redirect(`${origin}/auth/auth-code-error`)
        }

        // Update avatar if available
        if (data.user.user_metadata?.avatar_url) {
          await supabase.from("users").update({ avatar_url: data.user.user_metadata.avatar_url }).eq("id", data.user.id)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
