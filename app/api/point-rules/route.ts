import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase.from("point_rules").select("*").order("created_at", { ascending: false })
  if (error) {
    console.error("[v0] GET /api/point-rules error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[v0] POST point-rules - Auth error:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || !["admin", "superadmin"].includes(profile.role)) {
      console.log("[v0] POST point-rules - Access denied for role:", profile?.role)
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await req.json()
    const name = typeof body?.name === "string" ? body.name.trim() : ""
    const trigger_type = typeof body?.trigger_type === "string" ? body.trigger_type.trim() : ""
    const points = Number(body?.points)
    const is_active = body?.is_active === undefined ? true : Boolean(body.is_active)

    if (!name || !trigger_type || Number.isNaN(points)) {
      return NextResponse.json(
        { error: "Invalid payload: name, trigger_type and numeric points required" },
        { status: 400 },
      )
    }

    console.log("[v0] POST point-rules - Creating rule:", name, trigger_type, points)

    const serviceClient = createServiceClient()
    const { data, error } = await serviceClient
      .from("point_rules")
      .insert([{ name, trigger_type, points, is_active, created_by: user.id }])
      .select()
      .limit(1)

    if (error) {
      console.error("[v0] POST /api/point-rules insert error:", error)
      return NextResponse.json({ error: error.message ?? String(error) }, { status: 500 })
    }

    const inserted = data?.[0] ?? null
    console.log("[v0] POST point-rules - Rule created successfully")
    return NextResponse.json(inserted)
  } catch (err: any) {
    console.error("[v0] POST /api/point-rules unexpected:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
