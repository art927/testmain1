"use server"

import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export async function updateUserAccess(
  userId: string,
  newRole: string,
  newTeam: string | null,
  startDate: string
) {
  if (!startDate) throw new Error("Start date is required.")

  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: cookieStore }
  )

  const { data, error } = await supabase
    .from("profiles")
    .update({
      role: newRole,
      team_id: newTeam,
      start_date: startDate,          // ⭐ required always
    })
    .eq("id", userId)
    .select()

  if (error) throw error
  return { success: true }
}
