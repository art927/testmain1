"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"
import ModuleCard from "./components/ModuleCard"

export default function EmployeeModulesPage() {
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [modules, setModules] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)

    // Get user
    const { data: auth } = await supabase.auth.getUser()
    const user = auth?.user
    if (!user) return

    // Get profile + their team_id
    const { data: prof } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    setProfile(prof)

    if (!prof || !prof.team_id) {
      setModules([])
      setLoading(false)
      return
    }

    // Load modules for employee's team
    const { data: rawModules = [] } = await supabase
      .from("evaluation_modules")
      .select("*")
      .eq("applies_to_team_id", prof.team_id)
      .eq("is_active", true)

    const fullModules = []

    // Attach open period + sections + questions
    for (const m of rawModules ?? []) {
      const { data: openPeriod } = await supabase
        .from("evaluation_periods")
        .select("*")
        .eq("module_id", m.id)
        .eq("is_open", true)
        .maybeSingle()

      const { data: sections = [] } = await supabase
        .from("evaluation_sections")
        .select("*")
        .eq("module_id", m.id)
        .order("order_index")

      const { data: questions = [] } = await supabase
        .from("evaluation_questions")
        .select("*")
        .eq("module_id", m.id)
        .order("question_order")

      fullModules.push({
        ...m,
        openPeriod: openPeriod || null,
        sections,
        questions,
      })
    }

    setModules(fullModules)
    setLoading(false)
  }

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Your Self Evaluations</h1>

      {modules.length === 0 && (
        <p className="text-gray-500 text-center">
          No evaluation modules available for your team.
        </p>
      )}

      {modules.map((module) => (
        <ModuleCard
          key={module.id}
          module={module}
          isOpen={!!module.openPeriod}
          href={`/evaluation/employee/module/${module.id}`}
        />
      ))}
    </div>
  )
}
