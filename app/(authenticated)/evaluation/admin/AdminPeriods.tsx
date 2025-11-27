"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import PeriodCard from "./cards/PeriodCard"
import PeriodModal from "./modals/PeriodModal"

export type Period = {
  id: string
  module_id: string
  module_name: string
  name: string
  frequency: string
  start_date: string
  end_date: string
  is_open: boolean
}

type Props = {
  initialPeriods: Period[]
  modules: { id: string; name: string }[]
}

export default function AdminPeriods({ initialPeriods, modules }: Props) {
  const [periods, setPeriods] = useState<Period[]>(initialPeriods)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null)

  const openCreate = () => {
    setEditingPeriod(null)
    setModalOpen(true)
  }

  const openEdit = (period: Period) => {
    setEditingPeriod(period)
    setModalOpen(true)
  }

  const toggleOpen = (id: string) => {
    setPeriods(prev =>
      prev.map(p =>
        p.id === id ? { ...p, is_open: !p.is_open } : p
      )
    )
  }

  const deletePeriod = (id: string) => {
    setPeriods(prev => prev.filter(p => p.id !== id))
  }

  const savePeriod = (updated: Period, isNew: boolean) => {
    if (isNew) {
      setPeriods(prev => [...prev, updated])
    } else {
      setPeriods(prev =>
        prev.map(p => (p.id === updated.id ? updated : p))
      )
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Schedule when evaluations open and close.
        </p>

        <Button className="rounded-full px-4" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Create evaluation period
        </Button>
      </div>

      {/* Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {periods.map(period => (
          <PeriodCard
            key={period.id}
            period={period}
            onEdit={() => openEdit(period)}
            onToggleOpen={() => toggleOpen(period.id)}
            onDelete={() => deletePeriod(period.id)}
          />
        ))}
      </div>

      {/* Modal */}
      <PeriodModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        modules={modules}
        period={editingPeriod}
        onSave={savePeriod}
      />
    </div>
  )
}
