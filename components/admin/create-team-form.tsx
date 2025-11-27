"use client"
import React, { useState } from "react"

export default function CreateTeamForm() {
  const [name, setName] = useState("")
  const [managerId, setManagerId] = useState("")
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    try {
      const res = await fetch("/api/admin/create-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, manager_id: managerId || null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed")
      setMsg("Team created")
      setName("")
      setManagerId("")
    } catch (err: any) {
      setMsg(err.message ?? String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="p-4 border rounded-md bg-card">
      <h3 className="text-sm font-semibold mb-2">Create Team</h3>
      <div className="space-y-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Team name" className="w-full p-2 border rounded" />
        <input value={managerId} onChange={(e) => setManagerId(e.target.value)} placeholder="Manager user id (optional)" className="w-full p-2 border rounded" />
        <div className="flex items-center gap-2">
          <button type="submit" disabled={loading} className="px-3 py-1 bg-primary text-white rounded">
            {loading ? "Creating…" : "Create Team"}
          </button>
          {msg && <div className="text-sm">{msg}</div>}
        </div>
      </div>
    </form>
  )
}
