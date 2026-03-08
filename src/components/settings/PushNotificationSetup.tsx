import { Bell, BellOff, BellRing, Loader2, Smartphone, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { cn } from '@/lib/utils';

export function PushNotificationSetup() {
  const { isSupported, permissionState, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-muted/30">
        <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium">Not supported on this browser</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Push notifications require a modern browser. On iPhone, you must add the app to your Home Screen first (Safari → Share → Add to Home Screen), then re-open it.
          </p>
        </div>
      </div>
    );
  }

  if (permissionState === 'denied') {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5">
        <BellOff className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-destructive">Notifications blocked</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            You've blocked notifications for this site. To re-enable: go to your phone's Settings → Safari/Chrome → Notifications → find this site and allow.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status row */}
      <div className={cn(
        "flex items-center justify-between p-4 rounded-xl border transition-all",
        isSubscribed
          ? "border-primary/30 bg-primary/5"
          : "border-border/50 bg-muted/20"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            isSubscribed ? "bg-primary/10" : "bg-muted"
          )}>
            {isSubscribed
              ? <BellRing className="w-5 h-5 text-primary" />
              : <Bell className="w-5 h-5 text-muted-foreground" />
            }
          </div>
          <div>
            <p className="text-sm font-semibold">
              {isSubscribed ? 'Push notifications active' : 'Push notifications off'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isSubscribed
                ? 'You\'ll get alerts even when the app is closed'
                : 'Tap enable to get alerts on this device'
              }
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant={isSubscribed ? "outline" : "default"}
          onClick={isSubscribed ? unsubscribe : subscribe}
          disabled={isLoading}
          className={cn("shrink-0", !isSubscribed && "btn-premium")}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isSubscribed ? (
            'Disable'
          ) : (
            'Enable'
          )}
        </Button>
      </div>

      {/* What you'll get */}
      {isSubscribed && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">You'll receive</p>
          <div className="space-y-2">
            {[
              { emoji: '🔥', label: 'Hot client follow-ups', freq: 'Daily at 9 AM' },
              { emoji: '☀️', label: 'Warm client follow-ups', freq: 'Every Monday at 9 AM' },
              { emoji: '📅', label: 'Deals closing within 7 days', freq: 'Daily check' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-card/40">
                <span className="text-lg">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.freq}</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* iPhone tip */}
      {!isSubscribed && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/40">
          <Smartphone className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">iPhone users:</strong> You must add Dealzflow to your Home Screen first (Safari → Share → Add to Home Screen), then open it from there before enabling push notifications.
          </p>
        </div>
      )}
    </div>
  );
}
