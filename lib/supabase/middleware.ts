import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const SUPABASE_URL = "https://whiqlynymbdufnabdvzy.supabase.co"

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Public routes (no session required)
  const isPublic =
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/accept-invite") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/_") ||
    pathname.startsWith("/_vercel") ||
    pathname === "/" ||
    pathname.includes(".")

  if (isPublic) {
    return NextResponse.next()
  }

  // Setup supabase client
  let supabaseResponse = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  // No user → redirect to login
  if (userError || !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // Read profile role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, team_id")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  const role = profile.role

  // Role-based routing
  if (pathname === "/") {
    const url = request.nextUrl.clone()

    if (role === "admin" || role === "superadmin") {
      url.pathname = "/admin"
    } else if (role === "manager") {
      url.pathname = "/manager"
    } else {
      url.pathname = "/dashboard"
    }

    return NextResponse.redirect(url)
  }

  // Protect admin area
  if (pathname.startsWith("/admin")) {
    if (role !== "admin" && role !== "superadmin") {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }
  }

  // Protect manager area
  if (pathname.startsWith("/manager")) {
    if (role !== "manager" && role !== "admin" && role !== "superadmin") {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }
  }

  // Employees can only access /dashboard and their own pages
  return supabaseResponse
}
