"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase/server"

type PeriodInput = {
  id?: string          // only for editing
  module_id: string
  name: string
  frequency: string
  start_date: string
  end_date: string
  is_open: boolean
}

// CREATE
export async function createPeriod(input: PeriodInput) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("evaluation_periods")
    .insert({
      module_id: input.module_id,
      name: input.name,
      frequency: input.frequency,
      start_date: input.start_date,
      end_date: input.end_date,
      is_open: input.is_open
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath("/evaluation")
  return data
}

// UPDATE
export async function updatePeriod(input: PeriodInput) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("evaluation_periods")
    .update({
      module_id: input.module_id,
      name: input.name,
      frequency: input.frequency,
      start_date: input.start_date,
      end_date: input.end_date,
      is_open: input.is_open
    })
    .eq("id", input.id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath("/evaluation")
  return data
}
