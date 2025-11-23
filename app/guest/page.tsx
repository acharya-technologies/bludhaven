"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Mail, Shield, Lock, Zap, Target, Calendar, Search, AlertTriangle, Clock } from "lucide-react"
import { GiBatwingEmblem } from "react-icons/gi"

interface Project {
  id: string
  title: string
  leader: string
  status: "enquiry" | "advance" | "delivered" | "archived"
  priority: "critical" | "high" | "medium" | "low"
  progress: number
  finalized_amount: number
  amount_received: number
  deadline: string
}

const SECURITY = {
  MAX_ATTEMPTS: 2,
  COOLDOWN_MINUTES: 2,
  MIN_PROJECT_CHARS: 3,
  STORAGE_KEY: 'guest-security'
}

const THEME = {
  status: {
    enquiry: "bg-orange-500/15 text-orange-300 border-orange-500/40",
    advance: "bg-blue-500/15 text-blue-300 border-blue-500/40",
    delivered: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
    archived: "bg-gray-500/15 text-gray-300 border-gray-500/40"
  },
  priority: {
    critical: "bg-red-500/15 text-red-300 border-red-500/40",
    high: "bg-orange-500/15 text-orange-300 border-orange-500/40",
    medium: "bg-yellow-500/15 text-yellow-300 border-yellow-500/40",
    low: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
  }
}

const useSecurity = () => {
  const [attempts, setAttempts] = useState(0)
  const [lastAttempt, setLastAttempt] = useState<number | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(0)

  useEffect(() => {
    const stored = localStorage.getItem(SECURITY.STORAGE_KEY)
    if (stored) {
      try {
        const { attempts: storedAttempts, lastAttempt: storedLastAttempt } = JSON.parse(stored)
        setAttempts(storedAttempts || 0)
        setLastAttempt(storedLastAttempt || null)
      } catch (e) {
        localStorage.removeItem(SECURITY.STORAGE_KEY)
      }
    }
  }, [])

  useEffect(() => {
    const updateTimer = () => {
      if (!lastAttempt || attempts < SECURITY.MAX_ATTEMPTS) {
        setTimeRemaining(0)
        return
      }

      const elapsed = Date.now() - lastAttempt
      const cooldownMs = SECURITY.COOLDOWN_MINUTES * 60 * 1000
      const remaining = Math.max(0, cooldownMs - elapsed)

      setTimeRemaining(remaining)

      if (remaining === 0 && attempts >= SECURITY.MAX_ATTEMPTS) {
        localStorage.removeItem(SECURITY.STORAGE_KEY)
        setAttempts(0)
        setLastAttempt(null)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 100)
    return () => clearInterval(interval)
  }, [attempts, lastAttempt])

  const recordAttempt = () => {
    const newAttempts = attempts + 1
    const newLastAttempt = Date.now()
    setAttempts(newAttempts)
    setLastAttempt(newLastAttempt)
    localStorage.setItem(SECURITY.STORAGE_KEY, JSON.stringify({
      attempts: newAttempts,
      lastAttempt: newLastAttempt
    }))
  }

  const canAttempt = () => {
    if (attempts < SECURITY.MAX_ATTEMPTS) return true
    return timeRemaining === 0
  }

  const formatTimeRemaining = () => {
    const totalSeconds = Math.ceil(timeRemaining / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return { minutes, seconds, totalSeconds }
  }

  return { attempts, recordAttempt, timeRemaining, canAttempt, formatTimeRemaining }
}

export default function GuestAccessPage() {
  const router = useRouter()
  const { attempts, recordAttempt, timeRemaining, canAttempt, formatTimeRemaining } = useSecurity()
  const [email, setEmail] = useState("")
  const [projectName, setProjectName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [accessGranted, setAccessGranted] = useState(false)

  const handleSearch = async () => {
    if (!canAttempt()) {
      const { minutes, seconds } = formatTimeRemaining()
      setError(`Maximum attempts reached. Try again in ${minutes}:${seconds.toString().padStart(2, '0')}.`)
      return
    }

    if (!email.trim() || !projectName.trim()) {
      setError("Please enter both email and project name")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address")
      return
    }

    const trimmedProjectName = projectName.trim()
    if (trimmedProjectName.length < SECURITY.MIN_PROJECT_CHARS) {
      setError(`Project name must be at least ${SECURITY.MIN_PROJECT_CHARS} characters`)
      return
    }

    setLoading(true)
    setError(null)
    setProjects([])

    try {
      const supabase = getSupabaseClient()

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email.trim().toLowerCase())

      if (profileError) throw profileError
      if (!profiles?.length) {
        recordAttempt()
        setError("No projects found with the provided credentials")
        return
      }

      const targetUser = profiles[0]

      const { data: allProjects, error: projectsError } = await supabase
        .from('bludhaven_projects')
        .select('*')
        .eq('user_id', targetUser.id)
        .order('updated_at', { ascending: false })

      if (projectsError) throw projectsError

      const searchFirstWord = trimmedProjectName.toLowerCase().split(/\s+/)[0]
      const filteredProjects = allProjects?.filter((project: any) => {
        const projectFirstWord = project.title?.toLowerCase().split(/\s+/)[0] || ''
        return projectFirstWord === searchFirstWord
      }) || []

      if (filteredProjects.length === 0) {
        recordAttempt()
        setError("No projects found. Check the exact first word of your project name.")
        return
      }

      const transformedProjects: Project[] = filteredProjects.map((project: any) => ({
        id: project.id,
        title: project.title || 'Untitled Project',
        leader: project.leader || 'Unknown Leader',
        status: project.status || 'enquiry',
        priority: project.priority || 'medium',
        progress: project.progress || 0,
        finalized_amount: project.finalized_amount || 0,
        amount_received: project.amount_received || 0,
        deadline: project.deadline || ''
      }))

      setProjects(transformedProjects)
      setAccessGranted(true)
    } catch (err: any) {
      console.error('Supabase error:', err)
      recordAttempt()
      setError("Security verification failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleViewProject = (projectId: string) => {
    router.push(`/guest/${projectId}`)
  }

  const formatDate = (dateString: string) => dateString ? new Date(dateString).toLocaleDateString("en-IN") : "—"

  const getPaymentStatus = (received: number, total: number) => {
    if (total === 0) return { text: "—", color: "text-gray-400" }
    const percentage = (received / total) * 100
    if (percentage === 0) return { text: "Pending", color: "text-yellow-300" }
    if (percentage === 100) return { text: "Paid", color: "text-emerald-300" }
    return { text: `${percentage.toFixed(0)}% Paid`, color: "text-blue-300" }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.leader.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const { minutes, seconds } = formatTimeRemaining()
  const isLocked = !canAttempt()

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/10 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1),transparent_70%)]" />
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-red-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-800/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/5 rounded-full blur-2xl" />
      </div>

      {/* Compact Header */}
      <header className="relative border-b border-red-800/20 bg-black/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center border border-red-500/30 shadow-lg shadow-red-500/20">
                <GiBatwingEmblem className="w-5 h-5 text-red-200" />
              </div>
              <div>
                <h1 className="text-lg font-black bg-gradient-to-r from-red-300 via-red-400 to-red-500 bg-clip-text text-transparent tracking-tight">
                  BLUDHAVEN
                </h1>
                <p className="text-red-300/60 text-[0.6rem] font-medium tracking-[0.15em] uppercase">Guest Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-900/15 border border-red-700/30 backdrop-blur-sm">
              <Lock className="w-3 h-3 text-red-300" />
              <span className="text-[0.6rem] text-red-200 font-bold uppercase tracking-wide">Read Only</span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-4xl mx-auto px-4 py-6">
        {/* Access Form */}
        {!accessGranted && (
          <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-gray-900/80 border-red-700/30 backdrop-blur-xl shadow-2xl shadow-red-950/10">
              <CardHeader className="text-center pb-4 pt-6">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center border border-red-500/30 shadow-lg shadow-red-500/20">
                  <Target className="w-6 h-6 text-red-100" />
                </div>
                <CardTitle className="text-xl font-black text-white mb-1">Project Access</CardTitle>
                <p className="text-red-200/50 text-xs">Enter credentials to view your projects</p>
              </CardHeader>
              <CardContent className="px-5 pb-6">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-red-200 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" />
                        Operator Email
                      </label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="operator@domain.com"
                        className="bg-gray-800/40 border-red-600/30 text-white h-10 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-red-200 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5" />
                          Project Name
                        </span>
                        <span className="text-[0.6rem] text-red-400/70 font-medium">First word only</span>
                      </label>
                      <Input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter first word of project"
                        className="bg-gray-800/40 border-red-600/30 text-white h-10 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-900/15 border border-red-700/30 rounded-lg backdrop-blur-sm animate-in slide-in-from-top-2 duration-300">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-red-200 text-xs leading-relaxed">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Security Status */}
                  <div className="p-3 bg-gray-800/20 border border-gray-700/20 rounded-lg backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-300">Security Status</span>
                      <Shield className="w-3.5 h-3.5 text-red-400" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[0.6rem] text-gray-400">Attempts Used</span>
                        <div className="flex items-center gap-1.5">
                          {[...Array(SECURITY.MAX_ATTEMPTS)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i < attempts ? 'bg-red-500 shadow-lg shadow-red-500/50' : 'bg-gray-700'
                                }`}
                            />
                          ))}
                          <span className="text-xs font-bold text-white ml-1">
                            {attempts}/{SECURITY.MAX_ATTEMPTS}
                          </span>
                        </div>
                      </div>

                      {isLocked && (
                        <div className="pt-2 border-t border-gray-700/40">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                              <span className="text-[0.6rem] text-gray-400">Cooldown Timer</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="px-2 py-1 bg-red-900/20 border border-red-700/30 rounded-md">
                                <span className="text-sm font-mono font-bold text-red-300 tabular-nums">
                                  {minutes}:{seconds.toString().padStart(2, '0')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-1.5 h-1 bg-gray-700/30 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-100 ease-linear"
                              style={{ width: `${(timeRemaining / (SECURITY.COOLDOWN_MINUTES * 60 * 1000)) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handleSearch}
                    disabled={loading || isLocked}
                    className="w-full h-10 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 disabled:from-gray-700 disabled:to-gray-800 border border-red-600/40 disabled:border-gray-600/40 text-white font-bold text-sm shadow-lg shadow-red-950/20 disabled:shadow-none transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-red-200 border-t-transparent rounded-full animate-spin" />
                        <span>Verifying Access...</span>
                      </div>
                    ) : isLocked ? (
                      <div className="flex items-center gap-1.5">
                        <Lock className="w-4 h-4" />
                        <span>Access Locked</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4" />
                        <span>Access Projects</span>
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Projects Grid */}
        {accessGranted && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-xl font-black text-white mb-0.5">Your Projects</h1>
                <p className="text-red-200/50 text-xs">
                  {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} • Read Only Access
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-red-300/40" />
                  <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-gray-800/40 border-red-600/30 text-white pl-9 w-full sm:w-48 h-9 text-xs focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-gray-800/40 border border-red-600/30 rounded-md px-3 py-2 text-white text-xs focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all cursor-pointer hover:bg-gray-800/60"
                >
                  <option value="">All Status</option>
                  {Object.keys(THEME.status).map(status =>
                    <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                  )}
                </select>
              </div>
            </div>

            <div className="grid gap-3">
              {filteredProjects.map((project, index) => {
                const payment = getPaymentStatus(project.amount_received, project.finalized_amount)
                const isOverdue = project.deadline && new Date(project.deadline) < new Date()

                return (
                  <Card
                    key={project.id}
                    className="bg-gray-900/60 border-red-700/20 hover:border-red-600/40 backdrop-blur-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-950/10 hover:scale-[1.005] animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: `${index * 75}ms` }}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="space-y-1">
                            <h3 className="text-base font-black text-white leading-tight">{project.title}</h3>
                            <p className="text-red-200/60 text-xs">{project.leader}</p>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-[0.6rem] font-bold border uppercase tracking-wide ${THEME.status[project.status]} transition-all`}>
                              {project.status}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-[0.6rem] font-bold border uppercase tracking-wide ${THEME.priority[project.priority]} transition-all`}>
                              {project.priority}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                            <div className="space-y-1.5">
                              <p className="text-red-200/50 text-[0.6rem] font-bold uppercase tracking-wider">Progress</p>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-800/50 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="bg-gradient-to-r from-red-500 to-red-600 h-full transition-all duration-1000 ease-out shadow-lg shadow-red-500/50"
                                    style={{ width: `${project.progress}%` }}
                                  />
                                </div>
                                <span className="text-red-200 font-black text-xs min-w-[2rem] text-right">{project.progress}%</span>
                              </div>
                            </div>

                            <div className="space-y-1.5 group w-fit">
                              <p className="text-red-200/50 text-[0.6rem] font-bold uppercase tracking-wider">Payment</p>
                              <div
                                className="blur-sm hover:blur-none transition-all duration-500 cursor-pointer"
                                onClick={(e) => { e.currentTarget.classList.toggle('blur-sm'); }}
                              >
                                <p className="text-white font-black text-sm">₹{project.finalized_amount.toLocaleString("en-IN")}</p>
                                <p className="text-gray-400 text-[0.6rem]">₹{project.amount_received.toLocaleString("en-IN")} Received</p>
                                <p className={`mt-0.5 text-xs font-bold ${payment.color}`}>{payment.text}</p>
                              </div>
                            </div>

                            <div className="space-y-1.5 w-fit">
                              <p className="text-red-200/50 text-[0.6rem] font-bold uppercase tracking-wider">Deadline</p>
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-red-300/40" />
                                <span className={`font-bold text-xs ${isOverdue ? "text-red-400 animate-pulse" : "text-white"}`}>
                                  {formatDate(project.deadline)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={() => handleViewProject(project.id)}
                          className="bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 border border-red-600/40 px-4 py-2 text-xs font-bold shadow-lg shadow-red-950/20 transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1.5" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {filteredProjects.length === 0 && (
              <Card className="bg-gray-900/60 border-red-700/20 backdrop-blur-xl">
                <CardContent className="p-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-red-900/15 rounded-lg flex items-center justify-center border border-red-700/30">
                    <Search className="w-6 h-6 text-red-400" />
                  </div>
                  <h3 className="text-lg font-black text-white mb-1">No Projects Found</h3>
                  <p className="text-red-200/50 text-xs">Try adjusting your search criteria</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Compact Security Info */}
        <Card className="bg-gray-900/50 border-red-700/20 backdrop-blur-xl mt-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-900/15 rounded-lg flex items-center justify-center border border-red-700/30 flex-shrink-0">
                <Shield className="w-4 h-4 text-red-300" />
              </div>
              <div>
                <p className="text-red-200 font-bold text-xs mb-0.5">Secure Guest Access Protocol</p>
                <p className="text-red-200/40 text-[0.6rem] leading-relaxed">
                  First word exact match • {SECURITY.MAX_ATTEMPTS} attempts every {SECURITY.COOLDOWN_MINUTES} minutes • Read-only access
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="relative border-t border-red-800/10 bg-black/40 py-4 px-4 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[0.6rem] text-red-300/30 tracking-[0.15em] uppercase font-bold">
            Bludhaven Security System • Protected by Red Hood
          </p>
        </div>
      </footer>
    </div>
  )
}