"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { headers } from "next/headers"

export async function trackEvent(
  eventType: "portfolio_view" | "project_view" | "contact_click",
  userId?: string,
  projectId?: string,
) {
  const supabase = await createServerSupabaseClient()
  const headersList = await headers()

  const userAgent = headersList.get("user-agent") || ""
  const referrer = headersList.get("referer") || ""
  const forwardedFor = headersList.get("x-forwarded-for")
  const realIp = headersList.get("x-real-ip")
  const visitorIp = forwardedFor?.split(",")[0] || realIp || "unknown"

  const { error } = await supabase.from("analytics").insert({
    user_id: userId,
    project_id: projectId,
    event_type: eventType,
    visitor_ip: visitorIp,
    user_agent: userAgent,
    referrer: referrer,
  })

  if (error) {
    console.error("Analytics tracking error:", error)
  }
}

export async function getAnalytics(userId: string, timeRange: "7d" | "30d" | "90d" = "30d") {
  const supabase = await createServerSupabaseClient()

  const daysAgo = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - daysAgo)

  // Get total views
  const { data: totalViews } = await supabase
    .from("analytics")
    .select("*")
    .eq("user_id", userId)
    .gte("created_at", startDate.toISOString())

  // Get portfolio views
  const { data: portfolioViews } = await supabase
    .from("analytics")
    .select("*")
    .eq("user_id", userId)
    .eq("event_type", "portfolio_view")
    .gte("created_at", startDate.toISOString())

  // Get project views
  const { data: projectViews } = await supabase
    .from("analytics")
    .select("*")
    .eq("user_id", userId)
    .eq("event_type", "project_view")
    .gte("created_at", startDate.toISOString())

  // Get contact clicks
  const { data: contactClicks } = await supabase
    .from("analytics")
    .select("*")
    .eq("user_id", userId)
    .eq("event_type", "contact_click")
    .gte("created_at", startDate.toISOString())

  // Get daily breakdown
  const { data: dailyViews } = await supabase
    .from("analytics")
    .select("created_at")
    .eq("user_id", userId)
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: true })

  return {
    totalViews: totalViews?.length || 0,
    portfolioViews: portfolioViews?.length || 0,
    projectViews: projectViews?.length || 0,
    contactClicks: contactClicks?.length || 0,
    dailyViews: dailyViews || [],
  }
}
