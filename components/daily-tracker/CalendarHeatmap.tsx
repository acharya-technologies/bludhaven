"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, GitCommit, Rocket } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CalendarHeatmapProps {
  userId: string
}

interface DayData {
  date: Date
  hours_worked: number
  what_shipped: string | null
  commit_count: number
  is_completed: boolean
  is_missed: boolean
}

export default function CalendarHeatmap({ userId }: CalendarHeatmapProps) {
  const [days, setDays] = useState<DayData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCalendarData()
  }, [userId])

  const fetchCalendarData = async () => {
    const supabase = getSupabaseClient()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data, error } = await supabase
      .from("bludhaven_daily_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("log_date", thirtyDaysAgo.toISOString().split("T")[0])
      .order("log_date", { ascending: true })

    if (!error) {
      // Generate all 30 days
      const allDays: DayData[] = []
      for (let i = 30; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)

        const existing = data?.find(d => 
          new Date(d.log_date).toDateString() === date.toDateString()
        )

        allDays.push({
          date,
          hours_worked: existing?.hours_worked || 0,
          what_shipped: existing?.what_shipped || null,
          commit_count: existing?.commit_count || 0,
          is_completed: existing?.is_completed || false,
          is_missed: existing?.is_missed || false,
        })
      }
      setDays(allDays)
    }
    setLoading(false)
  }

  const getDayColor = (day: DayData) => {
    if (day.is_missed) return "bg-red-600/80 border-red-700"
    if (day.is_completed) {
      if (day.hours_worked >= 6) return "bg-emerald-600/80 border-emerald-700"
      if (day.hours_worked >= 3) return "bg-amber-600/80 border-amber-700"
      return "bg-orange-600/80 border-orange-700"
    }
    if (day.date > new Date()) return "bg-gray-900 border-gray-800"
    return "bg-gray-800 border-gray-700"
  }

  const getDayTooltip = (day: DayData) => {
    if (day.is_missed) return "Missed - No execution"
    if (day.is_completed) {
      return `${day.hours_worked}h executed${day.what_shipped ? ` - ${day.what_shipped}` : ''}`
    }
    if (day.date > new Date()) return "Future day"
    return "No data"
  }

  if (loading) {
    return (
      <Card className="border-gray-800 bg-gradient-to-br from-gray-950/90 to-gray-950/50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-800 rounded w-1/2"></div>
            <div className="grid grid-cols-7 gap-2">
              {[...Array(35)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-800 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-gray-800 bg-gradient-to-br from-gray-950/90 to-gray-950/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          30-Day Execution Calendar
        </CardTitle>
        <p className="text-sm text-gray-400">Daily execution heatmap</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600/80 rounded-sm"></div>
              <span className="text-gray-400">Missed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-600/80 rounded-sm"></div>
              <span className="text-gray-400">Partial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-600/80 rounded-sm"></div>
              <span className="text-gray-400">Executed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-600/80 rounded-sm"></div>
              <span className="text-gray-400">Full</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-800 rounded-sm"></div>
              <span className="text-gray-400">Empty</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <TooltipProvider>
            <div className="grid grid-cols-7 gap-1.5">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                <div key={i} className="text-center text-xs text-gray-500 pb-1">
                  {day}
                </div>
              ))}
              
              {days.map((day, index) => (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "aspect-square rounded-sm border cursor-pointer hover:opacity-80 transition-opacity",
                        getDayColor(day)
                      )}
                    >
                      {day.is_completed && day.hours_worked >= 6 && (
                        <Rocket className="w-3 h-3 mx-auto mt-0.5 text-white" />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-900 border-gray-800 text-white max-w-[200px]">
                    <div className="space-y-1">
                      <p className="font-medium">
                        {day.date.toLocaleDateString("en-US", { 
                          weekday: 'long', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                      {day.is_missed ? (
                        <p className="text-red-400 text-sm">Missed - No execution</p>
                      ) : day.is_completed ? (
                        <>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-3 h-3" />
                            <span>{day.hours_worked}h executed</span>
                          </div>
                          {day.what_shipped && (
                            <p className="text-gray-300 text-sm truncate">
                              Shipped: {day.what_shipped}
                            </p>
                          )}
                          {day.commit_count > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                              <GitCommit className="w-3 h-3" />
                              <span>{day.commit_count} commits</span>
                            </div>
                          )}
                        </>
                      ) : day.date > new Date() ? (
                        <p className="text-gray-400 text-sm">Future day</p>
                      ) : (
                        <p className="text-gray-400 text-sm">No data recorded</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  )
}