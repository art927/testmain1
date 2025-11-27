"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import RoleModal from "./RoleModal"

export type UserRow = {
  id: string
  full_name: string | null
  email: string | null
  role: "admin" | "manager" | "employee"
  team_id: string | null
  team_name?: string | null
  seniority: string | null
  start_date: string        // ⭐ REQUIRED (no null)
}


type UserTableProps = {
  users: UserRow[]
  teams: { id: string; name: string }[]
}

export default function UserTable({ users, teams }: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null)

  return (
    <>
      <table className="w-full text-sm border rounded-xl overflow-hidden">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Role</th>
            <th className="p-3">Team</th>
            <th className="text-left p-2">Seniority</th>
            <th className="p-3 text-right"></th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => {
            const teamName = user.team_name ?? "-"


            return (
              <tr key={user.id} className="border-t">
                <td className="p-3 font-medium">{user.full_name}</td>

                <td className="p-3 text-muted-foreground">{user.email}</td>

                <td className="p-3">{user.role}</td>

                <td className="p-3">{teamName}</td>
                <td className="p-2 text-sm">{user.seniority ?? "—"}</td>


                <td className="p-3 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedUser(user)}
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* MODAL */}
      {selectedUser && (
        <RoleModal
          user={selectedUser}
          teams={teams}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </>
  )
}
