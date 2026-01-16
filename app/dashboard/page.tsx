import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardClient } from "@/components/dashboard/dashboard-client"
import { SharedLayout } from "@/components/shared-layout"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  // If there's an auth error or no user, redirect to login
  if (error || !user) {
    redirect("/login")
  }

  return (
    <SharedLayout>
      <DashboardClient />
    </SharedLayout>
  )
}
