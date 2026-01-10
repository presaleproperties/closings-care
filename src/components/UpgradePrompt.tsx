import { Crown, Sparkles, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useSubscription } from '@/hooks/useSubscription';

interface UpgradePromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
  reason?: string;
}

const PRO_FEATURES = [
  'Unlimited deals',
  'Full expense tracking',
  '12-month projections',
  'Tax set-aside calculator',
  'Safe-to-spend tracking',
  'Data export',
  'Priority support',
];

export function UpgradePrompt({ open, onOpenChange, feature, reason }: UpgradePromptProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl">Upgrade to Pro</DialogTitle>
              <DialogDescription className="text-sm">
                Unlock the full potential of Commission Tracker
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {reason && (
          <div className="p-4 bg-warning/10 border border-warning/30 rounded-xl mb-4">
            <p className="text-sm text-warning font-medium">{reason}</p>
          </div>
        )}

        <div className="space-y-3 mb-6">
          {PRO_FEATURES.map((f) => (
            <div key={f} className="flex items-center gap-3 text-sm">
              <div className="w-5 h-5 rounded-full bg-success/15 flex items-center justify-center">
                <Check className="w-3 h-3 text-success" />
              </div>
              <span>{f}</span>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4 mb-4">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold">$29</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <p className="text-xs text-muted-foreground">Cancel anytime. 14-day free trial.</p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Maybe Later
          </Button>
          <Button className="flex-1 btn-premium" asChild>
            <Link to="/settings#subscription">
              <Sparkles className="w-4 h-4 mr-2" />
              Upgrade Now
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Simple inline upgrade banner for feature-specific prompts
export function UpgradeBanner({ feature, className }: { feature: string; className?: string }) {
  const { isFree } = useSubscription();

  if (!isFree) return null;

  return (
    <div className={`p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl ${className || ''}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
          <Crown className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">Upgrade to unlock {feature}</p>
          <p className="text-xs text-muted-foreground">Get unlimited access with Pro</p>
        </div>
        <Button size="sm" className="btn-premium shrink-0" asChild>
          <Link to="/settings#subscription">Upgrade</Link>
        </Button>
      </div>
    </div>
  );
}

// Usage limit indicator
export function UsageLimitIndicator() {
  const { usage, isFree, limits } = useSubscription();

  if (!isFree) return null;

  const percentage = usage.percentUsed;
  const isNearLimit = percentage >= 70;
  const isAtLimit = usage.isAtDealLimit;

  return (
    <div className={`p-3 rounded-xl border ${
      isAtLimit 
        ? 'bg-destructive/10 border-destructive/30' 
        : isNearLimit 
          ? 'bg-warning/10 border-warning/30' 
          : 'bg-muted/50 border-border/50'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Deals Used</span>
        <span className={`text-sm font-bold ${isAtLimit ? 'text-destructive' : isNearLimit ? 'text-warning' : ''}`}>
          {usage.dealsUsed} / {limits.maxDeals}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all ${
            isAtLimit 
              ? 'bg-destructive' 
              : isNearLimit 
                ? 'bg-warning' 
                : 'bg-primary'
          }`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
      {isAtLimit && (
        <p className="text-xs text-destructive mt-2">
          You've reached your free plan limit. Upgrade to add more deals.
        </p>
      )}
    </div>
  );
}
