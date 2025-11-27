import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RewardCard } from "@/components/reward-card"
import { LeaderboardCard } from "@/components/leaderboard-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy } from "lucide-react"
import RewardItemCard from "@/components/ui/reward-item"

export default async function PointsPage() {
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

  // Fetch leaderboard (top users by points)
  const { data: leaderboard } = await supabase
    .from("profiles")
    .select("id, full_name, email, points")
    .order("points", { ascending: false })
    .limit(10)

  // Fetch user's redemption history
  const { data: redemptions } = await supabase
    .from("reward_redemptions")
    .select(`
      *,
      reward:rewards(name, icon)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const SVG_MARKUP = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="8" r="3"/><path d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></svg>`

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Points & Rewards</h1>
        <p className="text-muted-foreground">Redeem your points for awesome rewards</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-2 bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader>
            <CardTitle>Your Points Balance</CardTitle>
            <CardDescription>Available points to redeem</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
                <Trophy className="w-10 h-10 text-primary" />
              </div>
              <div>
                <div className="text-5xl font-bold text-primary">{profile?.points || 0}</div>
                <p className="text-muted-foreground mt-1">Total Points</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <LeaderboardCard leaderboard={leaderboard || []} currentUserId={user.id} />
      </div>

      <Tabs defaultValue="rewards" className="space-y-6">
        <TabsList>
          <TabsTrigger value="rewards">Available Rewards</TabsTrigger>
          <TabsTrigger value="history">Redemption History</TabsTrigger>
        </TabsList>

        <TabsContent value="rewards" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rewards?.map((reward) => (
              <RewardCard key={reward.id} reward={reward} userPoints={profile?.points || 0} userId={user.id} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Redemptions</CardTitle>
              <CardDescription>History of rewards you've claimed</CardDescription>
            </CardHeader>
            <CardContent>
              {redemptions && redemptions.length > 0 ? (
                <div className="space-y-4">
                  {redemptions.map((redemption: any) => (
                    <div
                      key={redemption.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{redemption.reward?.icon}</span>
                        <div>
                          <p className="font-medium">{redemption.reward?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(redemption.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-destructive">-{redemption.points_spent} pts</p>
                          <p className="text-xs text-muted-foreground capitalize">{redemption.status}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium">No redemptions yet</p>
                  <p className="text-sm mt-2">Start redeeming rewards to see your history here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="space-y-6">
        <div className="space-y-2">
          {/* Example single reward card (demo) */}
          <div className="max-w-md">
            {/* Replace SVG_PLACEHOLDER below with your actual raw SVG markup (include the <svg> tag) */}
            {/*
              Example:
              const SVG_MARKUP = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">...</svg>`
            */}
            const SVG_MARKUP = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="8" r="3"/><path d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></svg>`

            <RewardItemCard
              reward={
                rewards && rewards.length > 0
                  ? {
                      id: String(rewards[0].id),
                      name: rewards[0].name ?? "Reward",
                      description: rewards[0].description ?? "Redeem this reward",
                      points_cost: rewards[0].points_cost ?? 0,
                      // prefer inline SVG markup if you have one for this reward
                      svgMarkup: /* you can replace this expression with the actual SVG string for that reward */ (rewards[0].icon && rewards[0].icon.endsWith(".svg") ? undefined : undefined),
                      image: rewards[0].icon ?? undefined,
                    }
                  : {
                      id: "demo-1",
                      name: "Starbucks Gift Card",
                      description: "Enjoy a coffee on us",
                      points_cost: 100,
                      svgMarkup: SVG_MARKUP,
                      image: "/images/rewards/starbucks.svg",
                    }
              }
              userPoints={profile?.points ?? 0}
             
            />
          </div>
        </div>
      </div>
    </div>
  )
}
