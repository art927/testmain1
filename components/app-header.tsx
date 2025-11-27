"use client"

import type React from "react"
import { useEffect, useState } from "react"

import { Bell } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"

interface AppHeaderProps {
  userName?: string
  userEmail?: string
  points?: number
}

export function AppHeader({ userName, userEmail, points }: AppHeaderProps) {
  const supabase = createClient()

  // initialize from props/localStorage so UI isn't empty on first paint
  const localAuth =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("teampulse-auth") || "{}")
      : {}

  const [resolvedName, setResolvedName] = useState<string>(
    userName || localAuth.full_name || localAuth.name || localAuth.email || "Guest"
  )
  const [resolvedEmail, setResolvedEmail] = useState<string>(
    userEmail || localAuth.email || ""
  )
  const [resolvedPoints, setResolvedPoints] = useState<number>(
    typeof points === "number" ? points : localAuth.points ?? 0
  )

  useEffect(() => {
    let mounted = true

    // try Supabase auth first (async). fall back to local storage already set above.
    async function loadUser() {
      try {
        const { data } = await supabase.auth.getUser()
        const user = data?.user
        if (!mounted || !user) return

        // supabase user may have user.email and user.user_metadata.full_name
        const name =
          (user.user_metadata && (user.user_metadata as any).full_name) ||
          (user.user_metadata && (user.user_metadata as any).name) ||
          user.email ||
          resolvedName

        if (mounted && name) setResolvedName(name)
        if (mounted && user.email) setResolvedEmail(user.email)

        // After we have the authenticated user, try to accept any pending manager invites
        // by calling the server-side endpoint which uses the server service role to add membership.
        // This is safe because the server will validate the userId against server data.
        try {
          const response = await fetch("/api/auth/accept-invite", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: user.id }),
          })
          
          // Only try to parse JSON if response is ok and has content
          if (response.ok && response.status !== 204) {
            await response.json()
          }
          // ignoring the response — UI will show updated team on next reload/navigation
        } catch (e) {
          console.log("[v0] Accept invite error (safe to ignore):", e)
          // ignore network errors
        }

        // keep points from local storage (server stores points separately)
        const local = JSON.parse(localStorage.getItem("teampulse-auth") || "{}")
        if (mounted && local.points != null) setResolvedPoints(local.points)
      } catch (e) {
        // ignore errors, keep fallback values
      }
    }

    loadUser()

    return () => {
      mounted = false
    }
  }, [supabase])

  // update if props change
  useEffect(() => {
    if (userName) setResolvedName(userName)
    if (userEmail) setResolvedEmail(userEmail)
    if (typeof points === "number") setResolvedPoints(points)
  }, [userName, userEmail, points])

  const initials = resolvedName
    ? resolvedName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "G"

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div>
        <h1 className="text-xl font-semibold">Welcome back, {resolvedName}!</h1>
        <p className="text-sm text-muted-foreground">
           Let's make today amazing 🚀
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Points Badge */}
        <Badge className="bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary">
          <Trophy className="mr-2 h-4 w-4" />
          {resolvedPoints} Points
        </Badge>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary"></span>
          </span>
        </Button>

        {/* User Avatar */}
        <Avatar className="h-9 w-9 border-2 border-primary">
          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}

function Trophy(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17a6 6 0 0 0 12 0V2Z" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}
