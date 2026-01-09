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
    default: 'bg-card border border-border',
    primary: 'gradient-card-primary text-primary-foreground border-0',
    accent: 'gradient-card-accent text-accent-foreground border-0',
    success: 'gradient-card-success text-success-foreground border-0',
  };

  const isColored = variant !== 'default';

  return (
    <div className={cn(
      'rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5',
      variantClasses[variant],
      className
    )}>
      <div className="flex items-start justify-between mb-3">
        <p className={cn(
          'text-sm font-medium',
          isColored ? 'opacity-80' : 'text-muted-foreground'
        )}>{title}</p>
        {icon && (
          <div className={cn(
            'w-9 h-9 rounded-lg flex items-center justify-center',
            isColored ? 'bg-white/15' : 'bg-accent/10'
          )}>
            {icon}
          </div>
        )}
      </div>
      
      <p className="text-2xl lg:text-3xl font-bold tracking-tight">{value}</p>
      
      {(subtitle || trend) && (
        <div className="flex items-center gap-2 mt-2">
          {trend && (
            <span
              className={cn(
                'flex items-center text-xs font-medium px-2 py-0.5 rounded-full',
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