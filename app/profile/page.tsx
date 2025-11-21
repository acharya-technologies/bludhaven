"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Edit3, 
  Save, 
  X, 
  LogOut,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  Target,
  ArrowLeft,
  ChevronDown
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { HashLoader } from "react-spinners"

interface UserProfile {
  id: string
  email: string
  user_metadata?: {
    name?: string
    full_name?: string
    avatar_url?: string
    user_type?: string
  }
  created_at: string
}

interface Profile {
  id: string
  name: string
  user_type: string
  email: string
}

export default function OperatorProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Edit states
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  
  // Change password states
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data: { user: authUser }, error } = await supabase.auth.getUser()
      
      if (error || !authUser) {
        router.push("/auth/login")
        return
      }

      // Fetch profile from profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, name, user_type, email')
        .eq('id', authUser.id)
        .single()

      const userProfile: UserProfile = {
        id: authUser.id,
        email: authUser.email!,
        user_metadata: authUser.user_metadata || {},
        created_at: authUser.created_at
      }

      setUser(userProfile)
      setProfile(profileData)
      setFullName(profileData?.name || authUser.user_metadata?.full_name || "")
      setEmail(authUser.email || "")
    } catch (err) {
      setError("Failed to load operator profile")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const supabase = getSupabaseClient()
      
      // Update auth user
      const { error: authError } = await supabase.auth.updateUser({
        email: email.trim(),
        data: { full_name: fullName.trim() }
      })

      if (authError) throw authError

      // Update profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          name: fullName.trim(),
          email: email.trim()
        })
        .eq('id', user!.id)

      if (profileError) throw profileError

      setSuccess("Operator profile updated successfully")
      setIsEditing(false)
      await fetchUserProfile() // Refresh user data
    } catch (err: any) {
      setError(`Update failed: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      setError("New encryption keys do not match")
      return
    }

    if (newPassword.length < 8) {
      setError("Encryption key too weak. Minimum 8 characters.")
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      setSuccess("Encryption key updated successfully")
      setIsChangingPassword(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      setError(`Key update failed: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const getUserName = () => {
    return profile?.name || 
           user?.user_metadata?.name || 
           user?.user_metadata?.full_name || 
           user?.email?.split('@')[0] || 
           "Operator"
  }

  const getUserRole = () => {
    return profile?.user_type || 
           user?.user_metadata?.user_type || 
           "operator"
  }

  const passwordStrength = newPassword.length >= 12 ? "STRONG" : newPassword.length >= 8 ? "GOOD" : "WEAK"

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <HashLoader color="#dc2626"/>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="p-4 bg-red-600/10 border border-red-600/30 rounded-lg">
            <p className="text-red-400">Operator not authenticated</p>
            <Button 
              onClick={() => router.push("/auth/login")}
              className="mt-4 bg-red-600 hover:bg-red-700"
            >
              Return to Command Center
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* BLUDHAVEN-themed background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1),transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(220,38,38,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.1)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

      {/* Animated elements */}
      <div className="absolute top-20 left-20 w-48 h-48 bg-red-900/10 rounded-full blur-2xl animate-float-slow" />
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-red-800/10 rounded-full blur-2xl animate-float-medium" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-600/10 to-red-900/20 rounded-full border border-red-600/30 mb-4 group hover:border-red-500/60 transition-all duration-300"
          >
            {user.user_metadata?.avatar_url ? (
              <img 
                src={user.user_metadata.avatar_url} 
                alt="Operator" 
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-red-400 group-hover:scale-110 transition-transform duration-300" />
            )}
          </motion.div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
            OPERATOR PROFILE
          </h1>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/5 border border-red-600/20 mb-3">
            <Shield className="w-3 h-3 text-red-400" />
            <span className="text-xs text-red-400 uppercase tracking-widest">{getUserRole()}</span>
          </div>
          <p className="text-xs text-gray-500">Manage your operator identity and security</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-950/80 border border-gray-800 rounded-xl p-6 backdrop-blur-sm relative group hover:border-red-600/30 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="inline-flex items-center gap-2">
              <Target className="w-4 h-4 text-red-400" />
              <h2 className="text-lg font-bold text-white">Operator Details</h2>
            </div>
            {!isEditing && !isChangingPassword && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="border-gray-700 text-gray-400 hover:border-red-600 hover:text-red-400"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </motion.div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {!isEditing && !isChangingPassword ? (
              <motion.div
                key="view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Profile Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-900/40 rounded-lg border border-gray-800 hover:border-red-600/30 transition-colors duration-300">
                    <User className="w-4 h-4 text-red-400" />
                    <div>
                      <p className="text-xs text-gray-500">Operator Name</p>
                      <p className="text-white text-sm font-medium">
                        {getUserName()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-900/40 rounded-lg border border-gray-800 hover:border-red-600/30 transition-colors duration-300">
                    <Mail className="w-4 h-4 text-red-400" />
                    <div>
                      <p className="text-xs text-gray-500">Contact</p>
                      <p className="text-white text-sm font-medium">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-900/40 rounded-lg border border-gray-800 hover:border-red-600/30 transition-colors duration-300">
                    <Calendar className="w-4 h-4 text-red-400" />
                    <div>
                      <p className="text-xs text-gray-500">Operator Since</p>
                      <p className="text-white text-sm font-medium">
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-900/40 rounded-lg border border-gray-800 hover:border-red-600/30 transition-colors duration-300">
                    <Shield className="w-4 h-4 text-red-400" />
                    <div>
                      <p className="text-xs text-gray-500">Operator ID</p>
                      <p className="text-white text-sm font-mono text-xs font-medium">
                        {user.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <Button
                      onClick={() => setIsChangingPassword(true)}
                      variant="outline"
                      className="w-full border-gray-700 text-gray-400 hover:border-red-600 hover:text-red-400"
                    >
                      <KeyRound className="w-4 h-4 mr-2" />
                      Change Key
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <Button
                      onClick={handleSignOut}
                      className="w-full bg-red-600/20 border border-red-600/30 text-red-400 hover:bg-red-600/30 hover:border-red-600/50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            ) : isChangingPassword ? (
              <motion.form
                key="change-password"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
                onSubmit={handleChangePassword}
              >
                <div className="space-y-3">
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Current encryption key"
                      className="bg-gray-900/60 border-gray-700 text-white placeholder:text-gray-500 text-sm h-10 focus:border-red-500 focus:ring-red-500/20 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-400 p-1 transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New encryption key"
                      className="bg-gray-900/60 border-gray-700 text-white placeholder:text-gray-500 text-sm h-10 focus:border-red-500 focus:ring-red-500/20 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-400 p-1 transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new key"
                      className="bg-gray-900/60 border-gray-700 text-white placeholder:text-gray-500 text-sm h-10 focus:border-red-500 focus:ring-red-500/20 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-400 p-1 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {newPassword && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-gray-500">Strength:</span>
                      <span className={`font-bold ${passwordStrength === "STRONG" ? "text-green-400" : passwordStrength === "GOOD" ? "text-yellow-400" : "text-red-400"}`}>
                        {passwordStrength}
                      </span>
                    </motion.div>
                  )}
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 bg-red-600/10 border border-red-600/30 rounded-lg flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <p className="text-sm text-red-400">{error}</p>
                    </motion.div>
                  )}

                  {success && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 bg-green-600/10 border border-green-600/30 rounded-lg flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4 text-green-500 shrink-0" />
                      <p className="text-sm text-green-400">{success}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-3">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsChangingPassword(false)
                        setError(null)
                        setSuccess(null)
                        setCurrentPassword("")
                        setNewPassword("")
                        setConfirmPassword("")
                      }}
                      className="w-full border-gray-700 text-gray-400 hover:border-red-600 hover:text-red-400"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <Button
                      type="submit"
                      disabled={saving || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      <span className="flex items-center justify-center gap-2 relative z-10">
                        {saving ? (
                          <> <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Updating... </>
                        ) : (
                          <> <KeyRound className="w-4 h-4" /> Update Key </>
                        )}
                      </span>
                    </Button>
                  </motion.div>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="edit-profile"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
                onSubmit={handleUpdateProfile}
              >
                <div className="space-y-3">
                  <div className="relative">
                    <Input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Operator name"
                      className="bg-gray-900/60 border-gray-700 text-white placeholder:text-gray-500 text-sm h-10 focus:border-red-500 focus:ring-red-500/20"
                    />
                    <User className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>

                  <div className="relative">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Operator email"
                      className="bg-gray-900/60 border-gray-700 text-white placeholder:text-gray-500 text-sm h-10 focus:border-red-500 focus:ring-red-500/20"
                      required
                    />
                    <Mail className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 bg-red-600/10 border border-red-600/30 rounded-lg flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <p className="text-sm text-red-400">{error}</p>
                    </motion.div>
                  )}

                  {success && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 bg-green-600/10 border border-green-600/30 rounded-lg flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4 text-green-500 shrink-0" />
                      <p className="text-sm text-green-400">{success}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-3">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false)
                        setError(null)
                        setSuccess(null)
                        setFullName(profile?.name || user.user_metadata?.full_name || "")
                        setEmail(user.email || "")
                      }}
                      className="w-full border-gray-700 text-gray-400 hover:border-red-600 hover:text-red-400"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <Button
                      type="submit"
                      disabled={saving}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      <span className="flex items-center justify-center gap-2 relative z-10">
                        {saving ? (
                          <> <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving... </>
                        ) : (
                          <> <Save className="w-4 h-4" /> Save Profile </>
                        )}
                      </span>
                    </Button>
                  </motion.div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center"
        >
          <Button
            onClick={() => router.push("/dashboard")}
            variant="outline"
            className="border-gray-700 text-gray-400 hover:border-red-600 hover:text-red-400"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Dashboard
          </Button>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-gray-700">
            Operator ID: {user.id.slice(0, 8)}... •{" "}
            <span className="text-red-400">BLUDHAVEN PROTOCOL</span>
          </p>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(90deg); }
        }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 6s ease-in-out infinite; }
      `}</style>
    </div>
  )
}