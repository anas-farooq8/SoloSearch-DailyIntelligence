"use client"

import { Sidebar } from "@/components/sidebar"
import { createClient } from "@/lib/supabase/client"
import { useIsDesktop } from "@/lib/hooks/use-media-query"
import { SidebarProvider, useSidebar } from "@/lib/hooks/use-sidebar"

interface SharedLayoutProps {
  children: React.ReactNode
}

function SharedLayoutContent({ children }: SharedLayoutProps) {
  const supabase = createClient()
  const isDesktop = useIsDesktop()
  const { isCollapsed, isHydrated } = useSidebar()

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
          marginLeft: isDesktop && isHydrated
            ? (isCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width-expanded)')
            : isDesktop
            ? 'var(--sidebar-width-collapsed)'
            : '0',
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {children}
      </main>
    </div>
  )
}

export function SharedLayout({ children }: SharedLayoutProps) {
  return (
    <SidebarProvider>
      <SharedLayoutContent>{children}</SharedLayoutContent>
    </SidebarProvider>
  )
}
