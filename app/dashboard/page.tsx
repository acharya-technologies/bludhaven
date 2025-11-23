"use client"
import { HashLoader } from 'react-spinners'
import { useState, useEffect } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, Users, CheckCircle, Clock, Lock, Unlock, DollarSign, LogOut, ArrowRight, Activity, Target, AlertTriangle, Plus, Calendar, Edit, Folder, Shield } from "lucide-react"
import Header from '@/components/Header'

// Types
interface User { id: string; email: string }
interface Project {
  id: string; title: string; leader: string; priority: string; status: string; progress: number;
  finalized_amount: number; amount_received: number; estimated_hours: number; actual_hours: number;
  updated_at: string; deadline: string; description?: string; contact?: string;
}

// Theme Config
const THEME = {
  status: {
    enquiry: { bg: "bg-orange-500/10", text: "text-orange-400", color: "#f97316" },
    advance: { bg: "bg-blue-500/10", text: "text-blue-400", color: "#3b82f6" },
    delivered: { bg: "bg-emerald-500/10", text: "text-emerald-400", color: "#10b981" },
    archived: { bg: "bg-gray-500/10", text: "text-gray-400", color: "#6b7280" }
  },
  priority: {
    critical: "text-red-500", high: "text-orange-500", medium: "text-yellow-500", low: "text-emerald-500"
  }
}

// Reusable Components
const LoadingSpinner = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <HashLoader color="#dc2626" />
  </div>
)



const StatCard = ({ icon: Icon, label, value, subtext, color }: any) => (
  <Card className="bg-gray-950 border-gray-800 hover:border-gray-700 transition-all">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-sm mb-2">{label}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-br ${color === 'text-red-500' ? 'from-red-500/20 to-red-600/10' :
            color === 'text-emerald-500' ? 'from-emerald-500/20 to-emerald-600/10' :
              color === 'text-blue-500' ? 'from-blue-500/20 to-blue-600/10' : 'from-gray-500/20 to-gray-600/10'
          }`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </CardContent>
  </Card>
)

const StatusPieChart = ({ projects }: { projects: Project[] }) => {
  const data = Object.entries({
    enquiry: projects.filter(p => p.status === 'enquiry').length,
    advance: projects.filter(p => p.status === 'advance').length,
    delivered: projects.filter(p => p.status === 'delivered').length,
    archived: projects.filter(p => p.status === 'archived').length
  }).filter(([_, value]) => value > 0).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1), value
  }))

  return (
    <Card className="bg-gray-950 border-gray-800">
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <div className="w-1 h-6 bg-red-600 rounded-full" />
          Project Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={THEME.status[entry.name.toLowerCase() as keyof typeof THEME.status]?.color || '#6b7280'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-16">No data available</p>
        )}
      </CardContent>
    </Card>
  )
}

const PriorityBarChart = ({ projects }: { projects: Project[] }) => {
  const data = [
    { name: "Critical", value: projects.filter(p => p.priority === 'critical').length },
    { name: "High", value: projects.filter(p => p.priority === 'high').length },
    { name: "Medium", value: projects.filter(p => p.priority === 'medium').length },
    { name: "Low", value: projects.filter(p => p.priority === 'low').length }
  ]

  return (
    <Card className="bg-gray-950 border-gray-800">
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <div className="w-1 h-6 bg-red-600 rounded-full" />
          Priority Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} />
            <YAxis stroke="#6b7280" fontSize={12} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }} />
            <Bar dataKey="value" fill="#dc2626" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

const RecentProjects = ({ projects }: { projects: Project[] }) => (
  <Card className="bg-gray-950 border-gray-800">
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2 text-lg ">
          <div className="w-1 h-6 bg-red-600 rounded-full " />
          Recent Projects
        </CardTitle>
        <Link href="/projects">
          <Button size="sm" className="bg-red-600 hover:bg-red-700">
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
    </CardHeader>
    <CardContent className="space-y-3 -mx-4 sm:mx-0">
      {projects.slice(0, 5).map(project => (
        <Link key={project.id} href={`/projects/${project.id}`}>
          <div className="p-2 mb-2 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-700 transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate group-hover:text-red-500 transition-colors">
                  {project.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">{project.leader} {(project.deadline && new Date(project.deadline) < new Date()) && (<span className='text-red-500 ml-2'> • Overdue</span>)}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={`text-xs font-medium ${THEME.priority[project.priority as keyof typeof THEME.priority]}`}>
                    {project.priority}
                  </p>
                  <p className="text-xs text-gray-500">{Math.round(project.amount_received * 100 / project.finalized_amount)}%</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${THEME.status[project.status as keyof typeof THEME.status].bg} ${THEME.status[project.status as keyof typeof THEME.status].text} border-gray-700`}>
                  {project.status}
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
      {projects.length === 0 && <p className="text-gray-500 text-center py-8">No projects yet</p>}
    </CardContent>
  </Card>
)

const RevenueStats = ({ projects }: { projects: Project[] }) => {
  const [locked, setLocked] = useState(true)
  const [attempts, setAttempts] = useState(0)

  const activeProjects = projects.filter(p => p.status !== "archived")
  const totalRevenue = activeProjects.reduce((sum, p) => sum + (p.finalized_amount || 0), 0)
  const totalReceived = activeProjects.reduce((sum, p) => sum + (p.amount_received || 0), 0)
  const pending = totalRevenue - totalReceived
  const percentage = totalRevenue > 0 ? (totalReceived / totalRevenue) * 100 : 0

  const toggleLock = () => {
    if (locked) {
      const pass = prompt("Enter security code:")
      if (pass === process.env.NEXT_PUBLIC_SECRET_PASSWORD) {
        setLocked(false)
        setAttempts(0)
      } else {
        setAttempts(prev => prev + 1)
        alert(`Access denied. ${3 - attempts} attempts remaining. ${process.env.NEXT_PUBLIC_SECRET_PASSWORD}`)
        if (attempts >= 2) setTimeout(() => setAttempts(0), 30000)
      }
    } else {
      setLocked(true)
    }
  }

  return (
    <Card className="bg-gradient-to-br from-gray-950 to-slate-950 border-gray-800 relative overflow-hidden">
      {/* Content - Always visible but blurred when locked */}
      <div className={`transition-all duration-500 ${locked ? "blur-md scale-95" : "blur-0 scale-100"}`}>
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <div className="w-1 h-6 bg-red-600 rounded-full" />
            Revenue Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-red-400" />
                <p className="text-sm text-gray-400">Total Revenue</p>
              </div>
              <p className="text-3xl font-bold text-white">₹{locked ? "###" : totalRevenue.toLocaleString("en-IN")}</p>
              <p className="text-xs text-gray-500">{activeProjects.length} active projects</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <p className="text-sm text-gray-400">Received</p>
              </div>
              <p className="text-3xl font-bold text-emerald-400">₹{locked ? "###" : totalReceived.toLocaleString("en-IN")}</p>
              <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">{locked ? "###" : percentage.toFixed(1)}% collected</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <p className="text-sm text-gray-400">Pending</p>
              </div>
              <p className="text-3xl font-bold text-yellow-400">₹{locked ? "###" : pending.toLocaleString("en-IN")}</p>
              <p className="text-xs text-gray-500">Awaiting payment</p>
            </div>
          </div>
        </CardContent>
      </div>

      {/* Single Central Shield Overlay - Click to reveal */}
      {locked && (
        <div
          className="absolute inset-0 flex items-center justify-center flex-col gap-3 text-gray-400 bg-black/70 backdrop-blur-sm rounded-lg cursor-pointer transition-all duration-300 hover:bg-black/80"
          onClick={toggleLock}
        >
          <Shield className="w-12 h-12 text-red-500 mb-2" />
          <p className="text-lg font-semibold text-white">Classified Information</p>
          <p className="text-sm">Authentication required</p>
          <p className="text-xs text-gray-500 mt-1">Click to authenticate</p>
        </div>
      )}

      {/* Small Lock Button to re-lock */}
      {!locked && (
        <button
          onClick={toggleLock}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors bg-gray-900/80 rounded-lg p-2 border border-gray-700 hover:border-red-500"
        >
          <Shield className="w-4 h-4" />
        </button>
      )}
    </Card>
  )
}

// Main Dashboard Component
export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) redirect("/auth/login")

      setUser(user as User)

      const { data } = await supabase.from("bludhaven_projects").select("*").eq('user_id', user.id)
        .order("updated_at", { ascending: false })
      setProjects(data || [])
      setLoading(false)

      // Real-time subscription
      const channel = supabase.channel('projects-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'bludhaven_projects', filter: `user_id=eq.${user.id}` },
          (payload) => {
            if (payload.eventType === 'INSERT') setProjects(prev => [payload.new as Project, ...prev])
            else if (payload.eventType === 'UPDATE') setProjects(prev => prev.map(p => p.id === payload.new.id ? payload.new as Project : p))
            else if (payload.eventType === 'DELETE') setProjects(prev => prev.filter(p => p.id !== payload.old.id))
          }
        )
        .subscribe()

      return () => supabase.removeChannel(channel)
    }

    init()
  }, [])

  if (loading) return <LoadingSpinner />
  if (!user) return null

  const stats = {
    total: projects.length,
    active: projects.filter(p => !['archived', 'delivered'].includes(p.status)).length,
    completed: projects.filter(p => p.status === 'delivered').length,
    hoursActual: projects.reduce((sum, p) => sum + (p.actual_hours || 0), 0),
    hoursEstimated: projects.reduce((sum, p) => sum + (p.estimated_hours || 0), 0)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Target} label="Active Missions" value={stats.active} color="text-red-500" />
          <StatCard icon={Folder} label="Total Projects" value={stats.total} color="text-blue-500" />
          <StatCard icon={CheckCircle} label="Completed" value={stats.completed} color="text-emerald-500" />
          <StatCard icon={Clock} label="Hours Logged" value={`${stats.hoursActual}/${stats.hoursEstimated}`} subtext="Actual / Estimated" color="text-gray-400" />
        </div>

        <RevenueStats projects={projects} />
        <div className="grid lg:grid-cols-2 gap-6">
          <StatusPieChart projects={projects} />
          <PriorityBarChart projects={projects} />
        </div>

        <RecentProjects projects={projects} />
      </main>
    </div>
  )
}