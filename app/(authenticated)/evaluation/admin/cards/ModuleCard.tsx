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
import { ClipboardList, Edit, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Module } from "../AdminModules"

type Props = {
  module: Module
  teamsList: { id: string; name: string }[]
  onEdit: () => void
  onQuestions: () => void
  onToggleActive: () => void
}

export default function ModuleCard({
  module,
  teamsList,
  onEdit,
  onQuestions,
  onToggleActive
}: Props) {

  // Convert applies_to_team_id → team name
  const teamName =
    teamsList.find(t => t.id === module.applies_to_team_id)?.name || "Unknown"

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
              Active
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="rounded-full border-slate-200 bg-slate-50 text-[11px]"
            >
              Inactive
            </Badge>
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
