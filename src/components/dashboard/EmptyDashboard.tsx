import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plug, TrendingUp, Calculator, Shield, ArrowRight, Sparkles, BarChart3, PiggyBank, Key
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: TrendingUp,
    title: 'Auto-sync from ReZen',
    description: 'Connect your ReZen account and all your transactions sync automatically',
    color: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    icon: Calculator,
    title: 'Automatic Tax Set-Aside',
    description: "We calculate exactly how much to save based on your province's tax brackets",
    color: 'bg-teal-500/10 text-teal-600',
  },
  {
    icon: BarChart3,
    title: '12-Month Projections',
    description: 'See slow months coming before they hurt your cashflow',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  {
    icon: PiggyBank,
    title: 'Safe-to-Spend',
    description: 'Know exactly what you can spend after taxes and obligations',
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
];

interface EmptyDashboardProps {
  onConnectReZen?: () => void;
}

export function EmptyDashboard({ onConnectReZen }: EmptyDashboardProps) {
  return (
    <div className="px-4 lg:px-6 py-8 max-w-3xl mx-auto">
      {/* Hero */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-3">Welcome to dealzflow!</h1>
        <p className="text-muted-foreground text-base max-w-md mx-auto">
          Connect your ReZen account to automatically import your transactions and unlock your full financial dashboard.
        </p>
      </motion.div>

      {/* Primary CTA: Connect ReZen */}
      <motion.div
        className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <Plug className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-lg mb-1">Connect ReZen (Recommended)</h2>
            <p className="text-sm text-muted-foreground">
              Get your API key from <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">app.therealbrokerage.com</span> → Profile → API Keys, then paste it in Settings.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="btn-premium flex-1 h-12 gap-2">
            <Link to="/settings?tab=integrations">
              <Key className="w-4 h-4" />
              Connect ReZen in Settings
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 gap-2">
            <Link to="/deals/new">
              Add Deal Manually
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Feature grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center mb-5">
          What you'll unlock
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="bg-card border border-border/50 rounded-2xl p-5 shadow-ios"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center shrink-0`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-sm">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick start steps */}
      <motion.div
        className="mt-8 p-5 rounded-2xl bg-muted/40 border border-border/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.75, duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-emerald-600" />
          <h3 className="font-semibold text-sm">Quick Start</h3>
        </div>
        <ol className="space-y-3 text-sm">
          <li className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
            <span><strong>Connect ReZen</strong> — Go to Settings → Integrations and paste your API key</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
            <span><strong>Sync your data</strong> — Your deals, commissions, and revenue share will populate automatically</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
            <span><strong>Get clarity</strong> — See your Safe-to-Spend, tax set-aside, and 12-month forecast instantly</span>
          </li>
        </ol>
      </motion.div>
    </div>
  );
}
