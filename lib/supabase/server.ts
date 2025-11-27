import { createServerClient as createServerClientSSR } from "@supabase/ssr"
import { createClient as createClientJS } from "@supabase/supabase-js"
import { cookies } from "next/headers"

const SUPABASE_URL = "https://whiqlynymbdufnabdvzy.supabase.co"

// cookie-aware SSR client (use in Server Components / route handlers when using browser auth flow)
export async function createServerClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
  }

  return createServerClientSSR(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // ignore when called in Server Component context that can't set cookies
        }
      },
    },
  })
}

// service-role client for privileged server-only operations (use in API routes that require admin/service privileges)
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable")
  }

  return createClientJS(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
}

// new alias for compatibility: export createClient used across the codebase
export const createClient = createServerClient
