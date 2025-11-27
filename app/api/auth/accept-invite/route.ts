import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const userId = body?.userId
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const supabase = createServiceClient()

    // 1) try to get email and team_id from profiles
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("email, team_id")
      .eq("id", userId)
      .maybeSingle()

    if (profileErr) {
      console.error("profiles lookup error:", profileErr)
      return NextResponse.json({ error: "Profiles lookup failed", details: profileErr.message }, { status: 500 })
    }

    let email: string | null = profile?.email ?? null

    // If the user is already enrolled in a team, skip invitation checks and any writes.
    if (profile?.team_id) {
      console.debug("accept-invite: user already enrolled in team, skipping invite processing", {
        userId,
        teamId: profile.team_id,
      })
      return NextResponse.json({ ok: true, teamId: profile.team_id })
    }

    // 2) fallback: try a users table (adjust to your schema). This is optional.
    if (!email) {
      const { data: userRow, error: userRowErr } = await supabase
        .from("users")
        .select("email")
        .eq("id", userId)
        .maybeSingle()

      if (userRowErr) {
        console.error("users lookup error:", userRowErr)
      } else if (userRow?.email) {
        email = userRow.email
      }
    }

    if (!email) {
      console.error("user email not found for userId:", userId)
      return NextResponse.json({ error: "User email not found" }, { status: 404 })
    }

    // 3) find invitation (only pending invites, newest first, limit 1)
    const { data: invite, error: inviteErr } = await supabase
      .from("invitations")
      .select("*")
      .eq("email", email)
      .is("accepted_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (inviteErr) {
      console.error("invite lookup error:", inviteErr)
      return NextResponse.json({ error: "Invite lookup failed", details: inviteErr.message }, { status: 500 })
    }

    if (!invite) {
      return NextResponse.json({ ok: false, message: "No invitation found" }, { status: 200 })
    }

    const inviterRole = invite.invited_by_role || invite.inviter_role || null
    if (inviterRole && !["manager", "admin"].includes(inviterRole)) {
      return NextResponse.json({ ok: false, message: "Invite not from manager" }, { status: 403 })
    }

    const teamId = invite.team_id
    if (!teamId) {
      console.error("invite missing team_id:", invite)
      return NextResponse.json({ error: "Invite missing team_id" }, { status: 500 })
    }

    // 4) add membership if not present
    const { data: existing, error: existingErr } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", teamId)
      .eq("user_id", userId)
      .maybeSingle()

    if (existingErr) {
      console.error("team_members lookup error:", existingErr)
      return NextResponse.json({ error: "Membership lookup failed", details: existingErr.message }, { status: 500 })
    }

    if (!existing) {
      const { error: insertErr } = await supabase
        .from("team_members")
        .insert([{ team_id: teamId, user_id: userId, role: "member" }])

      if (insertErr) {
        console.error("insert team_member error:", insertErr)
        return NextResponse.json({ error: "Failed to add member", details: insertErr.message }, { status: 500 })
      }
    }

    // 5) update profile.team_id
    const { error: updateProfileErr } = await supabase
      .from("profiles")
      .update({ team_id: teamId })
      .eq("id", userId)

    if (updateProfileErr) {
      console.error("update profile error:", updateProfileErr)
      return NextResponse.json({ error: "Failed updating profile", details: updateProfileErr.message }, { status: 500 })
    }

    // 6) mark invite accepted
    const { error: acceptErr } = await supabase
      .from("invitations")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invite.id)

    if (acceptErr) {
      console.error("mark invite accepted error:", acceptErr)
      // not fatal — continue
    }

    return NextResponse.json({ ok: true, teamId })
  } catch (err) {
    console.error("unexpected error in accept-invite:", err)
    return NextResponse.json({ error: "Unexpected server error", details: String(err) }, { status: 500 })
  }
}
