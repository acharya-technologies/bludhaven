"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "./ui/button"
import { LogOut, User, Menu, X } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useState } from "react"

interface User { 
  id: string; 
  email?: string;
  user_metadata?: { 
    name?: string;
    full_name?: string;
    user_type?: string;
  }
}

const Header = ({ user }: { user: User }) => {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  
  const handleLogout = async () => {
    await getSupabaseClient().auth.signOut()
    window.location.href = "/"
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/projects", label: "Projects" }
  ]

  const getUserName = () => {
    // Priority: name from registration -> full_name -> email username
    return user.user_metadata?.name || 
           user.user_metadata?.full_name || 
           user?.email?.split('@')[0] || 
           "Operator"
  }

  const getUserRole = () => {
    return user.user_metadata?.user_type || "operator"
  }

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

  return (
    <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Mobile Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-red-500"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/dashboard" className="group">
              <h1 className="text-xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
                BLUDHAVEN
              </h1>
            </Link>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(item.href) ? "text-red-500" : "text-gray-400 hover:text-red-500"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User & Logout */}
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-500 uppercase tracking-wider">{getUserRole()}</p>
              <p className="text-sm text-gray-300 max-w-[140px] truncate font-medium">
                {getUserName()}
              </p>
            </div>

            <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center border border-red-600/40">
              <User className="w-4 h-4 text-white" />
            </div>

            <Button 
              onClick={handleLogout} 
              variant="outline" 
              size="sm" 
              className="border-gray-700 text-gray-400 hover:border-red-600 hover:text-red-500"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pt-3 border-t border-gray-800 mt-3">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive(item.href)
                      ? "bg-red-600/20 text-red-500"
                      : "text-gray-400 hover:bg-gray-800/50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile User Info */}
              <div className="px-3 py-2 border-t border-gray-800 mt-2 pt-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider">{getUserRole()}</p>
                <p className="text-sm text-gray-300 font-medium truncate">
                  {getUserName()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header