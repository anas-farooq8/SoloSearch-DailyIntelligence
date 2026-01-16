import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    
    // Set initial value
    setMatches(media.matches)

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
  }, [query])

  return matches
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)')
}
