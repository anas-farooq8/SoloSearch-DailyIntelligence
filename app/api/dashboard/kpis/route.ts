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

    const { data, error } = await supabase.rpc("get_dashboard_kpis")

    if (error) {
      console.error("Error fetching KPIs:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data?.[0] || { total_today: 0, high_priority_today: 0, awaiting_review: 0, weekly_added: 0 })
  } catch (error) {
    console.error("Error in KPIs API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

