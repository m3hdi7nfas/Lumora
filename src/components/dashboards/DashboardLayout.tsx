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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { ProfileDialog } from '@/components/profile/ProfileDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAds, setShowAds] = useState(true);
  const { signOut, profile, setCurrentView, isAdmin, isAdminOrModerator } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  // Load ad setting from localStorage
  useEffect(() => {
    const savedShowAds = localStorage.getItem('showAds');
    if (savedShowAds !== null) {
      setShowAds(savedShowAds === 'true');
    }
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

  // Handle profile click - only open dialog when "Profile" is clicked
  const handleProfileClick = () => {
    setProfileDialogOpen(true);
  };

  // Handle settings click
  const handleSettingsClick = () => {
    setSettingsDialogOpen(true);
  };

  // Handle ad toggle
  const handleAdToggle = (checked: boolean) => {
    setShowAds(checked);
    localStorage.setItem('showAds', checked.toString());
    window.dispatchEvent(new CustomEvent('adsSettingChanged', {
      detail: { showAds: checked }
    }));
    toast({
      title: 'Ad visibility updated',
      description: `Ads are now ${checked ? 'visible' : 'hidden'} for users`
    });
  };

  // Handle view switching
  const handleViewSwitch = (role: 'admin' | 'moderator' | 'teacher' | 'student' | null) => {
    setCurrentView(role);
    toast({
      title: 'View switched',
      description: `Now viewing as ${role || 'yourself'}`
    });
    setSettingsDialogOpen(false);
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
            {/* Search */}
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

            {/* Notifications */}
            <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">3</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[350px]">
                <div className="p-2">
                  <h3 className="font-medium text-sm mb-2">Notifications</h3>
                  <div className="space-y-2">
                    <div className="p-2 rounded-lg hover:bg-muted transition-colors">
                      <p className="text-sm">New competition available!</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                    <div className="p-2 rounded-lg hover:bg-muted transition-colors">
                      <p className="text-sm">You earned a new badge!</p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
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
                <DropdownMenuItem onClick={handleSettingsClick}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
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
          <div className="h-full overflow-y-auto p-4">
            {sidebar}
          </div>
        </div>

        {/* Mobile sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-[280px] p-0">
            <div className="h-full overflow-y-auto p-4">
              {sidebar}
            </div>
          </SheetContent>
        </Sheet>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>

      {/* Profile Dialog - only opens when Profile is clicked */}
      <ProfileDialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen} />

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>Configure your account and platform settings</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Theme Settings */}
            <div className="space-y-4">
              <h3 className="font-medium">Theme Settings</h3>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card">
                <Label htmlFor="theme-toggle" className="text-sm font-medium">
                  Dark Mode
                </Label>
                <Switch
                  id="theme-toggle"
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
              </div>
            </div>

            {/* Admin/Moderator View Switching */}
            {isAdminOrModerator && (
              <div className="space-y-4">
                <h3 className="font-medium">View Switching</h3>
                <p className="text-sm text-muted-foreground">
                  Switch views to test different user experiences
                </p>

                <div className="space-y-3">
                  {isAdmin && (
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => handleViewSwitch('admin')}
                    >
                      <span>Admin View</span>
                      {profile?.role === 'admin' && currentView === 'admin' && (
                        <CheckCircle className="w-4 h-4 text-success" />
                      )}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => handleViewSwitch('moderator')}
                  >
                    <span>Moderator View</span>
                    {currentView === 'moderator' && (
                      <CheckCircle className="w-4 h-4 text-success" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => handleViewSwitch('teacher')}
                  >
                    <span>Teacher View</span>
                    {currentView === 'teacher' && (
                      <CheckCircle className="w-4 h-4 text-success" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => handleViewSwitch('student')}
                  >
                    <span>Student View</span>
                    {currentView === 'student' && (
                      <CheckCircle className="w-4 h-4 text-success" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => handleViewSwitch(null)}
                  >
                    <span>My Original View</span>
                    {!currentView && (
                      <CheckCircle className="w-4 h-4 text-success" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Admin-only Settings */}
            {isAdmin && (
              <div className="space-y-4">
                <h3 className="font-medium">Admin Settings</h3>

                <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card">
                  <Label htmlFor="ad-toggle" className="text-sm font-medium">
                    Show Ads to Users
                  </Label>
                  <Switch
                    id="ad-toggle"
                    checked={showAds}
                    onCheckedChange={handleAdToggle}
                  />
                </div>
              </div>
            )}

            {/* Platform Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Platform Information</h3>
              <Card className="border-primary/50">
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center flex-shrink-0">
                        <Crown className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">Lumora is a Non-Profit Organization</p>
                        <p className="text-sm text-muted-foreground">
                          We are dedicated to providing free, high-quality educational resources to students worldwide.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center flex-shrink-0">
                        <Shield className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">Our Mission</p>
                        <p className="text-sm text-muted-foreground">
                          To make education accessible, engaging, and competitive for all students.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setSettingsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}