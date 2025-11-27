import type React from "react"
import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/server"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile) {
    console.log("[v0] No profile found in layout, creating one for user:", user.id)
    
    const { data: newProfile, error: createError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        role: "employee",
        points: 0,
      }, {
        onConflict: 'id',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (createError) {
      console.error("[v0] Error creating profile in layout:", createError.message)
      // Use default values if profile creation fails
      profile = {
        id: user.id,
        email: user.email,
        full_name: user.email?.split("@")[0] || "User",
        role: "employee",
        points: 0,
      }
    } else {
      profile = newProfile
    }
  }

  return (
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader userName={profile?.full_name || "User"} userEmail={user.email!} points={profile?.points || 0} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
