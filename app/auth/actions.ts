"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  console.log("[v0] Server action signIn called for email:", email)

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  console.log("[v0] signInWithPassword result - user:", authData?.user?.id, "session:", !!authData?.session)
  console.log("[v0] signInWithPassword error:", authError?.message)

  if (authError) {
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: "Authentication failed" }
  }

  console.log("[v0] Fetching profile for user:", authData.user.id)
  const adminClient = createAdminClient()
  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single()

  console.log("[v0] Profile query result - role:", profile?.role, "error:", profileError?.message)

  // Revalidate to clear any cached data
  revalidatePath("/", "layout")

  let redirectPath = "/dashboard"
  if (profile?.role === "admin" || profile?.role === "superadmin") {
    redirectPath = "/admin"
  } else if (profile?.role === "manager") {
    redirectPath = "/dashboard"
  }

  console.log("[v0] Login successful, returning redirect path:", redirectPath)
  return { success: true, redirectPath }
}

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("fullName") as string
  const role = formData.get("role") as "employee" | "manager"

  console.log("[v0] Server action signUp called for email:", email)

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      },
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  console.log("[v0] signUp result - user:", authData?.user?.id, "session:", !!authData?.session)
  console.log("[v0] signUp error:", authError?.message)

  if (authError) {
    return { error: authError.message }
  }

  if (authData.user) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      email: email,
      full_name: fullName,
      role: role,
      points: 10,
    })

    console.log("[v0] Error creating profile:", profileError?.message)

    if (profileError) {
      return { error: "Failed to create profile" }
    }

    if (role === "manager") {
      console.log("[v0] Redirecting to onboarding/create-team")
      redirect("/onboarding/create-team")
    } else {
      console.log("[v0] Redirecting to /dashboard")
      redirect("/dashboard")
    }
  }

  return { error: "Failed to create account" }
}
