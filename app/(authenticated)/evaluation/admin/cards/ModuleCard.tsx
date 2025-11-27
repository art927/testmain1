"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ClipboardList, Edit, CheckCircle2, Clock4, Rocket, UserRoundCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { EmployeeEvaluationPlan, Module } from "../AdminModules"
import type { AccessUser } from "../AdminAccess"

type Props = {
  module: Module
  teamsList: { id: string; name: string }[]
  matchedEmployees: AccessUser[]
  employeeSchedules: EmployeeEvaluationPlan[]
  onEdit: () => void
  onQuestions: () => void
  onToggleActive: () => void
}

export default function ModuleCard({
  module,
  teamsList,
  matchedEmployees,
  employeeSchedules,
  onEdit,
  onQuestions,
  onToggleActive
}: Props) {

  // Convert applies_to_team_id → team name
  const teamName =
    teamsList.find(t => t.id === module.applies_to_team_id)?.name || "Unknown"

  const activeEvaluations = employeeSchedules.filter(plan => plan.activeNow)
  const hasEmployees = matchedEmployees.length > 0

  return (
    <Card
      className={cn(
        "rounded-2xl border shadow-sm hover:shadow-md transition-all flex flex-col",
        !module.is_active && "opacity-75"
      )}
    >
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-blue-50 p-2">
              <ClipboardList className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-base">{module.name}</CardTitle>
              <CardDescription className="text-xs mt-1">
                {module.description || "No description provided."}
              </CardDescription>
            </div>
          </div>

          {/* Display frequency & seniority */}
          <Badge className="rounded-full px-3 py-1 text-xs">
            {module.frequency} · {module.seniority}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 text-xs text-muted-foreground flex-1">

        <div>
          <span className="font-medium text-[11px] uppercase tracking-wide">Team:</span>{" "}
          {teamName}
        </div>

        <div>
          <span className="font-medium text-[11px] uppercase tracking-wide">Questions:</span>{" "}
          {module.questions.length} configured
        </div>

        <div className="flex items-center gap-2 mt-2">
          {module.is_active ? (
            <Badge
              variant="outline"
              className="rounded-full border-green-200 bg-green-50 text-[11px] text-green-700"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Active automation
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="rounded-full border-slate-200 bg-slate-50 text-[11px]"
            >
              Automation paused
            </Badge>
          )}
        </div>
      </CardContent>

      <CardContent className="space-y-3 pt-0 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <UserRoundCheck className="w-4 h-4 text-blue-500" />
          <span className="font-semibold text-foreground">{matchedEmployees.length}</span>
          <span className="text-muted-foreground">matched employees</span>
        </div>

        {hasEmployees ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground font-medium">
              <Clock4 className="w-4 h-4" /> Upcoming evaluation dates
            </div>

            <div className="space-y-2">
              {employeeSchedules.slice(0, 3).map(schedule => (
                <div
                  key={schedule.employeeId}
                  className="rounded-lg border bg-muted/30 p-3 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground text-sm">{schedule.employeeName}</p>
                    <Badge variant={schedule.activeNow ? "default" : "outline"} className="text-[11px]">
                      {schedule.activeNow ? "Active now" : "Scheduled"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    Opens {schedule.nextOpensOn} · Closes {schedule.windowCloses}
                  </p>
                  <div className="flex flex-wrap gap-1 text-[11px] text-muted-foreground">
                    {schedule.upcomingWindows.map(window => (
                      <Badge key={`${schedule.employeeId}-${window.opensOn}`} variant="secondary" className="rounded-full">
                        {window.opensOn} → {window.closesOn}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">No employees currently match this form's rules.</p>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2 font-medium text-muted-foreground">
            <Rocket className="w-4 h-4" /> Automation rules
          </div>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>First evaluation opens 6 months after the employee start date.</li>
            <li>Self and manager evaluations are generated per employee.</li>
            <li>Repeats automatically every {module.frequency.toLowerCase()} for matched employees.</li>
          </ul>
          {!!activeEvaluations.length && (
            <div className="flex flex-wrap gap-2 text-[11px]">
              {activeEvaluations.map(plan => (
                <Badge key={plan.employeeId} variant="outline" className="rounded-full">
                  {plan.employeeName}'s cycle is active
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2 pt-0">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="rounded-full text-xs"
            onClick={onEdit}
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit form
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="rounded-full text-xs"
            onClick={onQuestions}
          >
            <ClipboardList className="w-3 h-3 mr-1" />
            Manage questions
          </Button>
        </div>

        <Button
          size="sm"
          variant="ghost"
          className="text-xs"
          onClick={onToggleActive}
        >
          {module.is_active ? "Deactivate" : "Activate"}
        </Button>
      </CardFooter>
    </Card>
  )
}
