"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  BarChart3, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useIsDesktop } from "@/lib/hooks/use-media-query"

interface SidebarProps {
  onSignOut: () => void
}

export function Sidebar({ onSignOut }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const isDesktop = useIsDesktop()

  // Load collapsed state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-collapsed")
    const collapsed = savedState !== "false"
    setIsCollapsed(collapsed)
    
    if (savedState === null) {
      localStorage.setItem("sidebar-collapsed", "true")
    }
  }, [])

  // Save collapsed state to localStorage and dispatch event with animation
  const toggleCollapsed = () => {
    setIsTransitioning(true)
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem("sidebar-collapsed", String(newState))
    
    // Dispatch custom event for SharedLayout to listen
    window.dispatchEvent(new Event("sidebar-toggle"))
    
    // Remove transitioning class after animation completes
    setTimeout(() => setIsTransitioning(false), 300)
  }

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  const closeMobile = () => {
    setIsMobileOpen(false)
  }

  const navItems = [
    {
      href: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      href: "/analytics",
      icon: BarChart3,
      label: "Analytics",
    },
  ]

  return (
    <>
      {/* Mobile Menu Button - Outside Sidebar */}
      {!isMobileOpen && (
        <button
          onClick={toggleMobile}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-slate-200 hover:bg-slate-50 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6 text-slate-700" />
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-white border-r border-slate-200 flex flex-col",
          "sidebar-animate",
          isTransitioning && "transitioning",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        style={{
          width: isDesktop
            ? (isCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width-expanded)')
            : 'var(--sidebar-width-mobile)',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Logo Section with Mobile Menu Button Inside */}
        <div className="p-4 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile close button inside sidebar - Shows X when open */}
            {!isDesktop && (
              <button
                onClick={closeMobile}
                className="lg:hidden p-1 hover:bg-slate-100 rounded transition-colors"
                aria-label="Close menu"
              >
                <X className="h-6 w-6 text-slate-700" />
              </button>
            )}
            
            <Image
              src="https://www.google.com/s2/favicons?domain=https://www.solosearch.co.uk/&sz=64"
              alt="SoloSearch Logo"
              width={32}
              height={32}
              className="rounded flex-shrink-0"
            />
            
            {(!isCollapsed || !isDesktop) && (
              <div className={cn(
                "min-w-0 flex-1",
                isDesktop && (isCollapsed ? "sidebar-text-exit" : "sidebar-text-enter")
              )}>
                <h1 className="text-lg font-bold text-slate-900 truncate">
                  SoloSearch
                </h1>
                <p className="text-xs text-slate-600">Daily Intelligence</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto min-h-0">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                scroll={true}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  "hover:bg-slate-100",
                  isActive
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-slate-700",
                  isCollapsed && isDesktop && "justify-center"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {(!isCollapsed || !isDesktop) && (
                  <span className={cn(
                    isDesktop && (isCollapsed ? "sidebar-text-exit" : "sidebar-text-enter")
                  )}>
                    {item.label}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout Button - Always visible at bottom */}
        <div className="p-3 border-t border-slate-200 flex-shrink-0">
          <Button
            variant="ghost"
            onClick={() => {
              closeMobile()
              onSignOut()
            }}
            className={cn(
              "w-full justify-start gap-3 text-slate-700 transition-all duration-200",
              "bg-slate-100 hover:bg-slate-200",
              isCollapsed && isDesktop && "justify-center px-2"
            )}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {(!isCollapsed || !isDesktop) && (
              <span className={cn(
                isDesktop && (isCollapsed ? "sidebar-text-exit" : "sidebar-text-enter")
              )}>
                Logout
              </span>
            )}
          </Button>
        </div>

      </aside>

      {/* Desktop Collapse Toggle - Floating Button */}
      <button
        onClick={toggleCollapsed}
        className="hidden lg:flex items-center justify-center fixed top-1/2 -translate-y-1/2 z-50 w-5 h-10 bg-primary rounded-r-lg hover:bg-primary/90 shadow-xs hover:shadow-md cursor-pointer"
        style={{
          left: isCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width-expanded)',
          transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease'
        }}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <div className="transition-transform duration-200">
          {isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5 text-primary-foreground" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5 text-primary-foreground" />
          )}
        </div>
      </button>
    </>
  )
}
