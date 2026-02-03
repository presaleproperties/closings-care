import { useState, useEffect, useMemo } from 'react';
import { format, parseISO, addDays, subDays, isAfter, isBefore } from 'date-fns';
import { AlertCircle, CheckCircle, Calendar, Clock, ChevronLeft, ChevronRight, DollarSign, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Payout } from '@/lib/types';

interface OverduePayoutNotificationProps {
  payouts: Payout[];
  onMarkPaid: (id: string) => void;
  onUpdateDueDate: (id: string, newDate: string) => void;
  isPending?: boolean;
}

type NotificationStep = 'confirm' | 'change-date';

export function OverduePayoutNotification({
  payouts,
  onMarkPaid,
  onUpdateDueDate,
  isPending = false,
}: OverduePayoutNotificationProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [currentPayoutIndex, setCurrentPayoutIndex] = useState(0);
  const [step, setStep] = useState<NotificationStep>('confirm');
  const [newDueDate, setNewDueDate] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  // Get due/overdue payouts (due today or past due date, not paid, not dismissed this session)
  const overduePayouts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return payouts.filter(p => {
      if (p.status === 'PAID') return false;
      if (!p.due_date) return false;
      if (dismissedIds.has(p.id)) return false;
      
      const dueDate = parseISO(p.due_date);
      dueDate.setHours(0, 0, 0, 0);
      
      // Include payouts due today or before (overdue)
      return isBefore(dueDate, tomorrow);
    }).sort((a, b) => {
      // Sort by due date, oldest first
      return parseISO(a.due_date!).getTime() - parseISO(b.due_date!).getTime();
    });
  }, [payouts, dismissedIds]);

  const currentPayout = overduePayouts[currentPayoutIndex];

  // Open dialog when there are overdue payouts
  useEffect(() => {
    if (overduePayouts.length > 0 && !isOpen) {
      setIsOpen(true);
      setCurrentPayoutIndex(0);
      setStep('confirm');
    }
  }, [overduePayouts.length]);

  // Reset to first payout when list changes
  useEffect(() => {
    if (currentPayoutIndex >= overduePayouts.length) {
      setCurrentPayoutIndex(Math.max(0, overduePayouts.length - 1));
    }
  }, [overduePayouts.length, currentPayoutIndex]);

  // Close dialog if no more overdue payouts
  useEffect(() => {
    if (overduePayouts.length === 0 && isOpen) {
      setIsOpen(false);
    }
  }, [overduePayouts.length, isOpen]);

  if (!currentPayout) return null;

  const deal = currentPayout.deal;
  const dueDate = parseISO(currentPayout.due_date!);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  const daysPastDue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
  const isDueToday = daysPastDue === 0;
  const isOverdue = daysPastDue > 0;

  const handleMarkPaid = () => {
    onMarkPaid(currentPayout.id);
    // Move to next payout or close
    if (overduePayouts.length <= 1) {
      setIsOpen(false);
    } else {
      setCurrentPayoutIndex(prev => Math.min(prev, overduePayouts.length - 2));
    }
    setStep('confirm');
  };

  const handleNotYetPaid = () => {
    // Show date change options
    setNewDueDate(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
    setStep('change-date');
  };

  const handleChangeDueDate = () => {
    if (!newDueDate) return;
    onUpdateDueDate(currentPayout.id, newDueDate);
    // Move to next payout or close
    if (overduePayouts.length <= 1) {
      setIsOpen(false);
    } else {
      setCurrentPayoutIndex(prev => Math.min(prev, overduePayouts.length - 2));
    }
    setStep('confirm');
  };

  const handleDismiss = () => {
    setDismissedIds(prev => new Set([...prev, currentPayout.id]));
    setStep('confirm');
  };

  const handleNext = () => {
    if (currentPayoutIndex < overduePayouts.length - 1) {
      setCurrentPayoutIndex(prev => prev + 1);
      setStep('confirm');
    }
  };

  const handlePrev = () => {
    if (currentPayoutIndex > 0) {
      setCurrentPayoutIndex(prev => prev - 1);
      setStep('confirm');
    }
  };

  const quickDateOptions = [
    { label: 'Tomorrow', date: addDays(new Date(), 1) },
    { label: 'In 3 days', date: addDays(new Date(), 3) },
    { label: 'In 1 week', date: addDays(new Date(), 7) },
    { label: 'In 2 weeks', date: addDays(new Date(), 14) },
    { label: 'In 1 month', date: addDays(new Date(), 30) },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) handleDismiss();
      setIsOpen(open);
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-2 rounded-full",
              isDueToday ? "bg-primary/10" : "bg-destructive/10"
            )}>
              <AlertCircle className={cn(
                "w-5 h-5",
                isDueToday ? "text-primary" : "text-destructive"
              )} />
            </div>
            <div>
              <DialogTitle className="text-lg">
                {isDueToday ? 'Commission Due Today' : 'Overdue Commission'}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {overduePayouts.length === 1 
                  ? (isDueToday ? 'You have 1 payout due today' : 'You have 1 overdue payout')
                  : `${currentPayoutIndex + 1} of ${overduePayouts.length} due payouts`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Navigation for multiple payouts */}
        {overduePayouts.length > 1 && (
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrev}
              disabled={currentPayoutIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <div className="flex gap-1">
              {overduePayouts.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    idx === currentPayoutIndex ? "bg-accent" : "bg-muted"
                  )}
                />
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              disabled={currentPayoutIndex === overduePayouts.length - 1}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {step === 'confirm' && (
          <>
            {/* Payout Details Card */}
            <div className="bg-muted/50 rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-lg">{deal?.client_name || 'Unknown Deal'}</p>
                  {deal?.address && (
                    <p className="text-sm text-muted-foreground">{deal.address}</p>
                  )}
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  {currentPayout.payout_type}
                </Badge>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Amount</span>
                </div>
                <span className="font-bold text-lg">{formatCurrency(currentPayout.amount)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Due Date</span>
                </div>
                <span className="font-medium">
                  {currentPayout.due_date ? format(parseISO(currentPayout.due_date), 'MMM d, yyyy') : 'Not set'}
                </span>
              </div>

              {isOverdue && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-destructive" />
                    <span className="text-sm text-destructive">Overdue</span>
                  </div>
                  <span className="font-medium text-destructive">
                    {daysPastDue} day{daysPastDue !== 1 ? 's' : ''} late
                  </span>
                </div>
              )}
              
              {isDueToday && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm text-primary">Due Today</span>
                  </div>
                  <span className="font-medium text-primary">
                    Payment expected
                  </span>
                </div>
              )}
            </div>

            {/* Question */}
            <div className="text-center py-4">
              <p className="font-medium">Has this commission been paid?</p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleNotYetPaid}
                className="h-12"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Change Date
              </Button>
              <Button
                onClick={handleMarkPaid}
                disabled={isPending}
                className="h-12 bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Paid
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="w-full text-muted-foreground"
            >
              Remind me later
            </Button>
          </>
        )}

        {step === 'change-date' && (
          <>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                When do you expect to receive this commission?
              </p>

              {/* Quick date options */}
              <div className="grid grid-cols-2 gap-2">
                {quickDateOptions.map(({ label, date }) => (
                  <button
                    key={label}
                    onClick={() => setNewDueDate(format(date, 'yyyy-MM-dd'))}
                    className={cn(
                      "px-3 py-2.5 rounded-lg border text-sm font-medium transition-all",
                      newDueDate === format(date, 'yyyy-MM-dd')
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Custom date picker */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Or pick a specific date:</label>
                <Input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="h-11"
                />
              </div>

              {newDueDate && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <Calendar className="w-4 h-4 text-accent" />
                  <span className="text-sm">
                    New due date: <strong>{format(parseISO(newDueDate), 'MMMM d, yyyy')}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setStep('confirm')}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleChangeDueDate}
                disabled={!newDueDate || isPending}
                className="flex-1 btn-premium"
              >
                Update Date
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
