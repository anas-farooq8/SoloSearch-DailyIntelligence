"use client"

import { useState, useMemo, useCallback } from "react"
import useSWR from "swr"
import { Card } from "@/components/ui/card"
import { DateRangePicker, DateRange } from "@/components/ui/date-range-picker"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { subDays, format, startOfDay, endOfDay, eachDayOfInterval, isWithinInterval } from "date-fns"
import { TrendingUp, TrendingDown, Award, CheckCircle, Clock } from "lucide-react"

interface AnalyticsArticle {
  id: string
  source: string
  group_name: string
  processed_at: string
  lead_score: number
  trigger_signal: string[]
  tags: Array<{ id: string; name: string }>
}

interface AnalyticsData {
  articles: AnalyticsArticle[]
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
]

export function AnalyticsClient() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(subDays(new Date(), 30)),
    to: endOfDay(new Date()),
  })

  const { data, isLoading } = useSWR<AnalyticsData>("/api/analytics", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // Cache for 1 minute
  })

  // Filter articles by date range
  const filteredArticles = useMemo(() => {
    if (!data?.articles) return []
    
    return data.articles.filter((article) => {
      if (!article.processed_at) return false
      const articleDate = new Date(article.processed_at)
      return isWithinInterval(articleDate, { start: dateRange.from, end: dateRange.to })
    })
  }, [data?.articles, dateRange])

  // 1. Top-Level Snapshot
  const topLevelStats = useMemo(() => {
    const total = filteredArticles.length
    const highPriority = filteredArticles.filter((a) => a.lead_score >= 7).length
    const actioned = filteredArticles.filter((a) => {
      const tags = a.tags || []
      return tags.some((tag) => 
        tag.name.toLowerCase() === "to be actioned" || 
        tag.name.toLowerCase() === "for info"
      )
    }).length
    
    // New today
    const todayStart = startOfDay(new Date())
    const newToday = filteredArticles.filter((a) => {
      const articleDate = new Date(a.processed_at)
      return articleDate >= todayStart
    }).length

    return { total, highPriority, actioned, newToday }
  }, [filteredArticles])

  // 2. Opportunities by Group
  const groupData = useMemo(() => {
    const groups: Record<string, number> = {}
    
    filteredArticles.forEach((article) => {
      const group = article.group_name || "Unknown"
      groups[group] = (groups[group] || 0) + 1
    })

    return Object.entries(groups)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filteredArticles])

  // 3. Opportunities by Source
  const sourceData = useMemo(() => {
    const sources: Record<string, number> = {}
    
    filteredArticles.forEach((article) => {
      const source = article.source || "Unknown"
      sources[source] = (sources[source] || 0) + 1
    })

    return Object.entries(sources)
      .map(([name, opportunities]) => ({ name, opportunities }))
      .sort((a, b) => b.opportunities - a.opportunities)
      .slice(0, 10) // Top 10 sources
  }, [filteredArticles])

  // 4. Trigger/Signal Breakdown
  const triggerData = useMemo(() => {
    const triggers: Record<string, number> = {}
    
    filteredArticles.forEach((article) => {
      const articleTriggers = article.trigger_signal || []
      articleTriggers.forEach((trigger) => {
        triggers[trigger] = (triggers[trigger] || 0) + 1
      })
    })

    const total = Object.values(triggers).reduce((sum, val) => sum + val, 0)

    return Object.entries(triggers)
      .map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8) // Top 8 triggers
  }, [filteredArticles])

  // 5. Scoring Distribution
  const scoreData = useMemo(() => {
    const buckets = {
      "9-10": 0,
      "7-8": 0,
      "5-6": 0,
      "3-4": 0,
      "0-2": 0,
    }

    filteredArticles.forEach((article) => {
      const score = article.lead_score || 0
      if (score >= 9) buckets["9-10"]++
      else if (score >= 7) buckets["7-8"]++
      else if (score >= 5) buckets["5-6"]++
      else if (score >= 3) buckets["3-4"]++
      else buckets["0-2"]++
    })

    return Object.entries(buckets).map(([range, count]) => ({ range, count }))
  }, [filteredArticles])

  // 6. Engagement/Action Tracking
  const engagementData = useMemo(() => {
    let toBeActioned = 0
    let forInfo = 0
    let notRelevant = 0
    let untagged = 0

    filteredArticles.forEach((article) => {
      const tags = article.tags || []
      if (tags.length === 0) {
        untagged++
      } else {
        const hasToBeActioned = tags.some((tag) => tag.name.toLowerCase() === "to be actioned")
        const hasForInfo = tags.some((tag) => tag.name.toLowerCase() === "for info")
        const hasNotRelevant = tags.some((tag) => tag.name.toLowerCase() === "not relevant")
        
        if (hasToBeActioned) toBeActioned++
        if (hasForInfo) forInfo++
        if (hasNotRelevant) notRelevant++
      }
    })

    return [
      { name: "To be Actioned", value: toBeActioned, color: "#10b981" },
      { name: "For Info", value: forInfo, color: "#3b82f6" },
      { name: "Not Relevant", value: notRelevant, color: "#ef4444" },
      { name: "Untagged", value: untagged, color: "#94a3b8" },
    ]
  }, [filteredArticles])

  // 7. Time Trend
  const timeTrendData = useMemo(() => {
    const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to })
    
    const trend = days.map((day) => {
      const dayStart = startOfDay(day)
      const dayEnd = endOfDay(day)
      
      const count = filteredArticles.filter((article) => {
        const articleDate = new Date(article.processed_at)
        return articleDate >= dayStart && articleDate <= dayEnd
      }).length

      return {
        date: format(day, "MMM d"),
        opportunities: count,
      }
    })

    // If more than 30 days, sample every few days to avoid overcrowding
    if (trend.length > 30) {
      const step = Math.ceil(trend.length / 30)
      return trend.filter((_, index) => index % step === 0)
    }

    return trend
  }, [filteredArticles, dateRange])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 px-3 sm:px-6 py-4 sm:py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Analytics</h1>
            <p className="text-slate-600 mt-1 text-sm sm:text-base">
              Comprehensive insights into your opportunities
            </p>
          </div>
          <div className="flex-shrink-0">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>
        </div>
      </div>

      <main className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* 1. Top-Level Snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Total Opportunities</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {topLevelStats.total}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BarChart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">High-Priority</p>
              <p className="text-xs text-slate-500">(Score ≥ 7)</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                {topLevelStats.highPriority}
              </p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <Award className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Actioned</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {topLevelStats.actioned}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">New Today</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {topLevelStats.newToday}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

        {/* 2. Opportunities by Group & 4. Trigger Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Opportunities by Group
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={groupData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Trigger/Signal Breakdown
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={triggerData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry: any) => `${entry.name}: ${entry.percentage}%`}
              >
                {triggerData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

        {/* 3. Opportunities by Source */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Top Sources
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={sourceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="opportunities" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

        {/* 5. Scoring Distribution & 6. Engagement Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Score Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scoreData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Engagement Tracking
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={engagementData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry: any) => `${entry.name}: ${entry.value}`}
              >
                {engagementData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

        {/* 7. Time Trend */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Opportunities Over Time
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="opportunities"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </main>
    </div>
  )
}
