"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Mail, Send, CheckCircle2, Clock, UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Invitation {
  id: string
  email: string
  role: string
  status: "pending" | "accepted"
  sentAt: string
  inviteLink: string
}

export default function UserInvitation() {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("learner")
  const [invitations, setInvitations] = useState<Invitation[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("teampulse-invitations")
      return stored ? JSON.parse(stored) : []
    }
    return []
  })
  const { toast } = useToast()

  const generateInviteLink = () => {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    return `${window.location.origin}/signup?invite=${token}`
  }

  const handleSendInvite = () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    const newInvitation: Invitation = {
      id: Date.now().toString(),
      email,
      role,
      status: "pending",
      sentAt: new Date().toISOString(),
      inviteLink: generateInviteLink(),
    }

    const updatedInvitations = [...invitations, newInvitation]
    setInvitations(updatedInvitations)
    localStorage.setItem("teampulse-invitations", JSON.stringify(updatedInvitations))

    toast({
      title: "Invitation Sent!",
      description: `An invitation has been sent to ${email}`,
    })

    // Reset form
    setEmail("")
    setRole("learner")
  }

  const copyInviteLink = (link: string) => {
    navigator.clipboard.writeText(link)
    toast({
      title: "Link Copied!",
      description: "Invitation link copied to clipboard",
    })
  }

  return (
    <div className="space-y-6">
      {/* Invite Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Invite Users
          </CardTitle>
          <CardDescription>Send invitations to new team members to join TeamPulse</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="learner">Learner</SelectItem>
                  <SelectItem value="mentor">Mentor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSendInvite} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            Send Invitation
          </Button>
        </CardContent>
      </Card>

      {/* Invitations Table */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sent Invitations</CardTitle>
            <CardDescription>Track the status of all sent invitations</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="font-medium">{invitation.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {invitation.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {invitation.status === "pending" ? (
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          Pending
                        </Badge>
                      ) : (
                        <Badge className="bg-secondary text-secondary-foreground gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Accepted
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(invitation.sentAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => copyInviteLink(invitation.inviteLink)}>
                        Copy Link
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
