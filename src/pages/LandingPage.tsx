import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  CheckCircle2, 
  Shield,
  BarChart3,
  AlertTriangle,
  Wallet,
  Calculator,
  Menu,
  X,
  Lock,
  PieChart,
  ChevronDown,
  Target,
  Receipt,
  Sparkles,
  Zap,
  LineChart,
  Play,
  TrendingUp,
  DollarSign,
  Users,
  Building2,
  Home,
  MapPin,
  Gift
} from "lucide-react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Animated counter
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

// ─── HERO ─────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0a0f0d]">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-b from-emerald-500/20 via-teal-500/10 to-transparent rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0a0f0d] to-transparent" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Sparkles className="h-4 w-4" />
            Built exclusively for Canadian realtors
          </motion.div>

          <motion.h1 
            className="text-5xl sm:text-6xl lg:text-[80px] font-bold text-white tracking-tight leading-[1.05] mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Know your numbers.{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Run your business.
            </span>
          </motion.h1>

          <motion.p 
            className="text-xl sm:text-2xl text-white/60 mb-6 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            See exactly what you're earning, what's safe to spend, and where your best deals come from — after splits, cap, and taxes.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto text-lg px-10 h-16 gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-2xl shadow-emerald-500/30 group">
                Start Free — 14 Days
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/demo">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 h-16 border-white/20 text-white hover:bg-white/10 gap-2">
                <Play className="h-4 w-4" />
                See It in Action
              </Button>
            </Link>
          </motion.div>

          <motion.div 
            className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-white/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" />No credit card</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" />BC · AB · ON tax rates</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" />Ready in 5 minutes</span>
          </motion.div>
        </div>

        {/* Hero dashboard mockup */}
        <motion.div 
          className="mt-16 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-b from-emerald-500/20 via-emerald-500/5 to-transparent rounded-3xl blur-2xl" />
            <div className="relative bg-white/[0.06] backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              {/* Browser chrome */}
              <div className="bg-white/[0.04] border-b border-white/10 px-5 py-3 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-white/20" />
                  <div className="w-3 h-3 rounded-full bg-white/20" />
                  <div className="w-3 h-3 rounded-full bg-white/20" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-white/5 rounded-lg px-4 py-1.5 text-xs text-white/30 border border-white/10 flex items-center gap-2">
                    <Lock className="h-3 w-3 text-emerald-400" />
                    app.dealzflow.ca
                  </div>
                </div>
              </div>
              
              {/* Dashboard content */}
              <div className="p-6 grid grid-cols-3 gap-4">
                {/* Safe to Spend — hero metric */}
                <div className="col-span-3 sm:col-span-1 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 rounded-xl p-5 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Wallet className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-400">Safe to Spend</span>
                  </div>
                  <p className="text-3xl font-bold text-white">$12,450</p>
                  <p className="text-xs text-white/40 mt-1">After taxes & expenses</p>
                </div>
                
                <div className="bg-white/[0.04] rounded-xl p-4 border border-white/10">
                  <p className="text-xs text-white/40 mb-1">Earned YTD</p>
                  <p className="text-xl font-bold text-white">$284,500</p>
                  <p className="text-xs text-emerald-400 mt-1">↑ 18% vs last year</p>
                </div>
                
                <div className="bg-white/[0.04] rounded-xl p-4 border border-white/10">
                  <p className="text-xs text-white/40 mb-1">Tax Reserved</p>
                  <p className="text-xl font-bold text-white">$42,680</p>
                  <p className="text-xs text-amber-400 mt-1">85% of target</p>
                </div>

                {/* Lead source bars */}
                <div className="col-span-3 bg-white/[0.04] rounded-xl p-5 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-medium text-white/60">Revenue by Lead Source</span>
                    <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">YTD</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "Referrals", pct: 42, color: "bg-emerald-500" },
                      { label: "Past Clients", pct: 28, color: "bg-teal-500" },
                      { label: "Online", pct: 18, color: "bg-cyan-500" },
                      { label: "Open Houses", pct: 12, color: "bg-amber-500" },
                    ].map((s) => (
                      <div key={s.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white/50">{s.label}</span>
                          <span className="text-white/70">{s.pct}%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${s.color} rounded-full`}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${s.pct}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.8 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── PAIN POINTS ──────────────────────────────────
function PainSection() {
  const pains = [
    {
      emoji: "💸",
      question: '"How much am I actually making?"',
      detail: "You know your GCI — but after splits, cap contributions, team cuts, and taxes… what's left? Most realtors can't answer this in under 10 minutes."
    },
    {
      emoji: "🎯",
      question: '"Where are my best deals coming from?"',
      detail: "Referrals? Online leads? Past clients? You have a gut feeling, but no data. You're spending marketing dollars blindly."
    },
    {
      emoji: "🤔",
      question: '"Can I afford this right now?"',
      detail: "New marketing campaign. An assistant hire. Investment property. You want to say yes, but you're not 100% sure the numbers work."
    },
    {
      emoji: "📅",
      question: '"What does next quarter look like?"',
      detail: "Slow months sneak up. Pipeline visibility is scattered across emails, texts, and your head. Surprises aren't fun."
    }
  ];

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-medium mb-4">
            <AlertTriangle className="h-4 w-4" />
            Sound familiar?
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            You're great at closing deals.{' '}
            <span className="text-amber-500">Understanding your finances?</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            That's a different story entirely.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-5">
          {pains.map((p, i) => (
            <motion.div
              key={p.question}
              className="rounded-2xl p-6 bg-card border border-border/50 hover:border-amber-500/30 transition-all hover:shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <span className="text-3xl mb-3 block">{p.emoji}</span>
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
      desc: "Know exactly where you stand on your cap. Stop trusting someone else's math.",
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
    <section id="features" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#0a0f0d]">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-4">
            <Zap className="h-4 w-4" />
            Complete Clarity
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Everything you need.{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Nothing you don't.</span>
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            Not generic accounting software adapted for real estate. Built specifically for how Canadian realtors actually work.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="bg-white/[0.04] rounded-2xl p-6 border border-white/10 hover:border-emerald-500/30 transition-all hover:bg-white/[0.06]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center shadow-lg mb-4`}>
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
              <p className="text-white/50 text-sm mb-4 leading-relaxed">{f.desc}</p>
              <ul className="space-y-1.5">
                {f.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-xs text-white/40">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500/70" />
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
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <BarChart3 className="h-4 w-4" />
              Business Analytics
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Finally understand{' '}
              <span className="text-primary">where your business comes from</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Stop guessing which marketing channels work. See exactly which lead sources, property types, and areas generate your best commissions.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {dimensions.map((d, i) => (
                <motion.div
                  key={d.label}
                  className="bg-card rounded-xl p-4 border border-border/50"
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
              <Button className="btn-premium gap-2 h-12 px-6">
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
                <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">YTD</span>
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
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="text-foreground font-medium">{item.amount}</span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
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

              <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
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
    { step: "1", title: "Add your deals", desc: "Log pending and closed deals. Include lead source, property type, and commission details.", emoji: "💵" },
    { step: "2", title: "We do the math", desc: "Splits, cap, taxes, expenses — all calculated automatically with Canadian tax brackets.", emoji: "📊" },
    { step: "3", title: "Get complete clarity", desc: "Safe-to-Spend, analytics, forecasts, and insights. Everything in one view.", emoji: "✨" },
  ];

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Simple to start. Powerful to use.</h2>
        </motion.div>
        
        <div className="grid sm:grid-cols-3 gap-8 relative">
          <div className="hidden sm:block absolute top-14 left-[20%] right-[20%] h-px bg-gradient-to-r from-primary/30 via-primary/50 to-primary/30" />
          
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
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/20 mx-auto text-4xl">
                  {s.emoji}
                </div>
                <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-foreground text-background text-sm font-bold flex items-center justify-center shadow-lg">
                  {s.step}
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{s.title}</h3>
              <p className="text-muted-foreground">{s.desc}</p>
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
      emoji: "🏠", title: "Resale Transactions",
      features: ["Buyer & seller side", "Team splits calculated", "Close date projections", "Commission breakdowns"]
    },
    {
      emoji: "🏗️", title: "Presale / Pre-Construction",
      features: ["Multiple payout dates", "Advance + deposits + completion", "2–3 year deal visibility", "Completion date forecasting"]
    },
    {
      emoji: "🤝", title: "Team & Referral Deals",
      features: ["Team member portions", "Referral fee visibility", "Co-listing splits", "Net commission after all cuts"]
    }
  ];

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-5xl mx-auto">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Handles every type of deal</h2>
          <p className="text-lg text-muted-foreground">Resale, presale, team deals, referrals — we've got you covered.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {types.map((t, i) => (
            <motion.div
              key={t.title}
              className="bg-card rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <span className="text-4xl mb-4 block">{t.emoji}</span>
              <h3 className="text-xl font-bold text-foreground mb-4">{t.title}</h3>
              <ul className="space-y-2">
                {t.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
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
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-amber-50 dark:bg-amber-950/20">
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm font-medium mb-4">
              <Shield className="h-4 w-4" />
              Tax Ready Year-Round
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">No more April surprises</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Canadian tax brackets built in. We calculate exactly how much to set aside so you're never caught off guard.
            </p>
            
            <ul className="space-y-3 mb-8">
              {[
                "BC, Alberta, and Ontario tax rates",
                "GST/HST for registered agents",
                "Real-time tax reserve calculations",
                "Accountant-ready annual exports"
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-foreground">
                  <CheckCircle2 className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="bg-card rounded-2xl p-8 shadow-xl border border-border/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-foreground text-lg">Tax Safety Status</h3>
              </div>

              <div className="flex justify-center mb-6">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" stroke="hsl(var(--muted))" strokeWidth="8" fill="none" />
                    <circle 
                      cx="50" cy="50" r="45" 
                      stroke="url(#taxGaugeNew)" strokeWidth="8" fill="none" 
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
                    <span className="text-3xl font-bold text-foreground">85%</span>
                    <span className="text-xs text-primary font-medium">On Target</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Tax Set Aside</span><span className="font-bold text-foreground">$42,680</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Estimated Owing</span><span className="font-bold text-foreground">$50,200</span></div>
                <div className="flex justify-between text-primary"><span>Status</span><span className="font-bold">✓ Healthy Buffer</span></div>
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
    { quote: "I finally see where my business comes from. Referrals were 60% of my income — I had no idea until I saw the analytics.", name: "Sarah M.", company: "RE/MAX, Vancouver" },
    { quote: "The presale visibility alone is worth it. I have deals closing in 2026 and can finally see the full picture.", name: "David C.", company: "Oakwyn Realty, Burnaby" },
    { quote: "Tax season used to stress me out. Now I know exactly what I owe all year. No surprises.", name: "Jennifer L.", company: "Royal LePage, Calgary" }
  ];

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-5xl mx-auto">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Trusted by Canadian realtors</h2>
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

        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="bg-card rounded-2xl p-6 border border-border/50"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <p className="text-muted-foreground text-sm mb-4 italic leading-relaxed">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
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
    { q: '"I use spreadsheets"', a: "Spreadsheets don't give you instant Safe-to-Spend calculations, lead source analytics, or 12-month forecasts. They're homework. This is clarity." },
    { q: '"My accountant handles it"', a: "Your accountant files taxes once a year. We give you clarity every day. Can you afford that marketing spend right now? We answer that in 10 seconds." },
    { q: '"I don\'t have time for something new"', a: "15 seconds to add a deal. That's it. If you can add a contact to your phone, you can use dealzflow." },
    { q: '"I already know my numbers"', a: "Can you tell me your exact net take-home after splits, cap, and taxes in under 30 seconds? Can you show which lead source gives the best ROI? That's what we do." }
  ];

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-3xl mx-auto">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">"But I already..."</h2>
        </motion.div>

        <div className="space-y-3">
          {objections.map((o, i) => (
            <motion.div key={o.q} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <Collapsible>
                <CollapsibleTrigger className="w-full">
                  <div className="bg-card rounded-xl p-5 border border-border/50 hover:border-primary/20 transition-all flex items-center justify-between group">
                    <h3 className="text-lg font-semibold text-foreground text-left">{o.q}</h3>
                    <ChevronDown className="h-5 w-5 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform flex-shrink-0 ml-4" />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-5 pb-5 pt-2 bg-card rounded-b-xl border-x border-b border-border/50 -mt-2">
                    <p className="text-muted-foreground">{o.a}</p>
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
    <section id="pricing" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-xl mx-auto">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Simple, transparent pricing</h2>
        </motion.div>

        <motion.div
          className="bg-card rounded-3xl shadow-2xl border border-border/50 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="p-8 text-center bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">Most Popular</div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Pro</h3>
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-5xl font-bold text-foreground">$29</span>
              <span className="text-muted-foreground">CAD/month</span>
            </div>
          </div>

          <div className="p-8">
            <ul className="space-y-3 mb-8">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{f}</span>
                </li>
              ))}
            </ul>

            <Link to="/auth" className="block">
              <Button className="w-full h-14 text-lg btn-premium shadow-xl">
                Start 14-Day Free Trial
              </Button>
            </Link>
            <p className="text-center text-sm text-muted-foreground mt-3">No credit card required</p>
          </div>
        </motion.div>

        <motion.div className="mt-6 text-center p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-500/20" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <Gift className="h-6 w-6 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
          <p className="text-sm text-foreground">
            <strong>90-day guarantee:</strong> If you don't make at least one better financial decision, we'll refund you.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ─── FINAL CTA ────────────────────────────────────
function FinalCTASection() {
  return (
    <section className="py-24 sm:py-36 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#0a0f0d]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-b from-emerald-500/15 to-transparent rounded-full blur-[100px]" />
      </div>
      
      <div className="max-w-3xl mx-auto text-center relative">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Get complete clarity on your business
          </h2>
          <p className="text-xl text-white/50 mb-10">
            Join 1,200+ Canadian realtors who finally understand their numbers.
          </p>

          <Link to="/auth">
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-black text-lg px-12 h-16 gap-2 shadow-2xl shadow-emerald-500/30 group font-bold">
              Start Your Free Trial
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/40 mt-8">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" />14-day free trial</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" />No credit card required</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" />Ready in 5 minutes</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────
function Footer() {
  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-[#060906]">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="dealzflow" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-white">dealz<span className="text-emerald-400">flow</span></span>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/40">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <a href="mailto:support@dealzflow.ca" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/10 text-center text-sm text-white/30">
          © {new Date().getFullYear()} dealzflow. Built for Canadian realtors.
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f0d]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <img src="/favicon.png" alt="dealzflow" className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl shadow-lg shadow-emerald-500/25" />
              <span className="font-bold text-lg sm:text-xl text-white">
                dealz<span className="text-emerald-400">flow</span>
              </span>
            </Link>
            
            <div className="hidden sm:flex items-center gap-6">
              <a href="#features" className="text-white/60 hover:text-white font-medium transition-colors">Features</a>
              <a href="#pricing" className="text-white/60 hover:text-white font-medium transition-colors">Pricing</a>
              <Link to="/demo" className="text-white/60 hover:text-white font-medium transition-colors">Demo</Link>
              <Link to="/auth">
                <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-lg shadow-emerald-500/25">
                  Start Free Trial
                </Button>
              </Link>
            </div>

            <button className="sm:hidden p-2 -mr-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6 text-white/70" /> : <Menu className="h-6 w-6 text-white/70" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="sm:hidden bg-[#0a0f0d] border-t border-white/10"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="px-4 py-4 space-y-3">
                <a href="#features" className="block py-2 text-white/60 font-medium" onClick={() => setMobileMenuOpen(false)}>Features</a>
                <a href="#pricing" className="block py-2 text-white/60 font-medium" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
                <Link to="/demo" className="block py-2 text-white/60 font-medium" onClick={() => setMobileMenuOpen(false)}>Demo</Link>
                <Link to="/auth" className="block">
                  <Button variant="outline" className="w-full h-12 text-base border-white/20 text-white hover:bg-white/10">Sign In</Button>
                </Link>
                <Link to="/auth" className="block">
                  <Button className="w-full h-12 text-base bg-emerald-500 hover:bg-emerald-400 text-black font-semibold">
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
