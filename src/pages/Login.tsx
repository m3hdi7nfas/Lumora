import { useState } from 'react';
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
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  /* 
  const handleMicrosoftLogin = async () => {
    // Disabled per user request
  };
  */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Sign in flow
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
            <Link to="/" className="flex justify-center mb-1">
              <Logo size="lg" />
            </Link>
            <CardTitle className="text-2xl font-display">
              Welcome!
            </CardTitle>
            <CardDescription className="text-sm">
              Sign in to continue your learning journey
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pb-4 px-6">
            {/* Microsoft Login Removed */}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@example.com"
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
                className="w-full h-11 text-sm gradient-hero text-white transition-all hover:scale-[1.02] mt-2 group"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="text-center space-y-2">
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
        <div className="text-center mt-4">
          <p className="text-[12px] text-muted-foreground/60 font-medium uppercase tracking-widest opacity-80">
            Established in 2024
          </p>
        </div>
      </motion.div>

      {/* Ad Banner */}
      <AdBanner />

      {/* Contact Dialog */}
      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
    </div>
  );
}