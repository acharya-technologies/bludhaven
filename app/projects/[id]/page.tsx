"use client"
import { toast } from 'sonner'
import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { LinkIcon, TrashIcon, ArrowLeft, Plus, Check, X, AlertTriangle, Lock, Unlock } from "lucide-react"
import { HashLoader } from "react-spinners"

// Types
interface User { id: string; email?: string }
interface Project {
  id: string; title: string; description: string; leader: string; contact: string;
  status: "enquiry" | "advance" | "delivered" | "archived";
  priority: "critical" | "high" | "medium" | "low";
  progress: number; estimated_hours: number; actual_hours: number;
  finalized_amount: number; amount_received: number;
  booking_date: string; deadline: string;
  tech_stack: string[]; resources: string[]; images: string[]; tags: string[];
  created_at: string; updated_at: string; user_id: string;
}
interface Installment {
  id: string; amount: number; due_date: string | null; description: string | null;
  status: "pending" | "paid" | "overdue"; paid_date: string | null; created_at: string;
}

// Theme Configuration
const THEME = {
  status: {
    enquiry: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    advance: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    archived: "bg-gray-500/10 text-gray-400 border-gray-500/20"
  },
  priority: {
    critical: "text-red-500", high: "text-orange-500", medium: "text-yellow-500", low: "text-emerald-500"
  },
  installment: {
    paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    overdue: "bg-red-500/10 text-red-400 border-red-500/30"
  }
}

const NUMERIC_FIELDS = ["progress", "estimated_hours", "actual_hours", "finalized_amount", "amount_received"]

// Utility Components
const LoadingSpinner = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <HashLoader color="#dc2626" />
  </div>
)

const UnauthorizedScreen = ({ message }: { message: string }) => (
  <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
    <div className="text-center space-y-6 max-w-md sm:max-w-screen">
      <div className="sm:text-8xl text-3xl animate-pulse">403 - Suspicious</div>
      <h1 className="text-xl sm:text-4xl font-bold text-red-500">{message}</h1>
      <p className="text-gray-400 text-md sm:text-lg" >You ain't got clearance for this shit, blud.</p>
      <Button
        onClick={() => window.location.href = "/projects"}
        className="bg-red-600 hover:bg-red-700"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects, fam
      </Button>
    </div>
  </div>
)

const FormField = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div className="w-full">
    <label className="block text-sm font-medium text-gray-300 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
)

const ArrayInput = ({ value, items, placeholder, buttonText, buttonColor, tagColor, onAdd, onRemove, onChange, disabled = false }: {
  value: string; items: string[]; placeholder: string; buttonText: string; buttonColor: string; tagColor: string;
  onAdd: () => void; onRemove: (index: number) => void; onChange: (value: string) => void; disabled?: boolean
}) => (
  <div className="w-full">
    <div className="flex flex-col sm:flex-row gap-2 mb-3">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), onAdd())}
        className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 flex-1 min-w-0"
        placeholder={placeholder}
        disabled={disabled}
      />
      <Button type="button" onClick={onAdd} className={`${buttonColor} shrink-0 w-full sm:w-auto`} disabled={disabled}>
        <Plus className="w-4 h-4 mr-1" /> {buttonText}
      </Button>
    </div>
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span key={i} className={`flex items-center gap-2 px-3 py-1.5 ${tagColor} rounded-lg text-sm font-medium`}>
          {item}
          {!disabled && (
            <button type="button" onClick={() => onRemove(i)} className="hover:text-red-400 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </span>
      ))}
    </div>
  </div>
)

const ProgressBar = ({ value, color = "bg-red-600" }: { value: number; color?: string }) => (
  <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
    <div className={`${color} h-full transition-all duration-500 ease-out`} style={{ width: `${Math.min(100, value)}%` }} />
  </div>
)

// Delete Project Dialog
const DeleteProjectDialog = ({ project, open, onOpenChange, onDelete }: {
  project: Project; open: boolean; onOpenChange: (open: boolean) => void; onDelete: () => void
}) => {
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (password !== process.env.NEXT_PUBLIC_SECRET_REVENUE_CODE) {
      toast.error("Incorrect password")
      return
    }
    setLoading(true)
    try {
      await onDelete()
      onOpenChange(false)
    } catch (err) {
      toast.error("Failed to delete project")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-950 border-gray-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />Delete Project
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm font-medium">Project: {project.title}</p>
            <p className="text-red-400/80 text-xs mt-1">Leader: {project.leader}</p>
          </div>
          <FormField label="Enter password to confirm deletion" required>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password to confirm"
              className="bg-gray-900 border-gray-700 text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleDelete()}
            />
          </FormField>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-900 w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={loading || password !== process.env.NEXT_PUBLIC_SECRET_REVENUE_CODE}
            className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
          >
            {loading ? "Deleting..." : "Delete Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Main Form Component
const ProjectForm = ({ project, onUpdate, loading: globalLoading, disabled = false }: {
  project: Project;
  onUpdate: (project: Project) => void;
  loading: boolean;
  disabled?: boolean;
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Project>(project)
  const [inputs, setInputs] = useState({ tech: "", tag: "", resource: "", image: "" })

  useEffect(() => {
    setFormData(project)
  }, [project])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (disabled) return
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: NUMERIC_FIELDS.includes(name) ? (parseFloat(value) || 0) : value
    }))
  }, [disabled])

  const handleArrayAdd = useCallback((field: keyof Project, inputKey: keyof typeof inputs) => {
    if (disabled) return
    const value = inputs[inputKey].trim()
    const target = formData[field]

    if (Array.isArray(target) && value && !target.includes(value)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value]
      }))
      setInputs(prev => ({ ...prev, [inputKey]: "" }))
    }
  }, [disabled, inputs, formData])

  const handleArrayRemove = useCallback((field: keyof Project, index: number) => {
    if (disabled) return
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }))
  }, [disabled])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading || globalLoading || disabled) return

    setLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseClient()

      const updateData = {
        ...formData,
        tech_stack: formData.tech_stack || [],
        resources: formData.resources || [],
        images: formData.images || [],
        tags: formData.tags || [],
        booking_date: formData.booking_date || null,
        deadline: formData.deadline || null,
        updated_at: new Date().toISOString()
      }

      const { error: updateError } = await supabase
        .from("bludhaven_projects")
        .update(updateData)
        .eq("id", project.id)

      if (updateError) throw updateError

      onUpdate(formData)
      toast.success("Project updated successfully")
    } catch (err: any) {
      setError(err.message || "Failed to update project")
      toast.error("Failed to update project")
    } finally {
      setLoading(false)
    }
  }

  const receivedPercentage = useMemo(() => 
    formData.finalized_amount > 0 ? (formData.amount_received / formData.finalized_amount) * 100 : 0,
    [formData.finalized_amount, formData.amount_received]
  )

  const isDisabled = loading || globalLoading || disabled

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
          <X className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

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
              <FormField label="Project Title" required>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="bg-gray-900 border-gray-700 text-white"
                  disabled={isDisabled}
                />
              </FormField>

              <FormField label="Description">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white resize-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  disabled={isDisabled}
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Team Leader" required>
                  <Input
                    name="leader"
                    value={formData.leader}
                    onChange={handleChange}
                    required
                    className="bg-gray-900 border-gray-700 text-white"
                    disabled={isDisabled}
                  />
                </FormField>
                <FormField label="Contact">
                  <Input
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    className="bg-gray-900 border-gray-700 text-white"
                    disabled={isDisabled}
                  />
                </FormField>
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
              <FormField label="Tech Stack">
                <ArrayInput
                  value={inputs.tech}
                  items={formData.tech_stack || []}
                  placeholder="e.g., React, Node.js"
                  buttonText="Add"
                  buttonColor="bg-blue-600 hover:bg-blue-700"
                  tagColor="bg-blue-600/20 text-blue-400 border border-blue-600/30"
                  onAdd={() => handleArrayAdd("tech_stack", "tech")}
                  onRemove={(i) => handleArrayRemove("tech_stack", i)}
                  onChange={(v) => setInputs(prev => ({ ...prev, tech: v }))}
                  disabled={isDisabled}
                />
              </FormField>

              <FormField label="Tags">
                <ArrayInput
                  value={inputs.tag}
                  items={formData.tags || []}
                  placeholder="e.g., Web, Mobile, API"
                  buttonText="Add"
                  buttonColor="bg-emerald-600 hover:bg-emerald-700"
                  tagColor="bg-emerald-600/20 text-emerald-400 border border-emerald-600/30"
                  onAdd={() => handleArrayAdd("tags", "tag")}
                  onRemove={(i) => handleArrayRemove("tags", i)}
                  onChange={(v) => setInputs(prev => ({ ...prev, tag: v }))}
                  disabled={isDisabled}
                />
              </FormField>
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
              <FormField label="Resources">
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      type="url"
                      value={inputs.resource}
                      onChange={(e) => setInputs(prev => ({ ...prev, resource: e.target.value }))}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleArrayAdd("resources", "resource"))}
                      placeholder="https://docs.example.com"
                      className="bg-gray-900 border-gray-700 text-white flex-1"
                      disabled={isDisabled}
                    />
                    <Button
                      type="button"
                      onClick={() => handleArrayAdd("resources", "resource")}
                      className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
                      disabled={isDisabled}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(formData.resources || []).map((url, i) => (
                      <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-gray-900 border border-gray-800 rounded-lg p-3 group hover:border-gray-700 transition-colors">
                        <div className="bg-purple-600 p-2 rounded-lg shrink-0">
                          <LinkIcon className="w-4 h-4" />
                        </div>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-blue-400 hover:text-blue-300 text-sm break-all sm:truncate"
                        >
                          {url}
                        </a>
                        {!isDisabled && (
                          <Button
                            type="button"
                            onClick={() => handleArrayRemove("resources", i)}
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0 transition-all"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </FormField>

              <FormField label="Images & Screenshots">
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      type="url"
                      value={inputs.image}
                      onChange={(e) => setInputs(prev => ({ ...prev, image: e.target.value }))}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleArrayAdd("images", "image"))}
                      placeholder="https://example.com/image.jpg"
                      className="bg-gray-900 border-gray-700 text-white flex-1"
                      disabled={isDisabled}
                    />
                    <Button
                      type="button"
                      onClick={() => handleArrayAdd("images", "image")}
                      className="bg-pink-600 hover:bg-pink-700 w-full sm:w-auto"
                      disabled={isDisabled}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(formData.images || []).map((url, i) => (
                      <div key={i} className="relative group bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors">
                        <div className="aspect-video bg-gray-800 relative overflow-hidden">
                          <img src={url} alt={`Project ${i + 1}`} className="w-full h-full object-cover" />
                          {!isDisabled && (
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button
                                type="button"
                                onClick={() => handleArrayRemove("images", i)}
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                              >
                                <TrashIcon className="w-4 h-4 mr-2" /> Remove
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="p-2 bg-gray-900/50">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:text-blue-300 truncate block"
                          >
                            View Original
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FormField>
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
              <FormField label="Status">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  disabled={isDisabled}
                >
                  <option value="enquiry">Enquiry</option>
                  <option value="advance">Advance</option>
                  <option value="delivered">Delivered</option>
                  <option value="archived">Archived</option>
                </select>
              </FormField>

              <FormField label="Priority">
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  disabled={isDisabled}
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </FormField>

              <FormField label="Progress">
                <Input
                  type="number"
                  name="progress"
                  value={formData.progress}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="bg-gray-900 border-gray-700 text-white mb-2"
                  disabled={isDisabled}
                />
                <div className="w-full">
                  <ProgressBar value={formData.progress} />
                </div>
              </FormField>
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
              <FormField label="Finalized Amount (₹)">
                <Input
                  type="number"
                  name="finalized_amount"
                  value={formData.finalized_amount}
                  onChange={handleChange}
                  step="0.01"
                  className="bg-gray-900 border-gray-700 text-white"
                  disabled={isDisabled}
                />
              </FormField>

              <FormField label="Amount Received (₹)">
                <Input
                  type="number"
                  name="amount_received"
                  value={formData.amount_received}
                  onChange={handleChange}
                  step="0.01"
                  className="bg-gray-900 border-gray-700 text-white"
                  readOnly
                />
              </FormField>

              {formData.finalized_amount > 0 && (
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
              <FormField label="Booking Date">
                <Input
                  type="date"
                  name="booking_date"
                  value={formData.booking_date || ""}
                  onChange={handleChange}
                  className="bg-gray-900 border-gray-700 text-white"
                  disabled={isDisabled}
                />
              </FormField>

              <FormField label="Deadline">
                <Input
                  type="date"
                  name="deadline"
                  value={formData.deadline || ""}
                  onChange={handleChange}
                  className="bg-gray-900 border-gray-700 text-white"
                  disabled={isDisabled}
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Est. Hours">
                  <Input
                    type="number"
                    name="estimated_hours"
                    value={formData.estimated_hours}
                    onChange={handleChange}
                    className="bg-gray-900 border-gray-700 text-white"
                    disabled={isDisabled}
                  />
                </FormField>
                <FormField label="Actual Hours">
                  <Input
                    type="number"
                    name="actual_hours"
                    value={formData.actual_hours}
                    onChange={handleChange}
                    className="bg-gray-900 border-gray-700 text-white"
                    disabled={isDisabled}
                  />
                </FormField>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-800">
        <Button type="submit" disabled={isDisabled} className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
          {loading ? "Saving..." : "Update Project"}
        </Button>
        <Button
          type="button"
          onClick={() => window.history.back()}
          variant="outline"
          className="border-gray-700 text-gray-300 hover:bg-gray-900 w-full sm:w-auto"
          disabled={isDisabled}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

// Installments Component
const InstallmentsList = ({ projectId, userId, installments: initialInstallments, onInstallmentUpdate, disabled = false }: {
  projectId: string; userId: string; installments: Installment[]; onInstallmentUpdate: () => void; disabled?: boolean
}) => {
  const [installments, setInstallments] = useState<Installment[]>(initialInstallments)
  const [showForm, setShowForm] = useState(false)
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({})
  const [formData, setFormData] = useState({ amount: "", due_date: "", description: "" })

  useEffect(() => {
    setInstallments(initialInstallments)
  }, [initialInstallments])

  const refreshInstallments = useCallback(async () => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from("bludhaven_installments")
        .select("*")
        .eq("project_id", projectId)
        .eq("user_id", userId)
        .order("due_date", { ascending: true })

      if (error) throw error
      if (data) setInstallments(data as Installment[])
    } catch (err) {
      toast.error("Failed to refresh installments")
    }
  }, [projectId, userId])

  const updateProjectAmount = useCallback(async (amount: number) => {
    try {
      const supabase = getSupabaseClient()
      const { data: projectData } = await supabase
        .from("bludhaven_projects")
        .select("amount_received")
        .eq("user_id", userId)
        .eq("id", projectId)
        .single()

      if (!projectData) throw new Error("Project not found")

      const newAmountReceived = (projectData.amount_received || 0) + amount
      const { error } = await supabase
        .from("bludhaven_projects")
        .update({ amount_received: newAmountReceived })
        .eq("id", projectId)

      if (error) throw error
      onInstallmentUpdate()
    } catch (err: any) {
      throw err
    }
  }, [projectId, userId, onInstallmentUpdate])

  const handleAddInstallment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loadingStates.add || disabled) return

    setLoadingStates(prev => ({ ...prev, add: true }))

    try {
      const amount = parseFloat(formData.amount)
      if (isNaN(amount) || amount <= 0) throw new Error("Invalid amount")

      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from("bludhaven_installments")
        .insert([{
          project_id: projectId,
          user_id: userId,
          amount,
          due_date: formData.due_date || null,
          description: formData.description || null,
          status: "pending"
        }])

      if (error) throw error

      setFormData({ amount: "", due_date: "", description: "" })
      setShowForm(false)
      await refreshInstallments()
      toast.success("Installment added successfully")
    } catch (err: any) {
      toast.error(err.message || "Failed to add installment")
    } finally {
      setLoadingStates(prev => ({ ...prev, add: false }))
    }
  }

  const handleMarkPaid = useCallback(async (installmentId: string, amount: number) => {
    if (loadingStates[installmentId] || disabled) return

    setLoadingStates(prev => ({ ...prev, [installmentId]: true }))

    try {
      const supabase = getSupabaseClient()
      const { error: updateError } = await supabase
        .from("bludhaven_installments")
        .update({
          status: "paid",
          paid_date: new Date().toISOString().split("T")[0]
        })
        .eq("id", installmentId)
        .eq("user_id", userId)

      if (updateError) throw updateError

      await updateProjectAmount(amount)
      await refreshInstallments()
      toast.success("Installment marked as paid")
    } catch (err: any) {
      toast.error(err.message || "Failed to update installment")
    } finally {
      setLoadingStates(prev => ({ ...prev, [installmentId]: false }))
    }
  }, [loadingStates, userId, refreshInstallments, updateProjectAmount, disabled])

  const handleDeleteInstallment = useCallback(async (installmentId: string, amount: number, status: string) => {
    if (loadingStates[`delete-${installmentId}`] || disabled) return
    if (!confirm("Are you sure you want to delete this installment?")) return
    setLoadingStates(prev => ({ ...prev, [`delete-${installmentId}`]: true }))

    try {
      const supabase = getSupabaseClient()

      if (status === "paid") {
        const { data: projectData } = await supabase
          .from("bludhaven_projects")
          .select("amount_received")
          .eq("id", projectId)
          .single()

        if (projectData) {
          const newAmountReceived = Math.max(0, (projectData.amount_received || 0) - amount)
          await supabase
            .from("bludhaven_projects")
            .update({ amount_received: newAmountReceived })
            .eq("id", projectId)
        }
      }

      const { error } = await supabase
        .from("bludhaven_installments")
        .delete()
        .eq("id", installmentId)
        .eq("user_id", userId)

      if (error) throw error

      await refreshInstallments()
      onInstallmentUpdate()
      toast.success("Installment deleted successfully")
    } catch (err: any) {
      toast.error(err.message || "Failed to delete installment")
    } finally {
      setLoadingStates(prev => ({ ...prev, [`delete-${installmentId}`]: false }))
    }
  }, [loadingStates, projectId, userId, refreshInstallments, onInstallmentUpdate, disabled])

  const formatDate = useCallback((dateString: string | null) =>
    dateString ? new Date(dateString).toLocaleDateString() : "", [])

  const isOverdue = useCallback((inst: Installment) =>
    inst.status === "paid" || !inst.due_date ? false : new Date(inst.due_date) < new Date(), [])

  const updatedInstallments = useMemo(() => 
    installments.map(inst =>
      inst.status === "pending" && isOverdue(inst) ? { ...inst, status: "overdue" as const } : inst
    ), [installments, isOverdue])

  const { totalAmount, paidAmount } = useMemo(() => ({
    totalAmount: updatedInstallments.reduce((sum, inst) => sum + inst.amount, 0),
    paidAmount: updatedInstallments
      .filter(inst => inst.status === "paid")
      .reduce((sum, inst) => sum + inst.amount, 0)
  }), [updatedInstallments])

  return (
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
          <Button
            onClick={() => setShowForm(!showForm)}
            disabled={loadingStates.add || disabled}
            className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
          >
            {showForm ? <><X className="w-4 h-4 mr-1" /> Cancel</> : <><Plus className="w-4 h-4 mr-1" /> Add Installment</>}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {showForm && (
          <form onSubmit={handleAddInstallment} className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField label="Amount" required>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  disabled={loadingStates.add || disabled}
                  placeholder="0.00"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </FormField>
              <FormField label="Due Date">
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  disabled={loadingStates.add || disabled}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </FormField>
              <FormField label="Description">
                <Input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={loadingStates.add || disabled}
                  placeholder="Optional"
                  maxLength={100}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </FormField>
            </div>
            <Button
              type="submit"
              disabled={loadingStates.add || !formData.amount || disabled}
              className="bg-red-600 hover:bg-red-700 w-full"
            >
              {loadingStates.add ? "Adding..." : "Add Installment"}
            </Button>
          </form>
        )}

        <div className="space-y-3">
          {updatedInstallments.length > 0 ? updatedInstallments.map((inst) => (
            <div key={inst.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
                    <span className="text-xl font-bold text-white">₹{inst.amount.toFixed(2)}</span>
                    <span className={`text-xs px-3 py-1 rounded-full border font-medium w-fit ${THEME.installment[inst.status]}`}>
                      {inst.status.toUpperCase()}
                    </span>
                  </div>
                  {inst.description && <p className="text-sm text-gray-400">{inst.description}</p>}
                  <div className="flex flex-wrap gap-3 text-xs">
                    {inst.due_date && (
                      <span className={isOverdue(inst) ? "text-red-400" : "text-gray-500"}>
                        Due: {formatDate(inst.due_date)}
                      </span>
                    )}
                    {inst.paid_date && (
                      <span className="text-emerald-400">Paid: {formatDate(inst.paid_date)}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  {inst.status !== "paid" && (
                    <Button
                      onClick={() => handleMarkPaid(inst.id, inst.amount)}
                      disabled={loadingStates[inst.id] || disabled}
                      className="bg-emerald-600 hover:bg-emerald-700 text-sm"
                    >
                      {loadingStates[inst.id] ? "Updating..." : <><Check className="w-4 h-4 mr-1" /> Mark Paid</>}
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDeleteInstallment(inst.id, inst.amount, inst.status)}
                    disabled={loadingStates[`delete-${inst.id}`] || disabled}
                    variant="outline"
                    className="border-red-600 text-red-400 hover:bg-red-600/10 text-sm"
                  >
                    {loadingStates[`delete-${inst.id}`] ? "Deleting..." : <TrashIcon className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-8 text-gray-500">
              <p>No installments added yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Main Component
export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [installments, setInstallments] = useState<Installment[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [globalDisable, setGlobalDisable] = useState(true)
  const [unauthorized, setUnauthorized] = useState<string | null>(null)

  // Funny unauthorized messages
 const unauthorizedMessages = [
  "Yo my nigga, what you tryna pull? 😂",
  "Nigga, this ain't yo shit! 💀",
  "Bruh moment, my nigga 🤨",
  "Sneaky ass nigga... nah fam 🚫",
  "Homie, you lost or sumn, my nigga? 🗿",
  "Nice try detective, my nigga 🕵️ Access denied!",
  "Wrong hood, my nigga 🏴‍☠️"
]

  const fetchData = useCallback(async (userId: string) => {
    try {
      const supabase = getSupabaseClient()
      
      // Single optimized query with both project and installments
      const [projectResult, installmentsResult] = await Promise.all([
        supabase
          .from("bludhaven_projects")
          .select("*")
          .eq("id", projectId)
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("bludhaven_installments")
          .select("*")
          .eq("project_id", projectId)
          .eq("user_id", userId)
          .order("due_date", { ascending: true })
      ])

      if (projectResult.error || !projectResult.data) {
        const randomMsg = unauthorizedMessages[Math.floor(Math.random() * unauthorizedMessages.length)]
        setUnauthorized(randomMsg)
        setLoading(false)
        return
      }

      setProject(projectResult.data as Project)
      setInstallments(installmentsResult.data || [])
      setLoading(false)
    } catch (error) {
      setUnauthorized("Something went wrong... maybe stop snooping? 👀")
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    const initialize = async () => {
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUser(user)

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(projectId)) {
        setUnauthorized("That's not even a valid project ID bruh 🤦")
        setLoading(false)
        return
      }

      await fetchData(user.id)

      // Real-time subscriptions (only if authorized)
      const projectSubscription = supabase
        .channel("project-changes")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "bludhaven_projects", filter: `id=eq.${projectId}` },
          (payload: { new: Project }) => {
            if (payload.new.user_id === user.id) {
              setProject(payload.new as Project)
            }
          }
        )
        .subscribe()

      const installmentsSubscription = supabase
        .channel("installments-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "bludhaven_installments", filter: `project_id=eq.${projectId}` },
          async () => {
            const { data } = await supabase
              .from("bludhaven_installments")
              .select("*")
              .eq("project_id", projectId)
              .eq("user_id", user.id)
              .order("due_date", { ascending: true })
            
            if (data) setInstallments(data)
            
            // Refresh project to update amount_received
            const { data: projectData } = await supabase
              .from("bludhaven_projects")
              .select("*")
              .eq("id", projectId)
              .eq("user_id", user.id)
              .maybeSingle()
            
            if (projectData) setProject(projectData as Project)
          }
        )
        .subscribe()

      return () => {
        projectSubscription.unsubscribe()
        installmentsSubscription.unsubscribe()
      }
    }

    initialize()
  }, [router, projectId, fetchData])

  const handleProjectUpdate = useCallback((updatedProject: Project) => {
    setProject(updatedProject)
  }, [])

  const handleInstallmentUpdate = useCallback(async () => {
    if (!user) return
    
    const supabase = getSupabaseClient()
    const { data: projectData } = await supabase
      .from("bludhaven_projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .maybeSingle()
    
    if (projectData) setProject(projectData as Project)
  }, [projectId, user])

  const handleDeleteProject = async () => {
    if (!user) return
    
    setDeleteLoading(true)
    try {
      const supabase = getSupabaseClient()
      
      // Delete installments first, then project
      const { error: installmentsError } = await supabase
        .from("bludhaven_installments")
        .delete()
        .eq("project_id", projectId)
        .eq("user_id", user.id)

      if (installmentsError) throw installmentsError

      const { error: projectError } = await supabase
        .from("bludhaven_projects")
        .delete()
        .eq("id", projectId)
        .eq("user_id", user.id)

      if (projectError) throw projectError

      toast.success("Project deleted successfully")
      router.push("/projects")
    } catch (err: any) {
      toast.error("Failed to delete project")
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (unauthorized) return <UnauthorizedScreen message={unauthorized} />
  if (!project || !user) return null

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-black/95 backdrop-blur-lg border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Button
                onClick={() => router.push("/projects")}
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
              {globalDisable ? <Lock className="w-4 h-4 text-red-400" /> : <Unlock className="w-4 h-4 text-green-400" />}
              <span className="text-xs text-gray-300 hidden sm:inline">Edit</span>
              <Switch
                checked={!globalDisable}
                onCheckedChange={(checked: boolean) => {
                  if (!checked) {
                    setGlobalDisable(true)
                  } else {
                    const pass = prompt("Enter password to enable editing:")
                    if (pass === process.env.NEXT_PUBLIC_SECRET_REVENUE_CODE) {
                      setGlobalDisable(false)
                      toast.success("Edit mode enabled")
                    } else {
                      toast.error("Incorrect password")
                    }
                  }
                }}
                className="data-[state=checked]:bg-red-600 scale-90"
              />
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6 lg:py-8 w-full overflow-x-hidden">
        {globalDisable && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-400">
              <Lock className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">Read-only Mode</span>
            </div>
            <p className="text-yellow-400/80 text-sm mt-1">
              Toggle "Edit Mode" in the header to enable editing
            </p>
          </div>
        )}

        <ProjectForm
          project={project}
          onUpdate={handleProjectUpdate}
          loading={deleteLoading}
          disabled={globalDisable}
        />

        <div className="mt-8">
          <InstallmentsList
            projectId={projectId}
            userId={user.id}
            installments={installments}
            onInstallmentUpdate={handleInstallmentUpdate}
            disabled={globalDisable}
          />
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <Card className="bg-gray-950 border-red-800/50">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">Danger Zone</h3>
                  <p className="text-gray-400 text-sm">
                    Once you delete a project, there is no going back. Please be certain.
                  </p>
                </div>
                <Button
                  onClick={() => setDeleteDialogOpen(true)}
                  variant="outline"
                  className="border-red-600 text-red-400 hover:bg-red-600/10 hover:text-red-300 transition-colors whitespace-nowrap w-full lg:w-auto"
                  disabled={deleteLoading}
                >
                  <TrashIcon className="w-4 h-4 mr-2" />Delete Project
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <DeleteProjectDialog
          project={project}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onDelete={handleDeleteProject}
        />
      </main>
    </div>
  )
}