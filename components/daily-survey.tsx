"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { MessageSquare, TrendingUp, Users, CheckCircle, BarChart3, Smile, Meh, Frown } from "lucide-react"

const engagementData = [
  { day: "Mon", score: 4.2 },
  { day: "Tue", score: 4.5 },
  { day: "Wed", score: 3.8 },
  { day: "Thu", score: 4.1 },
  { day: "Fri", score: 4.7 },
]

const moodData = [
  { name: "Very Motivated", value: 35, color: "#28A745" },
  { name: "Motivated", value: 40, color: "#007BFF" },
  { name: "Neutral", value: 20, color: "#6C757D" },
  { name: "Low Energy", value: 5, color: "#FFC107" },
]

export default function DailySurvey({ user }: { user: any }) {
  const [motivation, setMotivation] = useState("")
  const [workload, setWorkload] = useState("")
  const [feedback, setFeedback] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!motivation || !workload) return

    // Award points
    const auth = JSON.parse(localStorage.getItem("teampulse-auth") || "{}")
    auth.points = (auth.points || 0) + 5
    localStorage.setItem("teampulse-auth", JSON.stringify(auth))

    setIsSubmitted(true)
    toast({
      title: "Survey Completed! 🎉",
      description: "Thank you for your feedback. You earned 5 points!",
    })
  }

  if (isSubmitted) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Daily Survey</h1>
          <p className="text-muted-foreground">Thank you for completing today's engagement survey!</p>
        </div>

        <Card className="bg-gradient-to-r from-secondary/10 to-secondary/5 border-secondary/20">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-secondary mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Survey Complete!</h2>
            <p className="text-muted-foreground mb-4">
              Your feedback helps us improve the workplace experience for everyone.
            </p>
            <div className="flex items-center justify-center space-x-2 text-secondary">
              <span className="text-lg font-bold">+5 points earned</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex space-x-4">
          <Button onClick={() => setShowResults(!showResults)} variant="outline" className="flex-1">
            <BarChart3 className="h-4 w-4 mr-2" />
            {showResults ? "Hide" : "View"} Team Results
          </Button>
          <Button onClick={() => setIsSubmitted(false)} variant="outline" className="flex-1">
            Take Another Survey
          </Button>
        </div>

        {showResults && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Weekly Engagement Trend</span>
                </CardTitle>
                <CardDescription>Average team engagement score (1-5 scale)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="day" />
                    <YAxis domain={[0, 5]} />
                    <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 text-center">
                  <p className="text-2xl font-bold text-secondary">4.2/5</p>
                  <p className="text-sm text-muted-foreground">Average team engagement</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Team Motivation Distribution</span>
                </CardTitle>
                <CardDescription>How the team is feeling today</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={moodData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value">
                      {moodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {moodData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Daily Survey</h1>
        <p className="text-muted-foreground">Help us understand your engagement and earn points for your feedback.</p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Today's Engagement Check-in</span>
          </CardTitle>
          <CardDescription>Your responses are anonymous and help improve our workplace culture.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Motivation question */}
            <div className="space-y-3">
              <Label className="text-base font-medium">How motivated are you feeling today?</Label>
              <RadioGroup value={motivation} onValueChange={setMotivation}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="5" id="motivation-5" />
                  <Label htmlFor="motivation-5" className="flex items-center space-x-2 cursor-pointer">
                    <Smile className="h-4 w-4 text-secondary" />
                    <span>Very motivated (5)</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="4" id="motivation-4" />
                  <Label htmlFor="motivation-4" className="cursor-pointer">
                    Motivated (4)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="motivation-3" />
                  <Label htmlFor="motivation-3" className="flex items-center space-x-2 cursor-pointer">
                    <Meh className="h-4 w-4 text-muted-foreground" />
                    <span>Neutral (3)</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2" id="motivation-2" />
                  <Label htmlFor="motivation-2" className="cursor-pointer">
                    Low energy (2)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="motivation-1" />
                  <Label htmlFor="motivation-1" className="flex items-center space-x-2 cursor-pointer">
                    <Frown className="h-4 w-4 text-destructive" />
                    <span>Very low (1)</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Workload question */}
            <div className="space-y-3">
              <Label className="text-base font-medium">How would you rate your current workload?</Label>
              <RadioGroup value={workload} onValueChange={setWorkload}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="workload-light" />
                  <Label htmlFor="workload-light" className="cursor-pointer">
                    Light - I have capacity for more
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="balanced" id="workload-balanced" />
                  <Label htmlFor="workload-balanced" className="cursor-pointer">
                    Balanced - Just right
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="heavy" id="workload-heavy" />
                  <Label htmlFor="workload-heavy" className="cursor-pointer">
                    Heavy - Feeling stretched
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="overwhelming" id="workload-overwhelming" />
                  <Label htmlFor="workload-overwhelming" className="cursor-pointer">
                    Overwhelming - Need support
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Feedback question */}
            <div className="space-y-3">
              <Label htmlFor="feedback" className="text-base font-medium">
                Any feedback or suggestions? (Optional)
              </Label>
              <Textarea
                id="feedback"
                placeholder="Share any thoughts about your work experience, team dynamics, or suggestions for improvement..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="bg-input min-h-[100px]"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-secondary hover:bg-secondary/90"
              disabled={!motivation || !workload}
            >
              Submit Survey (+5 points)
            </Button>
          </form>

          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Privacy Note:</strong> Individual responses are kept confidential. Only aggregated, anonymous
              data is shared with management.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
