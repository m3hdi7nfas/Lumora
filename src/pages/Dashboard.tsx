import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import ModeratorDashboard from '@/components/dashboards/ModeratorDashboard';
import TeacherDashboard from '@/components/dashboards/TeacherDashboard';
import StudentDashboard from '@/components/dashboards/StudentDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';

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

  // Debug log to see what role we're getting
  console.log('Effective role:', effectiveRole);
  console.log('Profile role:', profile.role);
  console.log('Current view:', currentView);

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
}