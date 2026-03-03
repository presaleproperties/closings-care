import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, X } from "lucide-react";
import { useState } from "react";
import { useServiceWorkerUpdate } from "@/hooks/useServiceWorkerUpdate";

export function UpdateBanner() {
  const { updateAvailable, applyUpdate } = useServiceWorkerUpdate();
  const [dismissed, setDismissed] = useState(false);

  if (!updateAvailable || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between gap-3 px-4 py-2.5 text-sm font-medium"
        style={{
          background: "hsl(var(--primary))",
          color: "hsl(var(--primary-foreground))",
        }}
      >
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 flex-shrink-0 animate-spin" style={{ animationDuration: "2s" }} />
          <span>A new version is available</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={applyUpdate}
            className="px-3 py-1 rounded-md text-xs font-semibold transition-all"
            style={{
              background: "hsl(var(--primary-foreground) / 0.2)",
              color: "hsl(var(--primary-foreground))",
            }}
          >
            Refresh now
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
