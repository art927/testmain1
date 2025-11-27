import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

import AdminEvaluation from "./admin"
import ManagerEvaluation from "./ManagerEvaluation"
import EmployeeEvaluation from "./employee/page"

export default async function EvaluationPage() {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  // 1. Logged in user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return <div>Not logged in</div>

  // 2. Fetch profile
  const { data: profiles } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const role = profiles?.role

  // 3. Role-based routing
  switch (role) {
    

    case "admin": {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  // Load teams
  const { data: teams } = await supabase
    .from("teams")
    .select("id, name")

  // 1) Load raw modules
  const { data: rawModules } = await supabase
    .from("evaluation_modules")
    .select("*")
    .order("created_at", { ascending: false })

  const fullModules: any[] = []

  // 2) Load sections + questions
  for (const m of rawModules ?? []) {
    const { data: sections } = await supabase
      .from("evaluation_sections")
      .select("*")
      .eq("module_id", m.id)
      .order("order_index")

    const { data: questions } = await supabase
      .from("evaluation_questions")
      .select("*")
      .eq("module_id", m.id)
      .order("question_order")

    fullModules.push({
      ...m,
      sections: sections ?? [],
      questions: questions ?? [],
    })
  }

  // 3) Load periods
  const { data: periodRows } = await supabase
    .from("evaluation_periods")
    .select("*")

  const periods = (periodRows ?? []).map((p) => ({
    ...p,
    module_name:
      fullModules.find((m) => m.id === p.module_id)?.name || "Unknown",
  }))

  // 4) Load users for Access tab
  const { data: userRows } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, team_id, seniority, start_date")

  const accessUsers = (userRows ?? []).map((u) => ({
    id: u.id,
    full_name: u.full_name,
    email: u.email,
    role: u.role ?? "employee",
    team_id: u.team_id ?? null,
    seniority: u.seniority ?? null,
    start_date: u.start_date,  
  }))

  return (
    <AdminEvaluation
      initialModules={fullModules}
      teams={teams ?? []}
      initialPeriods={periods}
      modules={fullModules.map((m) => ({ id: m.id, name: m.name }))}
      initialUsers={accessUsers}
    />
  )
}


    case "manager":
      return <ManagerEvaluation />

    case "employee":
      return <EmployeeEvaluation />

    default:
      return <div>No role assigned.</div>
  }
}
