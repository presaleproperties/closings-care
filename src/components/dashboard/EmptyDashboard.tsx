import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  TrendingUp, 
  Calculator, 
  Shield, 
  ArrowRight,
  Sparkles,
  BarChart3,
  PiggyBank
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const tips = [
  {
    icon: TrendingUp,
    title: "Track Every Deal",
    description: "Log your pending and closed deals to see your real income picture",
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    icon: Calculator,
    title: "Automatic Tax Set-Aside",
    description: "We calculate exactly how much to save based on BC tax brackets",
    color: "bg-teal-500/10 text-teal-600",
  },
  {
    icon: BarChart3,
    title: "12-Month Projections",
    description: "See slow months coming before they hurt your cashflow",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: PiggyBank,
    title: "Safe-to-Spend",
    description: "Know exactly what you can spend after taxes and obligations",
    color: "bg-amber-500/10 text-amber-600",
  },
];

export function EmptyDashboard() {
  return (
    <div className="px-4 lg:px-6 py-8 max-w-3xl mx-auto">
      {/* Hero Section */}
      <motion.div 
        className="text-center mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-3">
          Welcome to CommissionIQ!
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Add your first deal to start tracking your income and get financial clarity.
        </p>
      </motion.div>

      {/* CTA Button */}
      <motion.div 
        className="flex justify-center mb-12"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <Button asChild size="lg" className="btn-premium h-14 px-8 text-base gap-2 shadow-xl shadow-emerald-500/25">
          <Link to="/deals/new">
            <Plus className="w-5 h-5" />
            Add Your First Deal
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </motion.div>

      {/* Tips Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider text-center mb-6">
          What you'll unlock
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {tips.map((tip, i) => (
            <motion.div
              key={tip.title}
              className="bg-card border border-border/50 rounded-2xl p-5 shadow-ios"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
            >
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl ${tip.color} flex items-center justify-center shrink-0`}>
                  <tip.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{tip.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {tip.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Start Guide */}
      <motion.div
        className="mt-10 p-6 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-emerald-600" />
          <h3 className="font-semibold">Quick Start Guide</h3>
        </div>
        <ol className="space-y-3 text-sm">
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
            <span><strong>Add a deal</strong> — Enter your pending or closed transactions with expected commission amounts</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
            <span><strong>Track expenses</strong> — Log your fixed and variable business costs for accurate projections</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
            <span><strong>Get clarity</strong> — See your Safe-to-Spend, tax set-aside, and 12-month forecast instantly</span>
          </li>
        </ol>
      </motion.div>
    </div>
  );
}