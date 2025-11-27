"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Users, Trash2, UserPlus, Copy, Check, Mail } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { removeMember, createInvitation } from "@/app/(authenticated)/settings/actions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type TeamMember = {
  id: string
  user_id: string
  role: string
  joined_at: string
  profiles: {
    id: string
    full_name: string | null
    email: string | null
    role: string
  }
}

type Team = {
  id: string
  name: string
  invite_code: string
  description: string | null
}

interface TeamManagementProps {
  team: Team
  members: TeamMember[]
  currentUserId: string
}

export function TeamManagement({ team, members, currentUserId }: TeamManagementProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [inviteLink, setInviteLink] = useState("")
  const { toast } = useToast()

  const publicInviteLink = typeof window !== "undefined" 
    ? `${window.location.origin}/accept-invite?code=${team.invite_code}` 
    : ""

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await createInvitation(team.id, email)
      
      if (result.error) {
        throw new Error(result.error)
      }

      const newInviteLink = `${window.location.origin}/accept-invite?code=${result.inviteCode}`
      setInviteLink(newInviteLink)

      toast({
        title: "Invitation Created!",
        description: `An invitation has been created for ${email}`,
      })

      setEmail("")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create invitation",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    try {
      const result = await removeMember(team.id, memberId)
      
      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Member Removed",
        description: `${memberName} has been removed from the team`,
      })

      // Refresh the page to show updated members
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove member",
        variant: "destructive",
      })
    }
  }

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link)
    setCopied(true)
    toast({
      title: "Link Copied!",
      description: "Invitation link copied to clipboard",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <CardTitle>Team Management</CardTitle>
        </div>
        <CardDescription>Manage your team members and invitations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Team Summary */}
        <div className="space-y-2">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Team Name</Label>
            <p className="text-lg font-semibold">{team.name}</p>
          </div>
          {team.description && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Description</Label>
              <p className="text-sm">{team.description}</p>
            </div>
          )}
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Team ID</Label>
            <p className="text-sm font-mono">{team.id}</p>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Team Members ({members.length})</h3>
          
          {/* Team Members Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => {
                  const isCurrentUser = member.user_id === currentUserId
                  return (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.profiles.full_name || "Unknown"}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                        )}
                      </TableCell>
                      <TableCell>{member.profiles.email}</TableCell>
                      <TableCell className="capitalize">{member.profiles.role}</TableCell>
                      <TableCell className="text-right">
                        {!isCurrentUser && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove {member.profiles.full_name || member.profiles.email} from the team? 
                                  Their profile and account will remain intact.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRemoveMember(member.user_id, member.profiles.full_name || member.profiles.email || 'Member')}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Invite New Members</h3>
          
          <form onSubmit={handleSendInvite} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="colleague@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={isLoading}>
              <UserPlus className="h-4 w-4 mr-2" />
              {isLoading ? "Creating Invitation..." : "Create Invitation"}
            </Button>
          </form>

          {inviteLink && (
            <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
              <Label className="text-sm font-medium">Invitation Link Created</Label>
              <div className="flex gap-2">
                <Input value={inviteLink} readOnly className="font-mono text-sm" />
                <Button type="button" size="icon" variant="outline" onClick={() => copyLink(inviteLink)}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Share this link with the new member</p>
            </div>
          )}

          <div className="mt-6 space-y-2">
            <Label className="text-sm font-medium">Team Invite Link</Label>
            <div className="flex gap-2">
              <Input value={publicInviteLink} readOnly className="font-mono text-sm" />
              <Button type="button" size="icon" variant="outline" onClick={() => copyLink(publicInviteLink)}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Anyone with this link can join your team</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
