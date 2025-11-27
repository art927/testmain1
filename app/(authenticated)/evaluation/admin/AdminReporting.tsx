"use client"

import ReportingCard from "./cards/ReportingCard"

export default function AdminReporting() {

  // TEMP mock data — replace with Supabase later
  const stats = [
    {
      title: "Overall Average Score",
      value: "8.6 / 10",
      description: "Across all modules and evaluations",
    },
    {
      title: "Evaluation Completion Rate",
      value: "92%",
      description: "Employees who completed their self-evaluation",
    },
    {
      title: "Manager Review Completion",
      value: "78%",
      description: "Managers who finished evaluations",
    },
    {
      title: "Active Evaluation Periods",
      value: "2",
      description: "Currently open periods",
    },
    {
      title: "Modules in Use",
      value: "4",
      description: "Technical, Communication, Teamwork, Culture",
    },
    {
      title: "Total Users Evaluated",
      value: "38",
      description: "Across all teams",
    },
  ]

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        View aggregated performance insights across all evaluations.
      </p>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((s, i) => (
          <ReportingCard
            key={i}
            title={s.title}
            value={s.value}
            description={s.description}
          />
        ))}
      </div>
    </div>
  )
}
