import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Download, Smartphone, Check, Share, Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for the beforeinstallprompt event (Android/Desktop Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold mb-3">App Installed!</h1>
          <p className="text-muted-foreground mb-6">
            Dealzflow is now on your home screen. Open it anytime for instant access.
          </p>
          <Link to="/dashboard">
            <Button className="btn-premium">
              Open Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50 safe-top">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
        </div>
      </header>

      <main className="px-6 py-10 max-w-lg mx-auto">
        {/* App Icon */}
        <div className="flex justify-center mb-8">
          <img 
            src="/favicon.png" 
            alt="Dealzflow" 
            className="w-24 h-24 rounded-[22px] shadow-xl"
          />
        </div>

        <h1 className="text-3xl font-bold text-center mb-3">
          Install Dealzflow
        </h1>
        <p className="text-muted-foreground text-center mb-10">
          Add to your home screen for the best experience — works offline and loads instantly.
        </p>

        {/* iOS Instructions */}
        {isIOS && (
          <div className="bg-card rounded-2xl border border-border p-6 mb-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              Install on iPhone/iPad
            </h2>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold">1</span>
                <div>
                  <p className="font-medium">Tap the Share button</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    Look for <Share className="w-4 h-4" /> at the bottom of Safari
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold">2</span>
                <div>
                  <p className="font-medium">Scroll and tap "Add to Home Screen"</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    Look for <Plus className="w-4 h-4" /> Add to Home Screen
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold">3</span>
                <div>
                  <p className="font-medium">Tap "Add" to confirm</p>
                  <p className="text-sm text-muted-foreground">
                    Dealzflow will appear on your home screen
                  </p>
                </div>
              </li>
            </ol>
          </div>
        )}

        {/* Android/Desktop Install Button */}
        {!isIOS && deferredPrompt && (
          <Button 
            onClick={handleInstallClick}
            className="w-full h-14 text-lg font-semibold btn-premium mb-6"
          >
            <Download className="w-5 h-5 mr-2" />
            Install App
          </Button>
        )}

        {/* Android manual instructions if no prompt */}
        {!isIOS && !deferredPrompt && (
          <div className="bg-card rounded-2xl border border-border p-6 mb-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              Install on Android
            </h2>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold">1</span>
                <div>
                  <p className="font-medium">Tap the menu button</p>
                  <p className="text-sm text-muted-foreground">
                    The three dots (⋮) in Chrome's top-right corner
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold">2</span>
                <div>
                  <p className="font-medium">Tap "Install app" or "Add to Home Screen"</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold">3</span>
                <div>
                  <p className="font-medium">Confirm the installation</p>
                  <p className="text-sm text-muted-foreground">
                    Dealzflow will appear on your home screen
                  </p>
                </div>
              </li>
            </ol>
          </div>
        )}

        {/* Benefits */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Check className="w-5 h-5 text-success" />
            <span>Works offline — check your finances anywhere</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Check className="w-5 h-5 text-success" />
            <span>Loads instantly — no browser delays</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Check className="w-5 h-5 text-success" />
            <span>Full-screen experience — no browser bars</span>
          </div>
        </div>

        {/* Skip link */}
        <div className="mt-10 text-center">
          <Link to="/dashboard" className="text-muted-foreground text-sm hover:text-foreground transition-colors">
            Skip for now →
          </Link>
        </div>
      </main>
    </div>
  );
}
