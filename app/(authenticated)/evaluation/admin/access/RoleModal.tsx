"use client"

import { useState } from "react"
import { updateUserAccess } from "./action"
import { updateUserSeniority } from "../actions/updateUserSeniority"
import { SENIORITY_LEVELS } from "./seniority"

import { Button } from "@/components/ui/button"
import type { UserRow } from "./UserTable"
import { 
  Select, 
  SelectTrigger, 
  SelectContent, 
  SelectItem, 
  SelectValue 
} from "@/components/ui/select"

type RoleModalProps = {
  user: UserRow
  teams: { id: string; name: string }[]
  onClose: () => void
}

export default function RoleModal({ user, teams, onClose }: RoleModalProps) {
  const [role, setRole] = useState(user.role)
  const [teamId, setTeamId] = useState(user.team_id)
  const [seniority, setSeniority] = useState(user.seniority || "")
  const [startDate, setStartDate] = useState(user.start_date) // ⭐ required
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSave() {
    if (!startDate) {
      setError("Start date is required.")
      return
    }

    setLoading(true)

    await updateUserAccess(user.id, role, teamId, startDate)

    if (seniority) {
      await updateUserSeniority(user.id, seniority)
    }

    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[350px] space-y-4 shadow-xl">

        <h2 className="text-lg font-semibold">Edit User Access</h2>

        {/* ROLE SELECT */}
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Role</label>
          <Select value={role} onValueChange={val => setRole(val as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* TEAM SELECT */}
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Team</label>
          <Select 
  value={teamId ?? ""} 
  onValueChange={val => setTeamId(val)}
>

            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {teams.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* SENIORITY SELECT */}
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Seniority</label>
          <Select value={seniority} onValueChange={setSeniority}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {SENIORITY_LEVELS.map(level => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* START DATE (required) */}
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Start Date (required)</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="border rounded-md px-3 py-2 w-full"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button disabled={loading} onClick={handleSave}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>

      </div>
    </div>
  )
}
