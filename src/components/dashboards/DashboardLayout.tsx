import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, Bell, Search, User, ChevronDown, Settings, LogOut, Moon, Sun, Users, Trophy, FileQuestion, CheckSquare, Clock, LayoutTemplate, School, TrendingUp, CheckCircle, XCircle, MessageSquare, RefreshCw, Loader2, Eye, EyeOff, Lock, Unlock, Calendar, ChevronRight, Crown, Medal, Star, Plus, Edit, Trash2, Upload, ChevronDown as ChevronDownIcon, ChevronUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from 'next-themes';
import { Logo } from '@/components/ui/Logo';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProfileDialog } from '@/components/profile/ProfileDialog';
import { SettingsDialog } from '@/components/settings/SettingsDialog';
import { MessagesDialog } from '@/components/messaging/MessagesDialog';

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  title: string;
  onNavItemClick?: (itemId: string) => void;
}

export function DashboardLayout({ children, sidebar, title, onNavItemClick }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [messagesDialogOpen, setMessagesDialogOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const { signOut, profile, currentView, setCurrentView, isAdmin, isAdminOrModerator } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  // Sync notifications with messages from localStorage
  useEffect(() => {
    const syncNotifications = () => {
      try {
        const messages = JSON.parse(localStorage.getItem('lumora_messages') || '[]');
        // Convert messages to notification format
        const notifs = messages.map((m: any) => ({
          id: m.id,
          text: `${m.sender}: ${m.subject}`,
          time: new Date(m.date).toLocaleDateString(),
          read: m.read,
          isSystem: m.senderRole === 'system'
        }));
        setNotifications(notifs.slice(0, 10)); // Show last 10
        setUnreadCount(messages.filter((m: any) => !m.read).length);
      } catch (e) {
        console.error('Error syncing notifications:', e);
      }
    };

    syncNotifications();
    window.addEventListener('storage', syncNotifications);
    const interval = setInterval(syncNotifications, 10000); // Periodic check

    return () => {
      window.removeEventListener('storage', syncNotifications);
      clearInterval(interval);
    };
  }, []);

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
      toast({ title: 'Signed out successfully' });
    } catch (error) {
      toast({ title: 'Error signing out', description: error.message, variant: 'destructive' });
    }
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  const handleProfileClick = () => {
    setProfileDialogOpen(true);
  };

  // Handle Mark All as Read
  const handleMarkAllRead = () => {
    try {
      const messages = JSON.parse(localStorage.getItem('lumora_messages') || '[]');
      const updatedMessages = messages.map((m: any) => ({ ...m, read: true }));
      localStorage.setItem('lumora_messages', JSON.stringify(updatedMessages));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast({ title: 'Marked all as read' });
      // Trigger storage event for other components
      window.dispatchEvent(new Event('storage'));
    } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen bg-background">
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

            {/* Dashboard logo stays on the right side as requested */}
            <div className="flex-1 flex justify-end">
              <Link to="/" className="flex items-center gap-6">
                <Logo size="md" textSize="md" />
              </Link>
            </div>
          </div>

          <h1 className="hidden md:block text-lg font-display font-semibold">{title}</h1>

          <div className="flex items-center gap-3">
            {/* Search Bar or Role Switcher */}
            {isAdminOrModerator ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase hidden lg:inline">View As:</span>
                <Select
                  value={currentView || profile?.role || ''}
                  onValueChange={(val) => setCurrentView(val === profile?.role ? null : val as any)}
                >
                  <SelectTrigger className="w-[140px] h-9 bg-muted/50 border-none shadow-none focus:ring-1 focus:ring-primary/20">
                    <SelectValue placeholder="Select View" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={profile?.role || 'admin'}>Default ({profile?.role})</SelectItem>
                    {isAdmin && <SelectItem value="admin">Admin</SelectItem>}
                    {isAdmin && <SelectItem value="moderator">Moderator</SelectItem>}
                    {(isAdmin || profile?.role === 'moderator') && (
                      <>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              profile?.role !== 'student' && profile?.role !== 'teacher' && (
                <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search..."
                      className="pl-10 w-[200px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </form>
              )
            )}

            {/* Notifications */}
            <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[350px] p-0 overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-8 text-primary hover:text-primary hover:bg-primary/10"
                      onClick={handleMarkAllRead}
                    >
                      Mark all as read
                    </Button>
                  )}
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-border">
                      {notifications.map((n) => (
                        <div key={n.id} className={`p-4 hover:bg-muted/50 transition-all ${!n.read ? 'bg-primary/5' : ''}`}>
                          <div className="flex items-start gap-3">
                            <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!n.read ? 'bg-primary' : 'bg-transparent'}`} />
                            <div className="space-y-1">
                              <p className={`text-sm ${!n.read ? 'font-medium' : ''}`}>{n.text}</p>
                              <p className="text-xs text-muted-foreground">{n.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground italic text-sm">
                      No new notifications
                    </div>
                  )}
                </div>
                <div className="p-2 border-t border-border bg-muted/10">
                  <Button
                    variant="ghost"
                    className="w-full text-xs text-primary font-medium hover:bg-primary/5"
                    onClick={() => {
                      setNotificationsOpen(false);
                      setMessagesDialogOpen(true);
                    }}
                  >
                    View all messages
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {profile?.display_name?.substring(0, 2).toUpperCase() || 'US'}
                  </div>
                  <span className="hidden md:inline font-medium">{profile?.display_name || 'User'}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem onClick={handleProfileClick}>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSettingsDialogOpen(true)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
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

      {/* Main content area */}
      <div className="pt-16 flex min-h-screen">
        {/* Sidebar - hidden on mobile, shown on desktop */}
        <div className="hidden lg:block w-[280px] flex-shrink-0 border-r border-border">
          <div className="h-full overflow-y-auto p-4 custom-scrollbar">
            {sidebar}
          </div>
        </div>

        {/* Mobile sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-[280px] p-0">
            <div className="h-full overflow-y-auto p-4 custom-scrollbar text-foreground">
              {sidebar}
            </div>
          </SheetContent>
        </Sheet>

        {/* Main content - Scroll on the left side to be next to sidebar tabs */}
        <div className="flex-1 h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar scrollbar-thin" style={{ direction: 'rtl' }}>
          <div className="p-6" style={{ direction: 'ltr' }}>
            {children}
          </div>
        </div>
      </div>

      {/* Profile Dialog - only opens when Profile is clicked */}
      <ProfileDialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen} />

      {/* Settings Dialog */}
      <SettingsDialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen} />

      {/* Messages Dialog */}
      <MessagesDialog open={messagesDialogOpen} onOpenChange={setMessagesDialogOpen} />
    </div>
  );
}