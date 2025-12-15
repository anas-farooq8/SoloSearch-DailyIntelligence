"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { KPIStats } from "@/types/database"
import { TrendingUp, AlertTriangle, Clock, CalendarDays } from "lucide-react"

interface KPICardsProps {
  kpis?: KPIStats
  loading: boolean
}

export function KPICards({ kpis, loading }: KPICardsProps) {
  const cards = [
    {
      title: "Processed Today",
      value: kpis?.total_today ?? 0,
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "High Priority Today",
      value: kpis?.high_priority_today ?? 0,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "Awaiting Review",
      value: kpis?.awaiting_review ?? 0,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Weekly Added",
      value: kpis?.weekly_added ?? 0,
      icon: CalendarDays,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`p-2 rounded-lg ${card.bg} flex-shrink-0`}>
                <card.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${card.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-slate-600 truncate">{card.title}</p>
                {loading ? (
                  <Skeleton className="h-6 sm:h-7 w-12 sm:w-16 mt-1" />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">{card.value}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
