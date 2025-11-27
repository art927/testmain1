"use client"

import React, { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type Team = { id: string; name?: string }
type Person = { id: string; full_name?: string; email?: string }

export default function EmployeeTeamInfo() {
  const [loading, setLoading] = useState(true)
  const [team, setTeam] = useState<Team | null>(null)
  const [manager, setManager] = useState<Person | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const supabase = createClient()

    async function load() {
      try {
        setLoading(true)
        const { data: userData } = await supabase.auth.getUser()
        const user = userData?.user
        if (!user?.id) {
          if (mounted) setError("Not authenticated")
          return
        }

        // Get profile to find team_id
        const { data: profile, error: profileErr } = await supabase
          .from("profiles")
          .select("team_id")
          .eq("id", user.id)
          .maybeSingle()

        if (profileErr) throw profileErr
        const teamId = (profile as any)?.team_id
        if (!teamId) {
          if (mounted) {
            setTeam(null)
            setManager(null)
          }
          return
        }

        // Fetch team info
        const { data: teamData, error: teamErr } = await supabase
          .from("teams")
          .select("id, name")
          .eq("id", teamId)
          .maybeSingle()
        if (teamErr) throw teamErr

        // Fetch manager(s) for the team (role = manager | admin), latest first
        const { data: mgrs, error: mgrErr } = await supabase
          .from("profiles")
          .select("id, full_name, email, role")
          .eq("team_id", teamId)
          .in("role", ["manager", "admin"])
          .order("created_at", { ascending: false })
          .limit(1)
        if (mgrErr) throw mgrErr

        if (mounted) {
          setTeam(teamData ?? { id: teamId })
          setManager((mgrs && (mgrs as any)[0]) ?? null)
        }
      } catch (e: any) {
        if (mounted) setError(e?.message ?? String(e))
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  if (loading) return <div className="text-sm text-muted-foreground">Loading team...</div>
  if (error) return <div className="text-sm text-destructive">Error: {error}</div>
  if (!team) return <div className="text-sm text-muted-foreground">No team assigned</div>

  return (
    <div className="flex flex-col gap-1 text-sm">
      <div className="font-medium">Team: {team.name ?? team.id}</div>
      <div className="text-xs text-muted-foreground">ID: {team.id}</div>
      {manager ? (
        <div className="text-sm">
          Manager: {manager.full_name ?? manager.email ?? manager.id}
          {manager.email ? <span className="text-xs text-muted-foreground"> — {manager.email}</span> : null}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">No manager assigned</div>
      )}
    </div>
  )
}
