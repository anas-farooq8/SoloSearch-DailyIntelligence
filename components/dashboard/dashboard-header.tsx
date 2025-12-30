"use client"

import { Button } from "@/components/ui/button"
import { LogOut, Tags, HelpCircle } from "lucide-react"
import Image from "next/image"

interface DashboardHeaderProps {
  onSignOut: () => void
  onManageTags: () => void
  onShowGuide: () => void
}

export function DashboardHeader({ onSignOut, onManageTags, onShowGuide }: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="w-full px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <Image
            src="https://www.google.com/s2/favicons?domain=https://www.solosearch.co.uk/&sz=64"
            alt="SoloSearch Logo"
            width={32}
            height={32}
            className="rounded flex-shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg md:text-xl font-bold text-slate-900 truncate">SoloSearch-DailyIntelligence</h1>
            <p className="text-xs sm:text-sm text-slate-600 hidden sm:block">Daily Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={onShowGuide} className="h-8 sm:h-9">
            <HelpCircle className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">How It Works</span>
          </Button>
          <Button variant="outline" size="sm" onClick={onManageTags} className="h-8 sm:h-9">
            <Tags className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Manage Tags</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={onSignOut} className="h-8 sm:h-9">
            <LogOut className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
