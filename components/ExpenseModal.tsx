// components/ExpenseModal.tsx - Fixed version
"use client"

import { useState, useEffect } from "react"
import { X, Save, Trash2, Target, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSupabaseClient } from "@/lib/supabase/client"

interface Expense {
  id?: string
  project_id?: string | null
  category: string
  amount: number
  description?: string
  date: string
}

interface Project {
  id: string
  title: string
}

interface ExpenseModalProps {
  expense?: Expense | null
  projects: Project[]
  onClose: () => void
  onSuccess: () => void
}

export function ExpenseModal({ expense, projects, onClose, onSuccess }: ExpenseModalProps) {
  const [formData, setFormData] = useState<Expense>({
    project_id: null,
    category: "",
    amount: 0,
    description: "",
    date: new Date().toISOString().split("T")[0]
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (expense) {
      setFormData({
        ...expense,
        date: expense.date.split("T")[0]
      })
    }
  }, [expense])

  const handleSubmit = async () => {
    if (!formData.category || !formData.amount || !formData.date) {
      alert("Please fill in all required fields")
      return
    }

    setLoading(true)
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert("User not authenticated")
      setLoading(false)
      return
    }

    try {
      const expenseData = {
        ...formData,
        user_id: user.id,
        amount: parseFloat(formData.amount.toString()),
        project_id: formData.project_id
      }

      if (expense?.id) {
        const { error } = await supabase
          .from("bludhaven_expenses")
          .update(expenseData)
          .eq("id", expense.id)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from("bludhaven_expenses")
          .insert([expenseData])
        
        if (error) throw error
      }

      onSuccess()
    } catch (error) {
      console.error("Error saving expense:", error)
      alert("Failed to save expense")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!expense?.id || !confirm("Are you sure you want to delete this expense?")) return

    setLoading(true)
    const supabase = getSupabaseClient()

    try {
      const { error } = await supabase
        .from("bludhaven_expenses")
        .delete()
        .eq("id", expense.id)
      
      if (error) throw error
      onSuccess()
    } catch (error) {
      console.error("Error deleting expense:", error)
      alert("Failed to delete expense")
    } finally {
      setLoading(false)
    }
  }

  const expenseCategories = [
    { value: "development", label: "Development" },
    { value: "hosting", label: "Hosting" },
    { value: "marketing", label: "Marketing" },
    { value: "tools", label: "Tools" },
    { value: "salary", label: "Salary" },
    { value: "learning", label: "Learning" },
    { value: "other", label: "Other" }
  ]

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-950 border-2 border-red-900/50 rounded-xl w-full max-w-md shadow-2xl shadow-red-950/30">
        <div className="flex items-center justify-between p-6 border-b border-red-900/50 bg-gradient-to-r from-red-950/20 to-black">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-900/30 rounded-lg border border-red-800/50">
              <Target className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              {expense ? "Edit Mission Expense" : "New Expense Log"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-red-900/30 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="category" className="text-gray-300 font-medium">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              required
            >
              <SelectTrigger className="bg-gray-900 border-2 border-red-900/50 hover:border-red-700 focus:border-red-600">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-2 border-red-900/50">
                {expenseCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value} className="hover:bg-red-900/30 focus:bg-red-900/50">
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project" className="text-gray-300 font-medium">Project (Optional)</Label>
            <Select
              value={formData.project_id || "general"}
              onValueChange={(value) => setFormData({ 
                ...formData, 
                project_id: value === "general" ? null : value 
              })}
            >
              <SelectTrigger className="bg-gray-900 border-2 border-red-900/50 hover:border-red-700">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-2 border-red-900/50 max-h-60">
                <SelectItem value="general" className="hover:bg-red-900/30">General Expense</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id} className="hover:bg-red-900/30">
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-gray-300 font-medium">Amount (₹) *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="bg-gray-900 border-2 border-red-900/50 hover:border-red-700 focus:border-red-600"
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-gray-300 font-medium">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="bg-gray-900 border-2 border-red-900/50 hover:border-red-700 focus:border-red-600"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300 font-medium">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-gray-900 border-2 border-red-900/50 hover:border-red-700 focus:border-red-600 min-h-[100px]"
              placeholder="Add details about this expense..."
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-red-900/50 bg-gradient-to-r from-black to-red-950/20">
          <div>
            {expense && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
                className="bg-red-900/20 hover:bg-red-900/40 text-red-400 border-2 border-red-800/50 hover:border-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Log
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-2 border-red-900/50 hover:bg-red-900/30 text-red-300 hover:text-red-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gradient-to-r from-red-700 to-orange-700 hover:from-red-600 hover:to-orange-600 text-white shadow-lg shadow-red-950/50"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Securing..." : expense ? "Update Log" : "Save Log"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}