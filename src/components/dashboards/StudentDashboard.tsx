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
  BookOpen
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
    { id: 'leaderboard', label: 'Leaderboard', icon: TrendingUp },
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

function StudentOverviewTab({ setActiveTab, loading }) {
  const [stats, setStats] = useState({
    totalCompetitions: 0,
    completedChallenges: 0,
    currentRank: 0,
    totalPoints: 0,
  });

  useEffect(() => {
    // Load stats from local storage
    const competitions = localStorageCRUD.get(LOCAL_STORAGE_KEYS.COMPETITIONS) || [];

    setStats({
      totalCompetitions: competitions.length,
      completedChallenges: 12, // Mock data
      currentRank: 42, // Mock data
      totalPoints: 850, // Mock data
    });
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Competitions" value={stats.totalCompetitions.toString()} icon={Trophy} className="bg-primary/10 border-primary/20" />
        <StatCard title="Completed Challenges" value={stats.completedChallenges.toString()} icon={CheckCircle} className="bg-success/10 border-success/20" />
        <StatCard title="Current Rank" value={`#${stats.currentRank}`} icon={TrendingUp} className="bg-accent/10 border-accent/20" />
        <StatCard title="Total Points" value={stats.totalPoints.toString()} icon={Star} className="bg-warning/10 border-warning/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={() => setActiveTab('competitions')} className="w-full justify-start">
              <Trophy className="w-4 h-4 mr-2" /> View Competitions
            </Button>
            <Button onClick={() => setActiveTab('challenges')} className="w-full justify-start" variant="outline">
              <Swords className="w-4 h-4 mr-2" /> View Challenges
            </Button>
            <Button onClick={() => setActiveTab('leaderboard')} className="w-full justify-start" variant="outline">
              <TrendingUp className="w-4 h-4 mr-2" /> View Leaderboard
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Math Competition</p>
                  <p className="text-xs text-muted-foreground">June 15, 2025</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-success" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Science Fair</p>
                  <p className="text-xs text-muted-foreground">June 20, 2025</p>
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

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        setCompetitions(localStorageCRUD.get(LOCAL_STORAGE_KEYS.COMPETITIONS) || []);
      } catch (error) {
        console.error('Error fetching competitions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitions();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold">Competitions</h2>
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
                  <TableHead>Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competitions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <Trophy className="w-12 h-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No competitions found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  competitions.map((competition) => (
                    <TableRow key={competition.id}>
                      <TableCell className="font-medium">{competition.name}</TableCell>
                      <TableCell>{competition.type}</TableCell>
                      <TableCell>{new Date(competition.start_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(competition.end_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={competition.is_active ? 'success' : 'destructive'}>
                          {competition.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" className="gradient-hero">
                            <Swords className="w-4 h-4" />
                            Join
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

function ChallengesTab() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        // Mock challenges data
        const mockChallenges = [
          { id: '1', name: 'Math Challenge', subject: 'Mathematics', difficulty: 'Medium', status: 'active' },
          { id: '2', name: 'Science Quiz', subject: 'Science', difficulty: 'Hard', status: 'active' },
          { id: '3', name: 'History Test', subject: 'History', difficulty: 'Easy', status: 'completed' },
        ];
        setChallenges(mockChallenges);
      } catch (error) {
        console.error('Error fetching challenges:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold">Challenges</h2>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground mt-2">Loading challenges...</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {challenges.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <Swords className="w-12 h-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No challenges found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  challenges.map((challenge) => (
                    <TableRow key={challenge.id}>
                      <TableCell className="font-medium">{challenge.name}</TableCell>
                      <TableCell>{challenge.subject}</TableCell>
                      <TableCell>
                        <Badge variant={challenge.difficulty === 'Easy' ? 'success' : challenge.difficulty === 'Medium' ? 'warning' : 'destructive'}>
                          {challenge.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={challenge.status === 'active' ? 'success' : 'outline'}>
                          {challenge.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" className="gradient-hero">
                            <Swords className="w-4 h-4" />
                            Start
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

function LeaderboardTab() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Mock leaderboard data
        const mockLeaderboard = Array(10).fill(0).map((_, index) => ({
          id: `user-${index}`,
          name: `Student ${index + 1}`,
          score: 1000 - (index * 50),
          rank: index + 1,
          badges: Math.floor(Math.random() * 5) + 1
        }));
        setLeaderboard(mockLeaderboard);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold">Leaderboard</h2>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground mt-2">Loading leaderboard...</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Badges</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <Trophy className="w-12 h-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No leaderboard data found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  leaderboard.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {entry.rank}
                        {entry.rank === 1 && <Crown className="w-4 h-4 text-gold ml-1" />}
                        {entry.rank === 2 && <Medal className="w-4 h-4 text-silver ml-1" />}
                        {entry.rank === 3 && <Medal className="w-4 h-4 text-bronze ml-1" />}
                      </TableCell>
                      <TableCell className="font-medium">{entry.name}</TableCell>
                      <TableCell>{entry.score} pts</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {Array(entry.badges).fill(0).map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-gold" />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
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

function MessagesTab() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setMessages(localStorageCRUD.get(LOCAL_STORAGE_KEYS.MESSAGES) || []);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold">Messages</h2>
        <Button className="gradient-hero">
          <Plus className="w-4 h-4 mr-2" />
          New Message
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground mt-2">Loading messages...</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <MessageSquare className="w-12 h-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No messages found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  messages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell className="font-medium">{message.subject}</TableCell>
                      <TableCell>{message.from}</TableCell>
                      <TableCell>{new Date(message.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={message.read ? 'outline' : 'success'}>
                          {message.read ? 'Read' : 'Unread'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
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
        {activeTab === 'overview' && <StudentOverviewTab setActiveTab={handleTabChange} loading={loading} />}
        {activeTab === 'competitions' && <CompetitionsTab />}
        {activeTab === 'challenges' && <ChallengesTab />}
        {activeTab === 'leaderboard' && <LeaderboardTab />}
        {activeTab === 'messages' && <MessagesTab />}
        {activeTab === 'profile' && <ProfileView />}
      </ErrorBoundary>
    </DashboardLayout>
  );
}