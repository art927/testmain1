"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

import ModuleCard from "./cards/ModuleCard"
import QuestionsModal from "./modals/QuestionsModal"
import FormSelectorModal from "./modals/FormSelectorModal"
import ModuleModal from "./modals/ModuleModal"
import type { AccessUser } from "./AdminAccess"

export type Section = {
  id: string
  name: string
  weight: number
  order_index: number
}

export type Question = {
  id: string
  question_text: string
  type: "rating" | "comment"
  required: boolean
  section_id?: string
}

export type Module = {
  id: string
  name: string
  description: string
  frequency: string
  seniority: string
  applies_to_team_id: string
  is_active: boolean
  sections: Section[]
  questions: Question[]
}

type Props = {
  initialModules: Module[]
  teams: { id: string; name: string }[]
  employees: AccessUser[]
}

export type EmployeeEvaluationPlan = {
  employeeId: string
  employeeName: string
  startDate: string
  firstOpensOn: string
  nextOpensOn: string
  nextOpensOnDate: Date
  windowCloses: string
  activeNow: boolean
  upcomingWindows: { opensOn: string; closesOn: string; rangeLabel: string }[]
}

const FREQUENCY_INTERVAL_MONTHS: Record<string, number> = {
  "quarterly": 3,
  "bi-annual": 6,
  "semi-annual": 6,
  "annual": 12,
}

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)

const addMonths = (date: Date, months: number) => {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

const addDays = (date: Date, days: number) => {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

const formatRange = (start: Date, end: Date) => `${formatDate(start)} — ${formatDate(end)}`

const buildEmployeeSchedule = (
  employee: AccessUser,
  moduleFrequency: string
): EmployeeEvaluationPlan | null => {
  if (!employee.start_date) return null

  const normalizedFreq = moduleFrequency.toLowerCase()
  const interval = FREQUENCY_INTERVAL_MONTHS[normalizedFreq] ?? 12
  const evaluationWindowDays = 30

  const startDate = new Date(employee.start_date)
  if (isNaN(startDate.getTime())) return null

  const firstOpening = addMonths(startDate, 6)
  const now = new Date()

  const windows: { opensOn: Date; closesOn: Date }[] = []
  let cursor = firstOpening

  while (cursor < now) {
    cursor = addMonths(cursor, interval)
  }

  for (let i = 0; i < 4; i++) {
    const opensOn = i === 0 ? cursor : addMonths(cursor, interval * i)
    const closesOn = addDays(opensOn, evaluationWindowDays)
    windows.push({ opensOn, closesOn })
  }

  const activeWindow = windows.find(
    (window) => now >= window.opensOn && now <= window.closesOn
  )
  const nextWindow = windows[0]

  return {
    employeeId: employee.id,
    employeeName: employee.full_name || "Team member",
    startDate: formatDate(startDate),
    firstOpensOn: formatDate(firstOpening),
    nextOpensOn: formatDate(nextWindow.opensOn),
    nextOpensOnDate: nextWindow.opensOn,
    windowCloses: formatDate(nextWindow.closesOn),
    activeNow: Boolean(activeWindow),
    upcomingWindows: windows.map((window) => ({
      opensOn: formatDate(window.opensOn),
      closesOn: formatDate(window.closesOn),
      rangeLabel: formatRange(window.opensOn, window.closesOn),
    })),
  }
}

export default function AdminModules({ initialModules, teams, employees }: Props) {
  const [modules, setModules] = useState<Module[]>(initialModules)

  const [selectorOpen, setSelectorOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [questionsDialogOpen, setQuestionsDialogOpen] = useState(false)

  const [editingModule, setEditingModule] = useState<Module | null>(null)

  // When admin selects frequency + department + seniority:
  const handleModuleSelected = (module: Module) => {
    setModules(prev => {
      const exists = prev.some(m => m.id === module.id)
      return exists ? prev : [module, ...prev]
    })

    setEditingModule(module)
    setQuestionsDialogOpen(true)
  }

  const openEditModule = (module: Module) => {
    setEditingModule(module)
    setEditModalOpen(true)
  }

  const openQuestionsModal = (module: Module) => {
    setEditingModule(module)
    setQuestionsDialogOpen(true)
  }

  const toggleActive = (id: string) => {
    setModules(prev =>
      prev.map(m => (m.id === id ? { ...m, is_active: !m.is_active } : m))
    )
  }

  const saveQuestions = (moduleId: string, questions: Question[]) => {
    setModules(prev =>
      prev.map(m =>
        m.id === moduleId ? { ...m, questions } : m
      )
    )
  }

  const saveModuleEdits = (updated: Module) => {
    setModules(prev =>
      prev.map(m => (m.id === updated.id ? updated : m))
    )
  }

  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Create or manage performance evaluation forms.
        </p>

        <Button className="rounded-full px-4" onClick={() => setSelectorOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create form
        </Button>
      </div>

      {/* MODULE LIST */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map(module => {
          const matchedEmployees = employees.filter(employee => {
            const employeeTeam = employee.team_id ?? employee.team
            const employeeSeniority = employee.seniority
            return (
              employeeTeam === module.applies_to_team_id &&
              (!!employeeSeniority && employeeSeniority === module.seniority)
            )
          })

          const schedules = matchedEmployees
            .map(emp => buildEmployeeSchedule(emp, module.frequency))
            .filter(Boolean)
            .sort(
              (a, b) =>
                (a as EmployeeEvaluationPlan).nextOpensOnDate.getTime() -
                (b as EmployeeEvaluationPlan).nextOpensOnDate.getTime()
            ) as EmployeeEvaluationPlan[]

          return (
            <ModuleCard
              key={module.id}
              module={module}
              teamsList={teams}
              matchedEmployees={matchedEmployees}
              employeeSchedules={schedules}
              onEdit={() => openEditModule(module)}
              onQuestions={() => openQuestionsModal(module)}
              onToggleActive={() => toggleActive(module.id)}
            />
          )
        })}
      </div>

      {/* FORM SELECTOR MODAL */}
      <FormSelectorModal
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        teams={teams}
        onSelected={handleModuleSelected}
      />

      {/* EDIT MODULE METADATA MODAL */}
      <ModuleModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        module={editingModule}
        onSave={saveModuleEdits}
      />

      {/* QUESTIONS MODAL */}
      <QuestionsModal
        open={questionsDialogOpen}
        onClose={() => setQuestionsDialogOpen(false)}
        module={editingModule}
        onSave={saveQuestions}
      />
    </div>
  )
}
