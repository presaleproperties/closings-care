import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Receipt, TrendingUp, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { triggerHaptic, springConfigs, staggerContainer } from '@/lib/haptics';

const actions = [
  { 
    icon: Plus, 
    label: 'New Deal', 
    path: '/deals/new', 
    primary: true,
    description: 'Add a new deal'
  },
  { 
    icon: Receipt, 
    label: 'Add Expense', 
    path: '/expenses',
    description: 'Track expenses'
  },
  { 
    icon: TrendingUp, 
    label: 'View Forecast', 
    path: '/forecast',
    description: 'See projections'
  },
  { 
    icon: Upload, 
    label: 'Import Data', 
    path: '/import',
    description: 'Import from file'
  },
];

export function QuickActions() {
  return (
    <div className="space-y-3">
      {/* Desktop: Horizontal buttons */}
      <div className="hidden sm:flex flex-wrap gap-2">
        {actions.map((action) => (
          <Link key={action.path} to={action.path}>
            <button
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                "active:scale-[0.98]",
                action.primary 
                  ? "btn-premium" 
                  : "bg-secondary/80 text-secondary-foreground hover:bg-secondary border border-border/50"
              )}
            >
              <action.icon className="h-4 w-4" />
              {action.label}
            </button>
          </Link>
        ))}
      </div>

      {/* Mobile: iOS-style 2x2 Grid with Spring Animations */}
      <motion.div 
        className="sm:hidden"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-4 gap-2">
          {actions.map((action, index) => (
            <Link 
              key={action.path} 
              to={action.path}
              onClick={() => triggerHaptic('medium')}
            >
              <motion.div
                className="flex flex-col items-center gap-1.5"
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.8 },
                  visible: { 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    transition: { ...springConfigs.bouncy, delay: index * 0.05 }
                  }
                }}
                whileTap={{ scale: 0.85, transition: springConfigs.stiff }}
                whileHover={{ scale: 1.05, transition: springConfigs.gentle }}
              >
                <motion.div 
                  className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shadow-ios",
                    action.primary 
                      ? "bg-gradient-to-br from-emerald-500 to-teal-600" 
                      : "bg-card/95 backdrop-blur-xl border border-border/50"
                  )}
                  whileHover={{ 
                    boxShadow: action.primary 
                      ? "0 8px 24px -4px hsl(160 84% 39% / 0.4)" 
                      : "0 8px 24px -4px hsl(0 0% 0% / 0.15)"
                  }}
                >
                  <action.icon className={cn(
                    "h-6 w-6",
                    action.primary ? "text-accent-foreground" : "text-primary"
                  )} />
                </motion.div>
                <span className="text-[11px] font-medium text-center leading-tight">
                  {action.label}
                </span>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
