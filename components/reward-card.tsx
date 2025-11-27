"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface RewardCardProps {
  reward: {
    id: string
    name: string
    description: string
    points_cost: number
    icon: string
  }
  userPoints: number
  userId: string
}

export function RewardCard({ reward, userPoints, userId }: RewardCardProps) {
  const [isRedeeming, setIsRedeeming] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const canAfford = userPoints >= reward.points_cost

  const handleRedeem = async () => {
    if (!canAfford) {
      toast({
        title: "Insufficient points",
        description: `You need ${reward.points_cost - userPoints} more points to redeem this reward.`,
        variant: "destructive",
      })
      return
    }

    setIsRedeeming(true)

    try {
      // Create redemption record
      const { error: redemptionError } = await supabase.from("reward_redemptions").insert({
        user_id: userId,
        reward_id: reward.id,
        points_spent: reward.points_cost,
        status: "pending",
      })

      if (redemptionError) throw redemptionError

      // Update user points
      const { error: pointsError } = await supabase
        .from("profiles")
        .update({ points: userPoints - reward.points_cost })
        .eq("id", userId)

      if (pointsError) throw pointsError

      // Add to points history
      await supabase.from("points_history").insert({
        user_id: userId,
        points_change: -reward.points_cost,
        reason: `Redeemed: ${reward.name}`,
      })

      toast({
        title: "Reward redeemed!",
        description: `You've successfully redeemed ${reward.name}. Check with your manager to claim it.`,
      })

      router.refresh()
    } catch (error) {
      console.error("[v0] Redemption error:", error)
      toast({
        title: "Redemption failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRedeeming(false)
    }
  }

  return (
    <Card className={`hover-lift ${!canAfford ? "opacity-60" : ""}`}>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <span className="text-5xl">{reward.icon}</span>
          <div className="flex items-center gap-1 px-3 py-1 bg-secondary/20 rounded-full">
            <span className="text-xl">⭐</span>
            <span className="font-bold text-lg">{reward.points_cost}</span>
          </div>
        </div>
        <CardTitle>{reward.name}</CardTitle>
        <CardDescription>{reward.description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button
          onClick={handleRedeem}
          disabled={!canAfford || isRedeeming}
          className="w-full"
          variant={canAfford ? "default" : "secondary"}
        >
          {isRedeeming ? "Redeeming..." : canAfford ? "Redeem Now" : "Not Enough Points"}
        </Button>
      </CardFooter>
    </Card>
  )
}
