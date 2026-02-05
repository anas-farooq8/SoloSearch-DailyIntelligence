import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  // Initialize with correct value to prevent hydration mismatch
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const media = window.matchMedia(query)
    
    // Update if initial value was wrong
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    // Debounced listener for performance
    let timeoutId: NodeJS.Timeout
    const listener = (e: MediaQueryListEvent) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setMatches(e.matches)
      }, 50) // 50ms debounce
    }
    
    // Add listener
    media.addEventListener('change', listener)
    
    // Cleanup
    return () => {
      clearTimeout(timeoutId)
      media.removeEventListener('change', listener)
    }
  }, [query, matches])

  return matches
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)')
}
