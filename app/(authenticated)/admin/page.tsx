import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import RulesList from "@/components/admin/rules-list"
import CreateRuleForm from "@/components/admin/create-rule-form"
import CreateUserForm from "@/components/admin/create-user-form"
import CreateTeamForm from "@/components/admin/create-team-form"
import AssignMemberForm from "@/components/admin/assign-member-form"
import CreateRewardForm from "@/components/admin/create-reward-form"

function tryDecodeBase64Json(value: string) {
  try {
    // Some cookies are prefixed with "base64-" (strip if present)
    const maybe = value.startsWith("base64-") ? value.slice("base64-".length) : value
    const json = Buffer.from(maybe, "base64").toString("utf8")
    return JSON.parse(json)
  } catch {
    return null
  }
}

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser()

  if (authErr || !user) {
    console.error("[v0] Admin page - Auth error:", authErr)
    redirect("/auth/login")
  }

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("role, email, full_name")
    .eq("id", user.id)
    .single()

  console.log("[v0] Admin page - User:", user.id, "Role:", profile?.role)

  if (profileErr || !profile) {
    console.error("[v0] Admin page - Profile error:", profileErr)
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Profile not found</h1>
        <p className="text-sm text-muted-foreground mt-2">Unable to load your profile. Please contact support.</p>
      </div>
    )
  }

  const isAdmin = profile.role === "admin" || profile.role === "superadmin"

  if (!isAdmin) {
    console.log("[v0] Admin page - Access denied for role:", profile.role)
    redirect("/dashboard")
  }

  // Admin UI
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage point rules, users, teams and rewards.</p>
        </div>
        <div className="text-sm">
          Role: <span className="font-medium">{profile.role}</span>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <CreateRuleForm />
          <RulesList />
        </div>

        <div className="space-y-4">
          <CreateUserForm />
          <CreateTeamForm />
          <AssignMemberForm />
          <CreateRewardForm />
        </div>
      </section>
    </div>
  )
}
