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
  GraduationCap
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

function TeacherSidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutTemplate },
    { id: 'students', label: 'My Students', icon: Users },
    { id: 'leaderboard', label: 'Class Leaderboard', icon: Trophy },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="w-64 border-r border-border/50 bg-card h-screen overflow-y-auto">
      <div className="p-4 border-b border-border/50">
        <h2 className="font-display font-bold text-lg">Teacher Dashboard</h2>
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

function TeacherOverview({ setActiveTab }) {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCompetitions: 0,
    completedLessons: 0,
    averageScore: 0,
  });

  useEffect(() => {
    // Load stats from local storage
    const users = localStorageCRUD.get(LOCAL_STORAGE_KEYS.USERS) || [];
    const competitions = localStorageCRUD.get(LOCAL_STORAGE_KEYS.COMPETITIONS) || [];

    setStats({
      totalStudents: users.filter(u => u.role === 'student').length,
      activeCompetitions: competitions.filter(c => c.is_active).length,
      completedLessons: 42, // Mock data
      averageScore: 85, // Mock data
    });
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Students" value={stats.totalStudents.toString()} icon={Users} className="bg-primary/10 border-primary/20" />
        <StatCard title="Active Competitions" value={stats.activeCompetitions.toString()} icon={Trophy} className="bg-accent/10 border-accent/20" />
        <StatCard title="Completed Lessons" value={stats.completedLessons.toString()} icon={CheckCircle} className="bg-success/10 border-success/20" />
        <StatCard title="Average Score" value={`${stats.averageScore}%`} icon={Star} className="bg-warning/10 border-warning/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={() => setActiveTab('students')} className="w-full justify-start">
              <Users className="w-4 h-4 mr-2" /> View Students
            </Button>
            <Button onClick={() => setActiveTab('leaderboard')} className="w-full justify-start" variant="outline">
              <Trophy className="w-4 h-4 mr-2" /> View Leaderboard
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Plus className="w-4 h-4 mr-2" /> Create Assignment
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

function StudentsTab() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const users = localStorageCRUD.get(LOCAL_STORAGE_KEYS.USERS) || [];
        setStudents(users.filter(u => u.role === 'student'));
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold">My Students</h2>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground mt-2">Loading students...</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <Users className="w-12 h-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No students found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.display_name || student.email}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.random() * 100}%` }} />
                          </div>
                          <span className="text-xs">{Math.floor(Math.random() * 100)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(student.last_active || Date.now()).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
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

function TeacherLeaderboardTab() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const users = localStorageCRUD.get(LOCAL_STORAGE_KEYS.USERS) || [];
        // Sort students by score (mock data)
        const studentsWithScores = users
          .filter(u => u.role === 'student')
          .map(student => ({
            ...student,
            score: Math.floor(Math.random() * 1000)
          }))
          .sort((a, b) => b.score - a.score);

        setStudents(studentsWithScores);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold">Class Leaderboard</h2>
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
                  <TableHead>Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <Trophy className="w-12 h-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No students found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student, index) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {index + 1}
                        {index === 0 && <Crown className="w-4 h-4 text-gold ml-1" />}
                        {index === 1 && <Medal className="w-4 h-4 text-silver ml-1" />}
                        {index === 2 && <Medal className="w-4 h-4 text-bronze ml-1" />}
                      </TableCell>
                      <TableCell className="font-medium">{student.display_name || student.email}</TableCell>
                      <TableCell>{student.score} pts</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {Array(Math.floor(Math.random() * 3) + 1).fill(0).map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-gold" />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(student.last_active || Date.now()).toLocaleDateString()}</TableCell>
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

// Main TeacherDashboard component
export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
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
      title="Lumora Teacher Dashboard"
      sidebar={<TeacherSidebar activeTab={activeTab} setActiveTab={handleTabChange} />}
    >
      <ErrorBoundary>
        {activeTab === 'overview' && <TeacherOverview setActiveTab={handleTabChange} />}
        {activeTab === 'students' && <StudentsTab />}
        {activeTab === 'leaderboard' && <TeacherLeaderboardTab />}
        {activeTab === 'messages' && <MessagesTab />}
        {activeTab === 'profile' && <ProfileView />}
      </ErrorBoundary>
    </DashboardLayout>
  );
}