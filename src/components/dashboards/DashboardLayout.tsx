import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  LayoutDashboard,
  Users,
  Trophy,
  FileQuestion,
  CheckSquare,
  MessageSquare,
  Settings,
  LogOut,
  User,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import ErrorBoundary from '@/components/ErrorBoundary';

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  title: string;
  onNavItemClick?: (itemId: string) => void;
}

export function DashboardLayout({ children, sidebar, title, onNavItemClick }: DashboardLayoutProps) {
  const { user, profile, signOut, setCurrentView } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive',
      });
    }
  };

  const previewViews = [
    { id: 'admin', name: 'Admin View', icon: <Users className="w-4 h-4 mr-2" /> },
    { id: 'moderator', name: 'Moderator View', icon: <CheckSquare className="w-4 h-4 mr-2" /> },
    { id: 'teacher', name: 'Teacher View', icon: <Trophy className="w-4 h-4 mr-2" /> },
    { id: 'student', name: 'Student View', icon: <FileQuestion className="w-4 h-4 mr-2" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      <ErrorBoundary>
        {/* Top navigation */}
        <header className="fixed top-0 left-0 right-0 h-16 border-b border-border bg-card z-50">
          <div className="flex items-center justify-between h-full px-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo and title */}
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-primary" />
              <span className="font-display font-bold text-lg hidden sm:block">{title}</span>
            </div>

            {/* User menu and actions */}
            <div className="flex items-center gap-4">
              {/* Preview views dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="hidden md:flex">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Views
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {previewViews.map((view) => (
                    <DropdownMenuItem
                      key={view.id}
                      onClick={() => {
                        setCurrentView(view.id);
                        navigate('/dashboard');
                      }}
                    >
                      {view.icon}
                      {view.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback>{profile?.display_name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block">{profile?.display_name || 'User'}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => navigate('/dashboard?tab=profile')}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Mobile sidebar */}
        {mobileMenuOpen && isMobile && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden">
            <div className="w-64 h-full bg-card border-r border-border/50">
              {sidebar}
            </div>
          </div>
        )}

        {/* Main content area */}
        <div className="pt-16 flex min-h-screen">
          {/* Desktop sidebar */}
          <div className="hidden md:block">
            {sidebar}
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
}