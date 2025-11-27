"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Users, Sparkles, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CreateTeamPage() {
  const [teamName, setTeamName] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    console.log("[v0] Starting team creation process...")

    try {
      const supabase = createClient()

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error("[v0] Error getting user:", userError)
        throw new Error("Authentication error. Please log in again.")
      }

      if (!user) {
        console.error("[v0] No user found")
        throw new Error("You must be logged in to create a team")
      }

      console.log("[v0] User authenticated:", user.id)

      // Generate unique invite code
      const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase()
      console.log("[v0] Generated invite code:", inviteCode)

      // Step 1: Create team
      console.log("[v0] Creating team...")
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .insert({
          name: teamName,
          description: description,
          created_by: user.id,
          invite_code: inviteCode,
        })
        .select()
        .single()

      if (teamError) {
        console.error("[v0] Team creation error:", teamError)
        throw new Error(`Failed to create team: ${teamError.message}`)
      }

      if (!team) {
        throw new Error("Team was not created properly")
      }

      console.log("[v0] Team created successfully:", team.id)

      // Step 2: Add creator as team owner
      console.log("[v0] Adding creator as team owner...")
      const { error: memberError } = await supabase.from("team_members").insert({
        team_id: team.id,
        user_id: user.id,
        role: "owner",
      })

      if (memberError) {
        console.error("[v0] Team member insert error:", memberError)
        // Try to clean up the team if member insert fails
        await supabase.from("teams").delete().eq("id", team.id)
        throw new Error(`Failed to add you as team owner: ${memberError.message}`)
      }

      console.log("[v0] Team member added successfully")

      // Step 3: Update user profile with team_id
      console.log("[v0] Updating user profile...")
      const { error: profileError } = await supabase.from("profiles").update({ team_id: team.id }).eq("id", user.id)

      if (profileError) {
        console.error("[v0] Profile update error:", profileError)
        // Continue anyway - this is not critical
        console.warn("[v0] Profile update failed but continuing...")
      } else {
        console.log("[v0] Profile updated successfully")
      }

      toast({
        title: "Team Created Successfully!",
        description: `${teamName} is ready. You can now invite team members using code: ${inviteCode}`,
      })

      console.log("[v0] Redirecting to manager dashboard...")
      router.push("/manager")
      router.refresh()
    } catch (error) {
      console.error("[v0] Team creation failed:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create team"
      setError(errorMessage)
      toast({
        title: "Error Creating Team",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="w-full max-w-md">
        <Card className="border-2">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/20 rounded-full">
                <Users className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Create Your Team</CardTitle>
            <CardDescription className="text-center">
              Set up your team to start inviting members and tracking progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  placeholder="Engineering Team"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Tell us about your team..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="bg-secondary/10 p-3 rounded-lg flex items-start gap-2">
                <Sparkles className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  After creating your team, you'll receive a unique invite code to share with team members.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Team..." : "Create Team"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
