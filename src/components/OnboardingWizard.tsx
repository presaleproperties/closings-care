import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, ChevronRight, Check, Plug, Key, Eye, EyeOff, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import { PROVINCES, PROVINCE_NAMES, Province } from '@/lib/taxCalculator';
import { useUpsertConnection, useSyncPlatform, usePlatformConnections } from '@/hooks/usePlatformConnections';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface OnboardingWizardProps {
  open: boolean;
  onComplete: () => void;
}

export function OnboardingWizard({ open, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [province, setProvince] = useState<Province>('BC');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const navigate = useNavigate();
  const updateSettings = useUpdateSettings();
  const upsertConnection = useUpsertConnection();
  const syncPlatform = useSyncPlatform();
  const { data: connections = [] } = usePlatformConnections();

  const existingConnection = connections.find(c => c.platform === 'real_broker');

  const handleComplete = async () => {
    try {
      await updateSettings.mutateAsync({ province, country: 'CA' } as any);
    } catch (error) {
      // Settings may not exist yet — dashboard will handle
    }
    onComplete();
  };

  const handleConnectReZen = async () => {
    if (!apiKey.trim()) return;
    setIsConnecting(true);
    try {
      const conn = await upsertConnection.mutateAsync({
        platform: 'real_broker',
        api_key: apiKey.trim(),
      });
      // Kick off initial sync
      try {
        await syncPlatform.mutateAsync({ platform: 'real_broker', connectionId: conn.id });
      } catch {
        // Sync errors are non-fatal during onboarding
      }
      setConnected(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to connect');
    } finally {
      setIsConnecting(false);
    }
  };

  const totalSteps = 4;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg p-0 [&>button]:hidden flex flex-col max-h-[90dvh] overflow-hidden">
        {/* Progress bar — pinned at top, never scrolls */}
        <div className="h-1 bg-muted shrink-0">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Scrollable body */}
        <div className="p-5 sm:p-8 overflow-y-auto flex-1 min-h-0">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="text-center animate-fade-in">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                <Building2 className="w-10 h-10 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Welcome to dealzflow!</h2>
              <p className="text-muted-foreground mb-8">
                Built for Real Broker agents. Connect your ReZen account and get instant clarity on your commissions, taxes, and cashflow.
              </p>

              <div className="space-y-3 text-left mb-8">
                {[
                  'Auto-sync deals from ReZen in seconds',
                  'Real-time net take-home & tax calculations',
                  'Revenue share tracking across your network',
                  '12-month cashflow forecasting',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>

              <Button onClick={() => setStep(2)} className="w-full btn-premium h-12">
                Get Started <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 2: Province */}
          {step === 2 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Where do you work?</h2>
                  <p className="text-sm text-muted-foreground">Used for accurate tax bracket calculations</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-6 max-h-[200px] sm:max-h-[300px] overflow-y-auto pr-2">
                {PROVINCES.map((prov) => (
                  <button
                    key={prov}
                    onClick={() => setProvince(prov)}
                    className={cn(
                      "p-3 rounded-xl border-2 text-left transition-all",
                      province === prov
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <span className={cn("text-sm font-medium", province === prov && "text-primary")}>
                      {PROVINCE_NAMES[prov]}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12">Back</Button>
                <Button onClick={() => setStep(3)} className="flex-1 btn-premium h-12">
                  Continue <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Connect ReZen */}
          {step === 3 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Plug className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Connect ReZen</h2>
                  <p className="text-sm text-muted-foreground">Sync your transactions automatically</p>
                </div>
              </div>

              {connected || existingConnection ? (
                <div className="mb-6 p-4 rounded-xl bg-success/10 border border-success/20 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-success">ReZen Connected!</p>
                    <p className="text-xs text-muted-foreground">Your transactions are syncing in the background</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-4 p-4 rounded-xl bg-muted/50 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">How to get your ReZen API key:</p>
                    <ol className="space-y-1 list-decimal list-inside">
                      <li>Log in at <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">app.therealbrokerage.com</span></li>
                      <li>Go to <strong>Profile → API Keys</strong></li>
                      <li>Create a new key and paste it below</li>
                    </ol>
                  </div>

                  <div className="space-y-3 mb-6">
                    <Label>ReZen API Key</Label>
                    <div className="relative">
                      <Input
                        type={showKey ? 'text' : 'password'}
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                        placeholder="Paste your API key here"
                        className="pr-10 h-12 font-mono text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={handleConnectReZen}
                    disabled={!apiKey.trim() || isConnecting}
                    className="w-full btn-premium h-12 mb-3"
                  >
                    {isConnecting ? (
                      <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Connecting & syncing...</>
                    ) : (
                      <><Plug className="w-4 h-4 mr-2" /> Connect ReZen</>
                    )}
                  </Button>
                </>
              )}

              <div className="flex gap-3 mt-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-11">Back</Button>
                <Button
                  variant={connected || existingConnection ? 'default' : 'ghost'}
                  onClick={() => setStep(4)}
                  className="flex-1 h-11"
                >
                  {connected || existingConnection ? <>Continue <ChevronRight className="w-4 h-4 ml-1" /></> : 'Skip for now'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: All set */}
          {step === 4 && (
            <div className="text-center animate-fade-in">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-accent to-warning flex items-center justify-center shadow-lg shadow-accent/20">
                <Sparkles className="w-10 h-10 text-accent-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-3">You're all set!</h2>
              <p className="text-muted-foreground mb-2">
                {connected || existingConnection
                  ? 'Your ReZen data is syncing. Head to your dashboard to see your deals, income, and tax projections.'
                  : 'Your account is ready. You can connect ReZen anytime from Settings → Integrations.'}
              </p>

              {!(connected || existingConnection) && (
                <p className="text-xs text-muted-foreground mb-6">
                  Without ReZen connected, you can add deals manually from the Deals page.
                </p>
              )}

              <div className="space-y-3 mt-6">
                <Button onClick={handleComplete} className="w-full btn-premium h-12">
                  Go to Dashboard
                </Button>
                {!(connected || existingConnection) && (
                  <Button variant="outline" onClick={() => setStep(3)} className="w-full h-11">
                    <Plug className="w-4 h-4 mr-2" /> Connect ReZen now
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
