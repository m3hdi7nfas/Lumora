import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
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

  // Determine which dashboard to show based on profile role
  const renderDashboard = () => {
    try {
      switch (profile.role) {
        case 'admin':
          return <AdminDashboard />;
        case 'moderator':
          return <ModeratorDashboard />;
        case 'teacher':
          return <TeacherDashboard />;
        case 'student':
          return <StudentDashboard />;
        default:
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
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Demo buttons at the top */}
        <div className="p-4 border-b border-border/50">
          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.setItem('lumora_current_view', 'admin');
                window.location.reload();
              }}
            >
              Admin View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.setItem('lumora_current_view', 'moderator');
                window.location.reload();
              }}
            >
              Moderator View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.setItem('lumora_current_view', 'teacher');
                window.location.reload();
              }}
            >
              Teacher View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.setItem('lumora_current_view', 'student');
                window.location.reload();
              }}
            >
              Student View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.removeItem('lumora_current_view');
                window.location.reload();
              }}
            >
              Reset View
            </Button>
          </div>
        </div>

        {/* Main dashboard content */}
        <div className="p-6">
          {renderDashboard()}
        </div>
      </div>
    </ErrorBoundary>
  );
}

// Dashboard components
function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Manage all users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Schools</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Manage educational institutions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Competitions</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Manage competitions</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ModeratorDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Moderator Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Content Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Review and approve content</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p>View system reports</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TeacherDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Teacher Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Manage your classes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Create and grade assignments</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StudentDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Student Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <p>View your enrolled courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <p>View and submit assignments</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Card component for consistency
function Card({ children }) {
  return (
    <div className="bg-card rounded-lg border border-border/50 p-6 shadow-sm">
      {children}
    </div>
  );
}

function CardHeader({ children }) {
  return (
    <div className="mb-4">
      {children}
    </div>
  );
}

function CardTitle({ children }) {
  return (
    <h3 className="text-xl font-semibold">{children}</h3>
  );
}

function CardContent({ children }) {
  return (
    <div className="text-muted-foreground">
      {children}
    </div>
  );
}