"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { createClient } from "@/lib/supabase/client"
import { useIsDesktop } from "@/lib/hooks/use-media-query"

interface SharedLayoutProps {
  children: React.ReactNode
}

export function SharedLayout({ children }: SharedLayoutProps) {
  const supabase = createClient()
  const [isCollapsed, setIsCollapsed] = useState(true)
  const isDesktop = useIsDesktop()

  useEffect(() => {
    const handleStorageChange = () => {
      const savedState = localStorage.getItem("sidebar-collapsed")
      setIsCollapsed(savedState !== "false")
    }

    handleStorageChange()
    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("sidebar-toggle", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("sidebar-toggle", handleStorageChange)
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar onSignOut={handleSignOut} />
      <main 
        className="transition-all duration-300" 
        style={{
          marginLeft: isDesktop
            ? (isCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width-expanded)')
            : '0'
        }}
      >
        {children}
      </main>
    </div>
  )
}
