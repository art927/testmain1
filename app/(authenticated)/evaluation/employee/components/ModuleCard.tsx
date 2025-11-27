"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight } from "lucide-react"

type Props = {
  module: any
  isOpen: boolean
  href: string
}

export default function ModuleCard({ module, isOpen, href }: Props) {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{module.name}</h2>

          {isOpen ? (
            <Badge className="mt-2 bg-green-600">Open</Badge>
          ) : (
            <Badge variant="secondary" className="mt-2">
              Closed
            </Badge>
          )}
        </div>

        <Link href={href}>
          <Button variant="default" disabled={!isOpen}>
            Start <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
