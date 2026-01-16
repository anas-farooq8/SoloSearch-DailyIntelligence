"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { KPIStats } from "@/types/database"
import { TrendingUp, AlertTriangle, Clock, CalendarDays, ArrowUp, ArrowDown } from "lucide-react"

interface KPICardsProps {
  kpis?: KPIStats
  loading: boolean
}

interface CardData {
  title: string
  value: number
  yesterdayValue?: number
  icon: any
  color: string
  bg: string
  showComparison?: boolean
  comparisonLabel?: string
}

export function KPICards({ kpis, loading }: KPICardsProps) {
  const calculateChange = (today: number, yesterday: number): { percentage: number; isIncrease: boolean } => {
    if (yesterday === 0) {
      return { percentage: today > 0 ? 100 : 0, isIncrease: true }
    }
    const change = ((today - yesterday) / yesterday) * 100
    return { percentage: Math.abs(change), isIncrease: change >= 0 }
  }

  const cards: CardData[] = [
    {
      title: "Processed Today",
      value: kpis?.total_today ?? 0,
      yesterdayValue: kpis?.total_yesterday ?? 0,
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
      showComparison: true,
      comparisonLabel: "Yesterday",
    },
    {
      title: "High Priority Today",
      value: kpis?.high_priority_today ?? 0,
      yesterdayValue: kpis?.high_priority_yesterday ?? 0,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
      showComparison: true,
      comparisonLabel: "Yesterday",
    },
    {
      title: "Awaiting Review",
      value: kpis?.awaiting_review ?? 0,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      showComparison: false,
    },
    {
      title: "Weekly Added",
      value: kpis?.weekly_added ?? 0,
      yesterdayValue: kpis?.weekly_added_previous ?? 0,
      icon: CalendarDays,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      showComparison: true,
      comparisonLabel: "Last Week",
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
      {cards.map((card) => {
        const change = card.showComparison && card.yesterdayValue !== undefined
          ? calculateChange(card.value, card.yesterdayValue)
          : null

        return (
          <Card key={card.title} className="shadow-sm">
            <CardContent className="p-2.5 sm:p-3.5 md:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className={`p-1.5 sm:p-2 rounded-lg ${card.bg} flex-shrink-0`}>
                  <card.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 ${card.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] sm:text-xs md:text-sm text-slate-600 truncate">{card.title}</p>
                  {loading ? (
                    <>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <Skeleton className="h-5 sm:h-6 md:h-7 w-10 sm:w-14 md:w-16" />
                        {card.showComparison && (
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            <Skeleton className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded" />
                            <Skeleton className="h-4 sm:h-5 md:h-6 w-12 sm:w-14 md:w-16" />
                          </div>
                        )}
                      </div>
                      {card.showComparison && (
                        <Skeleton className="h-3 sm:h-4 w-24 sm:w-28 mt-1" />
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900">{card.value}</p>
                        {change && (
                          <div className={`flex items-center gap-0.5 flex-shrink-0 ${change.isIncrease ? 'text-green-600' : 'text-red-600'}`}>
                            {change.isIncrease ? (
                              <ArrowUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            ) : (
                              <ArrowDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            )}
                            <span className="text-sm sm:text-base md:text-lg font-bold">
                              {change.percentage.toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                      {card.showComparison && card.yesterdayValue !== undefined && (
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                          {card.comparisonLabel || "Yesterday"}: {card.yesterdayValue}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
