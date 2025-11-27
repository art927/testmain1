"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

const managerSuggestions = [
  "Encourage peer recognition to boost team morale and engagement.",
  "Schedule quick 1:1 sessions with team members showing low sentiment scores.",
  "Celebrate weekly wins in team meetings to maintain motivation.",
  "Review task completion rates and adjust workload distribution if needed.",
  "Send personalized recognition to team members who consistently perform well.",
  "Create opportunities for skill development through training assignments.",
  "Monitor survey trends to identify potential burnout early.",
  "Foster a culture of appreciation by leading with recognition examples.",
]

const employeeSuggestions = [
  "Take a moment to recognize a colleague's great work today.",
  "Complete your daily survey to track your wellness journey.",
  "Explore available trainings to expand your skills.",
  "Set a personal goal for this week and track your progress.",
  "Celebrate small wins - they add up to big achievements!",
  "Connect with teammates through recognition messages.",
  "Take breaks throughout the day to maintain productivity.",
  "Review your points history to see how far you've come.",
]

export function AIWidget({ role }: { role: "manager" | "employee" }) {
  const [suggestion, setSuggestion] = useState("")
  const suggestions = role === "manager" ? managerSuggestions : employeeSuggestions

  const getRandomSuggestion = () => {
    const randomIndex = Math.floor(Math.random() * suggestions.length)
    setSuggestion(suggestions[randomIndex])
  }

  useEffect(() => {
    getRandomSuggestion()
  }, [])

  return (
    <Card className="border-2 border-secondary/20 bg-gradient-to-br from-secondary/5 to-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-secondary" />
          AI Insight
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">{suggestion}</p>
        <Button variant="ghost" size="sm" onClick={getRandomSuggestion} className="w-full gap-2">
          <RefreshCw className="h-3 w-3" />
          Get Another Tip
        </Button>
      </CardContent>
    </Card>
  )
}
