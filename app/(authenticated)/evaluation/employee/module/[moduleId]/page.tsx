"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import QuestionCard from "../../components/QuestionCard"

const DAY_MS = 24 * 60 * 60 * 1000

function getVisibilityWindowDays(frequency: string | null | undefined): number {
  switch (frequency) {
    case "quarterly":
      return 30
    case "semiannual":
      return 45
    case "annual":
      return 60
    default:
      return 30
  }
}

export default function EmployeeEvaluationForm() {
  const supabase = createClient()

  const params = useParams()
  const rawModuleId = params.moduleId
  const moduleId = Array.isArray(rawModuleId) ? rawModuleId[0] : rawModuleId

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [moduleInfo, setModuleInfo] = useState<any>(null)
  const [period, setPeriod] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [responses, setResponses] = useState<any>({})
  const [goals, setGoals] = useState<any[]>([]) // ✅ NEW

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)

    // ✅ Get user
    const { data: auth } = await supabase.auth.getUser()
    const user = auth?.user
    if (!user) return

    // ✅ Load employee goals
    const { data: goalsData = [] } = await supabase
      .from("team_goals")
      .select("id, title, due_date, status")
      .eq("employee_id", user.id)

    setGoals(goalsData || [])


    // ✅ Get module
    const { data: mod } = await supabase
      .from("evaluation_modules")
      .select("*")
      .eq("id", moduleId)
      .maybeSingle()

    if (!mod) {
      setModuleInfo(null)
      setPeriod(null)
      setQuestions([])
      setLoading(false)
      return
    }

    setModuleInfo(mod)

    // ✅ Fetch periods
    const { data: periodRows } = await supabase
      .from("evaluation_periods")
      .select("*")
      .eq("module_id", moduleId)

    let selectedPeriod: any = null

    if (periodRows && periodRows.length > 0) {
      const today = new Date()

      const decorated = periodRows
        .map((p: any) => {
          const freq = p.frequency ?? mod.frequency ?? null
          const windowDays = getVisibilityWindowDays(freq)

          const end = p.end_date ? new Date(p.end_date) : null
          if (!end || Number.isNaN(end.getTime())) return null

          const visibleFrom = new Date(end.getTime() - windowDays * DAY_MS)

          const isVisible = today >= visibleFrom

          return {
            ...p,
            _visible: isVisible,
            _visibleFrom: visibleFrom,
          }
        })
        .filter(Boolean) as any[]

      const visiblePeriods = decorated.filter((p) => p._visible)

      if (visiblePeriods.length > 0) {
        visiblePeriods.sort(
          (a, b) =>
            new Date(a.end_date).getTime() - new Date(b.end_date).getTime()
        )
        selectedPeriod = visiblePeriods[visiblePeriods.length - 1]
      }
    }

    setPeriod(selectedPeriod)

    // ✅ Fetch questions
    const { data: qs } = await supabase
      .from("evaluation_questions")
      .select("*")
      .eq("module_id", moduleId)

    setQuestions(qs || [])
    setLoading(false)
  }

  function updateScore(qId: string, value: number) {
    setResponses((prev: any) => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        score: value,
      },
    }))
  }

  function updateComment(qId: string, value: string) {
    setResponses((prev: any) => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        comment: value,
      },
    }))
  }

  async function handleSubmit() {
    console.log("DEBUG → responses =", responses)

    setSubmitting(true)

    const { data: auth } = await supabase.auth.getUser()
    const user = auth?.user
    if (!user) {
      setSubmitting(false)
      return
    }

    if (!period) {
      alert("No active evaluation period.")
      setSubmitting(false)
      return
    }

    const { data: existingInstance } = await supabase
      .from("evaluation_instances")
      .select("*")
      .eq("user_id", user.id)
      .eq("period_id", period.id)
      .maybeSingle()

    if (existingInstance) {
      alert("You have already submitted this evaluation.")
      setSubmitting(false)
      return
    }

    const { data: instance, error: instanceError } = await supabase
      .from("evaluation_instances")
      .insert({
        user_id: user.id,
        module_id: moduleId,
        period_id: period.id,
        self_status: "submitted",
        self_submitted_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (instanceError) {
      alert("Error submitting evaluation: " + instanceError.message)
      setSubmitting(false)
      return
    }

    const instanceId = instance.id

    const answerRows = Object.entries(responses).map(
      ([questionId, data]: any) => ({
        instance_id: instanceId,
        question_id: questionId,
        question_text: questions.find((q) => q.id === questionId)
          ?.question_text,
        self_score: Number(data.score) || null,
        self_comment: data.comment || null,
        last_updated_by: user.id,
      })
    )

    const { error: answersError } = await supabase
      .from("evaluation_answers")
      .insert(answerRows)

    if (answersError) {
      alert("Error saving answers: " + answersError.message)
      setSubmitting(false)
      return
    }

    alert("Evaluation submitted successfully!")
    setSubmitting(false)
  }

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )

  if (!moduleInfo)
    return <p className="text-center py-20">Module not found.</p>

  if (!period)
    return (
      <p className="text-center py-20">
        This evaluation is currently closed.
      </p>
    )

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-10">

      {/* ✅ HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Self-Evaluation</h1>
        <h2 className="text-3xl ">{moduleInfo.name}</h2>
        <p className="text-gray-500 mt-2">
          Period: {period.name} ({period.start_date} → {period.end_date})
        </p>
      </div>

      {/* ✅ ✅ GOALS PANEL */}
      <div className="p-4 bg-gray-50 rounded-lg border">
        <h2 className="text-lg font-semibold mb-3">Your Assigned Goals</h2>

        {goals.length === 0 ? (
          <p className="text-sm text-gray-500">No goals assigned.</p>
        ) : (
          <ul className="space-y-2">
            {goals.map((g) => (
              <li key={g.id} className="p-3 bg-white rounded-md border">
                <div className="font-medium">{g.title}</div>
                <div className="text-sm text-gray-600">
                  Due: {g.due_date}
                </div>
                <div className="text-sm capitalize">
                  Status: {g.status}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ✅ QUESTIONS */}
      {questions.map((q) => (
        <QuestionCard
          key={q.id}
          question={q}
          score={responses[q.id]?.score || ""}
          comment={responses[q.id]?.comment || ""}
          onScoreChange={(v: number) => updateScore(q.id, v)}
          onCommentChange={(v: string) => updateComment(q.id, v)}
        />
      ))}

      {/* ✅ SUBMIT */}
      <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Submitting..." : "Submit Evaluation"}
      </Button>
    </div>
  )
}
