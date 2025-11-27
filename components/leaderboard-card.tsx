import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface LeaderboardCardProps {
  leaderboard: Array<{
    id: string
    full_name: string | null
    email: string
    points: number
  }>
  currentUserId: string
}

export function LeaderboardCard({ leaderboard, currentUserId }: LeaderboardCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
        <CardDescription>Top performers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.slice(0, 5).map((user, index) => (
            <div
              key={user.id}
              className={`flex items-center gap-3 p-2 rounded-lg ${
                user.id === currentUserId ? "bg-primary/10 border border-primary/20" : ""
              }`}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-bold">
                {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.full_name || user.email}
                  {user.id === currentUserId && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      You
                    </Badge>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold">{user.points}</span>
                <span className="text-sm">⭐</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
