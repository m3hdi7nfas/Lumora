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
  Shield,
  GraduationCap,
  Swords,
  BookOpen,
  Play
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

function StudentSidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutTemplate },
    { id: 'competitions', label: 'Competitions', icon: Trophy },
    { id: 'challenges', label: 'Challenges', icon: Swords },
    { id: 'practice', label: 'Practice Mode', icon: BookOpen },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="w-64 border-r border-border/50 bg-card h-screen overflow-y-auto">
      <div className="p-4 border-b border-border/50">
        <h2 className="font-display font-bold text-lg">Student Dashboard</h2>
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

function StudentOverviewTab() {
  const [stats, setStats] = useState({
    totalCompetitions: 0,
    completedCompetitions: 0,
    totalChallenges: 0,
    completedChallenges: 0,
    practiceSessions: 0,
    rank: 0,
  });

  useEffect(() => {
    // Load stats from local storage
    const competitions = localStorageCRUD.get(LOCAL_STORAGE_KEYS.COMPETITIONS) || [];
    const challenges = localStorageCRUD.get(LOCAL_STORAGE_KEYS.QUESTIONS) || []; // Using questions as challenges for demo

    setStats({
      totalCompetitions: competitions.length,
      completedCompetitions: competitions.filter(c => c.status === 'completed').length,
      totalChallenges: challenges.length,
      completedChallenges: challenges.filter(c => c.status === 'completed').length,
      practiceSessions: 15, // Mock data
      rank: 42, // Mock data
    });
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Competitions" value={stats.totalCompetitions.toString()} icon={Trophy} className="bg-primary/10 border-primary/20" />
        <StatCard title="Completed Competitions" value={stats.completedCompetitions.toString()} icon={CheckCircle} className="bg-success/10 border-success/20" />
        <StatCard title="Total Challenges" value={stats.totalChallenges.toString()} icon={Swords} className="bg-warning/10 border-warning/20" />
        <StatCard title="Completed Challenges" value={stats.completedChallenges.toString()} icon={CheckCircle} className="bg-success/10 border-success/20" />
        <StatCard title="Practice Sessions" value={stats.practiceSessions.toString()} icon={BookOpen} className="bg-accent/10 border-accent/20" />
        <StatCard title="Your Rank" value={`#${stats.rank}`} icon={Crown} className="bg-gold/10 border-gold/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start">
              <Trophy className="w-4 h-4 mr-2" /> Join Competition
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Swords className="w-4 h-4 mr-2" /> Start Challenge
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <BookOpen className="w-4 h-4 mr-2" /> Practice Mode
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <MessageSquare className="w-4 h-4 mr-2" /> View Messages
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
                  <Trophy className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Competition completed</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                  <Swords className="w-4 h-4 text-success" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Challenge won</p>
                  <p className="text-xs text-muted-foreground">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Practice session completed</p>
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

function CompetitionsTab() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCompetitions = async () => {
    setLoading(true);
    setError(null);
    try {
      setCompetitions(localStorageCRUD.get(LOCAL_STORAGE_KEYS.COMPETITIONS) || []);
    } catch (error) {
      console.error('Error fetching competitions:', error);
      setError('Failed to load competitions');
      toast({ title: 'Error', description: 'Failed to load competitions', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-8">
            <div className="mb-4">
              <AlertTriangle className="w-8 h-8 text-destructive mx-auto" />
            </div>
            <h3 className="text-lg font-medium mb-2">Error Loading Competitions</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchCompetitions} className="gradient-hero">
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
        <h2 className="text-2xl font-display font-bold">Competitions</h2>
        <Button className="gradient-hero">
          <Plus className="w-4 h-4 mr-2" />
          Join Competition
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground mt-2">Loading competitions...</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competitions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <Trophy className="w-12 h-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No competitions found</p>
                        <Button onClick={fetchCompetitions} variant="outline">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Refresh
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  competitions.map((competition) => (
                    <TableRow key={competition.id}>
                      <TableCell className="font-medium">{competition.name}</TableCell>
                      <TableCell>{competition.subject}</TableCell>
                      <TableCell>{competition.start_date}</TableCell>
                      <TableCell>
                        <Badge variant={competition.is_active ? 'default' : 'destructive'}>
                          {competition.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" className="gradient-hero">
                            <Play className="w-4 h-4" />
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

// Main StudentDashboard component
export default function StudentDashboard() {
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
      title="Lumora Student Dashboard"
      sidebar={<StudentSidebar activeTab={activeTab} setActiveTab={handleTabChange} />}
    >
      <ErrorBoundary>
        {activeTab === 'overview' && <StudentOverviewTab />}
        {activeTab === 'competitions' && <CompetitionsTab />}
        {/* Add other tabs as needed for student */}
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