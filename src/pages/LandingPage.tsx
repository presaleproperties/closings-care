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
  FileSpreadsheet,
  Calculator,
  Banknote,
  Sparkles,
  Menu,
  X,
  Zap,
  Lock,
  Users,
  Home,
  Briefcase,
  CreditCard,
  Eye,
  Heart,
  Coffee,
  TrendingDown,
  FileText,
  ChevronRight,
  Play,
  Landmark,
  Car,
  Smartphone,
  MapPin,
  Receipt,
  ArrowDown
} from "lucide-react";
import { motion, useInView, AnimatePresence, useScroll, useTransform } from "framer-motion";
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

// Story transition element - visual cue for narrative flow
function StoryTransition({ direction = "down", label }: { direction?: "down" | "up"; label?: string }) {
  return (
    <motion.div 
      className="py-8 sm:py-12 flex flex-col items-center gap-3"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      {label && (
        <span className="text-xs sm:text-sm font-medium text-slate-400 uppercase tracking-wider">{label}</span>
      )}
      <motion.div
        animate={{ y: direction === "down" ? [0, 8, 0] : [0, -8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <ArrowDown className={`h-5 w-5 text-slate-300 ${direction === "up" ? "rotate-180" : ""}`} />
      </motion.div>
    </motion.div>
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

// Interactive animated bar chart component
function AnimatedBarChart({ className = "" }: { className?: string }) {
  const bars = [
    { month: "Jan", income: 8200, expenses: 2400 },
    { month: "Feb", income: 12500, expenses: 3100 },
    { month: "Mar", income: 6800, expenses: 2800 },
    { month: "Apr", income: 18200, expenses: 3500 },
    { month: "May", income: 14500, expenses: 2900 },
    { month: "Jun", income: 22000, expenses: 4200 },
    { month: "Jul", income: 9800, expenses: 2600 },
    { month: "Aug", income: 28500, expenses: 5100 },
    { month: "Sep", income: 16200, expenses: 3300 },
    { month: "Oct", income: 21000, expenses: 3800 },
    { month: "Nov", income: 12800, expenses: 2700 },
    { month: "Dec", income: 24500, expenses: 4500 },
  ];
  
  const maxValue = Math.max(...bars.map(b => b.income));
  
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-slate-800">12-Month Income vs Expenses</h4>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500" />
            Income
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-300" />
            Expenses
          </span>
        </div>
      </div>
      <div className="flex items-end justify-between gap-1 h-32">
        {bars.map((bar, i) => (
          <div key={bar.month} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex gap-0.5 items-end" style={{ height: '100px' }}>
              <motion.div
                className="flex-1 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-sm"
                initial={{ height: 0 }}
                whileInView={{ height: `${(bar.income / maxValue) * 100}%` }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.05, duration: 0.5, ease: "easeOut" }}
              />
              <motion.div
                className="flex-1 bg-slate-300 rounded-t-sm"
                initial={{ height: 0 }}
                whileInView={{ height: `${(bar.expenses / maxValue) * 100}%` }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 + i * 0.05, duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <span className="text-[10px] text-slate-400">{bar.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Deal Pipeline Visualization
function DealPipelinePreview() {
  const deals = [
    { client: "Sarah Chen", address: "1245 Oak Street", status: "pending", amount: 18500, date: "Mar 15", progress: 65 },
    { client: "Mike Johnson", address: "892 Maple Ave", status: "closing", amount: 24200, date: "Mar 28", progress: 90 },
    { client: "Lisa Park", address: "567 Pine Road", status: "paid", amount: 12800, date: "Mar 02", progress: 100 },
    { client: "James Wilson", address: "234 Cedar Lane", status: "new", amount: 31500, date: "Apr 10", progress: 25 },
  ];

  const statusConfig = {
    new: { color: "bg-blue-500", label: "New Deal", bg: "bg-blue-50" },
    pending: { color: "bg-amber-500", label: "Pending", bg: "bg-amber-50" },
    closing: { color: "bg-emerald-500", label: "Closing", bg: "bg-emerald-50" },
    paid: { color: "bg-teal-500", label: "Paid", bg: "bg-teal-50" },
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Briefcase className="h-4 w-4 text-white" />
          </div>
          <h4 className="font-semibold text-slate-800">Deal Pipeline</h4>
        </div>
        <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full">4 active deals</span>
      </div>
      <div className="divide-y divide-slate-50">
        {deals.map((deal, i) => {
          const config = statusConfig[deal.status as keyof typeof statusConfig];
          return (
            <motion.div
              key={deal.client}
              className="p-4 hover:bg-slate-50/50 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-sm font-medium text-slate-600">
                    {deal.client.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{deal.client}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {deal.address}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600">${deal.amount.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">{deal.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${config.color} rounded-full`}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${deal.progress}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                  />
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.bg} text-slate-700`}>
                  {config.label}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// Expense Categories Preview
function ExpenseCategoriesPreview() {
  const categories = [
    { name: "Vehicle & Gas", icon: Car, amount: 1850, budget: 2000, color: "from-blue-500 to-blue-600" },
    { name: "Marketing", icon: Smartphone, amount: 980, budget: 1500, color: "from-purple-500 to-purple-600" },
    { name: "Office", icon: Briefcase, amount: 450, budget: 600, color: "from-amber-500 to-amber-600" },
    { name: "Insurance", icon: Shield, amount: 320, budget: 350, color: "from-emerald-500 to-teal-600" },
  ];

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-5"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Receipt className="h-4 w-4 text-white" />
          </div>
          <h4 className="font-semibold text-slate-800">Expense Tracking</h4>
        </div>
        <span className="text-sm font-bold text-slate-800">$3,600<span className="text-slate-400 font-normal">/mo</span></span>
      </div>
      <div className="space-y-4">
        {categories.map((cat, i) => {
          const percentage = (cat.amount / cat.budget) * 100;
          return (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                    <cat.icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                </div>
                <span className="text-sm text-slate-600">
                  <span className="font-semibold">${cat.amount}</span>
                  <span className="text-slate-400"> / ${cat.budget}</span>
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${cat.color}`}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${Math.min(percentage, 100)}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Tax Deductible</span>
          <span className="text-emerald-600 font-semibold">$2,890 (80%)</span>
        </div>
      </div>
    </motion.div>
  );
}

// Tax Safety Gauge Preview
function TaxSafetyGauge() {
  const percentage = 78;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-xl shadow-amber-100/60 border border-amber-200 p-5"
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
          <Landmark className="h-4 w-4 text-white" />
        </div>
        <h4 className="font-semibold text-slate-800">Tax Safety</h4>
      </div>
      
      <div className="flex items-center justify-center mb-4">
        <div className="relative">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-amber-200"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              stroke="url(#taxGradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              whileInView={{ strokeDashoffset }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.3 }}
            />
            <defs>
              <linearGradient id="taxGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-slate-800">{percentage}%</span>
            <span className="text-xs text-amber-600 font-medium">On Track</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Tax Set Aside</span>
          <span className="font-bold text-slate-800">$16,426</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Recommended</span>
          <span className="font-medium text-slate-600">$21,000</span>
        </div>
        <div className="flex items-center justify-between text-sm pt-2 border-t border-amber-200/50">
          <span className="text-slate-600">Gap to fill</span>
          <span className="font-semibold text-amber-600">$4,574</span>
        </div>
      </div>
    </motion.div>
  );
}

// Enhanced Dashboard Preview Component
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
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-5">
            {[
              { label: "Safe to Spend", value: "$7,750", gradient: true, icon: Wallet },
              { label: "Pipeline", value: "$76,500", trend: "+5 deals", icon: TrendingUp },
              { label: "YTD Income", value: "$142,800", trend: "+18%", icon: BarChart3 },
              { label: "Tax Set Aside", value: "$16,426", trend: "Ready", icon: Shield },
            ].map((kpi, i) => (
              <motion.div
                key={kpi.label}
                className={`rounded-xl p-2 sm:p-4 ${kpi.gradient ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-white'} shadow-sm border border-slate-100/50`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <kpi.icon className={`h-3 w-3 ${kpi.gradient ? 'text-emerald-100' : 'text-slate-400'}`} />
                  <p className={`text-[9px] sm:text-xs ${kpi.gradient ? 'text-emerald-100' : 'text-slate-500'} font-medium`}>{kpi.label}</p>
                </div>
                <p className={`text-sm sm:text-xl font-bold ${kpi.gradient ? 'text-white' : 'text-slate-800'}`}>{kpi.value}</p>
                {kpi.trend && <p className={`text-[8px] sm:text-xs ${kpi.gradient ? 'text-emerald-100' : 'text-emerald-600'} mt-0.5`}>{kpi.trend}</p>}
              </motion.div>
            ))}
          </div>

          {/* Chart */}
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

// Interactive App Preview Section
function AppPreviewSection() {
  const [activeTab, setActiveTab] = useState<'deals' | 'expenses' | 'taxes'>('deals');
  
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-slate-50 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-10 sm:mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-xs sm:text-sm font-medium mb-4">
            <Eye className="h-4 w-4" />
            See It In Action
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-800 mb-4">
            Experience the full dashboard
          </h2>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
            Track every deal, expense, and tax obligation in one beautiful interface
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'deals', label: 'Deal Pipeline', icon: Briefcase },
              { id: 'expenses', label: 'Expenses', icon: Receipt },
              { id: 'taxes', label: 'Tax Safety', icon: Calculator },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'deals' && (
            <motion.div
              key="deals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid lg:grid-cols-5 gap-6"
            >
              <div className="lg:col-span-3">
                <DealPipelinePreview />
              </div>
              <div className="lg:col-span-2 space-y-4">
                <motion.div
                  className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <h4 className="text-sm font-semibold text-slate-800 mb-4">Pipeline Summary</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Total Pipeline</span>
                      <span className="text-lg font-bold text-emerald-600">$87,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Closing This Month</span>
                      <span className="font-semibold text-slate-800">$42,700</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Average Commission</span>
                      <span className="font-semibold text-slate-800">$21,750</span>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-5 text-white"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="h-5 w-5" />
                    <span className="font-medium">Quick Actions</span>
                  </div>
                  <div className="space-y-2">
                    <button className="w-full bg-white/20 hover:bg-white/30 transition-colors rounded-lg p-3 text-left text-sm">
                      + Add New Deal
                    </button>
                    <button className="w-full bg-white/20 hover:bg-white/30 transition-colors rounded-lg p-3 text-left text-sm">
                      📊 View Income Forecast
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === 'expenses' && (
            <motion.div
              key="expenses"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid lg:grid-cols-2 gap-6"
            >
              <ExpenseCategoriesPreview />
              <motion.div
                className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-5"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <AnimatedBarChart />
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'taxes' && (
            <motion.div
              key="taxes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid lg:grid-cols-3 gap-6"
            >
              <TaxSafetyGauge />
              <div className="lg:col-span-2">
                <motion.div
                  className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-5"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <Calculator className="h-4 w-4 text-white" />
                      </div>
                      <h4 className="font-semibold text-slate-800">Tax Breakdown</h4>
                    </div>
                    <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full font-medium">BC Taxes</span>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: "Federal Tax", amount: 9856, percentage: 15.3 },
                      { label: "Provincial Tax (BC)", amount: 4712, percentage: 7.3 },
                      { label: "CPP Contributions", amount: 3867, percentage: 6.0 },
                      { label: "GST/HST Collected", amount: 1858, percentage: 2.9 },
                    ].map((item, i) => (
                      <motion.div
                        key={item.label}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <div>
                          <p className="font-medium text-slate-800">{item.label}</p>
                          <p className="text-xs text-slate-500">{item.percentage}% rate</p>
                        </div>
                        <p className="text-lg font-bold text-slate-800">${item.amount.toLocaleString()}</p>
                      </motion.div>
                    ))}
                    <div className="pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">Total Estimated Taxes</span>
                        <span className="text-2xl font-bold text-emerald-600">$20,293</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

// Section 2: The Problem - Enhanced with narrative
function ProblemSection() {
  const problems = [
    { icon: FileSpreadsheet, text: "Commissions spread across emails, spreadsheets, and portals", delay: 0 },
    { icon: Eye, text: "No clear view of pending vs paid income", delay: 0.1 },
    { icon: AlertTriangle, text: "Surprise tax bills every year", delay: 0.2 },
    { icon: Clock, text: "Pre-sales and trails feel invisible", delay: 0.3 },
    { icon: TrendingDown, text: "Broker statements don't match reality", delay: 0.4 },
  ];

  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
      {/* Background stress visual */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(239,68,68,0.5) 35px, rgba(239,68,68,0.5) 70px)`
        }} />
      </div>
      
      <div className="max-w-4xl mx-auto relative">
        <motion.div 
          className="text-center mb-10 sm:mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-xs sm:text-sm font-medium mb-4"
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
          >
            <AlertTriangle className="h-4 w-4" />
            Sound familiar?
          </motion.div>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-800 mb-3 sm:mb-4">
            You're closing deals — but your money feels <span className="text-red-500">unclear.</span>
          </h2>
        </motion.div>
        
        <div className="space-y-3 sm:space-y-4 mb-10">
          {problems.map((problem, i) => (
            <motion.div
              key={problem.text}
              className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 bg-white rounded-xl border border-red-100 shadow-sm hover:shadow-md hover:border-red-200 transition-all"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: problem.delay, type: "spring", stiffness: 100 }}
            >
              <motion.div 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0"
                whileHover={{ scale: 1.1, rotate: -5 }}
              >
                <problem.icon className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
              </motion.div>
              <p className="text-slate-700 text-sm sm:text-base font-medium pt-2">{problem.text}</p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="text-center p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-red-100"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-lg sm:text-xl text-slate-700 font-medium">
            If your income feels <span className="text-red-600 font-bold">stressful</span> despite earning well — <span className="italic">this is why.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// Section 3: Cost of Doing Nothing - Enhanced emotional impact
function CostSection() {
  const costs = [
    { icon: CreditCard, text: "Overspending money that isn't yours", color: "from-red-500 to-red-600" },
    { icon: Receipt, text: "Missed write-offs and incentives", color: "from-orange-500 to-orange-600" },
    { icon: Briefcase, text: "Poor hiring and investing decisions", color: "from-amber-500 to-amber-600" },
    { icon: Heart, text: "Constant money anxiety", color: "from-rose-500 to-rose-600" },
    { icon: FileText, text: "Dependence on accountants after the damage is done", color: "from-red-600 to-red-700" },
  ];

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.5, 1, 1, 0.5]);

  return (
    <section ref={containerRef} className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white overflow-hidden">
      {/* Animated background gradient */}
      <motion.div 
        className="absolute inset-0"
        style={{ opacity }}
      >
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
      </motion.div>

      <div className="max-w-4xl mx-auto relative">
        <motion.div 
          className="text-center mb-10 sm:mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 text-red-300 text-xs sm:text-sm font-medium mb-4"
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
          >
            <AlertTriangle className="h-4 w-4" />
            The Hidden Cost
          </motion.div>
          <h2 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">
            What unclear income <span className="text-red-400">really</span> costs you
          </h2>
        </motion.div>
        
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {costs.map((cost, i) => (
            <motion.div
              key={cost.text}
              className="flex items-center gap-4 p-5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <motion.div 
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cost.color} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}
              >
                <cost.icon className="h-6 w-6 text-white" />
              </motion.div>
              <p className="text-white/90 text-sm sm:text-base font-medium">{cost.text}</p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-xl sm:text-2xl text-white/70 font-medium mb-2">
            Every month without clarity is money <span className="text-red-400 font-bold">lost.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// Section 4: The Solution - Enhanced with transformation visual
function SolutionSection() {
  const features = [
    { icon: Banknote, text: "Deal-level commission tracking" },
    { icon: TrendingUp, text: "Real-time income forecast" },
    { icon: Calculator, text: "Automatic tax set-aside" },
    { icon: Receipt, text: "Expense tracking tied to income" },
    { icon: Calendar, text: "Pre-sale, assignment & trail support" },
  ];

  return (
    <section id="features" className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-emerald-50/30 overflow-hidden">
      {/* Transformation visual - from chaos to clarity */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          className="absolute top-1/4 left-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl"
          initial={{ x: -100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-0 w-48 h-48 bg-gradient-to-br from-teal-400/20 to-cyan-400/20 rounded-full blur-3xl"
          initial={{ x: 100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative">
        <motion.div 
          className="text-center mb-10 sm:mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-xs sm:text-sm font-medium mb-4"
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
          >
            <Sparkles className="h-4 w-4" />
            The Solution
          </motion.div>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-800 mb-3 sm:mb-4">
            One dashboard for your <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">entire deal pipeline.</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
            This app gives you a live view of every deal, every commission, every expense, and every dollar you owe — <span className="font-semibold text-slate-800">before it hits your bank account.</span>
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Feature List */}
          <motion.div className="space-y-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.text}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-emerald-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
              >
                <motion.div 
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform"
                  whileHover={{ rotate: 5 }}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </motion.div>
                <p className="text-slate-700 text-sm sm:text-base font-medium">{feature.text}</p>
                <ChevronRight className="h-5 w-5 text-emerald-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </motion.div>

          {/* Safe to Spend Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 blur-3xl scale-110" />
            <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 sm:p-8 border border-emerald-200 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <motion.div 
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Wallet className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <h3 className="font-bold text-slate-800">Safe to Spend</h3>
                  <p className="text-xs text-emerald-600">Updated in real-time</p>
                </div>
              </div>
              
              <div className="text-center mb-6">
                <motion.p 
                  className="text-5xl font-bold text-emerald-600"
                  initial={{ scale: 0.5, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  $7,750
                </motion.p>
                <p className="text-sm text-slate-500 mt-2">What you can safely spend this month</p>
              </div>
              
              <div className="space-y-3 bg-white/60 rounded-xl p-4">
                {[
                  { label: "Projected Cash In", value: "+$24,200", positive: true },
                  { label: "Tax Set-Aside (30%)", value: "-$7,260", positive: false },
                  { label: "Fixed Expenses", value: "-$5,890", positive: false },
                  { label: "Upcoming Bills", value: "-$3,300", positive: false },
                ].map((item, i) => (
                  <motion.div 
                    key={item.label}
                    className="flex justify-between text-sm"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <span className="text-slate-600">{item.label}</span>
                    <span className={`font-semibold ${item.positive ? 'text-emerald-600' : 'text-red-500'}`}>{item.value}</span>
                  </motion.div>
                ))}
                <div className="pt-3 border-t border-emerald-200">
                  <motion.div 
                    className="flex justify-between"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.9 }}
                  >
                    <span className="font-semibold text-slate-800">Safe to Spend</span>
                    <span className="font-bold text-emerald-600">$7,750</span>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Section 5: How It Works - Enhanced with flow visualization
function HowItWorks() {
  const steps = [
    { 
      step: "1", 
      title: "Add your deal", 
      description: "Accepted, conditional, or completed — log it once.",
      icon: Banknote,
      color: "from-blue-500 to-blue-600"
    },
    { 
      step: "2", 
      title: "Watch it flow", 
      description: "See commissions move from pending → earned → paid.",
      icon: TrendingUp,
      color: "from-emerald-500 to-teal-600"
    },
    { 
      step: "3", 
      title: "Stay in control", 
      description: "Know what you can spend, save, or reinvest — anytime.",
      icon: Shield,
      color: "from-amber-500 to-orange-600"
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
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, type: "spring", stiffness: 100 }}
            >
              {/* Connecting line */}
              {i < 2 && (
                <motion.div 
                  className="hidden sm:block absolute top-10 left-[60%] w-[80%] h-[2px]"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.2, duration: 0.5 }}
                  style={{ transformOrigin: 'left' }}
                >
                  <div className="h-full bg-gradient-to-r from-emerald-300 to-emerald-100" />
                </motion.div>
              )}
              
              <div className="relative inline-block mb-5">
                <motion.div 
                  className={`h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-xl shadow-emerald-500/25 mx-auto`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <item.icon className="h-7 w-7 sm:h-9 sm:w-9 text-white" />
                </motion.div>
                <motion.div 
                  className="absolute -top-2 -right-2 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-slate-800 text-white text-sm font-bold flex items-center justify-center shadow-lg"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.2, type: "spring" }}
                >
                  {item.step}
                </motion.div>
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
            className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 sm:p-8 border border-emerald-200 hover:shadow-xl transition-shadow"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6">
              <motion.div 
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Home className="h-6 w-6 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold text-slate-800">For Realtors</h3>
            </div>
            <ul className="space-y-3">
              {realtorFeatures.map((feature, i) => (
                <motion.li 
                  key={feature} 
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700 text-sm sm:text-base">{feature}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* For Mortgage Brokers */}
          <motion.div
            className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 sm:p-8 border border-teal-200 hover:shadow-xl transition-shadow"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6">
              <motion.div 
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/25"
                whileHover={{ scale: 1.1, rotate: -5 }}
              >
                <Briefcase className="h-6 w-6 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold text-slate-800">For Mortgage Brokers</h3>
            </div>
            <ul className="space-y-3">
              {brokerFeatures.map((feature, i) => (
                <motion.li 
                  key={feature} 
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <CheckCircle2 className="h-5 w-5 text-teal-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700 text-sm sm:text-base">{feature}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Section 7: Tax Section with Visual
function TaxSection() {
  const taxFeatures = [
    "Live tax reserve tracking",
    "GST/HST visibility",
    "Year-round readiness for your accountant",
    "Clear net-income view",
  ];

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-5xl mx-auto">
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

            <motion.p 
              className="text-lg sm:text-xl font-semibold text-emerald-600 italic"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              Stop guessing what's yours. <span className="font-bold">Know it.</span>
            </motion.p>
          </motion.div>

          <TaxSafetyGauge />
        </div>
      </div>
    </section>
  );
}

// Section 8: Emotional Payoff - Enhanced with transformation narrative
function EmotionalPayoff() {
  const benefits = [
    { icon: Users, text: "Hire with clarity" },
    { icon: TrendingUp, text: "Invest with confidence" },
    { icon: Calendar, text: "Plan your life, not just your deals" },
    { icon: Coffee, text: "Sleep better at night" },
  ];

  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-600 to-teal-700 text-white overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 rounded-full bg-white/10"
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 30}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 text-white text-xs sm:text-sm font-medium mb-4"
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
          >
            <Heart className="h-4 w-4" />
            The Real Payoff
          </motion.div>
          <h2 className="text-2xl sm:text-4xl font-bold mb-8 sm:mb-12">
            Confidence changes <span className="underline decoration-white/50 underline-offset-4">everything.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.text}
              className="flex flex-col items-center p-4 sm:p-6 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring" }}
              whileHover={{ y: -5 }}
            >
              <motion.div 
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-white/30 transition-colors"
                whileHover={{ rotate: 10, scale: 1.1 }}
              >
                <benefit.icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </motion.div>
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
              className="p-4 sm:p-6 bg-slate-50 rounded-2xl hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -3 }}
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

// Section 10: Final CTA - Enhanced with urgency
function FinalCTA() {
  return (
    <section className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.2, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, delay: 2 }}
        />
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
      <section className="pt-24 sm:pt-32 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
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

      {/* Story transition: Hero to Problem */}
      <StoryTransition label="But here's the reality" />

      {/* Section 2: The Problem */}
      <ProblemSection />

      {/* Story transition: Problem to Cost */}
      <StoryTransition label="And it's costing you" />

      {/* Section 3: Cost of Doing Nothing */}
      <CostSection />

      {/* Story transition: Cost to Solution */}
      <div className="bg-white">
        <StoryTransition label="There's a better way" />
      </div>

      {/* Section 4: The Solution */}
      <SolutionSection />

      {/* NEW: Interactive App Preview Section */}
      <div id="features">
        <AppPreviewSection />
      </div>

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
