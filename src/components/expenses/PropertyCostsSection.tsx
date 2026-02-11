import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { triggerHaptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';

interface PropertyCostsSectionProps {
  icon: React.ElementType;
  label: string;
  total: number;
  totalColor: string;
  gradientFrom: string;
  borderColor: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function PropertyCostsSection({
  icon: Icon,
  label,
  total,
  totalColor,
  gradientFrom,
  borderColor,
  children,
  defaultOpen = true,
}: PropertyCostsSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

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
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
