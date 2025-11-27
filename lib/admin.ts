import { createServiceClient } from "@/lib/supabase/server"

export async function isSuperAdminByUserId(userId: string) {
  const supabase = createServiceClient()
  const { data, error } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle()
  if (error) throw error
  return data?.role === "superadmin"
}

// helper to assert current session user is superadmin, returns boolean or throws
export async function requireSuperAdmin(supabaseServiceClient: ReturnType<typeof createServiceClient>) {
  const { data: sessionRes, error: sessionErr } = await supabaseServiceClient.auth.getUser()
  if (sessionErr) throw sessionErr
  const userId = sessionRes?.user?.id
  if (!userId) throw new Error("No session user")
  const { data: profile, error: profileErr } = await supabaseServiceClient.from("profiles").select("role").eq("id", userId).maybeSingle()
  if (profileErr) throw profileErr
  if (profile?.role !== "superadmin") throw new Error("Forbidden")
  return userId
}
