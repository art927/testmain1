import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  Target,
  Award,
  Calendar,
  GraduationCap,
  BookOpen,
} from "lucide-react"
import KPIsDemo from "@/components/ui/kpis"

export default async function ProgressPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const { data: userTrainings } = await supabase
    .from("user_trainings")
    .select("*, training:trainings(*)")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })

  const inProgressTrainings = userTrainings?.filter(
    (ut) => ut.status === "in_progress"
  )?.length
    ? userTrainings?.filter((ut) => ut.status === "in_progress")
    : null
  const completedTrainings = userTrainings?.filter(
    (ut) => ut.status === "completed"
  )?.length
    ? userTrainings?.filter((ut) => ut.status === "completed")
    : null

  // Mock progress data
  const monthlyGoal = 500
  const currentPoints = profile?.points || 0
  const progressPercentage = Math.min((currentPoints / monthlyGoal) * 100, 100)

  const skills = [
    { name: "Leadership", progress: 75, level: "Advanced" },
    { name: "Communication", progress: 60, level: "Intermediate" },
    { name: "Technical Skills", progress: 85, level: "Expert" },
    { name: "Teamwork", progress: 90, level: "Expert" },
  ]

  const achievements = [
    { name: "First Task Completed", date: "2024-01-15", icon: "🎯" },
    { name: "100 Points Milestone", date: "2024-02-01", icon: "💯" },
    { name: "Team Player", date: "2024-02-15", icon: "🤝" },
    { name: "Recognition Champion", date: "2024-03-01", icon: "🏆" },
  ]

  return (
    <>
      {/* Monthly Goal Card */}
      <Card className="mb-6 border-none bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium opacity-90">Monthly Goal Progress</p>
              <p className="text-3xl font-bold mt-2">
                {currentPoints} / {monthlyGoal} pts
              </p>
            </div>
            <Target className="h-16 w-16 opacity-20" />
          </div>
          <Progress
            value={progressPercentage}
            className="h-3 bg-secondary-foreground/20"
          />
          <p className="text-sm mt-2 opacity-90">
            {Math.round(progressPercentage)}% complete
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Training Progress
            </CardTitle>
            <CardDescription>Your enrolled engineering courses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {inProgressTrainings?.length! > 0 ? (
              inProgressTrainings?.map((ut: any) => (
                <div key={ut.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{ut.training.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {ut.training.category}
                      </p>
                    </div>
                    <Badge variant="secondary">{ut.progress_percent}%</Badge>
                  </div>
                  <Progress value={ut.progress_percent} className="h-2" />
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No trainings in progress</p>
                <p className="text-xs mt-1">
                  Enroll in courses to track your learning
                </p>
              </div>
            )}
            {completedTrainings?.length! > 0 && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">Completed Trainings</p>
                <div className="space-y-2">
                  {completedTrainings?.slice(0, 3).map((ut: any) => (
                    <div key={ut.id} className="flex items-center gap-2 text-sm">
                      <Award className="h-4 w-4 text-secondary" />
                      <span className="flex-1">{ut.training.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(ut.completed_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skills Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Skills Development</CardTitle>
            <CardDescription>Track your skill growth over time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {skills.map((skill) => (
              <div key={skill.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{skill.name}</span>
                  <Badge variant="secondary">{skill.level}</Badge>
                </div>
                <Progress value={skill.progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {skill.progress}% complete
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
            <CardDescription>Your earned badges and milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.name}
                  className="flex items-center gap-4 p-3 rounded-lg border"
                >
                  <div className="text-3xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium">{achievement.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(achievement.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Your activity summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-chart-3" />
                  <span className="text-sm font-medium">This Week</span>
                </div>
                <p className="text-2xl font-bold">+45 pts</p>
                <p className="text-xs text-muted-foreground mt-1">
                  12% increase
                </p>
              </div>

              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Streak</span>
                </div>
                <p className="text-2xl font-bold">7 days</p>
                <p className="text-xs text-muted-foreground mt-1">Keep it up!</p>
              </div>

              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="h-5 w-5 text-secondary" />
                  <span className="text-sm font-medium">Trainings</span>
                </div>
                <p className="text-2xl font-bold">{completedTrainings?.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Completed</p>
              </div>

              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-chart-4" />
                  <span className="text-sm font-medium">Rank</span>
                </div>
                <p className="text-2xl font-bold">Top 15%</p>
                <p className="text-xs text-muted-foreground mt-1">In company</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPIs Demo */}
      <div className="mt-6">
        <KPIsDemo />
      </div>
    </>
  )
}
