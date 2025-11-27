"use client"

import React, { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type Member = {
  id: string
  full_name?: string | null
  email?: string | null
}

interface TeamMemberSelectProps {
  value?: string
  onChange?: (id: string) => void
  includeSelf?: boolean
  placeholder?: string
  className?: string
}

export default function TeamMemberSelect({
  value,
  onChange,
  includeSelf = false,
  placeholder = "Select a teammate",
  className = "",
}: TeamMemberSelectProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const supabase = createClient()

    async function load() {
      try {
        setLoading(true)
        setError(null)

        // get authenticated user
        const { data: userData } = await supabase.auth.getUser()
        const user = userData?.user
        if (!user?.id) {
          throw new Error("Not authenticated")
        }

        // fetch profile to find team_id
        const { data: profile, error: profileErr } = await supabase
          .from("profiles")
          .select("team_id")
          .eq("id", user.id)
          .maybeSingle()

        if (profileErr) throw profileErr
        const teamId = (profile as any)?.team_id
        if (!teamId) {
          if (mounted) setMembers([])
          return
        }

        // fetch team members (profiles) in same team
        const { data: rows, error: rowsErr } = await supabase
          .from("profiles")
          .select("id, full_name, email, role")
          .eq("team_id", teamId)
          .order("full_name", { ascending: true })

        if (rowsErr) throw rowsErr

        // optionally filter out self
        const filtered = (rows || []).filter((r: any) => includeSelf || r.id !== user.id)

        if (mounted) setMembers(filtered)
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
  }, [includeSelf])

  if (loading) {
    return <div className={`text-sm text-muted-foreground ${className}`}>Loading teammates…</div>
  }

  if (error) {
    return <div className={`text-sm text-destructive ${className}`}>Error loading teammates</div>
  }

  if (!members || members.length === 0) {
    return <div className={`text-sm text-muted-foreground ${className}`}>No teammates found</div>
  }

  return (
    <select
      className={`w-full rounded-md border px-3 py-2 text-sm bg-background ${className}`}
      value={value ?? ""}
      onChange={(e) => onChange && onChange(e.target.value)}
      aria-label="Choose teammate"
    >
      <option value="">{placeholder}</option>
      {members.map((m) => (
        <option key={m.id} value={m.id}>
          {m.full_name ?? m.email ?? m.id}
        </option>
      ))}
    </select>
  )
}
