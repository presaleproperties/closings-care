import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'accent' | 'success';
}

export function KpiCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  trendValue, 
  icon,
  className,
  variant = 'default'
}: KpiCardProps) {
  const variantClasses = {
    default: 'bg-card/95 backdrop-blur-xl border border-border/50',
    primary: 'gradient-card-primary text-primary-foreground border-0',
    accent: 'gradient-card-accent text-accent-foreground border-0',
    success: 'gradient-card-success text-success-foreground border-0',
  };

  const isColored = variant !== 'default';

  return (
    <div className={cn(
      'rounded-2xl p-5 transition-all duration-300 ease-out',
      variantClasses[variant],
      variant === 'default' && 'shadow-[0_0_0_1px_hsl(var(--border)/0.3),0_1px_2px_0_hsl(0_0%_0%/0.03),0_2px_4px_-1px_hsl(0_0%_0%/0.04)] hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.15),0_8px_16px_-4px_hsl(0_0%_0%/0.1),0_4px_8px_-2px_hsl(0_0%_0%/0.06)] hover:-translate-y-0.5 hover:border-primary/20',
      isColored && 'shadow-lg hover:shadow-xl hover:-translate-y-0.5',
      className
    )}>
      <div className="flex items-start justify-between mb-3">
        <p className={cn(
          'text-sm font-medium',
          isColored ? 'opacity-80' : 'text-muted-foreground'
        )}>{title}</p>
        {icon && (
          <div className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-200',
            isColored ? 'bg-white/15' : 'bg-primary/10'
          )}>
            {icon}
          </div>
        )}
      </div>
      
      <p className="text-2xl lg:text-3xl font-bold tracking-tight">{value}</p>
      
      {(subtitle || trend) && (
        <div className="flex items-center gap-2 mt-3">
          {trend && (
            <span
              className={cn(
                'flex items-center text-xs font-medium px-2 py-1 rounded-lg',
                trend === 'up' && (isColored ? 'bg-white/20' : 'bg-success/10 text-success'),
                trend === 'down' && (isColored ? 'bg-white/20' : 'bg-destructive/10 text-destructive'),
                trend === 'neutral' && (isColored ? 'bg-white/20' : 'bg-muted text-muted-foreground')
              )}
            >
              {trend === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
              {trend === 'down' && <TrendingDown className="w-3 h-3 mr-1" />}
              {trend === 'neutral' && <Minus className="w-3 h-3 mr-1" />}
              {trendValue}
            </span>
          )}
          {subtitle && (
            <span className={cn(
              'text-xs',
              isColored ? 'opacity-70' : 'text-muted-foreground'
            )}>{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}
