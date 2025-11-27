import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { requireSuperAdmin } from "@/lib/admin"

export async function POST(req: Request) {
  try {
    const { team_id, user_id, role } = await req.json()
    if (!team_id || !user_id || !role) return NextResponse.json({ error: "team_id, user_id, role required" }, { status: 400 })

    const supabase = createServiceClient()
    await requireSuperAdmin(supabase)

    // upsert team_members
const { error: tmErr } = await supabase.from("team_members").upsert([
  { team_id, user_id, role },
], { onConflict: "team_id, user_id" })
    if (tmErr) return NextResponse.json({ error: tmErr.message }, { status: 500 })

    // update profile.team_id and role
    const { error: pErr } = await supabase.from("profiles").update({ team_id, role }).eq("id", user_id)
    if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 })
  }
}
