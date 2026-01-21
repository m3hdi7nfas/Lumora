import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext'; // Make sure this import is correct
import { Loader2 } from 'lucide-react';
import ModeratorDashboard from '@/components/dashboards/ModeratorDashboard';
import TeacherDashboard from '@/components/dashboards/TeacherDashboard';
import StudentDashboard from '@/components/dashboards/StudentDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import ErrorBoundary from '@/components/ErrorBoundary';

class DashboardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Dashboard Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-destructive">Dashboard Error</h2>
            <p className="text-muted-foreground">An error occurred while loading the dashboard</p>
            <p className="text-sm text-muted-foreground mt-2">
              Error: {this.state.error?.message || 'Unknown error'}
            </p>
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
  const [dashboardError, setDashboardError] = useState<Error | null>(null);

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
    return null; // Will redirect to login
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your profile...</p>
          {profileTimeout && (
            <p className="text-sm text-muted-foreground mt-2">
              Taking longer than expected. Please wait or try refreshing.
            </p>
          )}
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
    try {
      switch (effectiveRole) {
        case 'admin':
          console.log('Rendering AdminDashboard');
          return <AdminDashboard />;
        case 'moderator':
          console.log('Rendering ModeratorDashboard');
          return <ModeratorDashboard />;
        case 'teacher':
          console.log('Rendering TeacherDashboard');
          return <TeacherDashboard />;
        case 'student':
          console.log('Rendering StudentDashboard');
          return <StudentDashboard />;
        default:
          console.log('Defaulting to TeacherDashboard');
          return <TeacherDashboard />;
      }
    } catch (error) {
      console.error('Error rendering dashboard:', error);
      setDashboardError(error as Error);
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-destructive">Dashboard Error</h2>
            <p className="text-muted-foreground">An error occurred while loading the dashboard</p>
            <p className="text-sm text-muted-foreground mt-2">
              Error: {error.message}
            </p>
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
  };

  if (dashboardError) {
    return renderDashboard();
  }

  return (
    <DashboardErrorBoundary>
      {renderDashboard()}
    </DashboardErrorBoundary>
  );
}