"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function sendRecognition(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const toUserId = formData.get("toUserId") as string
  const message = formData.get("message") as string

  if (!toUserId || !message) {
    return { error: "Please select a recipient and write a message" }
  }

  const { data: senderProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  // Get recognitions sent in the last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: recentRecognitions, error: countError } = await supabase
    .from("recognitions")
    .select("id")
    .eq("from_user_id", user.id)
    .gte("created_at", sevenDaysAgo.toISOString())

  if (countError) {
    console.error("[v0] Error checking recognition count:", countError)
    return { error: "Failed to check recognition limits" }
  }

  const recognitionCount = recentRecognitions?.length || 0

  // Check limits based on role
  if (senderProfile?.role === "manager" || senderProfile?.role === "admin") {
    if (recognitionCount >= 5) {
      return { error: "You've reached your weekly limit of 5 recognitions. Limit resets in 7 days." }
    }
  } else {
    // Employee limit: 1 per week
    if (recognitionCount >= 1) {
      return { error: "You've reached your weekly limit of 1 recognition. Limit resets in 7 days." }
    }
  }

  // Insert the recognition
  const { error } = await supabase.from("recognitions").insert({
    from_user_id: user.id,
    to_user_id: toUserId,
    message: message,
  })

  if (error) {
    console.error("[v0] Error sending recognition:", error)
    return { error: "Failed to send recognition" }
  }

  // Fetch the receiver's current points
  const { data: receiverProfile, error: fetchError } = await supabase
    .from("profiles")
    .select("points")
    .eq("id", toUserId)
    .single()

  if (fetchError) {
    console.error("[v0] Error fetching receiver profile:", fetchError)
    return { error: "Failed to update points" }
  }

  const currentPoints = receiverProfile?.points || 0
  const newPoints = currentPoints + 1

  // Update the receiver's points
  const { error: updateError } = await supabase.from("profiles").update({ points: newPoints }).eq("id", toUserId)

  if (updateError) {
    console.error("[v0] Error updating receiver points:", updateError)
    return { error: "Failed to update points" }
  }

  // Create a points history record
  const { error: historyError } = await supabase.from("points_history").insert({
    user_id: toUserId,
    points_change: 1,
    reason: "Received recognition",
  })

  if (historyError) {
    console.error("[v0] Error creating points history:", historyError)
    // Don't return error here, recognition was still sent successfully
  }

  // Revalidate the page to show the new recognition
  revalidatePath("/recognition")

  return { success: true }
}

export async function getRemainingRecognitions() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { remaining: 0, limit: 0 }
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: recentRecognitions } = await supabase
    .from("recognitions")
    .select("id")
    .eq("from_user_id", user.id)
    .gte("created_at", sevenDaysAgo.toISOString())

  const recognitionCount = recentRecognitions?.length || 0
  const limit = profile?.role === "manager" || profile?.role === "admin" ? 5 : 1
  const remaining = Math.max(0, limit - recognitionCount)

  return { remaining, limit, used: recognitionCount }
}
