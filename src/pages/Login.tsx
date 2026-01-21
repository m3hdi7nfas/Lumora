import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
// ... other imports

export default function Login() {
  // ... existing state
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await signIn(email, password);

      if (signInError) {
        setError(signInError.message || 'Login failed');
        toast({
          title: 'Login failed',
          description: signInError.message || 'An unknown error occurred',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Welcome back!',
          description: 'Successfully logged in.',
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login exception:', error);
      setError('An unexpected error occurred');
      toast({
        title: 'Login failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // ... rest of the component

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* ... existing UI code */}

      {/* Add error display */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        </div>
      )}

      {/* ... rest of the UI */}
    </div>
  );
}