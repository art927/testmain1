import { NextResponse } from "next/server"
import { awardPoints } from "@/lib/points"
import { createServiceClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId, triggerType, eventId = null, meta = null } = body
    if (!userId || !triggerType) {
      return NextResponse.json({ error: "userId and triggerType required" }, { status: 400 })
    }

    // Optionally validate caller is trusted (admin or internal worker)
    // Example: allow if request has a valid session user who is admin.
    const supabase = createServiceClient()
    const { data: sessionUser } = await supabase.auth.getUser()
    // (optional) enforce role check here...

    const res = await awardPoints({ userId, triggerType, eventId, meta, actorId: sessionUser?.user?.id ?? null })
    if (res.error) {
      return NextResponse.json({ error: res.error }, { status: 500 })
    }
    return NextResponse.json(res)
  } catch (err) {
    console.error("POST /api/award-points unexpected:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
