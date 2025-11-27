import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { requireSuperAdmin } from "@/lib/admin"

export async function POST(req: Request) {
  try {
    const { name, manager_id } = await req.json()
    if (!name) return NextResponse.json({ error: "name required" }, { status: 400 })

    const supabase = createServiceClient()
    await requireSuperAdmin(supabase)

    const { data, error } = await supabase.from("teams").insert([{ name, created_by: null }]).select().maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const teamId = data?.id
    if (manager_id && teamId) {
      // assign manager as owner in team_members
      const { error: tmErr } = await supabase.from("team_members").upsert([
        { team_id: teamId, user_id: manager_id, role: "owner" },
      ])
      if (tmErr) return NextResponse.json({ error: tmErr.message }, { status: 500 })
      // update manager profile team
      await supabase.from("profiles").update({ team_id: teamId }).eq("id", manager_id)
    }

    return NextResponse.json({ ok: true, team: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 })
  }
}
