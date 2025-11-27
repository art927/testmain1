import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, Send, TrendingUp, Heart } from "lucide-react"
import { RecognitionForm } from "@/components/recognition-form"

export default async function RecognitionPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: allUsers } = await supabase.from("profiles").select("id, full_name, email").neq("id", user.id)

  const { data: sentRecognitions } = await supabase.from("recognitions").select("*").eq("from_user_id", user.id)

  const { data: receivedRecognitions } = await supabase
    .from("recognitions")
    .select(`
      *,
      from_profile:profiles!recognitions_from_user_id_fkey(full_name, email)
    `)
    .eq("to_user_id", user.id)
    .order("created_at", { ascending: false })

  const { data: allRecognitions } = await supabase
    .from("recognitions")
    .select(`
      *,
      from_profile:profiles!recognitions_from_user_id_fkey(full_name, email, avatar_url),
      to_profile:profiles!recognitions_to_user_id_fkey(full_name, email, avatar_url)
    `)
    .order("created_at", { ascending: false })
    .limit(50)

  const validRecognitions = receivedRecognitions?.filter((rec) => rec.from_profile !== null) || []
  const validAllRecognitions =
    allRecognitions?.filter((rec) => rec.from_profile !== null && rec.to_profile !== null) || []

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (email) {
      return email.slice(0, 2).toUpperCase()
    }
    return "?"
  }

  const getRelativeTime = (date: string) => {
    const now = new Date()
    const past = new Date(date)
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

    if (diffInSeconds < 60) return "just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return past.toLocaleDateString()
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Kudos Sent</p>
                <p className="text-3xl font-bold mt-2">{sentRecognitions?.length || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <Send className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Kudos Received</p>
                <p className="text-3xl font-bold mt-2">{validRecognitions.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recognition Rate</p>
                <p className="text-3xl font-bold mt-2">
                  {sentRecognitions && sentRecognitions.length > 0 ? "High" : "Low"}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-chart-3/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {/* Send Recognition Form */}
        <Card>
          <CardHeader>
            <CardTitle>Send Recognition</CardTitle>
            <CardDescription>Recognize a teammate for their great work</CardDescription>
          </CardHeader>
          <CardContent>
            <RecognitionForm users={allUsers || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recognition Feed</CardTitle>
            <CardDescription>Recent kudos from the team</CardDescription>
          </CardHeader>
          <CardContent>
            {validAllRecognitions.length > 0 ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {validAllRecognitions.map((recognition: any) => {
                  const receiverName = recognition.to_profile?.full_name || recognition.to_profile?.email || "Unknown"
                  const senderName =
                    recognition.from_profile?.full_name || recognition.from_profile?.email || "Anonymous"
                  const receiverInitials = getInitials(recognition.to_profile?.full_name, recognition.to_profile?.email)
                  const senderInitials = getInitials(
                    recognition.from_profile?.full_name,
                    recognition.from_profile?.email,
                  )

                  return (
                    <div
                      key={recognition.id}
                      className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold text-sm">
                            {receiverInitials}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Header with receiver name and timestamp */}
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-base">{receiverName}</h4>
                            <span className="text-xs text-muted-foreground">
                              · {getRelativeTime(recognition.created_at)}
                            </span>
                          </div>

                          {/* Recognition message */}
                          <p className="text-sm text-foreground mb-3 leading-relaxed">{recognition.message}</p>

                          {/* Footer with sender info and actions */}
                          <div className="flex items-center gap-4 text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                                {senderInitials}
                              </div>
                              <span className="text-xs">from {senderName}</span>
                            </div>

                            <div className="flex items-center gap-4 ml-auto">
                              <button className="flex items-center gap-1 text-xs hover:text-primary transition-colors">
                                <Heart className="h-4 w-4" />
                              </button>
                              <button className="flex items-center gap-1 text-xs hover:text-primary transition-colors">
                                <Award className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Award className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No recognitions yet</p>
                <p className="text-sm mt-2">Be the first to recognize a teammate!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
