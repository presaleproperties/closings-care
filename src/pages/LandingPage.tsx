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
  ChevronDown,
  Target,
  Bed,
  UserPlus,
  PiggyBank,
  Receipt,
  Gift
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
    </div>
  );
}

// Section 1: Hero
function HeroSection() {
  return (
    <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden relative min-h-screen flex items-center" style={{ backgroundColor: '#FFFEF9' }}>
      <FloatingElements />
      
      <div className="max-w-7xl mx-auto relative w-full">
        <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 items-center">
          {/* Left Side - Copy (60%) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center lg:text-left lg:col-span-3"
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs sm:text-sm font-medium mb-5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <AlertTriangle className="h-4 w-4" />
              You're Making Good Money. So Why Are You Always Stressed About It?
            </motion.div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 tracking-tight leading-[1.1] mb-6">
              Finally Know What You're{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Actually Making
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-slate-600 mb-4 font-medium">
              Financial clarity for realtors who are tired of guessing if they can afford things
            </p>
            
            <p className="text-base sm:text-lg text-slate-500 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
              See your real take-home. After splits. After cap. After taxes. In 30 seconds. No spreadsheet math.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Link to="/auth" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white text-lg px-10 h-16 gap-2 shadow-xl shadow-emerald-700/30 group">
                  See My Real Numbers
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 h-16 border-slate-300 text-slate-700 gap-2">
                <Play className="h-4 w-4" />
                Watch 90-Second Demo
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                14-day free trial
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                BC/AB tax rates built-in
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Setup in 5 minutes
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                No credit card required
              </span>
            </div>
          </motion.div>

          {/* Right Side - Dashboard Mockup (40%) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 blur-3xl scale-105" />
            {/* Floating Notifications */}
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
              
              {/* Safe to Spend Display */}
              <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium mb-3">
                    <Wallet className="h-3.5 w-3.5" />
                    Safe to Spend
                  </div>
                  <p className="text-5xl font-bold text-emerald-600 mb-2">$7,750</p>
                  <p className="text-sm text-slate-500">What you can safely spend this month</p>
                </div>
                
                <div className="bg-white/80 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Projected Cash In</span>
                    <span className="font-semibold text-emerald-600">+$24,200</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tax Set-Aside (30%)</span>
                    <span className="font-semibold text-red-500">-$7,260</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Fixed Expenses</span>
                    <span className="font-semibold text-red-500">-$5,890</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Upcoming Bills</span>
                    <span className="font-semibold text-red-500">-$3,300</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-800">Safe to Spend</span>
                      <span className="font-bold text-emerald-600">$7,750</span>
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

// Section 2: The Emotional Pain
function EmotionalPainSection() {
  const painScenarios = [
    {
      title: '"Can I Afford This?"',
      story: "You see the perfect investment property. $50K down. You have $120K in deals closing soon. Can you afford it? You pull out your phone, open 3 apps, spend 20 minutes doing math... and still aren't sure.",
      image: "💸"
    },
    {
      title: '"The Spouse Question"',
      story: 'Your partner asks: "How much are we actually making this year?" You fumble. "Uh... I think around $180K? Maybe $200K? After taxes and splits and... I\'m not sure." Awkward.',
      image: "👫"
    },
    {
      title: '"The Slow Month Panic"',
      story: "It's the 18th. Nothing closing until next month. Mortgage is due tomorrow. You have $6K in the account. Are you okay? You have no idea.",
      image: "😰"
    },
    {
      title: '"The Tax Bomb"',
      story: "April 30th. Your accountant says you owe $19,000. You thought you had it covered. You didn't.",
      image: "💣"
    }
  ];

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-xs sm:text-sm font-medium mb-4">
            🔴 Sound Familiar?
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
            You're Making $180K.{' '}
            <span className="block sm:inline">So Why Are You Always Stressed About Money?</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            The income is there. The clarity isn't. And it's costing you sleep, confidence, and opportunities.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {painScenarios.map((scenario, i) => (
            <motion.div
              key={scenario.title}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-slate-100"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-4xl mb-4">{scenario.image}</div>
              <h3 className="text-lg font-bold text-slate-800 mb-3">{scenario.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{scenario.story}</p>
            </motion.div>
          ))}
        </div>

        <motion.p 
          className="text-center text-xl sm:text-2xl text-slate-800 font-semibold"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          This isn't an income problem. <span className="text-red-500">It's a clarity problem.</span>
        </motion.p>
      </div>
    </section>
  );
}

// Section 3: The Cost (Dark Section)
function CostSection() {
  const costs = [
    { icon: DollarSign, text: "$4,100/year in surprise tax bills you didn't plan for" },
    { icon: TrendingDown, text: "Deals you turned down because you thought you couldn't afford the marketing" },
    { icon: Clock, text: "6 hours every tax season digging through receipts" },
    { icon: Heart, text: "Constant low-level money anxiety even when you're making great money" },
    { icon: Home, text: "Opportunities you missed because you couldn't make a confident decision fast enough" },
  ];

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#0F172A' }}>
      <div className="max-w-5xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 text-xs sm:text-sm font-medium mb-4">
            ⚠️ The Hidden Cost
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            What Financial Fog Actually Costs You
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {costs.map((cost, i) => (
            <motion.div
              key={cost.text}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <cost.icon className="h-6 w-6 text-red-400 mb-3" />
              <p className="text-white/90 text-sm leading-relaxed">{cost.text}</p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-2xl font-bold" style={{ color: '#F59E0B' }}>
            73% of realtors making $150K+ say they "don't have a clear picture" of their finances
          </p>
        </motion.div>

        <motion.p 
          className="text-center text-xl text-white/70"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Every month without clarity is money lost.
        </motion.p>
      </div>
    </section>
  );
}

// Section 4: The Hero Feature - Safe to Spend
function SafeToSpendSection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#FFFEF9' }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side - Copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs sm:text-sm font-medium mb-4">
              ✨ The One Number That Changes Everything
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
              "Can I Afford This?"
            </h2>
            <p className="text-xl text-slate-600 mb-6">
              Know in 10 seconds. Not 20 minutes.
            </p>
            
            <div className="space-y-4 text-slate-600 mb-8">
              <p>You want to invest $40K in Facebook ads for Q4.</p>
              <p>Or buy that $60K truck.</p>
              <p>Or hire an assistant for $4K/month.</p>
              <p className="font-semibold text-slate-800">Can you afford it?</p>
              <p className="text-emerald-600 font-bold text-lg">With dealzflow, you know. Instantly.</p>
            </div>

            <Link to="/auth">
              <Button size="lg" className="bg-emerald-700 hover:bg-emerald-800 text-white text-lg px-8 h-14 gap-2 shadow-xl shadow-emerald-700/30 group">
                See My Safe to Spend Number
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          {/* Right Side - Giant Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 blur-3xl scale-110" />
            <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 border border-emerald-200 shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                  <Wallet className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Safe to Spend</h3>
                  <p className="text-sm text-emerald-600">What you can safely spend this month</p>
                </div>
              </div>
              
              <div className="text-center mb-8">
                <motion.p 
                  className="text-6xl lg:text-7xl font-bold text-emerald-600 mb-2"
                  initial={{ scale: 0.5, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  $7,750
                </motion.p>
              </div>
              
              <div className="bg-white/70 rounded-xl p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Projected Cash In</span>
                  <span className="font-bold text-emerald-600">+$24,200</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tax Set-Aside (30%)</span>
                  <span className="font-bold text-red-500">-$7,260</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Fixed Expenses</span>
                  <span className="font-bold text-red-500">-$5,890</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Upcoming Bills</span>
                  <span className="font-bold text-red-500">-$3,300</span>
                </div>
                <div className="border-t border-emerald-200 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-800">Safe to Spend</span>
                    <span className="font-bold text-emerald-600 text-lg">$7,750</span>
                  </div>
                </div>
              </div>

              <p className="text-center text-sm text-slate-500 mt-6">
                After all splits. After taxes. After bills paid. <strong>Your real number.</strong>
              </p>
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
      title: "Add your deal", 
      description: "Log your $18K commission in 15 seconds. Accepted, conditional, or closed — doesn't matter.",
      icon: Banknote,
      emoji: "💵"
    },
    { 
      step: "2", 
      title: "We do the math", 
      description: "We calculate everything. Brokerage split. Team cut. Cap status. Taxes. Net commission.",
      icon: Calculator,
      emoji: "📊"
    },
    { 
      step: "3", 
      title: "Know your number", 
      description: "See your actual take-home: $9,440 in your pocket. After everything.",
      icon: Shield,
      emoji: "🛡️"
    },
  ];

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
            How it works
          </h2>
        </motion.div>
        
        <div className="grid sm:grid-cols-3 gap-8 relative">
          {/* Connecting Lines */}
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

// Section 6: The Answers You Need
function AnswersSection() {
  const answers = [
    {
      icon: Wallet,
      emoji: "💰",
      title: "Can I Afford This?",
      subtitle: "The Safe-to-Spend Number",
      description: "See exactly how much you can spend RIGHT NOW after everything.",
      scenario: "Real scenario: You want to invest $40K in Facebook ads for Q4. Plug it in. See if your pipeline supports it. Decide in 30 seconds."
    },
    {
      icon: TrendingUp,
      emoji: "📈",
      title: "What Am I Really Making?",
      subtitle: "Your Actual Net Income",
      description: 'Not gross commission. Not "before splits." Your REAL take-home.',
      scenario: 'Real scenario: Your spouse asks how much you made last month. Open the app. "Netted $11,200." Done.'
    },
    {
      icon: Clock,
      emoji: "⏱️",
      title: "Am I Going to Be Okay?",
      subtitle: "The Runway Calculator",
      description: "How long you can go without a deal closing.",
      scenario: "Real scenario: It's a slow month. You know you have 67 days of runway. You sleep fine."
    },
    {
      icon: BarChart3,
      emoji: "📊",
      title: "Where Is My Money Going?",
      subtitle: "Expense Reality Check",
      description: "See your monthly burn rate vs income. Catch lifestyle creep before it kills you.",
      scenario: "Real scenario: You made $220K last year but saved nothing. Now you see: $18K/month burn rate. Mystery solved."
    },
    {
      icon: Calendar,
      emoji: "📅",
      title: "What's Actually Coming?",
      subtitle: "12-Month Income Projection",
      description: "Based on your current pipeline. See slow months coming 6 months out.",
      scenario: "Real scenario: It's March. You see August is going to be brutal. You plan accordingly. No surprises."
    },
    {
      icon: Target,
      emoji: "🎯",
      title: "Did I Hit Cap?",
      subtitle: "Brokerage Cap Tracker",
      description: "Know exactly when you hit 100% split.",
      scenario: "Real scenario: Your brokerage says you're at $71K. You show them your receipts. They correct it. You just saved $2,300."
    },
    {
      icon: FileText,
      emoji: "📄",
      title: "Tax Season Ready",
      subtitle: "One-Click Accountant Export",
      description: "All expenses categorized. All deductions flagged. Clean PDF report.",
      scenario: "Real scenario: April 15th. You click 'Export.' Email it to your accountant. Done in 90 seconds. They thank you."
    }
  ];

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
            The Answers You Actually Need
          </h2>
        </motion.div>

        <div className="space-y-6">
          {answers.map((answer, i) => (
            <motion.div
              key={answer.title}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg text-3xl">
                    {answer.emoji}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-1">{answer.title}</h3>
                  <p className="text-emerald-600 font-medium mb-2">{answer.subtitle}</p>
                  <p className="text-slate-600 mb-4">{answer.description}</p>
                  <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 italic">
                    {answer.scenario}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Section 7: Built for Your World
function BuiltForYouSection() {
  const realtorFeatures = [
    "Know if you hit your brokerage cap (without trusting their math)",
    "Handle presale deals (advance, deposits, completion over 2+ years)",
    "See your actual net after team lead takes their cut",
    "Never forget to collect a referral fee again",
    "Track co-listing partner splits automatically"
  ];

  const brokerFeatures = [
    "Separate upfront vs backend (trail) commissions",
    "Get alerted to clawback risk periods",
    "Track multiple lenders with different split structures",
    "Know your volume bonus status",
    "Plan around seasonality (Q4 is always slow)"
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
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
            Built specifically for agents & brokers
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* For Realtors */}
          <motion.div
            className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-200"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg text-2xl">
                🏠
              </div>
              <h3 className="text-xl font-bold text-slate-800">For Realtors</h3>
            </div>
            <ul className="space-y-3">
              {realtorFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700 text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* For Mortgage Brokers */}
          <motion.div
            className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8 border border-teal-200"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg text-2xl">
                💼
              </div>
              <h3 className="text-xl font-bold text-slate-800">For Mortgage Brokers</h3>
            </div>
            <ul className="space-y-3">
              {brokerFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700 text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Section 8: Tax Safety
function TaxSafetySection() {
  const taxFeatures = [
    "Live tax reserve tracking",
    "GST/HST visibility (for registered agents)",
    "Year-round readiness for your accountant",
    "Clear net-income view"
  ];

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#FEF9E7' }}>
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs sm:text-sm font-medium mb-4">
              🛡️ Tax Ready
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-6">
              No more tax surprises.
            </h2>
            
            <ul className="space-y-4 mb-8">
              {taxFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-amber-600 flex-shrink-0" />
                  <span className="text-slate-700">{feature}</span>
                </li>
              ))}
            </ul>

            <p className="text-lg text-slate-600 font-medium">
              Stop guessing what's yours. <span className="text-amber-600 font-bold">Know it.</span>
            </p>
          </motion.div>

          {/* Tax Gauge Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-amber-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">Tax Safety Gauge</h3>
              </div>

              {/* Gauge */}
              <div className="flex justify-center mb-6">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" stroke="#FDE68A" strokeWidth="8" fill="none" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      stroke="url(#taxGaugeGradient)" 
                      strokeWidth="8" 
                      fill="none" 
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 45}
                      strokeDashoffset={2 * Math.PI * 45 * (1 - 0.78)}
                    />
                    <defs>
                      <linearGradient id="taxGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#EA580C" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-800">78%</span>
                    <span className="text-xs text-amber-600 font-medium">On Track</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Tax Set Aside</span>
                  <span className="font-bold text-slate-800">$16,426</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Recommended</span>
                  <span className="font-medium text-slate-600">$21,000</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-slate-100">
                  <span className="text-slate-600">Gap to fill</span>
                  <span className="font-bold text-amber-600">$4,574</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Section 9: The Payoff
function PayoffSection() {
  const outcomes = [
    { icon: UserPlus, emoji: "👥", text: "Hire with clarity — Know if you can afford an assistant" },
    { icon: TrendingUp, emoji: "📈", text: "Invest with confidence — Make big moves without second-guessing" },
    { icon: Calendar, emoji: "📆", text: "Plan your life, not just your deals — Book that vacation without anxiety" },
    { icon: Bed, emoji: "😴", text: "Sleep better at night — No more 2am money stress" },
  ];

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-emerald-700">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 text-white text-xs sm:text-sm font-medium mb-4">
            💚 The Real Payoff
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Confidence changes everything.
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4">
          {outcomes.map((outcome, i) => (
            <motion.div
              key={outcome.text}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-3xl mb-3">{outcome.emoji}</div>
              <p className="text-white font-medium">{outcome.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Section 10: Social Proof
function SocialProofSection() {
  const testimonials = [
    {
      quote: "I was making $300K+ and still anxious about money. CommissionIQ showed me I was spending $22K/month and didn't even realize it. I cut $4K of stupid expenses in week one. Now I sleep better.",
      name: "Sarah K.",
      company: "RE/MAX, 180 deals/year"
    },
    {
      quote: "I almost didn't invest in staging for a $1.2M listing because I thought I couldn't afford it. CommissionIQ showed me I had $8K safe to spend. I spent $2K on staging. Sold for $1.28M. Best $29 I ever spent.",
      name: "Raj P.",
      company: "eXp Realty, Year 2"
    },
    {
      quote: "My team lead was taking 30%. I never questioned it. CommissionIQ showed me the math was wrong. I was owed $3,800. I showed him the breakdown. He paid me within 2 days.",
      name: "Michelle T.",
      company: "Sutton Group, 8 years"
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
            Built by people who understand commission income.
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Designed with real estate agents and mortgage brokers who close deals every month and need real-time financial clarity — not generic accounting software.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14">
          {[
            { value: 847, label: "Active Users", suffix: "+" },
            { value: 12.4, label: "Tracked", prefix: "$", suffix: "M", decimals: 1 },
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

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
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

// Section 11: Objection Crusher
function ObjectionSection() {
  const objections = [
    {
      objection: '"I use Excel"',
      answer: "Excel doesn't tell you if you can afford a $50K purchase in 10 seconds. It doesn't project your next 12 months. It doesn't auto-calculate your post-tax, post-split net income. Excel is homework. This is clarity."
    },
    {
      objection: '"My accountant handles this"',
      answer: "Your accountant files your taxes once a year. CommissionIQ gives you clarity every single day. Can you afford that marketing spend? Your accountant won't text you back at 9pm on a Saturday."
    },
    {
      objection: '"I don\'t have time"',
      answer: "15 seconds to add a deal. That's it. The rest is automatic. You spend more time stressing about money than this takes."
    },
    {
      objection: '"I\'m not good with tech"',
      answer: "If you can add a contact to your phone, you can use this. Big buttons. Plain English. No accounting jargon."
    }
  ];

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F9FAFB' }}>
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

// Section 12: Pricing
function PricingSection() {
  const features = [
    "Unlimited deals",
    "Safe-to-Spend calculator",
    "12-month income projections",
    "Brokerage cap tracking",
    "Tax reserve calculations",
    "Presale deal support",
    "Scenario planning",
    "Accountant-ready exports"
  ];

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
            Simple. Transparent. Worth It.
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

        {/* ROI Calculator */}
        <motion.div
          className="mt-10 bg-slate-50 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h4 className="font-bold text-slate-800 mb-4 text-center">Your ROI:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Catch ONE missed brokerage cap error</span>
              <span className="font-bold text-emerald-600">$2,000+ saved</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Avoid ONE surprise tax bill</span>
              <span className="font-bold text-emerald-600">$3,500+ saved</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Make ONE confident big purchase decision</span>
              <span className="font-bold text-emerald-600">Priceless</span>
            </div>
            <div className="border-t border-slate-200 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-slate-800 font-semibold">Cost</span>
                <span className="font-bold text-slate-800">$29/month</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Money Back Guarantee */}
        <motion.div
          className="mt-6 text-center p-4 bg-amber-50 rounded-xl border border-amber-200"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Gift className="h-6 w-6 text-amber-600 mx-auto mb-2" />
          <p className="text-sm text-slate-700">
            <strong>90-day guarantee:</strong> If you don't make at least one better financial decision, we'll refund you and send you $50 for your trouble.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// Section 13: Final CTA
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
            Stop Guessing. Start Knowing.
          </h2>
          <p className="text-xl text-white/80 mb-10">
            Join 847+ BC realtors who finally stopped stressing about money.
          </p>

          <Link to="/auth">
            <Button size="lg" className="bg-white text-emerald-700 hover:bg-slate-100 text-lg px-12 h-16 gap-2 shadow-xl group font-bold">
              Get Financial Clarity Now
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
              Cancel anytime
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              Export your data whenever
            </span>
          </div>

          <p className="text-white/60 mt-8">
            Setup takes 5 minutes. Clarity lasts forever.
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
              <Link to="/auth">
                <Button variant="ghost" className="text-slate-600">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg shadow-emerald-500/25">
                  See My Numbers
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
                <a href="#pricing" className="block py-2 text-slate-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
                <Link to="/auth" className="block">
                  <Button variant="outline" className="w-full h-12 text-base">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth" className="block">
                  <Button className="w-full h-12 text-base bg-emerald-700 hover:bg-emerald-800 text-white">
                    See My Numbers
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Section 1: Hero */}
      <HeroSection />

      {/* Section 2: Emotional Pain */}
      <EmotionalPainSection />

      {/* Section 3: The Cost */}
      <CostSection />

      {/* Section 4: Safe to Spend */}
      <SafeToSpendSection />

      {/* Section 5: How It Works */}
      <div id="features">
        <HowItWorksSection />
      </div>

      {/* Section 6: The Answers */}
      <AnswersSection />

      {/* Section 7: Built For You */}
      <BuiltForYouSection />

      {/* Section 8: Tax Safety */}
      <TaxSafetySection />

      {/* Section 9: The Payoff */}
      <PayoffSection />

      {/* Section 10: Social Proof */}
      <SocialProofSection />

      {/* Section 11: Objection Crusher */}
      <ObjectionSection />

      {/* Section 12: Pricing */}
      <div id="pricing">
        <PricingSection />
      </div>

      {/* Section 13: Final CTA */}
      <FinalCTASection />

      {/* Footer */}
      <footer className="py-10 sm:py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img 
                src="/favicon.png" 
                alt="dealzflow" 
                className="w-8 h-8 rounded-xl"
              />
              <span className="font-semibold text-lg">
                dealz<span className="text-emerald-400">flow</span>
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
              <a href="mailto:hello@dealzflow.ca" className="hover:text-white transition-colors">Contact</a>
            </div>
            <p className="text-slate-500 text-sm">
              © 2025 dealzflow. Made for realtors, by people who get it.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
