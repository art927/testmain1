"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Trophy, TrendingUp, Users, Zap, Star, Gift, Target, MessageSquare, Plus, Sparkles } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

const weeklyData = [
  { day: "Mon", points: 12 },
  { day: "Tue", points: 19 },
  { day: "Wed", points: 8 },
  { day: "Thu", points: 25 },
  { day: "Fri", points: 15 },
  { day: "Sat", points: 5 },
  { day: "Sun", points: 3 },
]

const recentActivities = [
  { type: "points", message: "Earned 15 points for completing project milestone", time: "2 hours ago", icon: Trophy },
  { type: "recognition", message: "Received kudos from Sarah for excellent teamwork", time: "4 hours ago", icon: Star },
  {
    type: "ai",
    message: "AI detected exceptional performance - bonus points available!",
    time: "6 hours ago",
    icon: Sparkles,
  },
  { type: "survey", message: "Completed daily engagement survey (+5 points)", time: "1 day ago", icon: MessageSquare },
]

export default function DashboardOverview({ user }: { user: any }) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [aiInsight, setAiInsight] = useState("")

  useEffect(() => {
    // Simulate AI insight generation
    const insights = [
      "Your productivity is 23% higher this week! Keep up the great work.",
      "You're close to reaching the 'Team Player' milestone. Complete 2 more collaborative tasks!",
      "Based on your activity, you might enjoy the 'Innovation Challenge' starting Monday.",
      "Your engagement score is in the top 15% of your department. Excellent!",
    ]
    setAiInsight(insights[Math.floor(Math.random() * insights.length)])
  }, [])

  const triggerConfetti = () => {
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 1000)
  }

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {user.name}! 👋</h1>
        <p className="text-muted-foreground">Here's what's happening with your engagement today.</p>
      </div>

      {/* AI Insight Banner */}
      <Card className="border-secondary/20 bg-gradient-to-r from-secondary/5 to-secondary/10">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="bg-secondary/20 rounded-full p-2">
              <Sparkles className="h-5 w-5 text-secondary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">AI Insight</h3>
              <p className="text-sm text-muted-foreground">{aiInsight}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Trophy className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{user.points}</div>
            <p className="text-xs text-muted-foreground">+23 from last week</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Level</CardTitle>
            <Star className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{user.level}</div>
            <p className="text-xs text-muted-foreground">50 points to next level</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Rank</CardTitle>
            <TrendingUp className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">#7</div>
            <p className="text-xs text-muted-foreground">Out of 42 team members</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kudos Received</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">12</div>
            <p className="text-xs text-muted-foreground">+3 this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly activity chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart className="h-5 w-5" />
              <span>Weekly Activity</span>
            </CardTitle>
            <CardDescription>Points earned over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="day" />
                <YAxis />
                <Bar dataKey="points" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              onClick={triggerConfetti}
            >
              <Plus className="h-4 w-4 mr-2" />
              Log Task Completion
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Gift className="h-4 w-4 mr-2" />
              Browse Rewards
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Users className="h-4 w-4 mr-2" />
              Send Kudos
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <MessageSquare className="h-4 w-4 mr-2" />
              Daily Survey
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Progress and recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Current Goals</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Quarterly Tasks</span>
                <span>7/10</span>
              </div>
              <Progress value={70} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Team Collaboration</span>
                <span>4/5</span>
              </div>
              <Progress value={80} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Learning Modules</span>
                <span>2/6</span>
              </div>
              <Progress value={33} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div
                    className={`rounded-full p-1.5 ${
                      activity.type === "points"
                        ? "bg-secondary/20"
                        : activity.type === "recognition"
                          ? "bg-primary/20"
                          : activity.type === "ai"
                            ? "bg-secondary/20"
                            : "bg-muted"
                    }`}
                  >
                    <activity.icon
                      className={`h-3 w-3 ${
                        activity.type === "points"
                          ? "text-secondary"
                          : activity.type === "recognition"
                            ? "text-primary"
                            : activity.type === "ai"
                              ? "text-secondary"
                              : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm text-foreground">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confetti animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-secondary rounded confetti-animation"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
