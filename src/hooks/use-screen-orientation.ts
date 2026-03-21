"use client"

import { useState, useEffect } from "react"

interface UseScreenOrientationReturn {
  isPortrait: boolean
  isLandscape: boolean
  aspectRatio: number
  isVerticalMonitor: boolean
}

export function useScreenOrientation(): UseScreenOrientationReturn {
  const [orientation, setOrientation] = useState<UseScreenOrientationReturn>({
    isPortrait: false,
    isLandscape: true,
    aspectRatio: 16 / 9,
    isVerticalMonitor: false,
  })

  useEffect(() => {
    const updateOrientation = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const ratio = width / height
      
      // Consider vertical monitor if:
      // 1. Height > width (portrait orientation)
      // 2. OR aspect ratio is less than 1.4 (more square/tall than typical widescreen)
      const isPortrait = height > width
      const isVerticalMonitor = isPortrait || ratio < 1.4
      
      setOrientation({
        isPortrait,
        isLandscape: !isPortrait,
        aspectRatio: ratio,
        isVerticalMonitor,
      })
    }

    // Initial check
    updateOrientation()

    // Listen for resize events
    window.addEventListener('resize', updateOrientation)
    
    // Listen for orientation changes on mobile devices
    if (window.screen && window.screen.orientation) {
      window.screen.orientation.addEventListener('change', updateOrientation)
    }

    return () => {
      window.removeEventListener('resize', updateOrientation)
      if (window.screen && window.screen.orientation) {
        window.screen.orientation.removeEventListener('change', updateOrientation)
      }
    }
  }, [])

  return orientation
}
