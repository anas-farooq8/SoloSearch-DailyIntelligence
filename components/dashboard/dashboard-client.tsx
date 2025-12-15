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
    countries: string[]
    groups: string[]
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

    // Group filter
    if (filters.groups && filters.groups.length > 0) {
      if (!article.group_name || !filters.groups.includes(article.group_name)) return false
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
    groups: [],
  })
  const [showTagsManager, setShowTagsManager] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(false)

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

  // Helper function to recalculate awaiting_review KPI
  const recalculateKPIs = (articles: Article[], currentKPIs: KPIStats): KPIStats => {
    const awaitingReview = articles.filter(article => !article.tags || article.tags.length === 0).length
    return {
      ...currentKPIs,
      awaiting_review: awaitingReview
    }
  }

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
        
        // Recalculate KPIs with updated articles
        const updatedKPIs = recalculateKPIs(updatedArticles, dashboardData.kpis)
        
        // Update cache optimistically without refetching
        mutateDashboard({ ...dashboardData, articles: updatedArticles, kpis: updatedKPIs }, false)
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
      const updatedKPIs = recalculateKPIs(updatedArticles, dashboardData.kpis)
      
      mutateDashboard({ ...dashboardData, tags: updatedTags, articles: updatedArticles, kpis: updatedKPIs }, false)
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

      <main className="max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <KPICards kpis={dashboardData?.kpis} loading={isLoading} />

        <FiltersBar
          filters={filters}
          onFilterChange={handleFilterChange}
          filterOptions={dashboardData?.filterOptions || { sectors: [], triggers: [], countries: [], groups: [] }}
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

      <HowItWorksGuide 
        open={showHowItWorks} 
        onOpenChange={setShowHowItWorks} 
      />
    </div>
  )
}
