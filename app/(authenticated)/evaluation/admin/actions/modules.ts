"use server"

import { createClient } from "@/lib/supabase/server"

/* ----------------------------------------------------------
   1) Load full module with sections + questions
----------------------------------------------------------- */
async function loadFullModule(moduleId: string, supabase: any) {
  const { data: module } = await supabase
    .from("evaluation_modules")
    .select("*")
    .eq("id", moduleId)
    .single()

  const { data: sections } = await supabase
    .from("evaluation_sections")
    .select("*")
    .eq("module_id", moduleId)
    .order("order_index", { ascending: true })

  const { data: questions } = await supabase
    .from("evaluation_questions")
    .select("*")
    .eq("module_id", moduleId)
    .order("question_order", { ascending: true })

  return {
    ...module,
    sections: sections || [],
    questions: questions || [],
  }
}

/* ----------------------------------------------------------
   2) Helper: get team name
----------------------------------------------------------- */
async function getTeamName(teamId: string, supabase: any) {
  const { data } = await supabase
    .from("teams")
    .select("name")
    .eq("id", teamId)
    .single()

  return data?.name || "Team"
}

/* ----------------------------------------------------------
   3) Helper: ensure there is an OPEN evaluation_period
----------------------------------------------------------- */
async function ensureOpenPeriod(
  moduleId: string,
  rawFrequency: string,
  supabase: any
) {
  // 1) If an open period already exists, do nothing
  const { data: existing } = await supabase
    .from("evaluation_periods")
    .select("id")
    .eq("module_id", moduleId)
    .eq("is_open", true)
    .maybeSingle()

  if (existing) return

  // 2) Normalize frequency to match CHECK constraint
  let freq = rawFrequency.toLowerCase()
  const allowed = ["quarterly", "semi-annual", "annual", "one-off"] as const

  if (!allowed.includes(freq as any)) {
    // fall back to one-off if something unexpected comes in
    freq = "one-off"
  }

  // 3) Compute start/end dates (date only, no time)
  const start = new Date()
  const end = new Date(start)

  switch (freq) {
    case "annual":
      end.setFullYear(start.getFullYear() + 1)
      break
    case "semi-annual":
      end.setMonth(start.getMonth() + 6)
      break
    case "quarterly":
      end.setMonth(start.getMonth() + 3)
      break
    case "one-off":
    default:
      end.setMonth(start.getMonth() + 1)
      break
  }

  const startStr = start.toISOString().slice(0, 10) // YYYY-MM-DD
  const endStr = end.toISOString().slice(0, 10)

  const periodName = `${rawFrequency} – ${startStr} → ${endStr}`

  const { error } = await supabase.from("evaluation_periods").insert([
    {
      module_id: moduleId,
      name: periodName,
      frequency: freq,      // ✅ NOT NULL + passes CHECK
      start_date: startStr, // ✅ date, not timestamp
      end_date: endStr,     // ✅ NOT NULL
      is_open: true,
    },
  ])

  if (error) {
    console.error("Error creating evaluation_period:", error)
    throw error
  }
}

/* ----------------------------------------------------------
   4) CREATE OR LOAD MODULE (main function)
      - If module exists: ensure period exists, then return.
      - If not: create module, sections, period.
----------------------------------------------------------- */
export async function createOrGetModule({
  frequency,
  team,
  seniority,
}: {
  frequency: string
  team: string
  seniority: string
}) {
  const supabase = await createClient()

  // ---- A) Check if module already exists for this combo ----
  const { data: existingModule } = await supabase
    .from("evaluation_modules")
    .select("*")
    .eq("frequency", frequency)
    .eq("applies_to_team_id", team)
    .eq("seniority", seniority)
    .maybeSingle()

  if (existingModule) {
    // Make sure it has an OPEN period
    await ensureOpenPeriod(existingModule.id, existingModule.frequency ?? frequency, supabase)
    return await loadFullModule(existingModule.id, supabase)
  }

  // ---- B) Create new module ----
  const teamName = await getTeamName(team, supabase)
  const autoName = `${frequency} – ${teamName} – ${seniority}`

  const { data: newModule, error: moduleError } = await supabase
    .from("evaluation_modules")
    .insert([
      {
        name: autoName,
        description: "",
        applies_to_team_id: team,
        frequency,
        seniority,
        is_active: true,
        scoring_scale_min: 1,
        scoring_scale_max: 10,
      },
    ])
    .select()
    .single()

  if (moduleError || !newModule) {
    console.error("Error creating evaluation_module:", moduleError)
    throw moduleError
  }

  // ---- C) Create default sections ----
  const { error: sectionsError } = await supabase
    .from("evaluation_sections")
    .insert([
      {
        module_id: newModule.id,
        name: "soft_skills",
        weight: 25,
        order_index: 1,
      },
      {
        module_id: newModule.id,
        name: "technical_skills",
        weight: 25,
        order_index: 2,
      },
      {
        module_id: newModule.id,
        name: "performance",
        weight: 50,
        order_index: 3,
      },
    ])

  if (sectionsError) {
    console.error("Error creating evaluation_sections:", sectionsError)
    throw sectionsError
  }

  // ---- D) Ensure an OPEN period exists for the new module ----
  await ensureOpenPeriod(newModule.id, frequency, supabase)

  // ---- E) Return full module with sections & questions ----
  return await loadFullModule(newModule.id, supabase)
}

/* ----------------------------------------------------------
   5) UPDATE MODULE METADATA (name, description, active)
----------------------------------------------------------- */
export async function updateModuleMetadata({
  id,
  name,
  description,
  is_active,
}: {
  id: string
  name: string
  description: string
  is_active: boolean
}) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("evaluation_modules")
    .update({
      name,
      description,
      is_active,
    })
    .eq("id", id)

  if (error) {
    console.error("Error updating evaluation_module:", error)
    throw error
  }

  return true
}
