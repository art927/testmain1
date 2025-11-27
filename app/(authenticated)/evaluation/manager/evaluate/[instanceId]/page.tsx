"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

type AnswerData = {
  id: string
  question_id: string
  question_text: string
  self_score: number | null
  self_comment: string | null
  manager_score: number | null
  manager_comment: string | null
}

export default function ManagerEvaluationForm() {
  const supabase = createClient()
  const router = useRouter()
  const params = useParams()
  const instanceId = Array.isArray(params.instanceId) ? params.instanceId[0] : params.instanceId

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [instance, setInstance] = useState<any>(null)
  const [module, setModule] = useState<any>(null)
  const [employee, setEmployee] = useState<any>(null)
  const [answers, setAnswers] = useState<AnswerData[]>([])
  const [managerScores, setManagerScores] = useState<Record<string, number>>({})
  const [managerComments, setManagerComments] = useState<Record<string, string>>({})
  const [isReadOnly, setIsReadOnly] = useState(false)

  useEffect(() => {
    loadEvaluationData()
  }, [])

  async function loadEvaluationData() {
    setLoading(true)

    const { data: inst } = await supabase.from("evaluation_instances").select("*").eq("id", instanceId).single()

    if (!inst) {
      setLoading(false)
      return
    }

    setInstance(inst)
    setIsReadOnly(inst.manager_status === "submitted")

    const { data: mod } = await supabase.from("evaluation_modules").select("*").eq("id", inst.module_id).single()

    setModule(mod)

    const { data: emp } = await supabase.from("profiles").select("full_name, email").eq("id", inst.user_id).single()

    setEmployee(emp)

    const { data: ans } = await supabase.from("evaluation_answers").select("*").eq("instance_id", instanceId)

    if (ans) {
      setAnswers(ans)

      const scores: Record<string, number> = {}
      const comments: Record<string, string> = {}

      ans.forEach((a) => {
        if (a.manager_score !== null) {
          scores[a.id] = a.manager_score
        }
        if (a.manager_comment) {
          comments[a.id] = a.manager_comment
        }
      })

      setManagerScores(scores)
      setManagerComments(comments)
    }

    setLoading(false)
  }

  function updateManagerScore(answerId: string, value: number) {
    setManagerScores((prev) => ({
      ...prev,
      [answerId]: value,
    }))
  }

  function updateManagerComment(answerId: string, value: string) {
    setManagerComments((prev) => ({
      ...prev,
      [answerId]: value,
    }))
  }

  async function handleSubmit() {
    if (isReadOnly) return

    setSubmitting(true)

    const { data: auth } = await supabase.auth.getUser()
    const user = auth?.user
    if (!user) {
      setSubmitting(false)
      return
    }

    const updates = answers.map((answer) => ({
      id: answer.id,
      instance_id: instanceId, // Include instance_id here
      question_id: answer.question_id, // Include question_id as well
      question_text: answer.question_text, // Include question_text as well
      manager_score: managerScores[answer.id] ?? null,
      manager_comment: managerComments[answer.id] ?? null,
      last_updated_by: user.id,
      updated_at: new Date().toISOString(),
    }))

    const { error: answersError } = await supabase.from("evaluation_answers").upsert(updates)

    if (answersError) {
      alert("Error saving manager evaluation: " + answersError.message)
      setSubmitting(false)
      return
    }

    const { error: instError } = await supabase
      .from("evaluation_instances")
      .update({
        manager_status: "submitted",
        manager_submitted_at: new Date().toISOString(),
      })
      .eq("id", instanceId)

    if (instError) {
      alert("Error updating status: " + instError.message)
      setSubmitting(false)
      return
    }

    alert("Manager evaluation submitted successfully!")
    router.push("/evaluation")
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (!instance || !module || !employee) {
    return (
      <div className="max-w-4xl mx-auto py-10 text-center">
        <p>Evaluation not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Manager Evaluation</h1>
          {isReadOnly && <Badge className="bg-blue-600">Completed</Badge>}
        </div>
        <h2 className="text-2xl">{module.name}</h2>
        <p className="text-muted-foreground">
          Evaluating: <span className="font-medium">{employee.full_name}</span> ({employee.email})
        </p>
      </div>

      {answers.map((answer) => (
        <Card key={answer.id} className="border-2">
          <CardHeader>
            <CardTitle className="text-lg font-medium">{answer.question_text}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <p className="text-sm font-semibold text-muted-foreground">Employee Self-Evaluation</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Score:</span>
                  <Badge variant="secondary">{answer.self_score ?? "Not scored"}</Badge>
                </div>
                {answer.self_comment && (
                  <div>
                    <span className="text-sm font-medium">Comment:</span>
                    <p className="text-sm text-muted-foreground mt-1">{answer.self_comment}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold">Your Manager Evaluation</p>

              <div>
                <label className="text-sm font-medium mb-2 block">Manager Score (1-10)</label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={managerScores[answer.id] ?? ""}
                  onChange={(e) => updateManagerScore(answer.id, Number(e.target.value))}
                  placeholder="Enter score 1-10"
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Manager Comment</label>
                <Textarea
                  value={managerComments[answer.id] ?? ""}
                  onChange={(e) => updateManagerComment(answer.id, e.target.value)}
                  placeholder="Add your evaluation comments..."
                  rows={3}
                  disabled={isReadOnly}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {!isReadOnly && (
        <Button className="w-full" onClick={handleSubmit} disabled={submitting} size="lg">
          {submitting ? "Submitting..." : "Submit Manager Evaluation"}
        </Button>
      )}

      {isReadOnly && (
        <div className="text-center text-muted-foreground">
          This evaluation has been submitted and is now read-only.
        </div>
      )}
    </div>
  )
}
