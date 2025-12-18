"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2, CreditCard, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface ExpenseModalProps {
  expense: any | null
  projects: any[]
  onClose: () => void
  onSuccess: () => void
}

export default function ExpenseModal({ expense, projects, onClose, onSuccess }: ExpenseModalProps) {
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState<Date>(expense?.date ? new Date(expense.date) : new Date())
  const [formData, setFormData] = useState({
    category: expense?.category || "development",
    amount: expense?.amount || "",
    description: expense?.description || "",
  })

  const categories = [
    { value: "development", label: "Development" },
    { value: "hosting", label: "Hosting" },
    { value: "marketing", label: "Marketing" },
    { value: "tools", label: "Tools & Software" },
    { value: "salary", label: "Salary" },
    { value: "other", label: "Other" }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error("No user found")

      const expenseData = {
        user_id: user.id,
        category: formData.category,
        amount: parseFloat(formData.amount as string),
        description: formData.description || null,
        date: date.toISOString().split('T')[0],
      }

      if (expense) {
        // Update existing expense
        const { error } = await supabase
          .from("bludhaven_expenses")
          .update(expenseData)
          .eq("id", expense.id)

        if (error) throw error
      } else {
        // Create new expense
        const { error } = await supabase
          .from("bludhaven_expenses")
          .insert([expenseData])

        if (error) throw error
      }

      onSuccess()
    } catch (error: any) {
      console.error("Error saving expense:", error)
      alert(error.message || "Failed to save expense")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border border-gray-800 max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-5 bg-red-600 rounded-full" />
              <DialogTitle className="text-lg text-white">
                {expense ? "Edit Expense" : "Add Expense"}
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-gray-400 text-sm">
            Track your operational costs
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-300">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {categories.map((cat) => (
                  <SelectItem
                    key={cat.value}
                    value={cat.value}
                    className="text-gray-300 hover:bg-gray-700 focus:bg-gray-700"
                  >
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-300">Amount (₹)</Label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0.00"
              className="bg-gray-800 border-gray-700 text-white"
              required
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-300">Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the expense"
              className="bg-gray-800 border-gray-700 text-white min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-300">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-gray-800 border-gray-700 hover:bg-gray-700",
                    !date && "text-gray-400"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                  className="bg-gray-800 text-white"
                />
              </PopoverContent>
            </Popover>
          </div>

         

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.amount}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : expense ? (
                "Update Expense"
              ) : (
                "Add Expense"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}