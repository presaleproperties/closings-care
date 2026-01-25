import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  X,
  CheckCircle2,
  Building2,
  Wallet,
  Receipt,
  TrendingUp,
  Calculator,
  PiggyBank,
  Calendar,
  DollarSign,
  Percent,
  Clock,
  ChevronRight,
  Sparkles,
  Shield,
  Monitor,
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Demo data
const DEMO_DEAL = {
  clientName: "Sarah Chen",
  address: "2105-1480 Howe Street",
  city: "Vancouver",
  propertyType: "PRESALE",
  dealType: "BUY",
  salePrice: 1250000,
  grossCommission: 31250,
  brokerageSplit: 20,
  netCommission: 25000,
  advanceCommission: 6250,
  completionCommission: 18750,
  advanceDate: "Mar 15, 2025",
  completionDate: "Aug 30, 2026"
};

const DEMO_EXPENSES = [
  { category: "Marketing", amount: 850, isFixed: false },
  { category: "Desk Fees", amount: 500, isFixed: true },
  { category: "Insurance", amount: 275, isFixed: true },
  { category: "Gas & Auto", amount: 420, isFixed: false },
];

const DEMO_PAYOUTS = [
  { type: "Advance", amount: 6250, date: "Mar 15", status: "PAID", deal: "1480 Howe St" },
  { type: "Completion", amount: 18750, date: "Apr 2", status: "PROJECTED", deal: "1480 Howe St" },
  { type: "Advance", amount: 4200, date: "Apr 18", status: "PROJECTED", deal: "888 Cardero" },
];

// Demo steps configuration
const DEMO_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to dealzflow',
    description: 'Your financial command center for real estate. Let\'s take a quick tour of how it works.',
    icon: Sparkles,
    highlightArea: 'full'
  },
  {
    id: 'dashboard',
    title: 'Your Dashboard',
    description: 'See your entire financial picture at a glance — income projections, upcoming payouts, and your safe-to-spend number.',
    icon: TrendingUp,
    highlightArea: 'dashboard'
  },
  {
    id: 'add-deal',
    title: 'Add a New Deal',
    description: 'Enter your pending or closed deals in seconds. We\'ll track everything from listing to closing.',
    icon: Building2,
    highlightArea: 'deal-form'
  },
  {
    id: 'commission-calc',
    title: 'Commission Calculation',
    description: 'Watch your net commission calculate automatically — factoring in brokerage splits and your cap progress.',
    icon: Calculator,
    highlightArea: 'commission'
  },
  {
    id: 'expenses',
    title: 'Track Expenses',
    description: 'Log your business expenses with one tap. Fixed costs are used to calculate your survival runway.',
    icon: Receipt,
    highlightArea: 'expenses'
  },
  {
    id: 'payouts',
    title: 'Payout Timeline',
    description: 'See exactly when money hits your account. Track advances, completions, and mark payments as received.',
    icon: Wallet,
    highlightArea: 'payouts'
  },
  {
    id: 'tax-safety',
    title: 'Tax Set-Aside',
    description: 'We automatically calculate how much to save for taxes based on BC brackets. Never get surprised at tax time.',
    icon: Shield,
    highlightArea: 'tax'
  },
  {
    id: 'safe-to-spend',
    title: 'Safe to Spend',
    description: 'The magic number — what you can actually spend after taxes, expenses, and obligations. Financial clarity in one glance.',
    icon: PiggyBank,
    highlightArea: 'safe-to-spend'
  },
];

// Tooltip component
function DemoTooltip({ 
  children, 
  active, 
  position = 'bottom',
  className 
}: { 
  children: React.ReactNode; 
  active: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}) {
  if (!active) return null;
  
  const positionClasses = {
    top: 'bottom-full mb-3 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-3 left-1/2 -translate-x-1/2',
    left: 'right-full mr-3 top-1/2 -translate-y-1/2',
    right: 'left-full ml-3 top-1/2 -translate-y-1/2',
  };
  
  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-emerald-600 border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-emerald-600 border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-emerald-600 border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-emerald-600 border-y-transparent border-l-transparent',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        "absolute z-50 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-xl max-w-xs",
        positionClasses[position],
        className
      )}
    >
      {children}
      <div className={cn("absolute w-0 h-0 border-8", arrowClasses[position])} />
    </motion.div>
  );
}

// Pulsing highlight ring
function PulseRing({ active }: { active: boolean }) {
  if (!active) return null;
  
  return (
    <motion.div
      className="absolute inset-0 rounded-2xl border-2 border-emerald-500 pointer-events-none"
      animate={{ 
        boxShadow: ['0 0 0 0 rgba(16, 185, 129, 0.4)', '0 0 0 12px rgba(16, 185, 129, 0)'],
      }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  );
}

// Dashboard Preview Component
function DashboardPreview({ currentStep, viewMode }: { currentStep: number; viewMode: 'desktop' | 'mobile' }) {
  const stepId = DEMO_STEPS[currentStep]?.id;
  
  return (
    <div className={cn(
      "bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl overflow-hidden shadow-2xl border border-slate-200",
      viewMode === 'mobile' ? "w-[375px] h-[700px]" : "w-full max-w-4xl"
    )}>
      {/* Browser/Phone Chrome */}
      <div className="bg-slate-800 px-4 py-2 flex items-center gap-2">
        {viewMode === 'desktop' ? (
          <>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-slate-700 rounded-lg px-4 py-1 text-xs text-slate-400 flex items-center gap-2">
                <Shield className="w-3 h-3 text-emerald-400" />
                app.dealzflow.ca
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex justify-center">
            <div className="text-xs text-slate-400">9:41</div>
          </div>
        )}
      </div>
      
      {/* App Content */}
      <div className="p-4 h-full overflow-y-auto">
        <AnimatePresence mode="wait">
          {stepId === 'welcome' && (
            <WelcomeView key="welcome" />
          )}
          {stepId === 'dashboard' && (
            <DashboardView key="dashboard" viewMode={viewMode} />
          )}
          {stepId === 'add-deal' && (
            <DealFormView key="deal-form" />
          )}
          {stepId === 'commission-calc' && (
            <CommissionCalcView key="commission" />
          )}
          {stepId === 'expenses' && (
            <ExpensesView key="expenses" />
          )}
          {stepId === 'payouts' && (
            <PayoutsView key="payouts" />
          )}
          {stepId === 'tax-safety' && (
            <TaxSafetyView key="tax" />
          )}
          {stepId === 'safe-to-spend' && (
            <SafeToSpendView key="safe-to-spend" />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Individual view components
function WelcomeView() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center h-96 text-center"
    >
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/30"
      >
        <img src="/favicon.png" alt="dealzflow" className="w-16 h-16 rounded-xl" />
      </motion.div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">dealzflow</h2>
      <p className="text-slate-500">Financial clarity for real estate agents</p>
    </motion.div>
  );
}

function DashboardView({ viewMode }: { viewMode: 'desktop' | 'mobile' }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500">Welcome back, Sarah</p>
        </div>
        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Building2 className="w-4 h-4 mr-1" />
          Add Deal
        </Button>
      </div>

      {/* Safe to Spend Card */}
      <motion.div 
        className="relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white"
        animate={{ boxShadow: ['0 10px 40px -10px rgba(16, 185, 129, 0.3)', '0 10px 40px -10px rgba(16, 185, 129, 0.5)', '0 10px 40px -10px rgba(16, 185, 129, 0.3)'] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex items-center gap-2 text-emerald-100 text-sm mb-2">
          <PiggyBank className="w-4 h-4" />
          Safe to Spend
        </div>
        <p className="text-4xl font-bold mb-1">$7,750</p>
        <p className="text-emerald-100 text-sm">Available this month</p>
      </motion.div>

      {/* Stats Grid */}
      <div className={cn("grid gap-3", viewMode === 'mobile' ? "grid-cols-2" : "grid-cols-4")}>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="text-sm text-slate-500 mb-1">This Month</div>
          <div className="text-xl font-bold text-emerald-600">$24,200</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="text-sm text-slate-500 mb-1">YTD Income</div>
          <div className="text-xl font-bold text-slate-800">$142,500</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="text-sm text-slate-500 mb-1">Pending</div>
          <div className="text-xl font-bold text-amber-600">$68,400</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="text-sm text-slate-500 mb-1">Tax Reserve</div>
          <div className="text-xl font-bold text-slate-800">$22,800</div>
        </div>
      </div>

      {/* Upcoming Payouts */}
      <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Upcoming Payouts</h3>
          <span className="text-xs text-emerald-600 font-medium">View all →</span>
        </div>
        <div className="space-y-3">
          {DEMO_PAYOUTS.slice(0, 2).map((payout, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-2 h-8 rounded-full",
                  payout.status === 'PAID' ? 'bg-emerald-500' : 'bg-amber-400'
                )} />
                <div>
                  <p className="font-medium text-sm text-slate-800">{payout.deal}</p>
                  <p className="text-xs text-slate-500">{payout.type} · {payout.date}</p>
                </div>
              </div>
              <span className="font-semibold text-emerald-600">${payout.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function DealFormView() {
  const [animatedField, setAnimatedField] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimatedField(prev => (prev + 1) % 5);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const fields = [
    { label: "Client Name", value: DEMO_DEAL.clientName },
    { label: "Address", value: DEMO_DEAL.address },
    { label: "City", value: DEMO_DEAL.city },
    { label: "Sale Price", value: `$${DEMO_DEAL.salePrice.toLocaleString()}` },
    { label: "Commission", value: `$${DEMO_DEAL.grossCommission.toLocaleString()}` },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
          <Building2 className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">New Deal</h1>
          <p className="text-sm text-slate-500">Enter deal details</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
        {/* Deal Type Toggle */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
          <div className="flex-1 py-2 text-center text-sm font-medium bg-white rounded-lg shadow-sm text-emerald-600">
            Buy Side
          </div>
          <div className="flex-1 py-2 text-center text-sm font-medium text-slate-500">
            Sell Side
          </div>
        </div>

        {/* Animated Fields */}
        {fields.map((field, i) => (
          <motion.div 
            key={field.label}
            className={cn(
              "relative p-3 rounded-xl border-2 transition-all",
              animatedField === i ? "border-emerald-500 bg-emerald-50" : "border-slate-100"
            )}
          >
            <label className="text-xs text-slate-500 mb-1 block">{field.label}</label>
            <motion.div 
              className="font-medium text-slate-800"
              initial={animatedField === i ? { opacity: 0, x: -10 } : {}}
              animate={{ opacity: 1, x: 0 }}
            >
              {animatedField >= i ? field.value : ""}
              {animatedField === i && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="inline-block w-0.5 h-4 bg-emerald-500 ml-1"
                />
              )}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function CommissionCalcView() {
  const [showCalculation, setShowCalculation] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setShowCalculation(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
          <Calculator className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Commission Calculator</h1>
          <p className="text-sm text-slate-500">See your real take-home</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
        {/* Sale Info */}
        <div className="p-4 bg-slate-50 rounded-xl">
          <p className="text-sm text-slate-500 mb-1">Sale Price</p>
          <p className="text-2xl font-bold text-slate-800">${DEMO_DEAL.salePrice.toLocaleString()}</p>
        </div>

        <AnimatePresence>
          {showCalculation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3"
            >
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex justify-between items-center py-2"
              >
                <span className="text-slate-600">Gross Commission (2.5%)</span>
                <span className="font-semibold text-slate-800">${DEMO_DEAL.grossCommission.toLocaleString()}</span>
              </motion.div>
              
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-between items-center py-2"
              >
                <span className="text-slate-600 flex items-center gap-2">
                  Brokerage Split ({DEMO_DEAL.brokerageSplit}%)
                  <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">78% to cap</span>
                </span>
                <span className="font-semibold text-red-500">-${(DEMO_DEAL.grossCommission * 0.2).toLocaleString()}</span>
              </motion.div>

              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5 }}
                className="h-px bg-slate-200"
              />

              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6, type: 'spring' }}
                className="flex justify-between items-center py-3 px-4 bg-emerald-50 rounded-xl"
              >
                <span className="font-semibold text-emerald-800">Your Net Commission</span>
                <span className="text-2xl font-bold text-emerald-600">${DEMO_DEAL.netCommission.toLocaleString()}</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cap Progress */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-600">Brokerage Cap Progress</span>
          <span className="text-sm font-bold text-emerald-600">$15,600 / $20,000</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: '78%' }}
            transition={{ delay: 0.9, duration: 1, ease: 'easeOut' }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-2">$4,400 until 100% commission</p>
      </motion.div>
    </motion.div>
  );
}

function ExpensesView() {
  const [addingExpense, setAddingExpense] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setAddingExpense(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">
            <Receipt className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Expenses</h1>
            <p className="text-sm text-slate-500">March 2025</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Total</p>
          <p className="text-xl font-bold text-slate-800">$2,045</p>
        </div>
      </div>

      {/* Quick Categories */}
      <div className="grid grid-cols-4 gap-2">
        {['Marketing', 'Desk Fees', 'Auto', 'Other'].map((cat, i) => (
          <motion.button
            key={cat}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "py-3 rounded-xl text-xs font-medium transition-all",
              i === 0 ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
            )}
          >
            {cat}
          </motion.button>
        ))}
      </div>

      {/* Expense List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {DEMO_EXPENSES.map((expense, i) => (
          <motion.div 
            key={expense.category}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="flex items-center justify-between p-4 border-b border-slate-50 last:border-0"
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                expense.isFixed ? "bg-blue-100" : "bg-amber-100"
              )}>
                <Receipt className={cn("w-5 h-5", expense.isFixed ? "text-blue-600" : "text-amber-600")} />
              </div>
              <div>
                <p className="font-medium text-slate-800">{expense.category}</p>
                <p className="text-xs text-slate-500">{expense.isFixed ? 'Fixed' : 'Variable'}</p>
              </div>
            </div>
            <span className="font-semibold text-slate-800">${expense.amount}</span>
          </motion.div>
        ))}

        {/* Adding new expense animation */}
        <AnimatePresence>
          {addingExpense && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center justify-between p-4 bg-emerald-50 border-t-2 border-emerald-500"
            >
              <div className="flex items-center gap-3">
                <motion.div 
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 1, repeat: 2 }}
                  className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center"
                >
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <p className="font-medium text-emerald-800">Photography</p>
                  <p className="text-xs text-emerald-600">Added just now</p>
                </div>
              </div>
              <span className="font-semibold text-emerald-600">$450</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function PayoutsView() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
          <Wallet className="w-6 h-6 text-violet-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Payouts</h1>
          <p className="text-sm text-slate-500">Track your incoming cash</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
          <p className="text-xs text-emerald-600 mb-1">Received</p>
          <p className="text-xl font-bold text-emerald-700">$6,250</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
          <p className="text-xs text-amber-600 mb-1">Projected</p>
          <p className="text-xl font-bold text-amber-700">$22,950</p>
        </div>
      </div>

      {/* Payout Timeline */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {DEMO_PAYOUTS.map((payout, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.15 }}
            className="relative flex items-center justify-between p-4 border-b border-slate-50 last:border-0"
          >
            {/* Status Indicator */}
            <div className={cn(
              "absolute left-0 top-0 bottom-0 w-1",
              payout.status === 'PAID' ? 'bg-emerald-500' : 'bg-amber-400'
            )} />
            
            <div className="flex items-center gap-3 pl-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                payout.status === 'PAID' ? 'bg-emerald-100' : 'bg-amber-100'
              )}>
                {payout.status === 'PAID' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Clock className="w-5 h-5 text-amber-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-slate-800">{payout.deal}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{payout.type}</span>
                  <span>·</span>
                  <span>{payout.date}</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <p className={cn(
                "font-bold",
                payout.status === 'PAID' ? 'text-emerald-600' : 'text-slate-800'
              )}>
                ${payout.amount.toLocaleString()}
              </p>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                payout.status === 'PAID' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-amber-100 text-amber-700'
              )}>
                {payout.status === 'PAID' ? 'Received' : 'Pending'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function TaxSafetyView() {
  const [gaugeProgress, setGaugeProgress] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setGaugeProgress(78), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
          <Shield className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Tax Safety</h1>
          <p className="text-sm text-slate-500">Stay CRA-ready</p>
        </div>
      </div>

      {/* Tax Gauge */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex justify-center mb-6">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" stroke="#FEF3C7" strokeWidth="8" fill="none" />
              <motion.circle 
                cx="50" 
                cy="50" 
                r="42" 
                stroke="url(#taxGaugeGradient)" 
                strokeWidth="8" 
                fill="none" 
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 42}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - gaugeProgress / 100) }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="taxGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span 
                className="text-4xl font-bold text-slate-800"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {gaugeProgress}%
              </motion.span>
              <span className="text-sm text-emerald-600 font-medium">On Track</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-600">Tax Set Aside</span>
            <span className="font-bold text-slate-800">$22,800</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Recommended</span>
            <span className="font-medium text-slate-500">$29,200</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-100">
            <span className="text-slate-600">Gap to fill</span>
            <span className="font-bold text-amber-600">$6,400</span>
          </div>
        </div>
      </div>

      {/* Tax Breakdown */}
      <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
        <div className="flex items-start gap-3">
          <Calculator className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800 mb-1">BC Tax Rate Applied</p>
            <p className="text-sm text-amber-700">11% small business + 5% buffer + GST collected</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SafeToSpendView() {
  const [showBreakdown, setShowBreakdown] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setShowBreakdown(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {/* Giant Safe to Spend */}
      <motion.div 
        className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-3xl p-8 text-white text-center relative overflow-hidden"
        animate={{ 
          boxShadow: ['0 20px 60px -15px rgba(16, 185, 129, 0.4)', '0 20px 60px -15px rgba(16, 185, 129, 0.6)', '0 20px 60px -15px rgba(16, 185, 129, 0.4)'] 
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {/* Animated background orbs */}
        <motion.div
          className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"
          animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-24 h-24 bg-teal-400/20 rounded-full blur-xl"
          animate={{ x: [0, -15, 0], y: [0, 10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        
        <div className="relative">
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-sm font-medium mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <PiggyBank className="w-4 h-4" />
            Safe to Spend
          </motion.div>
          
          <motion.p 
            className="text-6xl font-bold mb-2"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
          >
            $7,750
          </motion.p>
          
          <p className="text-emerald-100">What you can safely spend this month</p>
        </div>
      </motion.div>

      {/* Breakdown */}
      <AnimatePresence>
        {showBreakdown && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3"
          >
            <h3 className="font-semibold text-slate-800 mb-4">How we calculated this:</h3>
            
            {[
              { label: "Projected Cash In", value: "+$24,200", color: "text-emerald-600" },
              { label: "Tax Set-Aside (30%)", value: "-$7,260", color: "text-red-500" },
              { label: "Fixed Expenses", value: "-$5,890", color: "text-red-500" },
              { label: "Upcoming Bills", value: "-$3,300", color: "text-red-500" },
            ].map((item, i) => (
              <motion.div 
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex justify-between items-center py-2"
              >
                <span className="text-slate-600">{item.label}</span>
                <span className={cn("font-semibold", item.color)}>{item.value}</span>
              </motion.div>
            ))}
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-between items-center pt-3 mt-2 border-t-2 border-emerald-500"
            >
              <span className="font-bold text-slate-800">Safe to Spend</span>
              <span className="text-2xl font-bold text-emerald-600">$7,750</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Main Demo Page Component
export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Auto-advance steps
  useEffect(() => {
    if (!isPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= DEMO_STEPS.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 5000);
    
    return () => clearInterval(timer);
  }, [isPlaying]);

  const currentStepData = DEMO_STEPS[currentStep];
  const progress = ((currentStep + 1) / DEMO_STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <img src="/favicon.png" alt="dealzflow" className="w-8 h-8 rounded-lg" />
              <span className="font-bold text-lg text-white">
                dealz<span className="text-emerald-400">flow</span>
              </span>
            </Link>
            
            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('desktop')}
                  className={cn(
                    "p-2 rounded-md transition-all",
                    viewMode === 'desktop' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'
                  )}
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('mobile')}
                  className={cn(
                    "p-2 rounded-md transition-all",
                    viewMode === 'mobile' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'
                  )}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>

              <Link to="/auth">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Step Info */}
          <motion.div 
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
              <currentStepData.icon className="w-4 h-4" />
              Step {currentStep + 1} of {DEMO_STEPS.length}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              {currentStepData.title}
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              {currentStepData.description}
            </p>
          </motion.div>

          {/* Preview Area */}
          <div className="flex justify-center mb-8">
            <DashboardPreview currentStep={currentStep} viewMode={viewMode} />
          </div>

          {/* Progress & Controls */}
          <div className="max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="h-1 bg-white/10 rounded-full mb-6 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center gap-2 mb-6">
              {DEMO_STEPS.map((step, i) => (
                <button
                  key={step.id}
                  onClick={() => {
                    setCurrentStep(i);
                    setIsPlaying(false);
                  }}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all",
                    i === currentStep 
                      ? 'bg-emerald-500 scale-125' 
                      : i < currentStep 
                        ? 'bg-emerald-500/50' 
                        : 'bg-white/20 hover:bg-white/40'
                  )}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setCurrentStep(prev => Math.max(0, prev - 1));
                  setIsPlaying(false);
                }}
                disabled={currentStep === 0}
                className="border-white/20 text-white hover:bg-white/10 disabled:opacity-30"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsPlaying(!isPlaying)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setCurrentStep(0);
                  setIsPlaying(true);
                }}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setCurrentStep(prev => Math.min(DEMO_STEPS.length - 1, prev + 1));
                  setIsPlaying(false);
                }}
                disabled={currentStep === DEMO_STEPS.length - 1}
                className="border-white/20 text-white hover:bg-white/10 disabled:opacity-30"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent pt-10 pb-6 px-4">
        <div className="max-w-md mx-auto text-center">
          <p className="text-white/60 text-sm mb-4">Ready to get financial clarity?</p>
          <Link to="/auth">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 h-14 text-lg shadow-xl shadow-emerald-500/30">
              Start Your Free 14-Day Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
