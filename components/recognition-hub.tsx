"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Heart, Send, Award } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const milestones = [
  {
    id: 1,
    title: "1 Year Anniversary",
    description: "Celebrate your first year with the team",
    points: 50,
    completed: true,
    date: "2024-01-15",
  },
  {
    id: 2,
    title: "Team Player",
    description: "Collaborate on 10 cross-team projects",
    points: 75,
    completed: false,
    progress: 7,
  },
  {
    id: 3,
    title: "Innovation Leader",
    description: "Submit 5 improvement suggestions",
    points: 100,
    completed: false,
    progress: 3,
  },
  {
    id: 4,
    title: "Mentor",
    description: "Help onboard 3 new team members",
    points: 125,
    completed: false,
    progress: 1,
  },
]

export default function RecognitionHub({
  user,
  allUsers,
  kudosSent,
  kudosReceived,
  recognitionFeed,
}: {
  user: any
  allUsers: any[]
  kudosSent: number
  kudosReceived: number
  recognitionFeed: any[]
}) {
  const [selectedRecipient, setSelectedRecipient] = useState("")
  const [kudosMessage, setKudosMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const handleSendKudos = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRecipient || !kudosMessage.trim()) return

    setIsSubmitting(true)

    try {
      const { error } = await supabase.from("recognitions").insert({
        from_user_id: user.id,
        to_user_id: selectedRecipient,
        message: kudosMessage,
      })

      if (error) throw error

      toast({
        title: "Kudos Sent! 🌟",
        description: "Your recognition has been sent successfully",
      })

      setSelectedRecipient("")
      setKudosMessage("")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send kudos. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Recognition Hub</h1>
        <p className="text-muted-foreground">Celebrate achievements and send kudos to your colleagues.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Send Kudos */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-pink-500" />
              <span>Send Kudos</span>
            </CardTitle>
            <CardDescription>Recognize a colleague's great work</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendKudos} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient</Label>
                <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a colleague" />
                  </SelectTrigger>
                  <SelectContent>
                    {allUsers
                      .filter((u) => u.id !== user.id)
                      .map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.full_name || u.email}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Share what made their work exceptional..."
                  value={kudosMessage}
                  onChange={(e) => setKudosMessage(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={!selectedRecipient || !kudosMessage.trim() || isSubmitting}
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? "Sending..." : "Send Kudos"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Your Recognition</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Kudos Received</span>
              <span className="text-2xl font-bold text-pink-500">{kudosReceived}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Kudos Sent</span>
              <span className="text-2xl font-bold text-blue-500">{kudosSent}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recognition Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Recognition Feed</span>
          </CardTitle>
          <CardDescription>Kudos you've received from colleagues</CardDescription>
        </CardHeader>
        <CardContent>
          {recognitionFeed.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No kudos received yet. Keep up the great work!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recognitionFeed
                .filter((item) => item.from_profile !== null)
                .map((item) => (
                  <Card key={item.id} className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-pink-500/10 text-pink-500">
                            {(item.from_profile?.full_name || item.from_profile?.email || "?")
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-semibold text-sm">
                                {item.from_profile?.full_name || item.from_profile?.email}
                              </span>
                              <span className="text-xs text-muted-foreground ml-2">
                                {formatTimestamp(item.created_at)}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-foreground">{item.message}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
