'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMetaMask } from '@/app/providers'
import { 
  Shield, 
  Lock, 
  Wallet, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Zap, 
  Users, 
  FileText, 
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Brain,
  Fingerprint,
  Network,
  Boxes,
  Globe,
  Star,
  Play,
  ExternalLink,
  Github,
  Twitter,
  Linkedin,
  Menu,
  X as CloseIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// Animated gradient background
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-background to-background" />
      
      {/* Animated orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-cyan-600/20 to-blue-600/20 blur-3xl"
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-purple-600/10 to-pink-600/10 blur-3xl"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      {/* Noise texture */}
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
    </div>
  )
}

// Floating particles effect
function FloatingParticles() {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }))

  return (
    <div className="fixed inset-0 -z-5 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary/30"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

// 3D Card component with hover effects
function Feature3DCard({ icon: Icon, title, description, gradient, delay = 0 }: {
  icon: typeof Shield
  title: string
  description: string
  gradient: string
  delay?: number
}) {
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    setRotateX((y - centerY) / 10)
    setRotateY((centerX - x) / 10)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transformStyle: 'preserve-3d',
      }}
      className="group relative"
    >
      <div className={`absolute -inset-0.5 ${gradient} rounded-2xl blur-lg opacity-30 group-hover:opacity-60 transition-opacity duration-500`} />
      <Card className="relative p-6 h-full bg-card/80 backdrop-blur-xl border-white/10 hover:border-white/20 transition-all duration-300">
        <div 
          className={`w-14 h-14 rounded-xl ${gradient} flex items-center justify-center mb-4 shadow-lg`}
          style={{ transform: 'translateZ(40px)' }}
        >
          <Icon className="w-7 h-7 text-white" />
        </div>
        <h3 
          className="text-xl font-bold text-foreground mb-2"
          style={{ transform: 'translateZ(30px)' }}
        >
          {title}
        </h3>
        <p 
          className="text-muted-foreground text-sm leading-relaxed"
          style={{ transform: 'translateZ(20px)' }}
        >
          {description}
        </p>
      </Card>
    </motion.div>
  )
}

// Animated counter component
function AnimatedCounter({ value, suffix = '', prefix = '' }: { value: number, suffix?: string, prefix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      const duration = 2000
      const steps = 60
      const increment = value / steps
      let current = 0
      const timer = setInterval(() => {
        current += increment
        if (current >= value) {
          setCount(value)
          clearInterval(timer)
        } else {
          setCount(Math.floor(current))
        }
      }, duration / steps)
      return () => clearInterval(timer)
    }
  }, [isInView, value])

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}

// Interactive demo preview component
function DemoPreview() {
  const [activeRole, setActiveRole] = useState<'founder' | 'engineer' | 'marketing'>('founder')
  const [isAnimating, setIsAnimating] = useState(false)

  const roles = {
    founder: {
      color: 'from-emerald-500 to-green-500',
      badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      access: [
        { field: 'Revenue', value: '$5.2M', access: 'full' },
        { field: 'Legal Risks', value: 'Pending Lawsuit', access: 'full' },
        { field: 'Roadmap', value: 'V2 Launch Q2 2026', access: 'full' },
      ]
    },
    engineer: {
      color: 'from-blue-500 to-cyan-500',
      badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      access: [
        { field: 'Revenue', value: '$X.XM', access: 'partial' },
        { field: 'Legal Risks', value: '🔒 Denied', access: 'denied' },
        { field: 'Roadmap', value: 'V2 Launch Q2 2026', access: 'full' },
      ]
    },
    marketing: {
      color: 'from-purple-500 to-pink-500',
      badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      access: [
        { field: 'Revenue', value: '$X.XM', access: 'partial' },
        { field: 'Legal Risks', value: 'Minor operational challenges', access: 'semantic' },
        { field: 'Roadmap', value: 'V2 Launch Q2 2026', access: 'full' },
      ]
    }
  }

  const handleRoleChange = (role: typeof activeRole) => {
    setIsAnimating(true)
    setTimeout(() => {
      setActiveRole(role)
      setIsAnimating(false)
    }, 300)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="relative"
    >
      {/* Glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-cyan-600/20 rounded-3xl blur-2xl" />
      
      <div className="relative bg-card/90 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        {/* Mock browser chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-muted/50">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 rounded-full bg-muted text-xs text-muted-foreground flex items-center gap-2">
              <Lock className="w-3 h-3" />
              app.gatekeep.io/documents
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Role selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Connected as</p>
                <p className="font-mono text-sm">0x7a3B...4f2E</p>
              </div>
            </div>
            <div className={`px-3 py-1.5 rounded-full border text-sm font-medium ${roles[activeRole].badge}`}>
              {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}
            </div>
          </div>

          {/* Role tabs */}
          <div className="flex gap-2 p-1 bg-muted/50 rounded-lg">
            {(Object.keys(roles) as Array<keyof typeof roles>).map((role) => (
              <button
                key={role}
                onClick={() => handleRoleChange(role)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-300 ${
                  activeRole === role 
                    ? `bg-gradient-to-r ${roles[role].color} text-white shadow-lg` 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>

          {/* Document preview */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRole}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isAnimating ? 0 : 1, y: isAnimating ? 10 : 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {roles[activeRole].access.map((item, idx) => (
                <motion.div
                  key={item.field}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-4 rounded-xl border ${
                    item.access === 'full' ? 'border-green-500/30 bg-green-500/5' :
                    item.access === 'partial' ? 'border-yellow-500/30 bg-yellow-500/5' :
                    item.access === 'semantic' ? 'border-blue-500/30 bg-blue-500/5' :
                    'border-red-500/30 bg-red-500/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        item.access === 'full' ? 'bg-green-500/20' :
                        item.access === 'partial' ? 'bg-yellow-500/20' :
                        item.access === 'semantic' ? 'bg-blue-500/20' :
                        'bg-red-500/20'
                      }`}>
                        {item.access === 'full' && <Eye className="w-4 h-4 text-green-400" />}
                        {item.access === 'partial' && <EyeOff className="w-4 h-4 text-yellow-400" />}
                        {item.access === 'semantic' && <Sparkles className="w-4 h-4 text-blue-400" />}
                        {item.access === 'denied' && <Lock className="w-4 h-4 text-red-400" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.field}</p>
                        <p className={`text-sm ${
                          item.access === 'denied' ? 'text-red-400' : 
                          item.access === 'semantic' ? 'text-blue-400 italic' : 
                          item.access === 'partial' ? 'text-yellow-400 font-mono' :
                          'text-foreground'
                        }`}>
                          {item.value}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.access === 'full' ? 'bg-green-500/20 text-green-400' :
                      item.access === 'partial' ? 'bg-yellow-500/20 text-yellow-400' :
                      item.access === 'semantic' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {item.access === 'semantic' ? 'AI Masked' : item.access.charAt(0).toUpperCase() + item.access.slice(1)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

// Comparison table component
function AccessComparisonTable() {
  const features = [
    { name: 'Financial Data', founder: 'full', engineer: 'partial', marketing: 'partial' },
    { name: 'Legal Documents', founder: 'full', engineer: 'denied', marketing: 'semantic' },
    { name: 'Technical Specs', founder: 'full', engineer: 'full', marketing: 'semantic' },
    { name: 'Strategy Docs', founder: 'full', engineer: 'partial', marketing: 'full' },
    { name: 'HR Records', founder: 'full', engineer: 'denied', marketing: 'denied' },
  ]

  const getAccessBadge = (access: string) => {
    switch (access) {
      case 'full':
        return <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">Full</span>
      case 'partial':
        return <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">Partial</span>
      case 'semantic':
        return <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">AI</span>
      case 'denied':
        return <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400 border border-red-500/30">Denied</span>
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Document Type</th>
              <th className="text-center p-4 text-sm font-semibold">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400">Founder</span>
              </th>
              <th className="text-center p-4 text-sm font-semibold">
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400">Engineer</span>
              </th>
              <th className="text-center p-4 text-sm font-semibold">
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400">Marketing</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, idx) => (
              <motion.tr
                key={feature.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="p-4 text-sm font-medium">{feature.name}</td>
                <td className="p-4 text-center">{getAccessBadge(feature.founder)}</td>
                <td className="p-4 text-center">{getAccessBadge(feature.engineer)}</td>
                <td className="p-4 text-center">{getAccessBadge(feature.marketing)}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

// Technology stack component
function TechStack() {
  const technologies = [
    { name: 'MetaMask', icon: Wallet, color: 'from-orange-500 to-amber-500' },
    { name: 'Blockchain', icon: Network, color: 'from-blue-500 to-cyan-500' },
    { name: 'Gemini AI', icon: Brain, color: 'from-violet-500 to-purple-500' },
    { name: 'Supabase', icon: Boxes, color: 'from-emerald-500 to-green-500' },
    { name: 'Next.js', icon: Globe, color: 'from-gray-600 to-gray-800' },
    { name: 'Real-time', icon: Zap, color: 'from-yellow-500 to-orange-500' },
  ]

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {technologies.map((tech, idx) => (
        <motion.div
          key={tech.name}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.1 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="group"
        >
          <div className={`relative p-4 rounded-xl bg-gradient-to-br ${tech.color} shadow-lg`}>
            <tech.icon className="w-8 h-8 text-white" />
          </div>
          <p className="text-center text-xs text-muted-foreground mt-2 group-hover:text-foreground transition-colors">
            {tech.name}
          </p>
        </motion.div>
      ))}
    </div>
  )
}

// Main landing page component
export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { scrollYProgress } = useScroll()
  const heroRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { isConnected, isLoading, connect } = useMetaMask()
  
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])
  const y = useTransform(scrollYProgress, [0, 0.2], [0, 50])

  // Handle connect and navigate
  const handleConnectAndLaunch = async () => {
    if (isConnected) {
      router.push('/app')
      return
    }
    try {
      await connect()
      router.push('/app')
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <AnimatedBackground />
      <FloatingParticles />

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between px-6 py-3 rounded-2xl bg-card/80 backdrop-blur-xl border border-white/10 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                GateKeep
              </span>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#demo" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Demo</a>
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
              <a href="#tech" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Technology</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Button 
                onClick={handleConnectAndLaunch}
                disabled={isLoading}
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/25"
              >
                {isLoading ? 'Connecting...' : isConnected ? 'Launch App' : 'Connect & Launch'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <CloseIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="md:hidden mt-2 p-4 rounded-2xl bg-card/95 backdrop-blur-xl border border-white/10"
              >
                <div className="flex flex-col gap-4">
                  <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => setIsMenuOpen(false)}>Features</a>
                  <a href="#demo" className="text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => setIsMenuOpen(false)}>Demo</a>
                  <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => setIsMenuOpen(false)}>How it Works</a>
                  <a href="#tech" className="text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => setIsMenuOpen(false)}>Technology</a>
                  <Button 
                    onClick={() => { setIsMenuOpen(false); handleConnectAndLaunch(); }}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white"
                  >
                    {isLoading ? 'Connecting...' : isConnected ? 'Launch App' : 'Connect & Launch'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        style={{ opacity, scale, y }}
        className="relative min-h-screen flex items-center justify-center pt-24 px-4"
      >
        <div className="max-w-7xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-8"
          >
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-violet-300">Powered by AI & Blockchain</span>
            <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-xs text-violet-300">DevFest 5.0 Goa</span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6"
          >
            <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Intelligent
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              Document Access
            </span>
            <br />
            <span className="bg-gradient-to-r from-fuchsia-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
              Control
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10"
          >
            Secure your sensitive documents with wallet-based authentication and 
            <span className="text-violet-400 font-semibold"> AI-powered semantic masking</span>. 
            Role-based access control that adapts to your organization's hierarchy.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button 
              size="lg"
              onClick={handleConnectAndLaunch}
              disabled={isLoading}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-2xl shadow-violet-500/30 px-8 py-6 text-lg"
            >
              <Wallet className="w-5 h-5 mr-2" />
              {isLoading ? 'Connecting...' : isConnected ? 'Launch App' : 'Connect Wallet & Start'}
            </Button>
            <a href="#demo">
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white/20 bg-white/5 backdrop-blur-xl hover:bg-white/10 px-8 py-6 text-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                See Demo
              </Button>
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {[
              { value: 4, suffix: '', label: 'Access Levels' },
              { value: 100, suffix: '%', label: 'On-Chain Verified' },
              { value: 3, suffix: '', label: 'AI Masking Modes' },
              { value: 0, suffix: 'ms', prefix: '<50', label: 'Latency' },
            ].map((stat, idx) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  {stat.prefix || ''}<AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2"
            >
              <motion.div
                animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-violet-400"
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm text-violet-400 font-semibold tracking-wider uppercase">Features</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
              Enterprise-Grade Security,
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Simplified
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Combine the immutability of blockchain with the intelligence of AI to create 
              a document access system that's both secure and smart.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Feature3DCard
              icon={Wallet}
              title="Wallet-Based Auth"
              description="No passwords needed. Your MetaMask wallet is your identity. Cryptographic security built in."
              gradient="bg-gradient-to-br from-orange-500 to-amber-500"
              delay={0.1}
            />
            <Feature3DCard
              icon={Shield}
              title="Role-Based Access"
              description="Assign granular roles to wallet addresses. Owner, Founder, Engineer, Marketing - each with custom permissions."
              gradient="bg-gradient-to-br from-emerald-500 to-green-500"
              delay={0.2}
            />
            <Feature3DCard
              icon={Sparkles}
              title="AI Semantic Masking"
              description="Gemini AI intelligently rewrites sensitive content while preserving context. More than redaction."
              gradient="bg-gradient-to-br from-violet-500 to-purple-500"
              delay={0.3}
            />
            <Feature3DCard
              icon={EyeOff}
              title="Partial Masking"
              description="Show just enough - first and last characters visible. Perfect for verification without full disclosure."
              gradient="bg-gradient-to-br from-yellow-500 to-orange-500"
              delay={0.4}
            />
            <Feature3DCard
              icon={Zap}
              title="Real-time Updates"
              description="Supabase-powered real-time subscriptions. Access changes propagate instantly across all connected clients."
              gradient="bg-gradient-to-br from-cyan-500 to-blue-500"
              delay={0.5}
            />
            <Feature3DCard
              icon={Fingerprint}
              title="Immutable Audit Trail"
              description="Every access request, every role change - permanently recorded. Complete transparency and accountability."
              gradient="bg-gradient-to-br from-pink-500 to-rose-500"
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section id="demo" className="py-24 px-4 bg-gradient-to-b from-transparent via-violet-950/20 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <span className="text-sm text-violet-400 font-semibold tracking-wider uppercase">Interactive Demo</span>
              <h2 className="text-4xl md:text-5xl font-bold">
                See Access Control
                <br />
                <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  in Action
                </span>
              </h2>
              <p className="text-muted-foreground text-lg">
                Watch how the same document appears differently based on user roles. 
                Switch between Founder, Engineer, and Marketing to see real-time access transformations.
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: Eye, color: 'text-green-400', title: 'Full Access', desc: 'Complete visibility for authorized roles' },
                  { icon: EyeOff, color: 'text-yellow-400', title: 'Partial Mask', desc: 'First/last characters only - verify without exposing' },
                  { icon: Sparkles, color: 'text-blue-400', title: 'Semantic Mask', desc: 'AI rewrites to remove sensitive details' },
                  { icon: Lock, color: 'text-red-400', title: 'Access Denied', desc: 'Role doesn\'t have permission to view' },
                ].map((item, idx) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-4"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${item.color}`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <DemoPreview />
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm text-violet-400 font-semibold tracking-wider uppercase">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
              Three Simple Steps to
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Secure Access
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500" />
            
            {[
              {
                step: '01',
                icon: Wallet,
                title: 'Connect Wallet',
                description: 'Connect your MetaMask wallet. First connection becomes the document owner with full administrative rights.',
              },
              {
                step: '02',
                icon: Users,
                title: 'Assign Roles',
                description: 'Owner assigns roles to other wallet addresses. Each role has predefined access permissions to documents.',
              },
              {
                step: '03',
                icon: FileText,
                title: 'Access Documents',
                description: 'Users view documents based on their role. AI automatically masks sensitive content as configured.',
              },
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-2xl shadow-violet-500/30">
                      <item.icon className="w-10 h-10 text-white" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-background border-2 border-violet-500 flex items-center justify-center text-sm font-bold text-violet-400">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Access Matrix Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-transparent via-fuchsia-950/10 to-transparent">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-sm text-violet-400 font-semibold tracking-wider uppercase">Access Matrix</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
              Granular Permission
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Control
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Define exactly who can see what. Different document types, different access levels for each role.
            </p>
          </motion.div>

          <AccessComparisonTable />
        </div>
      </section>

      {/* Technology Stack Section */}
      <section id="tech" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm text-violet-400 font-semibold tracking-wider uppercase">Technology</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
              Built With
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Cutting-Edge Tech
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
              A powerful combination of Web3 infrastructure, AI capabilities, and modern web technologies.
            </p>
          </motion.div>

          <TechStack />

          {/* Tech details cards */}
          <div className="grid md:grid-cols-2 gap-6 mt-16">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 h-full bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border-violet-500/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">Gemini AI Integration</h3>
                    <p className="text-sm text-muted-foreground">
                      Google's Gemini AI powers our semantic masking feature. It intelligently rewrites 
                      sensitive content while preserving the essential meaning - far more sophisticated 
                      than simple redaction.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 h-full bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">MetaMask Authentication</h3>
                    <p className="text-sm text-muted-foreground">
                      No passwords, no account creation. Users authenticate with their Ethereum wallet, 
                      leveraging cryptographic signatures for identity verification. Truly passwordless 
                      and decentralized.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/30 via-fuchsia-600/30 to-cyan-600/30 rounded-3xl blur-2xl" />
            
            <Card className="relative p-12 bg-card/80 backdrop-blur-xl border-white/10 text-center overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
              
              <div className="relative">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6"
                >
                  <Star className="w-4 h-4 text-violet-400" />
                  <span className="text-sm text-violet-300">DevFest 5.0 Goa Hackathon Project</span>
                </motion.div>
                
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Ready to Secure Your
                  <br />
                  <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                    Documents?
                  </span>
                </h2>
                
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
                  Experience the future of document access control. Connect your wallet and 
                  see how AI and blockchain work together to protect your sensitive data.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button 
                    size="lg"
                    onClick={handleConnectAndLaunch}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-2xl shadow-violet-500/30 px-8"
                  >
                    <Wallet className="w-5 h-5 mr-2" />
                    {isLoading ? 'Connecting...' : isConnected ? 'Launch GateKeep' : 'Connect & Launch'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <a href="https://github.com/nbharath1306/sapient-scholars-Devfest-5.0-Goa" target="_blank" rel="noopener noreferrer">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="border-white/20 bg-white/5 hover:bg-white/10"
                    >
                      <Github className="w-5 h-5 mr-2" />
                      View on GitHub
                    </Button>
                  </a>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                GateKeep
              </span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Built with ❤️ by <span className="text-violet-400 font-semibold">Sapient Scholars</span> for DevFest 5.0 Goa
            </p>
            
            <div className="flex items-center gap-4">
              <a href="https://github.com/nbharath1306/sapient-scholars-Devfest-5.0-Goa" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
