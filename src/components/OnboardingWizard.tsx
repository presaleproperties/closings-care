import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Plus, Sparkles, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import { PROVINCES, PROVINCE_NAMES, Province } from '@/lib/taxCalculator';
import { cn } from '@/lib/utils';

interface OnboardingWizardProps {
  open: boolean;
  onComplete: () => void;
}

export function OnboardingWizard({ open, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [province, setProvince] = useState<Province>('BC');
  const navigate = useNavigate();
  const updateSettings = useUpdateSettings();

  const handleComplete = async () => {
    // Save province setting - use upsert to create if not exists
    try {
      await updateSettings.mutateAsync({
        province,
        country: 'CA',
      } as any);
    } catch (error) {
      // If update fails, settings may not exist yet - that's ok, dashboard will handle it
      console.log('Settings update during onboarding:', error);
    }
    onComplete();
  };

  const handleAddDeal = () => {
    onComplete();
    navigate('/deals/new');
  };

  const totalSteps = 3;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg p-0 overflow-hidden [&>button]:hidden">
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        <div className="p-8">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="text-center animate-fade-in">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                <Building2 className="w-10 h-10 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Welcome to dealzflow!</h2>
              <p className="text-muted-foreground mb-8">
                Let's get you set up in just a few steps. Track your deals, forecast income, and stay on top of your commissions.
              </p>
              
              <div className="space-y-3 text-left mb-8">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-success" />
                  </div>
                  <span className="text-sm">Track all your real estate deals</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-success" />
                  </div>
                  <span className="text-sm">12-month income & expense forecasting</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-success" />
                  </div>
                  <span className="text-sm">Canadian tax bracket calculations</span>
                </div>
              </div>

              <Button onClick={() => setStep(2)} className="w-full btn-premium h-12">
                Get Started
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 2: Province Selection */}
          {step === 2 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Where do you work?</h2>
                  <p className="text-sm text-muted-foreground">We'll use this for accurate tax calculations</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-8 max-h-[300px] overflow-y-auto pr-2">
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
                    <span className={cn(
                      "text-sm font-medium",
                      province === prov && "text-primary"
                    )}>
                      {PROVINCE_NAMES[prov]}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12">
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1 btn-premium h-12">
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: First Deal */}
          {step === 3 && (
            <div className="text-center animate-fade-in">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-accent to-amber-400 flex items-center justify-center shadow-lg shadow-accent/20">
                <Sparkles className="w-10 h-10 text-accent-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-3">You're all set!</h2>
              <p className="text-muted-foreground mb-8">
                Your account is ready. Add your first deal to start tracking your commissions, or explore the dashboard first.
              </p>

              <div className="space-y-3">
                <Button onClick={handleAddDeal} className="w-full btn-premium h-12">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Deal
                </Button>
                <Button variant="outline" onClick={handleComplete} className="w-full h-12">
                  Explore Dashboard First
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}