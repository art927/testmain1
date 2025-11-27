// Server-side helper to evaluate rules and award points (use with service role)
import { createServiceClient } from "@/lib/supabase/server"

type AwardParams = {
  userId: string
  triggerType: string
  eventId?: string | null
  meta?: Record<string, any>
  actorId?: string | null
}

export async function awardPoints(params: AwardParams) {
  const supabase = createServiceClient()
  const { userId, triggerType, eventId = null, meta = null, actorId = null } = params

  // 1) find an active rule (choose newest first)
  const { data: rule, error: ruleErr } = await supabase
    .from("point_rules")
    .select("*")
    .eq("trigger_type", triggerType)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (ruleErr) {
    console.error("awardPoints: rule lookup error", ruleErr)
    return { awarded: false, error: ruleErr }
  }
  if (!rule) return { awarded: false, reason: "no_rule" }

  // 2) prevent double awarding with event_id
  if (eventId) {
    const { data: existing, error: existingErr } = await supabase
      .from("point_transactions")
      .select("id")
      .eq("event_id", eventId)
      .limit(1)
      .maybeSingle()
    if (existingErr) {
      console.error("awardPoints: event lookup error", existingErr)
      return { awarded: false, error: existingErr }
    }
    if (existing) return { awarded: false, reason: "already_awarded" }
  }

  // 3) insert transaction audit record
  const insertPayload = {
    user_id: userId,
    points: rule.points,
    rule_id: rule.id,
    trigger_type: triggerType,
    event_id: eventId,
    meta,
    created_by: actorId,
  }

  const { error: insertErr } = await supabase.from("point_transactions").insert([insertPayload])
  if (insertErr) {
    console.error("awardPoints: insert transaction error", insertErr)
    return { awarded: false, error: insertErr }
  }

  // 4) increment user's points total (profiles.points assumed)
  const { data: currentProfile, error: fetchErr } = await supabase
    .from("profiles")
    .select("points")
    .eq("id", userId)
    .limit(1)
    .maybeSingle()

  if (fetchErr) {
    console.error("awardPoints: fetch profile error", fetchErr)
    return { awarded: true, warning: "transaction_inserted_but_profile_fetch_failed", error: fetchErr }
  }

  const newPoints = ((currentProfile && (currentProfile as any).points) ?? 0) + rule.points

  const { error: updateErr } = await supabase
    .from("profiles")
    .update({ points: newPoints })
    .eq("id", userId)

  // Note: if update fails we still have an audit record. You may want to rollback using SQL transaction/RPC.
  if (updateErr) {
    console.error("awardPoints: update profile error", updateErr)
    return { awarded: true, warning: "transaction_inserted_but_profile_update_failed", error: updateErr }
  }

  return { awarded: true, ruleId: rule.id, points: rule.points }
}
