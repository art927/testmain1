import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { requireSuperAdmin } from "@/lib/admin"

export async function POST(req: Request) {
  try {
    const { name, description, points_cost, icon, available = true } = await req.json()
    if (!name || typeof points_cost !== "number") return NextResponse.json({ error: "name and points_cost required" }, { status: 400 })

    const supabase = createServiceClient()
    await requireSuperAdmin(supabase)

    const { data, error } = await supabase.from("rewards").insert([{ name, description, points_cost, icon, available }]).select().maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true, reward: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 })
  }
}
