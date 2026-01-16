"use client"

import { useState, useEffect } from "react"

export function useSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Read from localStorage on mount
    const savedState = localStorage.getItem("sidebar-collapsed")
    if (savedState === null) {
      localStorage.setItem("sidebar-collapsed", "true")
    } else {
      setIsCollapsed(savedState !== "false")
    }
    setIsReady(true)

    // Listen for changes from other components
    const handleStorageChange = () => {
      const savedState = localStorage.getItem("sidebar-collapsed")
      setIsCollapsed(savedState !== "false")
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("sidebar-toggle", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("sidebar-toggle", handleStorageChange)
    }
  }, [])

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const newState = !prev
      localStorage.setItem("sidebar-collapsed", String(newState))
      window.dispatchEvent(new Event("sidebar-toggle"))
      return newState
    })
  }

  return { isCollapsed, isReady, toggleCollapsed }
}
