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
  PieChart, Pie, Cell, ComposedChart, Legend, Line,
  Area
} from "recharts"
import {
  Target, Shield, Zap, Lock, Skull, Crown, Eye, EyeOff,
  CheckCircle, Clock, DollarSign, Activity, TrendingUp,
  Users, AlertTriangle, Plus, Calendar, Edit, Download,
  Trash2, MoreVertical, CreditCard, RefreshCw, FileText,
  Info, Server, Megaphone, Wrench, Circle, Code, Receipt,
  Package, Award, CalendarDays, Wallet, ArrowUpRight,
  ChevronRight, Cpu, Folder, ArrowRight, Loader2,
  BarChart3 as BarChartIcon, PieChart as PieChartIcon,
  Menu, X
} from "lucide-react"
import { GiBatwingEmblem, GiBulletImpacts } from "react-icons/gi"
import { FaDroplet } from "react-icons/fa6"
import Header from '@/components/Header'
import ExpenseModal from '@/components/ExpenseModal'
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { handleExport } from '@/lib/helper'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Types (keep as is)
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

// Red Hood Theme Config (keep as is)
const REDHOOD_THEME = {
  colors: {
    red: { bg: 'bg-red-600/10', text: 'text-red-400', solid: '#ef4444', border: 'border-red-600/30' },
    orange: { bg: 'bg-orange-600/10', text: 'text-orange-400', solid: '#f97316', border: 'border-orange-600/30' },
    emerald: { bg: 'bg-emerald-600/10', text: 'text-emerald-400', solid: '#10b981', border: 'border-emerald-600/30' },
    amber: { bg: 'bg-amber-600/10', text: 'text-amber-400', solid: '#f59e0b', border: 'border-amber-600/30' },
    purple: { bg: 'bg-purple-600/10', text: 'text-purple-400', solid: '#8b5cf6', border: 'border-purple-600/30' },
    gray: { bg: 'bg-gray-900/50', text: 'text-gray-400', solid: '#6b7280', border: 'border-gray-800' },
    indigo: { bg: 'bg-indigo-600/10', text: 'text-indigo-400', solid: '#6366f1', border: 'border-indigo-600/30' }
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

// Helper Functions (keep as is)
const getColorConfig = (key: keyof typeof REDHOOD_THEME.colors) => REDHOOD_THEME.colors[key] || REDHOOD_THEME.colors.gray
const getStatusConfig = (status: string) => REDHOOD_THEME.status[status as keyof typeof REDHOOD_THEME.status] || REDHOOD_THEME.status.enquiry
const getPriorityConfig = (priority: string) => REDHOOD_THEME.priority[priority as keyof typeof REDHOOD_THEME.priority] || REDHOOD_THEME.priority.medium

const formatCurrency = (amount: number, revenueLocked: boolean = false) => {
  return revenueLocked ? "###" : `₹${amount.toLocaleString("en-IN")}`
}

// Loading Spinner Component (keep as is)
const LoadingSpinner = () => (
  <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
    <div className="relative">
      <div className="absolute inset-0 bg-red-600/20 blur-xl rounded-full animate-pulse" />
      <HashLoader color="#ef4444" size={60} />
    </div>
    <p className="text-gray-400 text-sm font-medium tracking-wide">Loading mission control...</p>
  </div>
)

// Stat Card Component - Optimized for mobile
interface StatCardProps {
  icon: React.ComponentType<any>;
  label: string;
  value: string | number;
  subtext?: string;
  loading?: boolean;
  color?: keyof typeof REDHOOD_THEME.colors;
  onClick?: () => void;
  compact?: boolean;
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  subtext,
  loading = false,
  color = "gray",
  onClick,
  compact = false
}: StatCardProps) => {
  const colorConfig = getColorConfig(color)

  return (
    <Card
      className={cn(
        "bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-gray-700 transition-all duration-300",
        "hover:from-gray-900/60 hover:to-gray-900/30",
        onClick && "cursor-pointer active:scale-[0.98] transition-transform",
        "min-w-0" // Prevent overflow
      )}
      onClick={onClick}
    >
      <CardContent className={compact ? "p-2 sm:p-3" : "p-3 sm:p-4"}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-gray-400 text-xs sm:text-sm font-medium mb-1 truncate">{label}</p>
            <p className={cn(
              "font-bold truncate",
              compact ? "text-base sm:text-lg" : "text-lg sm:text-xl",
              colorConfig.text,
              loading ? 'animate-pulse bg-gray-800 rounded' : ''
            )}>
              {loading ? '...' : value}
            </p>
            {subtext && (
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500 truncate">{subtext}</p>
              </div>
            )}
          </div>
          <div className={cn(
            "rounded-lg relative overflow-hidden group ml-2 flex-shrink-0",
            colorConfig.bg,
            compact ? "p-1 sm:p-1.5" : "p-1.5 sm:p-2"
          )}>
            <Icon className={cn(colorConfig.text, "w-3 h-3 sm:w-4 sm:h-4")} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Project Card Component - Optimized for mobile
const ProjectCard = ({ project, revenueLocked }: { project: Project, revenueLocked?: boolean }) => {
  const statusConfig = getStatusConfig(project.status)
  const priorityConfig = getPriorityConfig(project.priority)
  const remainingAmount = project.finalized_amount - project.amount_received

  return (
    <Link href={`/projects/${project.id}`} className="block">
      <Card className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 hover:border-gray-700 active:scale-[0.99] transition-all duration-300 group my-1">
        <CardContent className="p-3 sm:py-1 sm:px-4">
          <div className="flex justify-between items-start mb-2 sm:mb-3">
            <div className="flex-1 min-w-0 pr-2">
              <h3 className="font-semibold text-white truncate text-xs sm:text-sm group-hover:text-red-400 transition-colors">
                {project.title}
              </h3>
              <p className="text-xs text-gray-400 truncate mt-0.5">{project.leader}</p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <Badge className={cn(
                priorityConfig.bg,
                priorityConfig.text,
                "px-1.5 py-0 text-xs font-medium border h-5",
                priorityConfig.border
              )}>
                {priorityConfig.label.charAt(0)}
              </Badge>
              <Badge className={cn(
                statusConfig.bg,
                statusConfig.text,
                "px-1.5 py-0 text-xs font-medium border h-5",
                statusConfig.border
              )}>
                {statusConfig.label.substring(0, 3)}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{project.progress || 0}%</span>
              </div>
              <Progress value={project.progress || 0} className="h-1 sm:h-1.5 bg-gray-800" />
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-gray-800">
              <div>
                <p className="text-xs text-gray-500">Received</p>
                <p className={cn(
                  "text-xs sm:text-sm font-semibold",
                  project.amount_received >= project.finalized_amount ? "text-emerald-400" : "text-amber-400"
                )}>
                  {formatCurrency(project.amount_received, revenueLocked)}
                </p>
              </div>
              {remainingAmount > 0 && (
                <div className="text-right">
                  <p className="text-xs text-gray-500">Pending</p>
                  <p className="text-xs sm:text-sm font-semibold text-red-400">
                    {formatCurrency(remainingAmount, revenueLocked)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

// Expense Item Component - Optimized for mobile
const ExpenseItem = ({ expense, onEdit, onDelete }: { expense: Expense; onEdit: () => void; onDelete: () => void }) => {

  const categoryConfigs = {
    development: { bg: "bg-blue-600/20", text: "text-blue-400", border: "border-blue-600/30", icon: Code },
    hosting: { bg: "bg-purple-600/20", text: "text-purple-400", border: "border-purple-600/30", icon: Server },
    marketing: { bg: "bg-pink-600/20", text: "text-pink-400", border: "border-pink-600/30", icon: Megaphone },
    tools: { bg: "bg-amber-600/20", text: "text-amber-400", border: "border-amber-600/30", icon: Wrench },
    salary: { bg: "bg-emerald-600/20", text: "text-emerald-400", border: "border-emerald-600/30", icon: Users },
    other: { bg: "bg-gray-900/50", text: "text-gray-400", border: "border-gray-800", icon: Circle }
  }

  const config = categoryConfigs[expense.category as keyof typeof categoryConfigs] || categoryConfigs.other
  const Icon = config.icon

  return (
    <div className="group p-2 sm:p-3 bg-gray-900/30 backdrop-blur-sm rounded-lg border border-gray-800 hover:border-gray-700 transition-all duration-300">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className={cn("p-1.5 sm:p-2 rounded-lg border", config.bg, config.border)}>
            <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs sm:text-sm font-medium text-white truncate group-hover:text-red-400 transition-colors">
                {expense.description}
              </span>
              <p className="text-xs text-gray-500 capitalize truncate">{expense.category}</p>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <span className="text-xs sm:text-sm font-bold text-red-400 whitespace-nowrap">
            -₹{expense.amount.toLocaleString("en-IN")}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-900 border border-gray-800 backdrop-blur-sm">
              <DropdownMenuItem onClick={onEdit} className="text-gray-300 hover:bg-gray-800 cursor-pointer">
                <Edit className="w-3.5 h-3.5 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="text-red-400 hover:bg-gray-800 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}



// Mobile Stats Drawer
const MobileStatsDrawer = ({ analytics, revenueLocked, onAddExpense }: {
  analytics: any, revenueLocked: boolean, onAddExpense: () => void
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleAddExpense = () => {
    setDrawerOpen(false) // Close drawer first
    onAddExpense() // Then open expense modal
  }

  return (
    <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden bg-gray-900/50 border-gray-700 hover:bg-gray-800 hover:border-red-600/50 hover:text-red-400">
          <Activity className="w-4 h-4 mr-2" /> Quick Stats
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-gray-900 border-t border-gray-800 mb-4">
        <DrawerHeader className="border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Quick Statistics</h2>
        </DrawerHeader>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <StatCard icon={Target} label="Active Missions" value={analytics.activeProjects} subtext={`${analytics.totalProjects} Total`} color="red" compact />
            <StatCard icon={DollarSign} label="Revenue" value={formatCurrency(analytics.totalRevenue, revenueLocked)} subtext={formatCurrency(analytics.pendingRevenue, revenueLocked) + ' pending'} color="emerald" compact />
            <StatCard icon={Wallet} label="Net Profit" value={formatCurrency(analytics.netProfit, revenueLocked)} subtext={`${formatCurrency(analytics.totalCollected, revenueLocked)} collected`} color={analytics.netProfit >= 0 ? "emerald" : "red"} compact />
            <StatCard icon={CreditCard} label="Pending" value={formatCurrency(analytics.totalPendingAmount, revenueLocked)} subtext={`${analytics.pendingInstallments} installments`} color="amber" compact />
          </div>
          <Button variant="default" size="sm" className="w-full bg-red-600 hover:bg-red-700 text-white" onClick={handleAddExpense}>
            <Plus className="w-4 h-4 mr-2" /> Add Expense
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
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
  const [hoveredStat, setHoveredStat] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Check mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    // Listen for custom event to open expense modal
    const handleOpenExpenseModal = () => {
      handleExpenseAction()
    }

    window.addEventListener('open-expense-modal', handleOpenExpenseModal)

    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('open-expense-modal', handleOpenExpenseModal)
    }
  }, [])

  // Data fetching (keep as is)
  useEffect(() => {
    const init = async () => {
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) redirect("/auth/login")

      setUser(user as User)

      const [projectsRes, expensesRes, installmentsRes] = await Promise.all([
        supabase.from("bludhaven_projects").select("*").eq('user_id', user.id).order("updated_at", { ascending: false }),
        supabase
          .from("bludhaven_expenses")
          .select("*")
          .eq('user_id', user.id)
          .order("date", { ascending: false }),
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
            const { data } = await supabase.from("bludhaven_expenses")
              .select(`*`)
              .eq('user_id', user.id)
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

  // Analytics calculations (keep as is)
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
      statusCounts: {
        enquiry: projects.filter(p => p.status === 'enquiry').length,
        advance: projects.filter(p => p.status === 'advance').length,
        delivered: projects.filter(p => p.status === 'delivered').length,
        archived: projects.filter(p => p.status === 'archived').length
      }
    }
  }, [projects, expenses, installments])

  // Chart data (keep as is)
  const chartData = useMemo(() => {
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
        expenses: -monthExpenses,
        netProfit: monthRevenue - monthExpenses
      }
    })

    const statusData = Object.entries(REDHOOD_THEME.status).map(([key, config]) => ({
      name: config.label,
      value: projects.filter(p => p.status === key).length,
      color: config.solid,
    })).filter(item => item.value > 0)

    const topProjects = [...projects]
      .sort((a, b) => (b.finalized_amount || 0) - (a.finalized_amount || 0))
      .slice(0, 5)
      .map(p => ({
        name: p.title.length > (isMobile ? 10 : 20) ? p.title.substring(0, isMobile ? 10 : 20) + '...' : p.title,
        value: p.finalized_amount || 0,
        leader: p.leader
      }))

    return {
      monthlyRevenue: monthlyData,
      statusDistribution: statusData,
      topProjects,
    }
  }, [projects, expenses, isMobile])

  // Helper functions (keep as is)
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
    } else {
      // Success - refresh the data immediately
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Re-fetch expenses
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

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden pb-20 lg:pb-6">

      <Header />
      <main className="relative max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 z-10">
        {/* Header Section - Responsive */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="w-2 sm:w-3 h-6 sm:h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-full" />
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Mission Control
                </h1>
                <p className="text-gray-400 mt-0.5 text-xs sm:text-sm truncate">
                  Operator: {user?.full_name || user?.email}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4">
              <Badge className="bg-red-600/10 text-red-400 border border-red-600/30 text-xs">
                <Target className="w-3 h-3 mr-1.5" />
                {analytics.activeProjects} Active
              </Badge>
              <Badge className="bg-emerald-600/10 text-emerald-400 border border-emerald-600/30 text-xs">
                <CheckCircle className="w-3 h-3 mr-1.5" />
                {analytics.completedProjects} Delivered
              </Badge>
              <Badge className="bg-amber-600/10 text-amber-400 border border-amber-600/30 text-xs">
                {formatCurrency(analytics.totalCollected, revenueLocked)} Collected
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 lg:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleRevenueSecurity}
              className="bg-gray-900/50 border-gray-700 hover:bg-gray-800 hover:border-red-600/50 hover:text-red-400 transition-all p-2"
            >
              {revenueLocked ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-900/50 border-gray-700 hover:bg-gray-800 hover:border-red-600/50 hover:text-red-400 transition-all p-2"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white transition-all group relative overflow-hidden lg:flex hidden"
              onClick={() => handleExpenseAction()}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <Plus className="w-4 h-4 mr-2 relative z-10" />
              <span className="relative z-10 hidden sm:inline">Add Expense</span>
            </Button>
            <MobileStatsDrawer
              analytics={analytics}
              revenueLocked={revenueLocked}
              onAddExpense={() => handleExpenseAction()}
            />
          </div>
        </div>

        {/* Quick Stats Grid - Hidden on mobile, shown in drawer */}
        <div className="hidden lg:grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={Target}
            label="Active Missions"
            value={analytics.activeProjects}
            subtext={`${analytics.totalProjects} Total`}
            color="red"
            compact
            onClick={() => window.location.href = '/projects'}
          />
          <StatCard
            icon={DollarSign}
            label="Revenue"
            value={formatCurrency(analytics.totalRevenue, revenueLocked)}
            subtext={formatCurrency(analytics.pendingRevenue, revenueLocked) + ' pending'}
            color="emerald"
            compact
          />
          <StatCard
            icon={Wallet}
            label="Net Profit"
            value={formatCurrency(analytics.netProfit, revenueLocked)}
            subtext={`${formatCurrency(analytics.totalCollected, revenueLocked)} collected`}
            color={analytics.netProfit >= 0 ? "emerald" : "red"}
            compact
          />
          <StatCard
            icon={CreditCard}
            label="Pending"
            value={formatCurrency(analytics.totalPendingAmount, revenueLocked)}
            subtext={`${analytics.pendingInstallments} installments`}
            color="amber"
            compact
          />
        </div>

        {/* Main Content Grid - Responsive */}
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Financial Trend Chart */}
            <Card className="bg-gray-900/30 max-w-screen backdrop-blur-sm border border-gray-800 hover:border-gray-700 transition-all duration-300 financial-chart">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-base sm:text-lg">Financial Intel</CardTitle>
                    <CardDescription className="text-gray-400 text-xs sm:text-sm">Revenue, Expenses & Net Profit</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white hover:bg-gray-800 p-2"
                      onClick={() => handleExport('html')}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-2 sm:p-6 pt-0">
                <div className="h-48 sm:h-64">
                  <ResponsiveContainer width="95%" className='mx-auto' height="100%">
                    <ComposedChart data={chartData.monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                      <XAxis
                        dataKey="month"
                        stroke="#6b7280"
                        fontSize={isMobile ? 10 : 12}
                        tickLine={false}
                        axisLine={{ stroke: '#374151' }}
                      />
                      <YAxis
                        stroke="#6b7280"
                        fontSize={isMobile ? 10 : 12}
                        tickLine={false}
                        axisLine={{ stroke: '#374151' }}
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                        width={isMobile ? 35 : 40}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          backdropFilter: 'blur(10px)',
                          fontSize: isMobile ? '12px' : '14px'
                        }}
                        formatter={(value: number, name: string) => [
                          `₹${Math.abs(value).toLocaleString("en-IN")}`,
                          name === 'revenue' ? 'Revenue' :
                            name === 'expenses' ? 'Expenses' :
                              name === 'netProfit' ? 'Net Profit' : name
                        ]}
                      />
                      <Legend
                        verticalAlign="top"
                        height={isMobile ? 30 : 36}
                        iconType="circle"
                        iconSize={isMobile ? 6 : 8}
                        wrapperStyle={{ fontSize: isMobile ? '10px' : '12px' }}
                      />
                      <Bar
                        dataKey="revenue"
                        name="Revenue"
                        fill="url(#revenueGradient)"
                        radius={[4, 4, 0, 0]}
                        barSize={isMobile ? 12 : 20}
                      />
                      <Bar
                        dataKey="expenses"
                        name="Expenses"
                        fill="url(#expenseGradient)"
                        radius={[4, 4, 0, 0]}
                        barSize={isMobile ? 12 : 20}
                      />
                      <Area
                        type="monotone"
                        dataKey="netProfit"
                        name="Net Profit"
                        stroke="#8b5cf6"
                        strokeWidth={isMobile ? 1 : 2}
                        fill="#8b5cf6"
                        fillOpacity={0.1}
                        dot={{ r: isMobile ? 2 : 4, fill: '#8b5cf6' }}
                      />
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0.2} />
                        </linearGradient>
                        <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#ef4444" stopOpacity={0.2} />
                        </linearGradient>
                      </defs>
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Project Distribution - Stack on mobile */}
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
              <Card className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 hover:border-gray-700 transition-all duration-300">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-white text-base sm:text-lg">Mission Status</CardTitle>
                  <CardDescription className="text-gray-400 text-xs sm:text-sm">Current distribution</CardDescription>
                </CardHeader>
                <CardContent className="p-2 sm:p-6 pt-0">
                  <div className="h-48 sm:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData.statusDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={isMobile ? 30 : 40}
                          outerRadius={isMobile ? 50 : 70}
                          paddingAngle={2}
                          dataKey="value"
                          label={!isMobile}
                        >
                          {chartData.statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            backdropFilter: 'blur(10px)',
                            fontSize: isMobile ? '12px' : '14px'
                          }}
                          formatter={(value: number, name: string) => [
                            `${value} mission${value !== 1 ? 's' : ''}`,
                            name
                          ]}
                        />
                        {isMobile && (
                          <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: '10px' }}
                          />
                        )}
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 hover:border-gray-700 transition-all duration-300">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-white text-base sm:text-lg">Top Missions</CardTitle>
                  <CardDescription className="text-gray-400 text-xs sm:text-sm">By mission value</CardDescription>
                </CardHeader>
                <CardContent className="p-2 sm:p-6 pt-0">
                  <div className="h-48 sm:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData.topProjects}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
                        <XAxis
                          dataKey="name"
                          stroke="#9ca3af"
                          fontSize={isMobile ? 8 : 10}
                          angle={isMobile ? -90 : -45}
                          textAnchor={isMobile ? "middle" : "end"}
                          height={isMobile ? 40 : 60}
                        />
                        <YAxis
                          stroke="#9ca3af"
                          fontSize={isMobile ? 8 : 10}
                          tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                          width={isMobile ? 35 : 40}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            backdropFilter: 'blur(10px)',
                            fontSize: isMobile ? '12px' : '14px'
                          }}
                          formatter={(value: number, name: string, props: any) => [
                            `₹${value.toLocaleString("en-IN")}`,
                            props.payload.leader
                          ]}
                        />
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.2} />
                          </linearGradient>
                        </defs>
                        <Bar
                          dataKey="value"
                          fill="url(#colorValue)"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Expenses */}
            <Card className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 hover:border-gray-700 transition-all duration-300 expenses-section">
              <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-base sm:text-lg">Recent Expenses</CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleExpenseAction()}
                    className="text-xs h-8 text-gray-400 hover:text-white p-2"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline ml-1">Add</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 max-h-[300px] overflow-y-auto px-3 sm:px-6 pb-4">
                {expenses.length > 0 ? (
                  expenses.slice(0, isMobile ? 3 : 5).map(expense => (
                    <ExpenseItem
                      key={expense.id}
                      expense={expense}
                      onEdit={() => handleExpenseAction(expense)}
                      onDelete={() => handleDeleteExpense(expense.id)}
                    />

                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <CreditCard className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-3 opacity-50" />
                    <p className="text-xs sm:text-sm">No expenses recorded</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Missions & Expenses */}
          <div className="space-y-4 sm:space-y-6">
            {/* Active Missions Card */}
            <Card className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 hover:border-gray-700 transition-all duration-300">
              <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-base sm:text-lg">Active Missions</CardTitle>
                  <Link href="/projects">
                    <Button size="sm" variant="ghost" className="text-xs h-8 text-gray-400 hover:text-white">
                      View All <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-4 p-3 sm:p-6 pt-0">
                <div className="space-y-2 sm:space-y-3">
                  {activeProjects.slice(0, isMobile ? 2 : 3).map(project => (
                    <ProjectCard key={project.id} project={project} revenueLocked={revenueLocked} />
                  ))}
                </div>
                {activeProjects.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <Target className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs sm:text-sm">No active missions</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Expense Distribution */}
            <Card className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 hover:border-gray-700 transition-all duration-300">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-base sm:text-lg">Expense Intel</CardTitle>
                    <CardDescription className="text-gray-400 text-xs sm:text-sm">Breakdown by category</CardDescription>
                  </div>
                  <Badge className="bg-red-600/10 text-red-400 border border-red-600/30 text-xs sm:text-sm">
                    -₹{revenueLocked ? '###' : analytics.totalExpenses.toLocaleString("en-IN")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-2 sm:p-6 pt-0">
                <div className="h-48 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(expenses.reduce((acc, expense) => {
                          acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
                          return acc;
                        }, {} as Record<string, number>)).map(([category, amount]) => ({
                          name: category.charAt(0).toUpperCase() + category.slice(1),
                          value: amount
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={isMobile ? 30 : 40}
                        outerRadius={isMobile ? 50 : 70}
                        paddingAngle={2}
                        dataKey="value"
                        label={!isMobile}
                      >
                        {Object.entries(expenses.reduce((acc, expense) => {
                          acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
                          return acc;
                        }, {} as Record<string, number>)).map((_, index) => {
                          const colors = [
                            '#ef4444', '#3b82f6', '#10b981', '#f59e0b',
                            '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'
                          ];
                          return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                        })}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          backdropFilter: 'blur(10px)',
                          fontSize: isMobile ? '12px' : '14px'
                        }}
                        formatter={(value: number) => [`-₹${value.toLocaleString("en-IN")}`, 'Amount']}
                      />
                      {isMobile && (
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{ fontSize: '10px' }}
                        />
                      )}
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {showExpenseModal && (
        <ExpenseModal
          expense={selectedExpense}
          projects={projects}
          onClose={() => {
            setShowExpenseModal(false)
            setSelectedExpense(null)
          }}
          onSuccess={async () => {
            setShowExpenseModal(false)
            setSelectedExpense(null)

            // Force refresh data
            const supabase = getSupabaseClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
              // Re-fetch expenses
              const { data: expensesData } = await supabase
                .from("bludhaven_expenses")
                .select("*")
                .eq('user_id', user.id)
                .order("date", { ascending: false })

              setExpenses(expensesData || [])

              // Re-fetch projects (if expense was project-related)
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