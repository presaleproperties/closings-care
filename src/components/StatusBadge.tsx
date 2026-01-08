import { cn } from '@/lib/utils';
import { DealStatus, PayoutStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: DealStatus | PayoutStatus;
  className?: string;
}

const statusConfig = {
  PENDING: { label: 'Pending', className: 'status-pending' },
  CLOSED: { label: 'Closed', className: 'status-closed' },
  PROJECTED: { label: 'Projected', className: 'status-projected' },
  INVOICED: { label: 'Invoiced', className: 'status-invoiced' },
  PAID: { label: 'Paid', className: 'status-paid' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
