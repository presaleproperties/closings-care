import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  Calendar,
  PiggyBank,
  Shield,
  Smartphone,
  BarChart3,
  Star,
  ChevronRight,
  Building2,
  DollarSign,
  Clock,
  Users
} from "lucide-react";
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 header-glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-accent to-amber-600 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-accent-foreground" />
              </div>
              <span className="font-bold text-lg">Commission Tracker</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/auth">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button size="sm" className="btn-premium">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-sm font-medium text-accent mb-6">
              <Star className="h-4 w-4" />
              Built for Vancouver Real Estate Agents
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Track Commissions.
              <br />
              <span className="text-gradient bg-gradient-to-r from-accent to-amber-500">Project Cashflow.</span>
              <br />
              Close More Deals.
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Stop wrestling with spreadsheets. Commission Tracker gives you a clear view of your 
              income, expenses, and 12-month projections—designed specifically for Vancouver's real estate market.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button size="lg" className="btn-premium text-base px-8 h-14 gap-2">
                  Start Free Today
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" size="lg" className="text-base px-8 h-14">
                  See How It Works
                </Button>
              </a>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required • Free forever for basic use
            </p>
          </motion.div>
          
          {/* Hero Image/Preview */}
          <motion.div 
            className="mt-16 relative"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative mx-auto max-w-5xl">
              <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl overflow-hidden">
                <div className="bg-muted/50 border-b border-border/50 px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-warning/60" />
                    <div className="w-3 h-3 rounded-full bg-success/60" />
                  </div>
                  <div className="flex-1 text-center text-xs text-muted-foreground">
                    Commission Tracker — Dashboard
                  </div>
                </div>
                <div className="p-6 sm:p-8 grid sm:grid-cols-3 gap-4">
                  {/* Mock KPI Cards */}
                  <div className="kpi-card">
                    <p className="text-sm text-muted-foreground mb-1">YTD Income</p>
                    <p className="text-2xl font-bold text-success">$127,450</p>
                    <p className="text-xs text-success mt-1">↑ 23% vs last year</p>
                  </div>
                  <div className="kpi-card">
                    <p className="text-sm text-muted-foreground mb-1">Pipeline Value</p>
                    <p className="text-2xl font-bold text-primary">$89,200</p>
                    <p className="text-xs text-muted-foreground mt-1">6 pending deals</p>
                  </div>
                  <div className="kpi-card">
                    <p className="text-sm text-muted-foreground mb-1">Next Payout</p>
                    <p className="text-2xl font-bold text-accent">$12,500</p>
                    <p className="text-xs text-muted-foreground mt-1">Due in 5 days</p>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -z-10 top-1/2 left-0 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute -z-10 top-1/3 right-0 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y border-border/50 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-6">TRUSTED BY VANCOUVER'S TOP AGENTS</p>
            <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground/60">
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6" />
                <span className="font-semibold">RE/MAX</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6" />
                <span className="font-semibold">Royal LePage</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6" />
                <span className="font-semibold">Sutton</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6" />
                <span className="font-semibold">Macdonald Realty</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6" />
                <span className="font-semibold">Oakwyn</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to Track Your Success
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Purpose-built for real estate professionals who want clarity on their finances
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: TrendingUp,
                title: "12-Month Projections",
                description: "See your income and expenses projected forward. Know exactly where you'll stand financially.",
                color: "text-primary"
              },
              {
                icon: Calendar,
                title: "Payout Scheduling",
                description: "Track advances, deposits, and completions. Never miss when money is due to arrive.",
                color: "text-accent"
              },
              {
                icon: PiggyBank,
                title: "Tax Set-Aside",
                description: "Automatic calculations for BC tax brackets and CPP contributions. No surprises at tax time.",
                color: "text-success"
              },
              {
                icon: BarChart3,
                title: "Expense Tracking",
                description: "Categorize business vs personal expenses. Track recurring costs and see spending patterns.",
                color: "text-info"
              },
              {
                icon: Shield,
                title: "Presale & Resale",
                description: "Handle both property types with custom payout structures. Perfect for Vancouver's mixed market.",
                color: "text-warning"
              },
              {
                icon: Smartphone,
                title: "Mobile-First Design",
                description: "Works beautifully on your phone. Check your numbers between showings or at open houses.",
                color: "text-primary"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="ios-card p-6 hover-lift"
                variants={fadeInUp}
              >
                <div className={`h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-4 ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Stop Guessing.
                <br />
                Start <span className="text-accent">Growing.</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Most agents have no idea what they'll earn next month. Commission Tracker 
                changes that with real-time visibility into your entire pipeline.
              </p>
              
              <div className="space-y-4">
                {[
                  "See exactly when each payout arrives",
                  "Know your net after brokerage splits",
                  "Track expenses against income in real-time",
                  "Plan for taxes with BC-specific calculations",
                  "Export data for your accountant anytime"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
              
              <Link to="/auth" className="inline-block mt-8">
                <Button size="lg" className="btn-premium gap-2">
                  Get Started Free
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
            
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="ios-card p-5 text-center">
                  <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-3xl font-bold">5 min</p>
                  <p className="text-sm text-muted-foreground">Setup time</p>
                </div>
                <div className="ios-card p-5 text-center">
                  <DollarSign className="h-8 w-8 text-success mx-auto mb-2" />
                  <p className="text-3xl font-bold">$0</p>
                  <p className="text-sm text-muted-foreground">To get started</p>
                </div>
                <div className="ios-card p-5 text-center">
                  <BarChart3 className="h-8 w-8 text-accent mx-auto mb-2" />
                  <p className="text-3xl font-bold">12 mo</p>
                  <p className="text-sm text-muted-foreground">Forecast ahead</p>
                </div>
                <div className="ios-card p-5 text-center">
                  <Users className="h-8 w-8 text-info mx-auto mb-2" />
                  <p className="text-3xl font-bold">100%</p>
                  <p className="text-sm text-muted-foreground">Your data</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Loved by Top Producers
            </h2>
            <p className="text-lg text-muted-foreground">
              Hear from agents who've transformed their financial clarity
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "I finally know exactly when my next cheque is coming. No more guessing, no more spreadsheets. This is a game changer.",
                name: "Sarah Chen",
                title: "Top 1% RE/MAX Agent",
                location: "Vancouver West"
              },
              {
                quote: "The tax set-aside feature alone has saved me from so much stress. I know exactly how much to put away each month.",
                name: "Michael Torres",
                title: "Team Lead, Sutton",
                location: "Burnaby"
              },
              {
                quote: "Managing presales was always complicated. Now I can see my advance payments and completions years out. Brilliant.",
                name: "Jennifer Liu",
                title: "Presale Specialist",
                location: "Richmond"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                className="ios-card p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="border-t border-border/50 pt-4">
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              Start free. Upgrade when you need more.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <motion.div
              className="ios-card p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-bold mb-2">Starter</h3>
              <p className="text-muted-foreground mb-6">Perfect for new agents</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              
              <div className="space-y-3 mb-8">
                {[
                  "Up to 10 active deals",
                  "Basic expense tracking",
                  "3-month projections",
                  "Mobile app access",
                  "Email support"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Link to="/auth" className="block">
                <Button variant="outline" className="w-full" size="lg">
                  Get Started Free
                </Button>
              </Link>
            </motion.div>
            
            {/* Pro Tier */}
            <motion.div
              className="ios-card p-8 border-accent/50 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="absolute top-0 right-0 bg-accent text-accent-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
                MOST POPULAR
              </div>
              
              <h3 className="text-xl font-bold mb-2">Professional</h3>
              <p className="text-muted-foreground mb-6">For serious producers</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              
              <div className="space-y-3 mb-8">
                {[
                  "Unlimited deals",
                  "Full expense categorization",
                  "12-month projections",
                  "Tax set-aside calculations",
                  "Rental property tracking",
                  "Data export (CSV/PDF)",
                  "Priority support"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Link to="/auth" className="block">
                <Button className="w-full btn-premium" size="lg">
                  Start 14-Day Free Trial
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-accent/10 via-transparent to-transparent pointer-events-none" />
        
        <motion.div 
          className="max-w-3xl mx-auto text-center relative"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Take Control of Your Commissions?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join hundreds of Vancouver agents who've stopped guessing and started growing.
            Set up takes 5 minutes.
          </p>
          
          <Link to="/auth">
            <Button size="lg" className="btn-premium text-base px-8 h-14 gap-2">
              Start Your Free Account
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • Cancel anytime
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-4 gap-8">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-accent to-amber-600 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-accent-foreground" />
                </div>
                <span className="font-bold text-lg">Commission Tracker</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                The simplest way for Vancouver real estate agents to track commissions, 
                manage expenses, and forecast cashflow.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><Link to="/auth" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link to="/auth" className="hover:text-foreground transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/50 mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Commission Tracker. Built for Vancouver agents, with ❤️</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
