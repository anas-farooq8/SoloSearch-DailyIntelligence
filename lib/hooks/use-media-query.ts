import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  // Always start with false so server and client render the same HTML on first paint.
  // useEffect updates to the real value after hydration to avoid React hydration errors.
  const [matches, setMatches] = useState(false)

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
