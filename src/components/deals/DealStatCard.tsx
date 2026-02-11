import { cn } from '@/lib/utils';

interface DealStatCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  iconBg: string;
  subtitle?: string;
}

export function DealStatCard({ label, value, icon: Icon, color, iconBg, subtitle }: DealStatCardProps) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/80 p-3 lg:p-4">
      <div className="flex items-center gap-2 mb-1.5 lg:mb-2">
        <div className={cn("w-7 h-7 lg:w-8 lg:h-8 rounded-xl flex items-center justify-center", iconBg)}>
          <Icon className={cn("h-3.5 w-3.5 lg:h-4 lg:w-4", color)} />
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium leading-tight">{label}</span>
      </div>
      <p className={cn("text-base lg:text-lg font-bold", color)}>{value}</p>
      {subtitle && <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
  );
}
