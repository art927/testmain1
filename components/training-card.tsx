"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, GraduationCap, X } from "lucide-react"

interface TrainingCardProps {
  training: {
    id: string
    title: string
    description: string
    category: string
    difficulty: string
    created_at: string
  }
  userTraining?: {
    id: string
    status: string
    progress_percent: number
    started_at: string
    completed_at?: string
  }
  userId: string
  action: "enroll" | "continue" | "view"
}

export function TrainingCard({ training, userTraining, userId, action }: TrainingCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleEnroll = async () => {
    setIsLoading(true)

    try {
      const { error } = await supabase.from("user_trainings").insert({
        training_id: training.id,
        user_id: userId,
        status: "in_progress",
        progress_percent: 0,
        started_at: new Date().toISOString(),
      })

      if (error) throw error

      toast({
        title: "Enrolled successfully!",
        description: `You've enrolled in "${training.title}". Start learning now!`,
      })

      router.refresh()
    } catch (error) {
      console.error("[v0] Training enrollment error:", error)
      toast({
        title: "Enrollment failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)

    try {
      // Update training status
      const { error: trainingError } = await supabase
        .from("user_trainings")
        .update({
          status: "completed",
          progress_percent: 100,
          completed_at: new Date().toISOString(),
        })
        .eq("id", userTraining?.id)

      if (trainingError) throw trainingError

      // Award points (50 points per training)
      const pointsReward = 50

      // Get current user points
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("points")
        .eq("id", userId)
        .single()

      if (profileError) throw profileError

      // Update user points
      const { error: pointsError } = await supabase
        .from("profiles")
        .update({ points: (profile.points || 0) + pointsReward })
        .eq("id", userId)

      if (pointsError) throw pointsError

      // Add to points history
      await supabase.from("points_history").insert({
        user_id: userId,
        points_change: pointsReward,
        reason: `Completed training: ${training.title}`,
      })

      toast({
        title: "Training completed!",
        description: `You've earned ${pointsReward} points for completing "${training.title}".`,
      })

      router.refresh()
    } catch (error) {
      console.error("[v0] Training completion error:", error)
      toast({
        title: "Completion failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnenroll = async () => {
    setIsLoading(true)

    try {
      const { error } = await supabase.from("user_trainings").delete().eq("id", userTraining?.id)

      if (error) throw error

      toast({
        title: "Unenrolled successfully",
        description: `You've been removed from "${training.title}".`,
      })

      router.refresh()
    } catch (error) {
      console.error("[v0] Training unenrollment error:", error)
      toast({
        title: "Unenrollment failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "intermediate":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "advanced":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-muted"
    }
  }

  return (
    <Card className="hover-lift flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant="outline" className={getDifficultyColor(training.difficulty)}>
            {training.difficulty}
          </Badge>
          <Badge variant="secondary">{training.category}</Badge>
        </div>
        <CardTitle className="text-balance flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          {training.title}
        </CardTitle>
        <CardDescription className="text-pretty">{training.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {userTraining && userTraining.status === "in_progress" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{userTraining.progress_percent}%</span>
            </div>
            <Progress value={userTraining.progress_percent} className="h-2" />
          </div>
        )}
        {userTraining && userTraining.status === "completed" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-secondary" />
            <span>Completed {new Date(userTraining.completed_at!).toLocaleDateString()}</span>
          </div>
        )}
        {!userTraining && (
          <p className="text-xs text-muted-foreground">Posted {new Date(training.created_at).toLocaleDateString()}</p>
        )}
      </CardContent>
      <CardFooter>
        {action === "enroll" && (
          <Button onClick={handleEnroll} disabled={isLoading} className="w-full">
            {isLoading ? "Enrolling..." : "Enroll in Training"}
          </Button>
        )}
        {action === "continue" && (
          <div className="flex gap-2 w-full">
            <Button onClick={handleComplete} disabled={isLoading} className="flex-1">
              {isLoading ? "Completing..." : "Mark as Complete"}
            </Button>
            <Button
              onClick={handleUnenroll}
              disabled={isLoading}
              variant="outline"
              size="icon"
              className="shrink-0 bg-transparent"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        {action === "view" && (
          <Button variant="secondary" disabled className="w-full">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Completed
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
