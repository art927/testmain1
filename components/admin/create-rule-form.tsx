"use client"
import React, { useState } from "react"

export default function CreateRuleForm() {
  const [name, setName] = useState("")
  const [triggerType, setTriggerType] = useState("task_completed")
  const [points, setPoints] = useState(10)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    try {
      const res = await fetch("/api/point-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, trigger_type: triggerType, points }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed")
      setMsg("Rule created")
      setName("")
    } catch (err: any) {
      setMsg(err.message ?? String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="p-4 border rounded-md bg-card">
      <h3 className="text-sm font-semibold mb-2">Create Point Rule</h3>
      <div className="space-y-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Rule name" className="w-full p-2 border rounded" />
        <select value={triggerType} onChange={(e) => setTriggerType(e.target.value)} className="w-full p-2 border rounded">
          <option value="task_completed">task_completed</option>
          <option value="received_recognition">received_recognition</option>
          <option value="first_task_completed">first_task_completed</option>
        </select>
        <input type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} className="w-full p-2 border rounded" />
        <div className="flex items-center gap-2">
          <button type="submit" disabled={loading} className="px-3 py-1 bg-primary text-white rounded">
            {loading ? "Creating…" : "Create Rule"}
          </button>
          {msg && <div className="text-sm">{msg}</div>}
        </div>
      </div>
    </form>
  )
}
