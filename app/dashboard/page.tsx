"use client"

import { HashLoader } from 'react-spinners'
import { useState, useEffect, useMemo } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from "recharts"
import {
  TrendingUp, Users, CheckCircle, Clock, DollarSign, ArrowRight,
  Activity, Target, AlertTriangle, Plus, Calendar, Edit, Folder,
  Download, Eye, EyeOff, Trash2, MoreVertical,
  CreditCard, RefreshCw, AlertCircle,
  Info, Server, Megaphone, Wrench, Circle, Code, Receipt, BarChart3,
  TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon,
  MessageSquare, Cpu, FileText,
  HelpCircle
} from "lucide-react"
import Header from '@/components/Header'
import { ExpenseModal } from '@/components/ExpenseModal'
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { handleExport } from '@/lib/helper'

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
  project_title?: string;
}
interface Installment {
  id: string; project_id: string; amount: number; due_date: string; paid_date?: string; status: string;
  description?: string;
}

type ColorKey = 'red' | 'blue' | 'green' | 'orange' | 'purple' | 'yellow' | 'gray' | 'indigo' | 'pink' | 'cyan'
type StatusKey = 'enquiry' | 'advance' | 'delivered' | 'archived'
type PriorityKey = 'critical' | 'high' | 'medium' | 'low'
type ExpenseCategoryKey = 'development' | 'hosting' | 'marketing' | 'tools' | 'salary' | 'other'

// Theme Config
const THEME = {
  colors: {
    red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', solid: '#ef4444' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', solid: '#3b82f6' },
    green: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', solid: '#10b981' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', solid: '#f97316' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', solid: '#8b5cf6' },
    yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20', solid: '#f59e0b' },
    gray: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20', solid: '#6b7280' },
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', solid: '#6366f1' },
    pink: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20', solid: '#ec4899' },
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', solid: '#06b6d4' }
  },
  status: {
    enquiry: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20", solid: "#f97316", label: "Enquiry", icon: MessageSquare },
    advance: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", solid: "#3b82f6", label: "Advance", icon: Cpu },
    delivered: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", solid: "#10b981", label: "Delivered", icon: CheckCircle },
    archived: { bg: "bg-gray-500/10", text: "text-gray-400", border: "border-gray-500/20", solid: "#6b7280", label: "Archived", icon: Folder }
  },
  priority: {
    critical: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20", solid: "#ef4444", label: "Critical", icon: AlertCircle },
    high: { bg: "bg-orange-500/10", text: "text-orange-500", border: "border-orange-500/20", solid: "#f97316", label: "High", icon: AlertTriangle },
    medium: { bg: "bg-yellow-500/10", text: "text-yellow-500", border: "border-yellow-500/20", solid: "#f59e0b", label: "Medium", icon: Clock },
    low: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20", solid: "#10b981", label: "Low", icon: Calendar }
  },
  expenseCategories: {
    development: { color: "#3b82f6", label: "Development", icon: Code },
    hosting: { color: "#8b5cf6", label: "Hosting", icon: Server },
    marketing: { color: "#ec4899", label: "Marketing", icon: Megaphone },
    tools: { color: "#f59e0b", label: "Tools", icon: Wrench },
    salary: { color: "#10b981", label: "Salary", icon: Users },
    other: { color: "#6b7280", label: "Other", icon: Circle }
  }
}

// Helper Functions
const getColorConfig = (key: ColorKey) => THEME.colors[key] || THEME.colors.gray
const getStatusConfig = (status: string) => THEME.status[status as StatusKey] || THEME.status.enquiry
const getPriorityConfig = (priority: string) => THEME.priority[priority as PriorityKey] || THEME.priority.medium
const getExpenseCategoryConfig = (category: string) => THEME.expenseCategories[category as ExpenseCategoryKey] || THEME.expenseCategories.other

const formatCurrency = (amount: number, revenueLocked: boolean = false) => {
  return revenueLocked ? "###" : `₹${amount.toLocaleString("en-IN")}`
}

const formatPercentage = (value: number, revenueLocked: boolean = false) => {
  return revenueLocked ? "###" : `${value.toFixed(1)}%`
}

// Reusable Components
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-950 to-black flex flex-col items-center justify-center gap-4">
    <HashLoader color="#dc2626" size={60} />
    <p className="text-gray-400 text-sm">Loading mission control...</p>
  </div>
)

interface StatCardProps {
  icon: React.ComponentType<any>;
  label: string;
  value: string | number;
  subtext?: string;
  change?: number;
  changeLabel?: string;
  tooltip?: string;
  loading?: boolean;
  color?: ColorKey;
  trend?: 'up' | 'down' | 'neutral';
  size?: 'default' | 'large';
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  subtext,
  change,
  changeLabel,
  tooltip,
  loading = false,
  color = "gray",
  trend = "neutral",
  size = "default"
}: StatCardProps) => {
  const colorConfig = getColorConfig(color)

  return (
    <TooltipProvider>
      <UITooltip>
        <TooltipTrigger asChild>
          <Card className={cn(
            "bg-gradient-to-br from-gray-900/50 to-gray-900/20 border-gray-800 hover:border-gray-700 transition-all hover:from-gray-900/60 hover:to-gray-900/30 backdrop-blur-sm",
            tooltip ? 'cursor-help' : '',
            size === "large" ? "col-span-2" : ""
          )}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-gray-400 text-xs sm:text-sm font-medium">{label}</p>
                    {tooltip && <Info className="w-3 h-3 text-gray-500" />}
                  </div>
                  <p className={cn(
                    "font-bold",
                    size === "large" ? "text-xl sm:text-2xl" : "text-lg sm:text-xl",
                    colorConfig.text,
                    loading ? 'animate-pulse bg-gray-800 rounded' : ''
                  )}>
                    {loading ? '...' : value}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    {subtext && <p className="text-xs text-gray-500 truncate">{subtext}</p>}
                    {change !== undefined && (
                      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        {trend === "up" && <TrendingUpIcon className="w-3 h-3 text-emerald-400" />}
                        {trend === "down" && <TrendingDownIcon className="w-3 h-3 text-red-400" />}
                        <span className={cn(
                          "text-xs font-medium",
                          trend === "up" ? 'text-emerald-400' :
                            trend === "down" ? 'text-red-400' : 'text-gray-400'
                        )}>
                          {change.toFixed(1)}{changeLabel || '%'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className={cn(
                  "rounded-lg relative overflow-hidden group ml-3 flex-shrink-0",
                  colorConfig.bg,
                  size === "large" ? "p-2 sm:p-3" : "p-1.5 sm:p-2"
                )}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Icon className={cn(colorConfig.text, size === "large" ? "w-5 h-5 sm:w-6 sm:h-6" : "w-4 h-4 sm:w-5 sm:h-5")} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        {tooltip && (
          <TooltipContent className="max-w-xs bg-gray-900 border-gray-800">
            <p className="text-sm text-gray-300">{tooltip}</p>
          </TooltipContent>
        )}
      </UITooltip>
    </TooltipProvider>
  )
}

const ProjectStatusBadge = ({ status, showIcon = false }: { status: string; showIcon?: boolean }) => {
  const config = getStatusConfig(status)
  const Icon = config.icon

  return (
    <Badge className={cn(
      config.bg,
      config.text,
      "border",
      config.border,
      "px-2 py-0.5 text-xs font-medium flex items-center gap-1"
    )}>
      {showIcon && Icon && <Icon className="w-3 h-3" />}
      <span className="hidden sm:inline">{config.label}</span>
      <span className="sm:hidden">{config.label.substring(0, 3)}</span>
    </Badge>
  )
}

const PriorityBadge = ({ priority, showIcon = false }: { priority: string; showIcon?: boolean }) => {
  const config = getPriorityConfig(priority)
  const Icon = config.icon

  return (
    <Badge className={cn(
      config.bg,
      config.text,
      "border",
      config.border,
      "px-2 py-0.5 text-xs font-medium flex items-center gap-1"
    )}>
      {showIcon && Icon && <Icon className="w-3 h-3" />}
      <span className="hidden sm:inline">{config.label}</span>
      <span className="sm:hidden">{config.label.charAt(0)}</span>
    </Badge>
  )
}

const ExpenseItem = ({ expense, onEdit, onDelete }: { expense: Expense; onEdit: () => void; onDelete: () => void }) => {
  const [showActions, setShowActions] = useState(false)
  const categoryConfig = getExpenseCategoryConfig(expense.category)
  const Icon = categoryConfig.icon

  return (
    <div
      className="group p-3 bg-gradient-to-r from-gray-900/30 to-gray-900/10 rounded-lg border border-gray-800 hover:border-gray-700 hover:from-gray-900/40 hover:to-gray-900/20 transition-all cursor-pointer backdrop-blur-sm"
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest('button')) {
          onEdit()
        }
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${categoryConfig.color}20` }}
            >
              {Icon && <Icon className="w-4 h-4" style={{ color: categoryConfig.color }} />}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-1 mb-1">
              <span className="text-sm font-medium text-white truncate block max-w-[140px] sm:max-w-none">
                {expense.description || categoryConfig.label}
              </span>
              {expense.project_title && (
                <div className="rounded-full border  text-xs py-0.5 px-2 bg-gray-900  truncate">
                  {expense.project_title}
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
              <span className="flex items-center gap-1">
                {Icon && <Icon className="w-3 h-3" />}
                <span className="hidden sm:inline">{categoryConfig.label}</span>
                <span className="sm:hidden">{categoryConfig.label.substring(0, 3)}</span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm sm:text-base font-bold text-red-400 whitespace-nowrap">
            ₹{expense.amount.toLocaleString("en-IN")}
          </span>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowActions(!showActions)
              }}
              className="p-1 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showActions && (
              <div className="absolute right-0 top-full mt-1 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-20 w-36 backdrop-blur-sm">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit()
                    setShowActions(false)
                  }}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-gray-800 flex items-center gap-2 transition-colors text-gray-300"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm("Are you sure you want to delete this expense?")) onDelete()
                    setShowActions(false)
                  }}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-gray-800 text-red-400 flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const QuickActionButton = ({
  icon: Icon,
  label,
  color = "blue",
  onClick,
  href
}: {
  icon: React.ComponentType<any>;
  label: string;
  color?: ColorKey;
  onClick?: () => void;
  href?: string;
}) => {
  const colorConfig = getColorConfig(color)

  const content = (
    <div className="flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 active:scale-95 border border-gray-800 bg-gray-900/30 hover:bg-gray-900/50">
      <div className={cn("p-2 rounded-lg mb-2", colorConfig.bg)}>
        <Icon className={cn("w-5 h-5", colorConfig.text)} />
      </div>
      <span className="text-xs font-medium text-gray-300 text-center">{label}</span>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    )
  }

  return (
    <button onClick={onClick} className="w-full text-left">
      {content}
    </button>
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

  // Data fetching
  useEffect(() => {
    const init = async () => {
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) redirect("/auth/login")

      setUser(user as User)

      const [projectsRes, expensesRes, installmentsRes] = await Promise.all([
        supabase.from("bludhaven_projects").select("*").eq('user_id', user.id).order("updated_at", { ascending: false }),
        supabase.from("bludhaven_expenses").select(`
          *,
          bludhaven_projects!inner(title)
        `).eq('user_id', user.id).order("date", { ascending: false }),
        supabase.from("bludhaven_installments").select("*").eq('user_id', user.id).order("due_date", { ascending: true })
      ])

      setProjects(projectsRes.data || [])
      setExpenses((expensesRes.data || []).map(exp => ({
        ...exp,
        project_title: exp.bludhaven_projects?.title
      })))
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
            const { data } = await supabase.from("bludhaven_expenses")
              .select(`*, bludhaven_projects!inner(title)`)
              .eq('user_id', user.id)
            setExpenses((data || []).map(exp => ({ ...exp, project_title: exp.bludhaven_projects?.title })))
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
    const now = new Date()
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30))

    // Filter projects
    const activeProjects = projects.filter(p => !['archived', 'delivered'].includes(p.status))
    const completedProjects = projects.filter(p => p.status === 'delivered')
    const recentProjects = projects.filter(p => new Date(p.updated_at) > thirtyDaysAgo)

    // Calculate metrics
    const totalRevenue = projects.reduce((sum, p) => sum + (p.finalized_amount || 0), 0)
    const totalCollected = projects.reduce((sum, p) => sum + (p.amount_received || 0), 0)
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const netProfit = totalCollected - totalExpenses
    const profitMargin = totalCollected > 0 ? (netProfit / totalCollected) * 100 : 0

    const activeRevenue = activeProjects.reduce((sum, p) => sum + (p.finalized_amount || 0), 0)
    const activeCollected = activeProjects.reduce((sum, p) => sum + (p.amount_received || 0), 0)
    const pendingRevenue = activeRevenue - activeCollected
    const collectionRate = activeRevenue > 0 ? (activeCollected / activeRevenue) * 100 : 0

    const totalEstimatedHours = projects.reduce((sum, p) => sum + (p.estimated_hours || 0), 0)
    const totalActualHours = projects.reduce((sum, p) => sum + (p.actual_hours || 0), 0)
    const efficiencyRate = totalEstimatedHours > 0 ? (totalActualHours / totalEstimatedHours) * 100 : 0

    const projectValues = projects.map(p => p.finalized_amount || 0)
    const avgProjectValue = projectValues.length > 0 ? projectValues.reduce((sum, val) => sum + val, 0) / projectValues.length : 0

    // Tech stack analysis
    const techStackFrequency = projects.reduce((acc, project) => {
      (project.tech_stack || []).forEach(tech => {
        const techLower = tech.toLowerCase()
        acc[techLower] = (acc[techLower] || 0) + 1
      })
      return acc
    }, {} as Record<string, number>)

    // Client Analysis
    const clients = [...new Set(projects.map(p => p.leader))]
    const repeatClients = clients.filter(client =>
      projects.filter(p => p.leader === client).length > 1
    ).length

    // Installment Analysis
    const pendingInstallments = installments.filter(i => i.status === 'pending')
    const overdueInstallments = pendingInstallments.filter(i =>
      i.due_date && new Date(i.due_date) < new Date()
    )
    const totalPendingAmount = pendingInstallments.reduce((sum, i) => sum + i.amount, 0)

    return {
      // Financial
      totalRevenue,
      totalCollected,
      totalExpenses,
      netProfit,
      profitMargin,
      activeRevenue,
      activeCollected,
      pendingRevenue,
      collectionRate,
      recentRevenue: recentProjects.reduce((sum, p) => sum + p.amount_received, 0),

      // Projects
      totalProjects: projects.length,
      activeProjects: activeProjects.length,
      completedProjects: completedProjects.length,
      projectCompletionRate: projects.length > 0 ? (completedProjects.length / projects.length) * 100 : 0,
      avgProjectValue,

      // Efficiency
      totalEstimatedHours,
      totalActualHours,
      efficiencyRate,

      // Business Metrics
      clients: clients.length,
      repeatClients,
      pendingInstallments: pendingInstallments.length,
      overdueInstallments: overdueInstallments.length,
      totalPendingAmount,

      // Tech
      topTechnologies: Object.entries(techStackFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([tech, count]) => ({ tech, count })),

      // Time-based
      recentProjectGrowth: recentProjects.length,
    }
  }, [projects, expenses, installments])

  // Chart data
  const chartData = useMemo(() => {
    // Monthly data - Last 6 months
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push(date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }))
    }

    const monthlyData = months.map(month => {
      const monthStr = month.split(' ')[0]
      const yearStr = month.split(' ')[1]

      const monthRevenue = projects
        .filter(p => {
          const date = new Date(p.updated_at)
          return date.getFullYear().toString().slice(-2) === yearStr &&
            date.toLocaleDateString('en-US', { month: 'short' }) === monthStr
        })
        .reduce((sum, p) => sum + (p.amount_received || 0), 0)

      const monthExpenses = expenses
        .filter(e => {
          const date = new Date(e.date)
          return date.getFullYear().toString().slice(-2) === yearStr &&
            date.toLocaleDateString('en-US', { month: 'short' }) === monthStr
        })
        .reduce((sum, e) => sum + e.amount, 0)

      return {
        month,
        revenue: monthRevenue,
        expenses: monthExpenses,
        profit: monthRevenue - monthExpenses
      }
    })

    // Status distribution
    const statusData = Object.entries(THEME.status).map(([key, config]) => ({
      name: config.label,
      value: projects.filter(p => p.status === key).length,
      color: config.solid,
      icon: config.icon
    })).filter(item => item.value > 0)

    // Expense distribution
    const expenseCategoryData = Object.entries(THEME.expenseCategories).map(([key, config]) => ({
      name: config.label,
      value: expenses.filter(e => e.category === key).reduce((sum, e) => sum + e.amount, 0),
      color: config.color,
      icon: config.icon
    })).filter(item => item.value > 0)

    // Project completion by month
    const completionByMonth = months.map(month => {
      const monthStr = month.split(' ')[0]
      const yearStr = month.split(' ')[1]

      const completed = projects.filter(p =>
        p.status === 'delivered' &&
        new Date(p.updated_at).getFullYear().toString().slice(-2) === yearStr &&
        new Date(p.updated_at).toLocaleDateString('en-US', { month: 'short' }) === monthStr
      ).length

      const started = projects.filter(p =>
        p.booking_date &&
        new Date(p.booking_date).getFullYear().toString().slice(-2) === yearStr &&
        new Date(p.booking_date).toLocaleDateString('en-US', { month: 'short' }) === monthStr
      ).length

      return {
        month,
        completed,
        started,
        completionRate: started > 0 ? (completed / started) * 100 : 0
      }
    })

    // Revenue by priority
    const revenueByPriority = Object.entries(THEME.priority).map(([key, config]) => ({
      name: config.label,
      revenue: projects
        .filter(p => p.priority === key)
        .reduce((sum, p) => sum + (p.amount_received || 0), 0),
      color: config.solid
    })).filter(item => item.revenue > 0)

    return {
      monthlyComparison: monthlyData,
      statusDistribution: statusData,
      expenseDistribution: expenseCategoryData,
      completionByMonth,
      revenueByPriority
    }
  }, [projects, expenses])

  // Helper functions
  const toggleRevenueSecurity = () => {
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
  }

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
    }
  }

  if (loading) return <LoadingSpinner />
  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white">
      <Header />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 space-y-4 lg:space-y-6 pb-20 lg:pb-8">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-gradient-to-b from-red-500 to-red-600 rounded-full" />
            <div>
              <h1 className="text-xl font-bold">Dashboard</h1>
              <p className="text-xs text-gray-400">Welcome back</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleRevenueSecurity}
              className="text-gray-400 hover:text-white p-2"
            >
              {revenueLocked ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-900/50 border-gray-700 hover:bg-gray-800 p-2"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Desktop Welcome & Overview */}
        <div className="hidden lg:flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-full" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Mission Control
                </h1>
                <p className="text-gray-400 mt-1">Welcome back, {user?.full_name || user?.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <Badge variant="outline" className="bg-gray-900/50 border-gray-700">
                <Target className="w-3 h-3 mr-1.5 text-red-400" />
                {analytics.activeProjects} Active
              </Badge>
              <Badge variant="outline" className="bg-gray-900/50 border-gray-700">
                <DollarSign className="w-3 h-3 mr-1.5 text-emerald-400" />
                {formatCurrency(analytics.totalCollected, revenueLocked)}
              </Badge>
              <Badge variant="outline" className="bg-gray-900/50 border-gray-700">
                <TrendingUp className="w-3 h-3 mr-1.5 text-blue-400" />
                {analytics.recentProjectGrowth} New
              </Badge>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={toggleRevenueSecurity} className="text-gray-400 hover:text-white">
              {revenueLocked ? <><Eye className="w-4 h-4 mr-2" /> Unlock Data</> : <><EyeOff className="w-4 h-4 mr-2" /> Lock Data</>}
            </Button>
            <Button variant="outline" size="sm" className="bg-gray-900/50 border-gray-700 hover:bg-gray-800" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <Card className="bg-gradient-to-br from-gray-900/30 to-gray-900/10 border-gray-800 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              <QuickActionButton
                icon={Receipt}
                label="Add Expense"
                color="blue"
                onClick={() => handleExpenseAction()}
              />
              <QuickActionButton
                icon={Folder}
                label="Projects"
                color="green"
                href="/projects"
              />
              <QuickActionButton
                icon={Download}
                label="Export"
                color="indigo"
                onClick={() => handleExport()}
              />
              <QuickActionButton
                icon={HelpCircle}
                label="Help"
                color="cyan"
                href="/help"
              />
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <StatCard
            icon={Target}
            label="Active"
            value={analytics.activeProjects}
            subtext={`${analytics.totalProjects} total`}
            change={analytics.activeProjects > 0 ? ((analytics.activeProjects / analytics.totalProjects) * 100) : 0}
            changeLabel="%"
            tooltip="Currently active projects"
            color="red"
            trend="up"
          />
          <StatCard
            icon={DollarSign}
            label="Revenue"
            value={formatCurrency(analytics.netProfit, revenueLocked)}
            subtext={`${formatCurrency(analytics.totalCollected, revenueLocked)} collected`}
            change={analytics.collectionRate}
            tooltip="Total profit received"
            color="green"
            trend={analytics.collectionRate > 50 ? "up" : "down"}
          />
          <StatCard
            icon={BarChart3}
            label="Target"
            value={formatCurrency(analytics.totalRevenue, revenueLocked)}
            subtext={`${formatCurrency(analytics.pendingRevenue, revenueLocked)} pending`}
            change={analytics.profitMargin}
            tooltip="Total Revenue"
            color={analytics.netProfit >= 0 ? "green" : "red"}
            trend={analytics.netProfit >= 0 ? "up" : "down"}
          />
          <StatCard
            icon={Clock}
            label="Efficiency"
            value={`${analytics.efficiencyRate.toFixed(0)}%`}
            subtext={`${analytics.totalActualHours}h worked`}
            change={analytics.totalEstimatedHours}
            changeLabel=''
            tooltip="Hours worked vs estimated"
            color={analytics.efficiencyRate > 100 ? "red" : analytics.efficiencyRate > 80 ? "green" : "yellow"}
            trend={analytics.efficiencyRate > 100 ? "down" : analytics.efficiencyRate > 80 ? "up" : "neutral"}
          />
        </div>

        {/* Detailed Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-4 lg:space-y-6">
          <TabsList className="bg-gray-900/50 p-1 backdrop-blur-sm w-full overflow-x-auto">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gray-800 text-xs lg:text-sm">
              <BarChart3 className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Home</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="data-[state=active]:bg-gray-800 text-xs lg:text-sm">
              <DollarSign className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
              <span className="hidden sm:inline">Financial</span>
              <span className="sm:hidden">Finance</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="data-[state=active]:bg-gray-800 text-xs lg:text-sm">
              <Folder className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gray-800 text-xs lg:text-sm">
              <Activity className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 lg:space-y-6">
            <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
              <Card className="lg:col-span-2 bg-gradient-to-br from-gray-900/30 to-gray-900/10 border-gray-800 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white text-base lg:text-lg">Revenue & Expenses</CardTitle>
                  <CardDescription>Last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 lg:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData.monthlyComparison}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="month" stroke="#6b7280" fontSize={10} />
                        <YAxis stroke="#6b7280" fontSize={10} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px', backdropFilter: 'blur(10px)' }}
                          formatter={(value: number, name: string) => [
                            `₹${value.toLocaleString("en-IN")}`,
                            name.charAt(0).toUpperCase() + name.slice(1)
                          ]}
                        />
                        <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={3} />
                        <Area type="monotone" dataKey="expenses" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeWidth={3} />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-900/30 to-gray-900/10 border-gray-800 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white text-base lg:text-lg">Project Status</CardTitle>
                  <CardDescription>Distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 lg:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData.statusDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                          nameKey="name"
                          labelLine={false}
                        >
                          {chartData.statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            border: '1px solid #333',
                            borderRadius: '8px',
                            backdropFilter: 'blur(10px)'
                          }}
                          formatter={(value: number, name: string) => [
                            `${value} project${value !== 1 ? 's' : ''}`,
                            name
                          ]}
                          labelStyle={{ color: '#ccc' }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          iconType="circle"
                          formatter={(value) => (
                            <span className="text-xs text-gray-300">{value}</span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="financial" className="space-y-4 lg:space-y-6">
            <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
              <Card className="lg:col-span-2 bg-gradient-to-br from-gray-900/30 to-gray-900/10 border-gray-800 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white text-base lg:text-lg">Financial Overview</CardTitle>
                      <CardDescription>Revenue, expenses, and profit</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={toggleRevenueSecurity} className="text-gray-400 hover:text-white">
                      {revenueLocked ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-emerald-900/20 to-emerald-900/5 rounded-lg border border-emerald-800/30">
                      <p className="text-xs lg:text-sm text-emerald-400 mb-1">Revenue</p>
                      <p className="text-lg lg:text-xl font-bold text-white">{formatCurrency(analytics.totalRevenue, revenueLocked)}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-red-900/20 to-red-900/5 rounded-lg border border-red-800/30">
                      <p className="text-xs lg:text-sm text-red-400 mb-1">Expenses</p>
                      <p className="text-lg lg:text-xl font-bold text-white">{formatCurrency(analytics.totalExpenses, revenueLocked)}</p>
                    </div>
                    <div className={`p-3 rounded-lg border ${analytics.netProfit >= 0 ? 'bg-gradient-to-br from-emerald-900/20 to-emerald-900/5 border-emerald-800/30' : 'bg-gradient-to-br from-red-900/20 to-red-900/5 border-red-800/30'}`}>
                      <p className={`text-xs lg:text-sm mb-1 ${analytics.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>Net Profit</p>
                      <p className={`text-lg lg:text-xl font-bold ${analytics.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {formatCurrency(analytics.netProfit, revenueLocked)}
                      </p>
                    </div>
                  </div>

                  {/* Revenue by Priority Chart */}
                  <div className="mt-4">
                    <p className="text-sm text-gray-400 mb-2">Revenue by Priority</p>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData.revenueByPriority}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="name" stroke="#6b7280" fontSize={10} />
                          <YAxis stroke="#6b7280" fontSize={10} />
                          <Tooltip
                            formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]}
                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                          />
                          <Bar dataKey="revenue" radius={[2, 2, 0, 0]}>
                            {chartData.revenueByPriority.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-900/30 to-gray-900/10 border-gray-800 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white text-base lg:text-lg">Expense Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {chartData.expenseDistribution
                      .filter(d => d.value > 0)
                      .sort((a, b) => b.value - a.value)
                      .map((category, index) => {
                        const percentage = (category.value / analytics.totalExpenses) * 100
                        return (
                          <div key={index} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
                                <span className="text-sm text-gray-300 truncate">{category.name}</span>
                              </div>
                              <span className="text-sm font-bold text-white">{formatCurrency(category.value, revenueLocked)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: category.color }} />
                              </div>
                              <span className="text-xs text-gray-500 w-8 text-right">{percentage.toFixed(0)}%</span>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4 lg:space-y-6">
            <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
              <Card className="bg-gradient-to-br from-gray-900/30 to-gray-900/10 border-gray-800 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white text-base lg:text-lg">Project Performance</CardTitle>
                  <CardDescription>Key metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-gray-900/30 rounded-lg">
                      <p className="text-xs lg:text-sm text-gray-400 mb-1">Avg Value</p>
                      <p className="text-lg lg:text-xl font-bold text-white">{formatCurrency(analytics.avgProjectValue, revenueLocked)}</p>
                    </div>
                    <div className="p-3 bg-gray-900/30 rounded-lg">
                      <p className="text-xs lg:text-sm text-gray-400 mb-1">Completion</p>
                      <p className="text-lg lg:text-xl font-bold text-white">{formatPercentage(analytics.projectCompletionRate, revenueLocked)}</p>
                    </div>
                  </div>

                  {/* Project Completion Trend */}
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Completion Trend</p>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData.completionByMonth}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="month" stroke="#6b7280" fontSize={10} />
                          <YAxis stroke="#6b7280" fontSize={10} />
                          <Tooltip
                            formatter={(value: number, name: string) => {
                              if (name === 'completionRate') return [`${value.toFixed(1)}%`, "Completion Rate"]
                              return [value, name]
                            }}
                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                          />
                          <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[2, 2, 0, 0]} />
                          <Bar dataKey="started" name="Started" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-900/30 to-gray-900/10 border-gray-800 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white text-base lg:text-lg">Recent Projects</CardTitle>
                  <CardDescription>Latest updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {projects.slice(0, 3).map(project => (
                    <Link key={project.id} href={`/projects/${project.id}`}>
                      <div className="group p-3 bg-gradient-to-r from-gray-900/30 to-gray-900/10 rounded-lg border border-gray-800 hover:border-gray-700 transition-all cursor-pointer">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="text-sm font-medium text-white truncate group-hover:text-red-400 transition-colors">
                                {project.title}
                              </p>
                              <PriorityBadge priority={project.priority} showIcon />
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {project.leader}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                {formatCurrency(project.amount_received, revenueLocked)}/{formatCurrency(project.finalized_amount, revenueLocked)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <ProjectStatusBadge status={project.status} showIcon />
                              {project.progress > 0 && (
                                <div className="flex items-center gap-1">
                                  <div className="w-12 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${project.progress}%` }} />
                                  </div>
                                  <span className="text-xs text-gray-400">{project.progress}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/projects">
                      View All Projects
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4 lg:space-y-6">
            <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
              <Card className="bg-gradient-to-br from-gray-900/30 to-gray-900/10 border-gray-800 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white text-base lg:text-lg">Business Analytics</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-900/30 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">Total Clients</p>
                        <p className="text-lg font-bold text-white">{analytics.clients}</p>
                      </div>
                      <div className="p-3 bg-gray-900/30 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">Repeat Clients</p>
                        <p className="text-lg font-bold text-white">{analytics.repeatClients}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-900/30 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">Pending Payments</p>
                        <p className="text-lg font-bold text-yellow-400">{analytics.pendingInstallments}</p>
                      </div>
                      <div className="p-3 bg-gray-900/30 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">Overdue</p>
                        <p className="text-lg font-bold text-red-400">{analytics.overdueInstallments}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-900/30 to-gray-900/10 border-gray-800 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white text-base lg:text-lg">Efficiency Metrics</CardTitle>
                  <CardDescription>Time and resource utilization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-300">Hours Efficiency</span>
                        <span className="text-sm font-bold text-white">{analytics.efficiencyRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={analytics.efficiencyRate} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-300">Collection Rate</span>
                        <span className="text-sm font-bold text-white">{analytics.collectionRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={analytics.collectionRate} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-300">Profit Margin</span>
                        <span className="text-sm font-bold text-white">{analytics.profitMargin.toFixed(1)}%</span>
                      </div>
                      <Progress value={analytics.profitMargin} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Recent Expenses - Mobile Safe */}
        <div className="lg:hidden">
          <Card className="bg-gradient-to-br from-gray-900/30 to-gray-900/10 border-gray-800 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-base sm:text-lg">Recent Expenses</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => handleExpenseAction()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 px-1">
              {expenses.length > 0 ? (
                expenses.slice(0, 4).map(expense => (
                  <ExpenseItem
                    key={expense.id}
                    expense={expense}
                    onEdit={() => handleExpenseAction(expense)}
                    onDelete={() => handleDeleteExpense(expense.id)}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No expenses recorded</p>
                </div>
              )}
              <Button variant="outline" className="w-full text-sm" onClick={() => handleExpenseAction()}>
                <Plus className="w-4 h-4 mr-2" />
                Add New Expense
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Desktop Recent Expenses (unchanged, stays in grid) */}
        <div className="hidden lg:block lg:col-span-2">
          <Card className="bg-gradient-to-br from-gray-900/30 to-gray-900/10 border-gray-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-base lg:text-lg">Recent Expenses</CardTitle>
              <CardDescription>Track and manage spending</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {expenses.length > 0 ? (
                  expenses.slice(0, 3).map(expense => (
                    <ExpenseItem
                      key={expense.id}
                      expense={expense}
                      onEdit={() => handleExpenseAction(expense)}
                      onDelete={() => handleDeleteExpense(expense.id)}
                    />
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No expenses recorded</p>
                  </div>
                )}
                <Button variant="outline" className="w-full" onClick={() => handleExpenseAction()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Expense
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Expense Modal */}
      {showExpenseModal && (
        <ExpenseModal
          expense={selectedExpense}
          projects={projects}
          onClose={() => {
            setShowExpenseModal(false)
            setSelectedExpense(null)
          }}
          onSuccess={() => {
            setShowExpenseModal(false)
            setSelectedExpense(null)
          }}
        />
      )}
    </div>
  )
}