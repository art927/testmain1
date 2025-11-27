import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SurveyForm } from "@/components/survey-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, TrendingUp, Calendar, CheckCircle } from "lucide-react"

export default async function SurveyPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Check if user has already submitted survey today
  const today = new Date().toISOString().split("T")[0]
  const { data: todaySurvey } = await supabase
    .from("daily_surveys")
    .select("*")
    .eq("user_id", user.id)
    .eq("survey_date", today)
    .maybeSingle()

  // Fetch recent surveys for history
  const { data: recentSurveys } = await supabase
    .from("daily_surveys")
    .select("*")
    .eq("user_id", user.id)
    .order("survey_date", { ascending: false })
    .limit(7)

  const streak = recentSurveys?.length || 0

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Daily Wellness Check-In</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold">How are you feeling today?</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Take a moment to reflect on your emotional state and earn 5 points
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {todaySurvey ? (
            <Card className="border-2">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Check-In Complete!</CardTitle>
                    <CardDescription>You've already completed today's survey</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-background/50 flex items-center justify-center">
                      <span className="text-4xl">
                        {todaySurvey.mood === "happy" && "😊"}
                        {todaySurvey.mood === "neutral" && "😐"}
                        {todaySurvey.mood === "stressed" && "😰"}
                        {todaySurvey.mood === "tired" && "😴"}
                        {todaySurvey.mood === "energized" && "⚡"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xl font-semibold capitalize">{todaySurvey.mood}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Productivity Level: {todaySurvey.productivity_level}/5
                      </p>
                    </div>
                  </div>
                  {todaySurvey.notes && (
                    <div className="p-4 bg-background/50 rounded-xl">
                      <p className="text-sm text-muted-foreground italic">"{todaySurvey.notes}"</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl border border-green-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-green-500" />
                    </div>
                    <span className="font-semibold text-lg">Points Earned</span>
                  </div>
                  <span className="text-3xl font-bold text-green-500">+5</span>
                </div>
                <p className="text-center text-muted-foreground">Come back tomorrow for your next check-in!</p>
              </CardContent>
            </Card>
          ) : (
            <SurveyForm userId={user.id} />
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-xl">Your Streak</CardTitle>
                <div className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold">
                  {streak} {streak === 1 ? "day" : "days"}
                </div>
              </div>
              <CardDescription>Keep the momentum going!</CardDescription>
            </CardHeader>
            <CardContent>
              {recentSurveys && recentSurveys.length > 0 ? (
                <div className="space-y-3">
                  {recentSurveys.map((survey) => (
                    <div
                      key={survey.id}
                      className="flex items-center justify-between p-4 rounded-xl border-2 hover:border-primary/50 transition-all hover:shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                          <span className="text-2xl">
                            {survey.mood === "happy" && "😊"}
                            {survey.mood === "neutral" && "😐"}
                            {survey.mood === "stressed" && "😰"}
                            {survey.mood === "tired" && "😴"}
                            {survey.mood === "energized" && "⚡"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium capitalize">{survey.mood}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(survey.survey_date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10">
                        <span className="text-sm font-bold text-primary">+{survey.points_earned}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium mb-1">No check-ins yet</p>
                  <p className="text-sm text-muted-foreground">Start your streak today!</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 mx-auto flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold mb-1">{streak}</p>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {streak === 0 && "Start your wellness journey today!"}
                  {streak > 0 && streak < 7 && "Great start! Keep it going!"}
                  {streak >= 7 && streak < 30 && "Amazing consistency!"}
                  {streak >= 30 && "You're a wellness champion!"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
