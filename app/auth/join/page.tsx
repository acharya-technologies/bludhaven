"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, AlertCircle, Sword, Zap, Sparkles, Target, Scan } from "lucide-react"
import Link from "next/link"
import { GiSpinningSword , GiRose, GiAbstract103 } from "react-icons/gi"
import { HashLoader } from "react-spinners"
import { motion, AnimatePresence } from "framer-motion"

const theme = {
  primary: "violet",
  accent: "crimson",
  glow: "violet-500/20",
  ring: "violet-600",
  bgGradient: "from-violet-950/20 via-black to-crimson-950/20",
  radial: "rgba(139,92,246,0.18)",
  border: "violet-600/40",
  hoverBorder: "violet-500/60",
  buttonFrom: "violet-600",
  buttonTo: "crimson-600",
}

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initLoad, setInitLoad] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])

  const supabase = getSupabaseClient()

  const generateParticles = () => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    }))
    setParticles(newParticles)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: authErr } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { name: form.name, user_type: "operator" } }
      })

      if (authErr) {
        setError(authErr.message)
        // Shake animation on error
        document.getElementById("error-container")?.classList.add("animate-shake")
        setTimeout(() => {
          document.getElementById("error-container")?.classList.remove("animate-shake")
        }, 500)
      } else {
        // Success animation
        generateParticles()
        await new Promise(resolve => setTimeout(resolve, 1500))
        await supabase.from("profiles").insert({
          id: (await supabase.auth.getUser()).data.user?.id,
          name: form.name,
          email: form.email,
          user_type: "operator"
        })
        router.push("/dashboard")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setTimeout(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) router.push("/dashboard")

      const res = await fetch("https://api.jsonbin.io/v3/b/69176aa243b1c97be9ad9474", {
        headers: { "X-Master-Key": "$2a$10$97KWUjXxdJGEvzH9YfFNde3C7NtSKKVjuN.7cERKPyzYMlnyqVFZC" }
      })
      const data = await res.json()
      setOpen(data.record.registration ?? false)
      setInitLoad(false)
      generateParticles()
    }, 1000)
  }, [])

  if (initLoad) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <HashLoader color="#c026d3" />
      </motion.div>
    </div>
  )

  if (!open) return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <BgEffects />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="relative z-10 text-center"
      >
        <div className="bg-gray-950/90 border border-violet-600/40 rounded-2xl p-10 backdrop-blur-sm shadow-2xl">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <GiRose className="w-16 h-16 text-violet-500 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-3">Portal Sealed</h2>
          <p className="text-gray-400 mb-6">Ravager has terminated new registrations.</p>
          <Link href="/auth/login">
            <Button className="bg-violet-600 hover:bg-violet-700 transform hover:scale-105 transition-all duration-200">
              Return to Base
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <BgEffects />
      
      {/* Animated Particles */}
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute w-2 h-2 bg-violet-500 rounded-full"
            style={{ left: `${particle.x}%`, top: `${particle.y}%` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.8, delay: particle.delay }}
          />
        ))}
      </AnimatePresence>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-violet-600/20 to-crimson-900/30 rounded-full border border-violet-600/40 group hover:border-violet-500/60 transition-all duration-300 relative overflow-hidden"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <GiAbstract103 className="w-full h-full text-violet-500/10" />
            </motion.div>
            <GiSpinningSword  className="w-14 h-14 text-violet-400 relative z-10" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="text-6xl font-black mt-6 bg-gradient-to-r from-violet-400 to-crimson-500 bg-clip-text text-transparent"
          >
            RAVAGER
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-600/10 border border-violet-600/40 mt-3"
          >
            <Target className="w-3 h-3 text-violet-400" />
            <span className="text-xs uppercase tracking-widest text-violet-400">
              One-Eyed Recruitment • Final Cycle
            </span>
          </motion.div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-950/90 border border-gray-800 rounded-2xl p-8 backdrop-blur-sm shadow-2xl group hover:border-gray-700 transition-all duration-500 relative overflow-hidden"
        >
          {/* Animated Border */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/0 via-violet-600/20 to-violet-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]" />
          
          <div className="relative z-10">
            <motion.div 
              className="text-center mb-8"
              whileHover={{ scale: 1.02 }}
            >
              <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-3">
                <motion.div
                  animate={{ rotate: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sword className="w-6 h-6 text-violet-500" />
                </motion.div>
                Forge Your Blade
                <motion.div
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sword className="w-6 h-6 text-violet-500 scale-x-[-1]" />
                </motion.div>
              </h2>
              <p className="text-gray-400 text-sm mt-2">Last chance. Impress me.</p>
            </motion.div>

            <form onSubmit={handleRegister} className="space-y-6">
              {[
                { key: "name", placeholder: "Your Callsign", icon: <Scan className="w-4 h-4" /> },
                { key: "email", placeholder: "Your Email", icon: <Zap className="w-4 h-4" /> },
                { key: "password", placeholder: "Password", icon: <Sparkles className="w-4 h-4" /> }
              ].map((field, i) => {
                const isPass = field.key === "password"
                return (
                  <motion.div
                    key={field.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      {field.icon}
                      {field.key === "name" ? "Callsign" : field.key === "email" ? "Contact" : "Kill Code"}
                    </label>
                    <div className="relative">
                      <motion.div
                        whileFocus={{ scale: 1.02 }}
                        className="relative"
                      >
                        <Input
                          type={isPass && !showPass ? "password" : "text"}
                          placeholder={field.placeholder}
                          value={form[field.key as keyof typeof form]}
                          onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                          onFocus={() => setFocusedField(field.key)}
                          onBlur={() => setFocusedField(null)}
                          className={`bg-gray-900/80 border-gray-700 text-white h-12 pr-12 focus:border-${theme.ring} focus:ring-2 focus:ring-${theme.ring}/30 transition-all duration-300 ${
                            focusedField === field.key ? `border-${theme.ring} shadow-lg shadow-${theme.ring}/20` : ''
                          }`}
                        />
                        {isPass && (
                          <motion.button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            whileTap={{ scale: 0.9 }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
                          >
                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </motion.button>
                        )}
                      </motion.div>
                      <motion.div
                        className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-${theme.buttonFrom} to-${theme.buttonTo}`}
                        initial={{ width: "0%" }}
                        animate={{ width: focusedField === field.key ? "100%" : "0%" }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>
                )
              })}

              <AnimatePresence>
                {error && (
                  <motion.div
                    id="error-container"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="p-4 bg-red-600/10 border border-red-600/40 rounded-xl flex gap-3 backdrop-blur-sm"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-red-400">Access Denied</p>
                      <p className="text-xs text-red-400/80">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  disabled={loading || !form.name || !form.email || !form.password}
                  className={`w-full bg-gradient-to-r from-${theme.buttonFrom} to-${theme.buttonTo} hover:from-violet-700 hover:to-crimson-700 text-white font-bold py-3 rounded-xl relative overflow-hidden group disabled:opacity-50 transition-all duration-300`}
                >
                  <div className="absolute inset-0 bg-white/10 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        Forging Identity...
                      </>
                    ) : (
                      "◈ Accept Contract ◈"
                    )}
                  </span>
                </Button>
              </motion.div>
            </form>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center text-xs text-gray-500 mt-6"
            >
              Already marked?{" "}
              <Link 
                href="/auth/login" 
                className="text-violet-400 hover:text-violet-300 transition-colors font-semibold hover:underline"
              >
                Return to kill feed
              </Link>
            </motion.p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-8 space-y-2"
        >
          <p className="text-xs text-gray-600 tracking-wider">
            RAVAGER PROTOCOL • RECRUITMENT TERMINAL
          </p>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-sm text-violet-500 font-mono"
          >
            <Link href="/guest">Guest?</Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}

// Enhanced Background Component
function BgEffects() {
  return (
    <>
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient}`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.18),transparent_60%)]" />
      
      {/* Animated Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {[
          { class: "top-1/4 left-1/4 w-96 h-96 bg-violet-900/15", delay: 0 },
          { class: "bottom-1/4 right-1/4 w-96 h-96 bg-crimson-800/15", delay: 1000 },
          { class: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-violet-700/10", delay: 500 }
        ].map((orb, i) => (
          <motion.div
            key={i}
            className={`absolute ${orb.class} rounded-full blur-3xl`}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 4, delay: orb.delay / 1000, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Floating Particles */}
      <div className="absolute top-10 left-10">
        <motion.div
          className="w-3 h-3 bg-violet-500/40 rounded-full"
          animate={{ y: [0, -20, 0], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <div className="absolute bottom-20 right-20">
        <motion.div
          className="w-4 h-4 bg-crimson-500/30 rounded-full"
          animate={{ y: [0, 15, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
        />
      </div>

      {/* Scanning Lines */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/5 to-transparent"
        animate={{ y: ["-100%", "200%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
    </>
  )
}

// Add custom animation for CSS
const styles = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
.animate-shake {
  animation: shake 0.5s ease-in-out;
}
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style")
  styleSheet.innerText = styles
  document.head.appendChild(styleSheet)
}