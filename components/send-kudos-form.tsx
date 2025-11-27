"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

interface Employee {
  id: string
  full_name: string | null
  email: string | null
}

export function SendKudosForm({ employees }: { employees: Employee[] }) {
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase.from("recognitions").insert({
        from_user_id: user.id,
        to_user_id: selectedEmployee,
        message,
      })

      if (error) throw error

      toast({
        title: "Kudos sent! 🎉",
        description: "Your recognition has been sent to the team member.",
      })

      setSelectedEmployee("")
      setMessage("")
      router.refresh()
    } catch (error) {
      console.error("Error sending kudos:", error)
      toast({
        title: "Error",
        description: "Failed to send kudos. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="employee">Select Employee</Label>
        <Select value={selectedEmployee} onValueChange={setSelectedEmployee} required>
          <SelectTrigger id="employee">
            <SelectValue placeholder="Choose a team member" />
          </SelectTrigger>
          <SelectContent>
            {employees.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.full_name || employee.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Recognition Message</Label>
        <Textarea
          id="message"
          placeholder="Write a message recognizing their great work..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={4}
        />
      </div>

      <Button type="submit" disabled={isLoading || !selectedEmployee} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          "Send Kudos"
        )}
      </Button>
    </form>
  )
}
