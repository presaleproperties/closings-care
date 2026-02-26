import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import {
  ArrowRight, RefreshCw, Wallet, Shield, LineChart,
  PieChart, Network, Check, ChevronDown, Menu, X
} from "lucide-react";
import logoMark from '@/assets/logo-mark.png';

// ─── Nav ─────────────────────────────────────────────
function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoMark} alt="dealzflow" className="h-8 w-8" />
            <span className="text-white font-bold text-lg tracking-tight">
              dealz<span className="text-emerald-400">flow</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-white/50">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#integrations" className="hover:text-white transition-colors">Integrations</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/auth" className="text-sm text-white/50 hover:text-white transition-colors">Sign in</Link>
            <Link to="/auth" className="text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2.5 rounded-full transition-colors">
              Start Free
            </Link>
          </div>

          <button className="md:hidden text-white/60 hover:text-white" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 rounded-2xl border border-white/[0.08] bg-[#0a0f0c]/95 backdrop-blur-2xl p-6 flex flex-col gap-5"
          >
            <a href="#features" onClick={() => setOpen(false)} className="text-white/60 hover:text-white text-sm">Features</a>
            <a href="#integrations" onClick={() => setOpen(false)} className="text-white/60 hover:text-white text-sm">Integrations</a>
            <a href="#pricing" onClick={() => setOpen(false)} className="text-white/60 hover:text-white text-sm">Pricing</a>
            <Link to="/auth" onClick={() => setOpen(false)} className="text-sm font-semibold bg-emerald-500 text-black px-5 py-2.5 rounded-full text-center">
              Start Free
            </Link>
          </motion.div>
        )}
      </div>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#060a08] text-center px-6">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-emerald-500/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-teal-400/5 rounded-full blur-[100px]" />
        {/* Grid lines */}
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#060a08]" />
      </div>

      <div className="relative max-w-5xl mx-auto pt-40 pb-32">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/8 text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-8"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Built for Real Brokerage Agents
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl sm:text-6xl lg:text-[84px] font-bold text-white leading-[1.0] tracking-[-0.04em] mb-8"
        >
          Know exactly{' '}
          <br className="hidden sm:block" />
          what you{' '}
          <span className="relative">
            <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              earned.
            </span>
          </span>
        </motion.h1>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg sm:text-xl text-white/40 max-w-2xl mx-auto leading-relaxed mb-12"
        >
          Your ReZen deals sync automatically. See your real income after splits, cap, taxes, and expenses — in seconds, not spreadsheets.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
        >
          <Link to="/auth">
            <button className="group flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-4 rounded-full text-base transition-all duration-200 shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.45)]">
              Start Free — 14 Days
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <Link to="/auth">
            <button className="text-white/50 hover:text-white text-sm font-medium transition-colors">
              Already a member? Sign in →
            </button>
          </Link>
        </motion.div>

        {/* Trust line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="flex flex-wrap items-center justify-center gap-6 text-xs text-white/25 tracking-wide"
        >
          {['No credit card required', 'BC · AB · ON tax rates', 'ReZen auto-sync', 'Cancel anytime'].map(t => (
            <span key={t} className="flex items-center gap-2">
              <Check className="h-3 w-3 text-emerald-500/50" />
              {t}
            </span>
          ))}
        </motion.div>

        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-24 max-w-3xl mx-auto"
        >
          <div className="relative rounded-3xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.6)]">
            {/* Top bar */}
            <div className="flex items-center gap-2 px-6 py-4 border-b border-white/[0.05]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <div className="w-3 h-3 rounded-full bg-white/10" />
              </div>
              <div className="flex-1 flex justify-center">
                <span className="text-xs text-white/20 font-mono">dealzflow — Dashboard</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </div>
            </div>

            {/* Dashboard preview */}
            <div className="p-6 grid grid-cols-3 gap-4">
              {[
                { label: 'GCI This Year', value: '$284,500', change: '+18%', color: 'emerald' },
                { label: 'Safe to Spend', value: '$43,200', change: 'After tax', color: 'teal' },
                { label: 'Tax Reserved', value: '$71,125', change: '25% set aside', color: 'amber' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + i * 0.1 }}
                  className="bg-white/[0.04] rounded-2xl p-4 border border-white/[0.06]"
                >
                  <p className="text-xs text-white/35 uppercase tracking-wider mb-2">{stat.label}</p>
                  <p className="text-xl font-bold text-white mb-1">{stat.value}</p>
                  <p className={`text-xs font-medium ${stat.color === 'amber' ? 'text-amber-400' : 'text-emerald-400'}`}>{stat.change}</p>
                </motion.div>
              ))}
            </div>

            <div className="px-6 pb-6">
              <div className="bg-white/[0.03] rounded-2xl border border-white/[0.05] p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-white/35 uppercase tracking-wider">Deals Pipeline</span>
                  <span className="text-xs text-emerald-400 font-medium">5 Active</span>
                </div>
                <div className="space-y-2">
                  {[
                    { name: '412 Arbutus St', status: 'Closing Apr 15', amount: '$18,400' },
                    { name: '88 Pacific Blvd', status: 'Firm — May 2', amount: '$24,100' },
                    { name: '2201 Marine Dr', status: 'In Progress', amount: '$11,800' },
                  ].map((deal, i) => (
                    <div key={deal.name} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                      <div>
                        <p className="text-sm text-white/70 font-medium">{deal.name}</p>
                        <p className="text-xs text-white/25">{deal.status}</p>
                      </div>
                      <span className="text-sm text-emerald-400 font-semibold">{deal.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Gradient fade at bottom */}
            <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#060a08] to-transparent pointer-events-none" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Stats bar ────────────────────────────────────────
function StatsBar() {
  const stats = [
    { value: '$2.4M+', label: 'Commissions tracked' },
    { value: '382', label: 'Transactions synced' },
    { value: '< 30s', label: 'To full sync' },
    { value: '3', label: 'Provinces covered' },
  ];
  return (
    <div className="bg-white/[0.02] border-y border-white/[0.05] py-12">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <p className="text-3xl font-bold text-white mb-1">{s.value}</p>
            <p className="text-sm text-white/30">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Features ─────────────────────────────────────────
function Features() {
  const features = [
    {
      icon: RefreshCw,
      title: 'ReZen Auto-Sync',
      desc: 'Connect once. Your deals, payouts, rev share, and network data sync automatically — no manual entry, ever.',
      tags: ['Transactions', 'Rev Share', 'Network', 'Payouts'],
      accent: 'emerald',
    },
    {
      icon: Wallet,
      title: 'Safe-to-Spend',
      desc: 'Your actual spending power, after taxes, expenses, and obligations are accounted for. Updated in real time.',
      tags: ['After-tax', 'Expense-aware', 'Instant', 'Accurate'],
      accent: 'teal',
    },
    {
      icon: Shield,
      title: 'Tax Reserves',
      desc: 'Canadian tax brackets built in. BC, AB, ON rates. GST for registered agents. No April surprises.',
      tags: ['BC · AB · ON', 'GST/HST', 'Set-aside', 'Year-round'],
      accent: 'amber',
    },
    {
      icon: PieChart,
      title: 'Business Analytics',
      desc: "See which lead sources, cities, and property types drive your income. Know what's working.",
      tags: ['Lead sources', 'City trends', 'Property mix', 'Monthly'],
      accent: 'violet',
    },
    {
      icon: LineChart,
      title: '12-Month Forecast',
      desc: "Slow months don't surprise you. Pipeline-based income projections show what's ahead.",
      tags: ['Pipeline', 'Projections', 'Cashflow', 'Alerts'],
      accent: 'blue',
    },
    {
      icon: Network,
      title: 'Rev Share Intelligence',
      desc: 'Track your network growth and rev share income across all tiers — directly from ReZen data.',
      tags: ['Tier tracking', 'Network size', 'Contributions', 'Growth'],
      accent: 'rose',
    },
  ];

  const accentMap: Record<string, string> = {
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    teal: 'bg-teal-500/10 border-teal-500/20 text-teal-400',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    violet: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
  };

  const iconBgMap: Record<string, string> = {
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    teal: 'bg-teal-500/15 text-teal-400 border-teal-500/20',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    violet: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
    blue: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    rose: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
  };

  return (
    <section id="features" className="py-32 px-6 bg-[#060a08]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="mb-20 max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-semibold text-emerald-400 tracking-[0.2em] uppercase mb-5">Features</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-[1.1] mb-5">
            Everything in one place.{' '}
            <span className="text-white/30">Nothing missing.</span>
          </h2>
          <p className="text-lg text-white/40 leading-relaxed">
            Built specifically for Real Brokerage agents. Not generic accounting software with a real estate skin.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.05] rounded-3xl overflow-hidden border border-white/[0.05]">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="bg-[#060a08] p-8 group hover:bg-white/[0.02] transition-colors duration-300"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-6 ${iconBgMap[f.accent]}`}>
                <f.icon className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-base font-bold text-white mb-3">{f.title}</h3>
              <p className="text-sm text-white/35 leading-relaxed mb-6">{f.desc}</p>
              <div className="flex flex-wrap gap-2">
                {f.tags.map(tag => (
                  <span key={tag} className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${accentMap[f.accent]}`}>
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Integrations ──────────────────────────────────────
function Integrations() {
  return (
    <section id="integrations" className="py-32 px-6 bg-[#040807]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-semibold text-emerald-400 tracking-[0.2em] uppercase mb-5">Integrations</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-5">
            Your data, where it lives.
          </h2>
          <p className="text-lg text-white/35 max-w-xl mx-auto">
            Connect to the platforms you already use. One sync, complete picture.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: 'ReZen by Real',
              label: 'Live',
              desc: 'Full transaction sync. Deals, payouts, rev share, network data — pulled directly from your ReZen account.',
              status: 'active',
            },
            {
              name: 'SkySlope',
              label: 'Coming Soon',
              desc: 'Transaction management sync for agents using SkySlope as their compliance platform.',
              status: 'soon',
            },
            {
              name: 'Lofty (Chime)',
              label: 'Coming Soon',
              desc: 'CRM sync for contacts, pipeline prospects, and deal tracking from Lofty.',
              status: 'soon',
            },
          ].map((int, i) => (
            <motion.div
              key={int.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-2xl border p-7 ${int.status === 'active' ? 'border-emerald-500/20 bg-emerald-500/[0.04]' : 'border-white/[0.06] bg-white/[0.02]'}`}
            >
              <div className="flex items-start justify-between mb-5">
                <h3 className="text-base font-bold text-white">{int.name}</h3>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                  int.status === 'active'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                    : 'bg-white/5 text-white/30 border border-white/10'
                }`}>
                  {int.label}
                </span>
              </div>
              <p className="text-sm text-white/35 leading-relaxed">{int.desc}</p>
              {int.status === 'active' && (
                <div className="mt-5 flex items-center gap-2 text-xs text-emerald-400 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Connected & syncing
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────
function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      desc: 'Get started with the basics.',
      features: ['Manual deal entry', 'Basic tax calculator', 'Expense tracking', 'Up to 10 deals/yr'],
      cta: 'Start Free',
      highlight: false,
    },
    {
      name: 'Pro',
      price: '$29',
      period: 'per month',
      desc: 'For agents serious about their numbers.',
      features: ['ReZen auto-sync', 'Full analytics suite', 'Safe-to-Spend engine', '12-month forecast', 'Rev share tracking', 'Brokerage cap tracker', 'Unlimited deals'],
      cta: 'Start 14-Day Free Trial',
      highlight: true,
    },
  ];

  return (
    <section id="pricing" className="py-32 px-6 bg-[#060a08]">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-semibold text-emerald-400 tracking-[0.2em] uppercase mb-5">Pricing</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-5">
            Simple. No surprises.
          </h2>
          <p className="text-lg text-white/35">
            Just like how we think about your finances.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-3xl p-8 border relative ${
                plan.highlight
                  ? 'border-emerald-500/30 bg-gradient-to-b from-emerald-500/[0.06] to-transparent'
                  : 'border-white/[0.07] bg-white/[0.02]'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-[11px] font-bold text-black bg-emerald-400 px-4 py-1 rounded-full tracking-wide">
                    MOST POPULAR
                  </span>
                </div>
              )}
              <div className="mb-8">
                <p className="text-sm text-white/40 font-medium mb-2">{plan.name}</p>
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-5xl font-bold text-white">{plan.price}</span>
                  <span className="text-white/30 text-sm mb-2">/ {plan.period}</span>
                </div>
                <p className="text-sm text-white/35">{plan.desc}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-white/60">
                    <Check className={`h-4 w-4 flex-shrink-0 ${plan.highlight ? 'text-emerald-400' : 'text-white/25'}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link to="/auth">
                <button className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 ${
                  plan.highlight
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_30px_rgba(16,185,129,0.2)]'
                    : 'bg-white/[0.06] hover:bg-white/[0.10] text-white border border-white/[0.08]'
                }`}>
                  {plan.cta}
                </button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────
function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const faqs = [
    {
      q: 'Does it really sync automatically from ReZen?',
      a: 'Yes. Connect your ReZen API key once in Settings → Integrations. We pull your transactions, rev share payments, and network data directly. No manual entry required.',
    },
    {
      q: 'How does the tax calculation work?',
      a: 'We use progressive Canadian tax brackets for BC, AB, and ON — plus GST for registered agents. You set a reserve percentage and we calculate exactly how much to set aside as each deal closes.',
    },
    {
      q: "What's \"Safe-to-Spend\"?",
      a: "Your real spendable income after your tax reserve, fixed expenses, and known obligations are subtracted. It's the number you actually need when deciding if you can afford something.",
    },
    {
      q: "Is my financial data secure?",
      a: "All data is encrypted at rest and in transit. We never sell or share your data. Your ReZen API key is stored encrypted and used only to sync your data.",
    },
    {
      q: "Can I use it if I'm not on Real Brokerage?",
      a: "The core deal tracking, tax calculator, and expense features work for any agent. The ReZen auto-sync is specific to Real Brokerage agents.",
    },
  ];

  return (
    <section className="py-32 px-6 bg-[#040807]">
      <div className="max-w-2xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-semibold text-emerald-400 tracking-[0.2em] uppercase mb-5">FAQ</p>
          <h2 className="text-4xl font-bold text-white tracking-tight">
            Questions answered.
          </h2>
        </motion.div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
            >
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="text-sm font-semibold text-white pr-4">{faq.q}</span>
                <ChevronDown className={`h-4 w-4 text-white/30 flex-shrink-0 transition-transform duration-300 ${openIdx === i ? 'rotate-180' : ''}`} />
              </button>
              {openIdx === i && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-6 pb-6 text-sm text-white/40 leading-relaxed"
                >
                  {faq.a}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="py-32 px-6 bg-[#060a08]">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="relative inline-block mb-10">
            <div className="absolute inset-0 bg-emerald-500/20 blur-[60px] rounded-full" />
            <img src={logoMark} alt="dealzflow" className="relative h-16 w-16" />
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-[-0.03em] leading-[1.05] mb-6">
            Stop guessing.{' '}
            <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
              Start knowing.
            </span>
          </h2>
          <p className="text-lg text-white/35 mb-12 max-w-xl mx-auto">
            14 days free. No credit card. Connect ReZen in under 2 minutes.
          </p>
          <Link to="/auth">
            <button className="group inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-10 py-5 rounded-full text-lg transition-all duration-200 shadow-[0_0_60px_rgba(16,185,129,0.3)] hover:shadow-[0_0_80px_rgba(16,185,129,0.5)]">
              Get Started Free
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-white/[0.05] bg-[#040807] py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <img src={logoMark} alt="dealzflow" className="h-7 w-7 opacity-70" />
          <span className="text-white/40 text-sm font-semibold">
            dealz<span className="text-emerald-500/60">flow</span>
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/25">
          <Link to="/terms" className="hover:text-white/50 transition-colors">Terms</Link>
          <Link to="/privacy" className="hover:text-white/50 transition-colors">Privacy</Link>
          <a href="mailto:hello@dealzflow.com" className="hover:text-white/50 transition-colors">Contact</a>
        </div>
        <p className="text-xs text-white/15">© {new Date().getFullYear()} dealzflow. All rights reserved.</p>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="bg-[#060a08] min-h-screen">
      <Nav />
      <Hero />
      <StatsBar />
      <Features />
      <Integrations />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
