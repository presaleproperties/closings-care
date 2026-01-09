import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { format, addMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';
import { Payout } from '@/lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface IncomeProjectionProps {
  payouts: Payout[];
  monthlyExpenses: number;
}

export function IncomeProjection({ payouts, monthlyExpenses }: IncomeProjectionProps) {
  const now = new Date();

  const chartData = useMemo(() => {
    const months = [];
    let cumulativeNet = 0;

    for (let i = 0; i < 12; i++) {
      const monthDate = addMonths(now, i);
      const monthLabel = format(monthDate, 'MMM');
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const income = payouts
        .filter((p) => {
          if (!p.due_date || p.status === 'PAID') return false;
          const date = parseISO(p.due_date);
          return isWithinInterval(date, { start: monthStart, end: monthEnd });
        })
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const net = income - monthlyExpenses;
      cumulativeNet += net;

      months.push({
        month: monthLabel,
        fullMonth: format(monthDate, 'MMMM yyyy'),
        income,
        expenses: monthlyExpenses,
        net,
        cumulativeNet,
      });
    }
    return months;
  }, [payouts, monthlyExpenses]);

  const totalProjectedIncome = chartData.reduce((sum, m) => sum + m.income, 0);
  const totalExpenses = monthlyExpenses * 12;
  const netProjection = totalProjectedIncome - totalExpenses;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            12-Month Projection
          </h3>
          <p className="text-sm text-muted-foreground">Income vs expenses forecast</p>
        </div>
        <Link to="/forecast">
          <Button variant="ghost" size="sm" className="text-accent">
            Full Forecast <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 rounded-xl bg-success/10">
          <p className="text-xs text-muted-foreground mb-1">Projected Income</p>
          <p className="text-lg font-bold text-success">{formatCurrency(totalProjectedIncome)}</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-destructive/10">
          <p className="text-xs text-muted-foreground mb-1">Total Expenses</p>
          <p className="text-lg font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-accent/10">
          <p className="text-xs text-muted-foreground mb-1">Net Projection</p>
          <p className={`text-lg font-bold ${netProjection >= 0 ? 'text-accent' : 'text-destructive'}`}>
            {formatCurrency(netProjection)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={2}>
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
                name === 'income' ? 'Income' : 'Expenses',
              ]}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullMonth}
            />
            <Legend
              formatter={(value) => (value === 'income' ? 'Income' : 'Expenses')}
              wrapperStyle={{ fontSize: '12px' }}
            />
            <Bar
              dataKey="income"
              fill="hsl(142, 76%, 36%)"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              dataKey="expenses"
              fill="hsl(0, 84%, 60%)"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
