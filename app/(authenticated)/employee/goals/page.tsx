"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Goal = {
  id: string
  title: string
  description: string
  due_date: string
  priority: string
  category: string
  status: string
  manager_name: string
  created_at: string
}

export default function EmployeeGoalsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [goals, setGoals] = useState<Goal[]>([])

  useEffect(() => {
    loadGoals()
  }, [])

  async function loadGoals() {
    setLoading(true)

    const { data: auth } = await supabase.auth.getUser()
    const user = auth?.user
    if (!user) {
      setLoading(false)
      return
    }

    const { data: goalsData, error } = await supabase
      .from("team_goals")
      .select(`
        *,
        profiles!team_goals_manager_id_fkey(full_name)
      `)
      .eq("employee_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error loading goals:", error)
      setLoading(false)
      return
    }

    const mapped: Goal[] = (goalsData || []).map((g: any) => ({
      id: g.id,
      title: g.title,
      description: g.description,
      due_date: g.due_date,
      priority: g.priority,
      category: g.category,
      status: g.status,
      manager_name: g.profiles?.full_name || "Manager",
      created_at: g.created_at,
    }))

    setGoals(mapped)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Goals</h1>
        <p className="text-muted-foreground mt-2">Track your performance goals set by your manager</p>
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            No goals have been set for you yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {goals.map((goal) => (
            <Card key={goal.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle>{goal.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">Set by {goal.manager_name}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge
                      variant={
                        goal.priority === "high" ? "destructive" : goal.priority === "medium" ? "default" : "secondary"
                      }
                    >
                      {goal.priority}
                    </Badge>
                    <Badge variant="outline">{goal.category}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{goal.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <strong>Due Date:</strong> {goal.due_date}
                  </div>
                  <Badge
                    variant={
                      goal.status === "completed" ? "default" : goal.status === "in-progress" ? "secondary" : "outline"
                    }
                  >
                    {goal.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
