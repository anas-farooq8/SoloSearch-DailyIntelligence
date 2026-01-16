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
      // Fetch only the necessary fields for processed articles with their tags and notes
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
          processed_at,
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
          ),
          notes (
            id,
            content,
            created_at,
            updated_at
          )
        `
        )
        .eq("status", "processed")
        .order("processed_at", { ascending: false }),

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

    // Process articles to flatten tag structure and remove article_tags, handle notes
    const articles = (articlesResult.data || []).map((article: any) => {
      const { article_tags, notes, ...articleData } = article
      
      return {
        ...articleData,
        tags: article_tags?.map((at: any) => at.tag).filter(Boolean) || [],
        // Notes is an object (one-to-one relationship), not an array
        note: notes || null,
      }
    })

    // Extract unique filter options from articles
    const sectors = [...new Set(articles.flatMap((a) => a.sector || []))].filter(Boolean).sort()
    const triggers = [...new Set(articles.flatMap((a) => a.trigger_signal || []))]
      .filter(Boolean)
      .sort()
    const sources = [...new Set(articles.map((a) => a.source).filter(Boolean))].sort()
    const groups = [...new Set(articles.map((a) => a.group_name).filter(Boolean))].sort()
    const countries = [...new Set(articles.map((a) => a.location_country).filter(Boolean))].sort()

    // KPIs will be calculated on client-side to use user's local timezone
    // Just return basic awaiting_review count here
    const awaitingReview = articles.filter((article) => !article.tags || article.tags.length === 0).length

    const kpis = {
      awaiting_review: awaitingReview,
      weekly_added: 0, // Will be calculated on client
      weekly_added_previous: 0, // Will be calculated on client
      weekly_high_priority: 0, // Will be calculated on client
    }

    return NextResponse.json({
      articles,
      tags: tagsResult.data || [],
      kpis,
      filterOptions: {
        sectors,
        triggers,
        sources,
        groups,
        countries,
      },
    })
  } catch (error) {
    console.error("Error in dashboard data API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
