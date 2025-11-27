"use server"

import { createClient } from "@/lib/supabase/server"

export async function updateUserSeniority(userId: string, seniority: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("profiles")
    .update({ seniority })
    .eq("id", userId)

  if (error) {
    console.error("Error updating seniority:", error)
    throw new Error("Failed to update seniority")
  }

  return { success: true }
}
