import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Wallet, Home, Lock } from 'lucide-react';
import { format, addMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';
import { Payout, OtherIncome, Expense } from '@/lib/types';
import { Property } from '@/hooks/useProperties';
import { getOtherIncomeForMonth } from '@/hooks/useOtherIncome';
import { getTotalExpensesForMonth, getPropertyCostsForMonth } from '@/lib/expenseCalculations';
import { useSubscription } from '@/hooks/useSubscription';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface IncomeProjectionProps {
  payouts: Payout[];
  expenses: Expense[];
  otherIncome?: OtherIncome[];
  properties?: Property[];
}

interface MonthData {
  month: string;
  fullMonth: string;
  monthStr: string;
  monthIndex: number;
  income: number;
  otherIncome: number;
  propertyNet: number;
  totalIncome: number;
  expenses: number;
  net: number;
  cumulativeNet: number;
  payouts: Payout[];
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload as MonthData;
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-sm mb-2">{data?.fullMonth}</p>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between gap-4">
            <span className="text-success flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success" />
              Commissions
            </span>
            <span className="font-medium">{formatCurrency(data?.income || 0)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-sky-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              Other Income
            </span>
            <span className="font-medium">{formatCurrency(data?.otherIncome || 0)}</span>
          </div>
          {data?.propertyNet !== 0 && (
            <div className="flex justify-between gap-4">
              <span className={`flex items-center gap-1.5 ${data?.propertyNet >= 0 ? 'text-teal-400' : 'text-orange-400'}`}>
                <span className={`w-2 h-2 rounded-full ${data?.propertyNet >= 0 ? 'bg-teal-400' : 'bg-orange-400'}`} />
                Property Net
              </span>
              <span className="font-medium">{data?.propertyNet >= 0 ? '+' : ''}{formatCurrency(data?.propertyNet || 0)}</span>
            </div>
          )}
          <div className="flex justify-between gap-4 pt-1 border-t border-border/50">
            <span className="text-primary font-medium">Total Income</span>
            <span className="font-bold">{formatCurrency(data?.totalIncome || 0)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-destructive flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-destructive" />
              Expenses
            </span>
            <span className="font-medium">{formatCurrency(data?.expenses || 0)}</span>
          </div>
          <div className="flex justify-between gap-4 pt-1 border-t border-border/50">
            <span className={data?.net >= 0 ? 'text-success' : 'text-destructive'}>Net</span>
            <span className={`font-bold ${data?.net >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(data?.net || 0)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function IncomeProjection({ payouts, expenses, otherIncome = [], properties = [] }: IncomeProjectionProps) {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<MonthData | null>(null);
  const { limits, isFree } = useSubscription();

  // Calculate property costs once (they're the same every month)
  const propertyCosts = useMemo(() => getPropertyCostsForMonth(properties), [properties]);

  // Respect subscription projection limits
  const projectionMonths = limits.projectionMonths;

  const chartData = useMemo(() => {
    const months: MonthData[] = [];
    let cumulativeNet = 0;

    for (let i = 0; i < projectionMonths; i++) {
      const monthDate = addMonths(now, i);
      const monthLabel = format(monthDate, 'MMM');
      const monthStr = format(monthDate, 'yyyy-MM');
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const monthPayouts = payouts.filter((p) => {
        if (!p.due_date || p.status === 'PAID') return false;
        const date = parseISO(p.due_date);
        return isWithinInterval(date, { start: monthStart, end: monthEnd });
      });

      const income = monthPayouts.reduce((sum, p) => sum + Number(p.amount), 0);
      const monthOtherIncome = getOtherIncomeForMonth(otherIncome, monthStr);
      
      // Property net: positive if rental income > costs, negative if costs > income
      const propertyNet = propertyCosts.totalNet;
      
      // Total income = commissions + other income
      // Property net is shown separately in the UI but handled in expenses calculation
      const totalIncome = income + monthOtherIncome;
      
      // Calculate expenses for this month (includes property costs properly)
      // getTotalExpensesForMonth = tracked expenses + personal property costs - rental net
      // This means if rental is profitable, it REDUCES expenses (effectively income)
      // If rental is losing, it ADDS to expenses
      const monthExpenses = getTotalExpensesForMonth(expenses, properties, monthStr);
      
      const net = totalIncome - monthExpenses;
      cumulativeNet += net;

      months.push({
        month: monthLabel,
        fullMonth: format(monthDate, 'MMMM yyyy'),
        monthStr,
        monthIndex: i,
        income,
        otherIncome: monthOtherIncome,
        propertyNet,
        totalIncome,
        expenses: monthExpenses,
        net,
        cumulativeNet,
        payouts: monthPayouts,
      });
    }
    return months;
  }, [payouts, expenses, otherIncome, properties, propertyCosts, projectionMonths]);

  const totalCommissions = chartData.reduce((sum, m) => sum + m.income, 0);
  const totalOtherIncome = chartData.reduce((sum, m) => sum + m.otherIncome, 0);
  const totalPropertyNet = propertyCosts.totalNet * projectionMonths; // Property impact (informational only)
  const totalProjectedIncome = totalCommissions + totalOtherIncome;
  const totalExpenses = chartData.reduce((sum, m) => sum + m.expenses, 0);
  const netProjection = chartData.reduce((sum, m) => sum + m.net, 0);

  const handleBarClick = (data: any) => {
    if (data?.activePayload?.[0]?.payload) {
      setSelectedMonth(data.activePayload[0].payload as MonthData);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            {projectionMonths}-Month Projection
            {isFree && projectionMonths < 12 && (
              <span className="text-xs text-muted-foreground flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full">
                <Lock className="h-3 w-3" />
                Pro unlocks 12 months
              </span>
            )}
          </h3>
          <p className="text-sm text-muted-foreground">Click a bar for details</p>
        </div>
        <Link to="/forecast">
          <Button variant="ghost" size="sm" className="text-accent">
            Full Forecast <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Summary Stats - Two rows for better visual */}
      <div className="space-y-3 mb-6">
        {/* Income row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-success/10 border border-success/20">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Commissions</p>
            <p className="text-lg font-bold text-success">{formatCurrency(totalCommissions)}</p>
          </div>
          <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20">
            <div className="flex items-center gap-1 mb-0.5">
              <Wallet className="h-3 w-3 text-sky-400" />
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Other Income</p>
            </div>
            <p className="text-lg font-bold text-sky-400">{formatCurrency(totalOtherIncome)}</p>
          </div>
          <div className="p-3 rounded-xl bg-gradient-to-br from-success/10 to-sky-500/10 border border-primary/20">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Total Income</p>
            <p className="text-lg font-bold text-primary">{formatCurrency(totalProjectedIncome)}</p>
          </div>
        </div>
        
        {/* Expenses & Net row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Total Expenses</p>
            <p className="text-lg font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
          </div>
          <div className={`p-3 rounded-xl border ${netProjection >= 0 ? 'bg-accent/10 border-accent/20' : 'bg-destructive/10 border-destructive/20'}`}>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Net Projection</p>
            <p className={`text-lg font-bold ${netProjection >= 0 ? 'text-accent' : 'text-destructive'}`}>
              {formatCurrency(netProjection)}
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} barGap={0} onClick={handleBarClick} style={{ cursor: 'pointer' }}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(160, 84%, 45%)" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(160, 84%, 35%)" stopOpacity={1} />
              </linearGradient>
              <linearGradient id="otherIncomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(187, 92%, 50%)" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(187, 92%, 40%)" stopOpacity={1} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(0, 84%, 65%)" stopOpacity={0.9} />
                <stop offset="100%" stopColor="hsl(0, 84%, 55%)" stopOpacity={0.9} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.5} />
            <XAxis
              dataKey="month"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickFormatter={(v) => (v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`)}
              tickLine={false}
              axisLine={false}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top"
              height={36}
              formatter={(value) => {
                if (value === 'income') return <span className="text-xs">Commissions</span>;
                if (value === 'otherIncome') return <span className="text-xs">Other Income</span>;
                if (value === 'expenses') return <span className="text-xs">Expenses</span>;
                return value;
              }}
              iconType="circle"
              iconSize={8}
            />
            {/* Stacked income bars */}
            <Bar
              dataKey="income"
              fill="url(#incomeGradient)"
              radius={[0, 0, 0, 0]}
              maxBarSize={32}
              stackId="income"
            />
            <Bar
              dataKey="otherIncome"
              fill="url(#otherIncomeGradient)"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
              stackId="income"
            />
            {/* Expenses bar */}
            <Bar
              dataKey="expenses"
              fill="url(#expenseGradient)"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            {/* Net line overlay */}
            <Line
              type="monotone"
              dataKey="net"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
              legendType="none"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend note */}
      <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-border/50">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-4 h-0.5 bg-primary rounded" />
          <span>Net Income Trend</span>
        </div>
      </div>

      {/* Month Detail Dialog */}
      <Dialog open={!!selectedMonth} onOpenChange={() => setSelectedMonth(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedMonth?.fullMonth}</DialogTitle>
          </DialogHeader>
          
          {selectedMonth && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                    <p className="text-xs text-muted-foreground">Commissions</p>
                    <p className="font-bold text-success">{formatCurrency(selectedMonth.income)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/20">
                    <p className="text-xs text-muted-foreground">Other Income</p>
                    <p className="font-bold text-sky-400">{formatCurrency(selectedMonth.otherIncome)}</p>
                  </div>
                </div>
                {selectedMonth.propertyNet !== 0 && (
                  <div className={`p-3 rounded-lg border ${selectedMonth.propertyNet >= 0 ? 'bg-teal-500/10 border-teal-500/20' : 'bg-orange-500/10 border-orange-500/20'}`}>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Home className="h-3 w-3" /> Property Net
                      </p>
                      <p className={`font-bold ${selectedMonth.propertyNet >= 0 ? 'text-teal-400' : 'text-orange-400'}`}>
                        {selectedMonth.propertyNet >= 0 ? '+' : ''}{formatCurrency(selectedMonth.propertyNet)}
                      </p>
                    </div>
                  </div>
                )}
                <div className="p-3 rounded-lg bg-gradient-to-r from-success/5 to-sky-500/5 border border-primary/20">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">Total Income</p>
                    <p className="font-bold text-primary">{formatCurrency(selectedMonth.totalIncome)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-xs text-muted-foreground">Expenses</p>
                    <p className="font-bold text-destructive">{formatCurrency(selectedMonth.expenses)}</p>
                  </div>
                  <div className={`p-3 rounded-lg border ${selectedMonth.net >= 0 ? 'bg-accent/10 border-accent/20' : 'bg-destructive/10 border-destructive/20'}`}>
                    <p className="text-xs text-muted-foreground">Net</p>
                    <p className={`font-bold ${selectedMonth.net >= 0 ? 'text-accent' : 'text-destructive'}`}>
                      {formatCurrency(selectedMonth.net)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payouts List */}
              <div>
                <h4 className="text-sm font-medium mb-2">
                  Expected Payouts ({selectedMonth.payouts.length})
                </h4>
                {selectedMonth.payouts.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedMonth.payouts.map((payout) => (
                      <Link
                        key={payout.id}
                        to={`/deals/${payout.deal_id}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        onClick={() => setSelectedMonth(null)}
                      >
                        <div>
                          <p className="font-medium text-sm">
                            {payout.deal?.client_name || 'Unknown Client'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {payout.payout_type} • {payout.due_date ? format(parseISO(payout.due_date), 'MMM d') : 'No date'}
                          </p>
                        </div>
                        <span className="font-semibold text-success">
                          {formatCurrency(payout.amount)}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No commission payouts this month
                  </p>
                )}
              </div>

              {/* Other income note */}
              {selectedMonth.otherIncome > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-sky-500/5 border border-sky-500/20">
                  <Wallet className="h-4 w-4 text-sky-400" />
                  <p className="text-sm text-sky-400">
                    +{formatCurrency(selectedMonth.otherIncome)} from other income sources
                  </p>
                </div>
              )}

              {/* View Full Forecast */}
              <Link to="/forecast" onClick={() => setSelectedMonth(null)}>
                <Button variant="outline" className="w-full">
                  View Full Forecast <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
