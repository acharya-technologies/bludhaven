"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Search, Edit, Calendar } from "lucide-react"
import Header from '@/components/Header'
import { HashLoader } from "react-spinners"

interface User { id: string; email?: string }
interface Project {
  id: string; title: string; description: string; leader: string; contact: string;
  status: "enquiry" | "advance" | "delivered" | "archived";
  priority: "critical" | "high" | "medium" | "low";
  progress: number; finalized_amount: number; amount_received: number;
  deadline: string; booking_date: string; created_at: string; updated_at: string;
}

const THEME = {
  status: {
    enquiry: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    advance: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    archived: "bg-gray-500/10 text-gray-400 border-gray-500/30"
  },
  priority: {
    critical: "bg-red-500/10 text-red-400 border-red-500/30",
    high: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
  }
}

const CreateProjectDialog = ({ userId, open, onOpenChange }: { userId: string; open: boolean; onOpenChange: (open: boolean) => void }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "", leader: "", contact: "", status: "enquiry" as const, priority: "medium" as const
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseClient()
      const { error: insertError } = await supabase.from("bludhaven_projects").insert([{
        ...formData,
        user_id: userId,
        description: "",
        progress: 0,
        finalized_amount: 0,
        amount_received: 0,
        deadline: null,
      }])

      if (insertError) throw insertError

      setFormData({ title: "", leader: "", contact: "", status: "enquiry", priority: "medium" })
      onOpenChange(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Failed to create project")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-gray-950 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl text-white flex items-center gap-2">
            <div className="w-1 h-6 bg-red-600 rounded-full" />
            Create New Project
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Add essential details. You can complete the rest later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Title <span className="text-red-500">*</span>
              </label>
              <Input
                name="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., E-commerce Platform"
                className="bg-gray-900 border-gray-700 text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Leader <span className="text-red-500">*</span>
                </label>
                <Input
                  name="leader"
                  value={formData.leader}
                  onChange={(e) => setFormData(prev => ({ ...prev, leader: e.target.value }))}
                  placeholder="John Doe"
                  className="bg-gray-900 border-gray-700 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Contact</label>
                <Input
                  name="contact"
                  value={formData.contact}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                  placeholder="+91 98765 43210"
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-red-600 focus:border-transparent"
                >
                  <option value="enquiry">Enquiry</option>
                  <option value="advance">Advance</option>
                  <option value="delivered">Delivered</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-red-600 focus:border-transparent"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-800">
            <Button type="button" onClick={() => onOpenChange(false)} variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-900">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.title || !formData.leader} className="bg-red-600 hover:bg-red-700">
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const LoadingSpinner = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <HashLoader color="#dc2626" />
  </div>
)

export default function ProjectsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)


  useEffect(() => {
    const supabase = getSupabaseClient();
    let subscription: ReturnType<typeof supabase.channel> | null = null;

    const initialize = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      setUser(user);
      await fetchProjects(user.id);
      setLoading(false);

      // subscribe only AFTER user is loaded
      subscription = supabase
        .channel("projects-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "bludhaven_projects" },
          (payload: any) => {
            console.log("Realtime update:", payload);
            fetchProjects(user.id);
          }
        )
        .subscribe();
    };

    initialize();

    // IMPORTANT: proper cleanup
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, []);


  const fetchProjects = async (userId: string) => {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from("bludhaven_projects")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })

    if (!error && data) setProjects(data)
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(search.toLowerCase()) || project.leader.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !statusFilter || project.status === statusFilter
    const matchesPriority = !priorityFilter || project.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const formatDate = (dateString: string) => dateString ? new Date(dateString).toLocaleDateString("en-IN") : "—"

  const getPaymentStatus = (received: number, total: number) => {
    if (total === 0) return { text: "—", color: "text-gray-500" }
    const percentage = (received / total) * 100
    if (percentage === 0) return { text: "Pending", color: "text-yellow-400" }
    if (percentage === 100) return { text: "Paid", color: "text-emerald-400" }
    return { text: `${percentage.toFixed(0)}%`, color: "text-blue-400" }
  }

  if (loading) return (
    <LoadingSpinner />
  )

  if (!user) return null

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="max-w-7xl mx-auto sm:px-6 sm:py-6">
        <div className="bg-gray-950 border border-gray-800 rounded-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl text-white font-bold">Projects</h1>
              <p className="text-gray-400 text-sm">{filteredProjects.length} of {projects.length} projects</p>
            </div>
            <Button onClick={() => setDialogOpen(true)} className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" /> New Project
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-gray-900 border-gray-800 text-white pl-10" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white min-w-[150px]">
              <option value="">All Status</option>
              {Object.keys(THEME.status).map(status => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}
            </select>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white min-w-[150px]">
              <option value="">All Priority</option>
              {Object.keys(THEME.priority).map(priority => <option key={priority} value={priority}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</option>)}
            </select>
          </div>

          <div className="sm:border border-gray-800 rounded-lg overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr className="text-left text-sm text-gray-400">
                    <th className="px-4 py-3 font-medium">Project</th>
                    <th className="px-4 py-3 font-medium">Leader</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Priority</th>
                    <th className="px-4 py-3 font-medium">Progress</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Deadline</th>
                    <th className="px-4 py-3 font-medium">Payment</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredProjects.map((project) => {
                    const payment = getPaymentStatus(project.amount_received, project.finalized_amount)
                    const isOverdue = project.deadline && new Date(project.deadline) < new Date()
                    return (
                      <tr key={project.id} className="hover:bg-gray-900/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="max-w-[200px]">
                            <p className="text-white font-medium text-sm truncate">{project.title}</p>
                            <p className="text-gray-500 text-xs truncate">{project.description || "No description"}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm text-white">{project.leader}</p>
                            {project.contact && <p className="text-xs text-gray-500">{project.contact}</p>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${THEME.status[project.status]}`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${THEME.priority[project.priority]}`}>
                            {project.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 w-32">
                            <div className="w-20 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-red-600 h-full transition-all duration-300" style={{ width: `${project.progress}%` }} />
                            </div>
                            <span className="text-xs text-gray-400 w-8">{project.progress}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1 blur hover:blur-none transition-all duration-500 ease-in-out cursor-pointer">
                            <p className="text-sm text-white font-medium">₹{project.finalized_amount.toLocaleString("en-IN")}</p>
                            <p className="text-xs text-gray-500">₹{project.amount_received.toLocaleString("en-IN")} received</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className={`text-sm ${isOverdue ? "text-red-400" : "text-gray-400"} flex items-center gap-1`}>
                              <Calendar className="w-3 h-3 text-gray-500" />{formatDate(project.deadline)}</span>
                            {project.booking_date && <p className="text-xs text-gray-600">{project.booking_date}</p>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-medium ${payment.color}`}>{payment.text}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button size="sm" onClick={() => router.push(`/projects/${project.id}`)} className="bg-red-600 hover:bg-red-700">
                            <Edit className="w-3 h-3 mr-1" /> Edit
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4 ">
              {filteredProjects.map((project) => {
                const payment = getPaymentStatus(project.amount_received, project.finalized_amount)
                const isOverdue = project.deadline && new Date(project.deadline) < new Date()
                return (
                  <div key={project.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{project.title}</p>
                        <p className="text-gray-500 text-xs mt-1">{project.leader}</p>
                      </div>
                      <Button size="sm" onClick={() => router.push(`/projects/${project.id}`)} className="bg-red-600 hover:bg-red-700">
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${THEME.status[project.status]}`}>
                        {project.status}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${THEME.priority[project.priority]}`}>
                        {project.priority}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-gray-300">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-red-600 h-full transition-all duration-300" style={{ width: `${project.progress}%` }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div
                        className="blur hover:blur-none transition-all cursor-pointer"
                        onClick={(e) => e.currentTarget.classList.toggle('blur')}
                      >
                        <p className="text-gray-400 text-xs">Amount</p>
                        <p className="text-white font-medium">
                          ₹{project.finalized_amount.toLocaleString("en-IN")}
                        </p>
                        <p className="text-green-600 text-xs">
                          Received: ₹{project.amount_received?.toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-400 text-xs">Payment</p>
                        <p className={`font-medium ${payment.color}`}>{payment.text}</p>
                      </div>
                    </div>

                    <div className="flex  gap-1.5 text-sm flex-wrap flex-col">
                      <span className={`${isOverdue ? "text-red-400" : "text-gray-400"} flex items-center gap-1`}>

                        <Calendar className="w-3 h-3 text-gray-500" />
                        {formatDate(project.deadline)}</span>
                      <span className="text-gray-600 text-xs">Booked On: {formatDate(project.booking_date)}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {filteredProjects.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg mb-2">No projects found</p>
                <p className="text-gray-600 text-sm">
                  {projects.length === 0 ? "Get started by creating your first project" : "Try adjusting your filters"}
                </p>
                {projects.length === 0 && (
                  <Button onClick={() => setDialogOpen(true)} className="mt-4 bg-red-600 hover:bg-red-700">
                    <Plus className="w-4 h-4 mr-2" /> Create Your First Project
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <CreateProjectDialog userId={user.id} open={dialogOpen} onOpenChange={setDialogOpen} />
      </main>
    </div>
  )
}
