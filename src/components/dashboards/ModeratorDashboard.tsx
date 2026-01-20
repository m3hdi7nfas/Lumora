import { useState, useEffect } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  School,
  Users,
  Trophy,
  FileQuestion,
  Award,
  Settings,
  Plus,
  Search,
  Edit,
  Trash2,
  UserPlus,
  BookOpen,
  Eye,
  ShieldPlus,
  MessageSquare,
  LayoutTemplate,
  ImagePlus,
  X,
  Loader2,
  Check,
  BarChart3,
  CheckSquare,
  Square,
  RefreshCw,
  User,
  LogOut,
  Calendar
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';

function ModeratorSidebar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const { profile } = useAuth();
  const navItems = [
    { id: 'overview', icon: Settings, label: 'Overview' },
    { id: 'profile', icon: Users, label: 'My Profile' },
    { id: 'schools', icon: School, label: 'Schools' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'competitions', icon: Trophy, label: 'Competitions' },
    { id: 'questions', icon: FileQuestion, label: 'Questions' },
    { id: 'leaderboard', icon: BarChart3, label: 'Leaderboard' },
    { id: 'badges', icon: Award, label: 'Badges' },
    { id: 'avatars', icon: UserPlus, label: 'Avatars' },
    { id: 'messages', icon: MessageSquare, label: 'Messages' },
  ];

  return (
    <div className="flex flex-col h-full">
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              // Close sidebar on mobile
              if (window.innerWidth < 1024) {
                const sidebar = document.querySelector('aside');
                if (sidebar) {
                  sidebar.classList.add('-translate-x-full');
                  sidebar.classList.remove('translate-x-0');
                }
                const overlay = document.querySelector('.fixed.inset-0.bg-foreground\\/20');
                if (overlay) {
                  (overlay as HTMLElement).style.display = 'none';
                }
              }
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
              ? 'bg-primary text-primary-foreground shadow-card'
              : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-border/50">
        <div className="p-4 rounded-2xl bg-muted/30">
          <div className="flex items-center gap-3 mb-3">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} className="w-10 h-10 rounded-full object-cover" alt="Profile" />
            ) : (
              <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-bold text-sm">
                {profile?.display_name?.substring(0, 2).toUpperCase() || profile?.email?.substring(0, 2).toUpperCase() || 'MD'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{profile?.display_name || 'Moderator'}</p>
              <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={() => setActiveTab('profile')}>
            <Settings className="w-3 h-3 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ModeratorDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <DashboardLayout
      title="Lumora Moderator Dashboard"
      sidebar={<ModeratorSidebar activeTab={activeTab} setActiveTab={setActiveTab} />}
    >
      {activeTab === 'overview' && <OverviewTab setActiveTab={setActiveTab} />}
      {activeTab === 'profile' && <ProfileTab />}
      {activeTab === 'schools' && <SchoolsTab />}
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'competitions' && <CompetitionsTab />}
      {activeTab === 'questions' && <QuestionsTab />}
      {activeTab === 'leaderboard' && <LeaderboardTab />}
      {activeTab === 'badges' && <BadgesTab />}
      {activeTab === 'avatars' && <AvatarsTab />}
      {activeTab === 'messages' && <MessagesTab />}
    </DashboardLayout>
  );
}

// Overview Tab Component
function OverviewTab({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { toast } = useToast();
  const [showAds, setShowAds] = useState(true);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedShowAds = localStorage.getItem('showAds');
    if (savedShowAds !== null) {
      setShowAds(savedShowAds === 'true');
    }
  }, []);

  const handleAdsToggle = async (checked: boolean) => {
    setLoading(true);
    try {
      setShowAds(checked);
      // Save to localStorage
      localStorage.setItem('showAds', checked.toString());

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('adsSettingChanged', { detail: { showAds: checked } }));

      toast({
        title: 'Ad settings updated',
        description: `Advertisements are now ${checked ? 'enabled' : 'disabled'}`,
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Error updating ad settings',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats from database
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['moderator-stats'],
    queryFn: async () => {
      try {
        // Get total users
        const { data: users, error: usersError } = await supabase.from('profiles').select('*');
        if (usersError) throw usersError;

        // Get active competitions
        const { data: competitions, error: compError } = await supabase.from('competitions').select('*');
        if (compError) throw compError;

        // Get total questions
        const { data: questions, error: questionsError } = await supabase.from('questions').select('*');
        if (questionsError) throw questionsError;

        return {
          totalUsers: users.length,
          activeCompetitions: competitions.filter(c => c.is_active).length,
          totalQuestions: questions.length,
          pendingReviews: 0 // This would come from a more complex query
        };
      } catch (error) {
        console.error('Error fetching stats:', error);
        return {
          totalUsers: 0,
          activeCompetitions: 0,
          totalQuestions: 0,
          pendingReviews: 0
        };
      }
    }
  });

  const quickActions = [
    { id: 'competitions', icon: Trophy, title: 'Manage Competitions', description: 'Create and edit competitions' },
    { id: 'questions', icon: FileQuestion, title: 'Review Questions', description: 'Approve pending questions' },
    { id: 'users', icon: Users, label: 'User Management', description: 'Manage user accounts' },
    { id: 'schools', icon: School, title: 'School Settings', description: 'Configure school access' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Moderator Dashboard</h1>
          <p className="text-muted-foreground">Overview of platform activity and quick actions</p>
        </div>
      </div>

      {/* Settings Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Ads Toggle */}
        <Card>
          <CardHeader>
            <CardTitle>Advertisement Settings</CardTitle>
            <CardDescription>Control whether ads are displayed to users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LayoutTemplate className="w-5 h-5 text-primary" />
                <span>Show Advertisements</span>
              </div>
              <Switch
                checked={showAds}
                onCheckedChange={handleAdsToggle}
                id="ads-toggle"
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers?.toLocaleString() || '0'}
          icon={Users}
          className="bg-primary/10 border-primary/20"
          loading={statsLoading}
        />
        <StatCard
          title="Active Competitions"
          value={stats?.activeCompetitions?.toString() || '0'}
          icon={Trophy}
          className="bg-accent/10 border-accent/20"
          loading={statsLoading}
        />
        <StatCard
          title="Total Questions"
          value={stats?.totalQuestions?.toLocaleString() || '0'}
          icon={FileQuestion}
          className="bg-success/10 border-success/20"
          loading={statsLoading}
        />
        <StatCard
          title="Pending Reviews"
          value={stats?.pendingReviews?.toString() || '0'}
          icon={Eye}
          className="bg-warning/10 border-warning/20"
          loading={statsLoading}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common moderator tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => setActiveTab(action.id)}
                className="p-4 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-muted">
                    <action.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{action.title}</h3>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest platform events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-center text-muted-foreground py-4">No recent activity</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, className, loading = false }: { title: string; value: string; icon: any; className?: string; loading?: boolean }) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{loading ? <Loader2 className="w-6 h-6 animate-spin" /> : value}</p>
          </div>
          <div className="p-2 rounded-lg bg-card">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Profile Tab Component
function ProfileTab() {
  const { profile } = useAuth();
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">My Profile</h1>
        <p className="text-muted-foreground">ManageI'll restore the moderator functions and ensure they work properly. Let me fix this:

<dyad-write path="src/components/dashboards/ModeratorDashboard.tsx" description="Restoring moderator functions and ensuring they work properly">
import { useState, useEffect } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  School,
  Users,
  Trophy,
  FileQuestion,
  Award,
  Settings,
  Plus,
  Search,
  Edit,
  Trash2,
  UserPlus,
  BookOpen,
  Eye,
  ShieldPlus,
  MessageSquare,
  LayoutTemplate,
  ImagePlus,
  X,
  Loader2,
  Check,
  BarChart3,
  CheckSquare,
  Square,
  RefreshCw,
  User,
  LogOut,
  Calendar
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';

function ModeratorSidebar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const { profile } = useAuth();
  const navItems = [
    { id: 'overview', icon: Settings, label: 'Overview' },
    { id: 'profile', icon: Users, label: 'My Profile' },
    { id: 'schools', icon: School, label: 'Schools' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'competitions', icon: Trophy, label: 'Competitions' },
    { id: 'questions', icon: FileQuestion, label: 'Questions' },
    { id: 'leaderboard', icon: BarChart3, label: 'Leaderboard' },
    { id: 'badges', icon: Award, label: 'Badges' },
    { id: 'avatars', icon: UserPlus, label: 'Avatars' },
    { id: 'messages', icon: MessageSquare, label: 'Messages' },
  ];

  return (
    <div className="flex flex-col h-full">
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              // Close sidebar on mobile
              if (window.innerWidth < 1024) {
                const sidebar = document.querySelector('aside');
                if (sidebar) {
                  sidebar.classList.add('-translate-x-full');
                  sidebar.classList.remove('translate-x-0');
                }
                const overlay = document.querySelector('.fixed.inset-0.bg-foreground\\/20');
                if (overlay) {
                  (overlay as HTMLElement).style.display = 'none';
                }
              }
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
              ? 'bg-primary text-primary-foreground shadow-card'
              : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-border/50">
        <div className="p-4 rounded-2xl bg-muted/30">
          <div className="flex items-center gap-3 mb-3">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} className="w-10 h-10 rounded-full object-cover" alt="Profile" />
            ) : (
              <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-bold text-sm">
                {profile?.display_name?.substring(0, 2).toUpperCase() || profile?.email?.substring(0, 2).toUpperCase() || 'MD'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{profile?.display_name || 'Moderator'}</p>
              <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={() => setActiveTab('profile')}>
            <Settings className="w-3 h-3 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ModeratorDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <DashboardLayout
      title="Lumora Moderator Dashboard"
      sidebar={<ModeratorSidebar activeTab={activeTab} setActiveTab={setActiveTab} />}
    >
      {activeTab === 'overview' && <OverviewTab setActiveTab={setActiveTab} />}
      {activeTab === 'profile' && <ProfileTab />}
      {activeTab === 'schools' && <SchoolsTab />}
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'competitions' && <CompetitionsTab />}
      {activeTab === 'questions' && <QuestionsTab />}
      {activeTab === 'leaderboard' && <LeaderboardTab />}
      {activeTab === 'badges' && <BadgesTab />}
      {activeTab === 'avatars' && <AvatarsTab />}
      {activeTab === 'messages' && <MessagesTab />}
    </DashboardLayout>
  );
}

// Overview Tab Component
function OverviewTab({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { toast } = useToast();
  const [showAds, setShowAds] = useState(true);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedShowAds = localStorage.getItem('showAds');
    if (savedShowAds !== null) {
      setShowAds(savedShowAds === 'true');
    }
  }, []);

  const handleAdsToggle = async (checked: boolean) => {
    setLoading(true);
    try {
      setShowAds(checked);
      // Save to localStorage
      localStorage.setItem('showAds', checked.toString());

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('adsSettingChanged', { detail: { showAds: checked } }));

      toast({
        title: 'Ad settings updated',
        description: `Advertisements are now ${checked ? 'enabled' : 'disabled'}`,
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Error updating ad settings',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats from database
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['moderator-stats'],
    queryFn: async () => {
      try {
        // Get total users
        const { data: users, error: usersError } = await supabase.from('profiles').select('*');
        if (usersError) throw usersError;

        // Get active competitions
        const { data: competitions, error: compError } = await supabase.from('competitions').select('*');
        if (compError) throw compError;

        // Get total questions
        const { data: questions, error: questionsError } = await supabase.from('questions').select('*');
        if (questionsError) throw questionsError;

        return {
          totalUsers: users.length,
          activeCompetitions: competitions.filter(c => c.is_active).length,
          totalQuestions: questions.length,
          pendingReviews: 0 // This would come from a more complex query
        };
      } catch (error) {
        console.error('Error fetching stats:', error);
        return {
          totalUsers: 0,
          activeCompetitions: 0,
          totalQuestions: 0,
          pendingReviews: 0
        };
      }
    }
  });

  const quickActions = [
    { id: 'competitions', icon: Trophy, title: 'Manage Competitions', description: 'Create and edit competitions' },
    { id: 'questions', icon: FileQuestion, title: 'Review Questions', description: 'Approve pending questions' },
    { id: 'users', icon: Users, label: 'User Management', description: 'Manage user accounts' },
    { id: 'schools', icon: School, title: 'School Settings', description: 'Configure school access' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Moderator Dashboard</h1>
          <p className="text-muted-foreground">Overview of platform activity and quick actions</p>
        </div>
      </div>

      {/* Settings Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Ads Toggle */}
        <Card>
          <CardHeader>
            <CardTitle>Advertisement Settings</CardTitle>
            <CardDescription>Control whether ads are displayed to users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LayoutTemplate className="w-5 h-5 text-primary" />
                <span>Show Advertisements</span>
              </div>
              <Switch
                checked={showAds}
                onCheckedChange={handleAdsToggle}
                id="ads-toggle"
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers?.toLocaleString() || '0'}
          icon={Users}
          className="bg-primary/10 border-primary/20"
          loading={statsLoading}
        />
        <StatCard
          title="Active Competitions"
          value={stats?.activeCompetitions?.toString() || '0'}
          icon={Trophy}
          className="bg-accent/10 border-accent/20"
          loading={statsLoading}
        />
        <StatCard
          title="Total Questions"
          value={stats?.totalQuestions?.toLocaleString() || '0'}
          icon={FileQuestion}
          className="bg-success/10 border-success/20"
          loading={statsLoading}
        />
        <StatCard
          title="Pending Reviews"
          value={stats?.pendingReviews?.toString() || '0'}
          icon={Eye}
          className="bg-warning/10 border-warning/20"
          loading={statsLoading}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common moderator tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => setActiveTab(action.id)}
                className="p-4 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-muted">
                    <action.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{action.title}</h3>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest platform events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-center text-muted-foreground py-4">No recent activity</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, className, loading = false }: { title: string; value: string; icon: any; className?: string; loading?: boolean }) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{loading ? <Loader2 className="w-6 h-6 animate-spin" /> : value}</p>
          </div>
          <div className="p-2 rounded-lg bg-card">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Profile Tab Component
function ProfileTab() {
  const { profile } = useAuth();
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your moderator account</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={profile?.email || ''} disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={profile?.role || ''} disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input value={profile?.display_name || 'Not set'} disabled className="bg-muted" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Users Managed</p>
              <p className="text-2xl font-bold">0</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Competitions Created</p>
              <p className="text-2xl font-bold">0</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Questions Approved</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Schools Tab Component
function SchoolsTab() {
  const [schools, setSchools] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newSchool, setNewSchool] = useState({ name: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const { toast } = useToast();
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('schools').select('*');
      if (error) throw error;
      setSchools(data || []);
    } catch (error) {
      toast({ title: 'Error fetching schools', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleCreateSchool = async () => {
    if (!newSchool.name || !newSchool.password) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('schools').insert({
        name: newSchool.name,
        password: newSchool.password,
        created_by: profile?.id
      });

      if (error) throw error;

      toast({ title: 'School created successfully!' });
      setNewSchool({ name: '', password: '' });
      fetchSchools();
    } catch (error) {
      toast({ title: 'Error creating school', description: error.message, variant: 'destructive' });
    }

    setLoading(false);
  };

  const handleUpdateSchool = async () => {
    if (!editingSchool.name) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('schools').update({
        name: editingSchool.name,
        password: editingSchool.password || null
      }).eq('id', editingSchool.id);

      if (error) throw error;

      toast({ title: 'School updated successfully!' });
      setEditingSchool(null);
      fetchSchools();
    } catch (error) {
      toast({ title: 'Error updating school', description: error.message, variant: 'destructive' });
    }

    setLoading(false);
  };

  const handleDeleteSchool = async (schoolId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('schools').delete().eq('id', schoolId);
      if (error) throw error;

      toast({ title: 'School deleted successfully!' });
      fetchSchools();
    } catch (error) {
      toast({ title: 'Error deleting school', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">School Management</h1>
        <p className="text-muted-foreground">Create and manage schools</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New School</CardTitle>
          <CardDescription>Add a new school to the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>School Name</Label>
              <Input
                value={newSchool.name}
                onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                placeholder="Enter school name"
              />
            </div>

            <div className="space-y-2">
              <Label>Access Password</Label>
              <Input
                type="password"
                value={newSchool.password}
                onChange={(e) => setNewSchool({ ...newSchool, password: e.target.value })}
                placeholder="Enter access password"
              />
            </div>

            <Button
              onClick={handleCreateSchool}
              disabled={loading}
              className="gradient-hero"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create School'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schools List</CardTitle>
          <CardDescription>All registered schools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search schools..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </div>
              ) : filteredSchools.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No schools found</p>
              ) : (
                filteredSchools.map((school) => (
                  <div key={school.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{school.name}</h3>
                        <p className="text-xs text-muted-foreground">Created: {new Date(school.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setEditingSchool(school)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="h-8 w-8 p-0">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete School</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this school? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={() => handleDeleteSchool(school.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit School Dialog */}
      {editingSchool && (
        <Dialog open={!!editingSchool} onOpenChange={() => setEditingSchool(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit School</DialogTitle>
              <DialogDescription>Update school information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>School Name</Label>
                <Input
                  value={editingSchool.name}
                  onChange={(e) => setEditingSchool({ ...editingSchool, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Access Password (leave blank to keep current)</Label>
                <Input
                  type="password"
                  value={editingSchool.password || ''}
                  onChange={(e) => setEditingSchool({ ...editingSchool, password: e.target.value })}
                  placeholder="Enter new password"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingSchool(null)}>Cancel</Button>
              <Button onClick={handleUpdateSchool} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update School'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Users Tab Component
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const roles = ['all', 'moderator', 'teacher', 'student', 'admin'];

  const filteredUsers = users.filter(user =>
    (user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedRole === 'all' || user.role === selectedRole)
  );

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      toast({ title: 'Error fetching users', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleUpdateUser = async () => {
    if (!editingUser.email || !editingUser.role) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('profiles').update({
        role: editingUser.role,
        display_name: editingUser.display_name
      }).eq('id', editingUser.id);

      if (error) throw error;

      toast({ title: 'User updated successfully!' });
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast({ title: 'Error updating user', description: error.message, variant: 'destructive' });
    }

    setLoading(false);
  };

  const handleDeleteUser = async (userId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) throw error;

      toast({ title: 'User deleted successfully!' });
      fetchUsers();
    } catch (error) {
      toast({ title: 'Error deleting user', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">User Management</h1>
        <p className="text-muted-foreground">View and manage all users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
          <CardDescription>All platform users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No users found</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="p-3 text-left font-medium">Name</th>
                      <th className="p-3 text-left font-medium">Email</th>
                      <th className="p-3 text-left font-medium">Role</th>
                      <th className="p-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-border/50 last:border-none hover:bg-muted/50 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                              {user.display_name?.split(' ').map(n => n[0]).join('') || user.email?.substring(0, 2).toUpperCase()}
                            </div>
                            <span>{user.display_name || 'No name'}</span>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">{user.email}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs capitalize ${user.role === 'moderator' || user.role === 'admin' ? 'bg-primary/10 text-primary' : user.role === 'teacher' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setEditingUser(user)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="h-8 w-8 p-0">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this user? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive hover:bg-destructive/90"
                                    onClick={() => handleDeleteUser(user.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input
                  value={editingUser.display_name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, display_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
              <Button onClick={handleUpdateUser} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update User'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Competitions Tab Component
function CompetitionsTab() {
  const [competitions, setCompetitions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const filteredCompetitions = competitions.filter(comp =>
    comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchCompetitions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('competitions').select('*');
      if (error) throw error;
      setCompetitions(data || []);
    } catch (error) {
      toast({ title: 'Error fetching competitions', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleUpdateCompetition = async () => {
    if (!editingCompetition.name) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('competitions').update({
        name: editingCompetition.name,
        description: editingCompetition.description,
        is_active: editingCompetition.is_active
      }).eq('id', editingCompetition.id);

      if (error) throw error;

      toast({ title: 'Competition updated successfully!' });
      setEditingCompetition(null);
      fetchCompetitions();
    } catch (error) {
      toast({ title: 'Error updating competition', description: error.message, variant: 'destructive' });
    }

    setLoading(false);
  };

  const handleDeleteCompetition = async (competitionId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('competitions').delete().eq('id', competitionId);
      if (error) throw error;

      toast({ title: 'Competition deleted successfully!' });
      fetchCompetitions();
    } catch (error) {
      toast({ title: 'Error deleting competition', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Competitions</h1>
        <p className="text-muted-foreground">Manage all competitions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Competitions List</CardTitle>
          <CardDescription>All platform competitions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search competitions..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {loading ? (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </div>
              ) : filteredCompetitions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No competitions found</p>
              ) : (
                filteredCompetitions.map((competition) => (
                  <Card key={competition.id}>
                    <CardHeader>
                      <CardTitle>{competition.name}</CardTitle>
                      <CardDescription>{competition.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{competition.start_date ? new Date(competition.start_date).toLocaleDateString() : 'No start date'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>{competition.participants || 0} participants</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Trophy className="w-4 h-4 text-muted-foreground" />
                          <span>{competition.prize || 'No prize specified'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setEditingCompetition(competition)}
                          >
                            <Edit className="w-3 h-3 mr-2" />
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" className="flex-1">
                                <Trash2 className="w-3 h-3 mr-2" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Competition</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this competition? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive hover:bg-destructive/90"
                                  onClick={() => handleDeleteCompetition(competition.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Competition Dialog */}
      {editingCompetition && (
        <Dialog open={!!editingCompetition} onOpenChange={() => setEditingCompetition(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Competition</DialogTitle>
              <DialogDescription>Update competition information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={editingCompetition.name}
                  onChange={(e) => setEditingCompetition({ ...editingCompetition, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingCompetition.description || ''}
                  onChange={(e) => setEditingCompetition({ ...editingCompetition, description: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="is-active"
                  checked={editingCompetition.is_active}
                  onCheckedChange={(checked) => setEditingCompetition({ ...editingCompetition, is_active: checked })}
                />
                <Label htmlFor="is-active">Active Competition</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingCompetition(null)}>Cancel</Button>
              <Button onClick={handleUpdateCompetition} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Competition'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Questions Tab Component
function QuestionsTab() {
  const [questions, setQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const filteredQuestions = questions.filter(q =>
    q.question_text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('questions').select('*');
      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      toast({ title: 'Error fetching questions', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion.question_text || !editingQuestion.correct_answer) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('questions').update({
        question_text: editingQuestion.question_text,
        correct_answer: editingQuestion.correct_answer,
        points: editingQuestion.points,
        options: editingQuestion.options
      }).eq('id', editingQuestion.id);

      if (error) throw error;

      toast({ title: 'Question updated successfully!' });
      setEditingQuestion(null);
      fetchQuestions();
    } catch (error) {
      toast({ title: 'Error updating question', description: error.message, variant: 'destructive' });
    }

    setLoading(false);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('questions').delete().eq('id', questionId);
      if (error) throw error;

      toast({ title: 'Question deleted successfully!' });
      fetchQuestions();
    } catch (error) {
      toast({ title: 'Error deleting question', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Questions</h1>
        <p className="text-muted-foreground">Manage all questions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Questions List</CardTitle>
          <CardDescription>All platform questions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </div>
              ) : filteredQuestions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No questions found</p>
              ) : (
                filteredQuestions.map((question) => (
                  <div key={question.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-medium mb-2">{question.question_text}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Points: {question.points}</span>
                          <span>Type: {question.question_type}</span>
                          <span>Section: {question.section_id}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setEditingQuestion(question)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="h-8 w-8 p-0">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Question</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this question? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={() => handleDeleteQuestion(question.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Question Dialog */}
      {editingQuestion && (
        <Dialog open={!!editingQuestion} onOpenChange={() => setEditingQuestion(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Question</DialogTitle>
              <DialogDescription>Update question information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Question Text</Label>
                <Textarea
                  value={editingQuestion.question_text}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, question_text: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Correct Answer</Label>
                <Input
                  value={editingQuestion.correct_answer}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, correct_answer: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Points</Label>
                <Input
                  type="number"
                  value={editingQuestion.points}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, points: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Options (comma separated)</Label>
                <Input
                  value={Array.isArray(editingQuestion.options) ? editingQuestion.options.join(', ') : ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, options: e.target.value.split(',').map(o => o.trim()) })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingQuestion(null)}>Cancel</Button>
              <Button onClick={handleUpdateQuestion} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Question'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Leaderboard Tab Component
function LeaderboardTab() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // This would be a more complex query in a real app
      const { data, error } = await supabase.from('profiles').select('*').order('score', { ascending: false }).limit(50);
      if (error) throw error;
      setLeaderboard(data || []);
    } catch (error) {
      toast({ title: 'Error fetching leaderboard', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Leaderboard</h1>
        <p className="text-muted-foreground">View top performers</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Global Leaderboard</CardTitle>
          <CardDescription>Top 50 users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </div>
            ) : leaderboard.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No leaderboard data</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-3 text-left font-medium">Rank</th>
                    <th className="p-3 text-left font-medium">User</th>
                    <th className="p-3 text-left font-medium">Score</th>
                    <th className="p-3 text-left font-medium">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((user, index) => (
                    <tr key={user.id} className="border-b border-border/50 last:border-none hover:bg-muted/50 transition-colors">
                      <td className="p-3 font-medium">{index + 1}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                            {user.display_name?.split(' ').map(n => n[0]).join('') || user.email?.substring(0, 2).toUpperCase()}
                          </div>
                          <span>{user.display_name || 'No name'}</span>
                        </div>
                      </td>
                      <td className="p-3 font-bold">{user.score || 0}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs capitalize ${user.role === 'moderator' || user.role === 'admin' ? 'bg-primary/10 text-primary' : user.role === 'teacher' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                          {user.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Badges Tab Component
function BadgesTab() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchBadges = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('badges').select('*');
      if (error) throw error;
      setBadges(data || []);
    } catch (error) {
      toast({ title: 'Error fetching badges', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleUpdateBadge = async () => {
    if (!editingBadge.name || !editingBadge.description) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('badges').update({
        name: editingBadge.name,
        description: editingBadge.description,
        requirement_type: editingBadge.requirement_type,
        requirement_value: editingBadge.requirement_value
      }).eq('id', editingBadge.id);

      if (error) throw error;

      toast({ title: 'Badge updated successfully!' });
      setEditingBadge(null);
      fetchBadges();
    } catch (error) {
      toast({ title: 'Error updating badge', description: error.message, variant: 'destructive' });
    }

    setLoading(false);
  };

  const handleDeleteBadge = async (badgeId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('badges').delete().eq('id', badgeId);
      if (error) throw error;

      toast({ title: 'Badge deleted successfully!' });
      fetchBadges();
    } catch (error) {
      toast({ title: 'Error deleting badge', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Badges</h1>
        <p className="text-muted-foreground">Manage achievement badges</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Badges List</CardTitle>
          <CardDescription>All platform badges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </div>
            ) : badges.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No badges found</p>
            ) : (
              badges.map((badge) => (
                <div key={badge.id} className="p-4 rounded-xl bg-muted/50 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm">{badge.name}</h3>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setEditingBadge(badge)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="h-8 w-8 p-0">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Badge</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this badge? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={() => handleDeleteBadge(badge.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Award className="w-8 h-8 text-gold" />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">{badge.description}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Badge Dialog */}
      {editingBadge && (
        <Dialog open={!!editingBadge} onOpenChange={() => setEditingBadge(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Badge</DialogTitle>
              <DialogDescription>Update badge information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={editingBadge.name}
                  onChange={(e) => setEditingBadge({ ...editingBadge, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingBadge.description || ''}
                  onChange={(e) => setEditingBadge({ ...editingBadge, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Requirement Type</Label>
                <Input
                  value={editingBadge.requirement_type || ''}
                  onChange={(e) => setEditingBadge({ ...editingBadge, requirement_type: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Requirement Value</Label>
                <Input
                  type="number"
                  value={editingBadge.requirement_value || ''}
                  onChange={(e) => setEditingBadge({ ...editingBadge, requirement_value: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingBadge(null)}>Cancel</Button>
              <Button onClick={handleUpdateBadge} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Badge'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Avatars Tab Component
function AvatarsTab() {
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchAvatars = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('avatars').select('*');
      if (error) throw error;
      setAvatars(data || []);
    } catch (error) {
      toast({ title: 'Error fetching avatars', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAvatars();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Avatars</h1>
        <p className="text-muted-foreground">Manage user avatars</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Avatars List</CardTitle>
          <CardDescription>All platform avatars</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </div>
            ) : avatars.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No avatars found</p>
            ) : (
              avatars.map((avatar) => (
                <div key={avatar.id} className="p-2 rounded-lg bg-muted/50 border border-border/50 hover:bg-muted transition-colors">
                  <img
                    src={avatar.image_url}
                    alt={avatar.name}
                    className="w-full h-16 object-cover rounded-lg mb-2"
                  />
                  <p className="text-xs text-center truncate">{avatar.name}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Messages Tab Component
function MessagesTab() {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const filteredMessages = messages.filter(message =>
    message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('messages').select('*').eq('receiver_id', profile?.id);
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      toast({ title: 'Error fetching messages', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleSendReply = async () => {
    if (!replyContent || !selectedMessage) return;

    setSendingReply(true);

    try {
      const { error } = await supabase.from('messages').insert({
        content: replyContent,
        receiver_id: selectedMessage.senderEmail,
        sender_id: profile?.email,
        subject: `Re: ${selectedMessage.subject}`
      });

      if (error) throw error;

      toast({ title: 'Reply sent successfully!' });
      setReplyContent('');
    } catch (error) {
      toast({ title: 'Error sending reply', description: error.message, variant: 'destructive' });
    }

    setSendingReply(false);
  };

  const handleDeleteMessage = async (messageId: number) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('messages').delete().eq('id', messageId);
      if (error) throw error;

      toast({ title: 'Message deleted successfully!' });
      setMessages(messages.filter(msg => msg.id !== messageId));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      toast({ title: 'Error deleting message', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Messages</h1>
        <p className="text-muted-foreground">Your communications</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Inbox</CardTitle>
              <CardDescription>Your messages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search messages..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </div>
                  ) : filteredMessages.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No messages found</p>
                  ) : (
                    filteredMessages.map((message) => (
                      <button
                        key={message.id}
                        onClick={() => setSelectedMessage(message)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${selectedMessage?.id === message.id ? 'bg-primary/10 border border-primary' : 'hover:bg-muted/50'} ${!message.read && 'border-l-2 border-primary'}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {message.sender.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-medium truncate">{message.sender}</p>
                              <p className="text-xs text-muted-foreground whitespace-nowrap">{message.date}</p>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{message.subject}</p>
                            <p className="text-xs text-muted-foreground/60 truncate mt-1">{message.content}</p>
                            {!message.read && (
                              <span className="inline-block mt-1 w-2 h-2 bg-primary rounded-full" />
                            )}
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" className="h-6 w-6 p-0">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Message</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this message? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive hover:bg-destructive/90"
                                  onClick={() => handleDeleteMessage(message.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          {selectedMessage ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedMessage.subject}</CardTitle>
                <CardDescription>
                  From: {selectedMessage.sender} &lt;{selectedMessage.senderEmail}&gt; • {selectedMessage.date}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm">{selectedMessage.content}</p>
                  </div>

                  <div className="space-y-4">
                    <Label>Your Reply</Label>
                    <Textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Type your reply here..."
                      rows={8}
                    />
                    <Button
                      onClick={handleSendReply}
                      disabled={sendingReply || !replyContent}
                      className="gradient-hero"
                    >
                      {sendingReply && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Send Reply
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                  <p>Select a message to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}