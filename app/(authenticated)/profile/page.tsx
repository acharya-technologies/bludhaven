"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Lock, Mail, Save, Loader2, Shield, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react"
import Header from "@/components/Header"
import { HashLoader } from "react-spinners"
import { toast } from "sonner"

interface ProfileData {
  id: string
  email: string
  name?: string
  user_type: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [activeTab, setActiveTab] = useState("profile")
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: ""
  })
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  
  // Password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/auth/login")
        return
      }
      
      // Get profile from profiles table
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
      
      if (profileData) {
        setProfile(profileData as ProfileData)
        setProfileForm({
          name: profileData.name || ""
        })
      }
      
      setLoading(false)
    }
    
    loadProfile()
  }, [router])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error("No user found")
      
      const { error } = await supabase
        .from("profiles")
        .update({ 
          name: profileForm.name,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id)
      
      if (error) throw error
      
      // Update local state
      setProfile(prev => prev ? {
        ...prev,
        name: profileForm.name
      } : prev)
      
      toast.success("Profile updated successfully", {
        icon: <CheckCircle className="w-4 h-4 text-emerald-400" />
      })
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile", {
        icon: <AlertCircle className="w-4 h-4 text-red-400" />
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate passwords
    if (!passwordForm.currentPassword) {
      toast.error("Please enter your current password", {
        icon: <AlertCircle className="w-4 h-4 text-red-400" />
      })
      return
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters", {
        icon: <AlertCircle className="w-4 h-4 text-red-400" />
      })
      return
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match", {
        icon: <AlertCircle className="w-4 h-4 text-red-400" />
      })
      return
    }
    
    setSaving(true)
    
    try {
      const supabase = getSupabaseClient()
      
      if (!profile?.email) throw new Error("No email found")
      
      // Step 1: Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: passwordForm.currentPassword
      })
      
      if (signInError) {
        if (signInError.message.includes("Invalid login credentials")) {
          toast.error("Current password is incorrect", {
            icon: <AlertCircle className="w-4 h-4 text-red-400" />
          })
          return
        }
        throw signInError
      }
      
      // Step 2: Update password if verification succeeded
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      })
      
      if (updateError) throw updateError
      
      // Reset form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
      
      // Hide password fields
      setShowCurrentPassword(false)
      setShowNewPassword(false)
      setShowConfirmPassword(false)
      
      toast.success("Password updated successfully", {
        icon: <CheckCircle className="w-4 h-4 text-emerald-400" />
      })
    } catch (error: any) {
      toast.error(error.message || "Failed to update password", {
        icon: <AlertCircle className="w-4 h-4 text-red-400" />
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <HashLoader color="#dc2626" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-full" />
            <h1 className="text-2xl sm:text-3xl font-bold">Operator Profile</h1>
          </div>
          <p className="text-gray-400">Manage your identity and security settings</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column - Profile info */}
          <div className="lg:w-1/3">
            <Card className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-lg">Operator Details</CardTitle>
                <CardDescription className="text-gray-400">Your current profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-7 h-7 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white text-lg truncate">
                      {profile?.name || "Anonymous Operator"}
                    </h3>
                    <p className="text-sm text-gray-400 capitalize">{profile?.user_type || "Operator"}</p>
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t border-gray-800">
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-gray-300 truncate">{profile?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Shield className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-300">Security Level: Maximum</p>
                      <p className="text-xs text-gray-500 mt-1">Last updated: Just now</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Edit forms */}
          <div className="lg:w-2/3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 bg-gray-900/50 border border-gray-800 p-1 mb-6">
                <TabsTrigger 
                  value="profile" 
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-sm"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger 
                  value="security" 
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-sm"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Security
                </TabsTrigger>
              </TabsList>
              
              {/* Profile Tab */}
              <TabsContent value="profile" className="mt-0">
                <Card className="bg-gray-900/30 backdrop-blur-sm border border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Edit Profile</CardTitle>
                    <CardDescription className="text-gray-400">
                      Update your operator identity
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-300 block">
                          Full Name
                        </label>
                        <Input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm(prev => ({ 
                            ...prev, 
                            name: e.target.value 
                          }))}
                          className="bg-gray-900 border-gray-700 text-white focus:border-red-600 focus:ring-red-600/20 h-11"
                          placeholder="Enter your name"
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-300 block">
                          Email Address
                        </label>
                        <Input
                          type="email"
                          value={profile?.email || ""}
                          disabled
                          className="bg-gray-900 border-gray-700 text-gray-400 cursor-not-allowed h-11"
                        />
                        <p className="text-xs text-gray-500">
                          Email cannot be changed for security reasons
                        </p>
                      </div>
                      
                      <div className="flex justify-end pt-4">
                        <Button 
                          type="submit" 
                          disabled={saving || !profileForm.name}
                          className="bg-red-600 hover:bg-red-700 text-white h-11 px-6"
                        >
                          {saving ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Security Tab */}
              <TabsContent value="security" className="mt-0">
                <Card className="bg-gray-900/30 backdrop-blur-sm border border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Change Password</CardTitle>
                    <CardDescription className="text-gray-400">
                      Update your security credentials
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordUpdate} className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-300 block">
                          Current Password
                        </label>
                        <div className="relative">
                          <Input
                            type={showCurrentPassword ? "text" : "password"}
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm(prev => ({ 
                              ...prev, 
                              currentPassword: e.target.value 
                            }))}
                            className="bg-gray-900 border-gray-700 text-white focus:border-red-600 focus:ring-red-600/20 h-11 pr-12"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-300 block">
                          New Password
                        </label>
                        <div className="relative">
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm(prev => ({ 
                              ...prev, 
                              newPassword: e.target.value 
                            }))}
                            className="bg-gray-900 border-gray-700 text-white focus:border-red-600 focus:ring-red-600/20 h-11 pr-12"
                            placeholder="Enter new password (min. 6 characters)"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                          >
                            {showNewPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-300 block">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm(prev => ({ 
                              ...prev, 
                              confirmPassword: e.target.value 
                            }))}
                            className="bg-gray-900 border-gray-700 text-white focus:border-red-600 focus:ring-red-600/20 h-11 pr-12"
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <Button 
                          type="submit" 
                          disabled={saving || 
                            !passwordForm.currentPassword || 
                            !passwordForm.newPassword || 
                            !passwordForm.confirmPassword}
                          className="bg-red-600 hover:bg-red-700 text-white h-11 px-6"
                        >
                          {saving ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4 mr-2" />
                              Update Password
                            </>
                          )}
                        </Button>
                      </div>
                      
                      <div className="mt-6 p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Security Tips
                        </h4>
                        <ul className="text-xs text-gray-400 space-y-2">
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1 flex-shrink-0" />
                            <span>Use at least 6 characters</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1 flex-shrink-0" />
                            <span>Include numbers and special characters</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1 flex-shrink-0" />
                            <span>Avoid using common passwords</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1 flex-shrink-0" />
                            <span>Don't reuse passwords across services</span>
                          </li>
                        </ul>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}