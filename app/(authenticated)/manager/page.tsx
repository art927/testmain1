import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddTaskForm } from "@/components/add-task-form"
import { ManagerLeaderboard } from "@/components/manager-leaderboard"
import { InviteMemberModal } from "@/components/invite-member-modal"
import { AIWidget } from "@/components/ai-widget"
import { Shield, Trophy, ListTodo, Users, TrendingUp, Heart } from 'lucide-react'

export default async function ManagerPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is a manager
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

  if (!profile || (profile.role !== "manager" && profile.role !== "admin")) {
    redirect("/dashboard")
  }

  const { data: team } = await supabase
    .from("teams")
    .select("*, team_members(count)")
    .eq("id", profile.team_id)
    .maybeSingle()

  const { count: recognitionCount } = await supabase
    .from("recognitions")
    .select("*", { count: "exact", head: true })
    .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  const { data: surveys } = await supabase
    .from("daily_surveys")
    .select("productivity_level")
    .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  const avgSentiment =
    surveys && surveys.length > 0
      ? (surveys.reduce((acc, s) => acc + s.productivity_level, 0) / surveys.length).toFixed(1)
      : "N/A"

  return (
    <>
      {/* <NavHeader name={profile.full_name || user.email || "User"} role={profile.role} /> */}

      <main className="container mx-auto py-8 px-4 md:px-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Shield className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Manager Dashboard</h1>
                {team && <p className="text-muted-foreground">{team.name}</p>}
              </div>
            </div>
            {team && <InviteMemberModal teamId={team.id} inviteCode={team.invite_code} />}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{team?.team_members?.[0]?.count || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Recognitions</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recognitionCount || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Sentiment</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgSentiment}</div>
              <p className="text-xs text-muted-foreground">out of 5</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Tabs defaultValue="tasks" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 lg:w-[300px]">
                <TabsTrigger value="tasks" className="gap-2">
                  <ListTodo className="h-4 w-4" />
                  Tasks
                </TabsTrigger>
                <TabsTrigger value="leaderboard" className="gap-2">
                  <Trophy className="h-4 w-4" />
                  Leaderboard
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tasks" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Task</CardTitle>
                    <CardDescription>Add tasks for employees to self-assign and complete</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AddTaskForm />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="leaderboard" className="space-y-6">
                <ManagerLeaderboard />
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <AIWidget role="manager" />
          </div>
        </div>
      </main>
    </>
  )
}
