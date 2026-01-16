"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { KPIStats } from "@/types/database"
import { AlertTriangle, Clock, CalendarDays, ArrowUp, ArrowDown } from "lucide-react"

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
      title: "Weekly Added",
      value: kpis?.weekly_added ?? 0,
      yesterdayValue: kpis?.weekly_added_previous ?? 0,
      icon: CalendarDays,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      showComparison: true,
      comparisonLabel: "Last Week",
    },
    {
      title: "High Priority Weekly",
      value: kpis?.weekly_high_priority ?? 0,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
      showComparison: false,
    },
    {
      title: "Awaiting Review",
      value: kpis?.awaiting_review ?? 0,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      showComparison: false,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
      {cards.map((card, index) => {
        const change = card.showComparison && card.yesterdayValue !== undefined
          ? calculateChange(card.value, card.yesterdayValue)
          : null

        // First card (Weekly Added) spans 2 columns on mobile, 1 on desktop
        const isFirstCard = index === 0
        const cardClassName = isFirstCard ? "col-span-2 lg:col-span-1" : "col-span-1"

        // Calculate percentage for High Priority Weekly
        const isHighPriorityWeekly = card.title === "High Priority Weekly"
        const weeklyTotal = kpis?.weekly_added ?? 0
        const highPriorityPercentage = weeklyTotal > 0 
          ? Math.round((card.value / weeklyTotal) * 100)
          : 0

        return (
          <Card key={card.title} className={`shadow-sm ${cardClassName}`}>
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
                        {isHighPriorityWeekly ? (
                          <div className="flex items-baseline gap-1 sm:gap-2">
                            <Skeleton className="h-5 sm:h-6 md:h-7 w-10 sm:w-14 md:w-16" />
                            <Skeleton className="h-4 w-8 rounded-full" />
                          </div>
                        ) : (
                          <Skeleton className="h-5 sm:h-6 md:h-7 w-10 sm:w-14 md:w-16" />
                        )}
                        {card.showComparison && (
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            <Skeleton className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded" />
                            <Skeleton className="h-4 sm:h-5 md:h-6 w-12 sm:w-14 md:w-16" />
                          </div>
                        )}
                      </div>
                      {(card.showComparison || isHighPriorityWeekly) && (
                        <Skeleton className="h-3 sm:h-4 w-24 sm:w-28 mt-1" />
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        {isHighPriorityWeekly ? (
                          <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900">{card.value}</p>
                            <span className="text-[10px] sm:text-xs md:text-sm text-red-600 font-medium bg-red-100 px-1 sm:px-2 py-0.5 sm:py-1 rounded-full">
                              ≥ 7
                            </span>
                          </div>
                        ) : (
                          <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900">{card.value}</p>
                        )}
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
                      {isHighPriorityWeekly ? (
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                          {weeklyTotal > 0 
                            ? `${highPriorityPercentage}% of total`
                            : "No data"
                          }
                        </p>
                      ) : card.showComparison && card.yesterdayValue !== undefined ? (
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                          {card.comparisonLabel || "Yesterday"}: {card.yesterdayValue}
                        </p>
                      ) : null}
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
