import { createServerClient } from "@supabase/ssr"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

const SUPABASE_URL = "https://whiqlynymbdufnabdvzy.supabase.co"

export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  const formData = await request.formData()
  const email = String(formData.get("email"))
  const password = String(formData.get("password"))

  console.log("[v0] API route /api/auth/login called for email:", email)

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
              console.log("[v0] Setting cookie:", name)
            })
          } catch (error) {
            console.log("[v0] Error setting cookies:", error)
          }
        },
      },
    },
  )

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  console.log("[v0] signInWithPassword result - user:", authData?.user?.id, "session:", !!authData?.session)
  console.log("[v0] signInWithPassword error:", authError?.message)

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  if (!authData.user) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
  }

  console.log("[v0] Fetching profile for user:", authData.user.id)
  const adminClient = createAdminClient()
  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single()

  console.log("[v0] Profile query result - role:", profile?.role, "error:", profileError?.message)

  let redirectPath = "/dashboard"
  if (profile?.role === "admin" || profile?.role === "superadmin") {
    redirectPath = "/admin"
  } else if (profile?.role === "manager") {
    redirectPath = "/dashboard"
  }

  console.log("[v0] Login successful, returning redirect path:", redirectPath)

  // Return JSON response with redirect path
  return NextResponse.json({ success: true, redirectPath }, { status: 200 })
}
