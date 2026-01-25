import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, TrendingUp, Info, PiggyBank, Receipt, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/lib/format';
import { calculateTax, Province, TaxType } from '@/lib/taxCalculator';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TaxSafetyCardProps {
  paidIncome: number;
  projectedIncome: number;
  deductibleExpenses: number;
}

type TaxStatus = 'safe' | 'caution' | 'at-risk';

const springConfigs = {
  gentle: { type: "spring" as const, stiffness: 120, damping: 20 },
};

export function TaxSafetyCard({ paidIncome, projectedIncome, deductibleExpenses }: TaxSafetyCardProps) {
  const { data: settings } = useSettings();
  
  const province = ((settings as any)?.province || 'BC') as Province;
  const taxType = ((settings as any)?.tax_type || 'self-employed') as TaxType;
  const taxBuffer = (settings as any)?.tax_buffer_percent || 5;
  const gstRegistered = (settings as any)?.gst_registered || false;
  const gstRate = (settings as any)?.gst_rate || 0.05;
  const taxSaved = (settings as any)?.tax_saved_amount || 0;

  const taxData = useMemo(() => {
    const totalIncome = paidIncome + projectedIncome;
    
    // Calculate income tax
    const taxBreakdown = calculateTax(paidIncome, deductibleExpenses * (paidIncome / Math.max(totalIncome, 1)), province, taxType);
    const projectedTax = calculateTax(totalIncome, deductibleExpenses, province, taxType);
    
    // Calculate GST if registered
    const gstOwed = gstRegistered ? paidIncome * gstRate : 0;
    
    // Apply conservative buffer
    const bufferMultiplier = 1 + (taxBuffer / 100);
    const recommendedSetAside = (taxBreakdown.totalTax + gstOwed) * bufferMultiplier;
    
    // Calculate shortfall/surplus
    const difference = taxSaved - recommendedSetAside;
    
    // Determine status
    let status: TaxStatus = 'safe';
    if (difference < -recommendedSetAside * 0.2) {
      status = 'at-risk';
    } else if (difference < 0) {
      status = 'caution';
    }
    
    // If stopped working today calculation
    const taxOwedIfStoppedToday = taxBreakdown.totalTax + gstOwed;

    return {
      totalIncome,
      recommendedSetAside,
      actualSaved: taxSaved,
      difference,
      status,
      taxOwedIfStoppedToday,
      gstOwed,
      incomeTax: taxBreakdown.totalTax,
      projectedTotalTax: projectedTax.totalTax * bufferMultiplier,
      bufferPercent: taxBuffer,
    };
  }, [paidIncome, projectedIncome, deductibleExpenses, province, taxType, taxBuffer, gstRegistered, gstRate, taxSaved]);

  const statusConfig = {
    'safe': {
      icon: Shield,
      label: 'On Track',
      color: 'text-success',
      bg: 'bg-success/10',
      border: 'border-success/30',
      iconColor: 'text-success',
      iconGradient: 'icon-gradient-primary',
    },
    'caution': {
      icon: AlertTriangle,
      label: 'Caution',
      color: 'text-warning',
      bg: 'bg-warning/10',
      border: 'border-warning/30',
      iconColor: 'text-warning',
      iconGradient: 'icon-gradient-accent',
    },
    'at-risk': {
      icon: AlertTriangle,
      label: 'At Risk',
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      border: 'border-destructive/30',
      iconColor: 'text-destructive',
      iconGradient: 'icon-gradient-accent',
    },
  };

  const config = statusConfig[taxData.status];
  const StatusIcon = config.icon;

  return (
    <motion.div 
      className="landing-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springConfigs.gentle}
    >
      <div className={cn("p-5", config.bg)}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={cn("icon-gradient-sm", config.iconGradient)}>
              <StatusIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">Tax Safety</h3>
              <p className={cn("text-sm font-medium", config.color)}>{config.label}</p>
            </div>
          </div>
          <Link to="/settings">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="p-3 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Recommended</span>
            </div>
            <p className="text-lg font-bold text-foreground">{formatCurrency(taxData.recommendedSetAside)}</p>
            <p className="text-xs text-muted-foreground">to set aside YTD</p>
          </div>
          
          <div className="p-3 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50">
            <div className="flex items-center gap-1.5 mb-1">
              <PiggyBank className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Saved</span>
            </div>
            <p className="text-lg font-bold text-foreground">{formatCurrency(taxData.actualSaved)}</p>
            <p className="text-xs text-muted-foreground">set aside</p>
          </div>
          
          <div className={cn("p-3 rounded-xl border", taxData.difference >= 0 ? "bg-success/10 border-success/30" : "bg-destructive/10 border-destructive/30")}>
            <div className="flex items-center gap-1.5 mb-1">
              <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Difference</span>
            </div>
            <p className={cn("text-lg font-bold", taxData.difference >= 0 ? "text-success" : "text-destructive")}>
              {taxData.difference >= 0 ? '+' : ''}{formatCurrency(taxData.difference)}
            </p>
            <p className="text-xs text-muted-foreground">{taxData.difference >= 0 ? 'surplus' : 'shortfall'}</p>
          </div>
        </div>

        {/* Warning Message */}
        <div className={cn("p-4 rounded-xl border bg-card/60 backdrop-blur-sm", config.border, "mb-4")}>
          <p className="text-sm text-foreground">
            <span className="font-medium">If you stopped working today,</span>{' '}
            you would owe approximately{' '}
            <span className={cn("font-bold", config.color)}>
              {formatCurrency(taxData.taxOwedIfStoppedToday)}
            </span>{' '}
            in taxes.
          </p>
        </div>

        {/* Tax Breakdown */}
        <div className="space-y-2 mb-4 p-4 rounded-xl bg-card/60 backdrop-blur-sm border border-border/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Income Tax (YTD)</span>
            <span className="font-medium text-foreground">{formatCurrency(taxData.incomeTax)}</span>
          </div>
          {gstRegistered && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">GST Owed (Est.)</span>
              <span className="font-medium text-foreground">{formatCurrency(taxData.gstOwed)}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Buffer (+{taxData.bufferPercent}%)</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>This extra buffer protects you from underestimating taxes. Adjust in settings.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="font-medium text-muted-foreground">included</span>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            ⚠️ Do not treat tax set-aside as spendable income. It belongs to CRA.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
