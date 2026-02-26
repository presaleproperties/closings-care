import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  CheckCircle2, 
  Shield,
  BarChart3,
  Wallet,
  Calculator,
  Menu,
  X,
  Lock,
  PieChart,
  ChevronDown,
  Target,
  Receipt,
  Zap,
  LineChart,
  Play,
  TrendingUp,
  DollarSign,
  Users,
  Building2,
  Home,
  MapPin,
  Star,
  Clock,
  FileText,
  Layers,
  Eye,
  Briefcase,
  CalendarCheck,
  CircleDollarSign,
  ArrowUpRight,
  Check,
  RefreshCw,
  Wifi,
  Network
} from "lucide-react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import logoMark from '@/assets/logo-mark.png';

// ─── Animated counter ─────────────────────────────
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

// ─── Section wrapper ──────────────────────────────
function SectionBadge({ icon: Icon, label, variant = "primary" }: { icon: React.ElementType; label: string; variant?: "primary" | "amber" | "white" }) {
  const styles = {
    primary: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    white: "border-white/20 bg-white/5 text-white/70",
  };
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium tracking-wide ${styles[variant]}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
  );
}

// ─── HERO ─────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#070b09]">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[40%] -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-emerald-500/15 via-teal-500/8 to-transparent rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-gradient-to-t from-amber-500/8 to-transparent rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#070b09] to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — Copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <SectionBadge icon={Star} label="BUILT FOR REAL BROKERAGE AGENTS" variant="white" />
            </motion.div>

            <motion.h1 
              className="text-5xl sm:text-6xl lg:text-[72px] font-bold text-white tracking-[-0.03em] leading-[1.05] mt-8 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Financial{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                Clarity
              </span>
              {' '}for Every Real Deal
            </motion.h1>

            <motion.p 
              className="text-lg sm:text-xl text-white/50 mb-8 max-w-lg leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Connect your ReZen account once. Your deals, commissions, and rev share sync automatically — so you always know exactly where you stand.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 h-14 gap-3 bg-white text-[#070b09] font-bold hover:bg-white/90 rounded-full group">
                  Start Free — 14 Days
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 h-14 border-white/15 text-white/70 hover:bg-white/5 hover:text-white gap-3 rounded-full">
                  <Play className="h-4 w-4" />
                  See It in Action
                </Button>
              </Link>
            </motion.div>

            <motion.div 
              className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/35"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-500/70" />No credit card</span>
              <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-500/70" />BC, AB, ON tax rates</span>
              <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-500/70" />Syncs directly with ReZen</span>
            </motion.div>
          </div>

          {/* Right — Glassmorphic stat card */}
          <motion.div
            className="hidden lg:block"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          >
            <div className="relative">
              <div className="absolute -inset-8 bg-gradient-to-br from-emerald-500/10 via-transparent to-amber-500/5 rounded-[40px] blur-2xl" />
              <div className="relative bg-white/[0.05] backdrop-blur-2xl rounded-3xl border border-white/[0.08] p-8 shadow-2xl">
                {/* Top metric */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center border border-emerald-500/20">
                    <Wallet className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">$12,450</p>
                    <p className="text-sm text-white/40">Safe to Spend</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-white/40">Tax Reserve Status</span>
                    <span className="text-emerald-400 font-semibold">85%</span>
                  </div>
                  <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "85%" }}
                      transition={{ delay: 1, duration: 1.2, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06]">
                    <p className="text-2xl font-bold text-white">$284K</p>
                    <p className="text-xs text-white/35 mt-0.5 uppercase tracking-wider">GCI YTD</p>
                  </div>
                  <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06]">
                    <p className="text-2xl font-bold text-white">23</p>
                    <p className="text-xs text-white/35 mt-0.5 uppercase tracking-wider">Deals Closed</p>
                  </div>
                </div>

                {/* Bottom tags */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400 text-xs font-medium">REZEN SYNCED</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 text-sm">
                    <TrendingUp className="h-3 w-3 text-amber-400" />
                    <span className="text-amber-400 text-xs font-medium">+18% YoY</span>
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

// ─── PAIN POINTS ──────────────────────────────────
function PainSection() {
  const pains = [
    {
      icon: DollarSign,
      question: "How much am I actually making?",
      detail: "You know your GCI — but after splits, cap contributions, team cuts, and taxes, what's left? Most agents can't answer this in under 10 minutes."
    },
    {
      icon: RefreshCw,
      question: "Why am I manually entering deals I already closed in ReZen?",
      detail: "You close a deal in ReZen, then re-enter it somewhere else for tracking. That's wasted time on work you already did."
    },
    {
      icon: Wallet,
      question: "Can I afford this right now?",
      detail: "New marketing campaign. An assistant hire. Investment property. You want to say yes, but you're not 100% sure the numbers work."
    },
    {
      icon: Clock,
      question: "What does next quarter look like?",
      detail: "Slow months sneak up. Pipeline visibility is scattered across emails, texts, and your head. Surprises aren't fun."
    }
  ];

  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <SectionBadge icon={Eye} label="Sound familiar?" variant="amber" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-6 mb-4 tracking-tight">
            You're great at closing deals.
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Understanding your finances? That's a different story entirely.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4">
          {pains.map((p, i) => (
            <motion.div
              key={p.question}
              className="group rounded-2xl p-6 bg-card border border-border/50 hover:border-primary/25 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                <p.icon className="h-5 w-5 text-amber-500" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{p.question}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.detail}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CORE FEATURES ────────────────────────────────
function FeaturesSection() {
  const features = [
    {
      icon: RefreshCw,
      title: "Auto-Sync from ReZen",
      desc: "Connect once and your deals, payouts, and rev share populate automatically. No manual entry.",
      highlights: ["Auto-imports deals", "Rev share tracking", "Network data synced", "Payouts auto-matched"],
      gradient: "from-emerald-600 to-green-500"
    },
    {
      icon: Wallet,
      title: "Safe-to-Spend",
      desc: "Your real spending limit — after taxes, expenses, and obligations. Updated with every deal.",
      highlights: ["After-tax calculations", "Expense-aware", "Pipeline factored in", "Instant clarity"],
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      icon: PieChart,
      title: "Business Analytics",
      desc: "See where deals come from, which property types perform best, and your most profitable lead sources.",
      highlights: ["Lead source breakdown", "Property type analysis", "City performance", "Monthly trends"],
      gradient: "from-teal-500 to-cyan-600"
    },
    {
      icon: LineChart,
      title: "12-Month Forecast",
      desc: "See your income projection based on current pipeline. Spot slow months before they arrive.",
      highlights: ["Pipeline-based projections", "Slow month alerts", "Cashflow planning", "Trend analysis"],
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      icon: Shield,
      title: "Tax Reserves",
      desc: "Canadian tax brackets built in. BC, AB, ON rates. GST for registered agents. Year-round peace of mind.",
      highlights: ["Provincial rates", "GST/HST ready", "Set-aside calcs", "No April surprises"],
      gradient: "from-amber-500 to-orange-600"
    },
    {
      icon: Target,
      title: "Brokerage Cap",
      desc: "Know exactly where you stand on your Real Broker cap. Stop trusting someone else's math.",
      highlights: ["Real-time progress", "100% split countdown", "Monthly contributions", "Cap projection"],
      gradient: "from-violet-500 to-purple-600"
    },
    {
      icon: Receipt,
      title: "Expense Intelligence",
      desc: "See your burn rate, catch lifestyle creep, and know what's tax deductible — all in one view.",
      highlights: ["Category breakdown", "Fixed vs variable", "Tax deductible flags", "Budget alerts"],
      gradient: "from-rose-500 to-pink-600"
    }
  ];

  return (
    <section id="features" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-[#070b09]">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <SectionBadge icon={Zap} label="COMPLETE CLARITY" variant="primary" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-6 mb-4 tracking-tight">
            Everything you need.{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Nothing you don't.</span>
          </h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto">
            Not generic accounting software adapted for real estate. Built specifically for how Canadian realtors actually work.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="group bg-white/[0.03] rounded-2xl p-6 border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 hover:bg-white/[0.05]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center shadow-lg mb-5`}>
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-white/40 text-sm mb-5 leading-relaxed">{f.desc}</p>
              <ul className="space-y-2">
                {f.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2.5 text-xs text-white/30">
                    <Check className="h-3 w-3 text-emerald-500/60" />
                    {h}
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

// ─── ANALYTICS DEEP DIVE ──────────────────────────
function AnalyticsSection() {
  const dimensions = [
    { icon: Users, label: "Lead Sources", desc: "Referral, online, past client, open house" },
    { icon: Building2, label: "Property Types", desc: "Presale vs resale performance" },
    { icon: Home, label: "Deal Types", desc: "Buyer vs seller representation" },
    { icon: MapPin, label: "Geographic", desc: "City and neighbourhood breakdown" },
  ];

  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <SectionBadge icon={BarChart3} label="BUSINESS ANALYTICS" variant="primary" />
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-6 mb-4 tracking-tight">
              Finally understand where your business comes from
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Stop guessing which marketing channels work. See exactly which lead sources, property types, and areas generate your best commissions.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {dimensions.map((d, i) => (
                <motion.div
                  key={d.label}
                  className="bg-card rounded-xl p-4 border border-border/50 hover:border-primary/20 transition-all"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <d.icon className="h-5 w-5 text-primary mb-2" />
                  <h4 className="font-semibold text-foreground text-sm mb-0.5">{d.label}</h4>
                  <p className="text-xs text-muted-foreground">{d.desc}</p>
                </motion.div>
              ))}
            </div>

            <Link to="/demo">
              <Button className="btn-premium gap-2 h-12 px-6 rounded-full">
                See Analytics in Action
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-foreground">Revenue by Lead Source</h3>
                <span className="text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-full font-medium">YTD</span>
              </div>
              
              <div className="space-y-4">
                {[
                  { label: "Referrals", value: 42, amount: "$119,490", color: "bg-emerald-500" },
                  { label: "Past Clients", value: 28, amount: "$79,660", color: "bg-teal-500" },
                  { label: "Online Leads", value: 18, amount: "$51,210", color: "bg-cyan-500" },
                  { label: "Open Houses", value: 12, amount: "$34,140", color: "bg-amber-500" },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                  >
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="text-foreground font-semibold">{item.amount}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
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

              <div className="mt-6 pt-5 border-t border-border/50 flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Total GCI</span>
                <span className="text-2xl font-bold text-primary">$284,500</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── HOW IT WORKS ─────────────────────────────────
function HowItWorksSection() {
  const steps = [
    { step: "01", icon: RefreshCw, title: "Connect ReZen once", desc: "Paste your ReZen API key in Settings. Deals, commissions, and rev share populate automatically — no manual entry." },
    { step: "02", icon: Calculator, title: "We do the math", desc: "Splits, cap, taxes, expenses — all calculated automatically with Canadian tax brackets." },
    { step: "03", icon: Eye, title: "Get complete clarity", desc: "Safe-to-Spend, analytics, forecasts, and insights. Everything in one view." },
  ];

  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Simple to start. Powerful to use.</h2>
        </motion.div>
        
        <div className="grid sm:grid-cols-3 gap-8 relative">
          <div className="hidden sm:block absolute top-14 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              className="text-center relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <div className="relative inline-block mb-5">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/20 mx-auto">
                  <s.icon className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center shadow-lg">
                  {s.step}
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{s.title}</h3>
              <p className="text-muted-foreground text-sm">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── INTEGRATIONS ─────────────────────────────────
function IntegrationsSection() {
  const integrations = [
    {
      icon: Zap,
      name: "ReZen",
      status: "LIVE" as const,
      desc: "Auto-sync your deals, payouts, rev share, and network. Connect once and everything stays up to date.",
    },
    {
      icon: FileText,
      name: "SkySlope",
      status: "COMING SOON" as const,
      desc: "Transaction coordination data synced directly into your deal pipeline.",
    },
    {
      icon: Users,
      name: "Lofty (Chime)",
      status: "COMING SOON" as const,
      desc: "CRM contacts and pipeline leads coming straight into your pipeline view.",
    },
  ];

  return (
    <section id="integrations" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-[#070b09]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <SectionBadge icon={Wifi} label="INTEGRATIONS" variant="primary" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-6 mb-4 tracking-tight">
            Connects to the tools you already use
          </h2>
          <p className="text-lg text-white/40 max-w-xl mx-auto">
            ReZen is live today. SkySlope and Lofty are coming soon.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-4">
          {integrations.map((integration, i) => (
            <motion.div
              key={integration.name}
              className={`rounded-2xl p-6 border transition-all duration-300 ${
                integration.status === "LIVE"
                  ? "bg-emerald-500/[0.06] border-emerald-500/20 hover:border-emerald-500/40"
                  : "bg-white/[0.03] border-white/[0.07] hover:border-white/[0.12]"
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-start justify-between mb-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  integration.status === "LIVE"
                    ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25"
                    : "bg-white/[0.07] border border-white/[0.1]"
                }`}>
                  <integration.icon className={`h-5 w-5 ${integration.status === "LIVE" ? "text-white" : "text-white/40"}`} />
                </div>

                {integration.status === "LIVE" ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                    </span>
                    <span className="text-emerald-400 text-xs font-semibold tracking-wide">LIVE</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/8">
                    <Clock className="h-3 w-3 text-amber-500/70" />
                    <span className="text-amber-500/80 text-xs font-medium tracking-wide">COMING SOON</span>
                  </div>
                )}
              </div>

              <h3 className={`text-lg font-bold mb-2 ${integration.status === "LIVE" ? "text-white" : "text-white/60"}`}>
                {integration.name}
              </h3>
              <p className={`text-sm leading-relaxed ${integration.status === "LIVE" ? "text-white/50" : "text-white/30"}`}>
                {integration.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── DEAL TYPES ───────────────────────────────────
function DealTypesSection() {
  const types = [
    {
      icon: Home, title: "Resale Transactions",
      features: ["Buyer & seller side", "Team splits calculated", "Close date projections", "Commission breakdowns"]
    },
    {
      icon: Layers, title: "Presale / Pre-Construction",
      features: ["Multiple payout dates", "Advance + deposits + completion", "2-3 year deal visibility", "Completion date forecasting"]
    },
    {
      icon: Briefcase, title: "Team & Referral Deals",
      features: ["Team member portions", "Referral fee visibility", "Co-listing splits", "Net commission after all cuts"]
    }
  ];

  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-5xl mx-auto">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 tracking-tight">Handles every type of deal</h2>
          <p className="text-lg text-muted-foreground">Resale, presale, team deals, referrals — all covered.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {types.map((t, i) => (
            <motion.div
              key={t.title}
              className="bg-card rounded-2xl p-6 border border-border/50 hover:border-primary/20 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <t.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">{t.title}</h3>
              <ul className="space-y-2.5">
                {t.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    {f}
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

// ─── TAX SAFETY ───────────────────────────────────
function TaxSection() {
  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-[#070b09]">
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <SectionBadge icon={Shield} label="TAX READY YEAR-ROUND" variant="amber" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-6 mb-4 tracking-tight">No more April surprises</h2>
            <p className="text-lg text-white/45 mb-8">
              Canadian tax brackets built in. We calculate exactly how much to set aside so you're never caught off guard.
            </p>
            
            <ul className="space-y-3">
              {[
                "BC, Alberta, and Ontario tax rates",
                "GST/HST for registered agents",
                "Real-time tax reserve calculations",
                "Accountant-ready annual exports"
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-white/70">
                  <div className="w-5 h-5 rounded-full bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                    <Check className="h-3 w-3 text-amber-400" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="bg-white/[0.04] rounded-2xl p-8 border border-white/[0.08] backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-white text-lg">Tax Safety Status</h3>
              </div>

              <div className="flex justify-center mb-8">
                <div className="relative w-36 h-36">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" stroke="hsl(0 0% 100% / 0.06)" strokeWidth="6" fill="none" />
                    <circle 
                      cx="50" cy="50" r="45" 
                      stroke="url(#taxGaugeNew)" strokeWidth="6" fill="none" 
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 45}
                      strokeDashoffset={2 * Math.PI * 45 * 0.15}
                    />
                    <defs>
                      <linearGradient id="taxGaugeNew" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#10B981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-white">85%</span>
                    <span className="text-xs text-emerald-400 font-medium">On Target</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-white/40">Tax Set Aside</span><span className="font-bold text-white">$42,680</span></div>
                <div className="flex justify-between"><span className="text-white/40">Estimated Owing</span><span className="font-bold text-white">$50,200</span></div>
                <div className="h-px bg-white/[0.06] my-2" />
                <div className="flex justify-between"><span className="text-emerald-400">Status</span><span className="font-bold text-emerald-400">Healthy Buffer</span></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── SOCIAL PROOF ─────────────────────────────────
function SocialProofSection() {
  const testimonials = [
    { quote: "I finally see where my business comes from. Referrals were 60% of my income — I had no idea until I saw the analytics.", name: "Sarah M.", company: "Real Brokerage, Vancouver" },
    { quote: "The presale visibility alone is worth it. I have deals closing in 2027 and can finally see the full picture.", name: "David C.", company: "Real Brokerage, Burnaby" },
    { quote: "Tax season used to stress me out. Now I know exactly what I owe all year. No surprises.", name: "Jennifer L.", company: "Real Brokerage, Calgary" }
  ];

  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-5xl mx-auto">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Trusted by Real Brokerage agents</h2>
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
              className="text-center p-6 bg-card rounded-2xl border border-border/50"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <p className="text-2xl sm:text-3xl font-bold text-primary">
                <AnimatedNumber value={stat.value} prefix={stat.prefix} suffix={stat.suffix} decimals={stat.decimals || 0} />
              </p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="bg-card rounded-2xl p-6 border border-border/50"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-muted-foreground text-sm mb-5 leading-relaxed">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── OBJECTIONS FAQ ───────────────────────────────
function ObjectionSection() {
  const objections = [
    { q: "I use spreadsheets", a: "Spreadsheets don't give you instant Safe-to-Spend calculations, lead source analytics, or 12-month forecasts. They're homework. This is clarity." },
    { q: "My accountant handles it", a: "Your accountant files taxes once a year. We give you clarity every day. Can you afford that marketing spend right now? We answer that in 10 seconds." },
    { q: "I don't have time for something new", a: "15 seconds to add a deal. That's it. If you can add a contact to your phone, you can use dealzflow." },
    { q: "I already know my numbers", a: "Can you tell me your exact net take-home after splits, cap, and taxes in under 30 seconds? Can you show which lead source gives the best ROI? That's what we do." },
    { q: "Does it work with other brokerages?", a: "Right now, dealzflow is purpose-built for Real Brokerage agents using ReZen. SkySlope and Lofty integrations are coming soon for broader support." }
  ];

  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-3xl mx-auto">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Common questions</h2>
        </motion.div>

        <div className="space-y-3">
          {objections.map((o, i) => (
            <motion.div key={o.q} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
              <Collapsible>
                <CollapsibleTrigger className="w-full">
                  <div className="bg-card rounded-xl p-5 border border-border/50 hover:border-primary/20 transition-all flex items-center justify-between group">
                    <h3 className="text-base font-semibold text-foreground text-left">{o.q}</h3>
                    <ChevronDown className="h-5 w-5 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform flex-shrink-0 ml-4" />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-5 pb-5 pt-2 bg-card rounded-b-xl border-x border-b border-border/50 -mt-2">
                    <p className="text-muted-foreground text-sm leading-relaxed">{o.a}</p>
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

// ─── PRICING ──────────────────────────────────────
function PricingSection() {
  const features = [
    "Unlimited deals & payouts",
    "Business analytics",
    "Safe-to-Spend calculator",
    "12-month income forecasting",
    "Brokerage cap visibility",
    "Tax reserve calculations",
    "Presale & resale support",
    "Lead source intelligence",
    "Expense awareness",
    "Accountant-ready exports"
  ];

  return (
    <section id="pricing" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-xl mx-auto">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Simple, transparent pricing</h2>
        </motion.div>

        <motion.div
          className="bg-card rounded-3xl shadow-2xl border border-border/50 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="p-8 text-center bg-gradient-to-br from-primary/8 to-primary/3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 tracking-wide">MOST POPULAR</div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Pro</h3>
            <div className="flex items-baseline justify-center gap-1 mb-1">
              <span className="text-5xl font-bold text-foreground tracking-tight">$29</span>
              <span className="text-muted-foreground">CAD/month</span>
            </div>
          </div>

          <div className="p-8">
            <ul className="space-y-3 mb-8">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-foreground text-sm">{f}</span>
                </li>
              ))}
            </ul>

            <Link to="/auth" className="block">
              <Button className="w-full h-14 text-base btn-premium shadow-xl rounded-full font-bold">
                Start 14-Day Free Trial
              </Button>
            </Link>
            <p className="text-center text-sm text-muted-foreground mt-3">No credit card required</p>
          </div>
        </motion.div>

        <motion.div className="mt-6 text-center p-4 bg-card rounded-xl border border-border/50" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <Shield className="h-5 w-5 text-amber-500 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">90-day guarantee:</strong> If you don't make at least one better financial decision, we'll refund you.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ─── FINAL CTA ────────────────────────────────────
function FinalCTASection() {
  return (
    <section className="py-28 sm:py-40 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#070b09]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-b from-emerald-500/12 to-transparent rounded-full blur-[120px]" />
      </div>
      
      <div className="max-w-3xl mx-auto text-center relative">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
            Get complete clarity on your business
          </h2>
          <p className="text-xl text-white/40 mb-10">
            Join Real Brokerage agents who finally understand their numbers.
          </p>

          <Link to="/auth">
            <Button size="lg" className="bg-white text-[#070b09] text-base px-12 h-16 gap-3 shadow-2xl group font-bold hover:bg-white/90 rounded-full">
              Start Your Free Trial
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/30 mt-8">
            <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500/60" />14-day free trial</span>
            <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500/60" />No credit card required</span>
            <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500/60" />Ready in 5 minutes</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────
function Footer() {
  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-[#050805]">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={logoMark} alt="dealzflow" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-white">dealz<span className="text-emerald-400">flow</span></span>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/35">
            <Link to="/privacy" className="hover:text-white/70 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white/70 transition-colors">Terms</Link>
            <a href="mailto:support@dealzflow.ca" className="hover:text-white/70 transition-colors">Support</a>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/[0.06] text-center text-sm text-white/25">
          &copy; {new Date().getFullYear()} dealzflow. Built for Real Brokerage agents.
        </div>
      </div>
    </footer>
  );
}

// ─── MAIN ─────────────────────────────────────────
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070b09]/80 backdrop-blur-2xl border-b border-white/[0.06]" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-[72px]">
            <Link to="/" className="flex items-center gap-2.5">
              <img src={logoMark} alt="dealzflow" className="w-9 h-9 rounded-xl" />
              <span className="font-bold text-lg text-white tracking-tight">
                dealz<span className="text-emerald-400">flow</span>
              </span>
            </Link>
            
            <div className="hidden sm:flex items-center gap-8">
              <a href="#features" className="text-sm text-white/45 hover:text-white/80 font-medium transition-colors">Features</a>
              <a href="#pricing" className="text-sm text-white/45 hover:text-white/80 font-medium transition-colors">Pricing</a>
              <Link to="/demo" className="text-sm text-white/45 hover:text-white/80 font-medium transition-colors">Demo</Link>
              <Link to="/auth">
                <Button variant="ghost" className="text-sm text-white/50 hover:text-white hover:bg-white/5 h-9">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-white text-[#070b09] font-semibold hover:bg-white/90 rounded-full h-9 px-5 text-sm">
                  Start Free Trial
                </Button>
              </Link>
            </div>

            <button className="sm:hidden p-2 -mr-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5 text-white/60" /> : <Menu className="h-5 w-5 text-white/60" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="sm:hidden bg-[#070b09]/95 backdrop-blur-2xl border-t border-white/[0.06]"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="px-4 py-5 space-y-3">
                <a href="#features" className="block py-2 text-white/50 font-medium text-sm" onClick={() => setMobileMenuOpen(false)}>Features</a>
                <a href="#pricing" className="block py-2 text-white/50 font-medium text-sm" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
                <Link to="/demo" className="block py-2 text-white/50 font-medium text-sm" onClick={() => setMobileMenuOpen(false)}>Demo</Link>
                <Link to="/auth" className="block">
                  <Button variant="outline" className="w-full h-12 border-white/10 text-white/70 hover:bg-white/5 rounded-full">Sign In</Button>
                </Link>
                <Link to="/auth" className="block">
                  <Button className="w-full h-12 bg-white text-[#070b09] font-semibold rounded-full">
                    Start Free Trial
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <HeroSection />
      <PainSection />
      <FeaturesSection />
      <AnalyticsSection />
      <HowItWorksSection />
      <IntegrationsSection />
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
