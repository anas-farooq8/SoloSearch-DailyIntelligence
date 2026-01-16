"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import { Card } from "@/components/ui/card"
import { DateRange, DateRangePicker } from "@/components/ui/date-range-picker"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { subDays, format, startOfDay, endOfDay, eachDayOfInterval, isWithinInterval } from "date-fns"
import { TrendingUp, CheckCircle, Sparkles, Target, BarChart3, Calendar } from "lucide-react"
import { getGroupDisplayName, CHART_COLORS, UNTAGGED_TAG, CHART_STYLES } from "@/lib/constants"
import { useIsDesktop } from "@/lib/hooks/use-media-query"

interface AnalyticsArticle {
  id: string
  source: string
  group_name: string
  processed_at: string
  lead_score: number
  trigger_signal: string[]
  tags: Array<{ id: string; name: string; color: string; is_default: boolean }>
}

interface AnalyticsData {
  articles: AnalyticsArticle[]
  earliestArticleDate: string | null
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

// Note: CHART_COLORS is now imported from @/lib/constants

// Normalize source names for display
const normalizeSourceName = (source: string): string => {
  if (!source) return "Unknown"
  
  // Replace underscores with spaces and capitalize each word
  return source
    .replace(/_/g, " ")
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

// Note: getGroupDisplayName is now imported from @/lib/constants

export function AnalyticsClient() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(subDays(new Date(), 30)),
    to: endOfDay(new Date()),
  })
  const [showAllSources, setShowAllSources] = useState(false)
  const isDesktop = useIsDesktop()

  const { data, isLoading } = useSWR<AnalyticsData>("/api/analytics", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 300000, // Cache for 5 minutes (300 seconds)
    keepPreviousData: true, // Keep previous data while fetching new data
  })

  // Filter articles by date range
  // dateRange.from: Start of selected date (00:00:00.000)
  // dateRange.to: End of selected date (23:59:59.999)
  // isWithinInterval checks if articleDate >= start AND articleDate <= end
  const filteredArticles = useMemo(() => {
    if (!data?.articles) return []
    
    return data.articles.filter((article) => {
      if (!article.processed_at) return false
      const articleDate = new Date(article.processed_at)
      return isWithinInterval(articleDate, { start: dateRange.from, end: dateRange.to })
    })
  }, [data?.articles, dateRange])

  // 1. Top-Level Snapshot - Using dashboard's calculation approach
  const topLevelStats = useMemo(() => {
    // Helper to get article timestamp
    const getProcessedTime = (article: AnalyticsArticle) => {
      const timestamp = article.processed_at
      return timestamp ? new Date(timestamp).getTime() : null
    }

    // Calculate start of today (00:00:00) like dashboard does
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTime = today.getTime()
    
    // Total within filtered date range
    const total = filteredArticles.length
    
    // High-Priority (score >= 7) within filtered date range
    const highPriority = filteredArticles.filter((a) => a.lead_score >= 7).length
    
    // "Actioned" = articles with "Completed" tag (marked as completed/done)
    // These represent opportunities that have been fully acted upon and completed
    const actioned = filteredArticles.filter((a) => {
      const tags = a.tags || []
      return tags.some((tag) => tag.name.toLowerCase() === "completed")
    }).length
    
    // New today (from start of day 00:00:00 to now) - matching dashboard logic
    const newToday = filteredArticles.filter((a) => {
      const articleTime = getProcessedTime(a)
      return articleTime !== null && articleTime >= todayTime
    }).length

    return { total, highPriority, actioned, newToday }
  }, [filteredArticles])

  // 2. Opportunities by Group
  const groupData = useMemo(() => {
    const groups: Record<string, number> = {}
    
    filteredArticles.forEach((article) => {
      const groupName = getGroupDisplayName(article.group_name || "")
      groups[groupName] = (groups[groupName] || 0) + 1
    })

    return Object.entries(groups)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filteredArticles])

  // 3. Opportunities by Source
  const sourceData = useMemo(() => {
    const sources: Record<string, number> = {}
    
    filteredArticles.forEach((article) => {
      const sourceName = normalizeSourceName(article.source || "")
      sources[sourceName] = (sources[sourceName] || 0) + 1
    })

    return Object.entries(sources)
      .map(([name, opportunities]) => ({ name, opportunities }))
      .sort((a, b) => b.opportunities - a.opportunities)
      .slice(0, 10) // Top 10 sources
  }, [filteredArticles])

  // 4. Trigger/Signal Breakdown - Show TOP 8 triggers
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
      .slice(0, 8) // Show top 8 triggers
  }, [filteredArticles])

  // 5. Scoring Distribution - Updated buckets: 5-6, 7-8, 9, 10
  const scoreData = useMemo(() => {
    const buckets = {
      "10": 0,
      "9": 0,
      "7-8": 0,
      "5-6": 0,
    }

    filteredArticles.forEach((article) => {
      const score = article.lead_score || 0
      if (score === 10) buckets["10"]++
      else if (score === 9) buckets["9"]++
      else if (score >= 7 && score < 9) buckets["7-8"]++
      else if (score >= 5 && score < 7) buckets["5-6"]++
    })

    // Return in reverse order for display (10 at top)
    return [
      { range: "10", count: buckets["10"] },
      { range: "9", count: buckets["9"] },
      { range: "7-8", count: buckets["7-8"] },
      { range: "5-6", count: buckets["5-6"] },
    ]
  }, [filteredArticles])

  // 6. Engagement/Action Tracking - Dynamic default tags from database
  const engagementData = useMemo(() => {
    // Get all unique default tags from articles
    const defaultTagsMap = new Map<string, { name: string; color: string; count: number }>()
    
    // Count articles for each default tag
    filteredArticles.forEach((article) => {
      const tags = article.tags || []
      const defaultTags = tags.filter((tag) => tag.is_default)
      
      if (defaultTags.length > 0) {
        // Count the first default tag found (articles should have only one default tag)
        const tag = defaultTags[0]
        const key = tag.name.toLowerCase()
        if (defaultTagsMap.has(key)) {
          defaultTagsMap.get(key)!.count++
        } else {
          defaultTagsMap.set(key, {
            name: tag.name,
            color: tag.color,
            count: 1
          })
        }
      }
    })
    
    // Count untagged articles (no tags at all)
    const untaggedCount = filteredArticles.filter((a) => !a.tags || a.tags.length === 0).length
    
    // Convert to array format and add untagged
    const result = Array.from(defaultTagsMap.values()).map(tag => ({
      name: tag.name,
      value: tag.count,
      color: tag.color
    }))
    
    // Add untagged at the end (using shared constant)
    if (untaggedCount > 0 || result.length === 0) {
      result.push({
        name: UNTAGGED_TAG.name,
        value: untaggedCount,
        color: UNTAGGED_TAG.color
      })
    }
    
    // Sort by value descending
    const sorted = result.sort((a, b) => b.value - a.value)
    
    // Calculate total and add percentage
    const total = sorted.reduce((sum, item) => sum + item.value, 0)
    return sorted.map(item => ({
      ...item,
      percentage: total > 0 ? Math.round((item.value / total) * 100) : 0
    }))
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

  // Skeleton Loading Component - matching dashboard style
  // Only show skeleton when truly loading (no cached data)
  // Show skeleton only if loading AND no cached data exists
  if (isLoading && !data) {
    return (
      <div className="min-h-screen">
        {/* Page Header - Show actual content, not skeleton */}
        <div className="bg-white border-b border-slate-200 px-3 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between gap-4 page-header-content">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="hidden sm:flex h-7 w-7 text-blue-600" />
                <h1 className="text-lg sm:text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
              </div>
              <p className="text-slate-600 text-xs sm:text-base">
                Comprehensive insights and performance metrics
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-64" />
            </div>
          </div>
        </div>

        <main className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {/* KPI Cards Skeleton - Show titles and icons */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {[
              { title: "Total", icon: TrendingUp, bg: "bg-blue-600" },
              { title: "High Priority", icon: Target, bg: "bg-amber-600" },
              { title: "Actioned", icon: CheckCircle, bg: "bg-green-600" },
              { title: "New Today", icon: Calendar, bg: "bg-purple-600" },
            ].map((card, i) => (
              <Card key={i} className="shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-slate-50 to-white">
                <div className="p-2.5 sm:p-4 md:p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 font-semibold uppercase tracking-wide mb-1 sm:mb-2 truncate">
                        {card.title}
                      </p>
                      <Skeleton className="h-6 sm:h-8 md:h-10 w-12 sm:w-16 md:w-20 mb-0.5 sm:mb-1" />
                      <Skeleton className="h-2.5 sm:h-3 md:h-3.5 w-20 sm:w-24 md:w-32" />
                    </div>
                    <div className={`p-1.5 sm:p-2 md:p-3 ${card.bg} rounded-lg sm:rounded-xl shadow-lg flex-shrink-0`}>
                      <card.icon className="h-3.5 w-3.5 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card className="shadow-sm">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">Opportunities by Group</h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">Distribution across source groups</p>
                  </div>
                </div>
                <Skeleton className="h-[340px] w-full" />
              </div>
            </Card>
            
            <Card className="shadow-sm">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">Trigger/Signal Breakdown</h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">What's driving opportunities</p>
                  </div>
                  <span className="text-xs sm:text-sm text-slate-600 font-semibold bg-slate-100 px-2 sm:px-3 py-1 rounded-full">
                    Top 8
                  </span>
                </div>
                <Skeleton className="h-[340px] w-full" />
              </div>
            </Card>
          </div>

          {/* Full Width Chart Skeleton */}
          <Card className="shadow-sm">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">Top Sources</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">Most productive data sources</p>
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-80 sm:h-96 w-full" />
            </div>
          </Card>

          {/* Two Column Charts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card className="shadow-sm">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">Score Distribution</h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">Quality check across scores</p>
                  </div>
                </div>
                <Skeleton className="h-[260px] w-full" />
              </div>
            </Card>
            
            <Card className="shadow-sm">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">Engagement Tracking</h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">Action status breakdown</p>
                  </div>
                </div>
                <Skeleton className="h-[320px] w-full" />
              </div>
            </Card>
          </div>

          {/* Time Trend Skeleton */}
          <Card className="shadow-sm">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-5 gap-2">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">Opportunities Over Time</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">Daily trend analysis</p>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-500" />
                    <span className="text-slate-600">Opportunities</span>
                  </div>
                </div>
              </div>
              <Skeleton className="h-[280px] w-full" />
            </div>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 px-3 sm:px-6 py-4 sm:py-5">
        <div className="flex items-center justify-between gap-4 page-header-content">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="hidden sm:flex h-7 w-7 text-blue-600" />
              <h1 className="text-lg sm:text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
            </div>
            <p className="text-slate-600 text-xs sm:text-base">
              Comprehensive insights and performance metrics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DateRangePicker 
              value={dateRange} 
              onChange={setDateRange}
              minDate={data?.earliestArticleDate ? new Date(data.earliestArticleDate) : null}
              maxDate={new Date()}
            />
          </div>
        </div>
      </div>

      <main className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* 1. Top-Level Snapshot - KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-blue-50 to-white border-blue-100">
            <div className="p-2.5 sm:p-4 md:p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 font-semibold uppercase tracking-wide mb-1 sm:mb-2 truncate">
                    Total
                  </p>
                  <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-0.5 sm:mb-1">
                    {topLevelStats.total.toLocaleString()}
                  </p>
                  <p className="text-[10px] sm:text-xs md:text-sm text-slate-500 truncate">
                    {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
                  </p>
                </div>
                <div className="p-1.5 sm:p-2 md:p-3 bg-blue-600 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
                  <TrendingUp className="h-3.5 w-3.5 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-amber-50 to-white border-amber-100">
            <div className="p-2.5 sm:p-4 md:p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 font-semibold uppercase tracking-wide mb-1 sm:mb-2 truncate">
                    High Priority
                  </p>
                  <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
                    <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900">
                      {topLevelStats.highPriority.toLocaleString()}
                    </p>
                    <span className="text-[10px] sm:text-xs md:text-sm text-amber-600 font-medium bg-amber-100 px-1 sm:px-2 py-0.5 sm:py-1 rounded-full">
                      ≥ 7
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-xs md:text-sm text-slate-500 mt-0.5 sm:mt-1 truncate">
                    {topLevelStats.total > 0 
                      ? `${Math.round((topLevelStats.highPriority / topLevelStats.total) * 100)}% of total`
                      : "No data"
                    }
                  </p>
                </div>
                <div className="p-1.5 sm:p-2 md:p-3 bg-amber-600 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
                  <Target className="h-3.5 w-3.5 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-green-50 to-white border-green-100">
            <div className="p-2.5 sm:p-4 md:p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 font-semibold uppercase tracking-wide mb-1 sm:mb-2 truncate">
                    Actioned
                  </p>
                  <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-0.5 sm:mb-1">
                    {topLevelStats.actioned.toLocaleString()}
                  </p>
                  <p className="text-[10px] sm:text-xs md:text-sm text-slate-500 truncate">
                    {topLevelStats.total > 0 
                      ? `${Math.round((topLevelStats.actioned / topLevelStats.total) * 100)}% complete`
                      : "No data"
                    }
                  </p>
                </div>
                <div className="p-1.5 sm:p-2 md:p-3 bg-green-600 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
                  <CheckCircle className="h-3.5 w-3.5 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-purple-50 to-white border-purple-100">
            <div className="p-2.5 sm:p-4 md:p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 font-semibold uppercase tracking-wide mb-1 sm:mb-2 truncate">
                    New Today
                  </p>
                  <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-0.5 sm:mb-1">
                    {topLevelStats.newToday.toLocaleString()}
                  </p>
                  <p className="text-[10px] sm:text-xs md:text-sm text-slate-500 flex items-center gap-0.5 sm:gap-1 truncate">
                    <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                    Fresh
                  </p>
                </div>
                <div className="p-1.5 sm:p-2 md:p-3 bg-purple-600 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
                  <Calendar className="h-3.5 w-3.5 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 2. Opportunities by Group & 4. Trigger Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">Opportunities by Group</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">Distribution across source groups</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={groupData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="groupGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={150} 
                    stroke="#64748b"
                    style={{ fontSize: '11px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      padding: '10px 14px',
                      fontSize: '14px'
                    }}
                    itemStyle={{
                      fontSize: '14px',
                      fontWeight: '500',
                      padding: '2px 0',
                      color: '#1e293b'
                    }}
                    labelStyle={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#0f172a',
                      marginBottom: '4px'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="url(#groupGradient)" 
                    radius={[0, 8, 8, 0]}
                    animationDuration={600}
                    animationBegin={0}
                    isAnimationActive={true}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">Trigger/Signal Breakdown</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">What's driving opportunities</p>
                </div>
                {/* Mobile dropdown button */}
                <button
                  onClick={() => {
                    const legendDiv = document.getElementById('trigger-legend-mobile')
                    if (legendDiv) {
                      legendDiv.style.display = legendDiv.style.display === 'none' ? 'block' : 'none'
                    }
                  }}
                  className="lg:hidden text-xs sm:text-sm text-slate-600 font-semibold bg-slate-100 px-2 sm:px-3 py-1 rounded-full hover:bg-slate-200 active:bg-slate-200 transition-colors cursor-pointer"
                >
                  Top 8 ▼
                </button>
                {/* Desktop badge */}
                <span className="hidden lg:inline-block text-sm text-slate-600 font-semibold bg-slate-100 px-3 py-1 rounded-full">
                  Top 8
                </span>
              </div>
              
              <ResponsiveContainer width="100%" height={340}>
                  <PieChart>
                    <defs>
                      {triggerData.map((_, index) => (
                        <linearGradient key={`grad-${index}`} id={`triggerGrad${index}`} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={CHART_COLORS[index % CHART_COLORS.length]} stopOpacity={1} />
                          <stop offset="100%" stopColor={CHART_COLORS[index % CHART_COLORS.length]} stopOpacity={0.7} />
                        </linearGradient>
                      ))}
                    </defs>
                    <Pie
                      data={triggerData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={isDesktop ? 90 : 60}
                      outerRadius={isDesktop ? 140 : 100}
                      paddingAngle={2}
                      animationDuration={600}
                      animationBegin={0}
                      isAnimationActive={true}
                      label={(entry: any) => `${entry.percentage}%`}
                      labelLine={{ stroke: '#64748b', strokeWidth: 1 }}
                      style={{ fontSize: '11px', fontWeight: '600' }}
                    >
                      {triggerData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={`url(#triggerGrad${index})`}
                          stroke="white"
                          strokeWidth={2}
                          style={{
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                            transition: 'all 0.3s ease',
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        padding: '10px 14px'
                      }}
                      itemStyle={{
                        fontSize: '14px',
                        fontWeight: '500',
                        padding: '2px 0',
                        color: '#1e293b'
                      }}
                      labelStyle={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#0f172a',
                        marginBottom: '4px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              
              {/* Desktop Legend - Hidden on mobile, shown with spacing on desktop */}
              <div className="hidden lg:block mt-3">
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                  {triggerData.map((item, index) => (
                    <div key={index} className="flex items-center gap-1.5">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <span className="text-xs font-medium text-slate-700">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Mobile Collapsible Legend */}
              <div id="trigger-legend-mobile" style={{ display: 'none' }} className="lg:hidden mt-4 space-y-0.5 sm:space-y-1 border-t border-slate-200 pt-3">
                {triggerData.map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between py-1 sm:py-1.5 px-2 sm:px-3 rounded-md active:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
                      <div 
                        className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <span className="text-[11px] sm:text-sm font-medium text-slate-700 truncate">{item.name}</span>
                    </div>
                    <span 
                      className="text-sm sm:text-base font-bold ml-2 sm:ml-4 flex-shrink-0"
                      style={{ color: CHART_COLORS[index % CHART_COLORS.length] }}
                    >
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* 3. Opportunities by Source - Enhanced Table */}
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Top Sources</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">Most productive data sources</p>
              </div>
              {sourceData.length > 5 && (
                <button
                  onClick={() => setShowAllSources(!showAllSources)}
                  className="text-xs sm:text-sm text-blue-600 font-semibold hover:text-blue-700 active:text-blue-800 transition-colors cursor-pointer"
                >
                  {showAllSources ? 'Show Less' : `Show All (${sourceData.length})`}
                </button>
              )}
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {(showAllSources ? sourceData : sourceData.slice(0, 5)).map((source, index) => {
                const maxValue = sourceData[0]?.opportunities || 1
                const percentage = (source.opportunities / maxValue) * 100
                
                return (
                  <div key={source.name} className="group">
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 text-xs font-bold flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-slate-900 truncate">{source.name}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className="text-sm sm:text-base md:text-lg font-bold text-slate-900">{source.opportunities}</span>
                      </div>
                    </div>
                    <div className="relative h-2.5 sm:h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>

        {/* 5. Scoring Distribution & 6. Engagement Tracking */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">Score Distribution</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">Quality check across scores</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={scoreData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                      <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="range" 
                    stroke="#64748b" 
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      padding: '10px 14px',
                      fontSize: '14px'
                    }}
                    itemStyle={{
                      fontSize: '14px',
                      fontWeight: '500',
                      padding: '2px 0',
                      color: '#1e293b'
                    }}
                    labelStyle={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#0f172a',
                      marginBottom: '4px'
                    }}
                    cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="url(#scoreGradient)" 
                    radius={[8, 8, 0, 0]}
                    animationDuration={600}
                    animationBegin={0}
                    isAnimationActive={true}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">Engagement Tracking</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">Action status breakdown</p>
                </div>
                {/* Mobile dropdown button */}
                <button
                  onClick={() => {
                    const legendDiv = document.getElementById('engagement-legend-mobile')
                    if (legendDiv) {
                      legendDiv.style.display = legendDiv.style.display === 'none' ? 'block' : 'none'
                    }
                  }}
                  className="lg:hidden text-xs sm:text-sm text-slate-600 font-semibold bg-slate-100 px-2 sm:px-3 py-1 rounded-full hover:bg-slate-200 active:bg-slate-200 transition-colors cursor-pointer"
                >
                  Details ▼
                </button>
              </div>
              
              {/* Donut chart with legend - Responsive Layout */}
              <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-6 lg:gap-8 lg:px-6">
                {/* Donut Chart - Responsive sizing */}
                <div className="flex-shrink-0 w-full sm:w-auto mx-auto lg:mx-0" style={{ maxWidth: '340px' }}>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                      <defs>
                        {engagementData.map((_, index) => (
                          <linearGradient key={`engGrad${index}`} id={`engGrad${index}`} x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor={engagementData[index].color} stopOpacity={1} />
                            <stop offset="100%" stopColor={engagementData[index].color} stopOpacity={0.7} />
                          </linearGradient>
                        ))}
                      </defs>
                      <Pie
                        data={engagementData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={isDesktop ? 90 : 60}
                        outerRadius={isDesktop ? 140 : 100}
                        paddingAngle={2}
                        animationDuration={600}
                        animationBegin={0}
                        isAnimationActive={true}
                        label={(entry: any) => `${entry.percentage}%`}
                        labelLine={{ stroke: '#64748b', strokeWidth: 1 }}
                        style={{ fontSize: '12px', fontWeight: '600', fill: '#1e293b' }}
                      >
                        {engagementData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={`url(#engGrad${index})`}
                            stroke="white"
                            strokeWidth={2}
                            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          padding: '10px 14px'
                        }}
                        itemStyle={{
                          fontSize: '14px',
                          fontWeight: '500',
                          padding: '2px 0',
                          color: '#1e293b'
                        }}
                        labelStyle={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#0f172a',
                          marginBottom: '4px'
                        }}
                        formatter={(value: any, name: any, props: any) => [
                          `${value} (${props.payload.percentage}%)`,
                          name
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Desktop Legend - Always visible, stacks side-by-side on desktop */}
                <div className="hidden lg:block space-y-0.5 w-[240px]">
                  {engagementData.map((item, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between py-1 px-3 rounded-md hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0 group-hover:scale-125 transition-transform"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium text-slate-700 truncate">{item.name}</span>
                      </div>
                      <span 
                        className="text-lg font-bold group-hover:scale-110 transition-transform ml-6 flex-shrink-0"
                        style={{ color: item.color }}
                      >
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Mobile Collapsible Legend */}
              <div id="engagement-legend-mobile" style={{ display: 'none' }} className="lg:hidden mt-4 space-y-0.5 sm:space-y-1 border-t border-slate-200 pt-3">
                {engagementData.map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between py-1 sm:py-1.5 px-2 sm:px-3 rounded-md active:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
                      <div 
                        className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-[11px] sm:text-sm font-medium text-slate-700 truncate">{item.name}</span>
                    </div>
                    <span 
                      className="text-sm sm:text-base font-bold ml-2 sm:ml-4 flex-shrink-0"
                      style={{ color: item.color }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* 7. Time Trend - Area Chart with Gradient */}
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-5 gap-2">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Opportunities Over Time</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">Daily trend analysis</p>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-500" />
                  <span className="text-slate-600">Opportunities</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={timeTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOpportunities" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b" 
                  style={{ fontSize: '10px' }}
                  tick={{ fill: '#64748b' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="#64748b" 
                  style={{ fontSize: '10px' }}
                  tick={{ fill: '#64748b' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    padding: '10px 14px',
                    fontSize: '14px'
                  }}
                  itemStyle={{
                    fontSize: '14px',
                    fontWeight: '500',
                    padding: '2px 0',
                    color: '#1e293b'
                  }}
                  labelStyle={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#0f172a',
                    marginBottom: '4px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="opportunities"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#colorOpportunities)"
                  animationDuration={800}
                  animationBegin={0}
                  isAnimationActive={true}
                  dot={{ fill: "#3b82f6", strokeWidth: 1.5, r: 3, stroke: "white" }}
                  activeDot={{ r: 5, strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </main>
    </div>
  )
}
