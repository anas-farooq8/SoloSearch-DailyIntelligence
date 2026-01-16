"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import type { Article, Tag, KPIStats, Filters } from "@/types/database"
import { DashboardHeader } from "./dashboard-header"
import { KPICards } from "./kpi-cards"
import { FiltersBar } from "./filters-bar"
import { LeadsTable } from "./leads-table"
import { TagsManager } from "./tags-manager"
import { HowItWorksGuide } from "./how-it-works-guide"

interface DashboardClientProps {
  userId: string
}

interface DashboardData {
  articles: Article[]
  tags: Tag[]
  kpis: KPIStats
  filterOptions: {
    sectors: string[]
    triggers: string[]
    sources: string[]
    groups: string[]
  }
  groupToSources: Record<string, string[]>
}

// API fetcher
const fetcher = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, options)
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "An error occurred")
  }
  return res.json()
}

// Client-side filtering function
const applyFilters = (articles: Article[], filters: Filters): Article[] => {
  return articles.filter((article) => {
    // Search filter (title, company)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesSearch =
        article.title?.toLowerCase().includes(searchLower) ||
        article.company?.toLowerCase().includes(searchLower) ||
        article.why_this_matters?.toLowerCase().includes(searchLower) ||
        article.outreach_angle?.toLowerCase().includes(searchLower) ||
        article.additional_details?.toLowerCase().includes(searchLower)
      if (!matchesSearch) return false
    }

    // Score filters
    if (filters.minScore !== null && filters.minScore !== undefined) {
      if (!article.lead_score || article.lead_score < filters.minScore) return false
    }
    if (filters.maxScore !== null && filters.maxScore !== undefined) {
      if (!article.lead_score || article.lead_score > filters.maxScore) return false
    }

    // Sector filter
    if (filters.sectors && filters.sectors.length > 0) {
      const articleSectors = article.sector || []
      const hasSector = filters.sectors.some((sector) => articleSectors.includes(sector))
      if (!hasSector) return false
    }

    // Special filter for "Others" sector group: exclude articles with ANY health-related sector
    if (filters.sectorGroup === 'others') {
      const articleSectors = article.sector || []
      const hasHealthSector = articleSectors.some((sector) => {
        const lowerSector = sector.toLowerCase()
        return lowerSector.includes('health') || lowerSector.includes('med')
      })
      if (hasHealthSector) return false
    }

    // Trigger filter
    if (filters.triggers && filters.triggers.length > 0) {
      const articleTriggers = article.trigger_signal || []
      const hasTrigger = filters.triggers.some((trigger) => articleTriggers.includes(trigger))
      if (!hasTrigger) return false
    }

    // Sources filter
    if (filters.sources && filters.sources.length > 0) {
      if (!article.source || !filters.sources.includes(article.source)) return false
    }

    // Tag filter
    if (filters.tagIds && filters.tagIds.length > 0) {
      const articleTagIds = (article.tags as any[])?.map((t) => t.id) || []
      
      // Check if user wants to see untagged articles
      const wantsUntagged = filters.tagIds.includes('NO_TAGS')
      const hasNoTags = articleTagIds.length === 0
      
      // Filter out 'NO_TAGS' to get actual tag IDs
      const actualTagIds = filters.tagIds.filter(id => id !== 'NO_TAGS')
      const hasSelectedTag = actualTagIds.length > 0 && actualTagIds.some((tagId) => articleTagIds.includes(tagId))
      
      // Include article if: (it has no tags AND user wants untagged) OR (it has a selected tag)
      const shouldInclude = (wantsUntagged && hasNoTags) || hasSelectedTag
      if (!shouldInclude) return false
    }

    // Group filter
    if (filters.groups && filters.groups.length > 0) {
      if (!article.group_name || !filters.groups.includes(article.group_name)) return false
    }

    return true
  })
}

export function DashboardClient({ userId }: DashboardClientProps) {
  const supabase = createClient()
  
  // Initialize page from localStorage or default to 0
  const initialPage = useMemo(() => {
    if (typeof window !== 'undefined') {
      const savedPage = localStorage.getItem('dashboard-page')
      return savedPage ? Math.max(0, parseInt(savedPage, 10)) : 0
    }
    return 0
  }, [])
  
  const [page, setPage] = useState(initialPage)
  const [filters, setFilters] = useState<Filters>({
    search: "",
    minScore: null,
    maxScore: null,
    sectorGroup: null,
    sectors: [],
    triggers: [],
    sources: [],
    tagIds: [],
    groups: [],
  })
  const [showTagsManager, setShowTagsManager] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [addingTagId, setAddingTagId] = useState<string | null>(null) // Format: "articleId:tagId"
  const [removingTagId, setRemovingTagId] = useState<string | null>(null) // Format: "articleId:tagId"
  const [activeView, setActiveView] = useState<"active" | "hidden">("active")
  const [defaultFilterApplied, setDefaultFilterApplied] = useState(false)

  // Save page to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboard-page', page.toString())
    }
  }, [page])

  // Helper function to calculate all KPIs using local timezone
  const calculateKPIs = useCallback((articles: Article[]): KPIStats => {
    const getProcessedTime = (article: Article) => {
      const timestamp = article.processed_at
      return timestamp ? new Date(timestamp).getTime() : null
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTime = today.getTime()
    
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)
    const yesterdayTime = yesterday.getTime()
    
    // Calculate current week (Monday to Sunday)
    const currentWeekStart = new Date()
    const dayOfWeek = currentWeekStart.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // If Sunday, go back 6 days; otherwise day - 1
    currentWeekStart.setDate(currentWeekStart.getDate() - daysFromMonday)
    currentWeekStart.setHours(0, 0, 0, 0)
    const currentWeekStartTime = currentWeekStart.getTime()
    
    // Calculate previous week (Monday to Sunday)
    const previousWeekStart = new Date(currentWeekStart)
    previousWeekStart.setDate(previousWeekStart.getDate() - 7)
    const previousWeekStartTime = previousWeekStart.getTime()
    
    const previousWeekEnd = new Date(currentWeekStart)
    previousWeekEnd.setMilliseconds(-1) // One millisecond before current week starts
    const previousWeekEndTime = previousWeekEnd.getTime()
    
    const totalToday = articles.filter(article => {
      const articleTime = getProcessedTime(article)
      return articleTime !== null && articleTime >= todayTime
    }).length
    const totalYesterday = articles.filter(article => {
      const articleTime = getProcessedTime(article)
      return articleTime !== null && articleTime >= yesterdayTime && articleTime < todayTime
    }).length
    
    const highPriorityToday = articles.filter(article => 
      article.lead_score >= 8 && (() => {
        const articleTime = getProcessedTime(article)
        return articleTime !== null && articleTime >= todayTime
      })()
    ).length
    const highPriorityYesterday = articles.filter(article => {
      const articleTime = getProcessedTime(article)
      return article.lead_score >= 8 && articleTime !== null && articleTime >= yesterdayTime && articleTime < todayTime
    }).length
    
    const awaitingReview = articles.filter(article => !article.tags || article.tags.length === 0).length
    
    // Current week: from Monday 00:00 to now
    const weeklyAdded = articles.filter(article => 
      (() => {
        const articleTime = getProcessedTime(article)
        return articleTime !== null && articleTime >= currentWeekStartTime
      })()
    ).length
    
    // Previous week: from previous Monday 00:00 to previous Sunday 23:59:59.999
    const weeklyAddedPrevious = articles.filter(article => {
      const articleTime = getProcessedTime(article)
      return articleTime !== null && articleTime >= previousWeekStartTime && articleTime <= previousWeekEndTime
    }).length
    
    return {
      total_today: totalToday,
      total_yesterday: totalYesterday,
      high_priority_today: highPriorityToday,
      high_priority_yesterday: highPriorityYesterday,
      awaiting_review: awaitingReview,
      weekly_added: weeklyAdded,
      weekly_added_previous: weeklyAddedPrevious,
    }
  }, [])

  // Fetch all dashboard data in ONE request
  const {
    data: dashboardData,
    isLoading,
    mutate: mutateDashboard,
  } = useSWR<DashboardData>("/api/dashboard/data", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000, // Cache for 10 seconds
  })

  // Find the "Not Relevant" tag ID
  const notRelevantTagId = useMemo(() => {
    const notRelevantTag = dashboardData?.tags.find(
      (tag) => tag.name.toLowerCase() === "not relevant"
    )
    return notRelevantTag?.id || null
  }, [dashboardData?.tags])

  // Apply default sector group filter on initial load (only once when data loads)
  useEffect(() => {
    // Only apply default filter if:
    // 1. Dashboard data has loaded (not loading)
    // 2. Sectors data exists
    // 3. We haven't already applied the default filter
    if (!isLoading && dashboardData?.filterOptions?.sectors && !defaultFilterApplied) {
      setFilters((prev) => ({ ...prev, sectorGroup: 'health' }))
      setDefaultFilterApplied(true)
    }
  }, [dashboardData?.filterOptions?.sectors, isLoading, defaultFilterApplied])

  // Update sectors based on sectorGroup selection
  useEffect(() => {
    if (!dashboardData?.filterOptions?.sectors) return

    const allSectors = dashboardData.filterOptions.sectors

    if (filters.sectorGroup === 'health') {
      // Select all health/med related sectors
      const healthSectors = allSectors.filter((sector) => {
        const lowerSector = sector.toLowerCase()
        return lowerSector.includes('health') || lowerSector.includes('med')
      })
      setFilters((prev) => ({ ...prev, sectors: healthSectors }))
    } else if (filters.sectorGroup === 'others') {
      // Select all non-health/med sectors (exclude any sector containing health or med keywords)
      const otherSectors = allSectors.filter((sector) => {
        const lowerSector = sector.toLowerCase()
        // Exclude if it contains 'health' OR 'med' in any form
        return !lowerSector.includes('health') && !lowerSector.includes('med')
      })
      setFilters((prev) => ({ ...prev, sectors: otherSectors }))
    } else if (filters.sectorGroup === 'all') {
      // Clear sector filter to show all
      setFilters((prev) => ({ ...prev, sectors: [] }))
    }
  }, [filters.sectorGroup, dashboardData?.filterOptions?.sectors])

  // Update sources based on group selection (similar to how sectors work with sectorGroup)
  useEffect(() => {
    if (!dashboardData?.groupToSources) return

    const groupToSources = dashboardData.groupToSources
    const selectedGroups = filters.groups

    if (selectedGroups.length === 0) {
      // If no groups selected, don't auto-update sources (let user control it)
      return
    }

    // Get all sources for the selected groups
    const sourcesForGroups = selectedGroups.flatMap((groupId) => {
      return groupToSources[groupId] || []
    })
    // Remove duplicates and sort
    const uniqueSources = [...new Set(sourcesForGroups)].sort()
    
    // Only update if sources have changed to avoid infinite loops
    setFilters((prev) => {
      const currentSources = prev.sources.sort().join(',')
      const newSources = uniqueSources.sort().join(',')
      if (currentSources !== newSources) {
        return { ...prev, sources: uniqueSources }
      }
      return prev
    })
  }, [filters.groups, dashboardData?.groupToSources])

  // Separate articles into active and hidden (Not Relevant)
  const { activeArticles, hiddenArticles } = useMemo(() => {
    if (!dashboardData?.articles) return { activeArticles: [], hiddenArticles: [] }
    
    const active: Article[] = []
    const hidden: Article[] = []
    
    dashboardData.articles.forEach((article) => {
      const hasNotRelevantTag = article.tags?.some(
        (tag) => tag.name.toLowerCase() === "not relevant"
      )
      if (hasNotRelevantTag) {
        hidden.push(article)
      } else {
        active.push(article)
      }
    })
    
    return { activeArticles: active, hiddenArticles: hidden }
  }, [dashboardData?.articles])

  // Apply filters on client-side based on active view
  const filteredArticles = useMemo(() => {
    const articlesToFilter = activeView === "active" ? activeArticles : hiddenArticles
    return applyFilters(articlesToFilter, filters)
  }, [activeArticles, hiddenArticles, activeView, filters])

  // Calculate KPIs using local timezone - from ALL articles
  const kpis = useMemo(() => {
    if (!dashboardData?.articles) return dashboardData?.kpis
    return calculateKPIs(dashboardData.articles)
  }, [dashboardData?.articles, calculateKPIs])

  // Paginate filtered articles
  const pageSize = 50
  const totalPages = Math.ceil(filteredArticles.length / pageSize)
  
  // Ensure page is within valid bounds
  useEffect(() => {
    if (totalPages > 0 && page >= totalPages) {
      setPage(Math.max(0, totalPages - 1))
    }
  }, [totalPages, page])
  
  const paginatedArticles = useMemo(() => {
    const validPage = totalPages > 0 ? Math.min(page, totalPages - 1) : 0
    const start = validPage * pageSize
    const end = start + pageSize
    return filteredArticles.slice(start, end)
  }, [filteredArticles, page, totalPages])

  const handleFilterChange = useCallback((newFilters: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
    setPage(0) // Reset to first page when filters change
  }, [])

  const handleViewChange = useCallback((view: "active" | "hidden") => {
    setActiveView(view)
    setPage(0) // Reset to first page when switching views
  }, [])

  const handleTagUpdate = async (articleId: string, tagId: string, action: "add" | "remove") => {
    const operationKey = `${articleId}:${tagId}`
    
    // Prevent duplicate operations
    if (addingTagId === operationKey || removingTagId === operationKey) return
    
    if (action === "add") {
      setAddingTagId(operationKey)
    } else {
      setRemovingTagId(operationKey)
    }
    
    try {
      if (action === "add") {
        await fetcher("/api/dashboard/article-tags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ article_id: articleId, tag_id: tagId }),
        })
      } else {
        await fetcher(`/api/dashboard/article-tags?article_id=${articleId}&tag_id=${tagId}`, {
          method: "DELETE",
        })
      }
      
      // Optimistically update local state without refetching from server
      if (dashboardData) {
        const updatedArticles = dashboardData.articles.map(article => {
          if (article.id === articleId) {
            const tag = dashboardData.tags.find(t => t.id === tagId)
            if (!tag) return article
            
            if (action === "add") {
              return {
                ...article,
                tags: [...(article.tags || []), tag]
              }
            } else {
              return {
                ...article,
                tags: (article.tags || []).filter(t => t.id !== tagId)
              }
            }
          }
          return article
        })
        
        // Recalculate KPIs with updated articles
        const updatedKPIs = calculateKPIs(updatedArticles)
        
        // Update cache optimistically without refetching
        mutateDashboard({ ...dashboardData, articles: updatedArticles, kpis: updatedKPIs }, false)
      }
    } catch (error) {
      console.error("Error updating tag:", error)
      // Revert on error by refetching
      mutateDashboard()
    } finally {
      if (action === "add") {
        setAddingTagId(null)
      } else {
        setRemovingTagId(null)
      }
    }
  }

  const handleTagsChange = (updatedTags: Tag[]) => {
    // Update local state with new tags without refetching from server
    if (dashboardData) {
      // Find which tags were deleted (in old but not in new)
      const deletedTagIds = dashboardData.tags
        .filter(oldTag => !updatedTags.find(newTag => newTag.id === oldTag.id))
        .map(tag => tag.id)
      
      // Update articles to reflect tag changes
      const updatedArticles = dashboardData.articles.map(article => {
        let articleTags = article.tags || []
        
        // Remove deleted tags from articles
        if (deletedTagIds.length > 0) {
          articleTags = articleTags.filter(tag => !deletedTagIds.includes(tag.id))
        }
        
        // Update edited tags (name/color changes) in articles
        articleTags = articleTags.map(articleTag => {
          const updatedTag = updatedTags.find(t => t.id === articleTag.id)
          return updatedTag || articleTag
        })
        
        return {
          ...article,
          tags: articleTags
        }
      })
      
      // Recalculate KPIs with updated articles
      const updatedKPIs = calculateKPIs(updatedArticles)
      
      mutateDashboard({ ...dashboardData, tags: updatedTags, articles: updatedArticles, kpis: updatedKPIs }, false)
    }
  }

  const handleNoteUpdate = (articleId: string, note: any | null) => {
    // Update local state with new note without refetching from server
    if (dashboardData) {
      const updatedArticles = dashboardData.articles.map(article => {
        if (article.id === articleId) {
          return {
            ...article,
            note: note
          }
        }
        return article
      })
      
      mutateDashboard({ ...dashboardData, articles: updatedArticles }, false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader 
        onSignOut={handleSignOut} 
        onManageTags={() => setShowTagsManager(true)}
        onShowGuide={() => setShowHowItWorks(true)}
      />

      <main className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <KPICards kpis={kpis} loading={isLoading} />

        <FiltersBar
          filters={filters}
          onFilterChange={handleFilterChange}
          filterOptions={dashboardData?.filterOptions || { sectors: [], triggers: [], sources: [], groups: [] }}
          tags={dashboardData?.tags || []}
        />

        <LeadsTable
          articles={paginatedArticles}
          total={filteredArticles.length}
          page={page}
          onPageChange={setPage}
          loading={isLoading}
          tags={dashboardData?.tags || []}
          onTagUpdate={handleTagUpdate}
          filters={filters}
          userId={userId}
          addingTagId={addingTagId}
          removingTagId={removingTagId}
          onNoteUpdate={handleNoteUpdate}
          activeView={activeView}
          onViewChange={handleViewChange}
          activeCount={activeArticles.length}
          hiddenCount={hiddenArticles.length}
        />
      </main>

      {showTagsManager && (
        <TagsManager
          tags={dashboardData?.tags || []}
          onClose={() => setShowTagsManager(false)}
          onTagsChange={handleTagsChange}
        />
      )}

      <HowItWorksGuide 
        open={showHowItWorks} 
        onOpenChange={setShowHowItWorks} 
      />
    </div>
  )
}
