"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

type Goal = {
  id?: string
  title: string
  description: string
  due_date: string
  priority: string
  category: string
}

export default function SetGoalsPage() {
  const supabase = createClient()
  const router = useRouter()
  const params = useParams()
  const instanceId = Array.isArray(params.instanceId) ? params.instanceId[0] : params.instanceId

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [employeeInfo, setEmployeeInfo] = useState<any>(null)
  const [evaluationInfo, setEvaluationInfo] = useState<any>(null)
  const [goals, setGoals] = useState<Goal[]>([
    {
      title: "",
      description: "",
      due_date: "",
      priority: "medium",
      category: "",
    },
  ])
  const [existingGoals, setExistingGoals] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)

    // Get evaluation instance
    const { data: instance, error: instanceError } = await supabase
      .from("evaluation_instances")
      .select(`
        *,
        profiles!evaluation_instances_user_id_fkey(id, full_name, email)
      `)
      .eq("id", instanceId)
      .single()

    if (instanceError || !instance) {
      console.error("Error loading instance:", instanceError)
      setLoading(false)
      return
    }

    // Check if manager evaluation is submitted
    if (instance.manager_status !== "submitted") {
      alert("You must complete the evaluation before setting goals")
      router.push("/evaluation")
      return
    }

    setEvaluationInfo(instance)
    setEmployeeInfo(instance.profiles)

    // Load existing goals for this instance
    const { data: existingGoalsData } = await supabase
      .from("team_goals")
      .select("*")
      .eq("instance_id", instanceId)
      .order("created_at", { ascending: true })

    if (existingGoalsData && existingGoalsData.length > 0) {
      setExistingGoals(existingGoalsData)
    }

    setLoading(false)
  }

  function addGoal() {
    setGoals([
      ...goals,
      {
        title: "",
        description: "",
        due_date: "",
        priority: "medium",
        category: "",
      },
    ])
  }

  function removeGoal(index: number) {
    setGoals(goals.filter((_, i) => i !== index))
  }

  function updateGoal(index: number, field: keyof Goal, value: string) {
    const updated = [...goals]
    updated[index] = { ...updated[index], [field]: value }
    setGoals(updated)
  }

  async function handleSave() {
    // Validate all goals
    for (const goal of goals) {
      if (!goal.title || !goal.description || !goal.due_date || !goal.category) {
        alert("Please fill in all required fields for each goal")
        return
      }
    }

    setSaving(true)

    const { data: auth } = await supabase.auth.getUser()
    const user = auth?.user
    if (!user) {
      setSaving(false)
      return
    }

    // Get next period for goal assignment
    const { data: currentPeriod } = await supabase
      .from("evaluation_periods")
      .select("*")
      .eq("id", evaluationInfo.period_id)
      .single()

    // Find or create next period
    let nextPeriodId = evaluationInfo.period_id

    if (currentPeriod) {
      const { data: nextPeriod } = await supabase
        .from("evaluation_periods")
        .select("*")
        .eq("module_id", evaluationInfo.module_id)
        .gt("start_date", currentPeriod.end_date)
        .order("start_date", { ascending: true })
        .limit(1)
        .maybeSingle()

      if (nextPeriod) {
        nextPeriodId = nextPeriod.id
      }
    }

    // Insert all goals
    const goalsToInsert = goals.map((goal) => ({
      employee_id: employeeInfo.id,
      manager_id: user.id,
      period_id: nextPeriodId,
      instance_id: instanceId,
      title: goal.title,
      description: goal.description,
      due_date: goal.due_date,
      priority: goal.priority,
      category: goal.category,
      status: "not-started",
    }))

    const { error: insertError } = await supabase.from("team_goals").insert(goalsToInsert)

    if (insertError) {
      alert("Error saving goals: " + insertError.message)
      setSaving(false)
      return
    }

    alert("Goals saved successfully!")
    router.push("/evaluation")
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (!employeeInfo || !evaluationInfo) {
    return <p className="text-center py-20">Evaluation not found</p>
  }

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Set Goals</h1>
        <p className="text-muted-foreground mt-2">Create performance goals for {employeeInfo.full_name}</p>
      </div>

      {/* EXISTING GOALS */}
      {existingGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Previously Set Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {existingGoals.map((goal) => (
              <div key={goal.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{goal.title}</h3>
                  <div className="flex gap-2">
                    <Badge variant="outline">{goal.priority}</Badge>
                    <Badge>{goal.category}</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{goal.description}</p>
                <p className="text-sm">
                  <strong>Due:</strong> {goal.due_date}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* NEW GOALS FORM */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {goals.map((goal, index) => (
            <div key={index} className="p-6 border rounded-lg space-y-4 relative">
              {goals.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => removeGoal(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}

              <div className="space-y-2">
                <Label htmlFor={`title-${index}`}>
                  Goal Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`title-${index}`}
                  value={goal.title}
                  onChange={(e) => updateGoal(index, "title", e.target.value)}
                  placeholder="e.g., Improve customer satisfaction scores"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`description-${index}`}>
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id={`description-${index}`}
                  value={goal.description}
                  onChange={(e) => updateGoal(index, "description", e.target.value)}
                  placeholder="Detailed description of the goal and success criteria"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`due-date-${index}`}>
                    Due Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`due-date-${index}`}
                    type="date"
                    value={goal.due_date}
                    onChange={(e) => updateGoal(index, "due_date", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`priority-${index}`}>
                    Priority <span className="text-red-500">*</span>
                  </Label>
                  <Select value={goal.priority} onValueChange={(value) => updateGoal(index, "priority", value)}>
                    <SelectTrigger id={`priority-${index}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`category-${index}`}>
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select value={goal.category} onValueChange={(value) => updateGoal(index, "category", value)}>
                    <SelectTrigger id={`category-${index}`}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="skills">Skills Development</SelectItem>
                      <SelectItem value="leadership">Leadership</SelectItem>
                      <SelectItem value="collaboration">Collaboration</SelectItem>
                      <SelectItem value="innovation">Innovation</SelectItem>
                      <SelectItem value="customer">Customer Focus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}

          <Button variant="outline" onClick={addGoal} className="w-full bg-transparent">
            <Plus className="h-4 w-4 mr-2" />
            Add Another Goal
          </Button>
        </CardContent>
      </Card>

      {/* ACTION BUTTONS */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => router.push("/evaluation")} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving} className="flex-1">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Goals"
          )}
        </Button>
      </div>
    </div>
  )
}
