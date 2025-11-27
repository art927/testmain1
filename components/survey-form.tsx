"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Sparkles, TrendingUp } from "lucide-react"

interface SurveyFormProps {
  userId: string
}

const moods = [
  { value: "happy", label: "Happy", emoji: "😊", color: "from-yellow-500/20 to-orange-500/20 border-yellow-500/30" },
  { value: "neutral", label: "Neutral", emoji: "😐", color: "from-gray-500/20 to-slate-500/20 border-gray-500/30" },
  {
    value: "stressed",
    label: "Stressed",
    emoji: "😰",
    color: "from-red-500/20 to-orange-500/20 border-red-500/30",
  },
  { value: "tired", label: "Tired", emoji: "😴", color: "from-blue-500/20 to-indigo-500/20 border-blue-500/30" },
  {
    value: "energized",
    label: "Energized",
    emoji: "⚡",
    color: "from-green-500/20 to-emerald-500/20 border-green-500/30",
  },
]

export function SurveyForm({ userId }: SurveyFormProps) {
  const [selectedMood, setSelectedMood] = useState<string>("")
  const [productivity, setProductivity] = useState<number>(3)
  const [notes, setNotes] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedMood) {
      toast({
        title: "Please select a mood",
        description: "Let us know how you're feeling today",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Insert survey
      const { error: surveyError } = await supabase.from("daily_surveys").insert({
        user_id: userId,
        mood: selectedMood,
        productivity_level: productivity,
        notes: notes || null,
        points_earned: 5,
        survey_date: new Date().toISOString().split("T")[0],
      })

      if (surveyError) throw surveyError

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
        .update({ points: (profile.points || 0) + 5 })
        .eq("id", userId)

      if (pointsError) throw pointsError

      // Add to points history
      await supabase.from("points_history").insert({
        user_id: userId,
        points_change: 5,
        reason: "Daily check-in completed",
      })

      toast({
        title: "Check-in complete!",
        description: "You've earned 5 points. See you tomorrow!",
      })

      router.refresh()
    } catch (error) {
      console.error("[v0] Survey submission error:", error)
      toast({
        title: "Submission failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-2 shadow-xl">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl">Daily Wellness Check-In</CardTitle>
        <CardDescription className="text-base">Take a moment to reflect on your emotional state</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <Label className="text-lg font-semibold">How are you feeling?</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {moods.map((mood) => (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => setSelectedMood(mood.value)}
                  className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                    selectedMood === mood.value
                      ? `bg-gradient-to-br ${mood.color} scale-105 shadow-lg`
                      : "border-border hover:border-primary/50 bg-card"
                  }`}
                >
                  <span className="text-5xl">{mood.emoji}</span>
                  <span className="text-sm font-semibold">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Expected Productivity
              </Label>
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/30 font-bold text-2xl">
                {productivity}
              </div>
            </div>
            <div className="space-y-3">
              <input
                type="range"
                min="1"
                max="5"
                value={productivity}
                onChange={(e) => setProductivity(Number(e.target.value))}
                className="w-full h-3 bg-muted rounded-full appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-lg"
              />
              <div className="flex justify-between text-sm text-muted-foreground px-1">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label htmlFor="notes" className="text-lg font-semibold">
              Additional Thoughts
              <span className="text-sm font-normal text-muted-foreground ml-2">(Optional)</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="Share any challenges, wins, or thoughts you'd like to reflect on..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              className="resize-none text-base"
            />
          </div>

          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl border-2 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-lg">Complete Your Check-In</p>
                <p className="text-sm text-muted-foreground">Earn points for your wellness</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">+5</div>
              <div className="text-xs text-muted-foreground">points</div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !selectedMood}
            className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            size="lg"
          >
            {isSubmitting ? "Submitting..." : "Submit Check-In"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
