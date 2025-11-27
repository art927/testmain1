import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: sessionError,
    } = await supabase.auth.getUser()

    if (sessionError || !user?.id) {
      console.error("[v0] Create employee - Session error:", sessionError)
      return NextResponse.json({ error: "Please sign in to continue" }, { status: 401 })
    }

    console.log("[v0] Create employee - Admin user:", user.id)

    const adminClient = createServiceClient()
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("[v0] Create employee - Profile lookup error:", profileError)
      return NextResponse.json({ error: "Error verifying permissions" }, { status: 500 })
    }

    if (!profile || !["admin", "superadmin"].includes(profile.role)) {
      console.log("[v0] Create employee - Access denied for role:", profile?.role)
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get request data
    const { email, password, full_name } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    console.log("[v0] Create employee - Creating user:", email)

    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role: "employee" },
    })

    if (createError) {
      console.error("[v0] Create employee - Create user error:", createError)
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    console.log("[v0] Create employee - User created:", newUser.user!.id)

    const { error: insertError } = await adminClient.from("profiles").insert({
      id: newUser.user!.id,
      email,
      full_name: full_name || email,
      role: "employee",
      points: 0,
    })

    if (insertError) {
      console.error("[v0] Create employee - Create profile error:", insertError)
      // Cleanup: remove auth user if profile creation failed
      await adminClient.auth.admin.deleteUser(newUser.user!.id)
      return NextResponse.json({ error: "Failed to create user profile" }, { status: 500 })
    }

    console.log("[v0] Create employee - Profile created successfully")

    return NextResponse.json({
      success: true,
      userId: newUser.user!.id,
    })
  } catch (err: any) {
    console.error("[v0] Create employee - Unexpected error:", err)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
