import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch all processed articles with minimal fields needed for analytics
    const { data: articles, error } = await supabase
      .from("articles")
      .select(
        `
        id,
        source,
        group_name,
        processed_at,
        lead_score,
        trigger_signal,
        article_tags (
          tag:tags (
            id,
            name,
            color,
            is_default
          )
        )
      `
      )
      .eq("status", "processed")
      .order("processed_at", { ascending: false })

    if (error) {
      console.error("Error fetching articles:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Process articles to flatten tag structure
    const processedArticles = (articles || []).map((article: any) => {
      const { article_tags, ...articleData } = article

      return {
        ...articleData,
        tags: article_tags?.map((at: any) => at.tag).filter(Boolean) || [],
      }
    })

    // Get the earliest article date for date range picker restrictions
    const earliestDate = articles && articles.length > 0
      ? articles.reduce((earliest: string | null, article: any) => {
          if (!article.processed_at) return earliest
          if (!earliest) return article.processed_at
          return article.processed_at < earliest ? article.processed_at : earliest
        }, null as string | null)
      : null

    // Return raw data - let client do the time-based calculations
    return NextResponse.json({
      articles: processedArticles,
      earliestArticleDate: earliestDate,
    })
  } catch (error) {
    console.error("Error in analytics API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
