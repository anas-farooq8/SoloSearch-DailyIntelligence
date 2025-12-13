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

  // Fetch KPIs
  const { data: kpis, isLoading: kpisLoading } = useSWR<KPIStats>(["kpis", userId], async () => {
    const { data, error } = await supabase.rpc("get_dashboard_kpis", {
      p_user_id: userId,
    })
    if (error) throw error
    return data?.[0] || { total_today: 0, high_priority_today: 0, awaiting_review: 0, weekly_added: 0 }
  })

  // Fetch tags
  const { data: tags, mutate: mutateTags } = useSWR<Tag[]>(["tags"], async () => {
    const { data, error } = await supabase.from("tags").select("*").order("name")
    if (error) throw error
    return data || []
  })

  // Fetch filter options
  const { data: filterOptions } = useSWR(["filter-options"], async () => {
    const [sectorsRes, triggersRes, countriesRes] = await Promise.all([
      supabase.rpc("get_distinct_sectors"),
      supabase.rpc("get_distinct_triggers"),
      supabase.rpc("get_distinct_countries"),
    ])
    return {
      sectors: (sectorsRes.data || []).filter(Boolean),
      triggers: (triggersRes.data || []).filter(Boolean),
      countries: (countriesRes.data || []).filter(Boolean),
    }
  })

  // Fetch articles with filters
  const {
    data: articlesData,
    isLoading: articlesLoading,
    mutate: mutateArticles,
  } = useSWR(["articles", userId, page, filters], async () => {
    const { data: articles, error: articlesError } = await supabase.rpc("get_articles_with_tags", {
      p_user_id: userId,
      p_page: page,
      p_page_size: 20,
      p_search: filters.search || null,
      p_min_score: filters.minScore,
      p_max_score: filters.maxScore,
      p_sectors: filters.sectors.length > 0 ? filters.sectors : null,
      p_triggers: filters.triggers.length > 0 ? filters.triggers : null,
      p_country: filters.country,
      p_tag_ids: filters.tagIds.length > 0 ? filters.tagIds : null,
    })

    if (articlesError) throw articlesError

    const { data: countData, error: countError } = await supabase.rpc("count_filtered_articles", {
      p_user_id: userId,
      p_search: filters.search || null,
      p_min_score: filters.minScore,
      p_max_score: filters.maxScore,
      p_sectors: filters.sectors.length > 0 ? filters.sectors : null,
      p_triggers: filters.triggers.length > 0 ? filters.triggers : null,
      p_country: filters.country,
      p_tag_ids: filters.tagIds.length > 0 ? filters.tagIds : null,
    })

    if (countError) throw countError

    return {
      articles: (articles || []) as Article[],
      total: countData || 0,
    }
  })

  const handleFilterChange = useCallback((newFilters: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
    setPage(0)
  }, [])

  const handleTagUpdate = async (articleId: string, tagId: string, action: "add" | "remove") => {
    if (action === "add") {
      await supabase.from("article_tags").insert({
        article_id: articleId,
        tag_id: tagId,
        user_id: userId,
      })
    } else {
      await supabase.from("article_tags").delete().match({ article_id: articleId, tag_id: tagId, user_id: userId })
    }
    mutateArticles()
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
