import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Eye, EyeOff, Loader2, Shield, BookOpen, User, ArrowLeft, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { AdBanner } from '@/components/ads/AdBanner';

// Demo credentials
const DEMO_ACCOUNTS = {
  admin: { email: 'demo.admin@lumora.com', password: 'Demo123!', role: 'admin', icon: Crown },
  moderator: { email: 'demo.moderator@lumora.com', password: 'Demo123!', role: 'moderator', icon: Shield },
  teacher: { email: 'demo.teacher@lumora.com', password: 'Demo123!', role: 'teacher', icon: BookOpen },
  student: { email: 'demo.student@lumora.com', password: 'Demo123!', role: 'student', icon: User },
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: 'Login failed',
        description: error.message || 'An unknown error occurred',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Welcome back!',
        description: 'Successfully logged in.',
      });
      navigate('/dashboard');
    }

    setLoading(false);
  };

  const handleDemoLogin = async (role: keyof typeof DEMO_ACCOUNTS) => {
    const account = DEMO_ACCOUNTS[role];
    setDemoLoading(role);

    try {
      console.log(`Attempting demo login for ${role}:`, account.email);

      // Try to sign in with the demo account
      const { error: signInError } = await signIn(account.email, account.password);

      if (!signInError) {
        console.log('Demo login successful');
        toast({
          title: `Welcome, Demo ${account.role}!`,
          description: 'Successfully logged in.',
        });
        await new Promise(resolve => setTimeout(resolve, 300));
        navigate('/dashboard');
        setDemoLoading(null);
        return;
      }

      console.error('Demo login failed:', signInError.message);
      toast({
        title: 'Demo login failed',
        description: signInError.message,
        variant: 'destructive',
      });

    } catch (err) {
      console.error('Demo login exception:', err);
      toast({
        title: 'Demo login failed',
        description: err.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    }

    setDemoLoading(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero opacity-5" />
      <div className="absolute top-20 left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Link to="/">
          <Button variant="ghost" className="mb-2 hover:bg-transparent hover:text-primary group text-sm">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Website
          </Button>
        </Link>
        <Card className="w-full shadow-card-hover border-border/50">
          <CardHeader className="text-center space-y-2 pt-4 pb-3">
            <Link to="/" className="inline-flex items-center gap-2 justify-center mb-1">
              <div className="p-2 rounded-xl gradient-hero">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
            </Link>
            <CardTitle className="text-2xl font-display">Welcome to Lumora</CardTitle>
            <CardDescription className="text-sm">
              Sign in to continue your learning journey
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pb-4 px-6">
            {/* Demo Login Section */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center font-medium">Try a demo account</p>
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(DEMO_ACCOUNTS) as Array<keyof typeof DEMO_ACCOUNTS>).map((role) => {
                  const account = DEMO_ACCOUNTS[role];
                  const Icon = account.icon;
                  return (
                    <Button
                      key={role}
                      variant="outline"
                      onClick={() => handleDemoLogin(role)}
                      disabled={demoLoading !== null || loading}
                      className="flex flex-col items-center gap-1.5 h-auto py-3 hover:bg-primary/5 hover:border-primary/30 transition-all"
                    >
                      {demoLoading === role ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Icon className="w-4 h-4 text-primary" />
                      )}
                      <span className="text-[10px] font-medium">{account.role}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="relative py-1">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-[10px] text-muted-foreground">
                or sign in with email
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@school.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-9 text-sm gradient-hero shadow-glow hover:scale-[1.02] transition-transform mt-1"
                disabled={loading || demoLoading !== null}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground">
              Don't have an account?{' '}
              <span className="text-primary font-medium">Contact your school administrator</span>
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Ad Banner */}
      <AdBanner />
    </div>
  );
}