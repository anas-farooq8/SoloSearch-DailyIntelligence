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
            name
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

    // Return raw data - let client do the time-based calculations
    return NextResponse.json({
      articles: processedArticles,
    })
  } catch (error) {
    console.error("Error in analytics API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
