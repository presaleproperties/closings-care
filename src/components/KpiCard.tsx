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
}

export function KpiCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  trendValue, 
  icon,
  className 
}: KpiCardProps) {
  return (
    <div className={cn('kpi-card', className)}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
      
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      
      {(subtitle || trend) && (
        <div className="flex items-center gap-2 mt-2">
          {trend && (
            <span
              className={cn(
                'flex items-center text-xs font-medium',
                trend === 'up' && 'text-success',
                trend === 'down' && 'text-destructive',
                trend === 'neutral' && 'text-muted-foreground'
              )}
            >
              {trend === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
              {trend === 'down' && <TrendingDown className="w-3 h-3 mr-1" />}
              {trend === 'neutral' && <Minus className="w-3 h-3 mr-1" />}
              {trendValue}
            </span>
          )}
          {subtitle && (
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}
