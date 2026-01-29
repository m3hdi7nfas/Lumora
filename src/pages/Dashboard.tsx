import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import ModeratorDashboard from '@/components/dashboards/ModeratorDashboard';
import TeacherDashboard from '@/components/dashboards/TeacherDashboard';
import StudentDashboard from '@/components/dashboards/StudentDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error: error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Dashboard Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-destructive">Something went wrong</h2>
            <p className="text-muted-foreground">An error occurred while loading the dashboard</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function Dashboard() {
  const { user, profile, loading, currentView } = useAuth();
  const navigate = useNavigate();
  const [profileTimeout, setProfileTimeout] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Set a timeout to show message if profile takes too long
  useEffect(() => {
    if (user && !profile && !loading) {
      const timer = setTimeout(() => {
        setProfileTimeout(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [user, profile, loading]);

  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const loadingMessages = [
    "Preparing your workspace...",
    "Syncing your learning data...",
    "Unlocking Lumora features...",
    "Readying your toolkit...",
    "Connecting to the cloud...",
    "Finalizing setup..."
  ];

  useEffect(() => {
    if (loading || (user && !profile)) {
      const interval = setInterval(() => {
        setLoadingMsgIndex(prev => (prev + 1) % loadingMessages.length);
      }, 800);
      return () => clearInterval(interval);
    }
  }, [loading, user, profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="relative text-center space-y-6 max-w-sm px-4">
          <div className="relative inline-block">
            <div className="absolute inset-0 blur-2xl bg-primary/20 animate-pulse" />
            <Loader2 className="w-16 h-16 animate-spin text-primary relative z-10 mx-auto" strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-display font-bold animate-in fade-in slide-in-from-bottom-2 duration-500">
              Welcome back to Lumora
            </h2>
            <p className="text-muted-foreground animate-pulse text-sm font-medium h-4">
              {loadingMessages[loadingMsgIndex]}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="relative text-center space-y-6 max-w-sm px-4">
          <div className="relative inline-block">
            <div className="absolute inset-0 blur-2xl bg-primary/20 animate-pulse" />
            <Loader2 className="w-16 h-16 animate-spin text-primary relative z-10 mx-auto" strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-display font-bold animate-in fade-in slide-in-from-bottom-2 duration-500">
              Authorizing Profile
            </h2>
            <p className="text-muted-foreground animate-pulse text-sm font-medium h-4">
              {loadingMessages[loadingMsgIndex]}
            </p>
            {profileTimeout && (
              <p className="text-xs text-muted-foreground mt-4 animate-in fade-in duration-700">
                Taking longer than expected. Please wait or try refreshing.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Determine which dashboard to show based on currentView or profile role
  const effectiveRole = currentView || profile.role;

  // Debug log to see what role we're getting
  console.log('Effective role:', effectiveRole);
  console.log('Profile role:', profile.role);
  console.log('Current view:', currentView);

  // Wrap dashboards in error boundaries
  const renderDashboard = () => {
    switch (effectiveRole) {
      case 'admin':
        console.log('Rendering AdminDashboard');
        return (
          <ErrorBoundary>
            <AdminDashboard />
          </ErrorBoundary>
        );
      case 'moderator':
        console.log('Rendering ModeratorDashboard');
        return (
          <ErrorBoundary>
            <ModeratorDashboard />
          </ErrorBoundary>
        );
      case 'teacher':
        console.log('Rendering TeacherDashboard');
        return (
          <ErrorBoundary>
            <TeacherDashboard />
          </ErrorBoundary>
        );
      case 'student':
        console.log('Rendering StudentDashboard');
        return (
          <ErrorBoundary>
            <StudentDashboard />
          </ErrorBoundary>
        );
      default:
        console.log('Defaulting to TeacherDashboard');
        return (
          <ErrorBoundary>
            <TeacherDashboard />
          </ErrorBoundary>
        );
    }
  };

  return renderDashboard();
}