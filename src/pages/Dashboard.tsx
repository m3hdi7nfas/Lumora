import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import ModeratorDashboard from '@/components/dashboards/ModeratorDashboard';
import TeacherDashboard from '@/components/dashboards/TeacherDashboard';
import StudentDashboard from '@/components/dashboards/StudentDashboard';

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
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

  switch (effectiveRole) {
    case 'moderator':
    case 'admin':
      return <ModeratorDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'student':
      return <StudentDashboard />;
    default:
      return <StudentDashboard />;
  }
}