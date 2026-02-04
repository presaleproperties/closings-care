import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  Calendar,
  Shield,
  BarChart3,
  DollarSign,
  AlertTriangle,
  Clock,
  Wallet,
  Calculator,
  Banknote,
  Menu,
  X,
  Lock,
  Home,
  PieChart,
  Eye,
  TrendingDown,
  ChevronDown,
  Target,
  PiggyBank,
  Receipt,
  Gift,
  MapPin,
  Users,
  Building2,
  Sparkles,
  Zap,
  LineChart,
  Play
} from "lucide-react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FloatingNotifications } from "@/components/landing/FloatingNotifications";

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

// Floating animated elements
function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute top-20 right-[10%] w-72 h-72 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl"
        animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-40 left-[5%] w-48 h-48 bg-gradient-to-br from-teal-400/15 to-cyan-400/15 rounded-full blur-3xl"
        animate={{ y: [0, 15, 0], scale: [1, 0.95, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute bottom-20 right-[20%] w-64 h-64 bg-gradient-to-br from-emerald-300/10 to-teal-300/10 rounded-full blur-3xl"
        animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </div>
  );
}

// Section 1: Hero - Updated messaging
function HeroSection() {
  return (
    <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden relative min-h-screen flex items-center bg-gradient-to-b from-slate-50 to-white">
      <FloatingElements />
      
      <div className="max-w-7xl mx-auto relative w-full">
        <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 items-center">
          {/* Left Side - Copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center lg:text-left lg:col-span-3"
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-medium mb-5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="h-4 w-4" />
              Built for Canadian Realtors
            </motion.div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 tracking-tight leading-[1.1] mb-6">
              Your Complete{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Real Estate Business
              </span>
              {' '}Command Center
            </h1>
            
            <p className="text-xl sm:text-2xl text-slate-600 mb-4 font-medium">
              Know exactly what you're making, where deals come from, and what's safe to spend
            </p>
            
            <p className="text-base sm:text-lg text-slate-500 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Deal analytics. Lead source tracking. Tax reserves. 12-month forecasting. All in one place. Built specifically for how realtors actually work.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Link to="/auth" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white text-lg px-10 h-16 gap-2 shadow-xl shadow-emerald-700/30 group">
                  Start Free Trial
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/demo" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 h-16 border-slate-300 text-slate-700 gap-2">
                  <Play className="h-4 w-4" />
                  See Demo
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                14-day free trial
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                BC/AB/ON tax rates
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Setup in 5 minutes
              </span>
            </div>
          </motion.div>

          {/* Right Side - Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 blur-3xl scale-105" />
            <FloatingNotifications />
            <div className="relative bg-white rounded-2xl shadow-2xl shadow-slate-300/50 border border-slate-200 overflow-hidden">
              {/* Browser Chrome */}
              <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="bg-white rounded-lg px-4 py-1.5 text-xs text-slate-400 border border-slate-200 flex items-center gap-2">
                    <Lock className="h-3 w-3 text-emerald-500" />
                    app.dealzflow.ca
                  </div>
                </div>
              </div>
              
              {/* Dashboard Preview */}
              <div className="p-5 bg-gradient-to-br from-slate-50 to-white">
                {/* Quick Stats Row */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-500 mb-1">Total GCI</p>
                    <p className="text-lg font-bold text-emerald-600">$284,500</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-500 mb-1">Deals YTD</p>
                    <p className="text-lg font-bold text-slate-800">24</p>
                  </div>
                </div>

                {/* Safe to Spend */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-medium text-emerald-700">Safe to Spend</span>
                  </div>
                  <p className="text-3xl font-bold text-emerald-600">$12,450</p>
                </div>

                {/* Mini Analytics */}
                <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-700">Lead Sources</span>
                    <PieChart className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-xs text-slate-600 flex-1">Referrals</span>
                      <span className="text-xs font-medium text-slate-800">42%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-teal-500" />
                      <span className="text-xs text-slate-600 flex-1">Online</span>
                      <span className="text-xs font-medium text-slate-800">28%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-xs text-slate-600 flex-1">Past Clients</span>
                      <span className="text-xs font-medium text-slate-800">30%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Section 2: The Problem
function ProblemSection() {
  const problems = [
    {
      title: '"How much am I actually making?"',
      description: "You know your GCI, but after splits, cap contributions, team cuts, and taxes... what's left? Most realtors can't answer this in under 10 minutes.",
      icon: "💸"
    },
    {
      title: '"Where are my best deals coming from?"',
      description: "Referrals? Online leads? Past clients? You have a gut feeling, but no data. You're spending marketing dollars blindly.",
      icon: "🎯"
    },
    {
      title: '"Can I afford this investment?"',
      description: "New marketing campaign. Assistant hire. Investment property. You want to say yes, but you're not 100% sure the numbers work.",
      icon: "🤔"
    },
    {
      title: '"What does next quarter look like?"',
      description: "Slow months sneak up on you. Pipeline visibility is scattered across emails, texts, and your head. Surprises aren't fun.",
      icon: "📅"
    }
  ];

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs sm:text-sm font-medium mb-4">
            <AlertTriangle className="h-4 w-4" />
            Sound Familiar?
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
            Running a Real Estate Business{' '}
            <span className="text-amber-600">Without Clear Numbers</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            You're great at closing deals. But understanding your business finances? That's a different story.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, i) => (
            <motion.div
              key={problem.title}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-slate-100"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-4xl mb-4">{problem.icon}</div>
              <h3 className="text-lg font-bold text-slate-800 mb-3">{problem.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{problem.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Section 3: The Solution - Feature Showcase
function SolutionSection() {
  const features = [
    {
      icon: PieChart,
      title: "Business Analytics",
      description: "See where your deals come from, which property types perform best, and identify your most profitable lead sources.",
      highlights: ["Lead source breakdown", "Property type analysis", "City/area performance", "Monthly trends"],
      color: "from-emerald-500 to-teal-600"
    },
    {
      icon: Wallet,
      title: "Safe-to-Spend",
      description: "Know exactly what you can spend after taxes, expenses, and upcoming obligations. Updated in real-time.",
      highlights: ["After-tax calculations", "Expense tracking", "Pipeline factored in", "Instant clarity"],
      color: "from-teal-500 to-cyan-600"
    },
    {
      icon: LineChart,
      title: "12-Month Forecast",
      description: "See your income projection based on current pipeline. Spot slow months before they happen.",
      highlights: ["Pipeline-based projections", "Slow month alerts", "Cashflow planning", "Trend analysis"],
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: Target,
      title: "Brokerage Cap Tracker",
      description: "Know exactly where you stand on your cap. Stop trusting someone else's math.",
      highlights: ["Real-time cap progress", "100% split countdown", "Monthly contributions", "Cap projection"],
      color: "from-amber-500 to-orange-600"
    },
    {
      icon: Shield,
      title: "Tax Reserves",
      description: "Canadian tax brackets built in. BC, AB, ON rates. GST tracking for registered agents.",
      highlights: ["Provincial tax rates", "GST/HST tracking", "Set-aside calculations", "Year-round ready"],
      color: "from-red-500 to-pink-600"
    },
    {
      icon: Receipt,
      title: "Expense Intelligence",
      description: "Track business expenses, see your burn rate, and catch lifestyle creep before it catches you.",
      highlights: ["Category breakdown", "Fixed vs variable", "Tax deductible flags", "Budget alerts"],
      color: "from-purple-500 to-violet-600"
    }
  ];

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-medium mb-4">
            <Zap className="h-4 w-4" />
            Everything You Need
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
            One Place for{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Complete Clarity
            </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Built specifically for Canadian realtors. Not generic accounting software adapted for real estate.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-emerald-200 transition-all hover:shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg mb-4`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{feature.title}</h3>
              <p className="text-slate-600 text-sm mb-4">{feature.description}</p>
              <ul className="space-y-1.5">
                {feature.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-center gap-2 text-xs text-slate-500">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Section 4: Analytics Deep Dive
function AnalyticsSection() {
  const analyticsFeatures = [
    { icon: Users, label: "Lead Sources", desc: "Referral, online, past client, open house" },
    { icon: Building2, label: "Property Types", desc: "Presale vs resale performance" },
    { icon: Home, label: "Deal Types", desc: "Buyer vs seller representation" },
    { icon: MapPin, label: "Geographic", desc: "City and neighborhood breakdown" },
  ];

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs sm:text-sm font-medium mb-4">
              <BarChart3 className="h-4 w-4" />
              New: Business Analytics
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Finally Understand{' '}
              <span className="text-emerald-400">Where Your Business Comes From</span>
            </h2>
            <p className="text-lg text-slate-300 mb-6">
              Stop guessing which marketing channels work. See exactly which lead sources, property types, and areas generate your best commissions.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {analyticsFeatures.map((item, i) => (
                <motion.div
                  key={item.label}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <item.icon className="h-5 w-5 text-emerald-400 mb-2" />
                  <h4 className="font-semibold text-white text-sm mb-1">{item.label}</h4>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            <Link to="/demo">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                See Analytics in Action
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          {/* Analytics Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-white">Revenue by Lead Source</h3>
                <span className="text-xs text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-full">YTD</span>
              </div>
              
              {/* Animated Bars */}
              <div className="space-y-4">
                {[
                  { label: "Referrals", value: 42, amount: "$119,490", color: "bg-emerald-500" },
                  { label: "Past Clients", value: 28, amount: "$79,660", color: "bg-teal-500" },
                  { label: "Online Leads", value: 18, amount: "$51,210", color: "bg-cyan-500" },
                  { label: "Open Houses", value: 12, amount: "$34,140", color: "bg-amber-500" },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-300">{item.label}</span>
                      <span className="text-white font-medium">{item.amount}</span>
                    </div>
                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${item.color} rounded-full`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.value}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-6 pt-4 border-t border-slate-700 flex items-center justify-between">
                <span className="text-slate-400 text-sm">Total GCI</span>
                <span className="text-2xl font-bold text-emerald-400">$284,500</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Section 5: How It Works
function HowItWorksSection() {
  const steps = [
    { 
      step: "1", 
      title: "Add your deals", 
      description: "Log pending and closed deals. Include lead source, property type, and commission details.",
      emoji: "💵"
    },
    { 
      step: "2", 
      title: "We do the math", 
      description: "Splits, cap, taxes, expenses — all calculated automatically with Canadian tax brackets.",
      emoji: "📊"
    },
    { 
      step: "3", 
      title: "Get complete clarity", 
      description: "Safe-to-Spend, analytics, forecasts, and insights. Everything in one view.",
      emoji: "✨"
    },
  ];

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
            Simple to Start, Powerful to Use
          </h2>
        </motion.div>
        
        <div className="grid sm:grid-cols-3 gap-8 relative">
          <div className="hidden sm:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-300" />
          
          {steps.map((item, i) => (
            <motion.div
              key={item.step}
              className="text-center relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
            >
              <div className="relative inline-block mb-5">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/25 mx-auto text-4xl">
                  {item.emoji}
                </div>
                <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-slate-800 text-white text-sm font-bold flex items-center justify-center shadow-lg">
                  {item.step}
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{item.title}</h3>
              <p className="text-slate-500">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Section 6: Deal Types Support
function DealTypesSection() {
  const dealTypes = [
    {
      icon: "🏠",
      title: "Resale Transactions",
      features: ["Buyer & seller side tracking", "Team splits calculated", "Close date projections", "Commission breakdowns"]
    },
    {
      icon: "🏗️",
      title: "Presale/Pre-Construction",
      features: ["Multiple payout dates", "Advance + deposits + completion", "2-3 year deal tracking", "Completion date forecasting"]
    },
    {
      icon: "🤝",
      title: "Team & Referral Deals",
      features: ["Team member portions", "Referral fee tracking", "Co-listing splits", "Net commission after all cuts"]
    }
  ];

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
            Handles Every Type of Deal
          </h2>
          <p className="text-lg text-slate-600">
            Resale, presale, team deals, referrals — we've got you covered.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {dealTypes.map((type, i) => (
            <motion.div
              key={type.title}
              className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 border border-slate-200 hover:border-emerald-300 transition-all hover:shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-4xl mb-4">{type.icon}</div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">{type.title}</h3>
              <ul className="space-y-2">
                {type.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Section 7: Tax & Financial Safety
function TaxSection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-amber-50">
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs sm:text-sm font-medium mb-4">
              <Shield className="h-4 w-4" />
              Tax Ready Year-Round
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
              No More April Surprises
            </h2>
            <p className="text-lg text-slate-600 mb-6">
              Canadian tax brackets built in. We calculate exactly how much to set aside so you're never caught off guard.
            </p>
            
            <ul className="space-y-3 mb-8">
              {[
                "BC, Alberta, and Ontario tax rates",
                "GST/HST tracking for registered agents",
                "Real-time tax reserve calculations",
                "Accountant-ready annual exports"
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-slate-700">
                  <CheckCircle2 className="h-5 w-5 text-amber-600 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-amber-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">Tax Safety Status</h3>
              </div>

              <div className="flex justify-center mb-6">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" stroke="#FDE68A" strokeWidth="8" fill="none" />
                    <circle 
                      cx="50" cy="50" r="45" 
                      stroke="url(#taxGauge)" strokeWidth="8" fill="none" 
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 45}
                      strokeDashoffset={2 * Math.PI * 45 * 0.15}
                    />
                    <defs>
                      <linearGradient id="taxGauge" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#10B981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-800">85%</span>
                    <span className="text-xs text-emerald-600 font-medium">On Track</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Tax Set Aside</span>
                  <span className="font-bold text-slate-800">$42,680</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Estimated Owing</span>
                  <span className="font-bold text-slate-800">$50,200</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Status</span>
                  <span className="font-bold">✓ Healthy Buffer</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Section 8: Social Proof
function SocialProofSection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
            Trusted by Canadian Realtors
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14">
          {[
            { value: 1200, label: "Active Users", suffix: "+" },
            { value: 18.5, label: "GCI Tracked", prefix: "$", suffix: "M", decimals: 1 },
            { value: 98, label: "Satisfaction", suffix: "%" },
            { value: 4.9, label: "App Rating", suffix: "/5", decimals: 1 },
          ].map((stat, i) => (
            <motion.div 
              key={stat.label}
              className="text-center p-6 bg-slate-50 rounded-2xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <p className="text-2xl sm:text-3xl font-bold text-emerald-600">
                <AnimatedNumber value={stat.value} prefix={stat.prefix} suffix={stat.suffix} decimals={stat.decimals || 0} />
              </p>
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              quote: "I finally know exactly where my business comes from. Referrals were 60% of my income — I had no idea until I saw the analytics.",
              name: "Sarah M.",
              company: "RE/MAX, Vancouver"
            },
            {
              quote: "The presale tracking alone is worth it. I have deals closing in 2026 and can finally see the full picture.",
              name: "David C.",
              company: "Oakwyn Realty, Burnaby"
            },
            {
              quote: "Tax season used to stress me out. Now I know exactly what I owe all year. No surprises.",
              name: "Jennifer L.",
              company: "Royal LePage, Calgary"
            }
          ].map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              className="bg-slate-50 rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <p className="text-slate-600 text-sm mb-4 italic">"{testimonial.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{testimonial.name}</p>
                  <p className="text-xs text-slate-500">{testimonial.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Section 9: Objection Crusher
function ObjectionSection() {
  const objections = [
    {
      objection: '"I use spreadsheets"',
      answer: "Spreadsheets don't give you instant Safe-to-Spend calculations, lead source analytics, or 12-month forecasts. They're homework. This is clarity."
    },
    {
      objection: '"My accountant handles my finances"',
      answer: "Your accountant files taxes once a year. We give you clarity every day. Can you afford that marketing spend? We answer that in 10 seconds."
    },
    {
      objection: '"I don\'t have time to learn something new"',
      answer: "15 seconds to add a deal. That's it. If you can add a contact to your phone, you can use dealzflow."
    },
    {
      objection: '"I already know my numbers"',
      answer: "Can you tell me your exact net take-home after splits, cap, and taxes in under 30 seconds? Can you show which lead source generates your best ROI? That's what we do."
    }
  ];

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
            "But I already..."
          </h2>
        </motion.div>

        <div className="space-y-4">
          {objections.map((item, i) => (
            <motion.div
              key={item.objection}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Collapsible>
                <CollapsibleTrigger className="w-full">
                  <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                    <h3 className="text-lg font-semibold text-slate-800 text-left">{item.objection}</h3>
                    <ChevronDown className="h-5 w-5 text-slate-400 group-data-[state=open]:rotate-180 transition-transform" />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-5 pb-5 pt-2 bg-white rounded-b-xl border-x border-b border-slate-200 -mt-2">
                    <p className="text-slate-600">{item.answer}</p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Section 10: Pricing
function PricingSection() {
  const features = [
    "Unlimited deals & payouts",
    "Business analytics dashboard",
    "Safe-to-Spend calculator",
    "12-month income forecasting",
    "Brokerage cap tracking",
    "Tax reserve calculations",
    "Presale & resale support",
    "Lead source tracking",
    "Expense management",
    "Accountant-ready exports"
  ];

  return (
    <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
            Simple, Transparent Pricing
          </h2>
        </motion.div>

        <motion.div
          className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="p-8 text-center bg-gradient-to-br from-emerald-50 to-teal-50">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium mb-4">
              Most Popular
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Pro</h3>
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-5xl font-bold text-slate-800">$29</span>
              <span className="text-slate-500">CAD/month</span>
            </div>
          </div>

          <div className="p-8">
            <ul className="space-y-3 mb-8">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-slate-700">{feature}</span>
                </li>
              ))}
            </ul>

            <Link to="/auth" className="block">
              <Button className="w-full h-14 text-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-xl shadow-emerald-700/30">
                Start 14-Day Free Trial
              </Button>
            </Link>
            <p className="text-center text-sm text-slate-500 mt-3">No credit card required</p>
          </div>
        </motion.div>

        <motion.div
          className="mt-6 text-center p-4 bg-amber-50 rounded-xl border border-amber-200"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Gift className="h-6 w-6 text-amber-600 mx-auto mb-2" />
          <p className="text-sm text-slate-700">
            <strong>90-day guarantee:</strong> If you don't make at least one better financial decision, we'll refund you.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// Section 11: Final CTA
function FinalCTASection() {
  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-emerald-700">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Get Complete Clarity on Your Business
          </h2>
          <p className="text-xl text-white/80 mb-10">
            Join 1,200+ Canadian realtors who finally understand their numbers.
          </p>

          <Link to="/auth">
            <Button size="lg" className="bg-white text-emerald-700 hover:bg-slate-100 text-lg px-12 h-16 gap-2 shadow-xl group font-bold">
              Start Your Free Trial
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/70 mt-8">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              14-day free trial
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              Setup in 5 minutes
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img 
              src="/favicon.png" 
              alt="dealzflow" 
              className="w-8 h-8 rounded-lg"
            />
            <span className="font-bold text-white">
              dealz<span className="text-emerald-400">flow</span>
            </span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <a href="mailto:support@dealzflow.ca" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} dealzflow. Built for Canadian realtors.
        </div>
      </div>
    </footer>
  );
}

// Main Landing Page
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <img 
                src="/favicon.png" 
                alt="dealzflow" 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl shadow-lg shadow-emerald-500/25"
              />
              <span className="font-bold text-lg sm:text-xl text-slate-800">
                dealz<span className="text-emerald-600">flow</span>
              </span>
            </Link>
            
            <div className="hidden sm:flex items-center gap-6">
              <a href="#features" className="text-slate-600 hover:text-slate-800 font-medium transition-colors">Features</a>
              <a href="#pricing" className="text-slate-600 hover:text-slate-800 font-medium transition-colors">Pricing</a>
              <Link to="/demo" className="text-slate-600 hover:text-slate-800 font-medium transition-colors">Demo</Link>
              <Link to="/auth">
                <Button variant="ghost" className="text-slate-600">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg shadow-emerald-500/25">
                  Start Free Trial
                </Button>
              </Link>
            </div>

            <button 
              className="sm:hidden p-2 -mr-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6 text-slate-600" /> : <Menu className="h-6 w-6 text-slate-600" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="sm:hidden bg-white border-t border-slate-100"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="px-4 py-4 space-y-3">
                <a href="#features" className="block py-2 text-slate-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Features</a>
                <a href="#pricing" className="block py-2 text-slate-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
                <Link to="/demo" className="block py-2 text-slate-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Demo</Link>
                <Link to="/auth" className="block">
                  <Button variant="outline" className="w-full h-12 text-base">Sign In</Button>
                </Link>
                <Link to="/auth" className="block">
                  <Button className="w-full h-12 text-base bg-emerald-700 hover:bg-emerald-800 text-white">
                    Start Free Trial
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <HeroSection />
      <ProblemSection />
      <div id="features">
        <SolutionSection />
      </div>
      <AnalyticsSection />
      <HowItWorksSection />
      <DealTypesSection />
      <TaxSection />
      <SocialProofSection />
      <ObjectionSection />
      <PricingSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
}
