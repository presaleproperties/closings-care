import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  Calendar,
  Shield,
  BarChart3,
  Star,
  DollarSign,
  AlertTriangle,
  Clock,
  Wallet,
  FileSpreadsheet,
  HeartPulse,
  Eye,
  Calculator,
  Banknote,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Menu,
  X
} from "lucide-react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";

// Animated counter component
function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  
  useEffect(() => {
    if (isInView) {
      const duration = 1800;
      const steps = 50;
      const increment = value / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(current);
        }
      }, duration / steps);
      
      return () => clearInterval(timer);
    }
  }, [isInView, value]);
  
  return (
    <span ref={ref}>
      {prefix}{decimals > 0 ? displayValue.toFixed(decimals) : Math.floor(displayValue).toLocaleString()}{suffix}
    </span>
  );
}

// Mobile Phone Mockup for Hero - Simplified for mobile viewing
function MobilePhoneMockup() {
  return (
    <motion.div 
      className="relative mx-auto"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      {/* Phone frame */}
      <div className="relative w-[260px] sm:w-[280px] mx-auto">
        {/* Phone body */}
        <div className="bg-slate-900 rounded-[2.5rem] p-2 shadow-2xl shadow-slate-400/30">
          {/* Screen */}
          <div className="bg-white rounded-[2rem] overflow-hidden">
            {/* Status bar */}
            <div className="bg-slate-50 px-5 py-2 flex items-center justify-between">
              <span className="text-[10px] font-medium text-slate-600">9:41</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-2 bg-slate-600 rounded-sm" />
              </div>
            </div>
            
            {/* App content */}
            <div className="px-4 py-4 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500">Good morning</p>
                  <p className="text-sm font-semibold text-slate-800">Sarah Chen</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-[10px] font-bold">
                  SC
                </div>
              </div>
              
              {/* Safe to Spend Card */}
              <motion.div 
                className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 text-white"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-[10px] text-emerald-100 mb-1">Safe to Spend</p>
                <p className="text-2xl font-bold">$7,750</p>
                <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-100">
                  <Shield className="h-3 w-3" />
                  All obligations covered
                </div>
              </motion.div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-2">
                <motion.div 
                  className="bg-slate-50 rounded-xl p-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <p className="text-[9px] text-slate-500">YTD Income</p>
                  <p className="text-sm font-bold text-slate-800">$142,800</p>
                  <p className="text-[9px] text-emerald-600 flex items-center gap-0.5">
                    <ArrowUpRight className="h-2 w-2" />+18%
                  </p>
                </motion.div>
                <motion.div 
                  className="bg-slate-50 rounded-xl p-3"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <p className="text-[9px] text-slate-500">Tax Set Aside</p>
                  <p className="text-sm font-bold text-slate-800">$16,426</p>
                  <p className="text-[9px] text-teal-600">11.5% rate</p>
                </motion.div>
              </div>
              
              {/* Mini Chart Preview */}
              <motion.div 
                className="bg-slate-50 rounded-xl p-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
              >
                <p className="text-[9px] text-slate-500 mb-2">12-Month Projection</p>
                <div className="flex items-end justify-between gap-1 h-12">
                  {[45, 65, 35, 85, 55, 75, 40, 90, 70, 80, 60, 85].map((h, i) => (
                    <motion.div
                      key={i}
                      className={`flex-1 rounded-t-sm ${i === 2 || i === 6 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 1.1 + i * 0.03 }}
                      style={{ height: `${h}%`, transformOrigin: 'bottom' }}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
        
        {/* Floating notification - adjusted for mobile */}
        <motion.div 
          className="absolute -right-2 top-24 bg-white rounded-lg shadow-lg shadow-slate-200/60 p-2 border border-slate-100 text-[10px]"
          initial={{ opacity: 0, scale: 0.8, x: 10 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ delay: 1.4, duration: 0.3 }}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            </div>
            <span className="font-medium text-slate-700">Tax ready ✓</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Desktop Dashboard Mockup (hidden on mobile)
function DesktopDashboardMockup() {
  return (
    <div className="relative hidden lg:block">
      {/* Browser frame */}
      <motion.div 
        className="bg-white rounded-2xl shadow-2xl shadow-slate-300/40 border border-slate-200/80 overflow-hidden"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Browser bar */}
        <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white rounded-lg px-4 py-1.5 text-xs text-slate-400 border border-slate-200 flex items-center gap-2">
              <Shield className="h-3 w-3 text-emerald-500" />
              app.commissioniq.ca/dashboard
            </div>
          </div>
        </div>
        
        {/* Dashboard content */}
        <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100/50">
          {/* Header */}
          <motion.div 
            className="flex items-center justify-between mb-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Good morning, Sarah</h3>
              <p className="text-xs text-slate-500">Here's your financial snapshot</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
              SC
            </div>
          </motion.div>

          {/* KPI Row */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { label: "Safe to Spend", value: "$7,750", gradient: true },
              { label: "YTD Income", value: "$142,800", trend: "+18% vs last year" },
              { label: "Pipeline", value: "$76,500", trend: "5 pending deals" },
              { label: "Tax Set Aside", value: "$16,426", trend: "11.5% rate" },
            ].map((kpi, i) => (
              <motion.div
                key={kpi.label}
                className={`rounded-xl p-4 ${kpi.gradient ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-white'} shadow-lg shadow-slate-200/50 border border-slate-100/50`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
              >
                <p className={`text-xs ${kpi.gradient ? 'text-emerald-100' : 'text-slate-500'} font-medium mb-1`}>{kpi.label}</p>
                <p className={`text-xl font-bold ${kpi.gradient ? 'text-white' : 'text-slate-800'}`}>{kpi.value}</p>
                {kpi.trend && (
                  <p className="text-xs text-emerald-600 mt-1 flex items-center gap-0.5">
                    <ArrowUpRight className="h-3 w-3" />{kpi.trend}
                  </p>
                )}
              </motion.div>
            ))}
          </div>

          {/* Charts placeholder */}
          <motion.div 
            className="bg-white rounded-xl p-4 shadow-sm border border-slate-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-slate-800">12-Month Projection</h4>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Income
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  Expenses
                </span>
              </div>
            </div>
            <div className="flex items-end justify-between gap-2 h-24">
              {[45, 65, 35, 85, 55, 75].map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 flex gap-0.5"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 1.1 + i * 0.1 }}
                  style={{ transformOrigin: 'bottom' }}
                >
                  <div className="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-sm" style={{ height: `${h}%` }} />
                  <div className="flex-1 bg-slate-200 rounded-t-sm" style={{ height: `${h * 0.35}%` }} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Floating elements */}
      <motion.div 
        className="absolute -right-6 top-20 bg-white rounded-xl shadow-xl shadow-slate-200/60 p-3 border border-slate-100"
        initial={{ opacity: 0, scale: 0.8, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: 1.5, duration: 0.4 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500">BC Corp Tax (11.5%)</p>
            <p className="text-xs font-bold text-slate-800">$16,426 set aside</p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="absolute -left-4 bottom-24 bg-white rounded-xl shadow-xl shadow-slate-200/60 p-3 border border-slate-100"
        initial={{ opacity: 0, scale: 0.8, x: -20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: 1.7, duration: 0.4 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-teal-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500">Pipeline coverage</p>
            <p className="text-xs font-bold text-slate-800">7.4 months runway</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Mobile-optimized feature cards
function MobileFeatureCard({ 
  icon: Icon, 
  title, 
  description,
  stat,
  statLabel,
  color = "emerald"
}: { 
  icon: React.ElementType;
  title: string;
  description: string;
  stat: string;
  statLabel: string;
  color?: "emerald" | "teal" | "amber";
}) {
  const colorClasses = {
    emerald: "from-emerald-500 to-emerald-600 bg-emerald-100 text-emerald-600",
    teal: "from-teal-500 to-teal-600 bg-teal-100 text-teal-600",
    amber: "from-amber-500 to-amber-600 bg-amber-100 text-amber-600",
  };

  return (
    <motion.div 
      className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color].split(' ').slice(0, 2).join(' ')} flex items-center justify-center mb-4`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed mb-4">{description}</p>
      <div className="pt-4 border-t border-slate-100">
        <p className="text-2xl font-bold text-slate-800">{stat}</p>
        <p className="text-xs text-slate-500">{statLabel}</p>
      </div>
    </motion.div>
  );
}

// Horizontal scroll testimonials for mobile
function TestimonialScroll() {
  const testimonials = [
    {
      quote: "For the first time in 8 years, I didn't stress about taxes in April.",
      name: "Sarah Chen",
      title: "Top 1% Producer • Vancouver"
    },
    {
      quote: "I used to check my bank 5 times a day. Now I just know where I stand.",
      name: "Michael Torres",
      title: "Team Lead • Burnaby"
    },
    {
      quote: "The only tool that shows my presale income 2-3 years out clearly.",
      name: "Jennifer Liu",
      title: "Presale Specialist • Richmond"
    },
  ];

  return (
    <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
      <div className="flex gap-4" style={{ width: 'max-content' }}>
        {testimonials.map((testimonial, i) => (
          <motion.div
            key={testimonial.name}
            className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-5 border border-slate-100 shadow-sm w-[280px] flex-shrink-0"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex gap-0.5 mb-3">
              {[...Array(5)].map((_, j) => (
                <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-slate-600 text-sm mb-4 leading-relaxed">"{testimonial.quote}"</p>
            <div className="pt-3 border-t border-slate-100">
              <p className="font-semibold text-slate-800 text-sm">{testimonial.name}</p>
              <p className="text-xs text-slate-500">{testimonial.title}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFBFC] snap-container">
      {/* Navigation - Mobile Optimized */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2">
              <img 
                src="/favicon.png" 
                alt="CommissionIQ" 
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl shadow-lg shadow-emerald-500/25"
              />
              <span className="font-semibold text-base sm:text-lg text-slate-800">CommissionIQ</span>
            </div>
            
            {/* Desktop nav */}
            <div className="hidden sm:flex items-center gap-3">
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-800">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25">
                  Get Started Free
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button 
              className="sm:hidden p-2 -mr-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-slate-600" />
              ) : (
                <Menu className="h-6 w-6 text-slate-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="sm:hidden bg-white border-t border-slate-100"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="px-4 py-4 space-y-3">
                <Link to="/auth" className="block">
                  <Button variant="outline" className="w-full h-12 text-base">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth" className="block">
                  <Button className="w-full h-12 text-base bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section - Mobile First */}
      <section className="snap-section pt-20 sm:pt-24 lg:pt-32 pb-12 lg:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[100svh] sm:min-h-0 flex flex-col justify-center">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Text content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-xs sm:text-sm font-medium mb-4 sm:mb-5">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Built for Vancouver Real Estate Agents
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-[3.5rem] font-bold text-slate-800 tracking-tight leading-[1.15] mb-4 sm:mb-6">
                Stop guessing.
                <span className="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Start knowing.
                </span>
              </h1>
              
              <p className="text-base sm:text-xl text-slate-500 mb-6 sm:mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Track commissions, project cashflow, and know your safe-to-spend — so you never overspend after a big close or panic before tax season.
              </p>
              
              {/* CTA Buttons - Stacked on mobile */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Link to="/auth" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-base px-6 sm:px-8 h-14 sm:h-13 gap-2 shadow-xl shadow-emerald-500/30">
                    Start Free — No Card Required
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#features" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-6 h-14 sm:h-13 border-slate-300 text-slate-600">
                    See How It Works
                  </Button>
                </a>
              </div>

              {/* Trust badges - Compact on mobile */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 text-xs sm:text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" />
                  Free plan available
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" />
                  BC/AB tax built-in
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" />
                  Setup in 5 minutes
                </span>
              </div>
            </motion.div>

            {/* Mockups - Phone for mobile, Dashboard for desktop */}
            <div>
              <div className="lg:hidden">
                <MobilePhoneMockup />
              </div>
              <DesktopDashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Simplified for mobile */}
      <section className="py-6 sm:py-8 border-y border-slate-100 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-xs sm:text-sm font-medium text-slate-400 uppercase tracking-wider text-center mb-4">Trusted by agents at</p>
          <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap text-slate-400">
            {['RE/MAX', 'Royal LePage', 'Sutton', 'Oakwyn'].map((brand) => (
              <span key={brand} className="text-sm sm:text-lg font-semibold">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Pain Points - Mobile optimized grid */}
      <section className="snap-section py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            className="text-center mb-8 sm:mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2 sm:mb-3">
              Sound familiar?
            </h2>
            <p className="text-slate-500 text-base sm:text-lg">The struggles that keep agents up at night</p>
          </motion.div>
          
          {/* 2-column grid on mobile, 3 on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[
              { icon: AlertTriangle, text: "Unpredictable income", color: "text-amber-500", bg: "bg-amber-50" },
              { icon: Calculator, text: "Tax season panic", color: "text-red-500", bg: "bg-red-50" },
              { icon: Wallet, text: "Overspending after big deals", color: "text-orange-500", bg: "bg-orange-50" },
              { icon: HeartPulse, text: "Slow month stress", color: "text-rose-500", bg: "bg-rose-50" },
              { icon: FileSpreadsheet, text: "Broken spreadsheets", color: "text-slate-500", bg: "bg-slate-100" },
              { icon: Clock, text: "Hours on bookkeeping", color: "text-teal-600", bg: "bg-teal-50" },
            ].map((pain, i) => (
              <motion.div
                key={pain.text}
                className="flex flex-col items-center text-center p-3 sm:p-4 bg-white rounded-xl border border-slate-100 shadow-sm"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl ${pain.bg} flex items-center justify-center mb-2 sm:mb-3`}>
                  <pain.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${pain.color}`} />
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-snug">{pain.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Mobile Cards */}
      <section id="features" className="snap-section py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-10 sm:mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2 sm:mb-3">
              Everything you need
            </h2>
            <p className="text-slate-500 text-base sm:text-lg">Financial clarity without the complexity</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <MobileFeatureCard
              icon={Shield}
              title="Safe to Spend"
              description="Know what you can actually spend after taxes, expenses, and obligations are covered."
              stat="$7,750"
              statLabel="Available this month"
              color="emerald"
            />
            <MobileFeatureCard
              icon={Calculator}
              title="Tax Set-Aside"
              description="BC-specific tax calculations with conservative buffers. No April surprises."
              stat="11.5%"
              statLabel="Auto-calculated rate"
              color="teal"
            />
            <MobileFeatureCard
              icon={TrendingUp}
              title="12-Month Forecast"
              description="See slow months before they hurt. Plan ahead instead of panicking."
              stat="2"
              statLabel="Slow months flagged"
              color="amber"
            />
          </div>
        </div>
      </section>

      {/* How It Works - Mobile optimized */}
      <section className="snap-section py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center mb-10 sm:mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2 sm:mb-3">
              Get clarity in 5 minutes
            </h2>
            <p className="text-slate-500 text-base sm:text-lg">No learning curve. No complex setup.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              { step: "1", icon: Banknote, title: "Add your deals", description: "Enter pending and closed deals. 2 minutes max." },
              { step: "2", icon: Wallet, title: "Add expenses", description: "Fixed costs, business expenses, obligations." },
              { step: "3", icon: Eye, title: "Get clarity", description: "Instant safe-to-spend and projections." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="relative inline-block mb-4 sm:mb-5">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 mx-auto">
                    <item.icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-slate-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-1 sm:mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Horizontal scroll on mobile */}
      <section className="snap-section py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-8 sm:mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2 sm:mb-3">
              Agents who feel in control
            </h2>
            <p className="text-slate-500 text-base sm:text-lg">Real stories about financial clarity</p>
          </motion.div>
          
          {/* Mobile: horizontal scroll, Desktop: grid */}
          <div className="sm:hidden">
            <TestimonialScroll />
          </div>
          
          <div className="hidden sm:grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "For the first time in 8 years, I didn't stress about taxes in April. The set-aside calculator changed everything.",
                name: "Sarah Chen",
                title: "Top 1% Producer • Vancouver West"
              },
              {
                quote: "I used to check my bank account 5 times a day. Now I just open Commission Tracker and know exactly where I stand.",
                name: "Michael Torres",
                title: "Team Lead • Burnaby"
              },
              {
                quote: "With presales, I have money coming 2-3 years out. This is the only tool that shows me that future income clearly.",
                name: "Jennifer Liu",
                title: "Presale Specialist • Richmond"
              }
            ].map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 border border-slate-100 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 mb-5 leading-relaxed">"{testimonial.quote}"</p>
                <div className="pt-4 border-t border-slate-100">
                  <p className="font-semibold text-slate-800">{testimonial.name}</p>
                  <p className="text-sm text-slate-500">{testimonial.title}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - Mobile optimized */}
      <section id="pricing" className="snap-section py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center mb-10 sm:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2 sm:mb-3">
              Simple, transparent pricing
            </h2>
            <p className="text-slate-500 text-base sm:text-lg">Costs less than one missed tax deduction. Pays for itself in April.</p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            {/* Free */}
            <motion.div
              className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-1">Starter</h3>
              <p className="text-slate-500 text-sm mb-4 sm:mb-5">Perfect for new agents</p>
              <div className="mb-5 sm:mb-6">
                <span className="text-3xl sm:text-4xl font-bold text-slate-800">$0</span>
                <span className="text-slate-400 ml-1">/forever</span>
              </div>
              <div className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-7">
                {[
                  "Up to 10 active deals",
                  "Basic expense tracking", 
                  "3-month income projections",
                  "Mobile & desktop access",
                  "BC & Alberta tax rates"
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="text-sm text-slate-600">{f}</span>
                  </div>
                ))}
              </div>
              <Link to="/auth" className="block">
                <Button variant="outline" className="w-full h-12 sm:h-11 text-base sm:text-sm border-slate-300">Get Started Free</Button>
              </Link>
            </motion.div>

            {/* Pro */}
            <motion.div
              className="bg-white rounded-2xl p-5 sm:p-7 border-2 border-emerald-500 shadow-xl shadow-emerald-100/50 relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 sm:px-4 py-1 text-[10px] sm:text-xs font-semibold rounded-full shadow-lg whitespace-nowrap">
                MOST POPULAR
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-1">Pro</h3>
              <p className="text-slate-500 text-sm mb-4 sm:mb-5">For serious producers</p>
              <div className="mb-5 sm:mb-6">
                <span className="text-3xl sm:text-4xl font-bold text-slate-800">$29</span>
                <span className="text-slate-400 ml-1">CAD/month</span>
              </div>
              <div className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-7">
                {[
                  "Unlimited deals",
                  "Full expense & property tracking",
                  "12-month cashflow projections", 
                  "Tax set-aside calculator",
                  "Safe-to-spend tracking",
                  "Client analytics & lead sources",
                  "CSV data export",
                  "Priority email support"
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="text-sm text-slate-600">{f}</span>
                  </div>
                ))}
              </div>
              <Link to="/auth" className="block">
                <Button className="w-full h-12 sm:h-11 text-base sm:text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25">
                  Start 14-Day Free Trial
                </Button>
              </Link>
            </motion.div>
          </div>

          <p className="text-center text-xs sm:text-sm text-slate-400 mt-5 sm:mt-6">
            No credit card required to start • Cancel anytime • Prices in CAD
          </p>
        </div>
      </section>

      {/* Final CTA - Mobile optimized */}
      <section className="snap-section py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-emerald-50">
        <motion.div 
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3 sm:mb-4">
            Ready to take control of your income?
          </h2>
          <p className="text-slate-500 text-base sm:text-lg mb-6 sm:mb-8">
            Join hundreds of Vancouver agents who've stopped stressing about money and started building wealth with clarity.
          </p>
          <Link to="/auth">
            <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-base px-6 sm:px-8 h-14 sm:h-13 gap-2 shadow-xl shadow-emerald-500/30">
              Start Your Free Account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <p className="text-xs sm:text-sm text-slate-400 mt-4">Free forever on Starter plan • Pro trial requires no card</p>
        </motion.div>
      </section>

      {/* Footer - Mobile optimized */}
      <footer className="py-10 sm:py-12 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <img 
                  src="/favicon.png" 
                  alt="CommissionIQ" 
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl shadow-lg shadow-emerald-500/25"
                />
                <span className="font-semibold text-base sm:text-lg text-slate-800">CommissionIQ</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xs leading-relaxed">
                Financial clarity for commission-based real estate agents. 
                Know what you can spend — before it becomes a problem.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-3 sm:mb-4 text-sm">Product</h4>
              <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-slate-500">
                <li><a href="#features" className="hover:text-slate-800 transition-colors">Features</a></li>
                <li><Link to="/auth" className="hover:text-slate-800 transition-colors">Pricing</Link></li>
                <li><Link to="/auth" className="hover:text-slate-800 transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-3 sm:mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-slate-500">
                <li><Link to="/terms" className="hover:text-slate-800 transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-slate-800 transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 mt-8 sm:mt-10 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-slate-400">
            <p>© {new Date().getFullYear()} CommissionIQ. Built for Canadian agents.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
