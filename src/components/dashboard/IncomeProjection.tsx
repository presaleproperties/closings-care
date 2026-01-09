import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, X } from 'lucide-react';
import { format, addMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';
import { Payout, OtherIncome } from '@/lib/types';
import { getOtherIncomeForMonth } from '@/hooks/useOtherIncome';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface IncomeProjectionProps {
  payouts: Payout[];
  monthlyExpenses: number;
  otherIncome?: OtherIncome[];
}

interface MonthData {
  month: string;
  fullMonth: string;
  monthStr: string;
  monthIndex: number;
  income: number;
  otherIncome: number;
  expenses: number;
  net: number;
  cumulativeNet: number;
  payouts: Payout[];
}

export function IncomeProjection({ payouts, monthlyExpenses, otherIncome = [] }: IncomeProjectionProps) {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<MonthData | null>(null);

  const chartData = useMemo(() => {
    const months: MonthData[] = [];
    let cumulativeNet = 0;

    for (let i = 0; i < 12; i++) {
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
      const totalIncome = income + monthOtherIncome;
      const net = totalIncome - monthlyExpenses;
      cumulativeNet += net;

      months.push({
        month: monthLabel,
        fullMonth: format(monthDate, 'MMMM yyyy'),
        monthStr,
        monthIndex: i,
        income,
        otherIncome: monthOtherIncome,
        expenses: monthlyExpenses,
        net,
        cumulativeNet,
        payouts: monthPayouts,
      });
    }
    return months;
  }, [payouts, monthlyExpenses, otherIncome]);

  const totalProjectedIncome = chartData.reduce((sum, m) => sum + m.income, 0);
  const totalOtherIncome = chartData.reduce((sum, m) => sum + m.otherIncome, 0);
  const totalExpenses = monthlyExpenses * 12;
  const netProjection = totalProjectedIncome + totalOtherIncome - totalExpenses;

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
            12-Month Projection
          </h3>
          <p className="text-sm text-muted-foreground">Click a bar for details</p>
        </div>
        <Link to="/forecast">
          <Button variant="ghost" size="sm" className="text-accent">
            Full Forecast <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="text-center p-3 rounded-xl bg-success/10">
          <p className="text-xs text-muted-foreground mb-1">Commissions</p>
          <p className="text-lg font-bold text-success">{formatCurrency(totalProjectedIncome)}</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-sky-500/10">
          <p className="text-xs text-muted-foreground mb-1">Other Income</p>
          <p className="text-lg font-bold text-sky-400">{formatCurrency(totalOtherIncome)}</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-destructive/10">
          <p className="text-xs text-muted-foreground mb-1">Expenses</p>
          <p className="text-lg font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-accent/10">
          <p className="text-xs text-muted-foreground mb-1">Net</p>
          <p className={`text-lg font-bold ${netProjection >= 0 ? 'text-accent' : 'text-destructive'}`}>
            {formatCurrency(netProjection)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={2} onClick={handleBarClick} style={{ cursor: 'pointer' }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
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
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => [
                formatCurrency(value),
                name === 'income' ? 'Commissions' : name === 'otherIncome' ? 'Other Income' : 'Expenses',
              ]}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullMonth}
            />
            <Legend
              formatter={(value) => value === 'income' ? 'Commissions' : value === 'otherIncome' ? 'Other Income' : 'Expenses'}
              wrapperStyle={{ fontSize: '12px' }}
            />
            <Bar
              dataKey="income"
              fill="hsl(142, 76%, 36%)"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
              stackId="income"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`income-${index}`} 
                  className="hover:opacity-80 transition-opacity"
                />
              ))}
            </Bar>
            <Bar
              dataKey="otherIncome"
              fill="hsl(199, 89%, 48%)"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
              stackId="income"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`other-${index}`} 
                  className="hover:opacity-80 transition-opacity"
                />
              ))}
            </Bar>
            <Bar
              dataKey="expenses"
              fill="hsl(0, 84%, 60%)"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`expense-${index}`} 
                  className="hover:opacity-80 transition-opacity"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
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
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-lg bg-success/10">
                  <p className="text-xs text-muted-foreground">Commissions</p>
                  <p className="font-bold text-success">{formatCurrency(selectedMonth.income)}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-sky-500/10">
                  <p className="text-xs text-muted-foreground">Other Income</p>
                  <p className="font-bold text-sky-400">{formatCurrency(selectedMonth.otherIncome)}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-destructive/10">
                  <p className="text-xs text-muted-foreground">Expenses</p>
                  <p className="font-bold text-destructive">{formatCurrency(selectedMonth.expenses)}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground">Net</p>
                  <p className={`font-bold ${selectedMonth.net >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatCurrency(selectedMonth.net)}
                  </p>
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
                    No payouts expected this month
                  </p>
                )}
              </div>

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
