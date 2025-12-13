"use client"

import { useState, useCallback, useMemo } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import type { Article, Tag, KPIStats, Filters } from "@/types/database"
import { DashboardHeader } from "./dashboard-header"
import { KPICards } from "./kpi-cards"
import { FiltersBar } from "./filters-bar"
import { LeadsTable } from "./leads-table"
import { TagsManager } from "./tags-manager"

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
    countries: string[]
  }
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
    // Search filter (title, company, or text)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesSearch =
        article.title?.toLowerCase().includes(searchLower) ||
        article.company?.toLowerCase().includes(searchLower) ||
        article.text?.toLowerCase().includes(searchLower) ||
        article.ai_summary?.toLowerCase().includes(searchLower)
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

    // Trigger filter
    if (filters.triggers && filters.triggers.length > 0) {
      const articleTriggers = article.trigger_signal || []
      const hasTrigger = filters.triggers.some((trigger) => articleTriggers.includes(trigger))
      if (!hasTrigger) return false
    }

    // Country filter
    if (filters.country) {
      if (article.location_country !== filters.country) return false
    }

    // Tag filter
    if (filters.tagIds && filters.tagIds.length > 0) {
      const articleTagIds = (article.tags as any[])?.map((t) => t.id) || []
      const hasTag = filters.tagIds.some((tagId) => articleTagIds.includes(tagId))
      if (!hasTag) return false
    }

    return true
  })
}

export function DashboardClient({ userId }: DashboardClientProps) {
  const supabase = createClient()
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState<Filters>({
    search: "",
    minScore: null,
    maxScore: null,
    sectors: [],
    triggers: [],
    country: null,
    tagIds: [],
  })
  const [showTagsManager, setShowTagsManager] = useState(false)

  // Fetch all dashboard data in ONE request
  const {
    data: dashboardData,
    isLoading,
    mutate: mutateDashboard,
  } = useSWR<DashboardData>("/api/dashboard/data", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000, // Cache for 10 seconds
  })

  // Apply filters on client-side
  const filteredArticles = useMemo(() => {
    if (!dashboardData?.articles) return []
    return applyFilters(dashboardData.articles, filters)
  }, [dashboardData?.articles, filters])

  // Paginate filtered articles
  const pageSize = 20
  const paginatedArticles = useMemo(() => {
    const start = page * pageSize
    const end = start + pageSize
    return filteredArticles.slice(start, end)
  }, [filteredArticles, page])

  const handleFilterChange = useCallback((newFilters: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
    setPage(0) // Reset to first page when filters change
  }, [])

  const handleTagUpdate = async (articleId: string, tagId: string, action: "add" | "remove") => {
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
        
        // Update cache optimistically without refetching
        mutateDashboard({ ...dashboardData, articles: updatedArticles }, false)
      }
    } catch (error) {
      console.error("Error updating tag:", error)
      // Revert on error by refetching
      mutateDashboard()
    }
  }

  const handleTagsChange = (updatedTags: Tag[]) => {
    // Update local state with new tags without refetching from server
    if (dashboardData) {
      mutateDashboard({ ...dashboardData, tags: updatedTags }, false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader onSignOut={handleSignOut} onManageTags={() => setShowTagsManager(true)} />

      <main className="max-w-[1600px] mx-auto p-6 space-y-6">
        <KPICards kpis={dashboardData?.kpis} loading={isLoading} />

        <FiltersBar
          filters={filters}
          onFilterChange={handleFilterChange}
          filterOptions={dashboardData?.filterOptions || { sectors: [], triggers: [], countries: [] }}
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
        />
      </main>

      {showTagsManager && (
        <TagsManager
          tags={dashboardData?.tags || []}
          onClose={() => setShowTagsManager(false)}
          onTagsChange={handleTagsChange}
        />
      )}
    </div>
  )
}
