"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import AdminModules from "./AdminModules"
import AdminPeriods from "./AdminPeriods"
import AdminAccess from "./AdminAccess"
import AdminReporting from "./AdminReporting"
import type { Module } from "./AdminModules"
import type { Period } from "./AdminPeriods"

type Props = {
  initialModules: Module[]
  teams: { id: string; name: string }[]
  initialPeriods: Period[]                     // ⭐ REQUIRED
  modules: { id: string; name: string }[]
  initialUsers: any[]     // ⭐ REQUIRED
}

export default function AdminEvaluation({
  initialModules,
  teams,
  initialPeriods,
  modules,
  initialUsers
}: Props) {
  return (
    <div className="p-6 space-y-8">
      <Tabs defaultValue="modules" className="w-full">

        <TabsList className="rounded-full">
          <TabsTrigger value="periods">Periods</TabsTrigger>
          <TabsTrigger value="modules">Performace forms</TabsTrigger>
          <TabsTrigger value="access">Access</TabsTrigger>
          <TabsTrigger value="reporting">Reporting</TabsTrigger>
        </TabsList>
<TabsContent value="periods">
          {/* ⭐ NOW WORKS — props exist */}
          <AdminPeriods
            initialPeriods={initialPeriods}
            modules={modules}
          />
        </TabsContent>

        <TabsContent value="modules">
          <AdminModules initialModules={initialModules} teams={teams} />
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
