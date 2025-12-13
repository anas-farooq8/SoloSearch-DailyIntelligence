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
    const { article_id, tag_id } = body

    if (!article_id || !tag_id) {
      return NextResponse.json({ error: "article_id and tag_id are required" }, { status: 400 })
    }

    const { error } = await supabase.from("article_tags").insert({
      article_id,
      tag_id,
    })

    if (error) {
      console.error("Error adding article tag:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in article-tags POST API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const article_id = searchParams.get("article_id")
    const tag_id = searchParams.get("tag_id")

    if (!article_id || !tag_id) {
      return NextResponse.json({ error: "article_id and tag_id are required" }, { status: 400 })
    }

    const { error } = await supabase.from("article_tags").delete().match({ article_id, tag_id })

    if (error) {
      console.error("Error removing article tag:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in article-tags DELETE API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

