"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, Eye, EyeOff, AlertCircle, Shield, Crosshair } from "lucide-react"
import Link from "next/link"
import { GiBatwingEmblem, GiBulletImpacts } from "react-icons/gi"
import { HashLoader } from "react-spinners"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingScreen, setLoadingScreen] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setError(error.message)
      } else {
        router.push("/dashboard")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const checkAuth = async () => {
    const { data: { user } } = await getSupabaseClient().auth.getUser()
    if (user) router.push("/dashboard")
    setLoadingScreen(false)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      checkAuth()
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  if (loadingScreen) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <HashLoader color="#dc2626" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Optimized Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/10 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1),transparent_50%)]" />
      
      {/* Subtle Animated Elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-900/10 rounded-full blur-2xl animate-pulse md:block hidden" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-red-800/10 rounded-full blur-2xl animate-pulse delay-1000 md:block hidden" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600/20 to-red-900/30 rounded-full border border-red-600/40 mb-4 relative group hover:border-red-500/60 transition-all duration-300">
            <GiBatwingEmblem className="w-8 h-8 text-red-500 relative z-10 group-hover:scale-110 transition-transform duration-300" />
          </div>

          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent tracking-tight">
            BLUDHAVEN
          </h1>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/40">
            <Shield className="w-3 h-3 text-red-500" />
            <span className="text-xs text-red-400 uppercase tracking-wider">
              Restricted Access
            </span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-gray-950/90 border border-gray-800 rounded-xl p-6 backdrop-blur-sm shadow-2xl relative group hover:border-gray-700 transition-all duration-300">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-2">
              <Crosshair className="w-4 h-4 text-red-500" />
              <h2 className="text-xl font-bold text-white">Target Identification</h2>
            </div>
            <p className="text-gray-400 text-sm">Verify your credentials</p>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Operator Email
              </label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@bludhaven.gov"
                  className="bg-gray-900/80 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-600 focus:ring-1 focus:ring-red-600/30 h-11 transition-all duration-200"
                />
                <GiBulletImpacts className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Access Code
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="bg-gray-900/80 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-600 focus:ring-1 focus:ring-red-600/30 h-11 transition-all duration-200 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-600/10 border border-red-600/40 rounded-lg backdrop-blur-sm">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">Authentication failed</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              {loading ? (
                <div className="flex items-center justify-center gap-2 relative z-10">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 relative z-10">
                  <Lock className="w-4 h-4" />
                  <span>Access Command Center</span>
                </div>
              )}
            </Button>

            <Link 
              href="/auth/join" 
              className="block text-center text-sm text-gray-500 hover:text-gray-400 transition-colors"
            >
              Need an operator account? <span className="text-red-500 hover:text-red-400">Initiate Protocol</span>
            </Link>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-xs text-gray-600">
            PROTECTED BY RED HOOD PROTOCOL
          </p>
          <p className="text-xs text-gray-700">
            Built by{" "}
            <Link 
              href="http://1ndrajeet.is-a.dev/" 
              className="text-red-400 hover:text-red-300 transition-colors hover:underline"
            >
              Jason Todd
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}