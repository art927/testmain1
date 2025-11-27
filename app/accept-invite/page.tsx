"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, Loader2, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function AcceptInvitePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const code = searchParams.get("code")

  const [teamName, setTeamName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isAccepting, setIsAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsAccount, setNeedsAccount] = useState(false)
  const [accepted, setAccepted] = useState(false)

  // For new account creation
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")

  useEffect(() => {
    const verifyInvite = async () => {
      if (!code) {
        setError("Invalid invitation link")
        setIsLoading(false)
        return
      }

      try {
        const supabase = createClient()

        // Check if user is logged in
        const {
          data: { user },
        } = await supabase.auth.getUser()

        // Get team info from invite code
        const { data: team, error: teamError } = await supabase
          .from("teams")
          .select("id, name")
          .eq("invite_code", code)
          .single()

        if (teamError || !team) {
          setError("Invalid or expired invitation")
          setIsLoading(false)
          return
        }

        setTeamName(team.name)

        if (!user) {
          setNeedsAccount(true)
        }

        setIsLoading(false)
      } catch (err) {
        setError("Failed to verify invitation")
        setIsLoading(false)
      }
    }

    verifyInvite()
  }, [code])

  const handleAcceptInvite = async () => {
    setIsAccepting(true)
    setError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Please log in first")

      // Get team from invite code
      const { data: team } = await supabase.from("teams").select("id").eq("invite_code", code).single()

      if (!team) throw new Error("Invalid invitation")

      // Update user profile with team_id
      const { error: profileError } = await supabase.from("profiles").update({ team_id: team.id }).eq("id", user.id)

      if (profileError) throw profileError

      // Add user as team member
      const { error: memberError } = await supabase.from("team_members").insert({
        team_id: team.id,
        user_id: user.id,
        role: "member",
      })

      if (memberError) throw memberError

      setAccepted(true)
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept invitation")
    } finally {
      setIsAccepting(false)
    }
  }

  const handleCreateAccountAndAccept = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAccepting(true)
    setError(null)

    try {
      const supabase = createClient()

      // Create account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: "employee",
          },
        },
      })

      if (authError) throw authError
      if (!authData.user) throw new Error("Failed to create account")

      // Get team from invite code
      const { data: team } = await supabase.from("teams").select("id").eq("invite_code", code).single()

      if (!team) throw new Error("Invalid invitation")

      // Create profile with team
      await supabase.from("profiles").insert({
        id: authData.user.id,
        email: email,
        full_name: fullName,
        role: "employee",
        team_id: team.id,
        points: 10,
      })

      // Add as team member
      await supabase.from("team_members").insert({
        team_id: team.id,
        user_id: authData.user.id,
        role: "member",
      })

      setAccepted(true)
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept invitation")
    } finally {
      setIsAccepting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (accepted) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <Card className="w-full max-w-md border-2">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-secondary/20 rounded-full">
                <CheckCircle2 className="h-8 w-8 text-secondary" />
              </div>
            </div>
            <CardTitle>Welcome to {teamName}!</CardTitle>
            <CardDescription>Redirecting to your dashboard...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <Card className="w-full max-w-md border-2">
          <CardHeader>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/auth/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (needsAccount) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <Card className="w-full max-w-md border-2">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/20 rounded-full">
                <Users className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle>Join {teamName}</CardTitle>
            <CardDescription>Create your account to join the team</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAccountAndAccept} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isAccepting}>
                {isAccepting ? "Creating Account..." : "Create Account & Join Team"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <Card className="w-full max-w-md border-2">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/20 rounded-full">
              <Users className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle>Join {teamName}</CardTitle>
          <CardDescription>You've been invited to join this team</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleAcceptInvite} className="w-full" disabled={isAccepting}>
            {isAccepting ? "Accepting..." : "Accept Invitation"}
          </Button>
          <Button asChild variant="outline" className="w-full bg-transparent">
            <Link href="/auth/login">I already have an account</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
