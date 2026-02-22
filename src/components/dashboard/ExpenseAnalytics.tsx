import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Receipt, Home, Briefcase, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';

interface Expense {
  id: string;
  category: string;
  amount: number;
  recurrence?: string | null;
  month: string;
}

interface ExpenseAnalyticsProps {
  expenses: Expense[];
}

const expenseCategories = {
  personal: [
    'Personal Mortgage', 'Strata Fees', 'Property Taxes', 'Hydro/Utilities', 'Internet',
    'Car Lease/Payment', 'Car Insurance (Personal)', 'Car Charging/Gas',
    'Phone (Personal)', 'Groceries', 'Entertainment/Dining', 'Gym/Fitness', 'Apps & Subscriptions',
  ],
  business: [
    'Office Lease', 'Board Fees', 'Brokerage Fees',
    'CRM (CHIME, etc.)', 'Website Hosting', 'Google Workspace', 'iCloud/Storage', 'Canva/Design Tools',
    'Email Marketing (MailerLite)', 'Editing Apps', 'Other Software',
    'Facebook/Social Ads', 'Signs & Signage', 'Marketing Agency', 'Marketing Manager', 'Print Marketing',
    'Car (Business Use)', 'Car Insurance (Business)', 'Car Charging (Business)',
    'BCFSA License', 'Real Estate License', 'Professional Development', 'Continuing Education',
    'Client Gifts', 'Staging/Clean-ups', 'Photography',
    'Phone (Business)', 'Admin Support', 'Bookkeeping',
  ],
  rental: [
    'Rental Mortgage', 'Rental Strata Fees', 'Rental Property Tax', 'Property Management',
    'Rental Insurance', 'Rental Repairs/Maintenance', 'Rental Utilities', 'Other Rental Expense',
  ],
  taxes: [
    'Tax Set-Aside', 'GST/HST Remittance', 'Debt Pay Down',
  ],
};

const getExpenseType = (category: string): 'personal' | 'business' | 'rental' | 'other' => {
  if (expenseCategories.personal.includes(category)) return 'personal';
  if (expenseCategories.business.includes(category)) return 'business';
  if (expenseCategories.rental.includes(category)) return 'rental';
  return 'other';
};

const typeConfig = {
  personal: { color: 'text-blue-500', dot: 'bg-blue-500', label: 'Personal', badge: 'P' },
  business: { color: 'text-violet-500', dot: 'bg-violet-500', label: 'Business', badge: 'B' },
  rental: { color: 'text-amber-500', dot: 'bg-amber-500', label: 'Rental', badge: 'R' },
  other: { color: 'text-muted-foreground', dot: 'bg-muted-foreground', label: 'Other', badge: 'O' },
};

export function ExpenseAnalytics({ expenses }: ExpenseAnalyticsProps) {
  const analytics = useMemo(() => {
    const calcMonthly = (e: Expense) => e.recurrence === 'weekly' ? Number(e.amount) * 4.33 : Number(e.amount);

    let personal = 0, business = 0, rental = 0, oneTime = 0;
    const byCategory = new Map<string, { amount: number; type: 'personal' | 'business' | 'rental' | 'other' }>();

    expenses.forEach(e => {
      const type = getExpenseType(e.category);
      const isOneTime = e.recurrence === 'one-time';
      const amount = isOneTime ? Number(e.amount) : calcMonthly(e);

      if (isOneTime) { oneTime += amount; }
      else {
        if (type === 'personal') personal += amount;
        else if (type === 'business') business += amount;
        else if (type === 'rental') rental += amount;
      }

      if (!isOneTime) {
        const existing = byCategory.get(e.category);
        byCategory.set(e.category, {
          amount: (existing?.amount || 0) + calcMonthly(e),
          type,
        });
      }
    });

    const categories = Array.from(byCategory.entries())
      .map(([name, d]) => ({ name, ...d }))
      .sort((a, b) => b.amount - a.amount);

    return { personal, business, rental, oneTime, total: personal + business + rental, categories };
  }, [expenses]);

  const hasData = analytics.total > 0 || analytics.oneTime > 0;

  return (
    <motion.div
      className="landing-card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Receipt className="h-4 w-4 text-white" />
          </div>
          <h3 className="font-bold text-sm">Expense Analytics</h3>
        </div>
        <Link to="/expenses">
          <Button variant="ghost" size="sm" className="text-primary text-xs h-7 px-2">
            Manage <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </div>

      {hasData ? (
        <div className="p-4 space-y-4">
          {/* Summary row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Home className="h-3 w-3 text-blue-500" />
                <span className="text-[10px] font-medium text-muted-foreground">Personal</span>
              </div>
              <p className="text-base font-bold">{formatCurrency(analytics.personal)}</p>
              <p className="text-[10px] text-muted-foreground">/mo</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Briefcase className="h-3 w-3 text-violet-500" />
                <span className="text-[10px] font-medium text-muted-foreground">Business</span>
              </div>
              <p className="text-base font-bold">{formatCurrency(analytics.business)}</p>
              <p className="text-[10px] text-muted-foreground">/mo</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Receipt className="h-3 w-3 text-rose-500" />
                <span className="text-[10px] font-medium text-muted-foreground">Total</span>
              </div>
              <p className="text-base font-bold text-rose-500">{formatCurrency(analytics.total)}</p>
              <p className="text-[10px] text-muted-foreground">/mo</p>
            </div>
          </div>

          {/* Proportion bar */}
          <div className="h-2 rounded-full bg-muted/50 overflow-hidden flex">
            {analytics.total > 0 && (
              <>
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${(analytics.personal / analytics.total) * 100}%` }}
                />
                <div
                  className="h-full bg-violet-500 transition-all"
                  style={{ width: `${(analytics.business / analytics.total) * 100}%` }}
                />
                {analytics.rental > 0 && (
                  <div
                    className="h-full bg-amber-500 transition-all"
                    style={{ width: `${(analytics.rental / analytics.total) * 100}%` }}
                  />
                )}
              </>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />Personal</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500" />Business</span>
            {analytics.rental > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />Rental</span>}
            {analytics.oneTime > 0 && <span>One-time: {formatCurrency(analytics.oneTime)}</span>}
          </div>

          {/* Top categories */}
          {analytics.categories.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Top Categories</p>
              {analytics.categories.slice(0, 5).map(cat => {
                const cfg = typeConfig[cat.type];
                return (
                  <div key={cat.name} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                      <span className="text-xs">{cat.name}</span>
                      <span className="text-[9px] px-1 py-0.5 rounded bg-muted/60 text-muted-foreground font-medium leading-none">{cfg.badge}</span>
                    </div>
                    <span className="text-xs font-semibold">{formatCurrency(cat.amount)}/mo</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center">
          <Receipt className="h-8 w-8 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm font-medium mb-1">No expenses tracked</p>
          <p className="text-xs text-muted-foreground mb-3">Add expenses to see analytics</p>
          <Link to="/expenses">
            <Button variant="outline" size="sm" className="text-xs h-7">Add Expenses</Button>
          </Link>
        </div>
      )}
    </motion.div>
  );
}
