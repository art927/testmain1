"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import AdminModules from "./AdminModules"
import AdminAccess from "./AdminAccess"
import AdminReporting from "./AdminReporting"
import type { Module } from "./AdminModules"
import type { AccessUser } from "./AdminAccess"

type Props = {
  initialModules: Module[]
  teams: { id: string; name: string }[]
  initialUsers: AccessUser[]
}

export default function AdminEvaluation({
  initialModules,
  teams,
  initialUsers
}: Props) {
  return (
    <div className="p-6 space-y-8">
      <Tabs defaultValue="modules" className="w-full">

        <TabsList className="rounded-full">
          <TabsTrigger value="modules">Performace forms</TabsTrigger>
          <TabsTrigger value="access">Access</TabsTrigger>
          <TabsTrigger value="reporting">Reporting</TabsTrigger>
        </TabsList>

        <TabsContent value="modules">
          <AdminModules initialModules={initialModules} teams={teams} employees={initialUsers} />
        </TabsContent>

        <TabsContent value="access">
          <AdminAccess initialUsers={initialUsers} teams={teams} />
        </TabsContent>

        <TabsContent value="reporting">
          <AdminReporting />
        </TabsContent>

      </Tabs>
    </div>
  )
}
