"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Rocket, BookOpen, Code, GitCommit, Ship } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface DailyCheckInCardProps {
  userId: string
  date: Date
  existingLog?: any
  onSuccess: () => void
}

export default function DailyCheckInCard({ userId, date, existingLog, onSuccess }: DailyCheckInCardProps) {
  const [hours, setHours] = useState(existingLog?.hours_worked || 0)
  const [whatShipped, setWhatShipped] = useState(existingLog?.what_shipped || "")
  const [flags, setFlags] = useState({
    learned: existingLog?.learned_something || false,
    wroteCode: existingLog?.wrote_code || false,
    committed: existingLog?.committed_pushed || false,
    deployed: existingLog?.deployed_shipped || false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMissed, setIsMissed] = useState(existingLog?.is_missed || false)

  const isCompleted = existingLog?.is_completed || false
  const currentDate = new Date()

  // Auto-mark as missed after 11:59 PM
  useEffect(() => {
    const checkIfMissed = () => {
      const now = new Date()
      const isPastDeadline = now.getDate() > date.getDate() || 
                           (now.getDate() === date.getDate() && now.getHours() >= 23 && now.getMinutes() >= 59)
      
      if (!isCompleted && isPastDeadline && !existingLog) {
        markDayAsMissed()
      }
    }

    const interval = setInterval(checkIfMissed, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [date, isCompleted, existingLog])

  const markDayAsMissed = async () => {
    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from("bludhaven_daily_logs")
      .upsert({
        user_id: userId,
        log_date: date.toISOString().split("T")[0],
        is_missed: true,
        is_completed: false,
      })

    if (!error) {
      setIsMissed(true)
      toast.error("Day marked as missed", {
        description: "No check-in submitted by deadline."
      })
    }
  }

  const handleSubmit = async () => {
    if (!whatShipped.trim()) {
      toast.error("Mission report required", {
        description: "You must report what was shipped today."
      })
      return
    }

    if (hours < 3) {
      toast.error("Insufficient execution time", {
        description: "Minimum 3 hours required for a valid mission day."
      })
      return
    }

    if (!flags.learned && !flags.wroteCode && !flags.committed) {
      toast.error("No execution flags", {
        description: "At least one execution flag must be checked."
      })
      return
    }

    setIsSubmitting(true)

    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from("bludhaven_daily_logs")
      .upsert({
        user_id: userId,
        log_date: date.toISOString().split("T")[0],
        hours_worked: hours,
        what_shipped: whatShipped.trim(),
        learned_something: flags.learned,
        wrote_code: flags.wroteCode,
        committed_pushed: flags.committed,
        deployed_shipped: flags.deployed,
        is_completed: true,
        is_missed: false,
      }, {
        onConflict: 'user_id,log_date'
      })

    setIsSubmitting(false)

    if (error) {
      toast.error("Mission log failed", {
        description: error.message
      })
    } else {
      toast.success("Mission logged", {
        description: "Day execution confirmed. No excuses."
      })
      onSuccess()
    }
  }

  if (isMissed) {
    return (
      <Card className={cn(
        "border-red-600/50 bg-gradient-to-br from-gray-950/90 to-gray-950/50",
        "relative overflow-hidden"
      )}>
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <CardTitle className="text-red-400 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Mission Failed
            </CardTitle>
            <Calendar className="w-5 h-5 text-gray-500" />
          </div>
          <p className="text-sm text-gray-400">
            {date.toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </CardHeader>
        <CardContent className="relative">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-gray-300 font-medium">No execution recorded</p>
              <p className="text-sm text-gray-500 mt-1">Discipline failed for this day.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isCompleted) {
    return (
      <Card className={cn(
        "border-emerald-600/30 bg-gradient-to-br from-gray-950/90 to-gray-950/50",
        "relative overflow-hidden"
      )}>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-transparent" />
        <div className="absolute top-4 right-4">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-600/20 blur-md" />
            <CheckCircle className="w-6 h-6 text-emerald-400 relative" />
          </div>
        </div>
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <CardTitle className="text-emerald-400 flex items-center gap-2">
              <Rocket className="w-5 h-5" />
              Mission Executed
            </CardTitle>
            <Calendar className="w-5 h-5 text-gray-500" />
          </div>
          <p className="text-sm text-gray-400">
            {date.toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </CardHeader>
        <CardContent className="relative">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-400">Hours logged:</span>
              </div>
              <span className="text-lg font-semibold text-emerald-400">{hours}</span>
            </div>
            
            <div>
              <p className="text-sm text-gray-400 mb-2">Shipped:</p>
              <p className="text-gray-300 bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                {whatShipped}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {flags.learned && (
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <BookOpen className="w-3 h-3" />
                  Learned
                </div>
              )}
              {flags.wroteCode && (
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <Code className="w-3 h-3" />
                  Wrote Code
                </div>
              )}
              {flags.committed && (
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <GitCommit className="w-3 h-3" />
                  Committed
                </div>
              )}
              {flags.deployed && (
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <Ship className="w-3 h-3" />
                  Deployed
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(
      "border-gray-800 bg-gradient-to-br from-gray-950/90 to-gray-950/50",
      "relative overflow-hidden hover:border-gray-700 transition-colors"
    )}>
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Daily Execution
          </CardTitle>
          <Calendar className="w-5 h-5 text-gray-500" />
        </div>
        <p className="text-sm text-gray-400">
          {date.toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </CardHeader>
      <CardContent className="relative space-y-5">
        {/* Hours Input */}
        <div>
          <Label htmlFor="hours" className="text-sm text-gray-400 flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4" />
            Hours Executed (min. 3)
          </Label>
          <Input
            id="hours"
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={hours}
            onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
            className="bg-gray-900 border-gray-700 text-white"
            placeholder="3"
          />
        </div>

        {/* Execution Flags */}
        <div className="space-y-3">
          <p className="text-sm text-gray-400">Execution Flags:</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="learned"
                checked={flags.learned}
                onCheckedChange={(checked: boolean) => setFlags(prev => ({ ...prev, learned: checked as boolean }))}
                className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
              />
              <Label htmlFor="learned" className="text-sm text-gray-300 flex items-center gap-2">
                <BookOpen className="w-3 h-3" />
                Learned
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="wroteCode"
                checked={flags.wroteCode}
                onCheckedChange={(checked: boolean) => setFlags(prev => ({ ...prev, wroteCode: checked as boolean }))}
                className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
              />
              <Label htmlFor="wroteCode" className="text-sm text-gray-300 flex items-center gap-2">
                <Code className="w-3 h-3" />
                Wrote Code
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="committed"
                checked={flags.committed}
                onCheckedChange={(checked: boolean) => setFlags(prev => ({ ...prev, committed: checked as boolean }))}
                className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
              />
              <Label htmlFor="committed" className="text-sm text-gray-300 flex items-center gap-2">
                <GitCommit className="w-3 h-3" />
                Committed
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="deployed"
                checked={flags.deployed}
                onCheckedChange={(checked: boolean) => setFlags(prev => ({ ...prev, deployed: checked as boolean }))}
                className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
              />
              <Label htmlFor="deployed" className="text-sm text-gray-300 flex items-center gap-2">
                <Ship className="w-3 h-3" />
                Deployed
              </Label>
            </div>
          </div>
        </div>

        {/* Mission Report */}
        <div>
          <Label htmlFor="shipped" className="text-sm text-gray-400 flex items-center gap-2 mb-2">
            <Rocket className="w-4 h-4" />
            What did you ship today? *
          </Label>
          <Textarea
            id="shipped"
            value={whatShipped}
            onChange={(e) => setWhatShipped(e.target.value)}
            className="bg-gray-900 border-gray-700 text-white min-h-[100px]"
            placeholder="Describe exactly what you shipped/produced today..."
            required
          />
        </div>
      </CardContent>
      <CardFooter className="relative">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
        >
          {isSubmitting ? "Confirming..." : "Confirm Day Execution"}
        </Button>
      </CardFooter>
    </Card>
  )
}