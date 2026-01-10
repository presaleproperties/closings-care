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
  Sparkles
} from "lucide-react";
import { motion, useInView } from "framer-motion";
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

// Animated bar chart component for hero
function AnimatedBarChart() {
  const bars = [
    { height: 45, income: 8500, expense: 3200, month: 'Jan' },
    { height: 65, income: 12400, expense: 4100, month: 'Feb' },
    { height: 35, income: 6200, expense: 3800, month: 'Mar' },
    { height: 85, income: 18500, expense: 5200, month: 'Apr' },
    { height: 55, income: 9800, expense: 3500, month: 'May' },
    { height: 75, income: 15200, expense: 4800, month: 'Jun' },
  ];

  return (
    <div className="flex items-end justify-between gap-2 h-32 px-2">
      {bars.map((bar, i) => (
        <motion.div
          key={bar.month}
          className="flex-1 flex flex-col items-center gap-1"
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ delay: 0.8 + i * 0.1, duration: 0.5, ease: "easeOut" }}
          style={{ transformOrigin: 'bottom' }}
        >
          <div className="w-full flex gap-0.5">
            <div 
              className="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-sm"
              style={{ height: `${bar.height}px` }}
            />
            <div 
              className="flex-1 bg-gradient-to-t from-slate-300 to-slate-200 rounded-t-sm"
              style={{ height: `${bar.height * 0.35}px` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 font-medium">{bar.month}</span>
        </motion.div>
      ))}
    </div>
  );
}

// KPI Card component for dashboard preview
function MockKpiCard({ 
  label, 
  value, 
  trend, 
  trendUp, 
  delay,
  gradient
}: { 
  label: string; 
  value: string; 
  trend?: string; 
  trendUp?: boolean; 
  delay: number;
  gradient?: string;
}) {
  return (
    <motion.div
      className={`rounded-xl p-4 ${gradient || 'bg-white'} shadow-lg shadow-slate-200/50 border border-slate-100/50`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
      <p className={`text-xl font-bold ${gradient ? 'text-white' : 'text-slate-800'}`}>{value}</p>
      {trend && (
        <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
          {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {trend}
        </div>
      )}
    </motion.div>
  );
}

// Animated dashboard mockup
function DashboardMockup() {
  return (
    <div className="relative">
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
              app.commissiontracker.ca/dashboard
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
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                SC
              </div>
            </div>
          </motion.div>

          {/* KPI Row */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            <MockKpiCard 
              label="Safe to Spend" 
              value="$4,850" 
              delay={0.6}
              gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
            />
            <MockKpiCard 
              label="YTD Income" 
              value="$127,450" 
              trend="+23% vs last year"
              trendUp={true}
              delay={0.7}
            />
            <MockKpiCard 
              label="Pipeline" 
              value="$89,200" 
              trend="6 pending deals"
              trendUp={true}
              delay={0.8}
            />
            <MockKpiCard 
              label="Tax Set Aside" 
              value="$38,235" 
              trend="On track"
              trendUp={true}
              delay={0.9}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-3 gap-3">
            {/* Income Chart */}
            <motion.div 
              className="col-span-2 bg-white rounded-xl p-4 shadow-sm border border-slate-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">12-Month Projection</h4>
                  <p className="text-xs text-slate-500">Income vs Expenses</p>
                </div>
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
              <AnimatedBarChart />
            </motion.div>

            {/* Upcoming Payouts */}
            <motion.div 
              className="bg-white rounded-xl p-4 shadow-sm border border-slate-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              <h4 className="text-sm font-semibold text-slate-800 mb-3">Upcoming Payouts</h4>
              <div className="space-y-2.5">
                {[
                  { client: 'Chen Family', amount: '$12,500', date: 'Jan 15', type: 'Completion' },
                  { client: 'Mike Torres', amount: '$8,200', date: 'Jan 22', type: 'Advance' },
                  { client: 'Li Residence', amount: '$15,800', date: 'Feb 1', type: 'Completion' },
                ].map((payout, i) => (
                  <motion.div 
                    key={payout.client}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/80"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + i * 0.1 }}
                  >
                    <div>
                      <p className="text-xs font-medium text-slate-700">{payout.client}</p>
                      <p className="text-[10px] text-slate-400">{payout.type} • {payout.date}</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">{payout.amount}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
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
            <p className="text-[10px] text-slate-500">Tax protected</p>
            <p className="text-xs font-bold text-slate-800">$38,235 set aside</p>
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
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500">Pipeline coverage</p>
            <p className="text-xs font-bold text-slate-800">8.2 months runway</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Feature showcase with mini mockups
function FeatureShowcase({ 
  icon: Icon, 
  title, 
  description, 
  visual,
  reverse = false 
}: { 
  icon: React.ElementType;
  title: string; 
  description: string; 
  visual: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <motion.div 
      className={`grid lg:grid-cols-2 gap-8 lg:gap-16 items-center ${reverse ? 'lg:flex-row-reverse' : ''}`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
    >
      <div className={reverse ? 'lg:order-2' : ''}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-4">
          <Icon className="h-4 w-4" />
          <span>Feature</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4">{title}</h3>
        <p className="text-slate-500 text-lg leading-relaxed">{description}</p>
      </div>
      <div className={reverse ? 'lg:order-1' : ''}>
        {visual}
      </div>
    </motion.div>
  );
}

// Mini chart mockups for feature sections
function SafeToSpendVisual() {
  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-xl shadow-emerald-100/50 border border-emerald-100 p-6 max-w-sm mx-auto"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="text-center mb-6">
        <p className="text-sm text-slate-500 font-medium mb-2">Safe to Spend This Month</p>
        <p className="text-5xl font-bold text-emerald-600">
          $<AnimatedNumber value={4850} />
        </p>
        <div className="flex items-center justify-center gap-2 mt-3 text-emerald-600 bg-emerald-50 rounded-full px-4 py-1.5 text-sm font-medium w-fit mx-auto">
          <Shield className="h-4 w-4" />
          All obligations covered
        </div>
      </div>
      
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Projected Income</span>
          <span className="font-medium text-slate-700">$18,500</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Tax Set Aside</span>
          <span className="font-medium text-red-500">-$5,550</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Fixed Expenses</span>
          <span className="font-medium text-red-500">-$6,800</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Upcoming Bills</span>
          <span className="font-medium text-red-500">-$1,300</span>
        </div>
      </div>
    </motion.div>
  );
}

function TaxVisual() {
  const taxData = [
    { label: 'Income Received', amount: '$127,450', color: 'bg-emerald-500' },
    { label: 'Tax Set Aside', amount: '$38,235', color: 'bg-blue-500' },
    { label: 'Estimated Owed', amount: '$36,100', color: 'bg-slate-300' },
  ];

  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-xl shadow-blue-100/50 border border-blue-100 p-6 max-w-sm mx-auto"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
          <Calculator className="h-6 w-6 text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-slate-800">Tax Status</h4>
          <p className="text-sm text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            On Track
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {taxData.map((item, i) => (
          <motion.div 
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-slate-500">{item.label}</span>
              <span className="font-semibold text-slate-700">{item.amount}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                className={`h-full ${item.color} rounded-full`}
                initial={{ width: 0 }}
                whileInView={{ width: i === 0 ? '100%' : i === 1 ? '30%' : '28%' }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-3 bg-emerald-50 rounded-xl text-center">
        <p className="text-sm text-emerald-700">
          <span className="font-bold">$2,135</span> buffer above estimated taxes
        </p>
      </div>
    </motion.div>
  );
}

function ProjectionVisual() {
  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-xl shadow-violet-100/50 border border-violet-100 p-6 max-w-md mx-auto"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 text-sm">12-Month Forecast</h4>
            <p className="text-xs text-slate-500">Income vs Expenses</p>
          </div>
        </div>
      </div>

      {/* Mini chart */}
      <div className="h-36 flex items-end justify-between gap-1.5 mb-4">
        {[65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88, 82].map((height, i) => (
          <motion.div
            key={i}
            className="flex-1 flex flex-col gap-0.5"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
            style={{ transformOrigin: 'bottom' }}
          >
            <div 
              className="w-full bg-gradient-to-t from-violet-500 to-violet-400 rounded-t-sm"
              style={{ height: `${height}%` }}
            />
            <div 
              className="w-full bg-slate-200 rounded-t-sm"
              style={{ height: `${height * 0.3}%` }}
            />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
        <div className="text-center">
          <p className="text-lg font-bold text-slate-800">$247K</p>
          <p className="text-xs text-slate-500">Projected</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-emerald-600">$156K</p>
          <p className="text-xs text-slate-500">Confirmed</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-violet-600">$91K</p>
          <p className="text-xs text-slate-500">Pipeline</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-lg text-slate-800">Commission Tracker</span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-800 hover:bg-slate-100">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-8 lg:pt-32 lg:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left side - Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-sm font-medium mb-5">
                <Sparkles className="h-4 w-4" />
                Built for Canadian Real Estate Agents
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-slate-800 tracking-tight leading-[1.1] mb-6">
                Finally understand
                <span className="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  your money.
                </span>
              </h1>
              
              <p className="text-xl text-slate-500 mb-8 leading-relaxed max-w-lg">
                See your real income, plan for taxes, and know exactly what you can spend — 
                even when deals fall apart.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Link to="/auth">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-base px-8 h-13 gap-2 shadow-xl shadow-emerald-500/30 transition-all hover:shadow-2xl hover:shadow-emerald-500/40 hover:-translate-y-0.5">
                    Start Free — No Card Required
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#features">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-6 h-13 border-slate-300 text-slate-600 hover:bg-slate-50">
                    See What's Inside
                  </Button>
                </a>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Free forever plan
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  BC tax brackets built-in
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  5-minute setup
                </span>
              </div>
            </motion.div>

            {/* Right side - Dashboard mockup */}
            <div className="lg:ml-8">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-8 border-y border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
            <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Trusted by agents at</p>
            <div className="flex flex-wrap items-center justify-center gap-8 text-slate-400">
              {['RE/MAX', 'Royal LePage', 'Sutton', 'Oakwyn', 'Macdonald Realty'].map((brand) => (
                <span key={brand} className="text-lg font-semibold">{brand}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points - Compact */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
              Sound familiar?
            </h2>
            <p className="text-slate-500 text-lg">The struggles that keep agents up at night</p>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: AlertTriangle, text: "Unpredictable income — great months followed by silence", color: "text-amber-500", bg: "bg-amber-50" },
              { icon: Calculator, text: "Tax season panic — realizing you didn't set enough aside", color: "text-red-500", bg: "bg-red-50" },
              { icon: Wallet, text: "Overspending after big commissions, then scrambling", color: "text-orange-500", bg: "bg-orange-50" },
              { icon: HeartPulse, text: "Slow month stress — wondering if you'll make rent", color: "text-rose-500", bg: "bg-rose-50" },
              { icon: FileSpreadsheet, text: "Spreadsheets that break when deals change", color: "text-slate-500", bg: "bg-slate-50" },
              { icon: Clock, text: "Hours wasted on bookkeeping instead of selling", color: "text-purple-500", bg: "bg-purple-50" },
            ].map((pain, i) => (
              <motion.div
                key={pain.text}
                className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <div className={`h-9 w-9 rounded-lg ${pain.bg} flex items-center justify-center shrink-0`}>
                  <pain.icon className={`h-4 w-4 ${pain.color}`} />
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{pain.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Showcases with Visuals */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto space-y-24">
          {/* Safe to Spend */}
          <FeatureShowcase
            icon={Shield}
            title="The only number that actually matters"
            description="Stop guessing what you can afford. Our Safe-to-Spend calculator automatically accounts for taxes, fixed expenses, and upcoming obligations — so you can spend with confidence, not anxiety."
            visual={<SafeToSpendVisual />}
          />

          {/* Tax Protection */}
          <FeatureShowcase
            icon={Calculator}
            title="Never get surprised by taxes again"
            description="Automatic BC-specific tax calculations with conservative buffers. We set aside exactly what you'll owe — including CPP and provincial taxes — so tax season feels like a formality, not a crisis."
            visual={<TaxVisual />}
            reverse
          />

          {/* 12-Month Projection */}
          <FeatureShowcase
            icon={TrendingUp}
            title="See slow months before they hurt"
            description="A 12-month projection that actually makes sense. See your confirmed income, pending deals, and projected expenses — so you can prepare for slow periods instead of panicking through them."
            visual={<ProjectionVisual />}
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
              Get clarity in 5 minutes
            </h2>
            <p className="text-slate-500 text-lg">No learning curve. No complex setup.</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "1", icon: Banknote, title: "Add your deals", description: "Enter pending and closed deals. 2 minutes max." },
              { step: "2", icon: Wallet, title: "Add your expenses", description: "Fixed costs, business expenses, tax obligations." },
              { step: "3", icon: Eye, title: "Get financial clarity", description: "Instant safe-to-spend, projections, and tax set-aside." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="relative inline-block mb-5">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 mx-auto">
                    <item.icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-slate-800 text-white text-sm font-bold flex items-center justify-center">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
              Agents who finally feel in control
            </h2>
            <p className="text-slate-500 text-lg">Real stories about financial clarity</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6">
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

      {/* Pricing */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
              Simple, honest pricing
            </h2>
            <p className="text-slate-500 text-lg">Costs less than one missed tax deduction.</p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Free */}
            <motion.div
              className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-semibold text-slate-800 mb-1">Free</h3>
              <p className="text-slate-500 text-sm mb-5">Perfect for getting started</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-800">$0</span>
                <span className="text-slate-400 ml-1">/month</span>
              </div>
              <div className="space-y-3 mb-7">
                {["Up to 10 deals", "Basic expense tracking", "3-month projections", "Mobile-friendly"].map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="text-sm text-slate-600">{f}</span>
                  </div>
                ))}
              </div>
              <Link to="/auth" className="block">
                <Button variant="outline" className="w-full h-11 border-slate-300">Get Started Free</Button>
              </Link>
            </motion.div>

            {/* Pro */}
            <motion.div
              className="bg-white rounded-2xl p-7 border-2 border-emerald-500 shadow-xl shadow-emerald-100/50 relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-1 text-xs font-semibold rounded-full shadow-lg">
                RECOMMENDED
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-1">Professional</h3>
              <p className="text-slate-500 text-sm mb-5">For serious producers</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-800">$29</span>
                <span className="text-slate-400 ml-1">/month</span>
              </div>
              <div className="space-y-3 mb-7">
                {["Unlimited deals", "Full expense tracking", "12-month projections", "Tax set-aside calculator", "Safe-to-spend tracking", "Data export", "Priority support"].map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="text-sm text-slate-600">{f}</span>
                  </div>
                ))}
              </div>
              <Link to="/auth" className="block">
                <Button className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25">
                  Start 14-Day Free Trial
                </Button>
              </Link>
            </motion.div>
          </div>

          <p className="text-center text-sm text-slate-400 mt-6">
            No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-emerald-50">
        <motion.div 
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4">
            Ready to finally understand your finances?
          </h2>
          <p className="text-slate-500 text-lg mb-8">
            Join agents who've stopped guessing and started feeling calm about money.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-base px-8 h-13 gap-2 shadow-xl shadow-emerald-500/30 transition-all hover:shadow-2xl hover:shadow-emerald-500/40 hover:-translate-y-0.5">
              Get Financial Clarity — Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <p className="text-sm text-slate-400 mt-4">Setup takes 5 minutes</p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-4 gap-8">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-lg text-slate-800">Commission Tracker</span>
              </div>
              <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                Financial clarity for commission-based real estate agents. 
                Know what you can spend — before it becomes a problem.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-4 text-sm">Product</h4>
              <ul className="space-y-2.5 text-sm text-slate-500">
                <li><a href="#features" className="hover:text-slate-800 transition-colors">Features</a></li>
                <li><Link to="/auth" className="hover:text-slate-800 transition-colors">Pricing</Link></li>
                <li><Link to="/auth" className="hover:text-slate-800 transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-4 text-sm">Legal</h4>
              <ul className="space-y-2.5 text-sm text-slate-500">
                <li><Link to="/terms" className="hover:text-slate-800 transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-slate-800 transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 mt-10 pt-8 text-center text-sm text-slate-400">
            <p>© {new Date().getFullYear()} Commission Tracker. Built for Canadian agents.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
