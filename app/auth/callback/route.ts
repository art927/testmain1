import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") || "/dashboard"

  console.log("[v0] Auth callback - code:", !!code, "next:", next)

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Wait a moment for the trigger to create the profile
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const { data: profile } = await supabase.from("profiles").select("role, team_id").eq("id", user.id).single()

        console.log("[v0] Auth callback - User role:", profile?.role, "Team ID:", profile?.team_id)

        let redirectPath = "/dashboard"

        if (profile?.role === "manager" || profile?.role === "admin") {
          // Redirect managers to team creation if they don't have a team
          if (!profile.team_id) {
            redirectPath = "/onboarding/create-team"
          } else {
            redirectPath = "/manager"
          }
        }

        const forwardedHost = request.headers.get("x-forwarded-host")
        const isLocalEnv = process.env.NODE_ENV === "development"

        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${redirectPath}`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`)
        } else {
          return NextResponse.redirect(`${origin}${redirectPath}`)
        }
      }
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  console.log("[v0] Auth callback - direct refresh - user:", user?.id, "error:", userError?.message)

  if (user) {
    const forwardedHost = request.headers.get("x-forwarded-host")
    const isLocalEnv = process.env.NODE_ENV === "development"

    if (isLocalEnv) {
      return NextResponse.redirect(`${origin}${next}`)
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${next}`)
    } else {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  console.log("[v0] Auth callback - no user found, redirecting to error")
  return NextResponse.redirect(`${origin}/auth/error`)
}
