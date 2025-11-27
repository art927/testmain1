import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { requireSuperAdmin } from "@/lib/admin"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, full_name, team_id } = body
    if (!email || !password) return NextResponse.json({ error: "email and password required" }, { status: 400 })

    const supabase = createServiceClient()
    await requireSuperAdmin(supabase)

    // create auth user (admin)
    const { data: userData, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name },
    })
    if (createErr) return NextResponse.json({ error: createErr.message }, { status: 500 })

    const userId = userData.user?.id
    // create a profile entry
    const { error: profileErr } = await supabase.from("profiles").insert([
      { id: userId, email, full_name: full_name ?? null, role: "manager", team_id: team_id ?? null },
    ])
    if (profileErr) return NextResponse.json({ error: profileErr.message }, { status: 500 })

    return NextResponse.json({ ok: true, userId })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 })
  }
}
