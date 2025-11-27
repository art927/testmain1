"use client"
import React, { useState } from "react"

export default function AssignMemberForm() {
  const [teamId, setTeamId] = useState("")
  const [userId, setUserId] = useState("")
  const [role, setRole] = useState<"member" | "owner">("member")
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    try {
      const res = await fetch("/api/admin/assign-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team_id: teamId, user_id: userId, role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed")
      setMsg("Assigned")
      setTeamId("")
      setUserId("")
    } catch (err: any) {
      setMsg(err.message ?? String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="p-4 border rounded-md bg-card">
      <h3 className="text-sm font-semibold mb-2">Assign Member</h3>
      <div className="space-y-2">
        <input value={teamId} onChange={(e) => setTeamId(e.target.value)} placeholder="team_id" className="w-full p-2 border rounded" />
        <input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="user_id" className="w-full p-2 border rounded" />
        <select value={role} onChange={(e) => setRole(e.target.value as any)} className="w-full p-2 border rounded">
          <option value="member">member</option>
          <option value="owner">owner</option>
        </select>
        <div className="flex items-center gap-2">
          <button type="submit" disabled={loading} className="px-3 py-1 bg-primary text-white rounded">
            {loading ? "Saving…" : "Assign"}
          </button>
          {msg && <div className="text-sm">{msg}</div>}
        </div>
      </div>
    </form>
  )
}
