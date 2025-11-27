"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Shield } from "lucide-react"

interface NavHeaderProps {
  user?: {
    email?: string
    full_name?: string
  }
  points: number
  role?: string
}

export function NavHeader({ user, points, role }: NavHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  // safe fallback for name
  const displayName =
    user?.full_name ||
    user?.email ||
    ""

  const initials = displayName
    ? displayName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : "?"

  const displayEmail = user?.email || ""

  const isManager = role === "manager" || role === "admin"

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-[15px]">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">T</span>
            </div>
            <span className="font-bold text-xl">TeamPulse</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
              Dashboard
            </Link>
            <Link href="/points" className="text-sm font-medium transition-colors hover:text-primary">
              Points & Rewards
            </Link>
            <Link href="/tasks" className="text-sm font-medium transition-colors hover:text-primary">
              Open Tasks
            </Link>
            <Link href="/survey" className="text-sm font-medium transition-colors hover:text-primary">
              Daily Survey
            </Link>
            <Link href="/recognition" className="text-sm font-medium transition-colors hover:text-primary">
              Recognition
            </Link>
            {isManager && (
              <Link
                href="/manager"
                className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1.5"
              >
                <Shield className="h-4 w-4" />
                Manager
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-secondary/20 rounded-full">
            <span className="text-2xl">⭐</span>
            <span className="font-bold text-lg">{points}</span>
            <span className="text-sm text-muted-foreground">points</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{displayEmail}</p>
                  {isManager && (
                    <p className="text-xs text-purple-400 flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Manager
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="sm:hidden">
                <span className="flex items-center gap-2">
                  <span className="text-xl">⭐</span>
                  <span className="font-bold">{points}</span>
                  <span className="text-muted-foreground">points</span>
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="sm:hidden" />
              <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
