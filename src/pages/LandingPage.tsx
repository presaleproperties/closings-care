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
  Calculator,
  Banknote,
  PieChart,
  Sparkles,
  Menu,
  X,
  Zap,
  Lock,
  Users,
  Building2,
  Target,
  LineChart,
  Receipt,
  Bell,
  Home,
  Briefcase,
  CreditCard,
  Eye,
  Heart,
  Coffee,
  TrendingDown,
  FileText,
  Percent,
  ChevronRight,
  Play
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

// Floating animated elements for visual interest
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
      
      <motion.div
        className="absolute top-32 right-[15%] hidden lg:block"
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-12 h-12 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center border border-slate-100">
          <DollarSign className="w-6 h-6 text-emerald-500" />
        </div>
      </motion.div>
      <motion.div
        className="absolute top-48 left-[12%] hidden lg:block"
        animate={{ y: [0, 12, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      >
        <div className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center border border-slate-100">
          <BarChart3 className="w-5 h-5 text-teal-500" />
        </div>
      </motion.div>
    </div>
  );
}

// Dashboard Preview Component
function DashboardPreview() {
  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 blur-3xl scale-105" />
      
      <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl shadow-slate-300/40 border border-slate-200/80 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3">
          <div className="flex gap-1 sm:gap-1.5">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-400" />
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-amber-400" />
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-emerald-400" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white rounded-lg px-2 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs text-slate-400 border border-slate-200 flex items-center gap-1 sm:gap-2">
              <Lock className="h-2 w-2 sm:h-3 sm:w-3 text-emerald-500" />
              <span className="hidden sm:inline">app.commissioniq.ca/dashboard</span>
              <span className="sm:hidden">commissioniq.ca</span>
            </div>
          </div>
        </div>
        
        <div className="p-3 sm:p-5 bg-gradient-to-br from-slate-50 to-slate-100/50">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-5">
            {[
              { label: "Safe to Spend", value: "$7,750", gradient: true },
              { label: "Pipeline", value: "$76,500", trend: "+5 deals" },
              { label: "YTD Income", value: "$142,800", trend: "+18%" },
              { label: "Tax Set Aside", value: "$16,426", trend: "Ready" },
            ].map((kpi, i) => (
              <motion.div
                key={kpi.label}
                className={`rounded-xl p-2 sm:p-4 ${kpi.gradient ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-white'} shadow-sm border border-slate-100/50`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <p className={`text-[9px] sm:text-xs ${kpi.gradient ? 'text-emerald-100' : 'text-slate-500'} font-medium mb-1`}>{kpi.label}</p>
                <p className={`text-sm sm:text-xl font-bold ${kpi.gradient ? 'text-white' : 'text-slate-800'}`}>{kpi.value}</p>
                {kpi.trend && <p className="text-[8px] sm:text-xs text-emerald-600 mt-0.5">{kpi.trend}</p>}
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="bg-white rounded-xl p-2 sm:p-4 shadow-sm border border-slate-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h4 className="text-xs sm:text-sm font-semibold text-slate-800">12-Month Projection</h4>
              <div className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Income
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                  Expenses
                </span>
              </div>
            </div>
            <div className="flex items-end justify-between gap-1 sm:gap-2 h-16 sm:h-24">
              {[45, 65, 35, 85, 55, 75, 40, 90, 70, 80, 60, 85].map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 flex gap-0.5"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 1.0 + i * 0.05 }}
                  style={{ transformOrigin: 'bottom' }}
                >
                  <div className={`flex-1 rounded-t-sm ${i === 2 || i === 6 ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ height: `${h}%` }} />
                  <div className="flex-1 bg-slate-200 rounded-t-sm" style={{ height: `${h * 0.35}%` }} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating notifications */}
      <motion.div 
        className="absolute -right-2 sm:-right-6 top-16 sm:top-20 bg-white rounded-lg sm:rounded-xl shadow-xl shadow-slate-200/60 p-2 sm:p-3 border border-slate-100"
        initial={{ opacity: 0, scale: 0.8, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: 1.4, duration: 0.4 }}
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-[8px] sm:text-[10px] text-slate-500">Commission received</p>
            <p className="text-[10px] sm:text-xs font-bold text-slate-800">+$8,200</p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="absolute -left-2 sm:-left-4 bottom-20 sm:bottom-24 bg-white rounded-lg sm:rounded-xl shadow-xl shadow-slate-200/60 p-2 sm:p-3 border border-slate-100"
        initial={{ opacity: 0, scale: 0.8, x: -20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: 1.6, duration: 0.4 }}
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-teal-100 flex items-center justify-center">
            <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-teal-600" />
          </div>
          <div>
            <p className="text-[8px] sm:text-[10px] text-slate-500">Tax set aside</p>
            <p className="text-[10px] sm:text-xs font-bold text-slate-800">$16,426 ready</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Section 2: The Problem
function ProblemSection() {
  const problems = [
    { icon: FileSpreadsheet, text: "Commissions spread across emails, spreadsheets, and portals" },
    { icon: Eye, text: "No clear view of pending vs paid income" },
    { icon: AlertTriangle, text: "Surprise tax bills every year" },
    { icon: Clock, text: "Pre-sales and trails feel invisible" },
    { icon: TrendingDown, text: "Broker statements don't match reality" },
  ];

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="text-center mb-10 sm:mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-800 mb-3 sm:mb-4">
            You're closing deals — but your money feels unclear.
          </h2>
        </motion.div>
        
        <div className="space-y-3 sm:space-y-4 mb-10">
          {problems.map((problem, i) => (
            <motion.div
              key={problem.text}
              className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-sm"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <problem.icon className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
              </div>
              <p className="text-slate-700 text-sm sm:text-base font-medium pt-2">{problem.text}</p>
            </motion.div>
          ))}
        </div>

        <motion.p 
          className="text-center text-lg sm:text-xl text-slate-600 font-medium italic"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          If your income feels stressful despite earning well — this is why.
        </motion.p>
      </div>
    </section>
  );
}

// Section 3: Cost of Doing Nothing
function CostSection() {
  const costs = [
    { icon: CreditCard, text: "Overspending money that isn't yours" },
    { icon: Receipt, text: "Missed write-offs and incentives" },
    { icon: Briefcase, text: "Poor hiring and investing decisions" },
    { icon: Heart, text: "Constant money anxiety" },
    { icon: FileText, text: "Dependence on accountants after the damage is done" },
  ];

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="text-center mb-10 sm:mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">
            What unclear income really costs you
          </h2>
        </motion.div>
        
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {costs.map((cost, i) => (
            <motion.div
              key={cost.text}
              className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 bg-slate-800/50 rounded-xl border border-slate-700"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <cost.icon className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400" />
              </div>
              <p className="text-slate-200 text-sm sm:text-base font-medium pt-2">{cost.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Section 4: The Solution
function SolutionSection() {
  const features = [
    { icon: Target, text: "Deal-level commission tracking" },
    { icon: TrendingUp, text: "Real-time income forecast" },
    { icon: Calculator, text: "Automatic tax set-aside" },
    { icon: Receipt, text: "Expense tracking tied to income" },
    { icon: Building2, text: "Pre-sale, assignment & trail support" },
  ];

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-800 mb-4 sm:mb-6">
              One dashboard for your entire deal pipeline.
            </h2>
            <p className="text-slate-600 text-base sm:text-lg mb-8 leading-relaxed">
              This app gives you a live view of every deal, every commission, every expense, and every dollar you owe — before it hits your bank account.
            </p>
            
            <div className="space-y-4">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.text}
                  className="flex items-center gap-3 sm:gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/25">
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-slate-700 text-sm sm:text-base font-medium">{feature.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 sm:p-8 border border-emerald-200">
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-500">Safe to Spend</span>
                    <Shield className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="text-3xl font-bold text-emerald-600">$7,750</p>
                  <p className="text-xs text-slate-500 mt-1">After taxes, expenses & obligations</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">Pipeline</p>
                    <p className="text-lg font-bold text-slate-800">$76,500</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">Tax Ready</p>
                    <p className="text-lg font-bold text-teal-600">$16,426</p>
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

// Section 5: How It Works
function HowItWorks() {
  const steps = [
    { 
      step: "1", 
      title: "Add your deal", 
      description: "Accepted, conditional, or completed — log it once.",
      icon: Banknote
    },
    { 
      step: "2", 
      title: "Watch it flow", 
      description: "See commissions move from pending → earned → paid.",
      icon: TrendingUp
    },
    { 
      step: "3", 
      title: "Stay in control", 
      description: "Know what you can spend, save, or reinvest — anytime.",
      icon: Shield
    },
  ];

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs sm:text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Simple = Trust
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-800">
            How it works
          </h2>
        </motion.div>
        
        <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((item, i) => (
            <motion.div
              key={item.step}
              className="text-center relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              {i < 2 && (
                <div className="hidden sm:block absolute top-10 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-emerald-300 to-emerald-100" />
              )}
              
              <div className="relative inline-block mb-5">
                <motion.div 
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/25 mx-auto"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <item.icon className="h-7 w-7 sm:h-9 sm:w-9 text-white" />
                </motion.div>
                <div className="absolute -top-2 -right-2 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-slate-800 text-white text-sm font-bold flex items-center justify-center shadow-lg">
                  {item.step}
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-2">{item.title}</h3>
              <p className="text-slate-500 text-sm sm:text-base">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Section 6: For Agents & Brokers
function ForAgentsBrokers() {
  const realtorFeatures = [
    "Track splits, caps, referral fees",
    "Handle long pre-sale timelines",
    "See upcoming completions clearly",
    "Never forget bonuses or holdbacks",
  ];

  const brokerFeatures = [
    "Separate upfront vs backend",
    "Track trail commissions",
    "Get alerted to clawbacks",
    "Manage multiple lenders easily",
  ];

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-800 mb-3">
            Built specifically for agents & brokers
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          {/* For Realtors */}
          <motion.div
            className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 sm:p-8 border border-emerald-200"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Home className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">For Realtors</h3>
            </div>
            <ul className="space-y-3">
              {realtorFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700 text-sm sm:text-base">{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* For Mortgage Brokers */}
          <motion.div
            className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 sm:p-8 border border-teal-200"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/25">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">For Mortgage Brokers</h3>
            </div>
            <ul className="space-y-3">
              {brokerFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-teal-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700 text-sm sm:text-base">{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Section 7: Tax Section
function TaxSection() {
  const taxFeatures = [
    "Live tax reserve tracking",
    "GST/HST visibility",
    "Year-round readiness for your accountant",
    "Clear net-income view",
  ];

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs sm:text-sm font-medium mb-4">
              <Calculator className="h-4 w-4" />
              Tax Ready
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-800 mb-4 sm:mb-6">
              No more tax surprises.
            </h2>
            
            <div className="space-y-4 mb-8">
              {taxFeatures.map((feature, i) => (
                <motion.div
                  key={feature}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <p className="text-slate-700 text-sm sm:text-base">{feature}</p>
                </motion.div>
              ))}
            </div>

            <p className="text-lg sm:text-xl font-semibold text-emerald-600 italic">
              Stop guessing what's yours. Know it.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 sm:p-8 border border-amber-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
                  <Percent className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Tax Set Aside</p>
                  <p className="text-3xl font-bold text-slate-800">$16,426</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-sm text-slate-600">Federal</span>
                  <span className="text-sm font-semibold text-slate-800">$9,856</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-sm text-slate-600">Provincial (BC)</span>
                  <span className="text-sm font-semibold text-slate-800">$4,712</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-sm text-slate-600">GST/HST</span>
                  <span className="text-sm font-semibold text-slate-800">$1,858</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Section 8: Emotional Payoff
function EmotionalPayoff() {
  const benefits = [
    { icon: Users, text: "Hire with clarity" },
    { icon: TrendingUp, text: "Invest with confidence" },
    { icon: Calendar, text: "Plan your life, not just your deals" },
    { icon: Coffee, text: "Sleep better at night" },
  ];

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-4xl font-bold mb-8 sm:mb-12">
            Confidence changes everything.
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.text}
              className="flex flex-col items-center p-4 sm:p-6 bg-white/10 backdrop-blur-sm rounded-2xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-3 sm:mb-4">
                <benefit.icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <p className="text-white/90 text-sm sm:text-base font-medium text-center">{benefit.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Section 9: Authority/Built By
function AuthoritySection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs sm:text-sm font-medium mb-4">
            <Shield className="h-4 w-4" />
            Built for you
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-800 mb-4 sm:mb-6">
            Built by people who understand commission income.
          </h2>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto mb-10">
            Designed with real estate agents and mortgage brokers who close deals every month and need real-time financial clarity — not generic accounting software.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
          {[
            { value: 847, label: "Active Users", suffix: "+" },
            { value: 12.4, label: "Million Tracked", prefix: "$", suffix: "M", decimals: 1 },
            { value: 98, label: "Satisfaction", suffix: "%" },
            { value: 4.9, label: "App Rating", suffix: "/5", decimals: 1 },
          ].map((stat, i) => (
            <motion.div 
              key={stat.label}
              className="p-4 sm:p-6 bg-slate-50 rounded-2xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <p className="text-2xl sm:text-3xl font-bold text-emerald-600">
                <AnimatedNumber 
                  value={stat.value} 
                  prefix={stat.prefix} 
                  suffix={stat.suffix} 
                  decimals={stat.decimals || 0} 
                />
              </p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Section 10: Final CTA
function FinalCTA() {
  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-5xl font-bold mb-3 sm:mb-4">
            You track your deals.
          </h2>
          <h2 className="text-3xl sm:text-5xl font-bold mb-8 sm:mb-10 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Now track your money.
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-base sm:text-lg px-8 sm:px-10 h-14 sm:h-16 gap-2 shadow-xl shadow-emerald-500/30 group">
                Start Tracking My Income
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base sm:text-lg px-8 h-14 sm:h-16 border-slate-600 text-white hover:bg-slate-800">
                Book a Demo
              </Button>
            </Link>
          </div>

          <p className="text-slate-400 text-sm sm:text-base">
            Free to start • No credit card required • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// Main Landing Page Component
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <img 
                src="/favicon.png" 
                alt="CommissionIQ" 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl shadow-lg shadow-emerald-500/25"
              />
              <span className="font-bold text-lg sm:text-xl text-slate-800">
                Commission<span className="text-emerald-600">IQ</span>
              </span>
            </Link>
            
            <div className="hidden sm:flex items-center gap-6">
              <a href="#features" className="text-slate-600 hover:text-slate-800 font-medium transition-colors">Features</a>
              <Link to="/auth">
                <Button variant="ghost" className="text-slate-600">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25">
                  Get Control of Your Income
                </Button>
              </Link>
            </div>

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
                <Link to="/auth" className="block">
                  <Button variant="outline" className="w-full h-12 text-base">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth" className="block">
                  <Button className="w-full h-12 text-base bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white">
                    Get Control of Your Income
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
        <FloatingElements />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center lg:text-left"
            >
              <motion.div 
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-xs sm:text-sm font-medium mb-5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Sparkles className="h-4 w-4" />
                Built for Realtors & Mortgage Brokers
              </motion.div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 tracking-tight leading-tight mb-6">
                Know exactly what you're earning — 
                <span className="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  before, during, and after every deal.
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Track commissions, splits, taxes, expenses, and future income in one real-time dashboard built for realtors and mortgage brokers.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Link to="/auth" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-base px-8 h-14 gap-2 shadow-xl shadow-emerald-500/30 group">
                    Get Control of Your Income
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <a href="#how-it-works" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 h-14 border-slate-300 text-slate-700 gap-2">
                    <Play className="h-4 w-4" />
                    See How It Works
                  </Button>
                </a>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Free plan available
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  BC/AB tax built-in
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Setup in 5 minutes
                </span>
              </div>
            </motion.div>

            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* Section 2: The Problem */}
      <ProblemSection />

      {/* Section 3: Cost of Doing Nothing */}
      <CostSection />

      {/* Section 4: The Solution */}
      <SolutionSection />

      {/* Section 5: How It Works */}
      <div id="how-it-works">
        <HowItWorks />
      </div>

      {/* Section 6: For Agents & Brokers */}
      <ForAgentsBrokers />

      {/* Section 7: Taxes */}
      <TaxSection />

      {/* Section 8: Emotional Payoff */}
      <EmotionalPayoff />

      {/* Section 9: Authority */}
      <AuthoritySection />

      {/* Section 10: Final CTA */}
      <FinalCTA />

      {/* Footer */}
      <footer className="py-10 sm:py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img 
                src="/favicon.png" 
                alt="CommissionIQ" 
                className="w-8 h-8 rounded-xl"
              />
              <span className="font-semibold text-lg">
                Commission<span className="text-emerald-400">IQ</span>
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
              <a href="mailto:support@commissioniq.ca" className="hover:text-white transition-colors">Contact</a>
            </div>
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} CommissionIQ. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
