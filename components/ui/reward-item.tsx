"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Reward {
  id: string
  name: string
  description?: string
  points_cost: number
  image?: string
  svgMarkup?: string
}

interface RewardItemCardProps {
  reward: Reward
  userPoints: number
  onRedeem?: (rewardId: string) => Promise<void> | void
}

export default function RewardItemCard({ reward, userPoints, onRedeem }: RewardItemCardProps) {
  const canAfford = (userPoints ?? 0) >= reward.points_cost

  return (
    <Card className="max-w-sm w-full rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="flex items-center gap-4 p-4">
        {/* image / badge */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
            {reward.svgMarkup ? (
              // render provided SVG markup (paste your raw <svg>...</svg> into svgMarkup)
              <div
                className="w-12 h-12"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: reward.svgMarkup }}
              />
            ) : reward.image ? (
              <img src={reward.image} alt={reward.name} className="w-12 h-12 object-contain" />
            ) : (
              <div className="text-white font-semibold text-lg">{reward.name?.charAt(0) ?? "R"}</div>
            )}
          </div>
        </div>

        {/* details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold truncate">{reward.name}</h3>
              {reward.description && (
                <p className="text-xs text-muted-foreground mt-1 truncate">{reward.description}</p>
              )}
            </div>

            <div className="text-right">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                  canAfford ? "bg-green-50 text-green-700" : "bg-muted/40 text-muted-foreground"
                }`}
              >
                <span className="font-bold">{reward.points_cost}</span>
                <span className="text-xs">pts</span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge className="text-xs">Reward</Badge>
              <span className="text-xs text-muted-foreground">Available</span>
            </div>

            <div>
              <Button
                size="sm"
                disabled={!canAfford}
                onClick={() => {
                  if (canAfford && onRedeem) onRedeem(reward.id)
                }}
                className={`px-3 py-1 text-sm ${!canAfford ? "opacity-70 pointer-events-none" : ""}`}
              >
                Redeem
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
