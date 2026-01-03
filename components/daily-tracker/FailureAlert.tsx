"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, RotateCcw, Skull } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface FailureAlertProps {
  userId: string
  onAction: () => void
}

export default function FailureAlert({ userId, onAction }: FailureAlertProps) {
  const [showAlert, setShowAlert] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    checkForFailureState()
  }, [userId])

  const checkForFailureState = async () => {
    const supabase = getSupabaseClient()
    
    // Get last 2 days
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    const dayBeforeYesterday = new Date()
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2)

    const { data, error } = await supabase
      .from("bludhaven_daily_logs")
      .select("log_date, is_missed")
      .eq("user_id", userId)
      .in("log_date", [
        yesterday.toISOString().split("T")[0],
        dayBeforeYesterday.toISOString().split("T")[0]
      ])
      .eq("is_missed", true)

    if (!error && data && data.length >= 2) {
      setShowAlert(true)
    }
    setIsChecking(false)
  }

  const handleRecommit = async () => {
    const supabase = getSupabaseClient()
    
    // Reset streak by clearing last two days
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    const dayBeforeYesterday = new Date()
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2)

    const { error } = await supabase
      .from("bludhaven_daily_logs")
      .delete()
      .eq("user_id", userId)
      .in("log_date", [
        yesterday.toISOString().split("T")[0],
        dayBeforeYesterday.toISOString().split("T")[0]
      ])

    if (!error) {
      toast.warning("Streak reset", {
        description: "Recommitting. Start again."
      })
      setShowAlert(false)
      onAction()
    }
  }

  const handleAcceptFailure = async () => {
    // Lock the tracker by marking user as failed
    toast.error("Failure accepted", {
      description: "Tracker locked. Discipline failed."
    })
    setShowAlert(false)
  }

  if (isChecking || !showAlert) return null

  return (
    <Card className={cn(
      "border-red-600/50 bg-gradient-to-br from-red-950/20 to-gray-950/50",
      "relative overflow-hidden"
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent" />
      <CardHeader className="relative">
        <CardTitle className="text-red-400 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Discipline Failed
        </CardTitle>
        <p className="text-sm text-gray-400">2 consecutive days missed</p>
      </CardHeader>
      <CardContent className="relative space-y-4">
        <div className="space-y-2">
          <p className="text-gray-300">
            You have missed two consecutive days of execution. This breaks discipline protocol.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Skull className="w-4 h-4" />
            <span>No excuses. Decide your next move.</span>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleRecommit}
            className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Recommit
          </Button>
          <Button
            onClick={handleAcceptFailure}
            variant="outline"
            className="flex-1 border-red-600 text-red-400 hover:bg-red-600/10"
          >
            Accept Failure
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}