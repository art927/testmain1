"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function removeMember(teamId: string, userId: string) {
  try {
    const supabase = await createClient()

    // Verify the current user is a manager
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: "Not authenticated" }
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, team_id")
      .eq("id", user.id)
      .maybeSingle()

    if (!profile || profile.role !== "manager" || profile.team_id !== teamId) {
      return { error: "Unauthorized" }
    }

    // Remove from team_members
    const { error: memberError } = await supabase
      .from("team_members")
      .delete()
      .eq("team_id", teamId)
      .eq("user_id", userId)

    if (memberError) {
      console.error("[v0] Error removing team member:", memberError)
      return { error: "Failed to remove team member" }
    }

    // Set profile team_id to null
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ team_id: null })
      .eq("id", userId)

    if (profileError) {
      console.error("[v0] Error updating profile:", profileError)
      return { error: "Failed to update member profile" }
    }

    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error in removeMember:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function createInvitation(teamId: string, email: string) {
  try {
    const supabase = await createClient()

    // Verify the current user is a manager
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: "Not authenticated" }
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, team_id")
      .eq("id", user.id)
      .maybeSingle()

    if (!profile || profile.role !== "manager" || profile.team_id !== teamId) {
      return { error: "Unauthorized" }
    }

    // Generate unique invite code
    const inviteCode = crypto.randomUUID()

    // Create invitation
    const { error } = await supabase
      .from("invitations")
      .insert({
        team_id: teamId,
        email: email,
        invite_code: inviteCode,
        status: "pending",
      })

    if (error) {
      console.error("[v0] Error creating invitation:", error)
      return { error: "Failed to create invitation" }
    }

    revalidatePath("/settings")
    return { success: true, inviteCode }
  } catch (error) {
    console.error("[v0] Error in createInvitation:", error)
    return { error: "An unexpected error occurred" }
  }
}
