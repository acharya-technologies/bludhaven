"use client"
import { useState, useEffect, useRef, SetStateAction } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Target, Shield, Zap, Lock, ArrowRight, Skull, 
  Crown, Eye, CheckCircle2, Database, Workflow, 
  BarChart3, Users, Clock, TrendingUp, Activity,
  Menu, X, Loader2,
  UserCog2
} from "lucide-react"
import { GiBatwingEmblem, GiBulletImpacts } from "react-icons/gi"
import { FaDroplet, FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa6"
import Header from "@/components/Header"
import { HashLoader } from "react-spinners"

export default function RedHoodLandingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hoveredFeature, setHoveredFeature] = useState<number | string | null>(null)
  const [clickedButton, setClickedButton] = useState<string | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const featuresRef = useRef(null)
  const aboutRef = useRef(null)

  // Simulate initial loading with skeleton screen pattern
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      setIsVisible(true)
    }, 200)
    return () => clearTimeout(timer)
  }, [])

  // Scroll progress tracking
  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (scrollTop / docHeight) * 100
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', updateScrollProgress)
    return () => window.removeEventListener('scroll', updateScrollProgress)
  }, [])

  // Button click feedback
  const handleButtonClick = (buttonName: string | null) => {
    setClickedButton(buttonName)
    setTimeout(() => setClickedButton(null), 300)
  }

  // Haptic feedback simulation
  const triggerHapticFeedback = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }
  }

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

  // Loading skeleton component
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <HashLoader color="#EF4444" size={60} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Scroll Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-red-500 to-red-600 z-50 transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Animated Background with Enhanced Micro-Interactions */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(220,38,38,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.1)_1px,transparent_1px)] bg-[size:32px_32px] md:bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        
        {/* Interactive Floating Elements */}
        <div className="absolute top-1/4 left-1/4 w-48 h-48 md:w-96 md:h-96 bg-red-900/10 rounded-full blur-2xl md:blur-3xl animate-float-slow hover:scale-101 transition-transform duration-1000" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 md:w-96 md:h-96 bg-red-800/10 rounded-full blur-2xl md:blur-3xl animate-float-medium hover:scale-101 transition-transform duration-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-64 md:h-64 bg-red-700/10 rounded-full blur-xl md:blur-2xl animate-float-fast hover:scale-101 transition-transform duration-1000" />
        
        {/* Enhanced Particle Effects with Interaction */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-red-500/40 rounded-full animate-pulse cursor-pointer hover:scale-150 hover:bg-red-400 transition-all duration-300"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
              onClick={() => triggerHapticFeedback()}
            />
          ))}
        </div>
      </div>

      <Header/>

      {/* Enhanced Hero Section with Micro-Interactions */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="max-w-6xl mx-auto text-center w-full">
          {/* Interactive Badge */}
          <div 
            className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-red-600/10 border border-red-600/40 mb-6 md:mb-8 group hover:border-red-500/60 hover:scale-101 transition-all duration-300 hover:bg-red-600/20"
            onMouseEnter={() => triggerHapticFeedback()}
          >
            <Crown className="w-3 h-3 md:w-4 md:h-4 text-red-500 group-hover:scale-101 transition-transform duration-300" />
            <span className="text-xs md:text-sm text-red-400 uppercase tracking-wider font-medium group-hover:text-red-300 transition-colors">
              Exclusive Operator Access
            </span>
          </div>

          {/* Main Heading with Staggered Animation */}
          <h1 className={`text-4xl sm:text-6xl lg:text-8xl font-bold mb-4 md:mb-6 leading-tight transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent hover:from-red-300 hover:to-red-500 transition-all duration-500">
              BLUDHAVEN
            </span>
          </h1>

          {/* Subheading */}
          <p className={`text-lg sm:text-xl md:text-2xl text-gray-400 mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            Tactical project management for solo operators. Track missions, manage payments, and dominate your workflow.
          </p>

          {/* Enhanced CTA Buttons with Loading States */}
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-8 md:mb-12 transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <Link href="/auth/login" className="w-full sm:w-auto">
              <Button 
                className={`w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-6 md:px-8 py-4 md:py-6 text-base md:text-lg font-semibold group relative overflow-hidden transition-all duration-300 ${
                  clickedButton === 'login' ? 'scale-95' : 'scale-100'
                }`}
                onClick={() => handleButtonClick('login')}
                onMouseEnter={() => triggerHapticFeedback()}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <span className="flex items-center gap-2 relative z-10">
                  {clickedButton === 'login' ? (
                    <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4 md:w-5 md:h-5" />
                  )}
                  {clickedButton === 'login' ? 'Accessing...' : 'Enter Command Center'}
                  <ArrowRight className={`w-4 h-4 md:w-5 md:h-5 transition-transform ${
                    clickedButton === 'login' ? 'scale-0' : 'group-hover:translate-x-1'
                  }`} />
                </span>
              </Button>
            </Link>
            
            <Link href="/guest" className="w-full sm:w-auto">
              <Button 
                variant="outline" 
                className={`w-full sm:w-auto border-gray-700 text-gray-300 hover:border-red-600 hover:text-red-400 px-6 md:px-8 py-4 md:py-6 text-base md:text-lg font-semibold transition-all duration-300 ${
                  clickedButton === 'features' ? 'scale-95' : 'scale-100'
                }`}
                onMouseEnter={() => triggerHapticFeedback()}
              >
                <UserCog2 className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Visit As Guest
              </Button>
            </Link>
          </div>

          {/* Interactive Stats Grid */}
          <div className={`grid md:grid-cols-4 grid-cols-2 gap-4 md:gap-8 max-w-2xl mx-auto transition-all duration-1000 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center group cursor-pointer transform hover:scale-101 transition-all duration-300"
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className={`w-10 h-10 md:w-12 md:h-12 bg-red-600/10 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3 transition-all duration-300 ${
                  hoveredFeature === index ? 'scale-101 bg-red-600/20' : 'scale-100'
                }`}>
                  <stat.icon className={`w-5 h-5 md:w-6 md:h-6 text-red-500 transition-all duration-300 ${
                    hoveredFeature === index ? 'scale-125 text-red-400' : 'scale-100'
                  }`} />
                </div>
                <div className="text-xl md:text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className={`text-xs md:text-sm transition-all duration-300 ${
                  hoveredFeature === index ? 'text-red-400' : 'text-gray-400'
                }`}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Scroll Indicator */}
        <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 animate-bounce hover:scale-101 transition-transform duration-300">
          <div className="w-5 h-8 md:w-6 md:h-10 border-2 border-red-600/50 rounded-full flex justify-center cursor-pointer group">
            <div className="w-1 h-2 md:h-3 bg-red-600 rounded-full mt-2 animate-pulse group-hover:bg-red-400 transition-colors" />
          </div>
        </div>
      </section>

      {/* Enhanced Features Section with Magnetic Hover Effects */}
      <section id="features" className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8" ref={featuresRef}>
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6">
              <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent hover:from-red-300 hover:to-red-500 transition-all duration-500">
                Mission
              </span>{" "}
              <span className="text-white">Control</span>
            </h2>
            <p className="text-base md:text-xl text-gray-400 max-w-2xl mx-auto px-4">
              Everything you need to manage your operations with the precision of a master strategist.
            </p>
          </div>

          {/* Enhanced Features Grid with Magnetic Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 md:p-6 hover:border-red-600/50 transition-all duration-500 hover:scale-101 cursor-pointer transform hover:-translate-y-2 magnetic-card"
                onMouseEnter={() => {
                  setHoveredFeature(index)
                  triggerHapticFeedback()
                }}
                onMouseLeave={() => setHoveredFeature(null)}
                style={{
                  transform: hoveredFeature === index ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <div className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-3 md:mb-4 transition-all duration-300 group-hover:scale-101 ${
                  hoveredFeature === index ? 'shadow-lg shadow-red-500/20' : ''
                }`}>
                  <feature.icon className={`w-5 h-5 md:w-6 md:h-6 text-white transition-all duration-300 ${
                    hoveredFeature === index ? 'scale-101' : 'scale-100'
                  }`} />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3 group-hover:text-red-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm md:text-base text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  {feature.description}
                </p>
                
                {/* Hidden hover indicator */}
                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-red-500 transition-all duration-300 ${
                  hoveredFeature === index ? 'w-16' : 'w-0'
                }`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Dashboard Preview Section */}
      <section className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-br from-black via-red-950/20 to-black border border-red-900/30 rounded-xl md:rounded-2xl p-6 md:p-12 group hover:border-red-600/50 transition-all duration-500">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(220,38,38,0.15),transparent_70%)] group-hover:opacity-80 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(185,28,28,0.1),transparent_70%)] group-hover:opacity-80 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
                {/* Left Content */}
                <div className="space-y-4 md:space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-red-600/10 border border-red-600/40 backdrop-blur-sm group hover:border-red-500/60 hover:scale-101 transition-all duration-300 cursor-pointer">
                    <Shield className="w-3 h-3 md:w-4 md:h-4 text-red-500 group-hover:scale-101 transition-transform duration-300" />
                    <span className="text-xs text-red-400 uppercase tracking-wider font-medium group-hover:text-red-300 transition-colors">
                      Crime Alley Operations
                    </span>
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold">
                      <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent hover:from-red-300 hover:to-red-500 transition-all duration-500">
                        Solo Operator
                      </span>{" "}
                      <span className="text-white">Dashboard</span>
                    </h2>
                    <p className="text-lg md:text-xl text-gray-300 font-medium group-hover:text-gray-200 transition-colors">
                      Built for lone wolves who get the job done
                    </p>
                  </div>

                  <p className="text-base md:text-lg text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                    Monitor every project with military precision. Real-time updates, secure payment tracking, and encrypted data.
                  </p>

                  {/* Interactive Feature Pills */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { icon: Target, text: "Mission Tracking" },
                      { icon: Activity, text: "Real-time Intel" },
                      { icon: Lock, text: "Encrypted Data" },
                      { icon: Zap, text: "Fast Execution" }
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900/50 border border-gray-800 group hover:border-red-600/50 hover:scale-101 transition-all duration-300 cursor-pointer"
                        onMouseEnter={() => triggerHapticFeedback()}
                      >
                        <item.icon className="w-3 h-3 md:w-4 md:h-4 text-red-500 group-hover:scale-101 transition-transform duration-300" />
                        <span className="text-xs md:text-sm text-gray-300 group-hover:text-red-400 transition-colors">
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enhanced Feature Cards with Staggered Animation */}
                <div className="space-y-3 md:space-y-4">
                  {dashboardFeatures.map((item, i) => (
                    <div
                      key={i}
                      className={`bg-gradient-to-br ${item.color} border border-gray-800 rounded-lg md:rounded-xl p-3 md:p-5 backdrop-blur-sm group hover:border-red-600/50 hover:scale-101 transition-all duration-300 cursor-pointer transform hover:-translate-y-1`}
                      style={{
                        transitionDelay: `${i * 100}ms`
                      }}
                      onMouseEnter={() => {
                        setHoveredFeature(`dashboard-${i}`)
                        triggerHapticFeedback()
                      }}
                      onMouseLeave={() => setHoveredFeature(null)}
                    >
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className={`p-2 md:p-3 rounded-lg bg-gray-900/50 border border-gray-800 flex-shrink-0 transition-all duration-300 ${
                          hoveredFeature === `dashboard-${i}` ? 'scale-101 border-red-500/50' : 'scale-100'
                        }`}>
                          <item.icon className={`w-4 h-4 md:w-5 md:h-5 text-red-500 transition-all duration-300 ${
                            hoveredFeature === `dashboard-${i}` ? 'scale-101' : 'scale-100'
                          }`} />
                        </div>
                        <div className="flex-1 space-y-1 min-w-0">
                          <h3 className="text-white font-semibold text-base md:text-lg group-hover:text-red-400 transition-colors line-clamp-1">
                            {item.title}
                          </h3>
                          <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 group-hover:text-gray-300 transition-colors">
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

      {/* Enhanced About Section */}
      <section id="about" className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8" ref={aboutRef}>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6">
                Built by{" "}
                <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent hover:from-red-300 hover:to-red-500 transition-all duration-500">
                  Jason Todd
                </span>
              </h2>
              <p className="text-base md:text-lg text-gray-400 leading-relaxed hover:text-gray-300 transition-colors duration-300">
                When existing tools failed to meet the demands of precision project management, we built our own arsenal.
              </p>
              <p className="text-base md:text-lg text-gray-400 leading-relaxed hover:text-gray-300 transition-colors duration-300">
                This isn't just another project management tool. It's a weapon designed for operators who refuse to compromise.
              </p>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
                <Link href="http://1ndrajeet.is-a.dev/" target="_blank">
                  <Button 
                    variant="outline" 
                    className="border-gray-700 text-gray-300 hover:border-red-600 hover:text-red-400 hover:scale-101 transition-all duration-300"
                    onMouseEnter={() => triggerHapticFeedback()}
                  >
                    <FaDroplet className="w-4 h-4 mr-2" />
                    Visit Creator
                  </Button>
                </Link>
                
                <div className="flex gap-2 md:gap-3">
                  {[
                    { icon: FaGithub, href: "https://github.com/1ndrajeet" },
                    { icon: FaLinkedin, href: "https://linkedin.com/in/1ndrajeet" },
                    { icon: FaInstagram, href: "https://www.instagram.com/omkar_.kulkarni/" }
                  ].map((social, i) => (
                    <a 
                      key={i}
                      href={social.href}
                      className="w-8 h-8 md:w-10 md:h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-red-600 hover:scale-101 transition-all duration-300 group"
                      onMouseEnter={() => triggerHapticFeedback()}
                    >
                      <social.icon className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-101 transition-transform duration-300" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhanced Performance Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
              {performance.map((item, index) => (
                <div 
                  key={index} 
                  className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg md:rounded-xl p-3 md:p-4 text-center group hover:border-red-600/50 hover:scale-101 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                  onMouseEnter={() => {
                    setHoveredFeature(`performance-${index}`)
                    triggerHapticFeedback()
                  }}
                  onMouseLeave={() => setHoveredFeature(null)}
                >
                  <item.icon className={`w-6 h-6 md:w-8 md:h-8 text-red-500 mx-auto mb-1 md:mb-2 transition-all duration-300 ${
                    hoveredFeature === `performance-${index}` ? 'scale-101 text-red-400' : 'scale-100'
                  }`} />
                  <div className="text-lg md:text-2xl font-bold text-white mb-1 group-hover:text-red-400 transition-colors">
                    {item.value}
                  </div>
                  <div className={`text-xs md:text-sm transition-all duration-300 ${
                    hoveredFeature === `performance-${index}` ? 'text-red-400' : 'text-gray-400'
                  }`}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-red-600/10 to-red-900/20 border border-red-600/30 rounded-xl md:rounded-3xl p-6 md:p-12 backdrop-blur-sm group hover:border-red-500/50 hover:scale-101 transition-all duration-500">
            <GiBatwingEmblem className="w-12 h-12 md:w-16 md:h-16 text-red-500 mx-auto mb-4 md:mb-6 group-hover:scale-101 group-hover:text-red-400 transition-all duration-300" />
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 md:mb-6">
              Ready to{" "}
              <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent group-hover:from-red-300 group-hover:to-red-500 transition-all duration-500">
                Take Control?
              </span>
            </h2>
            <p className="text-base md:text-xl text-gray-400 mb-6 md:mb-8 max-w-2xl mx-auto group-hover:text-gray-300 transition-colors">
              Join the elite operators who trust Bludhaven with their most critical missions.
            </p>
            <Link href="/auth/login">
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white px-8 md:px-12 py-4 md:py-6 text-base md:text-lg font-semibold group relative overflow-hidden w-full sm:w-auto hover:scale-101 transition-all duration-300"
                onClick={() => handleButtonClick('cta')}
                onMouseEnter={() => triggerHapticFeedback()}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <span className="flex items-center gap-2 md:gap-3 relative z-10">
                  <GiBulletImpacts className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-101 transition-transform duration-300" />
                  {clickedButton === 'cta' ? 'Accessing Command Center...' : 'Access Command Center'}
                  <ArrowRight className={`w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 ${
                    clickedButton === 'cta' ? 'scale-0' : 'group-hover:translate-x-1'
                  }`} />
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="relative border-t border-red-900/30 bg-black/20 backdrop-blur-sm py-8 md:py-12 px-4 sm:px-6 lg:px-8 group hover:border-red-600/50 transition-all duration-500">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
            {/* Interactive Logo */}
            <div className="flex items-center space-x-2 md:space-x-3 group cursor-pointer hover:scale-101 transition-transform duration-300">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center group-hover:from-red-500 group-hover:to-red-700 transition-all duration-300">
                <GiBatwingEmblem className="w-3 h-3 md:w-4 md:h-4 text-white group-hover:scale-101 transition-transform duration-300" />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent group-hover:from-red-300 group-hover:to-red-500 transition-all duration-300">
                  BLUDHAVEN
                </h3>
              </div>
            </div>

            {/* Enhanced Links */}
            <div className="flex items-center space-x-4 md:space-x-6 text-sm text-gray-400">
              {['Features', 'About', 'Login'].map((item) => (
                <a 
                  key={item}
                  href={item === 'Login' ? '/auth/login' : `#${item.toLowerCase()}`}
                  className="hover:text-red-400 transition-colors text-xs md:text-sm hover:scale-101 transform transition-transform duration-300"
                  onMouseEnter={() => triggerHapticFeedback()}
                >
                  {item}
                </a>
              ))}
            </div>

            {/* Enhanced Copyright */}
            <div className="text-center md:text-right group">
              <p className="text-xs md:text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
                Built with <FaDroplet className="inline w-3 h-3 text-red-500 mx-1 group-hover:scale-101 transition-transform duration-300" /> by{" "}
                <a 
                  href="http://1ndrajeet.is-a.dev/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-red-400 hover:text-red-300 transition-colors hover:scale-101 transform transition-transform duration-300"
                  onMouseEnter={() => triggerHapticFeedback()}
                >
                  Jason Todd
                </a>
              </p>
              <p className="text-xs text-gray-600 mt-1 group-hover:text-gray-500 transition-colors">
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
        
        /* Magnetic card effect */
        .magnetic-card {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Enhanced focus styles for accessibility */
        button:focus-visible,
        a:focus-visible {
          outline: 2px solid #ef4444;
          outline-offset: 2px;
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
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

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  )
}