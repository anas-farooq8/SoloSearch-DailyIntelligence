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

    // Fetch all data in parallel - only articles and tags
    const [articlesResult, tagsResult] = await Promise.all([
      // Fetch only the necessary fields for processed articles with their tags
      supabase
        .from("articles")
        .select(
          `
          id,
          source,
          group_name,
          url,
          date,
          title,
          updated_at,
          company,
          buyer,
          sector,
          amount,
          trigger_signal,
          solution,
          lead_score,
          why_this_matters,
          outreach_angle,
          additional_details,
          location_region,
          location_country,
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
        .order("updated_at", { ascending: false }),

      // Fetch all tags
      supabase.from("tags").select("*").order("name"),
    ])

    if (articlesResult.error) {
      console.error("Error fetching articles:", articlesResult.error)
      return NextResponse.json({ error: articlesResult.error.message }, { status: 500 })
    }

    if (tagsResult.error) {
      console.error("Error fetching tags:", tagsResult.error)
      return NextResponse.json({ error: tagsResult.error.message }, { status: 500 })
    }

    // Process articles to flatten tag structure and remove article_tags
    const articles = (articlesResult.data || []).map((article) => {
      const { article_tags, ...articleData } = article
      return {
        ...articleData,
        tags: article_tags?.map((at: any) => at.tag).filter(Boolean) || [],
      }
    })

    // Extract unique filter options from articles
    const sectors = [...new Set(articles.flatMap((a) => a.sector || []))].filter(Boolean).sort()
    const triggers = [...new Set(articles.flatMap((a) => a.trigger_signal || []))]
      .filter(Boolean)
      .sort()
    const countries = [...new Set(articles.map((a) => a.location_country).filter(Boolean))].sort()
    const groups = [...new Set(articles.map((a) => a.group_name).filter(Boolean))].sort()

    // Calculate KPIs from the articles (using updated_at as processed date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayISO = today.toISOString()
    
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoISO = weekAgo.toISOString()

    const totalToday = articles.filter((article) => article.updated_at >= todayISO).length
    const highPriorityToday = articles.filter(
      (article) => article.lead_score >= 8 && article.updated_at >= todayISO
    ).length
    const awaitingReview = articles.filter((article) => !article.tags || article.tags.length === 0).length
    const weeklyAdded = articles.filter((article) => article.updated_at >= weekAgoISO).length

    const kpis = {
      total_today: totalToday,
      high_priority_today: highPriorityToday,
      awaiting_review: awaitingReview,
      weekly_added: weeklyAdded,
    }

    return NextResponse.json({
      articles,
      tags: tagsResult.data || [],
      kpis,
      filterOptions: {
        sectors,
        triggers,
        countries,
        groups,
      },
    })
  } catch (error) {
    console.error("Error in dashboard data API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

