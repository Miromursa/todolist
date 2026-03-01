"use client"

import { useState, useEffect } from "react"
import { Flame, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface StreakData {
  id: number;
  current_streak: number;
  longest_streak: number;
  last_completed_date: number;
  created_at: number;
}

interface StreakCounterProps {
  compact?: boolean;
}

export function StreakCounter({ compact = false }: StreakCounterProps) {
  const [streak, setStreak] = useState<StreakData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStreak()
  }, [])

  const fetchStreak = async () => {
    try {
      const response = await fetch('/api/streak')
      const data = await response.json()
      setStreak(data)
    } catch (error) {
      console.error('Failed to fetch streak:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateStreak = async () => {
    try {
      const response = await fetch('/api/streak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update' }),
      })
      const data = await response.json()
      setStreak(data)
    } catch (error) {
      console.error('Failed to update streak:', error)
    }
  }

  if (compact) {
    if (isLoading) {
      return (
        <div className="flex items-center gap-1">
          <div className="animate-pulse h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="animate-pulse h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      )
    }

    if (!streak) {
      return null
    }

    const getStreakColor = (days: number) => {
      if (days === 0) return "text-gray-500"
      if (days < 3) return "text-orange-600"
      if (days < 7) return "text-orange-700"
      if (days < 14) return "text-red-600"
      if (days < 30) return "text-purple-600"
      return "text-yellow-600"
    }

    return (
      <div className="flex items-center gap-1">
        <Flame className={`h-4 w-4 ${getStreakColor(streak.current_streak)}`} />
        <span className={`font-semibold ${getStreakColor(streak.current_streak)}`}>
          {streak.current_streak}
        </span>
        <span className="text-xs text-muted-foreground">day streak</span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <Card className="p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
      </Card>
    )
  }

  if (!streak) {
    return null
  }

  const getStreakEmoji = (days: number) => {
    if (days === 0) return "💪"
    if (days < 3) return "🔥"
    if (days < 7) return "🔥🔥"
    if (days < 14) return "🔥🔥🔥"
    if (days < 30) return "💎"
    return "👑"
  }

  const getStreakColor = (days: number) => {
    if (days === 0) return "text-gray-500"
    if (days < 3) return "text-orange-600"
    if (days < 7) return "text-orange-700"
    if (days < 14) return "text-red-600"
    if (days < 30) return "text-purple-600"
    return "text-yellow-600"
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Flame className={`h-5 w-5 ${getStreakColor(streak.current_streak)}`} />
            <span className="text-2xl font-bold">{getStreakEmoji(streak.current_streak)}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${getStreakColor(streak.current_streak)}`}>
                {streak.current_streak}
              </span>
              <span className="text-sm text-muted-foreground">day streak</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Trophy className="h-3 w-3" />
              <span>Best: {streak.longest_streak} days</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={updateStreak}
            className="h-7 px-2 text-xs"
          >
            Check
          </Button>
        </div>
      </div>
      
      {streak.current_streak === 0 && (
        <div className="mt-2 text-xs text-muted-foreground italic">
          Complete all daily tasks to start your streak!
        </div>
      )}
      
      {streak.current_streak > 0 && (
        <div className="mt-2 text-xs text-muted-foreground">
          Keep it up! You're on fire! 🔥
        </div>
      )}
    </Card>
  )
}
