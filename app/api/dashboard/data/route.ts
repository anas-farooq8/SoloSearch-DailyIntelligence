import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch all data in parallel using direct queries
    const [articlesResult, tagsResult, kpisResult] = await Promise.all([
      // Fetch all processed articles with their tags (LEFT JOIN to include articles without tags)
      supabase
        .from("articles")
        .select(
          `
          *,
          article_tags (
            tag:tags (
              id,
              name,
              color
            )
          )
        `
        )
        .eq("status", "processed")
        .order("created_at", { ascending: false }),

      // Fetch all tags
      supabase.from("tags").select("*").order("name"),

      // Fetch KPI data using direct queries
      Promise.all([
        // Total articles today
        supabase
          .from("articles")
          .select("id", { count: "exact", head: true })
          .eq("status", "processed")
          .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),

        // High priority articles today (lead_score >= 7)
        supabase
          .from("articles")
          .select("id", { count: "exact", head: true })
          .eq("status", "processed")
          .gte("lead_score", 7)
          .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),

        // Weekly added (last 7 days)
        supabase
          .from("articles")
          .select("id", { count: "exact", head: true })
          .eq("status", "processed")
          .gte(
            "created_at",
            new Date(new Date().setDate(new Date().getDate() - 7)).toISOString()
          ),
      ]),
    ])

    if (articlesResult.error) {
      console.error("Error fetching articles:", articlesResult.error)
      return NextResponse.json({ error: articlesResult.error.message }, { status: 500 })
    }

    if (tagsResult.error) {
      console.error("Error fetching tags:", tagsResult.error)
      return NextResponse.json({ error: tagsResult.error.message }, { status: 500 })
    }

    // Process articles to flatten tag structure
    const articles = (articlesResult.data || []).map((article) => ({
      ...article,
      tags: article.article_tags?.map((at: any) => at.tag).filter(Boolean) || [],
    }))

    // Extract unique filter options from articles
    const sectors = [...new Set(articles.flatMap((a) => a.sector || []))].filter(Boolean).sort()
    const triggers = [...new Set(articles.flatMap((a) => a.trigger_signal || []))]
      .filter(Boolean)
      .sort()
    const countries = [...new Set(articles.map((a) => a.location_country).filter(Boolean))].sort()

    // Process KPIs
    const [totalTodayResult, highPriorityTodayResult, weeklyAddedResult] = kpisResult

    // Count processed articles without any tags (awaiting review)
    const awaitingReview = articles.filter((article) => !article.tags || article.tags.length === 0).length

    const kpis = {
      total_today: totalTodayResult.count || 0,
      high_priority_today: highPriorityTodayResult.count || 0,
      awaiting_review: awaitingReview,
      weekly_added: weeklyAddedResult.count || 0,
    }

    return NextResponse.json({
      articles,
      tags: tagsResult.data || [],
      kpis,
      filterOptions: {
        sectors,
        triggers,
        countries,
      },
    })
  } catch (error) {
    console.error("Error in dashboard data API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

