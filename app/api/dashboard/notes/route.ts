import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET - Fetch note for an article
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

    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get("articleId")

    if (!articleId) {
      return NextResponse.json({ error: "Article ID is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("article_id", articleId)
      .maybeSingle()

    if (error) {
      console.error("Error fetching note:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ note: data })
  } catch (error) {
    console.error("Error in notes GET API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create a new note
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
    const { articleId, content } = body

    if (!articleId || !content) {
      return NextResponse.json({ error: "Article ID and content are required" }, { status: 400 })
    }

    if (typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Content must be a non-empty string" }, { status: 400 })
    }

    // Insert note
    const { data, error } = await supabase
      .from("notes")
      .insert({
        article_id: articleId,
        content: content.trim(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating note:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ note: data })
  } catch (error) {
    console.error("Error in notes POST API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Update an existing note
export async function PUT(request: Request) {
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
    const { noteId, content } = body

    if (!noteId || !content) {
      return NextResponse.json({ error: "Note ID and content are required" }, { status: 400 })
    }

    if (typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Content must be a non-empty string" }, { status: 400 })
    }

    // Update note
    const { data, error } = await supabase
      .from("notes")
      .update({
        content: content.trim(),
      })
      .eq("id", noteId)
      .select()
      .single()

    if (error) {
      console.error("Error updating note:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ note: data })
  } catch (error) {
    console.error("Error in notes PUT API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete a note
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
    const noteId = searchParams.get("noteId")

    if (!noteId) {
      return NextResponse.json({ error: "Note ID is required" }, { status: 400 })
    }

    const { error } = await supabase.from("notes").delete().eq("id", noteId)

    if (error) {
      console.error("Error deleting note:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in notes DELETE API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

