"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Plus, Trash } from "lucide-react"

import { Module, Question, Section } from "../AdminModules"
import { saveQuestionsToDB } from "../actions/questions"

type Props = {
  open: boolean
  onClose: () => void
  module: Module | null
  onSave: (moduleId: string, questions: Question[]) => void
}

export default function QuestionsModal({ open, onClose, module, onSave }: Props) {
  const [questionsBySection, setQuestionsBySection] = useState<Record<string, Question[]>>({})

  useEffect(() => {
    if (!module) return

    // Group questions by section
    const grouped: Record<string, Question[]> = {}

    module.sections.forEach(sec => {
      grouped[sec.id] = module.questions.filter(q => q.section_id === sec.id)
    })

    setQuestionsBySection(grouped)
  }, [module])

  if (!module) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>Loading...</DialogContent>
      </Dialog>
    )
  }

  const addQuestion = (sectionId: string) => {
    const newQ: Question = {
      id: crypto.randomUUID(),
      question_text: "",
      type: "rating",
      required: false,
      section_id: sectionId,
    }

    setQuestionsBySection(prev => ({
      ...prev,
      [sectionId]: [...(prev[sectionId] || []), newQ],
    }))
  }

  const updateQuestion = (sectionId: string, index: number, field: string, value: any) => {
    setQuestionsBySection(prev => {
      const copy = [...prev[sectionId]]
      // @ts-ignore
      copy[index][field] = value
      return { ...prev, [sectionId]: copy }
    })
  }

  const deleteQuestion = (sectionId: string, index: number) => {
    setQuestionsBySection(prev => {
      const copy = [...prev[sectionId]]
      copy.splice(index, 1)
      return { ...prev, [sectionId]: copy }
    })
  }

 const handleSave = async () => {
  const allQuestions = Object.values(questionsBySection).flat()

  // SAVE TO DB
  await saveQuestionsToDB({
    moduleId: module.id,
    questions: allQuestions,
  })

  // UPDATE UI
  onSave(module.id, allQuestions)
  onClose()
}
  const sectionLabel = (name: string) => {
    switch (name) {
      case "soft_skills": return "Soft Skills (25%)"
      case "technical_skills": return "Technical Skills (25%)"
      case "performance": return "Performance (50%)"
      default: return name
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl rounded-2xl">
        <DialogHeader>
          <DialogTitle>Edit Questions</DialogTitle>
          <DialogDescription>
            Add or edit questions for each section of this evaluation form.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2">

          {module.sections.map(section => (
            <div key={section.id} className="space-y-4 border p-4 rounded-xl">
              
              {/* SECTION TITLE */}
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">{sectionLabel(section.name)}</h3>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => addQuestion(section.id)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add question
                </Button>
              </div>

              {/* QUESTIONS INSIDE SECTION */}
              {(questionsBySection[section.id] || []).map((q, idx) => (
                <div
                  key={q.id}
                  className="border rounded-lg p-4 bg-muted/40 space-y-4"
                >
                  {/* QUESTION TEXT */}
                  <div className="space-y-2">
                    <Label>Question</Label>
                    <Input
                      value={q.question_text}
                      onChange={e =>
                        updateQuestion(section.id, idx, "question_text", e.target.value)
                      }
                      placeholder="Enter a question..."
                    />
                  </div>

                  {/* TYPE + REQUIRED */}
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={q.type}
                        onValueChange={v =>
                          updateQuestion(section.id, idx, "type", v as "rating" | "comment")
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rating">Rating (1–10)</SelectItem>
                          <SelectItem value="comment">Comment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1 space-y-2">
                      <Label>Required?</Label>
                      <Select
                        value={q.required ? "yes" : "no"}
                        onValueChange={v =>
                          updateQuestion(section.id, idx, "required", v === "yes")
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* DELETE BUTTON */}
                  <div className="flex justify-end">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteQuestion(section.id, idx)}
                      className="flex items-center gap-2"
                    >
                      <Trash className="w-4 h-4" /> Delete
                    </Button>
                  </div>
                </div>
              ))}

            </div>
          ))}

        </div>

        {/* SAVE BUTTONS */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Questions</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
