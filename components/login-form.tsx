"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Zap, Users, Trophy } from "lucide-react"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate login delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock authentication
    localStorage.setItem(
      "teampulse-auth",
      JSON.stringify({
        email,
        name: "Alex Johnson",
        points: 150,
        level: "Rising Star",
      }),
    )

    setIsLoading(false)
    router.push("/dashboard")
  }

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Logo and branding */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="bg-primary rounded-lg p-2">
            <Zap className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">TeamPulse</h1>
        </div>
        <p className="text-muted-foreground">AI-powered employee engagement platform</p>

        {/* Feature highlights */}
        <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Trophy className="h-4 w-4 text-secondary" />
            <span>Earn Points</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4 text-secondary" />
            <span>Get Recognition</span>
          </div>
          <div className="flex items-center space-x-1">
            <Zap className="h-4 w-4 text-secondary" />
            <span>AI Insights</span>
          </div>
        </div>
      </div>

      <Card className="border-border/50 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">Sign in to your TeamPulse account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="alex@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-input"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">Demo credentials: any email and password</div>
        </CardContent>
      </Card>
    </div>
  )
}
