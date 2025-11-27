"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type Props = {
  question: any
  score: number | string
  comment: string
  onScoreChange: (value: number) => void
  onCommentChange: (value: string) => void
}

export default function QuestionCard({
  question,
  score,
  comment,
  onScoreChange,
  onCommentChange,
}: Props) {
  return (
    <Card className="border border-gray-200">
      <CardContent className="p-5 space-y-4">

        {/* Question text directly from DB */}
        <p className="font-medium text-lg">
          {question.question_text}
        </p>

        {/* SCORE INPUT */}
        {question.question_type === "rating" && (
          <Input
            type="number"
            min={1}
            max={10}
            value={score}
            placeholder="Score (1–10)"
            onChange={(e) => onScoreChange(Number(e.target.value))}
          />
        )}

        {/* COMMENT INPUT */}
        {/* <Textarea
          placeholder="Add an optional comment…"
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
        /> */}
      </CardContent>
    </Card>
  )
}
