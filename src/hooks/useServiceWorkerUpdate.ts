import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

export function useServiceWorkerUpdate() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Poll every 60s for updates
      if (r) {
        setInterval(() => r.update(), 60_000);
      }
    },
  });

  return {
    updateAvailable: needRefresh,
    applyUpdate: () => updateServiceWorker(true),
  };
}
