"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useEffect, useState } from "react"
import { Module } from "../AdminModules"

type Props = {
  open: boolean
  onClose: () => void
  module: Module | null
  onSave: (updated: Module) => void
}

export default function ModuleModal({ open, onClose, module, onSave }: Props) {
  const isEditing = !!module

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [active, setActive] = useState(true)

  useEffect(() => {
    if (module) {
      setName(module.name)
      setDescription(module.description)
      setActive(module.is_active)
    } else {
      setName("")
      setDescription("")
      setActive(true)
    }
  }, [module])

  const handleSave = () => {
    if (!isEditing || !module) {
      onClose()
      return
    }

    const updated: Module = {
      ...module,
      name,
      description,
      is_active: active,
    }

    onSave(updated)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Edit Form Details</DialogTitle>
          <DialogDescription>
            Update the form's metadata. Creation of forms is handled by the selector.
          </DialogDescription>
        </DialogHeader>

        {!module ? (
          <p className="text-sm text-muted-foreground">
            No form selected.
          </p>
        ) : (
          <div className="space-y-4">

            {/* Name */}
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Form name"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe this form’s purpose"
                rows={3}
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between py-2">
              <div>
                <Label>Active</Label>
                <p className="text-[11px] text-muted-foreground">
                  Inactive forms are hidden from evaluations.
                </p>
              </div>
              <Switch checked={active} onCheckedChange={setActive} />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save changes
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
