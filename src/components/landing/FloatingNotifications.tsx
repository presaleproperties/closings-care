import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { CheckCircle2, DollarSign, TrendingUp, Bell, Zap, Home } from 'lucide-react';

interface Notification {
  id: number;
  icon: typeof CheckCircle2;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  amount?: string;
  amountColor?: string;
}

const notifications: Notification[] = [
  {
    id: 1,
    icon: CheckCircle2,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    title: 'Deal Closed',
    subtitle: '1847 Oak Street, Vancouver',
    amount: '+$18,400',
    amountColor: 'text-emerald-600'
  },
  {
    id: 2,
    icon: DollarSign,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    title: 'Payout Received',
    subtitle: 'Advance from Concord Pacific',
    amount: '+$6,200',
    amountColor: 'text-emerald-600'
  },
  {
    id: 3,
    icon: TrendingUp,
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    title: 'Cap Progress Updated',
    subtitle: 'Now at 84% of brokerage cap',
    amount: '$67,200 / $80K',
    amountColor: 'text-teal-600'
  },
  {
    id: 4,
    icon: Bell,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    title: 'Safe to Spend Updated',
    subtitle: 'Your runway increased',
    amount: '$7,750 → $8,900',
    amountColor: 'text-emerald-600'
  },
  {
    id: 5,
    icon: Zap,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    title: 'Tax Reserve Adjusted',
    subtitle: 'Auto-calculated from new deal',
    amount: '+$5,520 set aside',
    amountColor: 'text-purple-600'
  },
  {
    id: 6,
    icon: Home,
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    title: 'New Deal Added',
    subtitle: 'Presale at Brentwood Tower',
    amount: '$24,000 GCI',
    amountColor: 'text-rose-600'
  }
];

export function FloatingNotifications() {
  const [activeNotifications, setActiveNotifications] = useState<Notification[]>([]);
  const [notificationIndex, setNotificationIndex] = useState(0);

  useEffect(() => {
    const addNotification = () => {
      const notification = notifications[notificationIndex % notifications.length];
      const uniqueNotification = { ...notification, id: Date.now() };
      
      setActiveNotifications(prev => {
        const updated = [...prev, uniqueNotification];
        // Keep only the last 2 notifications visible
        return updated.slice(-2);
      });
      
      setNotificationIndex(prev => prev + 1);

      // Remove the notification after 3.5 seconds
      setTimeout(() => {
        setActiveNotifications(prev => 
          prev.filter(n => n.id !== uniqueNotification.id)
        );
      }, 3500);
    };

    // Start after 1.5 seconds
    const initialTimeout = setTimeout(() => {
      addNotification();
    }, 1500);

    // Add new notifications every 2.5 seconds
    const interval = setInterval(addNotification, 2500);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [notificationIndex]);

  return (
    <div className="absolute -right-2 top-16 w-64 space-y-2 z-20 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {activeNotifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 80, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              x: 0, 
              scale: 1,
              y: index * -4 // Slight stacking effect
            }}
            exit={{ 
              opacity: 0, 
              x: 60, 
              scale: 0.9,
              transition: { duration: 0.3, ease: "easeIn" }
            }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 30,
              mass: 0.8
            }}
            className="bg-white rounded-xl shadow-lg shadow-slate-200/80 border border-slate-100 p-3 pointer-events-auto"
            style={{
              boxShadow: '0 4px 20px -4px rgba(0,0,0,0.1), 0 8px 32px -8px rgba(0,0,0,0.08)'
            }}
          >
            <div className="flex items-start gap-3">
              <div className={`${notification.iconBg} rounded-lg p-2 flex-shrink-0`}>
                <notification.icon className={`h-4 w-4 ${notification.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {notification.title}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {notification.subtitle}
                </p>
                {notification.amount && (
                  <p className={`text-xs font-bold ${notification.amountColor} mt-0.5`}>
                    {notification.amount}
                  </p>
                )}
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1"
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
