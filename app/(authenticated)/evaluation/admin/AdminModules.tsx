"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

import ModuleCard from "./cards/ModuleCard"
import QuestionsModal from "./modals/QuestionsModal"
import FormSelectorModal from "./modals/FormSelectorModal"
import ModuleModal from "./modals/ModuleModal"

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
}

export default function AdminModules({ initialModules, teams }: Props) {
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
        {modules.map(module => (
          <ModuleCard
            key={module.id}
            module={module}
            teamsList={teams}
            onEdit={() => openEditModule(module)}
            onQuestions={() => openQuestionsModal(module)}
            onToggleActive={() => toggleActive(module.id)}
          />
        ))}
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
