import { motion } from 'framer-motion';

export function FloatingBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Top right primary orb */}
      <motion.div
        className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-gradient-to-br from-primary/12 to-primary/5 rounded-full blur-3xl"
        animate={{ 
          y: [0, -40, 0], 
          scale: [1, 1.05, 1],
          rotate: [0, 5, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Left side accent orb */}
      <motion.div
        className="absolute top-1/4 -left-40 w-80 h-80 bg-gradient-to-br from-accent/10 to-warning/5 rounded-full blur-3xl"
        animate={{ 
          y: [0, 30, 0], 
          x: [0, 20, 0],
          scale: [1, 0.95, 1] 
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      
      {/* Bottom center subtle orb */}
      <motion.div
        className="absolute bottom-20 right-1/3 w-96 h-96 bg-gradient-to-br from-success/8 to-primary/5 rounded-full blur-3xl"
        animate={{ 
          x: [0, 25, 0], 
          y: [0, -20, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Very subtle grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.025]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 0.5px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />
    </div>
  );
}
