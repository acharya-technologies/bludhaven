"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, Menu, X, ChevronDown, Home, Folder } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {GiKingJuMask} from 'react-icons/gi'

interface UserData {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    full_name?: string;
    user_type?: string;
  }
}

interface Profile {
  id: string;
  name: string;
  user_type: string;
  email: string;
}

const Header = () => {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const isHomePage = pathname === "/"

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user as UserData)
      setLoading(false)
    }
    fetchUser()
  }, [])

  // Navigation items based on route and authentication
  const navItems = !user 
    ? isHomePage
      ? [
          { href: "#features", label: "Features", icon: null },
          { href: "#about", label: "About", icon: null }
        ]
      : []
    : [
        { href: "/dashboard", label: "Dashboard", icon: Home },
        { href: "/projects", label: "Projects", icon: Folder },
        { href: "/profile", label: "Profile", icon: User }
      ]

  useEffect(() => {
    if (user?.id) fetchUserProfile()
  }, [user?.id])

  const fetchUserProfile = async () => {
    if (!user?.id) return
    try {
      const { data } = await getSupabaseClient()
        .from('profiles')
        .select('id, name, user_type, email')
        .eq('id', user.id)
        .single()
      if (data) setProfile(data)
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  const handleLogout = async () => {
    await getSupabaseClient().auth.signOut()
    window.location.href = "/"
  }

  const getUserName = () =>
    profile?.name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    "Operator"

  const getUserRole = () =>
    profile?.user_type ||
    user?.user_metadata?.user_type ||
    "operator"

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + '/')

  // Animation variants
  const mobileMenuVariants = {
    closed: { opacity: 0, height: 0 },
    open: { opacity: 1, height: "auto" }
  }

  const navItemVariants = {
    hover: { scale: 1.05 }
  }

  // Don't render anything while loading to avoid flash
  if (loading) {
    return null
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="border-b border-gray-800 bg-transparent backdrop-blur-lg sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Mobile Menu */}
          <div className="flex items-center gap-3">
            {(user || navItems.length > 0) && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-red-500"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.button>
            )}

            <motion.div whileHover={{ scale: 1.02 }}>
              <Link href={"/"} className="group">
                <h1 className="text-xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
                  BLUDHAVEN
                </h1>
              </Link>
            </motion.div>
          </div>

          {/* Desktop Navigation */}
          {navItems.length > 0 && (
            <nav className="hidden md:flex gap-6">
              {navItems.map((item) => (
                <motion.div key={item.href} variants={navItemVariants} whileHover="hover">
                  {isHomePage ? (
                    <a
                      href={item.href}
                      className="text-sm font-medium text-gray-400 hover:text-red-500 transition-colors duration-300"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className={`text-sm font-medium transition-all duration-300 ${isActive(item.href)
                        ? "text-red-500 border-b-2 border-red-500 pb-1"
                        : "text-gray-400 hover:text-red-500 pb-1 border-b-2 border-transparent hover:border-red-500/50"
                        }`}
                    >
                      {item.label}
                    </Link>
                  )}
                </motion.div>
              ))}
            </nav>
          )}

          {/* Auth Section */}
          <div className="flex items-center gap-2">
            {user ? (
              // Logged In User
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div
                    className="flex items-center gap-2 cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">{getUserRole()}</p>
                      <p className="text-sm text-gray-300 font-medium flex items-center gap-1">
                        {getUserName()}
                        <ChevronDown className="w-3 h-3 text-gray-500" />
                      </p>
                    </div>
                    <motion.div
                      className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center border border-red-600/40"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <GiKingJuMask className="w-4 h-4 text-white" />
                    </motion.div>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-gray-700">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{getUserName()}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                      <p className="text-xs text-red-400 uppercase tracking-wider mt-1">{getUserRole()}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <GiKingJuMask className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-400 cursor-pointer focus:text-red-400"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Login Button for non-authenticated users (show on all pages except maybe home)
              <Link href="/auth/login">
                <Button className="hidden md:block bg-red-600 hover:bg-red-700 text-white">
                  Access Command
                </Button>
                <Button className="md:hidden block rounded-full bg-red-600 hover:bg-red-700 text-white">
                  <User className="w-8 h-8" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pt-3 border-t border-gray-800 mt-3">
                <div className="flex flex-col gap-1">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {isHomePage ? (
                        <a
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800/50 hover:text-gray-300 transition-all duration-300"
                        >
                          {item.label}
                        </a>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isActive(item.href)
                            ? "bg-red-600/20 text-red-500 shadow-lg shadow-red-500/10"
                            : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-300"
                            }`}
                        >
                          {item.label}
                        </Link>
                      )}
                    </motion.div>
                  ))}

                  {/* User Info for mobile when logged in */}
                  {user && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="px-3 py-2 border-t border-gray-800 mt-2 pt-3"
                    >
                      <p className="text-xs text-gray-500 uppercase tracking-wider">{getUserRole()}</p>
                      <p className="text-sm text-gray-300 font-medium truncate">
                        {getUserName()}
                      </p>
                      <p className="text-xs text-gray-600 truncate mt-1">
                        {user.email}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Link href="/profile" className="flex-1">
                          <Button variant="outline" size="sm" className="w-full border-gray-700 text-gray-400">
                            Profile
                          </Button>
                        </Link>
                        <Button
                          onClick={handleLogout}
                          size="sm"
                          variant="outline"
                          className="flex-1 border-red-600/30 text-red-400 hover:bg-red-600/10"
                        >
                          Sign Out
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Login button in mobile menu for non-authenticated users */}
                  {!user && !isHomePage && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="px-2 py-2 border-t border-gray-800 mt-2 pt-3"
                    >
                      <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                        <Button className="w-full -p-1 bg-red-600 hover:bg-red-700 text-white">
                          Access Command
                        </Button>
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}

export default Header