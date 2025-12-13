"use client"

import { useState, useCallback } from "react"
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

// API fetcher
const fetcher = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, options)
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "An error occurred")
  }
  return res.json()
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

  // Fetch KPIs - only once, not dependent on filters
  const { data: kpis, isLoading: kpisLoading } = useSWR<KPIStats>("/api/dashboard/kpis", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // Cache for 1 minute
  })

  // Fetch tags - only once, not dependent on filters
  const { data: tags, mutate: mutateTags } = useSWR<Tag[]>("/api/dashboard/tags", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000, // Cache for 30 seconds
  })

  // Fetch filter options - only once, not dependent on filters
  const { data: filterOptions } = useSWR<{
    sectors: string[]
    triggers: string[]
    countries: string[]
  }>("/api/dashboard/filter-options", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000, // Cache for 5 minutes
  })

  // Fetch articles with filters - depends on page and filters
  const {
    data: articlesData,
    isLoading: articlesLoading,
    mutate: mutateArticles,
  } = useSWR<{ articles: Article[]; total: number }>(
    ["/api/dashboard/articles", page, filters],
    ([url]) =>
      fetcher(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, pageSize: 20, filters }),
      }),
    {
      keepPreviousData: true, // Keep previous data while loading new data
      dedupingInterval: 2000, // Dedupe requests within 2 seconds
    }
  )

  const handleFilterChange = useCallback((newFilters: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
    setPage(0)
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
      mutateArticles()
    } catch (error) {
      console.error("Error updating tag:", error)
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
        <KPICards kpis={kpis} loading={kpisLoading} />

        <FiltersBar
          filters={filters}
          onFilterChange={handleFilterChange}
          filterOptions={filterOptions || { sectors: [], triggers: [], countries: [] }}
          tags={tags || []}
        />

        <LeadsTable
          articles={articlesData?.articles || []}
          total={articlesData?.total || 0}
          page={page}
          onPageChange={setPage}
          loading={articlesLoading}
          tags={tags || []}
          onTagUpdate={handleTagUpdate}
          filters={filters}
          userId={userId}
        />
      </main>

      {showTagsManager && (
        <TagsManager tags={tags || []} onClose={() => setShowTagsManager(false)} onUpdate={mutateTags} />
      )}
    </div>
  )
}
