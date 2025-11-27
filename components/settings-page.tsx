"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Bell, Slack, Github, Calendar, Shield, Palette, Zap, CheckCircle, ExternalLink } from "lucide-react"

export default function SettingsPage({ user }: { user: any }) {
  const [notifications, setNotifications] = useState({
    points: true,
    recognition: true,
    milestones: true,
    surveys: false,
  })
  const [language, setLanguage] = useState("en")
  const [integrations, setIntegrations] = useState({
    slack: false,
    jira: false,
    calendar: true,
  })
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState("")
  const { toast } = useToast()

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }))
    toast({
      title: "Settings Updated",
      description: `${key} notifications ${value ? "enabled" : "disabled"}`,
    })
  }

  const handleIntegrationToggle = (integration: string) => {
    if (!integrations[integration as keyof typeof integrations]) {
      setSelectedIntegration(integration)
      setShowAuthModal(true)
    } else {
      setIntegrations((prev) => ({ ...prev, [integration]: false }))
      toast({
        title: "Integration Disconnected",
        description: `${integration} has been disconnected from your account`,
      })
    }
  }

  const handleConnect = () => {
    setIntegrations((prev) => ({ ...prev, [selectedIntegration]: true }))
    setShowAuthModal(false)
    toast({
      title: "Integration Connected! 🎉",
      description: `${selectedIntegration} is now connected to your TeamPulse account`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Customize your TeamPulse experience and manage integrations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </CardTitle>
            <CardDescription>Choose what notifications you'd like to receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Points Earned</Label>
                <p className="text-sm text-muted-foreground">Get notified when you earn points</p>
              </div>
              <Switch
                checked={notifications.points}
                onCheckedChange={(value) => handleNotificationChange("points", value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Recognition Received</Label>
                <p className="text-sm text-muted-foreground">Alerts for kudos and mentions</p>
              </div>
              <Switch
                checked={notifications.recognition}
                onCheckedChange={(value) => handleNotificationChange("recognition", value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Milestone Achievements</Label>
                <p className="text-sm text-muted-foreground">Celebrate when you reach milestones</p>
              </div>
              <Switch
                checked={notifications.milestones}
                onCheckedChange={(value) => handleNotificationChange("milestones", value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Survey Reminders</Label>
                <p className="text-sm text-muted-foreground">Daily engagement survey prompts</p>
              </div>
              <Switch
                checked={notifications.surveys}
                onCheckedChange={(value) => handleNotificationChange("surveys", value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <span>Preferences</span>
            </CardTitle>
            <CardDescription>Personalize your app experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">🇺🇸 English</SelectItem>
                  <SelectItem value="es">🇪🇸 Spanish</SelectItem>
                  <SelectItem value="fr">🇫🇷 French (Coming Soon)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Time Zone</Label>
              <Select defaultValue="pst">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pst">Pacific Standard Time</SelectItem>
                  <SelectItem value="est">Eastern Standard Time</SelectItem>
                  <SelectItem value="cst">Central Standard Time</SelectItem>
                  <SelectItem value="mst">Mountain Standard Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                🌟 <strong>AI Personalization:</strong> TeamPulse learns from your activity to provide better
                recommendations and insights.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Integrations</span>
          </CardTitle>
          <CardDescription>Connect TeamPulse with your favorite work tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Slack Integration */}
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-primary/10 rounded-lg p-2">
                    <Slack className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Slack</h3>
                    <p className="text-xs text-muted-foreground">Get notifications in Slack</p>
                  </div>
                  {integrations.slack && <CheckCircle className="h-4 w-4 text-secondary" />}
                </div>
                <Button
                  variant={integrations.slack ? "outline" : "default"}
                  size="sm"
                  className="w-full"
                  onClick={() => handleIntegrationToggle("slack")}
                >
                  {integrations.slack ? "Disconnect" : "Connect"}
                </Button>
              </CardContent>
            </Card>

            {/* Jira Integration */}
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-primary/10 rounded-lg p-2">
                    <Github className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Jira</h3>
                    <p className="text-xs text-muted-foreground">Sync tasks and projects</p>
                  </div>
                  {integrations.jira && <CheckCircle className="h-4 w-4 text-secondary" />}
                </div>
                <Button
                  variant={integrations.jira ? "outline" : "default"}
                  size="sm"
                  className="w-full"
                  onClick={() => handleIntegrationToggle("jira")}
                >
                  {integrations.jira ? "Disconnect" : "Connect"}
                </Button>
              </CardContent>
            </Card>

            {/* Calendar Integration */}
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-secondary/10 rounded-lg p-2">
                    <Calendar className="h-6 w-6 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Calendar</h3>
                    <p className="text-xs text-muted-foreground">Schedule reminders</p>
                  </div>
                  {integrations.calendar && <CheckCircle className="h-4 w-4 text-secondary" />}
                </div>
                <Button
                  variant={integrations.calendar ? "outline" : "default"}
                  size="sm"
                  className="w-full"
                  onClick={() => handleIntegrationToggle("calendar")}
                >
                  {integrations.calendar ? "Connected" : "Connect"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              🔒 <strong>Privacy:</strong> All integrations use secure OAuth authentication. TeamPulse only accesses the
              minimum data required for functionality.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Mock Auth Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect {selectedIntegration}</DialogTitle>
            <DialogDescription>
              Authorize TeamPulse to connect with your {selectedIntegration} account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Secure Connection</p>
                <p className="text-xs text-muted-foreground">This connection is encrypted and secure</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>TeamPulse will be able to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Send notifications about your achievements</li>
                <li>Sync task completion status</li>
                <li>Access basic profile information</li>
              </ul>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowAuthModal(false)}>
              Cancel
            </Button>
            <Button className="flex-1 bg-secondary hover:bg-secondary/90" onClick={handleConnect}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Authorize & Connect
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
