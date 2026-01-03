"use client"

import { HashLoader } from 'react-spinners'
import { useState, useEffect, useMemo, useCallback } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ComposedChart, Legend, Line, Area
} from "recharts"

import {
  Target, Eye, EyeOff,
  CheckCircle, DollarSign, Users, Plus, Calendar, Edit, Download,
  Trash2, MoreVertical, CreditCard, RefreshCw, Server, Megaphone, Wrench, Circle, Code,
  Wallet, ChevronRight, TrendingUp, TrendingDown, Zap, Clock, AlertCircle,
  BarChart3, PieChart as PieChartIcon, LineChart, Filter, Search, ArrowUpRight, ArrowDownRight,
  BikeIcon
} from "lucide-react"
import Header from '@/components/Header'
import ExpenseModal from '@/components/ExpenseModal'
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { handleExport } from '@/lib/helper'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import SQLExportButton from '@/components/SQLExportButton'

// Types
interface User { id: string; email: string; full_name?: string }
interface Project {
  id: string; title: string; leader: string; priority: string; status: string; progress: number;
  finalized_amount: number; amount_received: number; estimated_hours: number; actual_hours: number;
  updated_at: string; deadline: string; description?: string; contact?: string;
  booking_date?: string; tech_stack: string[]; tags: string[];
}
interface Expense {
  id: string; project_id?: string; category: string; amount: number; description?: string; date: string;
}
interface Installment {
  id: string; project_id: string; amount: number; due_date: string; paid_date?: string; status: string;
  description?: string;
}

// Red Hood Theme Config
const REDHOOD_THEME = {
  colors: {
    red: { bg: 'bg-red-600/10', text: 'text-red-400', solid: '#ef4444', border: 'border-red-600/30', gradient: 'from-red-600/20 to-red-900/10' },
    orange: { bg: 'bg-orange-600/10', text: 'text-orange-400', solid: '#f97316', border: 'border-orange-600/30', gradient: 'from-orange-600/20 to-orange-900/10' },
    emerald: { bg: 'bg-emerald-600/10', text: 'text-emerald-400', solid: '#10b981', border: 'border-emerald-600/30', gradient: 'from-emerald-600/20 to-emerald-900/10' },
    amber: { bg: 'bg-amber-600/10', text: 'text-amber-400', solid: '#f59e0b', border: 'border-amber-600/30', gradient: 'from-amber-600/20 to-amber-900/10' },
    purple: { bg: 'bg-purple-600/10', text: 'text-purple-400', solid: '#8b5cf6', border: 'border-purple-600/30', gradient: 'from-purple-600/20 to-purple-900/10' },
    gray: { bg: 'bg-gray-900/50', text: 'text-gray-400', solid: '#6b7280', border: 'border-gray-800', gradient: 'from-gray-800/50 to-gray-900/30' },
    indigo: { bg: 'bg-indigo-600/10', text: 'text-indigo-400', solid: '#6366f1', border: 'border-indigo-600/30', gradient: 'from-indigo-600/20 to-indigo-900/10' },
    blue: { bg: 'bg-blue-600/10', text: 'text-blue-400', solid: '#3b82f6', border: 'border-blue-600/30', gradient: 'from-blue-600/20 to-blue-900/10' },
    pink: { bg: 'bg-pink-600/10', text: 'text-pink-400', solid: '#ec4899', border: 'border-pink-600/30', gradient: 'from-pink-600/20 to-pink-900/10' },
    cyan: { bg: 'bg-cyan-600/10', text: 'text-cyan-400', solid: '#06b6d4', border: 'border-cyan-600/30', gradient: 'from-cyan-600/20 to-cyan-900/10' }
  },
  status: {
    enquiry: { bg: "bg-orange-600/10", text: "text-orange-400", solid: "#f97316", label: "Enquiry", border: "border-orange-600/30" },
    advance: { bg: "bg-blue-600/10", text: "text-blue-400", solid: "#3b82f6", label: "Advance", border: "border-blue-600/30" },
    delivered: { bg: "bg-emerald-600/10", text: "text-emerald-400", solid: "#10b981", label: "Delivered", border: "border-emerald-600/30" },
    archived: { bg: "bg-gray-900/50", text: "text-gray-400", solid: "#6b7280", label: "Archived", border: "border-gray-800" }
  },
  priority: {
    critical: { bg: "bg-red-600/10", text: "text-red-500", solid: "#ef4444", label: "Critical", border: "border-red-600/30" },
    high: { bg: "bg-orange-600/10", text: "text-orange-500", solid: "#f97316", label: "High", border: "border-orange-600/30" },
    medium: { bg: "bg-amber-600/10", text: "text-amber-500", solid: "#f59e0b", label: "Medium", border: "border-amber-600/30" },
    low: { bg: "bg-emerald-600/10", text: "text-emerald-500", solid: "#10b981", label: "Low", border: "border-emerald-600/30" }
  }
}

// Helper Functions
const getColorConfig = (key: keyof typeof REDHOOD_THEME.colors) => REDHOOD_THEME.colors[key] || REDHOOD_THEME.colors.gray
const getStatusConfig = (status: string) => REDHOOD_THEME.status[status as keyof typeof REDHOOD_THEME.status] || REDHOOD_THEME.status.enquiry
const getPriorityConfig = (priority: string) => REDHOOD_THEME.priority[priority as keyof typeof REDHOOD_THEME.priority] || REDHOOD_THEME.priority.medium

const formatCurrency = (amount: number, revenueLocked: boolean = false) => {
  return revenueLocked ? "#####" : `₹${amount.toLocaleString("en-IN")}`
}

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 p-4">
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-purple-600/20 blur-2xl rounded-full animate-pulse" />
      <HashLoader color="#ef4444" size={60} />
    </div>
  </div>
)

// Enhanced Stat Card Component
interface StatCardProps {
  icon: React.ComponentType<any>;
  label: string;
  value: string | number;
  subtext?: string;
  loading?: boolean;
  color?: keyof typeof REDHOOD_THEME.colors;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatCard = ({
  icon: Icon,
  label,
  value,
  subtext,
  loading = false,
  color = "gray",
  onClick,
  size = 'md',
  className = ''
}: StatCardProps) => {
  const colorConfig = getColorConfig(color)

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-4 sm:p-5'
  }

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl border transition-all duration-200",
        "bg-gradient-to-br from-gray-950/90 via-gray-950/50 to-gray-950/30 backdrop-blur-sm",
        "border-gray-800 hover:border-gray-700",
        "active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-red-600/50",
        onClick && "cursor-pointer",
        sizeClasses[size],
        className
      )}
    >
      {/* Subtle accent glow (not hover-only) */}
      <div
        className={cn(
          "absolute inset-0 opacity-10",
          colorConfig.gradient
        )}
      />

      {/* Shimmer — desktop hover only */}
      <div className="absolute -inset-1 hidden sm:block bg-gradient-to-r from-transparent via-white/5 to-transparent 
                      -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

      <div className="relative z-10 h-full flex flex-col gap-2">

        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-gray-400 text-[11px] sm:text-xs font-medium truncate">
              {label}
            </p>

            <p
              className={cn(
                "font-bold leading-tight truncate",
                colorConfig.text,
                size === 'lg'
                  ? 'text-xl sm:text-2xl lg:text-3xl'
                  : 'text-lg sm:text-xl',
                loading && 'animate-pulse bg-gray-800 rounded'
              )}
            >
              {loading ? '—' : value}
            </p>

            {subtext && (
              <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                {subtext}
              </p>
            )}
          </div>

          {/* Icon */}
          <div
            className={cn(
              "shrink-0 rounded-xl border p-2 sm:p-2.5",
              colorConfig.bg,
              colorConfig.border
            )}
          >
            <Icon className={cn(colorConfig.text, "w-4 h-4 sm:w-5 sm:h-5")} />
          </div>
        </div>


      </div>
    </div>
  )
}


// Project Card Component
const ProjectCard = ({
  project,
  revenueLocked
}: {
  project: Project
  revenueLocked?: boolean
}) => {
  const priorityConfig = getPriorityConfig(project.priority)
  const remainingAmount = project.finalized_amount - project.amount_received

  return (
    <Link href={`/projects/${project.id}`} className="block h-full">
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border",
          "bg-gradient-to-br from-gray-950/80 to-gray-950/40 backdrop-blur-sm",
          "border-gray-800 hover:border-gray-700",
          "transition-all duration-200",
          "active:scale-[0.97]",
          "min-h-[170px] flex flex-col"
        )}
      >
        {/* subtle accent (always present, not hover-only) */}
        <div className={cn(
          "absolute inset-0 opacity-10",
          priorityConfig.bg
        )} />

        <div className="relative z-10 p-4 flex flex-col h-full">

          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-white truncate">
                {project.title}
              </h3>
              <p className="text-[11px] text-gray-400 truncate mt-0.5">
                {project.leader}
              </p>
            </div>

            <Badge
              className={cn(
                priorityConfig.bg,
                priorityConfig.text,
                priorityConfig.border,
                "px-2 py-0.5 text-[11px] font-medium"
              )}
            >
              {priorityConfig.label}
            </Badge>
          </div>

          {/* Progress */}
          <div className="mb-3">
            <div className="flex justify-between text-[11px] text-gray-500 mb-1">
              <span>Progress</span>
              <span className="font-medium">{project.progress || 0}%</span>
            </div>

            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  project.progress >= 100
                    ? "bg-emerald-500"
                    : project.progress >= 70
                      ? "bg-amber-500"
                      : "bg-red-500"
                )}
                style={{ width: `${project.progress || 0}%` }}
              />
            </div>
          </div>

          {/* Financials */}
          <div className="mt-auto pt-3 border-t border-gray-800 flex justify-between gap-4">
            <div>
              <p className="text-[11px] text-gray-500">Received</p>
              <p
                className={cn(
                  "text-sm font-semibold",
                  project.amount_received >= project.finalized_amount
                    ? "text-emerald-400"
                    : "text-amber-400"
                )}
              >
                {formatCurrency(project.amount_received, revenueLocked)}
              </p>
            </div>

            {remainingAmount > 0 && (
              <div className="text-right">
                <p className="text-[11px] text-gray-500">Pending</p>
                <p className="text-sm font-semibold text-red-400">
                  {formatCurrency(remainingAmount, revenueLocked)}
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </Link>
  )
}


// Expense Item Component
const ExpenseItem = ({
  expense,
  onEdit,
  onDelete
}: {
  expense: Expense
  onEdit: () => void
  onDelete: () => void
}) => {
  const categoryConfigs = {
    development: { bg: "bg-blue-600/10", text: "text-blue-400", border: "border-blue-600/30", icon: Code },
    hosting: { bg: "bg-purple-600/10", text: "text-purple-400", border: "border-purple-600/30", icon: Server },
    marketing: { bg: "bg-pink-600/10", text: "text-pink-400", border: "border-pink-600/30", icon: Megaphone },
    tools: { bg: "bg-amber-600/10", text: "text-amber-400", border: "border-amber-600/30", icon: Wrench },
    salary: { bg: "bg-emerald-600/10", text: "text-emerald-400", border: "border-emerald-600/30", icon: Users },
    bike: { bg: "bg-cyan-600/10", text: "text-cyan-400", border: "border-cyan-600/30", icon: BikeIcon },
    other: { bg: "bg-gray-900/50", text: "text-gray-400", border: "border-gray-800", icon: Circle }
  }

  const config =
    categoryConfigs[expense.category as keyof typeof categoryConfigs] ||
    categoryConfigs.other

  const Icon = config.icon

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border",
        "bg-gradient-to-br from-gray-950/80 to-gray-950/40 backdrop-blur-sm",
        "border-gray-800 hover:border-gray-700",
        "transition-all duration-200",
        "active:scale-[0.98]"
      )}
    >
      {/* subtle accent — always present */}
      <div className={cn("absolute inset-0 opacity-10", config.bg)} />

      <div className="relative z-10 p-3 flex items-center gap-3">

        {/* Icon */}
        <div
          className={cn(
            "shrink-0 rounded-lg border p-2",
            config.bg,
            config.border
          )}
        >
          <Icon className={cn("w-4 h-4", config.text)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-white truncate">
              {expense.description || expense.category}
            </p>

            <p className="text-sm font-semibold text-red-400 whitespace-nowrap">
              −₹{expense.amount.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="flex items-center justify-between mt-0.5">
            <p className="text-[11px] text-gray-500 capitalize truncate">
              {expense.category}
            </p>

            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <Calendar className="w-3 h-3" />
              {new Date(expense.date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short"
              })}
            </div>
          </div>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="shrink-0 rounded-lg p-1.5 text-gray-500 
                         hover:text-white hover:bg-gray-800 
                         transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="bg-gray-900 border border-gray-800 backdrop-blur-sm"
          >
            <DropdownMenuItem
              onClick={onEdit}
              className="text-gray-300 hover:bg-gray-800 cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5 mr-2" />
              Edit
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onDelete}
              className="text-red-400 hover:bg-gray-800 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

// Main Dashboard Component
export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [installments, setInstallments] = useState<Installment[]>([])
  const [loading, setLoading] = useState(true)
  const [revenueLocked, setRevenueLocked] = useState(true)
  const [securityAttempts, setSecurityAttempts] = useState(0)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  // Check mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Data fetching
  useEffect(() => {
    const init = async () => {
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) redirect("/auth/login")

      setUser(user as User)

      const [projectsRes, expensesRes, installmentsRes] = await Promise.all([
        supabase.from("bludhaven_projects").select("*").eq('user_id', user.id).order("updated_at", { ascending: false }),
        supabase.from("bludhaven_expenses").select("*").eq('user_id', user.id).order("date", { ascending: false }),
        supabase.from("bludhaven_installments").select("*").eq('user_id', user.id).order("due_date", { ascending: true })
      ])

      setProjects(projectsRes.data || [])
      setExpenses(expensesRes.data || [])
      setInstallments(installmentsRes.data || [])
      setLoading(false)

      // Real-time subscriptions
      const projectsChannel = supabase.channel('projects-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bludhaven_projects', filter: `user_id=eq.${user.id}` },
          async () => {
            const { data } = await supabase.from("bludhaven_projects").select("*").eq('user_id', user.id)
            setProjects(data || [])
          })
        .subscribe()

      const expensesChannel = supabase.channel('expenses-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bludhaven_expenses', filter: `user_id=eq.${user.id}` },
          async () => {
            const { data } = await supabase.from("bludhaven_expenses").select("*").eq('user_id', user.id)
            setExpenses(data || [])
          })
        .subscribe()

      return () => {
        supabase.removeChannel(projectsChannel)
        supabase.removeChannel(expensesChannel)
      }
    }

    init()
  }, [])

  // Analytics calculations
  const analytics = useMemo(() => {
    const activeProjects = projects.filter(p => !['archived', 'delivered'].includes(p.status))
    const completedProjects = projects.filter(p => p.status === 'delivered')

    const totalRevenue = projects.reduce((sum, p) => sum + (p.finalized_amount || 0), 0)
    const totalCollected = projects.reduce((sum, p) => sum + (p.amount_received || 0), 0)
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const netProfit = totalCollected - totalExpenses
    const profitMargin = totalCollected > 0 ? (netProfit / totalCollected) * 100 : 0
    const pendingRevenue = totalRevenue - totalCollected
    const collectionRate = totalRevenue > 0 ? (totalCollected / totalRevenue) * 100 : 0

    const pendingInstallments = installments.filter(i => i.status === 'pending')
    const overdueInstallments = pendingInstallments.filter(i =>
      i.due_date && new Date(i.due_date) < new Date()
    )
    const totalPendingAmount = pendingInstallments.reduce((sum, i) => sum + i.amount, 0)

    // Mock change percentages
    const revenueChange = 12.5
    const profitChange = 8.3
    const expensesChange = -4.2
    const projectsChange = 5.7

    return {
      totalRevenue,
      totalCollected,
      totalExpenses,
      netProfit,
      profitMargin,
      pendingRevenue,
      collectionRate,
      totalProjects: projects.length,
      activeProjects: activeProjects.length,
      completedProjects: completedProjects.length,
      projectCompletionRate: projects.length > 0 ? (completedProjects.length / projects.length) * 100 : 0,
      pendingInstallments: pendingInstallments.length,
      overdueInstallments: overdueInstallments.length,
      totalPendingAmount,
      revenueChange,
      profitChange,
      expensesChange,
      projectsChange,
    }
  }, [projects, expenses, installments])

  // Chart data
  const chartData = useMemo(() => {
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push(date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }))
    }

    const monthlyData = months.map(month => {
      const [monthStr, yearStr] = month.split(' ')

      // Revenue from PAID installments in this month
      const monthInstallments = installments.filter(i => {
        if (!i.paid_date || i.status !== 'paid') return false

        const paidDate = new Date(i.paid_date)
        const paidMonth = paidDate.toLocaleDateString('en-US', { month: 'short' })
        const paidYear = paidDate.getFullYear().toString().slice(-2)

        return paidMonth === monthStr && paidYear === yearStr
      })

      const monthRevenue = monthInstallments.reduce((sum, i) => sum + (i.amount || 0), 0)

      // Expenses in this month
      const monthExpenses = expenses
        .filter(e => {
          const date = new Date(e.date)
          const expenseMonth = date.toLocaleDateString('en-US', { month: 'short' })
          const expenseYear = date.getFullYear().toString().slice(-2)
          return expenseYear === yearStr && expenseMonth === monthStr
        })
        .reduce((sum, e) => sum + e.amount, 0)

      return {
        month,
        revenue: monthRevenue,
        expenses: -monthExpenses,
        netProfit: monthRevenue - monthExpenses,
        installmentsCount: monthInstallments.length
      }
    })

    const statusData = Object.entries(REDHOOD_THEME.status).map(([key, config]) => ({
      name: config.label,
      value: projects.filter(p => p.status === key).length,
      color: config.solid,
    })).filter(item => item.value > 0)

    const topProjects = [...projects]
      .map(p => ({
        ...p,
        installmentAmount: installments
          .filter(i => i.project_id === p.id && i.status === 'paid')
          .reduce((sum, i) => sum + (i.amount || 0), 0)
      }))
      .sort((a, b) => b.installmentAmount - a.installmentAmount)
      .slice(0, 5)
      .map(p => ({
        name: p.title.length > 12 ? p.title.substring(0, 12) + '...' : p.title,
        value: p.installmentAmount,
        leader: p.leader
      }))

    return {
      monthlyRevenue: monthlyData,
      statusDistribution: statusData,
      topProjects,
    }
  }, [projects, expenses])


  // Helper functions
  const toggleRevenueSecurity = useCallback(() => {
    if (revenueLocked) {
      const pass = prompt("Enter security code to access revenue data:")
      if (pass === process.env.NEXT_PUBLIC_SECRET_PASSWORD) {
        setRevenueLocked(false)
        setSecurityAttempts(0)
      } else {
        const newAttempts = securityAttempts + 1
        setSecurityAttempts(newAttempts)
        alert(`Access denied. ${3 - newAttempts} attempts remaining.`)
        if (newAttempts >= 3) setTimeout(() => setSecurityAttempts(0), 30000)
      }
    } else {
      setRevenueLocked(true)
    }
  }, [revenueLocked, securityAttempts])

  const handleExpenseAction = (expense?: Expense) => {
    setSelectedExpense(expense || null)
    setShowExpenseModal(true)
  }

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return

    const supabase = getSupabaseClient()
    const { error } = await supabase.from("bludhaven_expenses").delete().eq("id", expenseId)

    if (error) {
      alert("Failed to delete expense")
      console.error(error)
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: expensesData } = await supabase
          .from("bludhaven_expenses")
          .select("*")
          .eq('user_id', user.id)
          .order("date", { ascending: false })
        setExpenses(expensesData || [])
      }
    }
  }

  if (loading) return <LoadingSpinner />
  if (!user) return null

  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  const activeProjects = projects
    .filter(p => !['archived', 'delivered'].includes(p.status))
    .sort((a, b) => priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder])
    .slice(0, isMobile ? 3 : 6)

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Header />

      <main className="px-4 py-6 md:px-6 lg:px-8 max-w-7xl mx-auto ">
        {/* Header Section */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center mb-4 lg:justify-between">

          {/* Left: Title */}
          <div className="flex items-start gap-3">
            <div className="w-1.5 h-10 bg-gradient-to-b from-red-500 to-red-600 rounded-full mt-1" />

            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold 
                     bg-gradient-to-r from-white via-gray-200 to-gray-400 
                     bg-clip-text text-transparent leading-tight">
                Mission Control
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm">
                Welcome back, {user?.full_name || user?.email?.split('@')[0]}
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 justify-between sm:justify-end">

            {/* Secondary actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleRevenueSecurity}
                className="bg-gray-900/60 border-gray-700 hover:bg-gray-800 
                   hover:border-red-600/50 h-10 w-10"
              >
                {revenueLocked
                  ? <Eye className="w-4 h-4" />
                  : <EyeOff className="w-4 h-4" />
                }
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => window.location.reload()}
                className="bg-gray-900/60 border-gray-700 hover:bg-gray-800 
                   hover:border-red-600/50 h-10 w-10"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <SQLExportButton
                userId={user.id}
                size={isMobile ? "icon" : "default"}
                className="h-10"
              />

            </div>



            {/* Primary CTA */}
            <Button
              variant="default"
              className="bg-gradient-to-r from-red-600 to-red-700 
                 hover:from-red-700 hover:to-red-800 text-white 
                 group relative overflow-hidden h-10 px-4 sm:px-5"
              onClick={() => handleExpenseAction()}
            >
              <div className="absolute inset-0 bg-gradient-to-r 
                      from-transparent via-white/10 to-transparent 
                      -skew-x-12 translate-x-[-100%] 
                      group-hover:translate-x-[100%] 
                      transition-transform duration-1000" />

              <Plus className="w-4 h-4 relative z-10 sm:mr-2" />
              <span className="relative z-10 hidden sm:inline">
                Add Expense
              </span>
            </Button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <StatCard
            icon={Target}
            label="Active Missions"
            value={analytics.activeProjects}
            subtext={`${analytics.totalProjects} total`}
            color="red"
            size="lg"
            onClick={() => window.location.href = '/projects'}
          />
          <StatCard
            icon={DollarSign}
            label="Total Revenue"
            value={formatCurrency(analytics.totalRevenue, revenueLocked)}
            subtext={formatCurrency(analytics.pendingRevenue, revenueLocked) + ' pending'}
            color="emerald"
            size="lg"
          />
          <StatCard
            icon={Wallet}
            label="Net Profit"
            value={formatCurrency(analytics.netProfit, revenueLocked)}
            subtext={`${formatCurrency(analytics.totalCollected, revenueLocked)} collected`}
            color={analytics.netProfit >= 0 ? "emerald" : "red"}
            size="lg"
          />
          <StatCard
            icon={CreditCard}
            label="Pending Amount"
            value={formatCurrency(analytics.totalPendingAmount, revenueLocked)}
            subtext={`${analytics.pendingInstallments} installments`}
            color="amber"
            size="lg"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:auto-rows-[minmax(400px,1fr)] mb-4">
          {/* Financial Chart */}
          <div
            className="relative overflow-hidden rounded-2xl border border-gray-800 
             bg-gradient-to-br from-gray-950/80 to-gray-950/40 backdrop-blur-sm
             flex flex-col"
          >
            {/* Header */}
            <div className="p-5 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-300">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg 
                   bg-gray-800/60 border border-gray-700/60"
                >
                  <LineChart className="w-4 h-4 text-gray-400" />
                </span>

                <div>
                  <h3 className="text-sm font-medium tracking-wide uppercase">
                    Financial Intel
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Revenue · Expenses · Net Profit
                  </p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white px-2"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="bg-gray-900 border border-gray-800"
                >
                  <DropdownMenuItem onClick={() => handleExport("html")}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Chart
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Chart — fills remaining space */}
            <div className="min-h-[220px] sm:min-h-[260px] lg:flex-1 px-5 pb-5">

              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData.monthlyRevenue}
                  margin={{ top: 20, right: 10, left: 0, bottom: 10 }}
                >
                  {/* Grid */}
                  <CartesianGrid
                    stroke="#374151"
                    strokeDasharray="3 6"
                    opacity={0.15}
                  />

                  {/* X Axis */}
                  <XAxis
                    dataKey="month"
                    stroke="#9ca3af"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#9CA3AF", fontWeight: 500 }}
                  />

                  {/* Y Axis */}
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                    width={42}
                    tick={{ fill: "#9CA3AF" }}
                  />

                  {/* Tooltip */}
                  <Tooltip
                    cursor={{
                      fill: "rgba(139,92,246,0.06)",
                      radius: 8,
                    }}
                    contentStyle={{
                      background: "rgba(17,24,39,0.75)",
                      border: "1px solid rgba(139,92,246,0.35)",
                      borderRadius: "14px",
                      backdropFilter: "blur(14px)",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.45)",
                      fontSize: "12px",
                      color: "#E5E7EB",
                    }}
                    formatter={(value: number, name: string) => [
                      `₹${value.toLocaleString("en-IN")}`,
                      name,
                    ]}
                  />

                  {/* Legend */}
                  <Legend
                    verticalAlign="top"
                    height={28}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{
                      fontSize: "11px",
                      color: "#9CA3AF",
                      letterSpacing: "0.02em",
                    }}
                  />

                  {/* Revenue Bar */}
                  <Bar
                    dataKey="revenue"
                    name="Revenue"
                    fill="url(#revenueGradient)"
                    radius={[6, 6, 0, 0]}
                    barSize={14}
                  />

                  {/* Expenses Bar */}
                  <Bar
                    dataKey="expenses"
                    name="Expenses"
                    fill="url(#expenseGradient)"
                    radius={[6, 6, 0, 0]}
                    barSize={14}
                  />

                  {/* Net Profit Area */}
                  <Area
                    type="monotone"
                    dataKey="netProfit"
                    name="Net Profit"
                    stroke="url(#profitStroke)"
                    strokeWidth={2.5}
                    fill="url(#profitGradient)"
                    dot={{
                      r: 3.5,
                      strokeWidth: 2,
                      fill: "#111827",
                      stroke: "#8b5cf6",
                    }}
                    activeDot={{
                      r: 6,
                      strokeWidth: 2,
                      fill: "#8b5cf6",
                      stroke: "#111827",
                    }}
                  />

                  {/* Gradients & Effects */}
                  <defs>
                    {/* Revenue */}
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.25} />
                    </linearGradient>

                    {/* Expenses */}
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fb7185" stopOpacity={0.85} />
                      <stop offset="100%" stopColor="#f87171" stopOpacity={0.25} />
                    </linearGradient>

                    {/* Profit Area */}
                    <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.05} />
                    </linearGradient>

                    {/* Profit Stroke */}
                    <linearGradient id="profitStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#a78bfa" />
                      <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                  </defs>
                </ComposedChart>

              </ResponsiveContainer>
            </div>
          </div>


          {/* Status Distribution */}
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2">

            <div className="relative overflow-hidden rounded-2xl border border-gray-800 
                bg-gradient-to-br from-gray-950/80 to-gray-950/40 backdrop-blur-sm
                flex flex-col ">

              {/* Header */}
              <div className="p-5 pb-2 flex items-center gap-2 text-gray-300">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg 
                     bg-gray-800/60 border border-gray-700/60">
                  <PieChartIcon className="w-4 h-4 text-gray-400" />
                </span>
                <h3 className="text-sm font-medium tracking-wide uppercase">
                  Mission Status
                </h3>
              </div>

              {/* Chart fills remaining space */}
              <div className="min-h-[220px] sm:min-h-[260px] lg:flex-1 px-5 pb-5">

                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={108}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="rgba(0,0,0,0.35)"
                    >
                      {chartData.statusDistribution.map((e, i) => (
                        <Cell key={i} fill={e.color} />
                      ))}
                    </Pie>

                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={10}
                      formatter={(value: string) => {
                        const item = chartData.statusDistribution.find(d => d.name === value)
                        return (
                          <span className="text-xs text-gray-300">
                            {value} ({item?.value ?? 0})
                          </span>
                        )
                      }}
                    />

                    <Tooltip
                      cursor={{
                        fill: "rgba(139,92,246,0.06)",
                        radius: 8,
                      }}
                      contentStyle={{
                        background: "rgba(17,24,39,0.75)",
                        border: "1px solid rgba(139,92,246,0.35)",
                        borderRadius: "14px",
                        backdropFilter: "blur(14px)",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.45)",
                        fontSize: "12px",
                        color: "#E5E7EB",
                      }}
                      formatter={(value, name) => [`${value} missions`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Top Projects */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-800 
                bg-gradient-to-br from-gray-950/80 to-gray-950/40 backdrop-blur-sm
                flex flex-col ">
              {/* Header */}
              <div className="p-5 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-300">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg 
                       bg-gray-800/60 border border-gray-700/60">
                    <BarChart3 className="w-4 h-4 text-gray-400" />
                  </span>
                  <h3 className="text-sm font-medium tracking-wide uppercase">
                    Top Missions
                  </h3>
                </div>
                <Link href="/projects">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[11px] text-gray-400 hover:text-white px-2"
                  >
                    View all <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
              {/* Chart fills remaining space */}
              <div className="min-h-[220px] sm:min-h-[260px] lg:flex-1 px-5 pb-5">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.topProjects} layout="vertical">
                    <CartesianGrid
                      stroke="#374151"
                      strokeDasharray="2 4"
                      opacity={0.2}
                      horizontal={false}
                    />
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#9ca3af"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      width={80}
                    />
                    <Tooltip
                      cursor={{
                        fill: "rgba(139,92,246,0.06)",
                        radius: 8,
                      }}
                      contentStyle={{
                        background: "rgba(17,24,39,0.75)",
                        border: "1px solid rgba(139,92,246,0.35)",
                        borderRadius: "14px",
                        backdropFilter: "blur(14px)",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.45)",
                        fontSize: "12px",
                        color: "#E5E7EB",
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="url(#barGradient)"
                      radius={[0, 4, 4, 0]}
                      maxBarSize={22}
                    />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">

          {/* Active Missions */}
          <div className="relative overflow-hidden rounded-2xl border border-gray-800 
  bg-gradient-to-br from-gray-950/80 to-gray-950/40 backdrop-blur-sm
  flex flex-col">

            {/* Header */}
            <div className="p-5 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-300">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg 
        bg-gray-800/60 border border-gray-700/60">
                  <Target className="w-4 h-4 text-gray-400" />
                </span>

                <div>
                  <h3 className="text-sm font-medium tracking-wide uppercase">
                    Active Missions
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Priority missions requiring attention
                  </p>
                </div>
              </div>

              <Link href="/projects">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[11px] text-gray-400 hover:text-white px-2"
                >
                  View all <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>

            {/* Content */}
            <div className="min-h-[200px] lg:flex-1 p-5 pt-3">
              {activeProjects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeProjects.map(project => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      revenueLocked={revenueLocked}
                    />
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <Target className="w-10 h-10 mb-2 opacity-40" />
                  <p className="text-sm">No active missions</p>
                </div>
              )}
            </div>
          </div>


          {/* Recent Expenses */}
          <div className="relative overflow-hidden rounded-2xl border border-gray-800 
  bg-gradient-to-br from-gray-950/80 to-gray-950/40 backdrop-blur-sm
  flex flex-col">

            {/* Header */}
            <div className="p-5 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-300">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg 
        bg-gray-800/60 border border-gray-700/60">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                </span>

                <div>
                  <h3 className="text-sm font-medium tracking-wide uppercase">
                    Recent Expenses
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Latest operational costs
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleExpenseAction()}
                className="text-[11px] text-gray-400 hover:text-white px-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Add</span>
              </Button>
            </div>

            {/* List */}
            <div className="min-h-[200px] lg:flex-1 p-5 pt-3 overflow-y-auto">
              {expenses.length > 0 ? (
                <div className="space-y-3">
                  {expenses.slice(0, 5).map(expense => (
                    <ExpenseItem
                      key={expense.id}
                      expense={expense}
                      onEdit={() => handleExpenseAction(expense)}
                      onDelete={() => handleDeleteExpense(expense.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <CreditCard className="w-10 h-10 mb-2 opacity-40" />
                  <p className="text-sm">No expenses recorded</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Clock}
            label="Overdue"
            value={analytics.overdueInstallments}
            subtext="installments"
            color="red"
            size="sm"
          />
          <StatCard
            icon={CheckCircle}
            label="Completion Rate"
            value={`${analytics.projectCompletionRate.toFixed(1)}%`}
            subtext={`${analytics.completedProjects} completed`}
            color="emerald"
            size="sm"
          />
          <StatCard
            icon={Zap}
            label="Expenses"
            value={formatCurrency(analytics.totalExpenses, revenueLocked)}
            subtext="Total operational cost"
            color="amber"
            size="sm"
          />
          <StatCard
            icon={AlertCircle}
            label="Profit Margin"
            value={`${analytics.profitMargin.toFixed(1)}%`}
            subtext="Net profit percentage"
            color={analytics.profitMargin >= 0 ? "emerald" : "red"}
            size="sm"
          />
        </div>
      </main>

      {/* Mobile FAB */}
      {isMobile && (
        <Button
          size="icon"
          className="fixed bottom-6 right-6 z-40 rounded-full w-14 h-14 shadow-2xl shadow-red-900/50"
          onClick={() => handleExpenseAction()}
        >
          <Plus className="w-6 h-6" />
        </Button>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <ExpenseModal
          expense={selectedExpense}
          onClose={() => {
            setShowExpenseModal(false)
            setSelectedExpense(null)
          }}
          onSuccess={async () => {
            setShowExpenseModal(false)
            setSelectedExpense(null)

            const supabase = getSupabaseClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
              const { data: expensesData } = await supabase
                .from("bludhaven_expenses")
                .select("*")
                .eq('user_id', user.id)
                .order("date", { ascending: false })
              setExpenses(expensesData || [])

              const { data: projectsData } = await supabase
                .from("bludhaven_projects")
                .select("*")
                .eq('user_id', user.id)
                .order("updated_at", { ascending: false })
              setProjects(projectsData || [])
            }
          }}
        />
      )}
    </div>
  )
}