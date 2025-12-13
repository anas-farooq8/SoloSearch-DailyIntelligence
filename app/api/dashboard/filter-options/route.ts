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

    // Fetch all filter options in parallel
    const [sectorsRes, triggersRes, countriesRes] = await Promise.all([
      supabase.rpc("get_distinct_sectors"),
      supabase.rpc("get_distinct_triggers"),
      supabase.rpc("get_distinct_countries"),
    ])

    if (sectorsRes.error || triggersRes.error || countriesRes.error) {
      const error = sectorsRes.error || triggersRes.error || countriesRes.error
      console.error("Error fetching filter options:", error)
      return NextResponse.json({ error: error?.message }, { status: 500 })
    }

    return NextResponse.json({
      sectors: (sectorsRes.data || []).filter(Boolean),
      triggers: (triggersRes.data || []).filter(Boolean),
      countries: (countriesRes.data || []).filter(Boolean),
    })
  } catch (error) {
    console.error("Error in filter options API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

