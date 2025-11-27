"use client"

import React, { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

type Kpi = {
  id: string
  metric: string
  progressPct: number
  status: "on-track" | "warning" | "critical"
}

const seedKPIs = (): Kpi[] => [
  { id: "velocity", metric: "Sprint Velocity", progressPct: 95, status: "on-track" },
  { id: "milestones", metric: "Milestones On Time", progressPct: 88, status: "warning" },
  { id: "deploy_freq", metric: "Deployment Frequency", progressPct: 80, status: "on-track" },
  { id: "build_success", metric: "Build Success Rate", progressPct: 97, status: "on-track" },
  { id: "coverage", metric: "Code Coverage", progressPct: 76, status: "warning" },
  { id: "review_turnaround", metric: "Code Review Turnaround", progressPct: 75, status: "on-track" },
  { id: "defect_ratio", metric: "Defect Ratio", progressPct: 88, status: "on-track" },
  { id: "mttr", metric: "MTTR", progressPct: 40, status: "critical" },
]

export default function KPIsSummary({ items }: { items?: Kpi[] }) {
  const kpis = items ?? seedKPIs()

  const summary = useMemo(() => {
    const total = kpis.length
    const onTrack = kpis.filter((k) => k.status === "on-track").length
    const warning = kpis.filter((k) => k.status === "warning").length
    const critical = kpis.filter((k) => k.status === "critical").length
    const avgProgress = Math.round(kpis.reduce((s, k) => s + k.progressPct, 0) / Math.max(1, total))
    return { total, onTrack, warning, critical, avgProgress }
  }, [kpis])

  return (
    <Card>
      <CardHeader>
        <CardTitle>KPIs Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total metrics</p>
            <p className="text-xl font-bold">{summary.total}</p>
          </div>

          <div className="flex items-center gap-3">
            <Badge className="bg-green-100 text-green-800">On track: {summary.onTrack}</Badge>
            <Badge className="bg-yellow-100 text-yellow-800">Warning: {summary.warning}</Badge>
            <Badge className="bg-red-100 text-red-800">Critical: {summary.critical}</Badge>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-2">Average progress</p>
          <div className="flex items-center gap-3">
            <Progress value={summary.avgProgress} className="flex-1 h-3" />
            <div className="w-12 text-right font-medium">{summary.avgProgress}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
