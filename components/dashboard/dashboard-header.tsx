"use client"

import { Button } from "@/components/ui/button"
import { LogOut, Tags } from "lucide-react"
import Image from "next/image"

interface DashboardHeaderProps {
  onSignOut: () => void
  onManageTags: () => void
}

export function DashboardHeader({ onSignOut, onManageTags }: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="https://www.google.com/s2/favicons?domain=https://www.solosearch.co.uk/&sz=64"
            alt="SoloSearch Logo"
            width={32}
            height={32}
            className="rounded"
          />
          <div>
            <h1 className="text-xl font-bold text-slate-900">SoloSearch-DailyIntelligence</h1>
            <p className="text-sm text-slate-600">Daily Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onManageTags}>
            <Tags className="h-4 w-4 mr-2" />
            Manage Tags
          </Button>
          <Button variant="ghost" size="sm" onClick={onSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  )
}
