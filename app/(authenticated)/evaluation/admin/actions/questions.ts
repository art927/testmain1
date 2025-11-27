"use server"

import { createClient } from "@/lib/supabase/server"

export async function saveQuestionsToDB({
  moduleId,
  questions,
}: {
  moduleId: string
  questions: any[]
}) {
  const supabase = await createClient()

  // Delete old questions
  await supabase
    .from("evaluation_questions")
    .delete()
    .eq("module_id", moduleId)

  // Insert new ones
  const insertData = questions.map((q, i) => ({
    id: q.id,
    module_id: moduleId,
    section_id: q.section_id,
    question_text: q.question_text,
    question_type: q.type,
    is_required: q.required,
    question_order: i + 1,
  }))

  const { error } = await supabase
    .from("evaluation_questions")
    .insert(insertData)

  if (error) {
    console.error("Failed to save questions:", error)
    throw error
  }

  return true
}
