"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import Header from "@/components/Header"
import DailyCheckInCard from "@/components/daily-tracker/DailyCheckInCard"
import StreakDisplay from "@/components/daily-tracker/StreakDisplay"
import CalendarHeatmap from "@/components/daily-tracker/CalendarHeatmap"
import FailureAlert from "@/components/daily-tracker/FailureAlert"
import { Target, Flame, Clock, CheckCircle } from "lucide-react"
import { HashLoader } from "react-spinners"
import { StatCard } from "../(authenticated)/dashboard/page"
import { cn } from "@/lib/utils"

export default function DailyTrackerPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [todayLog, setTodayLog] = useState<any>(null)
  const [streakStats, setStreakStats] = useState<any>(null)

  useEffect(() => {
    initialize()
  }, [])

  const initialize = async () => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push("/auth/login")
      return
    }

    setUser(user)

    // Fetch today's log
    const today = new Date().toISOString().split("T")[0]
    const { data: todayData } = await supabase
      .from("bludhaven_daily_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .single()

    setTodayLog(todayData)

    // Fetch streak stats
    const { data: stats } = await supabase
      .rpc('calculate_user_streak', { user_uuid: user.id })

    if (stats && stats.length > 0) {
      setStreakStats(stats[0])
    }

    setLoading(false)
  }

  const handleRefresh = () => {
    initialize()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <HashLoader color="#dc2626" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main className="px-4 py-6 md:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start gap-3 mb-2">
            <div className="w-1.5 h-10 bg-gradient-to-b from-red-500 to-red-600 rounded-full mt-1" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Daily Execution Tracker
              </h1>
              <p className="text-gray-400 text-sm">
                No mercy. Consistency only. 30-day discipline protocol.
              </p>
            </div>
          </div>
        </div>

        {/* Failure Alert */}
        <div className="mb-6">
          <FailureAlert userId={user.id} onAction={handleRefresh} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Target}
            label="Execution Rate"
            value={`${streakStats?.execution_rate || 0}%`}
            subtext="Last 30 days"
            color={streakStats?.execution_rate >= 80 ? "emerald" : streakStats?.execution_rate >= 60 ? "amber" : "red"}
            size="sm"
          />
          <StatCard
            icon={Flame}
            label="Current Streak"
            value={`${streakStats?.current_streak || 0}d`}
            subtext={`Longest: ${streakStats?.longest_streak || 0}d`}
            color="red"
            size="sm"
          />
          <StatCard
            icon={Clock}
            label="Total Hours"
            value={Math.round(streakStats?.total_hours_logged || 0)}
            subtext="Logged execution"
            color="amber"
            size="sm"
          />
          <StatCard
            icon={CheckCircle}
            label="Days Executed"
            value={streakStats?.total_days_executed || 0}
            subtext="Mission complete"
            color="emerald"
            size="sm"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Daily Check-In */}
          <div className="lg:col-span-2">
            <DailyCheckInCard
              userId={user.id}
              date={new Date()}
              existingLog={todayLog}
              onSuccess={handleRefresh}
            />
          </div>

          {/* Streak Display */}
          <div>
            <StreakDisplay userId={user.id} />
          </div>
        </div>

        {/* Calendar Heatmap */}
        <div className="mb-6">
          <CalendarHeatmap userId={user.id} />
        </div>

        {/* Recent Missions */}
        <div className="border border-gray-800 rounded-2xl bg-gradient-to-br from-gray-950/80 to-gray-950/40 backdrop-blur-sm">
          <div className="p-6 border-b border-gray-800">
            <h3 className="text-lg font-semibold text-white">Recent Executions</h3>
            <p className="text-sm text-gray-400">Last 7 days of mission logs</p>
          </div>
          <div className="p-6">
            <RecentMissions userId={user.id} />
          </div>
        </div>
      </main>
    </div>
  )
}

// Recent Missions Component
function RecentMissions({ userId }: { userId: string }) {
  const [missions, setMissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentMissions()
  }, [userId])

  const fetchRecentMissions = async () => {
    const supabase = getSupabaseClient()
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data, error } = await supabase
      .from("bludhaven_daily_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("log_date", sevenDaysAgo.toISOString().split("T")[0])
      .order("log_date", { ascending: false })
      .limit(7)

    if (!error) {
      setMissions(data || [])
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-900/50 rounded-lg animate-pulse"></div>
        ))}
      </div>
    )
  }

  if (missions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No recent executions found
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {missions.map((mission) => (
        <div
          key={mission.id}
          className={cn(
            "p-4 rounded-lg border",
            mission.is_missed
              ? "border-red-600/30 bg-red-600/5"
              : mission.is_completed
              ? "border-emerald-600/30 bg-emerald-600/5"
              : "border-gray-800 bg-gray-900/50"
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">
                {new Date(mission.log_date).toLocaleDateString("en-US", {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
              {mission.what_shipped && (
                <p className="text-sm text-gray-400 truncate max-w-[200px]">
                  {mission.what_shipped}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className={cn(
                  "font-semibold",
                  mission.is_completed ? "text-emerald-400" : "text-red-400"
                )}>
                  {mission.is_missed ? "Missed" : `${mission.hours_worked}h`}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {mission.is_completed ? "Executed" : "Failed"}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}