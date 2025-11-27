"use client"
import React, { useEffect, useState } from "react"

type Rule = { id: string; name: string; trigger_type: string; points: number; is_active: boolean }

export default function RulesList() {
  const [items, setItems] = useState<Rule[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/point-rules")
      const data = await res.json()
      setItems(data ?? [])
    } catch (err: any) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function toggleActive(id: string, next: boolean) {
    await fetch(`/api/point-rules/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: next }),
    })
    load()
  }

  async function remove(id: string) {
    if (!confirm("Delete rule?")) return
    await fetch(`/api/point-rules/${id}`, { method: "DELETE" })
    load()
  }

  return (
    <div className="p-4 border rounded-md bg-card">
      <h3 className="text-sm font-semibold mb-2">Point Rules</h3>
      {loading && <div>Loading…</div>}
      {error && <div className="text-destructive">{error}</div>}
      <ul className="space-y-2">
        {items.map((r) => (
          <li key={r.id} className="flex items-center justify-between">
            <div>
              <div className="font-medium">{r.name}</div>
              <div className="text-xs text-muted-foreground">
                {r.trigger_type} • {r.points} pts
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleActive(r.id, !r.is_active)} className="text-sm px-2 py-1 border rounded">
                {r.is_active ? "Disable" : "Enable"}
              </button>
              <button onClick={() => remove(r.id)} className="text-sm px-2 py-1 border rounded text-destructive">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
