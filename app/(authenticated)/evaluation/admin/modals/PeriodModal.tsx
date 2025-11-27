"use client"

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

import { CalendarIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { createPeriod, updatePeriod } from "../actions/periods"
import type { Period } from "../AdminPeriods"

type Props = {
  open: boolean
  onClose: () => void
  period: Period | null
  modules: { id: string; name: string }[]
  onSave: (updated: Period, isNew: boolean) => void
}

export default function PeriodModal({ open, onClose, period, modules, onSave }: Props) {
  const isEditing = !!period

  const [name, setName] = useState("")
  const [moduleId, setModuleId] = useState<string>("")
  const [frequency, setFrequency] = useState("Quarterly")
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  const [openState, setOpenState] = useState(true)

  useEffect(() => {
    if (period) {
      setName(period.name)
      setModuleId(period.module_id)
      setFrequency(period.frequency)
      setStart(period.start_date)
      setEnd(period.end_date)
      setOpenState(period.is_open)
    } else {
      setName("")
      setModuleId("")
      setFrequency("Quarterly")
      setStart("")
      setEnd("")
      setOpenState(true)
    }
  }, [period])

  const handleSave = async () => {
    if (!name || !moduleId || !start || !end) return

    if (isEditing) {
      const updated = await updatePeriod({
        id: period!.id,
        module_id: moduleId,
        name,
        frequency,
        start_date: start,
        end_date: end,
        is_open: openState,
      })

      onSave(
        {
          ...updated,
          module_name: modules.find(m => m.id === moduleId)?.name ?? "",
        },
        false
      )
    } else {
      const created = await createPeriod({
        module_id: moduleId,
        name,
        frequency,
        start_date: start,
        end_date: end,
        is_open: openState,
      })

      onSave(
        {
          ...created,
          module_name: modules.find(m => m.id === moduleId)?.name ?? "",
        },
        true
      )
    }

    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit evaluation period" : "Create evaluation period"}
          </DialogTitle>
          <DialogDescription>
            Define when this evaluation period is open and which module it belongs to.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">

          {/* NAME */}
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Q1 2025" />
          </div>

          {/* MODULE */}
          <div className="space-y-2">
            <Label>Module</Label>
            <Select value={moduleId} onValueChange={setModuleId}>
              <SelectTrigger>
                <SelectValue placeholder="Select module" />
              </SelectTrigger>
              <SelectContent>
                {modules.map(m => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* FREQUENCY */}
          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* DATES */}
          <div className="flex gap-4">
            <div className="space-y-2 flex-1">
              <Label>Start date</Label>
              <Input type="date" value={start} onChange={e => setStart(e.target.value)} />
            </div>

            <div className="space-y-2 flex-1">
              <Label>End date</Label>
              <Input type="date" value={end} onChange={e => setEnd(e.target.value)} />
            </div>
          </div>

          {/* OPEN/CLOSED */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Status</Label>
              <p className="text-[11px] text-muted-foreground">Controls whether the evaluation is visible</p>
            </div>

            <Switch checked={openState} onCheckedChange={setOpenState} />
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>
              {isEditing ? "Save changes" : "Create period"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
