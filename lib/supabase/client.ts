import { createBrowserClient } from "@supabase/ssr"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Return existing client if already created
  if (supabaseClient) {
    return supabaseClient
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables:", {
        url: !!supabaseUrl,
        key: !!supabaseAnonKey,
      })
      throw new Error("Supabase configuration is missing")
    }

    // Validate URL format
    try {
      new URL(supabaseUrl)
    } catch {
      throw new Error("Invalid Supabase URL format")
    }

    supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    })

    console.log("Supabase client initialized successfully")
    return supabaseClient
  } catch (error) {
    console.error("Error initializing Supabase client:", error)

    // Return a mock client that won't crash the app but will indicate errors
    const mockClient = {
      auth: {
        getSession: async () => ({
          data: { session: null },
          error: { message: "Supabase not configured", code: "supabase_not_configured" },
        }),
        getUser: async () => ({
          data: { user: null },
          error: { message: "Supabase not configured", code: "supabase_not_configured" },
        }),
        onAuthStateChange: () => ({
          data: {
            subscription: {
              unsubscribe: () => {},
            },
          },
        }),
        signOut: async () => ({ error: { message: "Supabase not configured" } }),
        signInWithPassword: async () => ({ data: null, error: { message: "Supabase not configured" } }),
        signUp: async () => ({ data: null, error: { message: "Supabase not configured" } }),
        signInWithOAuth: async () => ({ data: null, error: { message: "Supabase not configured" } }),
        resetPasswordForEmail: async () => ({ error: { message: "Supabase not configured" } }),
        updateUser: async () => ({ error: { message: "Supabase not configured" } }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: { message: "Supabase not configured" } }),
            order: () => async () => ({ data: null, error: { message: "Supabase not configured" } }),
          }),
          order: () => async () => ({ data: null, error: { message: "Supabase not configured" } }),
          limit: () => async () => ({ data: null, error: { message: "Supabase not configured" } }),
          gte: () => ({
            order: () => async () => ({ data: null, error: { message: "Supabase not configured" } }),
          }),
        }),
        insert: () => ({
          select: () => ({
            single: async () => ({ data: null, error: { message: "Supabase not configured" } }),
          }),
        }),
        update: () => ({
          eq: () => ({
            select: () => ({
              single: async () => ({ data: null, error: { message: "Supabase not configured" } }),
            }),
          }),
        }),
        delete: () => ({
          eq: async () => ({ error: { message: "Supabase not configured" } }),
        }),
      }),
      rpc: async () => ({ error: { message: "Supabase not configured" } }),
      storage: {
        from: () => ({
          upload: async () => ({ error: { message: "Supabase not configured" } }),
          remove: async () => ({ error: { message: "Supabase not configured" } }),
          getPublicUrl: () => ({ data: { publicUrl: "/placeholder.svg" } }),
        }),
      },
    } as any

    return mockClient
  }
}
