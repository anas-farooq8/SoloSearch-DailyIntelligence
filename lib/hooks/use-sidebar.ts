"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

interface SidebarContextType {
  isCollapsed: boolean
  toggleCollapsed: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  // Read from localStorage synchronously on initialization to prevent flash
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') return true
    const savedState = localStorage.getItem("sidebar-collapsed")
    
    // If no saved state, initialize with default (collapsed) and save it
    if (savedState === null) {
      localStorage.setItem("sidebar-collapsed", "true")
      return true
    }
    
    return savedState === "true"
  })

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const newState = !prev
      localStorage.setItem("sidebar-collapsed", String(newState))
      return newState
    })
  }

  const value = { isCollapsed, toggleCollapsed }

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
