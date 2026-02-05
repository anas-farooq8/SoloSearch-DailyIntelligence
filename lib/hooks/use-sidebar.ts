"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface SidebarContextType {
  isCollapsed: boolean
  toggleCollapsed: () => void
  isHydrated: boolean
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  // Always start with default value to match server-side render
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)

  // After hydration, read from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-collapsed")
    
    if (savedState !== null) {
      setIsCollapsed(savedState === "true")
    }
    
    setIsHydrated(true)
  }, [])

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const newState = !prev
      localStorage.setItem("sidebar-collapsed", String(newState))
      return newState
    })
  }

  const value = { isCollapsed, toggleCollapsed, isHydrated }

  return React.createElement(
    SidebarContext.Provider,
    { value },
    children
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}
