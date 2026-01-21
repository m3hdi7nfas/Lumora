import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function DashboardSimple() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-6">Welcome to Lumora</h1>

          <div className="bg-card rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">User Information</h2>
            <div className="space-y-2">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Role:</strong> {profile?.role}</p>
              <p><strong>Name:</strong> {profile?.display_name}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={() => navigate('/')} variant="outline">
              Back to Home
            </Button>
            <Button onClick={() => {
              localStorage.removeItem('lumora_current_user');
              navigate('/login');
            }} variant="destructive">
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}