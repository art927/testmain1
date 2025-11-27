import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, CheckCircle2, Clock, Award } from "lucide-react"
import { AIWidget } from "@/components/ai-widget"
import EmployeeTeamInfo from "@/components/employee-team-info"
import KPIsSummary from "@/components/ui/kpi-sum"

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch auth user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) redirect("/auth/login")

  // Fetch or auto-create profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

  let userProfile = profile

  if (!profile) {
    console.log("[v0] No profile found, creating one for:", user.id)

    const { data: newProfile, error: createError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email,
          role: user.user_metadata?.role || "employee",
          points: 0,
        },
        { onConflict: "id" },
      )
      .select()
      .single()

    if (createError) throw new Error("Failed to create profile")

    userProfile = newProfile
  }

  if (userProfile.role !== "employee") {
    if (userProfile.role === "manager") {
      redirect("/manager")
    }
    if (userProfile.role === "admin" || userProfile.role === "superadmin") {
      redirect("/admin")
    }
  }

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("assigned_to", user.id)
    .order("created_at", { ascending: false })

  const { data: recognitions } = await supabase
    .from("recognitions")
    .select(`
      *,
      from_profile:profiles!recognitions_from_user_id_fkey(full_name, email)
    `)
    .eq("to_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: pointsHistory } = await supabase
    .from("points_history")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  const completedTasks = tasks?.filter((t) => t.status === "completed") || []
  const pendingTasks = tasks?.filter((t) => t.status === "assigned") || []

  return (
    <>
      {/* STATS GRID */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Points</p>
                <p className="text-3xl font-bold mt-2">{userProfile?.points || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Tasks</p>
                <p className="text-3xl font-bold mt-2">{completedTasks.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Tasks</p>
                <p className="text-3xl font-bold mt-2">{pendingTasks.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recognitions</p>
                <p className="text-3xl font-bold mt-2">{recognitions?.length || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-chart-3/10 flex items-center justify-center">
                <Award className="h-6 w-6 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MAIN GRID */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Tasks</CardTitle>
              <CardDescription>Your assigned and completed tasks</CardDescription>
            </CardHeader>
            <CardContent>
              {tasks && tasks.length > 0 ? (
                <div className="space-y-3">
                  {tasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{task.title}</h4>
                          <Badge
                            variant={task.status === "completed" ? "default" : "secondary"}
                            className={task.status === "completed" ? "bg-secondary" : ""}
                          >
                            {task.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                      </div>
                      <div className="flex items-center gap-1 ml-4 text-primary">
                        <Trophy className="h-4 w-4" />
                        <span className="font-bold">{task.points_reward}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No tasks assigned yet</p>
                  <p className="text-sm mt-2">Check back soon for new opportunities</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Recognitions</CardTitle>
              <CardDescription>Kudos from your teammates</CardDescription>
            </CardHeader>
            <CardContent>
              {recognitions && recognitions.length > 0 ? (
                <div className="space-y-3">
                  {recognitions.map((recognition: any) => (
                    <div key={recognition.id} className="p-4 rounded-lg border bg-card">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Award className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            From {recognition.from_profile?.full_name || recognition.from_profile?.email}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">{recognition.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(recognition.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No recognitions yet</p>
                  <p className="text-sm mt-2">Keep up the great work!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <AIWidget role="employee" />
          <Card>
            <CardHeader>
              <CardTitle>Points Activity</CardTitle>
              <CardDescription>Recent points earned</CardDescription>
            </CardHeader>
            <CardContent>
              {pointsHistory && pointsHistory.length > 0 ? (
                <div className="space-y-3">
                  {pointsHistory.map((h) => (
                    <div key={h.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{h.reason}</p>
                        <p className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`font-bold ${h.points_change > 0 ? "text-secondary" : "text-destructive"}`}>
                          {h.points_change > 0 ? "+" : ""}
                          {h.points_change}
                        </span>
                        <Trophy className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No activity yet</p>
                  <p className="text-sm mt-2">Start completing tasks to earn points</p>
                </div>
              )}
            </CardContent>
          </Card>

          <KPIsSummary />
        </div>
      </div>

      <section className="w-full">
        <Card className="w-1/6">
          <CardContent className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <EmployeeTeamInfo />
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  )
}
