"use client"

import { Sidebar } from "@/components/sidebar"
import { createClient } from "@/lib/supabase/client"
import { useIsDesktop } from "@/lib/hooks/use-media-query"
import { useSidebar } from "@/lib/hooks/use-sidebar"

interface SharedLayoutProps {
  children: React.ReactNode
}

export function SharedLayout({ children }: SharedLayoutProps) {
  const supabase = createClient()
  const isDesktop = useIsDesktop()
  const { isCollapsed, isReady } = useSidebar()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar onSignOut={handleSignOut} />
      <main 
        suppressHydrationWarning
        style={{
          // Always start with collapsed margin until localStorage is read
          // This prevents layout shift on initial load
          marginLeft: isDesktop
            ? (isReady 
                ? (isCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width-expanded)')
                : 'var(--sidebar-width-collapsed)' // Always collapsed until ready
              )
            : '0',
          transition: isReady ? 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
        }}
      >
        {children}
      </main>
    </div>
  )
}
