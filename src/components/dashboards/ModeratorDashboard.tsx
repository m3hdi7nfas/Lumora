import { useState, useEffect } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Trophy,
  FileQuestion,
  CheckSquare,
  Clock,
  LayoutTemplate,
  School,
  Search,
  TrendingUp,
  CheckCircle,
  XCircle,
  MessageSquare,
  RefreshCw,
  Loader2,
  Eye,
  EyeOff,
  User,
  Lock,
  Unlock,
  Calendar,
  ChevronRight,
  Crown,
  Medal,
  Star,
  Plus,
  Edit,
  Trash2,
  Upload,
  ChevronDown,
  ChevronUp,
  List,
  AlertTriangle,
  Settings,
  Shield
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import { localStorageCRUD } from '@/lib/localStorageCRUD';

const LOCAL_STORAGE_KEYS = {
  USERS: 'lumora_users',
  SCHOOLS: 'lumora_schools',
  COMPETITIONS: 'lumora_competitions',
  QUESTIONS: 'lumora_questions',
  QUESTION_SETS: 'lumora_question_sets',
  AVATARS: 'lumora_avatars',
  APPROVALS: 'lumora_approvals',
  MESSAGES: 'lumora_messages',
  BADGES: 'lumora_badges',
  SETTINGS: 'lumora_settings'
};

function ModeratorSidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutTemplate },
    { id: 'schools', label: 'Schools', icon: School },
    { id: 'competitions', label: 'Competitions', icon: Trophy },
    { id: 'question-sets', label: 'Question Sets', icon: FileQuestion },
    { id: 'questions', label: 'Questions', icon: List },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'avatars', label: 'Avatars', icon: User },
    { id: 'approvals', label: 'Approvals', icon: CheckSquare },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'preview', label: 'Preview Views', icon: Eye },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="w-64 border-r border-border/50 bg-card h-screen overflow-y-auto">
      <div className="p-4 border-b border-border/50">
        <h2 className="font-display font-bold text-lg">Moderator Dashboard</h2>
      </div>
      <nav className="p-2 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              activeTab === item.id
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted/50 text-muted-foreground'
            }`}
          >
            <item.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function ModeratorOverviewTab({ setActiveTab }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSchools: 0,
    totalCompetitions: 0,
    totalQuestions: 0,
    pendingApprovals: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    // Load stats from local storage
    const users = localStorageCRUD.get(LOCAL_STORAGE_KEYS.USERS) || [];
    const schools = localStorageCRUD.get(LOCAL_STORAGE_KEYS.SCHOOLS) || [];
    const competitions = localStorageCRUD.get(LOCAL_STORAGE_KEYS.COMPETITIONS) || [];
    const questions = localStorageCRUD.get(LOCAL_STORAGE_KEYS.QUESTIONS) || [];
    const approvals = localStorageCRUD.get(LOCAL_STORAGE_KEYS.APPROVALS) || [];

    setStats({
      totalUsers: users.length,
      totalSchools: schools.length,
      totalCompetitions: competitions.length,
      totalQuestions: questions.length,
      pendingApprovals: approvals.filter(a => a.status === 'pending').length,
      activeUsers: users.filter(u => u.is_active).length,
    });
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Users" value={stats.totalUsers.toString()} icon={Users} className="bg-primary/10 border-primary/20" />
        <StatCard title="Total Schools" value={stats.totalSchools.toString()} icon={School} className="bg-accent/10 border-accent/20" />
        <StatCard title="Competitions" value={stats.totalCompetitions.toString()} icon={Trophy} className="bg-success/10 border-success/20" />
        <StatCard title="Questions" value={stats.totalQuestions.toString()} icon={FileQuestion} className="bg-warning/10 border-warning/20" />
        <StatCard title="Pending Approvals" value={stats.pendingApprovals.toString()} icon={Clock} className="bg-destructive/10 border-destructive/20" />
        <StatCard title="Active Users" value={stats.activeUsers.toString()} icon={CheckCircle} className="bg-success/10 border-success/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={() => setActiveTab('schools')} className="w-full justify-start">
              <School className="w-4 h-4 mr-2" /> Manage Schools
            </Button>
            <Button onClick={() => setActiveTab('users')} className="w-full justify-start" variant="outline">
              <Users className="w-4 h-4 mr-2" /> Manage Users
            </Button>
            <Button onClick={() => setActiveTab('competitions')} className="w-full justify-start" variant="outline">
              <Trophy className="w-4 h-4 mr-2" /> Manage Competitions
            </Button>
            <Button onClick={() => setActiveTab('questions')} className="w-full justify-start" variant="outline">
              <List className="w-4 h-4 mr-2" /> Manage Questions
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <School className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New school registered</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-success" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Competition created</p>
                  <p className="text-xs text-muted-foreground">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New user registered</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, className }) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-display font-bold">{value}</p>
          </div>
          <div className="p-2 rounded-lg bg-card">
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Reuse the same tab components from AdminDashboard
function SchoolsTab() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSchools = async () => {
    setLoading(true);
    setError(null);
    try {
      setSchools(localStorageCRUD.get(LOCAL_STORAGE_KEYS.SCHOOLS) || []);
    } catch (error) {
      console.error('Error fetching schools:', error);
      setError('Failed to load schools');
      toast({ title: 'Error', description: 'Failed to load schools', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-8">
            <div className="mb-4">
              <AlertTriangle className="w-8 h-8 text-destructive mx-auto" />
            </div>
            <h3 className="text-lg font-medium mb-2">Error Loading Schools</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchSchools} className="gradient-hero">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold">Manage Schools</h2>
        <Button className="gradient-hero">
          <Plus className="w-4 h-4 mr-2" />
          Add School
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground mt-2">Loading schools...</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <School className="w-12 h-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No schools found</p>
                        <Button onClick={fetchSchools} variant="outline">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Refresh
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  schools.map((school) => (
                    <TableRow key={school.id}>
                      <TableCell className="font-medium">{school.name}</TableCell>
                      <TableCell>{school.city}, {school.country}</TableCell>
                      <TableCell>{school.students || 0}</TableCell>
                      <TableCell>
                        <Badge variant={school.is_active ? 'success' : 'destructive'}>
                          {school.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Main ModeratorDashboard component
export default function ModeratorDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const handleTabChange = (tab: string) => {
    try {
      setActiveTab(tab);
      setError(null);
    } catch (error) {
      console.error('Error changing tab:', error);
      setError(error as Error);
      toast({
        title: 'Error',
        description: 'Failed to change tab',
        variant: 'destructive'
      });
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg mb-4">
          <h3 className="font-medium mb-2">Dashboard Error</h3>
          <p className="text-sm">{error.message}</p>
          <Button
            onClick={() => {
              setError(null);
              setActiveTab('overview');
            }}
            className="mt-3"
            variant="outline"
          >
            Reset Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Lumora Moderator Dashboard"
      sidebar={<ModeratorSidebar activeTab={activeTab} setActiveTab={handleTabChange} />}
    >
      <ErrorBoundary>
        {activeTab === 'overview' && <ModeratorOverviewTab setActiveTab={handleTabChange} loading={loading} />}
        {activeTab === 'schools' && <SchoolsTab />}
        {/* Add other tabs as needed for moderator */}
        {activeTab === 'profile' && <ProfileView />}
      </ErrorBoundary>
    </DashboardLayout>
  );
}

// ProfileView component (shared with AdminDashboard)
function ProfileView() {
  const { profile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(profile?.avatar_id || null);
  const [avatars, setAvatars] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load avatars
    setAvatars(localStorageCRUD.get(LOCAL_STORAGE_KEYS.AVATARS) || []);
  }, []);

  const handleSaveProfile = () => {
    // Save profile logic
    console.log('Profile saved:', { displayName, selectedAvatar });
    toast({ title: 'Profile updated successfully' });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold">Profile Settings</h2>
        <Button onClick={handleSaveProfile} className="gradient-hero">
          <CheckCircle className="w-4 h-4 mr-2" />
          Save Profile
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={profile?.email} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label>Display Name</Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value="demo1234" // Mock password since we can't retrieve real one for security
                disabled
                className="bg-muted pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Password cannot be changed from profile</p>
          </div>

          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
              {avatars.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={`relative p-1 rounded-lg transition-all ${selectedAvatar === avatar.id ? 'ring-2 ring-primary bg-primary/10' : 'hover:bg-muted'}`}
                >
                  <img src={avatar.image_url} alt={avatar.name} className="w-10 h-10 mx-auto rounded-full object-cover" />
                </button>
              ))}
              <button
                onClick={() => setSelectedAvatar(null)}
                className={`p-1 rounded-lg transition-all flex items-center justify-center ${!selectedAvatar ? 'ring-2 ring-primary bg-primary/10' : 'hover:bg-muted'}`}
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}