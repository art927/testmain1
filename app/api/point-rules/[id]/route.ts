import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await req.json()
    const updates = {
      name: body.name,
      trigger_type: body.trigger_type,
      points: body.points,
      is_active: body.is_active,
      updated_at: new Date().toISOString(),
    }
    const supabase = createServiceClient()
    const { data, error } = await supabase.from("point_rules").update(updates).eq("id", id).select().maybeSingle()
    if (error) {
      console.error("PUT /api/point-rules/[id] error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch (err) {
    console.error("PUT /api/point-rules/[id] unexpected:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = params.id
  const supabase = createServiceClient()
  const { error } = await supabase.from("point_rules").delete().eq("id", id)
  if (error) {
    console.error("DELETE /api/point-rules/[id] error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
