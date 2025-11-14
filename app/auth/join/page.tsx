"use client"
import { FaDroplet } from "react-icons/fa6";
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, AlertCircle, Shield, Crosshair, User, Mail, Key, Clock, MapPin } from "lucide-react"
import Link from "next/link"
import { GiBatwingEmblem, GiBulletImpacts } from "react-icons/gi";
import { HashLoader } from "react-spinners";

export default function SecretRegisterPage() {
    const router = useRouter()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [verifyEmail, setVerifyEmail] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [registrationEnabled, setRegistrationEnabled] = useState<boolean | null>(null)

    useEffect(() => {
        checkRegistrationStatus()
    }, [])

    const checkRegistrationStatus = async () => {
        try {
            const response = await fetch('https://api.jsonbin.io/v3/b/69176aa243b1c97be9ad9474', {
                headers: {
                    'X-Master-Key': '$2a$10$97KWUjXxdJGEvzH9YfFNde3C7NtSKKVjuN.7cERKPyzYMlnyqVFZC'
                }
            })
            const data = await response.json()
            setRegistrationEnabled(data.record.registration)
        } catch (err) {
            console.error('Failed to check registration status:', err)
            setRegistrationEnabled(false)
        }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!registrationEnabled) {
            setError("Registration portal has been permanently disabled")
            return
        }

        setLoading(true)
        setError(null)

        if (email !== verifyEmail) {
            setError("Emails don't match")
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setError("Code too weak - 6 chars minimum")
            setLoading(false)
            return
        }

        try {
            const supabase = getSupabaseClient()
            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password: password.trim(),
                options: {
                    data: {
                        name: name.trim(),
                        user_type: 'admin'
                    }
                }
            })

            if (error) {
                setError(`Access denied: ${error.message}`)
                return
            }

            if (data.user) {
                setSuccess(true)
                setTimeout(() => router.push("/dashboard"), 1500)
            }
        } catch (err: any) {
            setError("System breach detected")
        } finally {
            setLoading(false)
        }
    }

    if (registrationEnabled === null) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center flex-col">
                <HashLoader color="#4283f4" />
                <p className="text-gray-400 text-sm">Checking access protocols...</p>
            </div>
        )
    }

    if (!registrationEnabled) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-black via-orange-950/20 to-black" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(234,88,12,0.15),transparent_70%)]" />

                <div className="w-full max-w-md relative z-10 text-center">
                    <div className="bg-gray-950/90 border border-orange-600/40 rounded-xl p-8 backdrop-blur-sm">
                        <div className="w-16 h-16 bg-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-orange-600/40">
                            <Clock className="w-8 h-8 text-orange-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Portal Disabled</h2>
                        <p className="text-orange-400 mb-4">This registration base has been permanently shut down</p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-600/10 border border-orange-600/30">
                            <MapPin className="w-4 h-4 text-orange-500" />
                            <span className="text-sm text-orange-400">Arkham Protocol Activated</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-black via-green-950/20 to-black" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.2),transparent_50%)]" />

                <div className="w-full max-w-sm relative z-10 text-center">
                    <div className="bg-gray-950/95 border border-green-600/50 rounded-xl p-6 backdrop-blur-sm">
                        <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-600/50">
                            <Shield className="w-6 h-6 text-green-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Identity Verified</h2>
                        <p className="text-green-400 text-sm mb-4">Access granted to restricted sector</p>
                        <div className="w-full bg-gray-800 rounded-full h-1">
                            <div className="bg-green-600 h-1 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Blue-themed background for Nightwing */}
            <div className="absolute inset-0 bg-gradient-to-br from-black via-blue-950/10 to-black" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),transparent_70%)]" />

            {/* Nightwing escrima sticks effect */}
            <div className="absolute top-20 left-20 w-1 h-8 bg-blue-400/30 rounded-full animate-pulse" />
            <div className="absolute bottom-20 right-20 w-1 h-8 bg-blue-400/30 rounded-full animate-pulse delay-500" />

            <div className="w-full max-w-sm relative z-10">
                {/* Compact Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600/10 to-blue-900/20 rounded-full border border-blue-600/30 mb-4">
                        <GiBatwingEmblem className="w-8 h-8 text-blue-400" />
                    </div>

                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                        NIGHTWING
                    </h1>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/5 border border-blue-600/20 mb-3">
                        <Clock className="w-3 h-3 text-blue-400" />
                        <span className="text-xs text-blue-400 uppercase tracking-widest">BASE CLOSING SOON</span>
                    </div>
                    <p className="text-xs text-gray-500">Secret registration portal • Limited time access</p>
                </div>

                {/* Compact Registration Card */}
                <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-6 backdrop-blur-sm relative group hover:border-gray-700 transition-all duration-300">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center gap-2 mb-2">
                            <Crosshair className="w-4 h-4 text-blue-400" />
                            <h2 className="text-lg font-bold text-white">Agent Registration</h2>
                            <Crosshair className="w-4 h-4 text-blue-400" />
                        </div>
                        <p className="text-gray-500 text-xs">Blüdhaven Secret Service</p>
                    </div>

                    <form className="space-y-4" onSubmit={handleRegister}>
                        <div className="space-y-3">
                            <div className="relative">
                                <Input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Agent identity"
                                    className="bg-gray-900/60 border-gray-700 text-white placeholder:text-gray-500 text-sm h-10 focus:border-blue-500"
                                    required
                                />
                                <User className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
                            </div>

                            <div className="relative">
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Secure comms channel"
                                    className="bg-gray-900/60 border-gray-700 text-white placeholder:text-gray-500 text-sm h-10 focus:border-blue-500"
                                    required
                                />
                                <Mail className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
                            </div>

                            <div className="relative">
                                <Input
                                    type="email"
                                    value={verifyEmail}
                                    onChange={(e) => setVerifyEmail(e.target.value)}
                                    placeholder="Confirm channel"
                                    className="bg-gray-900/60 border-gray-700 text-white placeholder:text-gray-500 text-sm h-10 focus:border-blue-500"
                                    required
                                />
                                <Mail className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
                            </div>

                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Encryption key"
                                    className="bg-gray-900/60 border-gray-700 text-white placeholder:text-gray-500 text-sm h-10 focus:border-blue-500 pr-10"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 p-1"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-600/10 border border-red-600/30 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                                    <p className="text-sm text-red-400">{error}</p>
                                </div>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading || !name || !email || !verifyEmail || !password}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Encrypting...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <Key className="w-4 h-4" />
                                    <span>Generate Identity</span>
                                </div>
                            )}
                        </Button>
                    </form>
                </div>

                {/* Compact Security Notice */}
                <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-950/40 border border-gray-800">
                        <Shield className="w-3 h-3 text-gray-600" />
                        <span className="text-xs text-gray-600">
                            <span className="text-blue-400 font-medium">NIGHTWING</span> PROTOCOL • CLOSING SOON
                        </span>
                    </div>
                </div>

                {/* Minimal Footer */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-700 inline-flex items-center gap-1">
                        Secured by <FaDroplet className="text-blue-400 w-3 h-3" />
                        <Link href={'http://1ndrajeet.is-a.dev/'} className="hover:underline text-blue-400 hover:text-blue-300">
                            Blüdhaven Defense
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}