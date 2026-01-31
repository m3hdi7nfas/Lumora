import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Eye, EyeOff, Loader2, Shield, BookOpen, User, ArrowLeft, Crown, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { AdBanner } from '@/components/ads/AdBanner';
import { ContactDialog } from '@/components/landing/ContactDialog';
import { Logo } from '@/components/ui/Logo';


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const { signIn, signInWithMicrosoft, user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Automatic redirection when auth is ready
  useEffect(() => {
    if (user && profile && !authLoading) {
      console.log('User detected, auto-redirecting to dashboard...');
      navigate('/dashboard');
    }
  }, [user, profile, authLoading, navigate]);

  const handleMicrosoftLogin = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithMicrosoft();

      if (error) {
        toast({
          title: 'Login failed',
          description: error.message || 'An unknown error occurred',
          variant: 'destructive',
        });
        setLoading(false);
      } else {
        toast({
          title: 'Success!',
          description: 'Logged in with Microsoft. Redirecting...',
        });
        navigate('/dashboard');
      }
    } catch (e: any) {
      setLoading(false);
    }
  };

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


  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero opacity-5" />
      <div className="absolute top-20 left-20 w-96 h-96 bg-accent/5 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-primary/5 rounded-full blur-xl animate-float" style={{ animationDelay: '-2s' }} />

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
            <Link to="/" className="inline-flex items-center gap-6 justify-center mb-1">
              <Logo size="lg" textSize="xl" />
            </Link>
            <CardTitle className="text-2xl font-display">Welcome!</CardTitle>
            <CardDescription className="text-sm">
              Sign in to continue your learning journey
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pb-4 px-6">
            <Button
              onClick={handleMicrosoftLogin}
              className="w-full h-11 text-sm bg-white text-black hover:bg-gray-50 border border-border shadow-sm flex items-center justify-center gap-3 transition-all hover:scale-[1.02]"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 23 23">
                    <path fill="#f3f3f3" d="M0 0h23v23H0z" />
                    <path fill="#f35325" d="M1 1h10v10H1z" />
                    <path fill="#81bc06" d="M12 1h10v10H12z" />
                    <path fill="#05a6f0" d="M1 12h10v10H1z" />
                    <path fill="#ffba08" d="M12 12h10v10H12z" />
                  </svg>
                  Login with Microsoft
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or sign in with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-9 text-sm variant-outline hover:bg-muted transition-transform mt-1"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="text-center space-y-2">
              <p className="text-center text-xs text-muted-foreground">
                Don't have an account?
              </p>
              <Button
                variant="link"
                size="sm"
                className="text-xs h-auto p-0 text-muted-foreground hover:text-primary"
                onClick={() => setContactOpen(true)}
              >
                <Mail className="w-3 h-3 mr-1" />
                Contact Administration
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Ad Banner */}
      <AdBanner />

      {/* Contact Dialog */}
      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
    </div>
  );
}