"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type EmployeeEvaluation = {
  employee_id: string
  employee_name: string
  department: string
  instance_id: string
  module_id: string
  module_name: string
  period_name: string
  period_end: string
  self_status: string
  manager_status: string
  self_submitted_at: string | null
}

export default function ManagerEvaluation() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [evaluations, setEvaluations] = useState<EmployeeEvaluation[]>([])

  useEffect(() => {
    loadEmployeeEvaluations()
  }, [])

  async function loadEmployeeEvaluations() {
    setLoading(true)

    const { data: auth } = await supabase.auth.getUser()
    const user = auth?.user
    if (!user) {
      setLoading(false)
      return
    }

    const { data: profile } = await supabase.from("profiles").select("team_id").eq("id", user.id).single()

    if (!profile?.team_id) {
      setLoading(false)
      return
    }

    const { data: teamProfiles } = await supabase
      .from("profiles")
      .select("id, full_name, department_id")
      .eq("team_id", profile.team_id)
      .neq("id", user.id)

    if (!teamProfiles) {
      setLoading(false)
      return
    }

    const employeeIds = teamProfiles.map((p) => p.id)

    const { data: instances } = await supabase
      .from("evaluation_instances")
      .select(`
        id,
        user_id,
        module_id,
        period_id,
        self_status,
        manager_status,
        self_submitted_at
      `)
      .in("user_id", employeeIds)

    if (!instances || instances.length === 0) {
      setLoading(false)
      return
    }

    const moduleIds = [...new Set(instances.map((i) => i.module_id))]
    const periodIds = [...new Set(instances.map((i) => i.period_id))]

    const { data: modules } = await supabase.from("evaluation_modules").select("id, name").in("id", moduleIds)

    const { data: periods } = await supabase.from("evaluation_periods").select("id, name, end_date").in("id", periodIds)

    const { data: departments } = await supabase.from("departments").select("id, name")

    const mapped: EmployeeEvaluation[] = instances.map((inst) => {
      const employee = teamProfiles.find((p) => p.id === inst.user_id)
      const module = modules?.find((m) => m.id === inst.module_id)
      const period = periods?.find((p) => p.id === inst.period_id)
      const dept = departments?.find((d) => d.id === employee?.department_id)

      return {
        employee_id: inst.user_id,
        employee_name: employee?.full_name || "Unknown",
        department: dept?.name || "No Department",
        instance_id: inst.id,
        module_id: inst.module_id,
        module_name: module?.name || "Unknown Module",
        period_name: period?.name || "Unknown Period",
        period_end: period?.end_date || "",
        self_status: inst.self_status,
        manager_status: inst.manager_status,
        self_submitted_at: inst.self_submitted_at,
      }
    })

    setEvaluations(mapped)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manager Evaluation Dashboard</h1>
        <p className="text-muted-foreground mt-2">Review and complete evaluations for your team members</p>
      </div>

      {evaluations.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            No employee evaluations available at this time.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Self-Eval Status</TableHead>
                  <TableHead>Manager-Eval Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluations.map((evaluation) => {
                  const canEvaluate = evaluation.self_status === "submitted"
                  const isCompleted = evaluation.manager_status === "submitted"

                  return (
                    <TableRow key={evaluation.instance_id}>
                      <TableCell className="font-medium">{evaluation.employee_name}</TableCell>
                      <TableCell>{evaluation.department}</TableCell>
                      <TableCell>{evaluation.module_name}</TableCell>
                      <TableCell>{evaluation.period_name}</TableCell>
                      <TableCell>
                        {evaluation.self_status === "submitted" ? (
                          <Badge className="bg-green-600">Submitted</Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {isCompleted ? (
                          <Badge className="bg-blue-600">Completed</Badge>
                        ) : (
                          <Badge variant="outline">Not Started</Badge>
                        )}
                      </TableCell>
                      <TableCell>{evaluation.period_end}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          {canEvaluate && !isCompleted && (
                            <Link href={`/evaluation/manager/evaluate/${evaluation.instance_id}`}>
                              <Button size="sm">Evaluate</Button>
                            </Link>
                          )}
                          {isCompleted && (
                            <>
                              <Link href={`/evaluation/manager/evaluate/${evaluation.instance_id}`}>
                                <Button size="sm" variant="outline">
                                  View
                                </Button>
                              </Link>
                              <Link href={`/evaluation/manager/goals/${evaluation.instance_id}`}>
                                <Button size="sm" variant="default">
                                  Set Goals
                                </Button>
                              </Link>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
