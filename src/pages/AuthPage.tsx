import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Building2, Eye, EyeOff, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'reset' ? 'reset' : 'login';
  
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { signIn, signUp, resetPassword, updatePassword } = useAuth();
  const navigate = useNavigate();

  // Check if we're in password reset mode
  useEffect(() => {
    if (searchParams.get('mode') === 'reset') {
      setMode('reset');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate('/dashboard');
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        navigate('/dashboard');
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) throw error;
        setSuccess('Check your email for a password reset link');
      } else if (mode === 'reset') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        const { error } = await updatePassword(password);
        if (error) throw error;
        setSuccess('Password updated successfully! Redirecting...');
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Welcome back';
      case 'signup': return 'Create your account';
      case 'forgot': return 'Reset your password';
      case 'reset': return 'Set new password';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'login': return 'Enter your credentials to access your dashboard';
      case 'signup': return 'Get started with Commission Tracker today';
      case 'forgot': return "Enter your email and we'll send you a reset link";
      case 'reset': return 'Choose a strong password for your account';
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-500 to-teal-600 p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/20 shadow-lg shadow-black/10 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-semibold text-white">
            Commission Tracker
          </span>
        </div>

        <div>
          <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
            Track your real estate commissions with ease
          </h2>
          <p className="text-lg text-white/80">
            Manage deals, forecast cashflow, and stay on top of your income — all in one place.
          </p>
        </div>

        <div className="flex gap-4 text-sm text-white/60">
          <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
        </div>
      </div>

      {/* Right side - auth form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile logo - iOS style centered */}
          <div className="lg:hidden flex flex-col items-center gap-3 mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight">Commission Tracker</span>
          </div>

          {/* Back button for forgot/reset modes */}
          {(mode === 'forgot' || mode === 'reset') && (
            <button
              onClick={() => setMode('login')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </button>
          )}

          <h1 className="text-2xl lg:text-2xl font-bold mb-2 text-center lg:text-left">
            {getTitle()}
          </h1>
          <p className="text-muted-foreground mb-8 text-center lg:text-left text-[15px]">
            {getSubtitle()}
          </p>

          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-success/10 border border-success/20 rounded-xl text-sm text-success flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-[15px]">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Smith"
                  required={mode === 'signup'}
                  className="h-12"
                />
              </div>
            )}

            {mode !== 'reset' && (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[15px]">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="h-12"
                />
              </div>
            )}

            {(mode === 'login' || mode === 'signup' || mode === 'reset') && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[15px]">
                  {mode === 'reset' ? 'New Password' : 'Password'}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="h-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground active:opacity-50 transition-opacity"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'reset' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[15px]">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="h-12"
                />
              </div>
            )}

            {mode === 'login' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setError('');
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 text-[15px] font-semibold btn-premium mt-2" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                  Please wait...
                </span>
              ) : mode === 'login' ? (
                'Sign In'
              ) : mode === 'signup' ? (
                'Create Account'
              ) : mode === 'forgot' ? (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Reset Link
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </form>

          {(mode === 'login' || mode === 'signup') && (
            <p className="mt-8 text-center text-[15px] text-muted-foreground">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setError('');
                }}
                className="text-primary font-semibold active:opacity-50 transition-opacity"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          )}

          {/* Legal links for mobile */}
          <div className="lg:hidden flex justify-center gap-4 mt-8 text-sm text-muted-foreground">
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}