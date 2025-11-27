import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TrainingCard } from "@/components/training-card"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GraduationCap } from "lucide-react"

export default async function TrainingsPage() {
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

  // Fetch all available trainings
  const { data: allTrainings } = await supabase.from("trainings").select("*").order("created_at", { ascending: false })

  // Fetch user's enrolled trainings
  const { data: userTrainings } = await supabase
    .from("user_trainings")
    .select("*, training:trainings(*)")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })

  // Filter trainings
  const enrolledTrainingIds = new Set(userTrainings?.map((ut) => ut.training_id) || [])
  const availableTrainings = allTrainings?.filter((t) => !enrolledTrainingIds.has(t.id)) || []
  const inProgressTrainings = userTrainings?.filter((ut) => ut.status === "in_progress") || []
  const completedTrainings = userTrainings?.filter((ut) => ut.status === "completed") || []

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/20 rounded-lg">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">Engineering Trainings</h1>
        </div>
        <p className="text-muted-foreground">Self-enroll in courses and track your learning progress</p>
      </div>

      <Tabs defaultValue="available" className="space-y-6">
        <TabsList>
          <TabsTrigger value="available">Available Courses ({availableTrainings.length})</TabsTrigger>
          <TabsTrigger value="enrolled">My Trainings ({inProgressTrainings.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedTrainings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-6">
          {availableTrainings.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {availableTrainings.map((training) => (
                <TrainingCard key={training.id} training={training} userId={user.id} action="enroll" />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <GraduationCap className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No available trainings</p>
                <p className="text-sm mt-2">You've enrolled in all available courses!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="enrolled" className="space-y-6">
          {inProgressTrainings.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {inProgressTrainings.map((ut: any) => (
                <TrainingCard key={ut.id} training={ut.training} userTraining={ut} userId={user.id} action="continue" />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <GraduationCap className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No enrolled trainings</p>
                <p className="text-sm mt-2">Go to Available Courses to start learning</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          {completedTrainings.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {completedTrainings.map((ut: any) => (
                <TrainingCard key={ut.id} training={ut.training} userTraining={ut} userId={user.id} action="view" />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <GraduationCap className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No completed trainings yet</p>
                <p className="text-sm mt-2">Complete trainings to see them here and earn points</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </>
  )
}
