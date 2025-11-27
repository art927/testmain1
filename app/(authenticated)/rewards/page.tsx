import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Trophy, Gift, Sparkles } from "lucide-react"

export default async function RewardsPage() {
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

  // Fetch all rewards
  const { data: rewards } = await supabase
    .from("rewards")
    .select("*")
    .eq("available", true)
    .order("points_cost", { ascending: true })

  const userPoints = profile?.points || 0
  const availableRewards = rewards?.length || 0

  return (
    <div className="space-y-6">
      {/* Points Balance Card */}
      <Card className="border-none bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm font-medium opacity-90">Your Points Balance</p>
            <div className="mt-2 flex items-baseline gap-2">
              <Trophy className="h-8 w-8" />
              <span className="text-4xl font-bold">{userPoints}</span>
            </div>
            <p className="mt-2 text-sm opacity-90">Rank: Top 15% in company</p>
          </div>
          <Trophy className="h-24 w-24 opacity-20" />
        </CardContent>
      </Card>

      {/* Earn Points Section */}
      <Card>
        <CardHeader>
          <CardTitle>Earn Points</CardTitle>
          <CardDescription>Task Description</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="task-description">
              Describe the task you completed (e.g., Helped onboard new team member, Fixed critical bug, Led client
              presentation)
            </Label>
            <Textarea id="task-description" placeholder="Enter task description..." className="mt-2 min-h-[100px]" />
          </div>
          <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
            Submit Task & Earn Points
          </Button>
        </CardContent>
      </Card>

      {/* Rewards Catalog */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Rewards Catalog</h2>
        <p className="text-sm text-muted-foreground">{availableRewards} available</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rewards?.map((reward) => {
          const canAfford = userPoints >= reward.points_cost
          const needMore = canAfford ? 0 : reward.points_cost - userPoints

          return (
            <Card key={reward.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="mb-4 flex h-20 items-center justify-center rounded-lg bg-muted">
                  <span className="text-4xl">
                    {reward.icon || <Gift className="h-12 w-12 text-muted-foreground" />}
                  </span>
                </div>
                <h3 className="font-semibold">{reward.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{reward.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">{reward.points_cost} pts</span>
                  {canAfford ? (
                    <Button size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                      Redeem
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" disabled>
                      Need {needMore} more
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* AI Recommendation */}
      <Card className="border-secondary/20 bg-secondary/5">
        <CardContent className="flex items-start gap-3 p-4">
          <Sparkles className="h-5 w-5 text-secondary" />
          <div>
            <p className="font-medium text-secondary">AI Recommendation</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Based on your preferences (coffee lover detected from past redemptions), we recommend the{" "}
              <span className="font-semibold text-foreground">Starbucks Card</span> You're only 5 tasks away!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
