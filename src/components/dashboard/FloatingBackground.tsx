import { motion } from 'framer-motion';

export function FloatingBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Top right emerald orb */}
      <motion.div
        className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-emerald-400/15 to-teal-400/10 dark:from-emerald-500/10 dark:to-teal-500/5 rounded-full blur-3xl"
        animate={{ 
          y: [0, -30, 0], 
          scale: [1, 1.05, 1],
          rotate: [0, 5, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Left side teal orb */}
      <motion.div
        className="absolute top-1/4 -left-32 w-72 h-72 bg-gradient-to-br from-teal-400/12 to-cyan-400/8 dark:from-teal-500/8 dark:to-cyan-500/4 rounded-full blur-3xl"
        animate={{ 
          y: [0, 25, 0], 
          x: [0, 15, 0],
          scale: [1, 0.95, 1] 
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      
      {/* Bottom center accent orb */}
      <motion.div
        className="absolute bottom-10 right-1/4 w-80 h-80 bg-gradient-to-br from-amber-400/8 to-orange-400/5 dark:from-amber-500/5 dark:to-orange-500/3 rounded-full blur-3xl"
        animate={{ 
          x: [0, 20, 0], 
          y: [0, -15, 0],
          scale: [1, 1.08, 1]
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Subtle grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(158 64% 32%) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />
    </div>
  );
}
