"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, RefreshCw } from "lucide-react"

/*
  KPIs demo component — mock data derived from provided table.
  Place this file at: components/kpis-demo.tsx
  Import and render <KPIsDemo /> where you want the demo dashboard to appear.
*/

type Kpi = {
  id: string
  metric: string
  target: string
  measuredFrom: string
  owner: string
  // mocked measured values (numbers used to compute status/progress)
  valueLabel: string
  progressPct: number // 0-100
  status: "on-track" | "warning" | "critical"
  trend?: "up" | "down" | "flat"
}

const seedKPIs = (): Kpi[] => [
  {
    id: "velocity",
    metric: "Sprint Velocity",
    target: "Stable ±10% vs plan",
    measuredFrom: "Jira",
    owner: "Tech Lead",
    valueLabel: "22 pts (plan 20)",
    progressPct: 95,
    status: "on-track",
    trend: "up",
  },
  {
    id: "milestones",
    metric: "Milestones On Time",
    target: "≥ 90%",
    measuredFrom: "Project tracker",
    owner: "PM",
    valueLabel: "88%",
    progressPct: 88,
    status: "warning",
    trend: "down",
  },
  {
    id: "deploy_freq",
    metric: "Deployment Frequency",
    target: "Weekly / per sprint",
    measuredFrom: "CI/CD logs",
    owner: "DevOps",
    valueLabel: "2 / sprint",
    progressPct: 80,
    status: "on-track",
    trend: "up",
  },
  {
    id: "build_success",
    metric: "Build Success Rate",
    target: "≥ 95%",
    measuredFrom: "CI/CD pipeline",
    owner: "DevOps",
    valueLabel: "97%",
    progressPct: 97,
    status: "on-track",
    trend: "flat",
  },
  {
    id: "coverage",
    metric: "Code Coverage (Critical Paths)",
    target: "≥ 80%",
    measuredFrom: "CI/CD reports",
    owner: "Dev + QA",
    valueLabel: "76%",
    progressPct: 76,
    status: "warning",
    trend: "down",
  },
  {
    id: "review_turnaround",
    metric: "Code Review Turnaround",
    target: "≤ 24 hours",
    measuredFrom: "GitHub Insights",
    owner: "Tech Lead",
    valueLabel: "18 hrs",
    progressPct: 75,
    status: "on-track",
    trend: "up",
  },
  {
    id: "defect_ratio",
    metric: "Defect Ratio",
    target: "≤ 15%",
    measuredFrom: "Jira + GitHub",
    owner: "QA Lead",
    valueLabel: "12%",
    progressPct: 88,
    status: "on-track",
    trend: "flat",
  },
  {
    id: "mttr",
    metric: "Mean Time to Recovery (MTTR)",
    target: "≤ 4 hours",
    measuredFrom: "Incident logs",
    owner: "Tech Lead",
    valueLabel: "6 hrs",
    progressPct: 40,
    status: "critical",
    trend: "down",
  },
]

export default function KPIsDemo() {
  const [items, setItems] = useState<Kpi[]>(() => seedKPIs())

  const summary = useMemo(() => {
    const onTrack = items.filter((i) => i.status === "on-track").length
    const warning = items.filter((i) => i.status === "warning").length
    const critical = items.filter((i) => i.status === "critical").length
    return { total: items.length, onTrack, warning, critical }
  }, [items])

  const randomize = () => {
    // simple randomizer to demo status changes
    setItems((prev) =>
      prev.map((i) => {
        const jitter = Math.floor((Math.random() - 0.45) * 20) // -9 .. +10
        let pct = Math.max(0, Math.min(100, i.progressPct + jitter))
        let status: Kpi["status"] = "on-track"
        if (pct >= 90) status = "on-track"
        else if (pct >= 70) status = "warning"
        else status = "critical"

        // keep valueLabel shape but adjust number when numeric
        let valueLabel = i.valueLabel
        const n = parseFloat(i.valueLabel)
        if (!Number.isNaN(n)) {
          const newVal = Math.round((n * pct) / 100)
          valueLabel = `${newVal}${i.valueLabel.replace(/[\d.-]/g, "")}`
        }

        const trend = pct - i.progressPct > 3 ? "up" : pct - i.progressPct < -3 ? "down" : "flat"

        return { ...i, progressPct: pct, status, valueLabel, trend }
      }),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">KPIs (Demo)</h2>
        <div className="flex items-center gap-3">
          <div className="text-sm">
            <span className="font-medium">{summary.total}</span> metrics •{" "}
            <span className="text-green-500 font-medium">{summary.onTrack}</span> on-track •{" "}
            <span className="text-yellow-500 font-medium">{summary.warning}</span> warning •{" "}
            <span className="text-red-500 font-medium">{summary.critical}</span> critical
          </div>
          <Button onClick={randomize} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((kpi) => (
          <Card key={kpi.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-sm">{kpi.metric}</CardTitle>
                  <CardDescription className="text-xs">
                    Target: {kpi.target} • Source: {kpi.measuredFrom}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{kpi.valueLabel}</div>
                  <div className="text-xs text-muted-foreground">{kpi.owner}</div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Progress value={Math.round(kpi.progressPct)} className="w-36" />
                  <span className="text-xs font-medium">{Math.round(kpi.progressPct)}%</span>
                </div>

                <div>
                  <Badge
                    className={`${
                      kpi.status === "on-track"
                        ? "bg-green-100 text-green-800"
                        : kpi.status === "warning"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {kpi.status === "on-track" ? "On track" : kpi.status === "warning" ? "Warning" : "Critical"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {kpi.trend === "up" ? (
                  <span className="flex items-center text-green-600">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    Improving
                  </span>
                ) : kpi.trend === "down" ? (
                  <span className="flex items-center text-red-600">
                    <ArrowDown className="h-4 w-4 mr-1" />
                    Declining
                  </span>
                ) : (
                  <span className="flex items-center opacity-80">Stable</span>
                )}
                <span>• Source: {kpi.measuredFrom}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
