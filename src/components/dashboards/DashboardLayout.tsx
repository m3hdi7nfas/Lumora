import { ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  GraduationCap,
  LogOut,
  User,
  Menu,
  X,
  Bell,
  Mail,
  ChevronRight,
  Eye,
  User as UserIcon,
  Shield,
  BookOpen,
  Crown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { ProfileDialog } from '@/components/profile/ProfileDialog';
import { AdBanner } from '@/components/ads/AdBanner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DashboardLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
  title: string;
  onNavItemClick?: () => void;
}

export function DashboardLayout({ children, sidebar, title, onNavItemClick }: DashboardLayoutProps) {
  const { profile, signOut, currentView, setCurrentView, isAdminOrModerator, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Clear preloaded notifications - start with empty array
  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const initials = profile?.display_name
    ? profile.display_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : profile?.email?.substring(0, 2).toUpperCase() || 'U';

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNavItemClick = () => {
    // Close sidebar on mobile when clicking a navigation item
    if (window.innerWidth < 1024) { // lg breakpoint
      setSidebarOpen(false);
    }
    // Call the optional callback if provided
    onNavItemClick?.();
  };

  const handleViewChange = (role: 'student' | 'teacher') => {
    setCurrentView(role);
    navigate('/dashboard');
  };

  const handleResetView = () => {
    setCurrentView(null);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />

      {/* Top navigation */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-border bg-card z-50">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleSidebarToggle}
              className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/" className="flex items-center gap-2">
              <div className="p-2 rounded-xl gradient-hero">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold hidden sm:block">Lumora</span>
            </Link>
          </div>

          <h1 className="hidden md:block text-lg font-display font-semibold">{title}</h1>

          <div className="flex items-center gap-3">
            <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-primary hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      No notifications
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-3 border-b border-border/50 last:border-none hover:bg-muted/50 transition-colors",
                          !notification.read && "bg-primary/5"
                        )}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-sm font-medium">{notification.title}</h4>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">{notification.date}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-3 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between text-xs"
                    onClick={() => {
                      setNotificationsOpen(false);
                      navigate('/dashboard?tab=messages');
                    }}
                  >
                    Open Inbox
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="gradient-hero text-primary-foreground text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium">
                    {profile?.display_name || profile?.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{profile?.display_name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{profile?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary capitalize">
                    {profile?.role}
                  </span>
                  {currentView && (
                    <div className="mt-2 flex items-center gap-2">
                      <Eye className="w-3 h-3 text-primary" />
                      <span className="text-xs text-primary">Viewing as: {currentView}</span>
                    </div>
                  )}
                </div>
                <DropdownMenuSeparator />

                {isAdminOrModerator && (
                  <>
                    <DropdownMenuItem onClick={() => handleViewChange('student')}>
                      <UserIcon className="w-4 h-4 mr-2" />
                      View as Student
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewChange('teacher')}>
                      <BookOpen className="w-4 h-4 mr-2" />
                      View as Teacher
                    </DropdownMenuItem>
                    {currentView && (
                      <DropdownMenuItem onClick={handleResetView}>
                        {isAdmin ? (
                          <>
                            <Crown className="w-4 h-4 mr-2" />
                            Back to Admin View
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4 mr-2" />
                            Back to Moderator View
                          </>
                        )}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                  </>
                )}

                <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-16 left-0 bottom-0 w-64 border-r border-border bg-card transition-transform duration-300 z-40",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-4 h-full overflow-y-auto">
          {sidebar}
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="pt-16 lg:pl-64">
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* Ad Banner */}
      <AdBanner />
    </div>
  );
}