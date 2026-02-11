import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { triggerHaptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';
import { ExpenseRow } from './ExpenseRow';

interface ExpenseGroupSectionProps {
  icon: React.ElementType;
  label: string;
  total: number;
  gradientFrom: string;
  borderColor: string;
  totalColor: string;
  expenses: any[];
  iconBg: string;
  iconColor: string;
  getDisplayAmount: (expense: any) => number;
  onEdit: (expense: any) => void;
  onDelete: (id: string) => void;
  defaultOpen?: boolean;
}

export function ExpenseGroupSection({
  icon: Icon,
  label,
  total,
  gradientFrom,
  borderColor,
  totalColor,
  expenses,
  iconBg,
  iconColor,
  getDisplayAmount,
  onEdit,
  onDelete,
  defaultOpen = true,
}: ExpenseGroupSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (expenses.length === 0) return null;

  return (
    <div className="landing-card overflow-hidden">
      <button
        onClick={() => {
          triggerHaptic('light');
          setIsOpen(!isOpen);
        }}
        className={cn(
          "w-full px-4 py-3 flex items-center justify-between transition-colors touch-manipulation",
          `bg-gradient-to-r ${gradientFrom} border-b ${borderColor}`
        )}
      >
        <div className="flex items-center gap-2">
          <Icon className={cn("w-4 h-4", totalColor)} />
          <span className="font-semibold text-sm">{label}</span>
          <span className="text-[10px] bg-muted/50 px-1.5 py-0.5 rounded-full text-muted-foreground font-medium">
            {expenses.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("font-bold", totalColor)}>{formatCurrency(total)}</span>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="divide-y divide-border/50">
              {expenses.map((expense) => (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  icon={Icon}
                  iconBg={iconBg}
                  iconColor={iconColor}
                  getDisplayAmount={getDisplayAmount}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
