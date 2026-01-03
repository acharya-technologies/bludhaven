// components/SQLExportButton.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Database, Download, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { downloadSQLExport } from "@/lib/export-sql"

interface SQLExportButtonProps {
  userId: string
  variant?: "default" | "outline" | "secondary" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export default function SQLExportButton({
  userId,
  variant = "outline",
  size = "default",
  className = ""
}: SQLExportButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      await downloadSQLExport(userId)
    } catch (err: any) {
      console.error(err)
      alert(err?.message || "Failed to export SQL")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      disabled={loading}
      onClick={handleExport}
      className={cn(
        "relative gap-2",
        "bg-gray-900/60 border-gray-700",
        "hover:bg-gray-800 hover:border-red-600/50",
        "transition-all",
        "active:scale-[0.97]",
        loading && "cursor-not-allowed",
        className
      )}
    >
      {/* Icon */}
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-gray-300" />
      ) : (
        <Database className="w-4 h-4" />
      )}

      {/* Label (hidden for icon-only) */}
      {size !== "icon" && (
        <span className="text-sm font-medium">
          {loading ? "Exporting…" : "Export SQL"}
        </span>
      )}
    </Button>
  )
}
