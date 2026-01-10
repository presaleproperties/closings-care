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
  Banknote
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12
    }
  }
};

// Animated counter component
function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  
  useEffect(() => {
    if (isInView) {
      const duration = 1500;
      const steps = 40;
      const increment = value / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);
      
      return () => clearInterval(timer);
    }
  }, [isInView, value]);
  
  return (
    <span ref={ref}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Navigation - Light theme */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FAFAF9]/90 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
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
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-[#FAFAF9]">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-medium text-emerald-600 mb-4 tracking-wide">
              BUILT BY AGENTS • DESIGNED FOR COMMISSION INCOME • CANADA-FIRST
            </p>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 tracking-tight mb-5 leading-tight">
              Know what you can spend —<br />
              <span className="text-slate-500">before it becomes a problem.</span>
            </h1>
            
            <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8 leading-relaxed">
              Commission Tracker helps real estate agents see their real income, plan for taxes, 
              and avoid cash-flow surprises — even when deals fall apart.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/auth">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white text-base px-7 h-12 gap-2 shadow-md shadow-emerald-600/20">
                  Get Financial Clarity
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" size="lg" className="text-base px-7 h-12 border-slate-300 text-slate-600 hover:bg-slate-100">
                  See How It Works
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
              Sound Familiar?
            </h2>
            <p className="text-slate-500 text-lg">
              The struggles most agents face with their finances
            </p>
          </motion.div>
          
          <motion.div 
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: AlertTriangle,
                title: "Unpredictable income",
                description: "A great month followed by silence. You never know what's coming.",
                color: "text-amber-500",
                bg: "bg-amber-50"
              },
              {
                icon: Calculator,
                title: "Tax season panic",
                description: "That sinking feeling when you realize you didn't set enough aside.",
                color: "text-red-500",
                bg: "bg-red-50"
              },
              {
                icon: Wallet,
                title: "Overspending in good months",
                description: "One big commission feels like freedom — until the slow months hit.",
                color: "text-orange-500",
                bg: "bg-orange-50"
              },
              {
                icon: HeartPulse,
                title: "Panic during slow months",
                description: "Wondering if you'll make rent. Stress that keeps you up at night.",
                color: "text-rose-500",
                bg: "bg-rose-50"
              },
              {
                icon: FileSpreadsheet,
                title: "Spreadsheets that break",
                description: "One deal falls through and your whole forecast is wrong.",
                color: "text-slate-500",
                bg: "bg-slate-50"
              },
              {
                icon: Clock,
                title: "Hours lost to bookkeeping",
                description: "Time spent tracking numbers instead of closing deals.",
                color: "text-purple-500",
                bg: "bg-purple-50"
              }
            ].map((pain, index) => (
              <motion.div
                key={pain.title}
                className="bg-[#FAFAF9] rounded-2xl p-5 border border-slate-100 hover:-translate-y-1 transition-transform duration-300"
                variants={fadeInUp}
              >
                <div className={`h-11 w-11 rounded-xl ${pain.bg} flex items-center justify-center mb-4`}>
                  <pain.icon className={`h-5 w-5 ${pain.color}`} />
                </div>
                <h3 className="text-base font-semibold text-slate-800 mb-1.5">{pain.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{pain.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Safe to Spend Section - CRITICAL */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-6">
              <Shield className="h-4 w-4" />
              The Number That Matters Most
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4">
              The only number most agents actually need.
            </h2>
            
            {/* Safe to Spend Display */}
            <div className="bg-white rounded-3xl shadow-xl shadow-emerald-600/10 border border-emerald-100 p-8 sm:p-10 mt-8 max-w-lg mx-auto">
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wide mb-2">
                Safe to Spend This Month
              </p>
              <p className="text-5xl sm:text-6xl font-bold text-emerald-600 mb-4">
                $<AnimatedNumber value={4850} />
              </p>
              <div className="flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50 rounded-full px-4 py-2 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4" />
                All obligations accounted for
              </div>
            </div>
            
            <p className="text-slate-500 mt-8 max-w-md mx-auto leading-relaxed">
              This number already accounts for taxes, expenses, and upcoming obligations — 
              so you can spend with confidence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Outcome-Based Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
              What Commission Tracker Gives You
            </h2>
            <p className="text-slate-500 text-lg">
              Outcomes you can feel — not just features to learn
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: TrendingUp,
                title: "See slow months before they hurt",
                description: "12-month income and expense projections show you exactly what's coming — so you can prepare, not panic.",
                color: "text-blue-600",
                bg: "bg-blue-50"
              },
              {
                icon: Shield,
                title: "Never get surprised by taxes again",
                description: "Automatic BC-specific tax set-aside calculations with conservative buffers. Sleep easy at tax time.",
                color: "text-emerald-600",
                bg: "bg-emerald-50"
              },
              {
                icon: BarChart3,
                title: "Know if you're actually profitable",
                description: "Real-time income vs expense visibility. See your true financial health at a glance.",
                color: "text-violet-600",
                bg: "bg-violet-50"
              },
              {
                icon: Calendar,
                title: "See exactly when money arrives",
                description: "Track advances, deposits, and completion payouts. Know your cashflow before it happens.",
                color: "text-teal-600",
                bg: "bg-teal-50"
              }
            ].map((feature) => (
              <motion.div
                key={feature.title}
                className="bg-[#FAFAF9] rounded-2xl p-7 border border-slate-100 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300"
                variants={fadeInUp}
              >
                <div className={`h-12 w-12 rounded-xl ${feature.bg} flex items-center justify-center mb-5`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
              Simple as 1, 2, 3
            </h2>
            <p className="text-slate-500 text-lg">
              No learning curve. No complex setup.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                step: "1",
                title: "Add your deals",
                description: "Enter your pending and closed deals. Takes 2 minutes.",
                icon: Banknote
              },
              {
                step: "2",
                title: "Add your expenses",
                description: "Fixed costs, business expenses, tax obligations.",
                icon: Wallet
              },
              {
                step: "3",
                title: "Get financial clarity",
                description: "See your safe-to-spend, projections, and tax set-aside.",
                icon: Eye
              }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                className="bg-white rounded-2xl p-6 border border-slate-100 text-center shadow-sm"
                variants={fadeInUp}
              >
                <div className="h-14 w-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
              Agents Who Finally Feel in Control
            </h2>
            <p className="text-slate-500 text-lg">
              Real stories about stress relief and financial clarity
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                quote: "For the first time in 8 years, I didn't stress about taxes in April. The set-aside calculator changed everything for me.",
                name: "Sarah Chen",
                title: "Top 1% Producer",
                location: "Vancouver West",
                focus: "Tax clarity"
              },
              {
                quote: "I used to check my bank account 5 times a day. Now I just open Commission Tracker and know exactly where I stand.",
                name: "Michael Torres",
                title: "Team Lead",
                location: "Burnaby",
                focus: "Reduced stress"
              },
              {
                quote: "With presales, I have money coming in 2-3 years from now. This is the only tool that actually shows me that future income clearly.",
                name: "Jennifer Liu",
                title: "Presale Specialist",
                location: "Richmond",
                focus: "Future visibility"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                className="bg-[#FAFAF9] rounded-2xl p-6 border border-slate-100"
                variants={fadeInUp}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 mb-5 leading-relaxed text-sm">
                  "{testimonial.quote}"
                </p>
                <div className="border-t border-slate-100 pt-4">
                  <p className="font-semibold text-slate-800">{testimonial.name}</p>
                  <p className="text-sm text-slate-500">{testimonial.title} • {testimonial.location}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
              Simple, Honest Pricing
            </h2>
            <p className="text-slate-500 text-lg">
              No credit card required. Cancel anytime.
            </p>
            <p className="text-slate-400 text-sm mt-2">
              Costs less than one missed tax deduction.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Free Tier */}
            <motion.div
              className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm"
              variants={fadeInUp}
            >
              <h3 className="text-xl font-semibold text-slate-800 mb-1">Free</h3>
              <p className="text-slate-500 text-sm mb-5">For agents getting started</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-800">$0</span>
                <span className="text-slate-400 ml-1">/month</span>
              </div>
              
              <div className="space-y-3 mb-7">
                {[
                  "Up to 10 active deals",
                  "Basic expense tracking",
                  "3-month projections",
                  "Mobile-friendly",
                  "Email support"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="text-sm text-slate-600">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Link to="/auth" className="block">
                <Button variant="outline" className="w-full h-11 border-slate-300 text-slate-700 hover:bg-slate-100">
                  Get Started Free
                </Button>
              </Link>
            </motion.div>
            
            {/* Pro Tier */}
            <motion.div
              className="bg-white rounded-2xl p-7 border-2 border-emerald-500 shadow-lg shadow-emerald-600/10 relative"
              variants={fadeInUp}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-1 text-xs font-semibold rounded-full">
                RECOMMENDED
              </div>
              
              <h3 className="text-xl font-semibold text-slate-800 mb-1">Professional</h3>
              <p className="text-slate-500 text-sm mb-5">For serious producers</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-800">$29</span>
                <span className="text-slate-400 ml-1">/month</span>
              </div>
              
              <div className="space-y-3 mb-7">
                {[
                  "Unlimited deals",
                  "Full expense categorization",
                  "12-month projections",
                  "Tax set-aside calculations",
                  "Safe-to-spend tracking",
                  "Rental property tracking",
                  "Data export (CSV)",
                  "Priority support"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="text-sm text-slate-600">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Link to="/auth" className="block">
                <Button className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white">
                  Start 14-Day Free Trial
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-emerald-50">
        <motion.div 
          className="max-w-2xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4">
            Ready to finally understand your money?
          </h2>
          <p className="text-slate-500 text-lg mb-8">
            Join agents who've stopped guessing and started feeling calm about their finances.
          </p>
          
          <Link to="/auth">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white text-base px-8 h-12 gap-2 shadow-md shadow-emerald-600/20">
              Get Financial Clarity
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          
          <p className="text-sm text-slate-400 mt-4">
            No credit card required • Setup takes 5 minutes
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-4 gap-8">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-lg text-slate-800">Commission Tracker</span>
              </div>
              <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                Financial clarity for commission-based real estate agents in Canada. 
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
