"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame, Target, Clock, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface StreakDisplayProps {
  userId: string
}

interface StreakStats {
  current_streak: number
  longest_streak: number
  total_missed_days: number
  total_days_executed: number
  total_hours_logged: number
  execution_rate: number
}

export default function StreakDisplay({ userId }: StreakDisplayProps) {
  const [stats, setStats] = useState<StreakStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStreakStats()
  }, [userId])

  const fetchStreakStats = async () => {
    const supabase = getSupabaseClient()
    
    // Call the PostgreSQL function
    const { data, error } = await supabase
      .rpc('calculate_user_streak', { user_uuid: userId })

    if (!error && data && data.length > 0) {
      setStats(data[0])
    }
    setLoading(false)
  }

  const getStreakColor = (streak: number) => {
    if (streak >= 21) return "text-emerald-400"
    if (streak >= 14) return "text-amber-400"
    if (streak >= 7) return "text-orange-400"
    return "text-red-400"
  }

  if (loading) {
    return (
      <Card className="border-gray-800 bg-gradient-to-br from-gray-950/90 to-gray-950/50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-800 rounded w-3/4"></div>
            <div className="h-8 bg-gray-800 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-gray-800 bg-gradient-to-br from-gray-950/90 to-gray-950/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Flame className="w-5 h-5 text-red-400" />
          Execution Streak
        </CardTitle>
        <p className="text-sm text-gray-400">No mercy. Consistency only.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Streak */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg border",
              stats?.current_streak && stats.current_streak > 0 
                ? "border-red-600/30 bg-red-600/10" 
                : "border-gray-800 bg-gray-900/50"
            )}>
              <Flame className={cn(
                "w-5 h-5",
                stats?.current_streak && stats.current_streak > 0 
                  ? "text-red-400" 
                  : "text-gray-600"
              )} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Current Streak</p>
              <p className={cn(
                "text-2xl font-bold",
                getStreakColor(stats?.current_streak || 0)
              )}>
                {stats?.current_streak || 0} days
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Longest</p>
            <p className="text-lg font-semibold text-white">
              {stats?.longest_streak || 0} days
            </p>
          </div>
        </div>

        {/* Missed Days */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg border",
              stats?.total_missed_days && stats.total_missed_days > 0
                ? "border-amber-600/30 bg-amber-600/10"
                : "border-gray-800 bg-gray-900/50"
            )}>
              <AlertTriangle className={cn(
                "w-5 h-5",
                stats?.total_missed_days && stats.total_missed_days > 0
                  ? "text-amber-400"
                  : "text-gray-600"
              )} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Missed Days</p>
              <p className={cn(
                "text-xl font-bold",
                stats?.total_missed_days && stats.total_missed_days > 0
                  ? "text-amber-400"
                  : "text-white"
              )}>
                {stats?.total_missed_days || 0}
              </p>
            </div>
          </div>
          
          {/* Execution Rate */}
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
              <Target className="w-4 h-4 text-gray-500" />
              <p className="text-sm text-gray-400">Execution Rate</p>
            </div>
            <p className={cn(
              "text-lg font-semibold",
              stats?.execution_rate && stats.execution_rate >= 80
                ? "text-emerald-400"
                : stats?.execution_rate && stats.execution_rate >= 60
                ? "text-amber-400"
                : "text-red-400"
            )}>
              {stats?.execution_rate || 0}%
            </p>
          </div>
        </div>

        {/* Total Stats */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg border border-gray-800 bg-gray-900/50">
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Hours</p>
              <p className="text-lg font-semibold text-white">
                {Math.round(stats?.total_hours_logged || 0)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Days Executed</p>
            <p className="text-lg font-semibold text-white">
              {stats?.total_days_executed || 0}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}