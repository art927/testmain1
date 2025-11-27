"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Send, AlertCircle } from "lucide-react"
import { sendRecognition, getRemainingRecognitions } from "@/app/recognition/actions"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import TeamMemberSelect from "@/components/team-member-select"

interface RecognitionFormProps {
  users: Array<{ id: string; full_name: string | null; email: string }>
}

export function RecognitionForm({ users }: RecognitionFormProps) {
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [remaining, setRemaining] = useState<number>(0)
  const [limit, setLimit] = useState<number>(0)
  const [used, setUsed] = useState<number>(0)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchLimits() {
      const result = await getRemainingRecognitions()
      setRemaining(result.remaining ?? 0)
      setLimit(result.limit ?? 0)
      setUsed(result.used ?? 0)
    }
    fetchLimits()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!selectedUser || !message.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a recipient and write a message",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    const formData = new FormData()
    formData.append("toUserId", selectedUser)
    formData.append("message", message)

    const result = await sendRecognition(formData)

    setIsSubmitting(false)

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Recognition sent!",
        description: "Your kudos has been sent successfully",
      })
      // Reset form
      setSelectedUser("")
      setMessage("")
      setRemaining(Math.max(0, remaining - 1))
      setUsed(used + 1)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {limit > 0 && (
        <Alert className={remaining === 0 ? "border-destructive" : ""}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <span className="font-medium">
              {remaining} of {limit} recognitions remaining this week
            </span>
            {remaining === 0 && (
              <span className="block text-sm mt-1">
                Your weekly limit has been reached. Resets in 7 days from your first recognition.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div>
        <Label htmlFor="recipient">Select Teammate</Label>
        <div className="mt-2">
          <TeamMemberSelect
            value={selectedUser}
            onChange={(id) => setSelectedUser(id)}
            placeholder="Choose a teammate on your team"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="message">Recognition Message</Label>
        <Textarea
          id="message"
          placeholder="Write a message to recognize their contribution..."
          className="mt-2 min-h-[120px]"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={remaining === 0}
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
        disabled={isSubmitting || remaining === 0}
      >
        <Send className="mr-2 h-4 w-4" />
        {isSubmitting ? "Sending..." : remaining === 0 ? "Weekly Limit Reached" : "Send Recognition"}
      </Button>
    </form>
  )
}
