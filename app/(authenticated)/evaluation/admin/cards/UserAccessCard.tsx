"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { AccessUser } from "../AdminAccess"
import { User } from "lucide-react"

type Props = {
  user: AccessUser
  onRoleChange: (role: AccessUser["role"]) => void
  onTeamChange: (team: string) => void
}

export default function UserAccessCard({ user, onRoleChange, onTeamChange }: Props) {
  return (
    <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-all">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-blue-50 p-2">
            <User className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <CardTitle className="text-base">{user.full_name}</CardTitle>
            <CardDescription className="text-xs">{user.email}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 text-sm">

        <div className="space-y-2">
          <Label>Role</Label>
          <Select value={user.role} onValueChange={onRoleChange}>
            <SelectTrigger className="rounded-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Team</Label>
        <Select value={user.team ?? ""} onValueChange={onTeamChange}>
            <SelectTrigger className="rounded-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {/* Temporary — will load real teams later */}
              <SelectItem value="Engineering">Engineering</SelectItem>
              <SelectItem value="Support">Support</SelectItem>
              <SelectItem value="Design">Design</SelectItem>
              <SelectItem value="Product">Product</SelectItem>
              <SelectItem value="Leadership">Leadership</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </CardContent>
    </Card>
  )
}
