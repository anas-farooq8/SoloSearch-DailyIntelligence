import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { page = 0, pageSize = 20, filters = {} } = body

    // Fetch articles
    const { data: articles, error: articlesError } = await supabase.rpc("get_articles_with_tags", {
      p_page: page,
      p_page_size: pageSize,
      p_search: filters.search || null,
      p_min_score: filters.minScore ?? null,
      p_max_score: filters.maxScore ?? null,
      p_sectors: filters.sectors?.length > 0 ? filters.sectors : null,
      p_triggers: filters.triggers?.length > 0 ? filters.triggers : null,
      p_country: filters.country || null,
      p_tag_ids: filters.tagIds?.length > 0 ? filters.tagIds : null,
    })

    if (articlesError) {
      console.error("Error fetching articles:", articlesError)
      return NextResponse.json({ error: articlesError.message }, { status: 500 })
    }

    // Fetch total count
    const { data: countData, error: countError } = await supabase.rpc("count_filtered_articles", {
      p_search: filters.search || null,
      p_min_score: filters.minScore ?? null,
      p_max_score: filters.maxScore ?? null,
      p_sectors: filters.sectors?.length > 0 ? filters.sectors : null,
      p_triggers: filters.triggers?.length > 0 ? filters.triggers : null,
      p_country: filters.country || null,
      p_tag_ids: filters.tagIds?.length > 0 ? filters.tagIds : null,
    })

    if (countError) {
      console.error("Error counting articles:", countError)
      return NextResponse.json({ error: countError.message }, { status: 500 })
    }

    return NextResponse.json({
      articles: articles || [],
      total: countData || 0,
    })
  } catch (error) {
    console.error("Error in articles API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

