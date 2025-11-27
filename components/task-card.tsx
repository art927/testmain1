"use client"

import { cn } from "@/lib/utils"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Trophy } from "lucide-react"

interface TaskCardProps {
  task: {
    id: string
    title: string
    description: string
    points_reward: number
    status: string
    created_at: string
    completed_at?: string
  }
  userId: string
  action: "assign" | "complete" | "view"
}

export function TaskCard({ task, userId, action }: TaskCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleAssign = async () => {
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          status: "assigned",
          assigned_to: userId,
        })
        .eq("id", task.id)

      if (error) throw error

      toast({
        title: "Task assigned!",
        description: `You've been assigned "${task.title}". Complete it to earn ${task.points_reward} points.`,
      })

      router.refresh()
    } catch (error) {
      console.error("[v0] Task assignment error:", error)
      toast({
        title: "Assignment failed",
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
      // Update task status
      const { error: taskError } = await supabase
        .from("tasks")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", task.id)

      if (taskError) throw taskError

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
        .update({ points: (profile.points || 0) + task.points_reward })
        .eq("id", userId)

      if (pointsError) throw pointsError

      // Add to points history
      await supabase.from("points_history").insert({
        user_id: userId,
        points_change: task.points_reward,
        reason: `Completed task: ${task.title}`,
      })

      toast({
        title: "Task completed!",
        description: `You've earned ${task.points_reward} points for completing "${task.title}".`,
      })

      router.refresh()
    } catch (error) {
      console.error("[v0] Task completion error:", error)
      toast({
        title: "Completion failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="flex flex-col transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge
            variant={task.status === "completed" ? "default" : task.status === "assigned" ? "secondary" : "outline"}
            className={cn(
              task.status === "completed" && "bg-green-500 hover:bg-green-600",
              task.status === "assigned" && "bg-blue-500 hover:bg-blue-600",
            )}
          >
            {task.status}
          </Badge>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full">
            <Trophy className="h-4 w-4" />
            <span className="font-bold text-sm">{task.points_reward}</span>
          </div>
        </div>
        <CardTitle className="text-balance">{task.title}</CardTitle>
        <CardDescription className="text-pretty">{task.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-xs text-muted-foreground">
          {task.status === "completed" && task.completed_at
            ? `Completed ${new Date(task.completed_at).toLocaleDateString()}`
            : `Posted ${new Date(task.created_at).toLocaleDateString()}`}
        </p>
      </CardContent>
      <CardFooter>
        {action === "assign" && (
          <Button onClick={handleAssign} disabled={isLoading} className="w-full bg-primary hover:bg-primary/90">
            {isLoading ? "Assigning..." : "Self-Assign Task"}
          </Button>
        )}
        {action === "complete" && (
          <Button onClick={handleComplete} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700">
            {isLoading ? "Completing..." : "Mark as Complete"}
          </Button>
        )}
        {action === "view" && (
          <Button variant="secondary" disabled className="w-full">
            Completed
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
