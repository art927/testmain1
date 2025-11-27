import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Medal, Award, TrendingUp } from "lucide-react"

export async function ManagerLeaderboard() {
  const supabase = await createServerClient()

  // Fetch all employees with their points
  const { data: employees } = await supabase
    .from("profiles")
    .select("id, full_name, email, points, role")
    .order("points", { ascending: false })

  // Fetch task completion stats
  const { data: taskStats } = await supabase.from("tasks").select("assigned_to, status").eq("status", "completed")

  // Count completed tasks per user
  const taskCounts = taskStats?.reduce((acc: Record<string, number>, task) => {
    if (task.assigned_to) {
      acc[task.assigned_to] = (acc[task.assigned_to] || 0) + 1
    }
    return acc
  }, {})

  // Fetch recognition counts
  const { data: recognitions } = await supabase.from("recognitions").select("to_user_id")

  const kudosCounts = recognitions?.reduce((acc: Record<string, number>, rec) => {
    acc[rec.to_user_id] = (acc[rec.to_user_id] || 0) + 1
    return acc
  }, {})

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />
    if (index === 2) return <Award className="h-5 w-5 text-amber-600" />
    return <TrendingUp className="h-5 w-5 text-muted-foreground" />
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
          <CardDescription>Overall points leaderboard and statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employees?.map((employee, index) => (
              <div
                key={employee.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8">{getRankIcon(index)}</div>
                  <Avatar>
                    <AvatarFallback>{employee.full_name?.charAt(0) || employee.email?.charAt(0) || "?"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {employee.full_name || employee.email}
                      {employee.role === "manager" && <span className="ml-2 text-xs text-purple-400">(Manager)</span>}
                    </p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{taskCounts?.[employee.id] || 0} tasks completed</span>
                      <span>{kudosCounts?.[employee.id] || 0} kudos received</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{employee.points}</p>
                  <p className="text-xs text-muted-foreground">points</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
