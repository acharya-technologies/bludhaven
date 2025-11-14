"use client"
import { FaDroplet } from "react-icons/fa6";
import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skull, Lock, Eye, EyeOff, AlertCircle, Shield, Crosshair } from "lucide-react"
import Link from "next/link"
import { GiBatwingEmblem, GiBulletImpacts } from "react-icons/gi";

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
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

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/10 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.15),transparent_50%)]" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-900/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-800/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-700/10 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      {/* Bullet Hole Decorations */}
      <div className="absolute top-10 left-10 w-3 h-3 bg-red-500/30 rounded-full animate-ping" />
      <div className="absolute top-20 right-20 w-2 h-2 bg-red-400/40 rounded-full animate-ping delay-300" />
      <div className="absolute bottom-20 left-20 w-4 h-4 bg-red-600/20 rounded-full animate-ping delay-700" />

      <div className="w-full max-w-md relative z-10">
        {/* Enhanced Logo Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-600/20 to-red-900/30 rounded-full border border-red-600/40 mb-6 relative group hover:border-red-500/60 transition-all duration-300">
            <div className="absolute inset-0 bg-red-600/20 rounded-full blur-xl group-hover:bg-red-600/30 transition-all" />
            <GiBatwingEmblem className="w-12 h-12 text-red-500 relative z-10 group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute -inset-2 bg-red-500/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent tracking-tight">
            BLUDHAVEN
          </h1>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/10 border border-red-600/40 mt-4 group hover:border-red-500/60 transition-all duration-300">
            <Shield className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs text-red-400 uppercase tracking-wider font-medium group-hover:text-red-300 transition-colors">
              Restricted Access • Crime Alley Protocol
            </span>
          </div>
        </div>

        {/* Enhanced Login Card */}
        <div className="bg-gray-950/90 border border-gray-800 rounded-2xl p-8 backdrop-blur-sm shadow-2xl relative overflow-hidden group hover:border-gray-700 transition-all duration-300">
          {/* Card Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-red-600/10 to-transparent rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-3">
                <Crosshair className="w-5 h-5 text-red-500" />
                <h2 className="text-2xl font-bold text-white">Target Identification</h2>
                <Crosshair className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-gray-400 text-sm">Verify your credentials to access the command center</p>
            </div>

            <form className="space-y-6" onSubmit={handleLogin}>
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
                    className="bg-gray-900/80 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-600 focus:ring-2 focus:ring-red-600/30 h-12 transition-all duration-200"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <GiBulletImpacts className="w-4 h-4" />
                  </div>
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
                    className="bg-gray-900/80 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-600 focus:ring-2 focus:ring-red-600/30 h-12 transition-all duration-200 pr-12"
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

              {/* Enhanced Error Message */}
              {error && (
                <div className="p-4 bg-red-600/10 border border-red-600/40 rounded-xl backdrop-blur-sm group hover:border-red-500/60 transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-400">Nigga, Really?? You Thought its that easy??</p>
                      <p className="text-xs text-red-400/80 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Submit Button */}
              <Button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
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
            </form>
          </div>
        </div>

        {/* Enhanced Security Notice */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-950/50 border border-gray-800 group hover:border-gray-700 transition-all duration-300">
            <Shield className="w-4 h-4 text-gray-600 group-hover:text-red-500 transition-colors" />
            <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
              Unauthorized access will be met with <span className="text-red-500 font-medium">lethal force</span>
            </span>
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="mt-10 text-center space-y-3">
          <p className="text-xs text-gray-600 tracking-wider">
            PROTECTED BY RED HOOD PROTOCOL • SINGLE OPERATOR ACCESS
          </p>
          <p className="text-xs text-gray-700 inline-flex items-center gap-1">
            Built with <FaDroplet className="text-red-500 w-4 h-4" /> by 
            <Link href={'http://1ndrajeet.is-a.dev/'} className="hover:underline text-red-400 hover:text-red-300 transition-colors">
              Jason Todd
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}