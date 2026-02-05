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
import { useSidebar } from "@/lib/hooks/use-sidebar"

interface SidebarProps {
  onSignOut: () => void
}

export function Sidebar({ onSignOut }: SidebarProps) {
  const pathname = usePathname()
  const { isCollapsed, toggleCollapsed } = useSidebar()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const isDesktop = useIsDesktop()

  // Static navigation items - no need to memoize since they never change
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

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen && !isDesktop) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileOpen, isDesktop])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  const toggleMobile = () => {
    setIsMobileOpen(prev => !prev)
  }

  const closeMobile = () => {
    setIsMobileOpen(false)
  }

  return (
    <>
      {/* Mobile Menu Button - Outside Sidebar */}
      {!isMobileOpen && (
        <button
          onClick={toggleMobile}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md border border-slate-200 hover:bg-slate-50 transition-colors touch-manipulation"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6 text-slate-700" />
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        suppressHydrationWarning
        className={cn(
          "fixed top-0 left-0 h-full bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out",
          "lg:z-30 lg:translate-x-0",
          isMobileOpen ? "z-50 translate-x-0" : "z-30 -translate-x-full"
        )}
        style={{
          width: isDesktop
            ? (isCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width-expanded)')
            : 'var(--sidebar-width-mobile)'
        }}
      >
        {/* Logo Section with Mobile Menu Button Inside */}
        <div className="h-16 px-4 border-b border-slate-200 flex items-center gap-3 flex-shrink-0">
          {/* Mobile close button inside sidebar - Shows X when open */}
          {!isDesktop && (
            <button
              onClick={closeMobile}
              className="lg:hidden p-1 hover:bg-slate-100 rounded-md transition-colors touch-manipulation"
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
            className="rounded-sm flex-shrink-0"
          />
          
          {(!isCollapsed || !isDesktop) && (
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-bold text-slate-900 truncate">
                Solo Search
              </h1>
              <p className="text-xs text-slate-600 truncate">Daily Intelligence</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 min-h-0 space-y-1.5 px-3 py-4 overflow-y-auto">
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
                  "flex items-center gap-3 px-3 py-3 rounded-md transition-all duration-200 touch-manipulation",
                  "hover:bg-slate-100",
                  isActive
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-slate-700",
                  isCollapsed && isDesktop && "justify-center"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {(!isCollapsed || !isDesktop) && (
                  <span className="whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="border-t border-slate-200 p-3 flex-shrink-0">
          <Button
            variant="ghost"
            onClick={() => {
              closeMobile()
              onSignOut()
            }}
            className={cn(
              "w-full justify-start gap-3 text-slate-700 transition-all duration-200 h-11 touch-manipulation",
              "bg-slate-100 hover:bg-slate-200 rounded-md",
              isCollapsed && isDesktop && "justify-center px-2"
            )}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {(!isCollapsed || !isDesktop) && (
              <span className="whitespace-nowrap font-medium">
                Logout
              </span>
            )}
          </Button>
        </div>

      </aside>

      {/* Desktop Collapse Toggle - Floating Button */}
      <button
        onClick={toggleCollapsed}
        className="hidden lg:flex items-center justify-center fixed top-1/2 -translate-y-1/2 z-50 w-5 h-10 bg-blue-600 rounded-r-md hover:bg-blue-700 shadow-md cursor-pointer transition-colors"
        style={{
          left: isCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width-expanded)',
          transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease'
        }}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-white" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-white" />
        )}
      </button>
    </>
  )
}
