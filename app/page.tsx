"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Target, Shield, Zap, Lock, ArrowRight, Skull, 
  Crown, Eye, CheckCircle2, Database, Workflow, 
  BarChart3, Users, Clock, TrendingUp, Activity,
  Menu, X
} from "lucide-react"
import { GiBatwingEmblem, GiBulletImpacts } from "react-icons/gi"
import { FaDroplet, FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa6"

export default function RedHoodLandingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const stats = [
    { icon: Target, value: "100%", label: "Precision" },
    { icon: Shield, value: "Secure", label: "Encrypted" },
    { icon: Zap, value: "Fast", label: "Performance" },
    { icon: Skull, value: "Elite", label: "Exclusive" }
  ]

  const features = [
    {
      icon: Target,
      title: "Mission Control",
      description: "Track projects from initial enquiry to final delivery with military precision.",
      color: "from-red-600/20 to-red-900/30"
    },
    {
      icon: Database,
      title: "Financial Arsenal", 
      description: "Secure payment tracking with installment planning and revenue protection.",
      color: "from-orange-600/20 to-red-900/30"
    },
    {
      icon: Workflow,
      title: "Workflow Automation",
      description: "Streamlined processes that adapt to your unique operational style.",
      color: "from-amber-600/20 to-orange-900/30"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Deep insights into your project performance and financial metrics.",
      color: "from-yellow-600/20 to-amber-900/30"
    },
    {
      icon: Users,
      title: "Client Management",
      description: "Complete client profiles with communication and project tracking.",
      color: "from-lime-600/20 to-yellow-900/30"
    },
    {
      icon: Shield,
      title: "Secure Vault",
      description: "End-to-end encryption ensuring your data remains for your eyes only.",
      color: "from-green-600/20 to-lime-900/30"
    }
  ]

  const performance = [
    { icon: CheckCircle2, value: "100%", label: "Uptime" },
    { icon: Clock, value: "24/7", label: "Monitoring" },
    { icon: Shield, value: "AES-256", label: "Encryption" },
    { icon: Zap, value: "<100ms", label: "Response" },
    { icon: Database, value: "Zero", label: "Data Loss" },
    { icon: Users, value: "1", label: "Operator" }
  ]

  const dashboardFeatures = [
    {
      icon: Target,
      title: "Mission Control",
      description: "Track projects from enquiry to delivery with real-time status updates.",
      color: "from-red-600/20 to-red-900/30"
    },
    {
      icon: TrendingUp,
      title: "Financial Arsenal",
      description: "Secure payment tracking with installment planning and revenue protection.",
      color: "from-emerald-600/20 to-emerald-900/30"
    },
    {
      icon: Activity,
      title: "Live Intel",
      description: "Real-time updates via Supabase subscriptions. No manual refreshes needed.",
      color: "from-blue-600/20 to-blue-900/30"
    },
    {
      icon: Shield,
      title: "Secure Vault",
      description: "Critical data stays encrypted. Access requires operator authorization.",
      color: "from-purple-600/20 to-purple-900/30"
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Animated Background - Mobile Optimized */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(220,38,38,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.1)_1px,transparent_1px)] bg-[size:32px_32px] md:bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        
        {/* Floating Elements - Smaller on Mobile */}
        <div className="absolute top-1/4 left-1/4 w-48 h-48 md:w-96 md:h-96 bg-red-900/10 rounded-full blur-2xl md:blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 md:w-96 md:h-96 bg-red-800/10 rounded-full blur-2xl md:blur-3xl animate-float-medium" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-64 md:h-64 bg-red-700/10 rounded-full blur-xl md:blur-2xl animate-float-fast" />
        
        {/* Particle Effects - Fewer on Mobile */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-red-500/40 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Navigation - Mobile First */}
      <nav className="relative z-50 border-b border-red-900/30 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 md:space-x-3 group flex-shrink-0">
              <div className="relative">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <GiBatwingEmblem className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
                <div className="absolute -inset-1 bg-red-600/30 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                  BLUDHAVEN
                </h1>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <a href="#features" className="text-gray-300 hover:text-red-400 transition-colors text-sm font-medium">
                Features
              </a>
              <a href="#about" className="text-gray-300 hover:text-red-400 transition-colors text-sm font-medium">
                About
              </a>
              <Link href="/auth/login">
                <Button className="bg-red-600 hover:bg-red-700 text-white px-4 md:px-6 text-sm">
                  Access Command
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-red-400 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-16 left-0 right-0 bg-black/95 backdrop-blur-md border-b border-red-900/30">
              <div className="px-4 py-4 space-y-4">
                <a
                  href="#features"
                  className="block text-gray-300 hover:text-red-400 transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#about"
                  className="block text-gray-300 hover:text-red-400 transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </a>
                <Link href="/auth/login" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                    Access Command
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section - Mobile Optimized */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="max-w-6xl mx-auto text-center w-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-red-600/10 border border-red-600/40 mb-6 md:mb-8 group hover:border-red-500/60 transition-all duration-300">
            <Crown className="w-3 h-3 md:w-4 md:h-4 text-red-500" />
            <span className="text-xs md:text-sm text-red-400 uppercase tracking-wider font-medium">
              Exclusive Operator Access
            </span>
          </div>

          {/* Main Heading */}
          <h1 className={`text-4xl sm:text-6xl lg:text-8xl font-bold mb-4 md:mb-6 leading-tight transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent">
              BLUDHAVEN
            </span>
          </h1>

          {/* Subheading */}
          <p className={`text-lg sm:text-xl md:text-2xl text-gray-400 mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            Tactical project management for solo operators. Track missions, manage payments, and dominate your workflow.
          </p>

          {/* CTA Buttons - Stacked on Mobile */}
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-8 md:mb-12 transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <Link href="/auth/login" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-6 md:px-8 py-4 md:py-6 text-base md:text-lg font-semibold group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <span className="flex items-center gap-2 relative z-10">
                  <Lock className="w-4 h-4 md:w-5 md:h-5" />
                  Enter Command Center
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
            
            <a href="#features" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto border-gray-700 text-gray-300 hover:border-red-600 hover:text-red-400 px-6 md:px-8 py-4 md:py-6 text-base md:text-lg font-semibold">
                <Eye className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                View Features
              </Button>
            </a>
          </div>

          {/* Stats - 2x2 Grid on Mobile */}
          <div className={`grid md:grid-cols-4 grid-cols-2 gap-4 md:gap-8 max-w-2xl mx-auto transition-all duration-1000 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-red-600/10 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
                </div>
                <div className="text-xl md:text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs md:text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-5 h-8 md:w-6 md:h-10 border-2 border-red-600/50 rounded-full flex justify-center">
            <div className="w-1 h-2 md:h-3 bg-red-600 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section - Mobile Optimized */}
      <section id="features" className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6">
              <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                Mission
              </span>{" "}
              <span className="text-white">Control</span>
            </h2>
            <p className="text-base md:text-xl text-gray-400 max-w-2xl mx-auto px-4">
              Everything you need to manage your operations with the precision of a master strategist.
            </p>
          </div>

          {/* Features Grid - 1 column on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 md:p-6 hover:border-red-600/50 transition-all duration-500 hover:scale-105"
              >
                <div className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3">{feature.title}</h3>
                <p className="text-sm md:text-base text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Hero Preview - Mobile Optimized */}
      <section className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-br from-black via-red-950/20 to-black border border-red-900/30 rounded-xl md:rounded-2xl p-6 md:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(220,38,38,0.15),transparent_70%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(185,28,28,0.1),transparent_70%)]" />
            
            <div className="relative z-10">
              <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
                {/* Left Content */}
                <div className="space-y-4 md:space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-red-600/10 border border-red-600/40 backdrop-blur-sm group hover:border-red-500/60 transition-all duration-300">
                    <Shield className="w-3 h-3 md:w-4 md:h-4 text-red-500" />
                    <span className="text-xs text-red-400 uppercase tracking-wider font-medium">
                      Crime Alley Operations
                    </span>
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold">
                      <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                        Solo Operator
                      </span>{" "}
                      <span className="text-white">Dashboard</span>
                    </h2>
                    <p className="text-lg md:text-xl text-gray-300 font-medium">
                      Built for lone wolves who get the job done
                    </p>
                  </div>

                  <p className="text-base md:text-lg text-gray-400 leading-relaxed">
                    Monitor every project with military precision. Real-time updates, secure payment tracking, and encrypted data.
                  </p>

                  {/* Feature Pills - Wrap on mobile */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { icon: Target, text: "Mission Tracking" },
                      { icon: Activity, text: "Real-time Intel" },
                      { icon: Lock, text: "Encrypted Data" },
                      { icon: Zap, text: "Fast Execution" }
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900/50 border border-gray-800 group hover:border-red-600/50 transition-all duration-300"
                      >
                        <item.icon className="w-3 h-3 md:w-4 md:h-4 text-red-500" />
                        <span className="text-xs md:text-sm text-gray-300">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Content - Feature Cards */}
                <div className="space-y-3 md:space-y-4">
                  {dashboardFeatures.map((item, i) => (
                    <div
                      key={i}
                      className={`bg-gradient-to-br ${item.color} border border-gray-800 rounded-lg md:rounded-xl p-3 md:p-5 backdrop-blur-sm group hover:border-red-600/50 transition-all duration-300`}
                    >
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className="p-2 md:p-3 rounded-lg bg-gray-900/50 border border-gray-800 flex-shrink-0">
                          <item.icon className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
                        </div>
                        <div className="flex-1 space-y-1 min-w-0">
                          <h3 className="text-white font-semibold text-base md:text-lg group-hover:text-red-400 transition-colors line-clamp-1">
                            {item.title}
                          </h3>
                          <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section - Mobile Optimized */}
      <section id="about" className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6">
                Built by{" "}
                <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                  Jason Todd
                </span>
              </h2>
              <p className="text-base md:text-lg text-gray-400 leading-relaxed">
                When existing tools failed to meet the demands of precision project management, we built our own arsenal.
              </p>
              <p className="text-base md:text-lg text-gray-400 leading-relaxed">
                This isn't just another project management tool. It's a weapon designed for operators who refuse to compromise.
              </p>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
                <Link href="http://1ndrajeet.is-a.dev/" target="_blank">
                  <Button variant="outline" className="border-gray-700 text-gray-300 hover:border-red-600 hover:text-red-400">
                    <FaDroplet className="w-4 h-4 mr-2" />
                    Visit Creator
                  </Button>
                </Link>
                
                <div className="flex gap-2 md:gap-3">
                  <a href="https://github.com/1ndrajeet" className="w-8 h-8 md:w-10 md:h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors">
                    <FaGithub className="w-4 h-4 md:w-5 md:h-5" />
                  </a>
                  <a href="https://linkedin.com/in/1ndrajeet" className="w-8 h-8 md:w-10 md:h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors">
                    <FaLinkedin className="w-4 h-4 md:w-5 md:h-5" />
                  </a>
                  <a href="https://www.instagram.com/omkar_.kulkarni/" className="w-8 h-8 md:w-10 md:h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors">
                    <FaInstagram className="w-4 h-4 md:w-5 md:h-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Right Content - Performance Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
              {performance.map((item, index) => (
                <div key={index} className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg md:rounded-xl p-3 md:p-4 text-center group hover:border-red-600/50 transition-all duration-300">
                  <item.icon className="w-6 h-6 md:w-8 md:h-8 text-red-500 mx-auto mb-1 md:mb-2" />
                  <div className="text-lg md:text-2xl font-bold text-white mb-1">{item.value}</div>
                  <div className="text-xs md:text-sm text-gray-400">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Mobile Optimized */}
      <section className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-red-600/10 to-red-900/20 border border-red-600/30 rounded-xl md:rounded-3xl p-6 md:p-12 backdrop-blur-sm">
            <GiBatwingEmblem className="w-12 h-12 md:w-16 md:h-16 text-red-500 mx-auto mb-4 md:mb-6" />
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 md:mb-6">
              Ready to{" "}
              <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                Take Control?
              </span>
            </h2>
            <p className="text-base md:text-xl text-gray-400 mb-6 md:mb-8 max-w-2xl mx-auto">
              Join the elite operators who trust Bludhaven with their most critical missions.
            </p>
            <Link href="/auth/login">
              <Button className="bg-red-600 hover:bg-red-700 text-white px-8 md:px-12 py-4 md:py-6 text-base md:text-lg font-semibold group relative overflow-hidden w-full sm:w-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <span className="flex items-center gap-2 md:gap-3 relative z-10">
                  <GiBulletImpacts className="w-5 h-5 md:w-6 md:h-6" />
                  Access Command Center
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - Mobile Optimized */}
      <footer className="relative border-t border-red-900/30 bg-black/20 backdrop-blur-sm py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
            {/* Logo */}
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                <GiBatwingEmblem className="w-3 h-3 md:w-4 md:h-4 text-white" />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                  BLUDHAVEN
                </h3>
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center space-x-4 md:space-x-6 text-sm text-gray-400">
              <a href="#features" className="hover:text-red-400 transition-colors text-xs md:text-sm">
                Features
              </a>
              <a href="#about" className="hover:text-red-400 transition-colors text-xs md:text-sm">
                About
              </a>
              <Link href="/auth/login" className="hover:text-red-400 transition-colors text-xs md:text-sm">
                Login
              </Link>
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className="text-xs md:text-sm text-gray-500">
                Built with <FaDroplet className="inline w-3 h-3 text-red-500 mx-1" /> by{" "}
                <a 
                  href="http://1ndrajeet.is-a.dev/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  Jason Todd
                </a>
              </p>
              <p className="text-xs text-gray-600 mt-1">
                © 2025 Bludhaven. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(90deg); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(45deg); }
        }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 6s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 4s ease-in-out infinite; }
        
        /* Line clamp utilities */
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
        }
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
      `}</style>
    </div>
  )
}