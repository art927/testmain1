"use client"
import React, { useState } from "react"

export default function CreateRewardForm() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [pointsCost, setPointsCost] = useState<number>(100)
  const [icon, setIcon] = useState("")
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    try {
      const res = await fetch("/api/admin/create-reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, points_cost: pointsCost, icon }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed")
      setMsg("Reward created")
      setName("")
      setDescription("")
      setPointsCost(100)
      setIcon("")
    } catch (err: any) {
      setMsg(err.message ?? String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="p-4 border rounded-md bg-card">
      <h3 className="text-sm font-semibold mb-2">Create Reward</h3>
      <div className="space-y-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Reward name" className="w-full p-2 border rounded" />
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full p-2 border rounded" />
        <input type="number" value={pointsCost} onChange={(e) => setPointsCost(Number(e.target.value))} className="w-full p-2 border rounded" />
        <input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="icon or image path (optional)" className="w-full p-2 border rounded" />
        <div className="flex items-center gap-2">
          <button type="submit" disabled={loading} className="px-3 py-1 bg-primary text-white rounded">
            {loading ? "Creating…" : "Create Reward"}
          </button>
          {msg && <div className="text-sm">{msg}</div>}
        </div>
      </div>
    </form>
  )
}
