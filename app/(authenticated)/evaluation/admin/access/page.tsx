import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import AdminAccess from "../AdminAccess"     // ⭐ FIXED
import type { AccessUser } from "../AdminAccess"

export default async function AdminAccessPage() {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  // ⭐ SELECT EVERYTHING, INCLUDING start_date
  const { data: rows } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      email,
      role,
      team_id,
      seniority,
      start_date,
      team:teams!fk_team (
        id,
        name
      )
    `)

  const { data: teams } = await supabase
    .from("teams")
    .select("id, name")

  // ⭐ MAP TO AccessUser TYPE
  const users: AccessUser[] =
    rows?.map((r: any) => ({
      id: r.id,
      full_name: r.full_name,
      email: r.email,
      role: r.role ?? "employee",
      team: r.team_id,
      seniority: r.seniority,
      start_date: r.start_date,                   // ⭐ REQUIRED
    })) ?? []

  return <AdminAccess initialUsers={users} teams={teams ?? []} />
}
