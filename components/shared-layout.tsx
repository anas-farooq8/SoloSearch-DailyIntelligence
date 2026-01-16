"use client"

import { Sidebar } from "@/components/sidebar"
import { createClient } from "@/lib/supabase/client"

interface SharedLayoutProps {
  children: React.ReactNode
}

export function SharedLayout({ children }: SharedLayoutProps) {
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar onSignOut={handleSignOut} />
      <main className="flex-1 w-full lg:ml-0">
        {/* Content - no padding/spacing on mobile, let each page control its layout */}
        {children}
      </main>
    </div>
  )
}
