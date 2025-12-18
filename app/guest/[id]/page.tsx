"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, Lock, Shield, LinkIcon, Eye, Clock, DollarSign } from "lucide-react"
import { GiBatwingEmblem } from "react-icons/gi"
import { HashLoader } from "react-spinners"

interface Project {
  id: string
  title: string
  description: string
  leader: string
  contact: string
  status: "enquiry" | "advance" | "delivered" | "archived"
  priority: "critical" | "high" | "medium" | "low"
  progress: number
  estimated_hours: number
  actual_hours: number
  finalized_amount: number
  amount_received: number
  booking_date: string
  deadline: string
  tech_stack: string[]
  resources: string[]
  images: string[]
  tags: string[]
  created_at: string
  updated_at: string
}

interface Installment {
  id: string
  amount: number
  due_date: string | null
  description: string | null
  status: "pending" | "paid" | "overdue"
  paid_date: string | null
  created_at: string
}

const THEME = {
  status: {
    enquiry: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    advance: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    archived: "bg-gray-500/10 text-gray-400 border-gray-500/20"
  },
  priority: {
    critical: "bg-red-500/10 text-red-400 border-red-500/20",
    high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
  },
  installment: {
    paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    overdue: "bg-red-500/10 text-red-400 border-red-500/30"
  }
}

const LoadingSpinner = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <HashLoader color="#dc2626" />
  </div>
)

const UnauthorizedScreen = () => (
  <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
    <div className="text-center space-y-6 max-w-md">
      <div className="text-4xl animate-pulse">🔒</div>
      <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
      <p className="text-gray-400">You don't have permission to view this project</p>
      <Button
        onClick={() => window.location.href = "/guest"}
        className="bg-red-600 hover:bg-red-700"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Search
      </Button>
    </div>
  </div>
)

const ProgressBar = ({ value, color = "bg-red-600" }: { value: number; color?: string }) => (
  <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
    <div className={`${color} h-full transition-all duration-500 ease-out`} style={{ width: `${Math.min(100, value)}%` }} />
  </div>
)

const InfoField = ({ label, value, icon: Icon }: { label: string; value: string | number; icon?: any }) => (
  <div className="space-y-2">
    <p className="text-sm text-gray-400 flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </p>
    <p className="text-white font-medium">{value || "—"}</p>
  </div>
)

const ArrayDisplay = ({ items, label, color = "bg-blue-600/20 text-blue-400 border-blue-600/30" }: {
  items: string[]
  label: string
  color?: string
}) => (
  <div className="space-y-3">
    <p className="text-sm text-gray-400">{label}</p>
    <div className="flex flex-wrap gap-2">
      {items?.map((item, index) => (
        <span key={index} className={`px-3 py-1.5 ${color} rounded-lg text-sm font-medium`}>
          {item}
        </span>
      ))}
      {(!items || items.length === 0) && (
        <span className="text-gray-500 text-sm">No {label.toLowerCase()}</span>
      )}
    </div>
  </div>
)

export default function GuestProjectViewPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [installments, setInstallments] = useState<Installment[]>([])
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = getSupabaseClient()

        const [projectResult, installmentsResult] = await Promise.all([
          supabase
            .from("bludhaven_projects")
            .select("*")
            .eq("id", projectId)
            .single(),
          supabase
            .from("bludhaven_installments")
            .select("*")
            .eq("project_id", projectId)
            .order("due_date", { ascending: true })
        ])

        if (projectResult.error || !projectResult.data) {
          setUnauthorized(true)
          return
        }

        setProject(projectResult.data as Project)
        setInstallments(installmentsResult.data || [])
      } catch (error) {
        setUnauthorized(true)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [projectId])

  const formatDate = (dateString: string) =>
    dateString ? new Date(dateString).toLocaleDateString("en-IN") : "—"

  const getPaymentStatus = (received: number, total: number) => {
    if (total === 0) return { text: "—", color: "text-gray-500" }
    const percentage = (received / total) * 100
    if (percentage === 0) return { text: "Pending", color: "text-yellow-400" }
    if (percentage === 100) return { text: "Paid", color: "text-emerald-400" }
    return { text: `${percentage.toFixed(0)}% Paid`, color: "text-blue-400" }
  }

  const receivedPercentage = useMemo(() =>
    project && project.finalized_amount > 0 ? (project.amount_received / project.finalized_amount) * 100 : 0,
    [project?.finalized_amount, project?.amount_received]
  )

  const isOverdue = project?.deadline && new Date(project.deadline) < new Date()

  const { totalAmount, paidAmount } = useMemo(() => ({
    totalAmount: installments.reduce((sum, inst) => sum + inst.amount, 0),
    paidAmount: installments
      .filter(inst => inst.status === "paid")
      .reduce((sum, inst) => sum + inst.amount, 0)
  }), [installments])

  if (loading) return <LoadingSpinner />
  if (unauthorized || !project) return <UnauthorizedScreen />

  const paymentStatus = getPaymentStatus(project.amount_received, project.finalized_amount)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-black" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-600/5 rounded-full blur-xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-red-800/5 rounded-full blur-xl" />
      </div>

      {/* Sticky Header */}
      <div className="sticky top-0 bg-black/95 backdrop-blur-lg border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Button
                onClick={() => router.push("/guest")}
                variant="outline"
                size="sm"
                className="border-gray-700 text-gray-300 hover:bg-gray-900 shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent truncate">
                Project Details
              </h1>
            </div>

            <div className="flex items-center gap-2 bg-gray-900/50 rounded-lg px-3 py-1.5 border border-gray-800 shrink-0">
              <Lock className="w-4 h-4 text-red-400" />
              <span className="text-xs text-gray-300 hidden sm:inline">Read Only</span>
            </div>
          </div>
        </div>
      </div>

      <main className="relative max-w-7xl mx-auto px-4 py-6 lg:py-8 w-full overflow-x-hidden">
        {/* Read-only Notice */}
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-400">
            <Lock className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium">Read-only Mode</span>
          </div>
          <p className="text-yellow-400/80 text-sm mt-1">
            Guest access - viewing only. No modifications allowed.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card className="bg-gray-950 border-gray-800 w-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
                  <div className="w-1 h-4 sm:h-6 bg-red-600 rounded-full" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoField label="Project Title" value={project.title} />

                <div>
                  <p className="text-sm text-gray-400 mb-2">Description</p>
                  <p className="text-white leading-relaxed bg-gray-900/50 border border-gray-800 rounded-lg p-3 min-h-[80px]">
                    {project.description || "No description provided"}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoField label="Team Leader" value={project.leader} />
                </div>
              </CardContent>
            </Card>

            {/* Tech & Tags */}
            <Card className="bg-gray-950 border-gray-800 w-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
                  <div className="w-1 h-4 sm:h-6 bg-red-600 rounded-full" />
                  Technology & Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <ArrayDisplay
                  items={project.tech_stack || []}
                  label="Tech Stack"
                  color="bg-blue-600/20 text-blue-400 border-blue-600/30"
                />

                <ArrayDisplay
                  items={project.tags || []}
                  label="Tags"
                  color="bg-emerald-600/20 text-emerald-400 border-emerald-600/30"
                />
              </CardContent>
            </Card>

            {/* Links & Media */}
            <Card className="bg-gray-950 border-gray-800 w-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
                  <div className="w-1 h-4 sm:h-6 bg-red-600 rounded-full" />
                  Resources & Media
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Resources */}
                <div className="space-y-3">
                  <p className="text-sm text-gray-400">Resources</p>
                  <div className="space-y-2">
                    {(project.resources || []).map((url, i) => (
                      <div key={i} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-lg p-3 group">
                        <div className="bg-purple-600 p-2 rounded-lg shrink-0">
                          <LinkIcon className="w-4 h-4" />
                        </div>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-blue-400 hover:text-blue-300 text-sm break-all"
                        >
                          {url}
                        </a>
                        <Eye className="w-4 h-4 text-gray-500" />
                      </div>
                    ))}
                    {(!project.resources || project.resources.length === 0) && (
                      <p className="text-gray-500 text-sm p-3">No resources added</p>
                    )}
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-3">
                  <p className="text-sm text-gray-400">Images & Screenshots</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(project.images || []).map((url, i) => (
                      <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                        <div className="aspect-video bg-gray-800">
                          <img
                            src={url}
                            alt={`Project image ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3 flex justify-between items-center">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:text-blue-300"
                          >
                            View Original
                          </a>
                          <Eye className="w-4 h-4 text-gray-500" />
                        </div>
                      </div>
                    ))}
                    {(!project.images || project.images.length === 0) && (
                      <p className="text-gray-500 text-sm col-span-2 p-4 text-center">No images added</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Status */}
            <Card className="bg-gray-950 border-gray-800 w-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
                  <div className="w-1 h-4 sm:h-6 bg-red-600 rounded-full" />
                  Project Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Status</p>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${THEME.status[project.status]}`}>
                    {project.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Priority</p>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${THEME.priority[project.priority]}`}>
                    {project.priority}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white font-medium">{project.progress}%</span>
                  </div>
                  <ProgressBar value={project.progress} />
                </div>
              </CardContent>
            </Card>

            {/* Financials */}
            <Card className="bg-gray-950 border-gray-800 w-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
                  <div className="w-1 h-4 sm:h-6 bg-red-600 rounded-full" />
                  Financial Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoField
                  label="Finalized Amount"
                  value={`₹${project.finalized_amount.toLocaleString("en-IN")}`}
                  icon={DollarSign}
                />

                <InfoField
                  label="Amount Received"
                  value={`₹${project.amount_received.toLocaleString("en-IN")}`}
                  icon={DollarSign}
                />

                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Payment Status</p>
                  <p className={`font-medium ${paymentStatus.color}`}>
                    {paymentStatus.text}
                  </p>
                </div>

                {project.finalized_amount > 0 && (
                  <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Payment Received</span>
                      <span className="text-emerald-400 font-semibold">{receivedPercentage.toFixed(1)}%</span>
                    </div>
                    <ProgressBar value={receivedPercentage} color="bg-emerald-600" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="bg-gray-950 border-gray-800 w-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
                  <div className="w-1 h-4 sm:h-6 bg-red-600 rounded-full" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoField
                  label="Booking Date"
                  value={formatDate(project.booking_date)}
                  icon={Calendar}
                />
                <InfoField
                  label="Deadline"
                  value={`${formatDate(project.deadline) + (isOverdue ? " (Overdue)" : "")}`}
                  icon={Calendar}
                />
              

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoField
                    label="Est. Hours"
                    value={project.estimated_hours || 0}
                    icon={Clock}
                  />
                  <InfoField
                    label="Actual Hours"
                    value={project.actual_hours || 0}
                    icon={Clock}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Installments */}
        <div className="mt-8">
          <Card className="bg-gray-950 border-gray-800 w-full">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg mb-2">
                    <div className="w-1 h-4 sm:h-6 bg-red-600 rounded-full" />
                    Payment Installments
                  </CardTitle>
                  {totalAmount > 0 && (
                    <div className="flex flex-wrap gap-3 text-sm">
                      <span className="text-gray-400">
                        Total: <span className="text-white font-semibold">₹{totalAmount.toFixed(2)}</span>
                      </span>
                      <span className="text-gray-400">
                        Paid: <span className="text-emerald-400 font-semibold">₹{paidAmount.toFixed(2)}</span>
                      </span>
                      <span className="text-gray-400">
                        Pending: <span className="text-yellow-400 font-semibold">₹{(totalAmount - paidAmount).toFixed(2)}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3">
                {installments.length > 0 ? installments.map((inst) => {
                  const isInstOverdue = inst.status === "pending" && inst.due_date && new Date(inst.due_date) < new Date()
                  const status = isInstOverdue ? "overdue" : inst.status

                  return (
                    <div key={inst.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
                            <span className="text-xl font-bold text-white">₹{inst.amount.toFixed(2)}</span>
                            <span className={`text-xs px-3 py-1 rounded-full border font-medium w-fit ${THEME.installment[status]}`}>
                              {status.toUpperCase()}
                            </span>
                          </div>
                          {inst.description && <p className="text-sm text-gray-400">{inst.description}</p>}
                          <div className="flex flex-wrap gap-3 text-xs">
                            {inst.due_date && (
                              <span className={isInstOverdue ? "text-red-400" : "text-gray-500"}>
                                Due: {formatDate(inst.due_date)}
                              </span>
                            )}
                            {inst.paid_date && (
                              <span className="text-emerald-400">Paid: {formatDate(inst.paid_date)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                }) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No installments added yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Footer */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <Card className="bg-gray-950 border-red-800/50">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-red-400" />
                  <div>
                    <h3 className="text-white font-semibold text-lg">Secure Guest Access</h3>
                    <p className="text-gray-400 text-sm">
                      Read-only mode • All access is logged and monitored
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-red-900/20 border border-red-700/40 rounded-lg">
                  <GiBatwingEmblem className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-300">Secured by Red Hood</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}