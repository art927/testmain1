"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Trophy, Gift, Plus, Sparkles, Coffee, ShoppingBag, Gamepad2, Car, Plane, Star } from "lucide-react"

const rewards = [
  { id: 1, name: "Starbucks Gift Card", points: 100, icon: Coffee, category: "Food & Drink" },
  { id: 2, name: "Amazon Gift Card", points: 150, icon: ShoppingBag, category: "Shopping" },
  { id: 3, name: "Extra PTO Day", points: 200, icon: Plane, category: "Time Off" },
  { id: 4, name: "Premium Parking Spot", points: 75, icon: Car, category: "Perks" },
  { id: 5, name: "Gaming Console", points: 500, icon: Gamepad2, category: "Electronics" },
  { id: 6, name: "Team Lunch Voucher", points: 120, icon: Coffee, category: "Food & Drink" },
]

export default function PointsRewards({ user }: { user: any }) {
  const [taskDescription, setTaskDescription] = useState("")
  const [userPoints, setUserPoints] = useState(user.points)
  const [showAiBonus, setShowAiBonus] = useState(false)
  const [selectedReward, setSelectedReward] = useState<any>(null)
  const { toast } = useToast()

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskDescription.trim()) return

    const basePoints = Math.floor(Math.random() * 15) + 5 // 5-20 points
    const newPoints = userPoints + basePoints
    setUserPoints(newPoints)

    // Update localStorage
    const auth = JSON.parse(localStorage.getItem("teampulse-auth") || "{}")
    auth.points = newPoints
    localStorage.setItem("teampulse-auth", JSON.stringify(auth))

    // Show AI bonus opportunity
    if (Math.random() > 0.6) {
      setShowAiBonus(true)
    }

    toast({
      title: "Task Completed! 🎉",
      description: `You earned ${basePoints} points for: ${taskDescription}`,
    })

    setTaskDescription("")
  }

  const claimAiBonus = () => {
    const bonusPoints = 10
    const newPoints = userPoints + bonusPoints
    setUserPoints(newPoints)

    const auth = JSON.parse(localStorage.getItem("teampulse-auth") || "{}")
    auth.points = newPoints
    localStorage.setItem("teampulse-auth", JSON.stringify(auth))

    setShowAiBonus(false)
    toast({
      title: "AI Bonus Claimed! ✨",
      description: `Exceptional performance detected! +${bonusPoints} bonus points`,
    })
  }

  const handleRedeem = (reward: any) => {
    if (userPoints >= reward.points) {
      const newPoints = userPoints - reward.points
      setUserPoints(newPoints)

      const auth = JSON.parse(localStorage.getItem("teampulse-auth") || "{}")
      auth.points = newPoints
      localStorage.setItem("teampulse-auth", JSON.stringify(auth))

      toast({
        title: "Reward Redeemed! 🎁",
        description: `You've successfully redeemed ${reward.name}`,
      })
      setSelectedReward(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Points & Rewards</h1>
        <p className="text-muted-foreground">Earn points by completing tasks and redeem them for amazing rewards.</p>
      </div>

      {/* Points balance */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Your Points Balance</h2>
              <div className="flex items-center space-x-2 mt-2">
                <Trophy className="h-8 w-8 text-secondary" />
                <span className="text-4xl font-bold text-foreground">{userPoints}</span>
                <span className="text-lg text-muted-foreground">points</span>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="mb-2">
                Rising Star
              </Badge>
              <p className="text-sm text-muted-foreground">50 points to next level</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Bonus Alert */}
      {showAiBonus && (
        <Card className="border-secondary bg-gradient-to-r from-secondary/10 to-secondary/5 pulse-glow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Sparkles className="h-6 w-6 text-secondary" />
                <div>
                  <h3 className="font-semibold text-foreground">AI Analysis Complete!</h3>
                  <p className="text-sm text-muted-foreground">
                    Exceptional performance detected—earn +10 bonus points!
                  </p>
                </div>
              </div>
              <Button onClick={claimAiBonus} className="bg-secondary hover:bg-secondary/90">
                Claim Bonus
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task logging */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Log Task Completion</span>
            </CardTitle>
            <CardDescription>Describe what you've accomplished to earn points</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="task">Task Description</Label>
                <Input
                  id="task"
                  placeholder="e.g., Completed quarterly report, Fixed critical bug..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="bg-input"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-secondary hover:bg-secondary/90"
                disabled={!taskDescription.trim()}
              >
                Submit & Earn Points
              </Button>
            </form>

            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 <strong>AI Tip:</strong> Detailed descriptions of complex tasks earn more points!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5" />
              <span>AI Recommendations</span>
            </CardTitle>
            <CardDescription>Personalized suggestions based on your preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-secondary/10 rounded-lg border border-secondary/20">
              <div className="flex items-start space-x-2">
                <Coffee className="h-4 w-4 text-secondary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Coffee Lover Detected!</p>
                  <p className="text-xs text-muted-foreground">
                    Based on your activity, we recommend the Starbucks Gift Card
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-start space-x-2">
                <Star className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">High Performer</p>
                  <p className="text-xs text-muted-foreground">You're on track for a 25% bonus this quarter!</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                🎯 <strong>Goal:</strong> Earn 50 more points to unlock premium rewards!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rewards catalog */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gift className="h-5 w-5" />
            <span>Rewards Catalog</span>
          </CardTitle>
          <CardDescription>Redeem your points for these amazing rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward) => (
              <Card key={reward.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <reward.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{reward.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {reward.category}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-secondary">{reward.points} pts</span>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant={userPoints >= reward.points ? "default" : "outline"}
                          disabled={userPoints < reward.points}
                          onClick={() => setSelectedReward(reward)}
                        >
                          {userPoints >= reward.points ? "Redeem" : "Need more"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Redeem {selectedReward?.name}</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to redeem this reward for {selectedReward?.points} points?
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center space-x-4 py-4">
                          <div className="bg-primary/10 rounded-lg p-3">
                            {selectedReward && <selectedReward.icon className="h-8 w-8 text-primary" />}
                          </div>
                          <div>
                            <h3 className="font-semibold">{selectedReward?.name}</h3>
                            <p className="text-sm text-muted-foreground">{selectedReward?.category}</p>
                            <p className="text-lg font-bold text-secondary">{selectedReward?.points} points</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            className="flex-1 bg-transparent"
                            onClick={() => setSelectedReward(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="flex-1 bg-secondary hover:bg-secondary/90"
                            onClick={() => selectedReward && handleRedeem(selectedReward)}
                          >
                            Confirm Redemption
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
