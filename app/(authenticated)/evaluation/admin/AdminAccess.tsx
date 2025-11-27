"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { updateUserAccess } from "./access/action"
import { updateUserSeniority } from "./actions/updateUserSeniority"
import { SENIORITY_LEVELS } from "./access/seniority"

export type AccessUser = {
  id: string
  full_name: string | null
  email: string | null
  role: "admin" | "manager" | "employee"
  team: string | null
  team_id?: string | null
  seniority: string | null
  start_date: string                 // ⭐ REQUIRED
}

type Props = {
  initialUsers: AccessUser[]
  teams: { id: string; name: string }[]
}

type EditingState = {
  id: string
  role: "admin" | "manager" | "employee"
  team: string | null
  seniority: string | null
  start_date: string                 // ⭐ REQUIRED
} | null

export default function AdminAccess({ initialUsers, teams }: Props) {
  const [users, setUsers] = useState<AccessUser[]>(initialUsers)
  const [editing, setEditing] = useState<EditingState>(null)

  const startEdit = (user: AccessUser) => {
    setEditing({
      id: user.id,
      role: user.role,
      team: user.team,
      seniority: user.seniority,
      start_date: user.start_date     // ⭐ NEW
    })
  }

  const cancelEdit = () => setEditing(null)

  const saveEdit = async () => {
    if (!editing) return

    // Validate required start_date
    if (!editing.start_date) {
      alert("Start date is required")
      return
    }

    // 1) Update UI
    setUsers(prev =>
      prev.map(u =>
        u.id === editing.id
          ? {
              ...u,
              role: editing.role,
              team: editing.team,
              seniority: editing.seniority,
              start_date: editing.start_date  // ⭐ NEW
            }
          : u
      )
    )

    // 2) Update DB
    await updateUserAccess(editing.id, editing.role, editing.team, editing.start_date)

    if (editing.seniority) {
      await updateUserSeniority(editing.id, editing.seniority)
    }

    // 3) Close modal
    setEditing(null)
  }

  const getTeamName = (teamId: string | null) => {
    if (!teamId) return "-"
    return teams.find(t => t.id === teamId)?.name ?? "-"
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Control user visibility and permissions in performance evaluations.
      </p>

      <table className="w-full text-sm border rounded-xl overflow-hidden">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Role</th>
            <th className="p-3">Team</th>
            <th className="p-3">Seniority</th>
            <th className="p-3">Start Date</th>     {/* ⭐ NEW */}
            <th className="p-3 text-right"></th>
          </tr>
        </thead>

        <tbody>
          {users.map(user => {
            const isEditing = editing?.id === user.id

            return (
              <tr key={user.id} className="border-t">
                <td className="p-3 font-medium">{user.full_name}</td>

                <td className="p-3 text-muted-foreground">{user.email}</td>

                {/* ROLE */}
                <td className="p-3">
                  {isEditing ? (
                    <Select
                      value={editing.role}
                      onValueChange={(role) =>
                        setEditing(prev =>
                          prev ? { ...prev, role: role as any } : prev
                        )
                      }
                    >
                      <SelectTrigger className="w-[150px] rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="employee">Employee</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    user.role
                  )}
                </td>

                {/* TEAM */}
                <td className="p-3">
                  {isEditing ? (
                    <Select
                      value={editing.team ?? ""}
                      onValueChange={(teamId) =>
                        setEditing(prev =>
                          prev ? { ...prev, team: teamId } : prev
                        )
                      }
                    >
                      <SelectTrigger className="w-[180px] rounded-lg">
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map(t => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    getTeamName(user.team)
                  )}
                </td>

                {/* SENIORITY */}
                <td className="p-3">
                  {isEditing ? (
                    <Select
                      value={editing.seniority ?? ""}
                      onValueChange={(val) =>
                        setEditing(prev =>
                          prev ? { ...prev, seniority: val } : prev
                        )
                      }
                    >
                      <SelectTrigger className="w-[160px] rounded-lg">
                        <SelectValue placeholder="Select seniority" />
                      </SelectTrigger>
                      <SelectContent>
                        {SENIORITY_LEVELS.map(level => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    user.seniority ?? "—"
                  )}
                </td>

                {/* ⭐ START DATE */}
                <td className="p-3">
                  {isEditing ? (
                    <input
                      type="date"
                      className="border rounded-md px-3 py-2"
                      value={editing.start_date}
                      onChange={e =>
                        setEditing(prev =>
                          prev ? { ...prev, start_date: e.target.value } : prev
                        )
                      }
                    />
                  ) : (
                    user.start_date
                  )}
                </td>

                {/* ACTIONS */}
                <td className="p-3 text-right space-x-2">
                  {!isEditing ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(user)}
                    >
                      Edit
                    </Button>
                  ) : (
                    <>
                      <Button size="sm" onClick={saveEdit}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
