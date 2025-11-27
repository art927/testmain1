"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Edit, CheckCircle2, XCircle } from "lucide-react"
import { format } from "date-fns"
import { Period } from "../AdminPeriods"
import { cn } from "@/lib/utils"

type Props = {
  period: Period
  onEdit: () => void
  onToggleOpen: () => void
  onDelete: () => void
}

export default function PeriodCard({ period, onEdit, onToggleOpen, onDelete }: Props) {
  const start = new Date(period.start_date)
  const end = new Date(period.end_date)

  return (
    <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-all">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{period.name}</CardTitle>
            <CardDescription className="mt-1 text-xs">
              Module: {period.module_name}
            </CardDescription>
          </div>

          <Badge
            className={cn(
              "rounded-full px-3 py-1 text-xs",
              period.is_open
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 text-slate-600"
            )}
          >
            {period.is_open ? "OPEN" : "CLOSED"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 text-xs text-muted-foreground">
        <div>
          Frequency: <span className="font-medium">{period.frequency}</span>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-3 h-3" />
          {format(start, "MMMM d, yyyy")} → {format(end, "MMMM d, yyyy")}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between gap-2">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={onEdit}>
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="ghost" className="text-xs" onClick={onToggleOpen}>
            {period.is_open ? "Close Period" : "Reopen"}
          </Button>

          <Button size="sm" variant="ghost" className="text-xs text-red-500" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
