import { useState, useMemo } from 'react';
import { Target, TrendingUp, Edit2, Check, X, Sparkles, Trophy, Flame } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Payout } from '@/lib/types';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

interface GoalTrackerProps {
  payouts: Payout[];
  monthlyGoal: number;
  onUpdateGoal: (goal: number) => void;
  isUpdating?: boolean;
}

export function GoalTracker({ payouts, monthlyGoal, onUpdateGoal, isUpdating }: GoalTrackerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(monthlyGoal.toString());

  const now = new Date();

  const progress = useMemo(() => {
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // This month's paid income
    const thisMonthPaid = payouts
      .filter(p => {
        if (p.status !== 'PAID' || !p.paid_date) return false;
        const date = parseISO(p.paid_date);
        return isWithinInterval(date, { start: monthStart, end: monthEnd });
      })
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // This month's expected (invoiced + projected with due date this month)
    const thisMonthExpected = payouts
      .filter(p => {
        if (p.status === 'PAID' || !p.due_date) return false;
        const date = parseISO(p.due_date);
        return isWithinInterval(date, { start: monthStart, end: monthEnd });
      })
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const total = thisMonthPaid + thisMonthExpected;
    const percentage = monthlyGoal > 0 ? (thisMonthPaid / monthlyGoal) * 100 : 0;
    const projectedPercentage = monthlyGoal > 0 ? (total / monthlyGoal) * 100 : 0;

    // Days progress in month
    const dayOfMonth = now.getDate();
    const daysInMonth = endOfMonth(now).getDate();
    const monthProgress = (dayOfMonth / daysInMonth) * 100;

    // Are we on track?
    const expectedByNow = (monthlyGoal * dayOfMonth) / daysInMonth;
    const onTrack = thisMonthPaid >= expectedByNow * 0.8; // Within 80% of expected

    return {
      paid: thisMonthPaid,
      expected: thisMonthExpected,
      total,
      percentage: Math.min(percentage, 100),
      projectedPercentage: Math.min(projectedPercentage, 150),
      remaining: Math.max(0, monthlyGoal - thisMonthPaid),
      monthProgress,
      onTrack,
      goalMet: thisMonthPaid >= monthlyGoal,
    };
  }, [payouts, monthlyGoal, now]);

  const handleSave = () => {
    const value = parseFloat(editValue);
    if (!isNaN(value) && value >= 0) {
      onUpdateGoal(value);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(monthlyGoal.toString());
    setIsEditing(false);
  };

  const getStatusMessage = () => {
    if (progress.goalMet) {
      return { icon: Trophy, message: "Goal achieved! 🎉", color: "text-success" };
    }
    if (progress.onTrack) {
      return { icon: Flame, message: "On track!", color: "text-success" };
    }
    return { icon: Target, message: "Keep pushing!", color: "text-warning" };
  };

  const status = getStatusMessage();
  const StatusIcon = status.icon;

  return (
    <div className="rounded-2xl border-2 border-accent/30 bg-gradient-to-br from-accent/5 to-transparent p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-accent/20">
            <Target className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Monthly Goal</h3>
            <p className="text-xs text-muted-foreground">{format(now, 'MMMM yyyy')}</p>
          </div>
        </div>
        
        {!isEditing ? (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsEditing(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        ) : (
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSave}
              disabled={isUpdating}
              className="text-success hover:text-success"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCancel}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Goal Amount */}
      <div className="mb-6">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">$</span>
            <Input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="text-2xl font-bold h-12"
              autoFocus
            />
          </div>
        ) : (
          <p className="text-3xl font-bold">{formatCurrency(monthlyGoal)}</p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{progress.percentage.toFixed(0)}%</span>
        </div>
        <div className="relative">
          <Progress value={progress.percentage} className="h-4" />
          {/* Projected overlay */}
          {progress.expected > 0 && (
            <div 
              className="absolute top-0 left-0 h-4 bg-accent/30 rounded-full transition-all"
              style={{ width: `${Math.min(progress.projectedPercentage, 100)}%` }}
            />
          )}
          {/* Paid overlay */}
          <div 
            className="absolute top-0 left-0 h-4 bg-success rounded-full transition-all"
            style={{ width: `${progress.percentage}%` }}
          />
          {/* Month progress marker */}
          <div 
            className="absolute top-0 h-4 w-0.5 bg-foreground/50"
            style={{ left: `${progress.monthProgress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Start of month</span>
          <span>Today ({progress.monthProgress.toFixed(0)}% of month)</span>
          <span>End of month</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 rounded-xl bg-success/10">
          <p className="text-xs text-muted-foreground mb-1">Earned</p>
          <p className="text-lg font-bold text-success">{formatCurrency(progress.paid)}</p>
        </div>
        <div className="p-3 rounded-xl bg-accent/10">
          <p className="text-xs text-muted-foreground mb-1">Expected</p>
          <p className="text-lg font-bold text-accent">{formatCurrency(progress.expected)}</p>
        </div>
      </div>

      {/* Remaining */}
      {!progress.goalMet && (
        <div className="p-3 rounded-xl bg-muted/50 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Still needed</span>
            <span className="font-bold">{formatCurrency(progress.remaining)}</span>
          </div>
        </div>
      )}

      {/* Status */}
      <div className={`flex items-center gap-2 p-3 rounded-xl ${
        progress.goalMet ? 'bg-success/10' : progress.onTrack ? 'bg-success/10' : 'bg-warning/10'
      }`}>
        <StatusIcon className={`h-5 w-5 ${status.color}`} />
        <span className={`font-medium ${status.color}`}>{status.message}</span>
        {progress.goalMet && <Sparkles className="h-4 w-4 text-success ml-auto" />}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span>Paid</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-accent/30" />
          <span>Expected</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-foreground/50" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}
