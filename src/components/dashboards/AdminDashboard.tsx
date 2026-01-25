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
  GraduationCap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AdToggle } from '@/components/ads/AdToggle';

// Local storage utilities
const LOCAL_STORAGE_KEYS = {
  USERS: 'lumora_users',
  COMPETITIONS: 'lumora_competitions',
  QUESTIONS: 'lumora_questions',
  SCHOOLS: 'lumora_schools',
  APPROVALS: 'lumora_approvals',
  MESSAGES: 'lumora_messages',
  AVATARS: 'lumora_avatars',
  BADGES: 'lumora_badges',
  QUESTION_SETS: 'lumora_question_sets',
  GRADING_QUEUE: 'lumora_grading_queue'
};

// Generate random password
function generateRandomPassword(length = 12) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// Local storage CRUD operations
const localStorageCRUD = {
  get: (key) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return [];
    }
  },

  set: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error);
      return false;
    }
  },

  add: (key, item) => {
    const items = localStorageCRUD.get(key);
    items.push(item);
    return localStorageCRUD.set(key, items);
  },

  update: (key, id, updates) => {
    const items = localStorageCRUD.get(key);
    const updatedItems = items.map(item => item.id === id ? { ...item, ...updates } : item);
    return localStorageCRUD.set(key, updatedItems);
  },

  remove: (key, id) => {
    const items = localStorageCRUD.get(key);
    const filteredItems = items.filter(item => item.id !== id);
    return localStorageCRUD.set(key, filteredItems);
  }
};

function AdminSidebar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const { profile } = useAuth();
  const navItems = [
    { id: 'overview', icon: Users, label: 'Overview' },
    { id: 'schools', icon: School, label: 'Schools' },
    { id: 'competitions', icon: Trophy, label: 'Competitions' },
    { id: 'question-sets', icon: LayoutTemplate, label: 'Question Sets' },
    { id: 'questions', icon: FileQuestion, label: 'Questions' },
    { id: 'grading', icon: GraduationCap, label: 'Grading' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'avatars', icon: User, label: 'Avatars' },
    { id: 'approvals', icon: CheckSquare, label: 'Pending Approvals' },
    { id: 'leaderboard', icon: Trophy, label: 'Leaderboard' },
    { id: 'practice-manager', icon: LayoutTemplate, label: 'Practice Manager' },
    { id: 'messages', icon: MessageSquare, label: 'Messages' },
  ];

  return (
    <div className="flex flex-col h-full">
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
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
            <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-bold text-sm">
              {profile?.display_name?.substring(0, 2).toUpperCase() || 'AD'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{profile?.display_name || 'Admin'}</p>
              <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={() => setActiveTab('profile')}>
            <User className="w-3 h-3 mr-2" />
            Profile Settings
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  return (
    <DashboardLayout
      title="Lumora Admin Dashboard"
      sidebar={<AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />}
    >
      {activeTab === 'overview' && <AdminOverviewTab setActiveTab={setActiveTab} loading={loading} />}
      {activeTab === 'schools' && <SchoolsTab />}
      {activeTab === 'competitions' && <CompetitionsTab />}
      {activeTab === 'questions' && <QuestionsTab />}
      {activeTab === 'question-sets' && <QuestionSetsTab />}
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'avatars' && <AvatarsTab />}
      {activeTab === 'approvals' && <ApprovalsTab />}
      {activeTab === 'grading' && <GradingTab />}
      {activeTab === 'leaderboard' && <AdminLeaderboardTab />}
      {activeTab === 'practice-manager' && <PracticeManagerTab />}
      {activeTab === 'messages' && <MessagesTab />}
      {activeTab === 'profile' && <ProfileView />}
    </DashboardLayout>
  );
}

// Admin Overview Component
function AdminOverviewTab({ setActiveTab, loading }: { setActiveTab: (tab: string) => void, loading: boolean }) {
  const { toast } = useToast();
  const { profile } = useAuth();

  // Get stats from local storage
  const users = localStorageCRUD.get(LOCAL_STORAGE_KEYS.USERS);
  const competitions = localStorageCRUD.get(LOCAL_STORAGE_KEYS.COMPETITIONS);
  const questions = localStorageCRUD.get(LOCAL_STORAGE_KEYS.QUESTIONS);
  const pending = localStorageCRUD.get(LOCAL_STORAGE_KEYS.APPROVALS);

  const stats = {
    totalUsers: users.length,
    activeCompetitions: competitions.length,
    totalQuestions: questions.length,
    pendingReviews: pending.length
  };

  const quickActions = [
    { id: 'schools', icon: School, title: 'Manage Schools', description: 'Configure school access' },
    { id: 'competitions', icon: Trophy, title: 'Manage Competitions', description: 'Create and edit competitions' },
    { id: 'questions', icon: FileQuestion, title: 'Review Questions', description: 'Approve pending questions' },
    { id: 'grading', icon: GraduationCap, title: 'Grade Answers', description: 'Review student writing answers' },
    { id: 'question-sets', icon: LayoutTemplate, title: 'Question Sets', description: 'Organize questions into sets' },
    { id: 'users', icon: Users, label: 'User Management', description: 'Manage user accounts' },
    { id: 'avatars', icon: User, title: 'Manage Avatars', description: 'Upload and manage avatars' },
    { id: 'approvals', icon: CheckSquare, title: 'Pending Approvals', description: 'Review moderator actions' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Full control over platform activity and settings</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          className="bg-primary/10 border-primary/20"
        />
        <StatCard
          title="Active Competitions"
          value={stats.activeCompetitions.toString()}
          icon={Trophy}
          className="bg-accent/10 border-accent/20"
        />
        <StatCard
          title="Total Questions"
          value={stats.totalQuestions.toLocaleString()}
          icon={FileQuestion}
          className="bg-success/10 border-success/20"
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingReviews.toString()}
          icon={Clock}
          className="bg-warning/10 border-warning/20"
        />
      </div>

      {/* Ad Toggle for Admin */}
      <Card>
        <CardHeader>
          <CardTitle>Advertisement Settings</CardTitle>
          <CardDescription>Control ad visibility for users</CardDescription>
        </CardHeader>
        <CardContent>
          <AdToggle />
        </CardContent>
      </Card>

      {/* Demo Data Reset */}
      < Card >
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Reset demo data and verify system state</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
              <div>
                <h3 className="font-medium">Reset Demo Accounts</h3>
                <p className="text-sm text-muted-foreground">Resets scores, progress, and messages for demo accounts.</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Reset Data</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will reset scores and progress for all demo accounts and clear all messages.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive hover:bg-destructive/90"
                      onClick={() => {
                        const DEMO_EMAILS = [
                          'demo.admin@lumora.com',
                          'demo.moderator@lumora.com',
                          'demo.teacher@lumora.com',
                          'demo.student@lumora.com'
                        ];
                        const users = localStorageCRUD.get(LOCAL_STORAGE_KEYS.USERS);
                        const updatedUsers = users.map(u => {
                          if (DEMO_EMAILS.includes(u.email)) {
                            return {
                              ...u,
                              score: 0,
                              progress: 0,
                              competitions_attended: 0,
                              login_streak: 0
                            };
                          }
                          return u;
                        });
                        localStorageCRUD.set(LOCAL_STORAGE_KEYS.USERS, updatedUsers);
                        localStorageCRUD.set(LOCAL_STORAGE_KEYS.MESSAGES, []);
                        toast({ title: 'Demo data has been reset successfully' });
                        // Force reload to reflect changes in stats immediately or rely on next render if stats are pulled via context/effect
                        window.location.reload();
                      }}
                    >
                      Reset Data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card >

      {/* Quick Actions and Recent Activity in 2 columns */}
      < div className="grid md:grid-cols-2 gap-6" >
        {/* Quick Actions */}
        < Card >
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common admin tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={action.id}
                  onClick={() => setActiveTab(action.id)}
                  className={`p-4 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-left ${index === quickActions.length - 1 && quickActions.length % 2 === 1 ? 'md:col-span-2' : ''}`}
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
        </Card >

        {/* Recent Activity */}
        < Card >
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-center text-muted-foreground py-4">No recent activity</p>
            </div>
          </CardContent>
        </Card >
      </div >
    </div >
  );
}

function StatCard({ title, value, icon: Icon, className }: { title: string; value: string; icon: any; className?: string }) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className="p-2 rounded-lg bg-card">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Schools Tab Component
function SchoolsTab() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newSchool, setNewSchool] = useState({
    id: '',
    name: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    contact_email: '',
    contact_phone: '',
    is_active: true,
    created_at: '',
    updated_at: ''
  });
  const { toast } = useToast();
  const { profile } = useAuth();

  // Load schools from local storage
  useEffect(() => {
    setSchools(localStorageCRUD.get(LOCAL_STORAGE_KEYS.SCHOOLS));
  }, []);

  const filteredSchools = (schools || []).filter(school =>
    (school?.name || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
    (school?.city || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
    (school?.country || "").toLowerCase().includes((searchTerm || "").toLowerCase())
  );

  const handleAddSchool = async () => {
    if (!newSchool.name) {
      toast({ title: 'School name is required', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        localStorageCRUD.update(LOCAL_STORAGE_KEYS.SCHOOLS, newSchool.id, {
          ...newSchool,
          updated_at: new Date().toISOString()
        });
        toast({ title: 'School updated successfully!' });
      } else {
        const newId = `school-${Date.now()}`;
        const schoolToAdd = {
          ...newSchool,
          id: newId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        localStorageCRUD.add(LOCAL_STORAGE_KEYS.SCHOOLS, schoolToAdd);
        toast({ title: 'School added successfully!' });
      }

      setSchools(localStorageCRUD.get(LOCAL_STORAGE_KEYS.SCHOOLS));
      setIsAddDialogOpen(false);
      setIsEditing(false);
      setNewSchool({
        id: '', name: '', address: '', city: '', state: '', country: '', postal_code: '',
        contact_email: '', contact_phone: '', is_active: true, created_at: '', updated_at: ''
      });
    } catch (error) {
      toast({ title: 'Error saving school', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleDeleteSchool = async (id: string) => {
    setLoading(true);
    try {
      localStorageCRUD.remove(LOCAL_STORAGE_KEYS.SCHOOLS, id);
      setSchools(localStorageCRUD.get(LOCAL_STORAGE_KEYS.SCHOOLS));

      toast({ title: 'School deleted successfully!' });
    } catch (error) {
      toast({ title: 'Error deleting school', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Schools</h1>
          <p className="text-muted-foreground">Manage educational institutions</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gradient-hero">
          <Plus className="w-4 h-4 mr-2" />
          Add School
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schools List</CardTitle>
          <CardDescription>All registered educational institutions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search schools..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </div>
            ) : filteredSchools.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No schools found</p>
            ) : (
              <div className="space-y-4">
                {filteredSchools.map((school) => (
                  <div key={school.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{school.name}</h3>
                        <p className="text-xs text-muted-foreground">{school.city}, {school.country}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">{school.students || 0} students</span>
                          <span className="text-xs text-muted-foreground">Contact: {school.contact_email}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setNewSchool(school);
                            setIsEditing(true);
                            setIsAddDialogOpen(true);
                          }}
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
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add School Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit School' : 'Add New School'}</DialogTitle>
            <DialogDescription>{isEditing ? 'Update school details' : 'Register a new educational institution'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>School Name *</Label>
              <Input
                value={newSchool.name}
                onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                placeholder="e.g., Springfield High School"
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={newSchool.address}
                onChange={(e) => setNewSchool({ ...newSchool, address: e.target.value })}
                placeholder="123 Education Street"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={newSchool.city}
                  onChange={(e) => setNewSchool({ ...newSchool, city: e.target.value })}
                  placeholder="Springfield"
                />
              </div>
              <div className="space-y-2">
                <Label>State/Province</Label>
                <Input
                  value={newSchool.state}
                  onChange={(e) => setNewSchool({ ...newSchool, state: e.target.value })}
                  placeholder="Illinois"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Country</Label>
                <Input
                  value={newSchool.country}
                  onChange={(e) => setNewSchool({ ...newSchool, country: e.target.value })}
                  placeholder="United States"
                />
              </div>
              <div className="space-y-2">
                <Label>Postal Code</Label>
                <Input
                  value={newSchool.postal_code}
                  onChange={(e) => setNewSchool({ ...newSchool, postal_code: e.target.value })}
                  placeholder="12345"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  value={newSchool.contact_email}
                  onChange={(e) => setNewSchool({ ...newSchool, contact_email: e.target.value })}
                  placeholder="contact@school.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input
                  value={newSchool.contact_phone}
                  onChange={(e) => setNewSchool({ ...newSchool, contact_phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="is-active"
                checked={!!newSchool.is_active}
                onCheckedChange={(checked) => setNewSchool({ ...newSchool, is_active: !!checked })}
              />
              <Label htmlFor="is-active">Active School</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSchool} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                isEditing ? 'Save Changes' : 'Add School'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Competitions Tab Component
function CompetitionsTab() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newCompetition, setNewCompetition] = useState({
    id: '',
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    is_active: true,
    current_participants: 0,
    category: '',
    difficulty: 'medium',
    can_leave: true,
    created_at: '',
    updated_at: '',
    participating_schools: []
  });
  const [schools, setSchools] = useState([]);
  const [selectAllSchools, setSelectAllSchools] = useState(false);
  const { toast } = useToast();

  const fetchCompetitions = async () => {
    setLoading(true);
    try {
      // Fetch competitions from local storage
      const competitionsData = localStorageCRUD.get(LOCAL_STORAGE_KEYS.COMPETITIONS);
      setCompetitions(competitionsData);
    } catch (error) {
      toast({ title: 'Error fetching competitions', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const fetchSchools = async () => {
    try {
      const schoolsData = localStorageCRUD.get(LOCAL_STORAGE_KEYS.SCHOOLS);
      setSchools(schoolsData);
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  const filteredCompetitions = (competitions || []).filter(competition =>
    (competition?.name || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
    (competition?.description || "").toLowerCase().includes((searchTerm || "").toLowerCase())
  );

  useEffect(() => {
    fetchCompetitions();
    fetchSchools();
  }, []);

  const handleAddCompetition = async () => {
    if (!newCompetition.name) {
      toast({ title: 'Competition name is required', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        localStorageCRUD.update(LOCAL_STORAGE_KEYS.COMPETITIONS, newCompetition.id, {
          ...newCompetition,
          updated_at: new Date().toISOString()
        });
        toast({ title: 'Competition updated!' });
      } else {
        const newId = `comp-${Date.now()}`;
        const competitionToAdd = {
          ...newCompetition,
          id: newId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        localStorageCRUD.add(LOCAL_STORAGE_KEYS.COMPETITIONS, competitionToAdd);
        toast({ title: 'Competition added!' });
      }

      setCompetitions(localStorageCRUD.get(LOCAL_STORAGE_KEYS.COMPETITIONS));
      setIsAddDialogOpen(false);
      setIsEditing(false);
      setNewCompetition({
        id: '', name: '', description: '', start_date: '', end_date: '', is_active: true,
        current_participants: 0, category: '', difficulty: 'medium', can_leave: true,
        created_at: '', updated_at: '', participating_schools: []
      });
    } catch (error) {
      toast({ title: 'Error saving competition', variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleDeleteCompetition = async (id: string) => {
    setLoading(true);
    try {
      localStorageCRUD.remove(LOCAL_STORAGE_KEYS.COMPETITIONS, id);
      setCompetitions(localStorageCRUD.get(LOCAL_STORAGE_KEYS.COMPETITIONS));

      toast({ title: 'Competition deleted successfully!' });
    } catch (error) {
      toast({ title: 'Error deleting competition', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleSchoolSelection = (schoolId: string) => {
    setNewCompetition(prev => {
      const newSchools = prev.participating_schools.includes(schoolId)
        ? prev.participating_schools.filter(id => id !== schoolId)
        : [...prev.participating_schools, schoolId];
      return { ...prev, participating_schools: newSchools };
    });
  };

  const handleSelectAllSchools = () => {
    if (selectAllSchools) {
      setNewCompetition(prev => ({ ...prev, participating_schools: [] }));
    } else {
      setNewCompetition(prev => ({ ...prev, participating_schools: schools.map(school => school.id) }));
    }
    setSelectAllSchools(!selectAllSchools);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Competitions</h1>
          <p className="text-muted-foreground">Manage learning competitions</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gradient-hero">
          <Plus className="w-4 h-4 mr-2" />
          Add Competition
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Competitions List</CardTitle>
          <CardDescription>All available competitions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search competitions..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </div>
            ) : filteredCompetitions.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No competitions found</p>
            ) : (
              <div className="space-y-4">
                {filteredCompetitions.map((competition) => (
                  <div key={competition.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{competition.name}</h3>
                        <p className="text-xs text-muted-foreground">{competition.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${competition.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                            {competition.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setNewCompetition(competition);
                            setIsEditing(true);
                            setIsAddDialogOpen(true);
                          }}
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Competition Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Competition' : 'Add New Competition'}</DialogTitle>
            <DialogDescription>{isEditing ? 'Update competition settings' : 'Create a new learning competition'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Competition Name *</Label>
              <Input
                value={newCompetition.name}
                onChange={(e) => setNewCompetition({ ...newCompetition, name: e.target.value })}
                placeholder="e.g., Math Olympiad 2025"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newCompetition.description}
                onChange={(e) => setNewCompetition({ ...newCompetition, description: e.target.value })}
                placeholder="Describe the competition..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={newCompetition.start_date}
                  onChange={(e) => setNewCompetition({ ...newCompetition, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={newCompetition.end_date}
                  onChange={(e) => setNewCompetition({ ...newCompetition, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={newCompetition.category}
                  onChange={(e) => setNewCompetition({ ...newCompetition, category: e.target.value })}
                  placeholder="e.g., Math, Science, etc."
                />
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select
                  value={newCompetition.difficulty}
                  onValueChange={(value) => setNewCompetition({ ...newCompetition, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Participating Schools</Label>
              <div className="flex items-center gap-2 mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllSchools}
                  className="h-8"
                >
                  {selectAllSchools ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                {schools.map((school) => (
                  <div key={school.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`school-${school.id}`}
                      checked={newCompetition.participating_schools.includes(school.id)}
                      onCheckedChange={() => handleSchoolSelection(school.id)}
                    />
                    <Label htmlFor={`school-${school.id}`} className="text-sm font-normal cursor-pointer">
                      {school.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
              <Checkbox
                id="can-leave"
                checked={newCompetition.can_leave}
                onCheckedChange={(checked) => setNewCompetition({ ...newCompetition, can_leave: !!checked })}
              />
              <div className="space-y-1 leading-none">
                <Label htmlFor="can-leave" className="text-sm font-medium cursor-pointer">Allow Students to Leave</Label>
                <p className="text-[10px] text-muted-foreground italic">If unchecked, students cannot leave this competition once joined.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="is-active"
                checked={!!newCompetition.is_active}
                onCheckedChange={(checked) => setNewCompetition({ ...newCompetition, is_active: !!checked })}
              />
              <Label htmlFor="is-active">Active Competition</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCompetition} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Competition'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Questions Tab Component
function QuestionsTab() {
  const [questions, setQuestions] = useState([]);
  const [questionSets, setQuestionSets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    id: '',
    text: '',
    options: ['', '', '', ''],
    correct_answer: '',
    question_set_id: '',
    type: 'mcq' as 'mcq' | 'text',
    difficulty: 'medium',
    points: 10,
    explanation: '',
    exact_match_required: false,
    created_at: '',
    updated_at: ''
  });
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch questions and sets from local storage
      const questionsData = localStorageCRUD.get(LOCAL_STORAGE_KEYS.QUESTIONS);
      const questionSetsData = localStorageCRUD.get(LOCAL_STORAGE_KEYS.QUESTION_SETS);
      setQuestions(questionsData);
      setQuestionSets(questionSetsData);
    } catch (error) {
      toast({ title: 'Error fetching data', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const filteredQuestions = (questions || []).filter(question => {
    const questionSetName = (questionSets || []).find(qs => qs.id === question?.question_set_id)?.name || '';
    return (question?.text || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
      (questionSetName || "").toLowerCase().includes((searchTerm || "").toLowerCase());
  });

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddQuestion = async () => {
    if (!newQuestion.text || !newQuestion.correct_answer) {
      toast({ title: 'Question text and correct answer are required', variant: 'destructive' });
      return;
    }

    if (!newQuestion.question_set_id) {
      toast({ title: 'Please assign the question to a Question Set', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        localStorageCRUD.update(LOCAL_STORAGE_KEYS.QUESTIONS, newQuestion.id, {
          ...newQuestion,
          updated_at: new Date().toISOString()
        });
        toast({ title: 'Question updated successfully!' });
      } else {
        const newId = `question-${Date.now()}`;
        const questionToAdd = {
          ...newQuestion,
          id: newId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        localStorageCRUD.add(LOCAL_STORAGE_KEYS.QUESTIONS, questionToAdd);
        toast({ title: 'Question added successfully!' });
      }

      setQuestions(localStorageCRUD.get(LOCAL_STORAGE_KEYS.QUESTIONS));
      setIsAddDialogOpen(false);
      setIsEditing(false);
      setNewQuestion({
        id: '', text: '', type: 'mcq', options: ['', '', '', ''],
        correct_answer: '', question_set_id: '', difficulty: 'medium',
        points: 10, explanation: '', exact_match_required: false,
        created_at: '', updated_at: ''
      });
    } catch (error) {
      toast({ title: 'Error saving question', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleDeleteQuestion = async (id: string) => {
    setLoading(true);
    try {
      const questionToDelete = questions.find(q => q.id === id);

      localStorageCRUD.remove(LOCAL_STORAGE_KEYS.QUESTIONS, id);

      // Remove from Question Set
      if (questionToDelete && questionToDelete.question_set_id) {
        const targetSetIndex = questionSets.findIndex(qs => qs.id === questionToDelete.question_set_id);
        if (targetSetIndex !== -1) {
          const targetSet = questionSets[targetSetIndex];
          const updatedQuestions = (targetSet.questions || []).filter(q => q.id !== id);

          const updatedSet = { ...targetSet, questions: updatedQuestions };
          localStorageCRUD.update(LOCAL_STORAGE_KEYS.QUESTION_SETS, targetSet.id, { questions: updatedQuestions });

          const updatedSets = [...questionSets];
          updatedSets[targetSetIndex] = updatedSet;
          setQuestionSets(updatedSets);
        }
      }

      setQuestions(localStorageCRUD.get(LOCAL_STORAGE_KEYS.QUESTIONS));

      toast({ title: 'Question deleted successfully!' });
    } catch (error) {
      toast({ title: 'Error deleting question', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Questions</h1>
          <p className="text-muted-foreground">Manage competition questions</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gradient-hero">
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Questions List</CardTitle>
          <CardDescription>All available questions for competitions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </div>
            ) : filteredQuestions.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No questions found</p>
            ) : (
              <div className="space-y-4">
                {filteredQuestions.map((question) => (
                  <div key={question.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{question.text}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Set: {questionSets.find(qs => qs.id === question.question_set_id)?.name || 'Unassigned'} • Difficulty: {question.difficulty} • Type: {question.type === 'text' ? 'Writing' : 'MCQ'}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">{question.points} pts</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
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
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Question Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Question' : 'Add New Question'}</DialogTitle>
            <DialogDescription>{isEditing ? 'Update question content and points' : 'Create a new competition question'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Question Text *</Label>
              <Textarea
                value={newQuestion.text}
                onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                placeholder="What is the capital of France?"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Question Type</Label>
              <Select
                value={newQuestion.type}
                onValueChange={(value: 'mcq' | 'text') => setNewQuestion({ ...newQuestion, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mcq">Multiple Choice (MCQ)</SelectItem>
                  <SelectItem value="text">Writing Answer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Question Text *</Label>
              <Textarea
                value={newQuestion.text}
                onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                placeholder={newQuestion.type === 'mcq' ? "What is the capital of France?" : "Explain the theory of relativity..."}
                rows={3}
              />
            </div>

            {newQuestion.type === 'mcq' && (
              <div className="space-y-2">
                <Label>Options</Label>
                {newQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...newQuestion.options];
                        newOptions[index] = e.target.value;
                        setNewQuestion({ ...newQuestion, options: newOptions });
                      }}
                      placeholder={`Option ${index + 1}`}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNewQuestion({ ...newQuestion, correct_answer: option })}
                      className={newQuestion.correct_answer === option ? 'bg-success/10 border-success' : ''}
                    >
                      {newQuestion.correct_answer === option ? '✓ Correct' : 'Mark Correct'}
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {newQuestion.type === 'text' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Model Answer / Keywords (Optional)</Label>
                  <Textarea
                    value={newQuestion.correct_answer}
                    onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
                    placeholder="Enter keywords or a model answer for grading reference..."
                    rows={2}
                  />
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                  <Checkbox
                    id="exact-match-admin"
                    checked={newQuestion.exact_match_required}
                    onCheckedChange={(checked) => setNewQuestion({ ...newQuestion, exact_match_required: !!checked })}
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="exact-match-admin" className="text-sm font-medium cursor-pointer">Exact Match Required</Label>
                    <p className="text-[10px] text-muted-foreground italic">Case-sensitive & exact spacing required if checked.</p>
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Question Set</Label>
                <Select
                  value={newQuestion.question_set_id}
                  onValueChange={(value) => setNewQuestion({ ...newQuestion, question_set_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Question Set" />
                  </SelectTrigger>
                  <SelectContent>
                    {questionSets.map((qs) => (
                      <SelectItem key={qs.id} value={qs.id}>
                        {qs.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select
                  value={newQuestion.difficulty}
                  onValueChange={(value) => setNewQuestion({ ...newQuestion, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Points</Label>
              <Input
                type="number"
                value={newQuestion.points}
                onChange={(e) => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) || 0 })}
                placeholder="10"
              />
            </div>
            <div className="space-y-2">
              <Label>Explanation</Label>
              <Textarea
                value={newQuestion.explanation}
                onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                placeholder="Explain why this answer is correct..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddQuestion} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                isEditing ? 'Save Changes' : 'Add Question'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Question Sets Tab Component
function QuestionSetsTab() {
  const [questionSets, setQuestionSets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newQuestionSet, setNewQuestionSet] = useState({
    id: '',
    name: '',
    description: '',
    category: '',
    questions: [],
    time_limit: 0,
    allow_retries: true,
    scoring_type: 'highest', // 'highest', 'best_of_3', 'first_attempt'
    created_at: '',
    updated_at: ''
  });
  const { toast } = useToast();

  const fetchQuestionSets = async () => {
    setLoading(true);
    try {
      // Fetch question sets from local storage
      const questionSetsData = localStorageCRUD.get(LOCAL_STORAGE_KEYS.QUESTION_SETS);
      setQuestionSets(questionSetsData);
    } catch (error) {
      toast({ title: 'Error fetching question sets', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const filteredQuestionSets = (questionSets || []).filter(qs =>
    (qs?.name || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
    (qs?.description || "").toLowerCase().includes((searchTerm || "").toLowerCase())
  );

  useEffect(() => {
    fetchQuestionSets();
  }, []);

  const handleAddQuestionSet = async () => {
    if (!newQuestionSet.name) {
      toast({ title: 'Question set name is required', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        localStorageCRUD.update(LOCAL_STORAGE_KEYS.QUESTION_SETS, newQuestionSet.id, {
          ...newQuestionSet,
          updated_at: new Date().toISOString()
        });
        toast({ title: 'Question set updated!' });
      } else {
        const newId = `qset-${Date.now()}`;
        const questionSetToAdd = {
          ...newQuestionSet,
          id: newId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        localStorageCRUD.add(LOCAL_STORAGE_KEYS.QUESTION_SETS, questionSetToAdd);
        toast({ title: 'Question set added!' });
      }

      setQuestionSets(localStorageCRUD.get(LOCAL_STORAGE_KEYS.QUESTION_SETS));
      setIsAddDialogOpen(false);
      setIsEditing(false);
      setNewQuestionSet({
        id: '', name: '', description: '', category: '', questions: [],
        time_limit: 0, allow_retries: true, scoring_type: 'highest',
        created_at: '', updated_at: ''
      });
    } catch (error) {
      toast({ title: 'Error saving question set', variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleDeleteQuestionSet = async (id: string) => {
    setLoading(true);
    try {
      localStorageCRUD.remove(LOCAL_STORAGE_KEYS.QUESTION_SETS, id);
      setQuestionSets(localStorageCRUD.get(LOCAL_STORAGE_KEYS.QUESTION_SETS));

      toast({ title: 'Question set deleted successfully!' });
    } catch (error) {
      toast({ title: 'Error deleting question set', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Question Sets</h1>
          <p className="text-muted-foreground">Organize questions into sets for competitions</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gradient-hero">
          <Plus className="w-4 h-4 mr-2" />
          Add Question Set
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question Sets List</CardTitle>
          <CardDescription>All question sets for organizing competition questions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search question sets..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </div>
            ) : filteredQuestionSets.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No question sets found</p>
            ) : (
              <div className="space-y-4">
                {filteredQuestionSets.map((questionSet) => (
                  <div key={questionSet.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{questionSet.name}</h3>
                        <p className="text-xs text-muted-foreground">{questionSet.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">{questionSet.category}</span>
                          <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">{questionSet.category}</span>
                          <span className="text-xs text-muted-foreground">Questions: {questionSet.questions?.length || 0}</span>
                          {questionSet.time_limit > 0 && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {questionSet.time_limit} min
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground border px-2 py-0.5 rounded">
                            {questionSet.allow_retries ? 'Retries Allowed' : 'No Retries'}
                          </span>
                          <span className="text-xs text-muted-foreground border px-2 py-0.5 rounded capitalize">
                            Score: {questionSet.scoring_type?.replace(/_/g, ' ') || 'Highest'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
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
                              <AlertDialogTitle>Delete Question Set</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this question set? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={() => handleDeleteQuestionSet(questionSet.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Question Set Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Question Set' : 'Add New Question Set'}</DialogTitle>
            <DialogDescription>{isEditing ? 'Update question set details' : 'Create a new question set for organizing competition questions'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Question Set Name *</Label>
              <Input
                value={newQuestionSet.name}
                onChange={(e) => setNewQuestionSet({ ...newQuestionSet, name: e.target.value })}
                placeholder="e.g., Math Addition"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newQuestionSet.description}
                onChange={(e) => setNewQuestionSet({ ...newQuestionSet, description: e.target.value })}
                placeholder="Describe the question set..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input
                value={newQuestionSet.category}
                onChange={(e) => setNewQuestionSet({ ...newQuestionSet, category: e.target.value })}
                placeholder="e.g., Math, Science, etc."
              />
            </div>
            <div className="space-y-2">
              <Label>Time Limit (minutes)</Label>
              <Input
                type="number"
                value={newQuestionSet.time_limit}
                onChange={(e) => setNewQuestionSet({ ...newQuestionSet, time_limit: parseInt(e.target.value) || 0 })}
                placeholder="0 for no limit"
              />
              <p className="text-xs text-muted-foreground">Set to 0 for no time limit</p>
            </div>

            <div className="flex items-center justify-between border p-3 rounded-md">
              <div className="space-y-0.5">
                <Label>Allow Retries</Label>
                <p className="text-xs text-muted-foreground">Students can redo this set</p>
              </div>
              <Switch
                checked={newQuestionSet.allow_retries}
                onCheckedChange={(checked) => setNewQuestionSet({ ...newQuestionSet, allow_retries: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label>Scoring Strategy</Label>
              <Select
                value={newQuestionSet.scoring_type}
                onValueChange={(value) => setNewQuestionSet({ ...newQuestionSet, scoring_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select scoring type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="highest">Highest Score Achieved</SelectItem>
                  <SelectItem value="best_of_3">Best of 3 Attempts</SelectItem>
                  <SelectItem value="first_attempt">First Attempt Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddQuestionSet} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                isEditing ? 'Save Changes' : 'Add Question Set'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Avatars Tab Component
function AvatarsTab() {
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newAvatar, setNewAvatar] = useState({
    id: '',
    name: '',
    image_url: '',
    category: 'default',
    unlock_condition: { type: 'none', value: 0 },
    created_at: '',
    updated_at: ''
  });
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const { toast } = useToast();

  // Load avatars from local storage
  useEffect(() => {
    setAvatars(localStorageCRUD.get(LOCAL_STORAGE_KEYS.AVATARS));
  }, []);

  const filteredAvatars = (avatars || []).filter(avatar =>
    (avatar?.name || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
    (avatar?.category || "").toLowerCase().includes((searchTerm || "").toLowerCase())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFilePreview(event.target?.result as string);
        setNewAvatar({ ...newAvatar, image_url: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddAvatar = async () => {
    if (!newAvatar.name || !newAvatar.image_url) {
      toast({ title: 'Name and image are required', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        localStorageCRUD.update(LOCAL_STORAGE_KEYS.AVATARS, newAvatar.id, {
          ...newAvatar,
          updated_at: new Date().toISOString()
        });
        toast({ title: 'Avatar updated!' });
      } else {
        const newId = `avatar-${Date.now()}`;
        const avatarToAdd = {
          ...newAvatar,
          id: newId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        localStorageCRUD.add(LOCAL_STORAGE_KEYS.AVATARS, avatarToAdd);
        toast({ title: 'Avatar added!' });
      }

      setAvatars(localStorageCRUD.get(LOCAL_STORAGE_KEYS.AVATARS));
      setIsAddDialogOpen(false);
      setIsEditing(false);
      setNewAvatar({
        id: '', name: '', image_url: '', category: 'default',
        unlock_condition: { type: 'none', value: 0 },
        created_at: '', updated_at: ''
      });
      setFilePreview(null);
    } catch (error) {
      toast({ title: 'Error saving avatar', variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleDeleteAvatar = async (id: string) => {
    setLoading(true);
    try {
      localStorageCRUD.remove(LOCAL_STORAGE_KEYS.AVATARS, id);
      setAvatars(localStorageCRUD.get(LOCAL_STORAGE_KEYS.AVATARS));

      toast({ title: 'Avatar deleted successfully!' });
    } catch (error) {
      toast({ title: 'Error deleting avatar', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Avatars</h1>
          <p className="text-muted-foreground">Manage user avatars</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gradient-hero">
          <Plus className="w-4 h-4 mr-2" />
          Add Avatar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Avatars List</CardTitle>
          <CardDescription>All available avatars for users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search avatars..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </div>
            ) : filteredAvatars.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No avatars found</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {filteredAvatars.map((avatar) => (
                  <div key={avatar.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center gap-3">
                      <img src={avatar.image_url} alt={avatar.name} className="w-16 h-16 rounded-full object-cover" />
                      <div className="text-center">
                        <h3 className="font-medium text-sm">{avatar.name}</h3>
                        <p className="text-xs text-muted-foreground">{avatar.category}</p>
                        {avatar.unlock_condition && avatar.unlock_condition.type && avatar.unlock_condition.type !== 'none' && (
                          <div className="mt-1 text-[10px] px-2 py-0.5 bg-accent/10 border border-accent/20 rounded-full text-accent-foreground flex items-center justify-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>
                              {avatar.unlock_condition?.type === 'streak'
                                ? `${avatar.unlock_condition.value} Day Streak`
                                : avatar.unlock_condition?.type === 'competitions'
                                  ? `${avatar.unlock_condition.value} Competitions`
                                  : `${avatar.unlock_condition.value} Questions`}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
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
                              <AlertDialogTitle>Delete Avatar</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this avatar? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={() => handleDeleteAvatar(avatar.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Avatar Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Avatar' : 'Add New Avatar'}</DialogTitle>
            <DialogDescription>{isEditing ? 'Update avatar image and settings' : 'Upload a new avatar image'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Avatar Name *</Label>
              <Input
                value={newAvatar.name}
                onChange={(e) => setNewAvatar({ ...newAvatar, name: e.target.value })}
                placeholder="e.g., Student Avatar"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input
                value={newAvatar.category}
                onChange={(e) => setNewAvatar({ ...newAvatar, category: e.target.value })}
                placeholder="e.g., default, student, teacher"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Unlock Type</Label>
                <Select
                  value={newAvatar.unlock_condition?.type || 'none'}
                  onValueChange={(value) => setNewAvatar({
                    ...newAvatar,
                    unlock_condition: { ...newAvatar.unlock_condition, type: value, value: newAvatar.unlock_condition?.value || 0 }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Restriction</SelectItem>
                    <SelectItem value="questions">Questions Answered</SelectItem>
                    <SelectItem value="streak">Login Streak</SelectItem>
                    <SelectItem value="competitions">Competitions Attended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Threshold Value</Label>
                <Input
                  type="number"
                  disabled={!newAvatar.unlock_condition?.type || newAvatar.unlock_condition.type === 'none'}
                  value={newAvatar.unlock_condition?.value || 0}
                  onChange={(e) => setNewAvatar({
                    ...newAvatar,
                    unlock_condition: { ...newAvatar.unlock_condition, value: parseInt(e.target.value) || 0 }
                  })}
                  placeholder="e.g. 50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Avatar Image *</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {filePreview && (
                  <div className="w-16 h-16 rounded-full overflow-hidden">
                    <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddAvatar} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                isEditing ? 'Save Changes' : 'Add Avatar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Users Tab Component
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isBulkAddDialogOpen, setIsBulkAddDialogOpen] = useState(false);
  const [showAddUserPassword, setShowAddUserPassword] = useState(false);
  const [showBulkStudentPassword, setShowBulkStudentPassword] = useState(false);
  const [showBulkTeacherPassword, setShowBulkTeacherPassword] = useState(false);
  const [newUser, setNewUser] = useState({
    id: '',
    email: '',
    display_name: '',
    role: 'student',
    school_id: '',
    password: '',
    is_active: true,
    score: 0,
    progress: 0,
    avatar_id: null,
    created_at: '',
    updated_at: ''
  });

  // Bulk states
  const [bulkStudents, setBulkStudents] = useState('');
  const [bulkTeachers, setBulkTeachers] = useState('');
  const [bulkStudentSchoolId, setBulkStudentSchoolId] = useState('');
  const [bulkTeacherSchoolId, setBulkTeacherSchoolId] = useState('');
  const [bulkStudentPassword, setBulkStudentPassword] = useState('');
  const [bulkTeacherPassword, setBulkTeacherPassword] = useState('');

  const { toast } = useToast();
  const { profile } = useAuth();

  const fetchUsersAndSchools = async () => {
    setUsers(localStorageCRUD.get(LOCAL_STORAGE_KEYS.USERS));
    setSchools(localStorageCRUD.get(LOCAL_STORAGE_KEYS.SCHOOLS));
  };

  useEffect(() => {
    fetchUsersAndSchools();
  }, []);

  // Add null check for users
  const filteredUsers = (users || []).filter(user =>
    (user?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (roleFilter === 'all' || user?.role === roleFilter)
  );

  const handleAddUser = async () => {
    if (!newUser.email) {
      toast({ title: 'Email is required', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        localStorageCRUD.update(LOCAL_STORAGE_KEYS.USERS, newUser.id, {
          ...newUser,
          updated_at: new Date().toISOString()
        });
        toast({ title: 'User updated successfully!' });
      } else {
        if (!newUser.password) newUser.password = generateRandomPassword();
        if (!newUser.display_name) newUser.display_name = newUser.email.split('@')[0];

        const newId = `user-${Date.now()}`;
        const userToAdd = {
          ...newUser,
          id: newId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        localStorageCRUD.add(LOCAL_STORAGE_KEYS.USERS, userToAdd);
        toast({ title: 'User added!', description: `Password: ${userToAdd.password}` });
      }

      setUsers(localStorageCRUD.get(LOCAL_STORAGE_KEYS.USERS));
      setIsAddDialogOpen(false);
      setIsEditing(false);
      setNewUser({
        id: '', email: '', display_name: '', role: 'student', school_id: '',
        password: '', is_active: true, score: 0, progress: 0, avatar_id: null,
        created_at: '', updated_at: ''
      });
    } catch (error) {
      toast({ title: 'Error saving user', variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleBulkAdd = async (role: 'student' | 'teacher') => {
    const data = role === 'student' ? bulkStudents : bulkTeachers;
    const schoolId = role === 'student' ? bulkStudentSchoolId : bulkTeacherSchoolId;
    const password = role === 'student' ? bulkStudentPassword : bulkTeacherPassword;

    if (!data.trim()) {
      toast({ title: `Please enter ${role} emails`, variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const lines = data.split('\n').filter(line => line.trim());
      const usersToAdd = [];
      const commonPassword = password || generateRandomPassword();

      for (const line of lines) {
        const email = line.trim();
        if (!email) continue;
        const displayName = email.split('@')[0];

        usersToAdd.push({
          id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          email,
          display_name: displayName,
          role: role,
          school_id: schoolId || null,
          password: commonPassword,
          is_active: true,
          score: 0,
          progress: 0,
          avatar_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      usersToAdd.forEach(user => localStorageCRUD.add(LOCAL_STORAGE_KEYS.USERS, user));
      setUsers(localStorageCRUD.get(LOCAL_STORAGE_KEYS.USERS));

      toast({
        title: `Bulk ${role}s added!`,
        description: `${usersToAdd.length} accounts created.`
      });

      if (role === 'student') { setBulkStudents(''); setBulkStudentPassword(''); }
      else { setBulkTeachers(''); setBulkTeacherPassword(''); }

      setIsBulkAddDialogOpen(false);
    } catch (error) {
      toast({ title: 'Error adding users', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleDeleteUser = async (id: string) => {
    setLoading(true);
    try {
      localStorageCRUD.remove(LOCAL_STORAGE_KEYS.USERS, id);
      setUsers(localStorageCRUD.get(LOCAL_STORAGE_KEYS.USERS));

      toast({ title: 'User deleted successfully!' });
    } catch (error) {
      toast({ title: 'Error deleting user', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setLoading(true);
    try {
      // Find the user and update their role
      const userToUpdate = users.find(user => user.id === userId);
      if (!userToUpdate) return;

      const updatedUser = {
        ...userToUpdate,
        role: newRole,
        updated_at: new Date().toISOString()
      };

      // Update in local storage
      localStorageCRUD.update(LOCAL_STORAGE_KEYS.USERS, userId, updatedUser);
      setUsers(localStorageCRUD.get(LOCAL_STORAGE_KEYS.USERS));

      toast({ title: 'User role updated successfully!' });
    } catch (error) {
      toast({ title: 'Error updating user role', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Users</h1>
          <p className="text-muted-foreground">Manage all users</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddDialogOpen(true)} className="gradient-hero">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
          <Button onClick={() => setIsBulkAddDialogOpen(true)} variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Bulk Add
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
          <CardDescription>All platform users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                  <SelectItem value="moderator">Moderators</SelectItem>
                  <SelectItem value="teacher">Teachers</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No users found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="p-3 text-left font-medium">Name</th>
                      <th className="p-3 text-left font-medium">Email</th>
                      <th className="p-3 text-left font-medium">Role</th>
                      <th className="p-3 text-left font-medium">School</th>
                      <th className="p-3 text-left font-medium">Status</th>
                      <th className="p-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-border/50 last:border-none hover:bg-muted/50 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                              {(user?.display_name || user?.email || '??').split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                            <span>{user.display_name || 'No name'}</span>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">{user.email}</td>
                        <td className="p-3">
                          <Select
                            value={user.role}
                            onValueChange={(selectedValue) => handleRoleChange(user.id, selectedValue)}
                            disabled={user.id === profile?.id}
                          >
                            <SelectTrigger className="w-[120px] h-8">
                              <SelectValue placeholder={user.role} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="teacher">Teacher</SelectItem>
                              <SelectItem value="moderator">Moderator</SelectItem>
                              {profile?.role === 'admin' && <SelectItem value="admin">Admin</SelectItem>}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-3 text-muted-foreground">{user.school_id || 'N/A'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs capitalize ${user.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                            {user.is_active ? 'active' : 'inactive'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                setNewUser(user);
                                setIsEditing(true);
                                setIsAddDialogOpen(true);
                              }}
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
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>{isEditing ? 'Update account information' : 'Create a new user account'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="user@school.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Display Name (optional)</Label>
              <Input
                value={newUser.display_name}
                onChange={(e) => setNewUser({ ...newUser, display_name: e.target.value })}
                placeholder="John Doe"
              />
              <p className="text-xs text-muted-foreground">If left empty, will use the email prefix</p>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  {profile?.role === 'admin' && <SelectItem value="admin">Admin</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>School ID (optional)</Label>
              <Input
                value={newUser.school_id}
                onChange={(e) => setNewUser({ ...newUser, school_id: e.target.value })}
                placeholder="school123"
              />
            </div>
            <div className="space-y-2">
              <Label>Password (optional)</Label>
              <div className="relative">
                <Input
                  type={showAddUserPassword ? "text" : "password"}
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Leave empty to auto-generate"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowAddUserPassword(!showAddUserPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showAddUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">If left empty, a secure password will be auto-generated</p>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="is-active"
                checked={!!newUser.is_active}
                onCheckedChange={(checked) => setNewUser({ ...newUser, is_active: !!checked })}
              />
              <Label htmlFor="is-active">Active User</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddUser} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Add Users Dialog */}
      <Dialog open={isBulkAddDialogOpen} onOpenChange={setIsBulkAddDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Bulk Import Management</DialogTitle>
            <DialogDescription>Quickly onboard groups of students or teachers</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="students" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="students" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" /> Students
              </TabsTrigger>
              <TabsTrigger value="teachers" className="flex items-center gap-2">
                <Users className="w-4 h-4" /> Teachers
              </TabsTrigger>
            </TabsList>

            <TabsContent value="students" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Student Emails (One per line)</Label>
                <Textarea
                  value={bulkStudents}
                  onChange={(e) => setBulkStudents(e.target.value)}
                  placeholder="student1@school.com\nstudent2@school.com"
                  rows={8}
                  className="font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Assign to School</Label>
                  <Select value={bulkStudentSchoolId} onValueChange={setBulkStudentSchoolId}>
                    <SelectTrigger><SelectValue placeholder="Select school" /></SelectTrigger>
                    <SelectContent>
                      {schools.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Common Password</Label>
                  <div className="relative">
                    <Input
                      type={showBulkStudentPassword ? "text" : "password"}
                      value={bulkStudentPassword}
                      onChange={(e) => setBulkStudentPassword(e.target.value)}
                      placeholder="Leave empty for individual random"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowBulkStudentPassword(!showBulkStudentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showBulkStudentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <Button onClick={() => handleBulkAdd('student')} className="w-full gradient-hero" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                Import All Students
              </Button>
            </TabsContent>

            <TabsContent value="teachers" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Teacher Emails (One per line)</Label>
                <Textarea
                  value={bulkTeachers}
                  onChange={(e) => setBulkTeachers(e.target.value)}
                  placeholder="teacher1@school.com\nteacher2@school.com"
                  rows={8}
                  className="font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Assign to School</Label>
                  <Select value={bulkTeacherSchoolId} onValueChange={setBulkTeacherSchoolId}>
                    <SelectTrigger><SelectValue placeholder="Select school" /></SelectTrigger>
                    <SelectContent>
                      {schools.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Common Password</Label>
                  <div className="relative">
                    <Input
                      type={showBulkTeacherPassword ? "text" : "password"}
                      value={bulkTeacherPassword}
                      onChange={(e) => setBulkTeacherPassword(e.target.value)}
                      placeholder="Leave empty for individual random"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowBulkTeacherPassword(!showBulkTeacherPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showBulkTeacherPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <Button onClick={() => handleBulkAdd('teacher')} className="w-full gradient-hero" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                Import All Teachers
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Approvals Tab Component
function ApprovalsTab() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();

  // Load approvals from local storage
  useEffect(() => {
    setApprovals(localStorageCRUD.get(LOCAL_STORAGE_KEYS.APPROVALS));
  }, []);

  const handleApprove = async (id: string, type: string) => {
    setLoading(true);
    try {
      const approval = approvals.find(a => a.id === id);
      if (!approval) return;

      // For admin dashboard, we can approve all types
      const allowedTypes = [
        'question', 'question_delete', 'competition', 'competition_delete',
        'school', 'school_delete', 'user', 'user_delete', 'avatar', 'avatar_delete',
        'question_set', 'question_set_delete', 'bulk_users', 'user_role_change', 'message'
      ];

      if (!allowedTypes.includes(type)) {
        toast({ title: 'You cannot approve this type of request', variant: 'destructive' });
        return;
      }

      // Update the approval status
      localStorageCRUD.update(LOCAL_STORAGE_KEYS.APPROVALS, id, { status: 'approved' });
      setApprovals(localStorageCRUD.get(LOCAL_STORAGE_KEYS.APPROVALS));

      // EXECUTE THE ACTION based on type
      if (type === 'message') {
        const messageToAdd = {
          ...approval.data,
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: profile.id
        };
        localStorageCRUD.add(LOCAL_STORAGE_KEYS.MESSAGES, messageToAdd);
      }
      // Add other types handling here if needed for the broader app fix, 
      // but strictly focusing on user request for messaging first.

      toast({
        title: 'Request approved!',
        description: 'The request has been approved and processed.'
      });
    } catch (error) {
      toast({ title: 'Error approving request', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleReject = async (id: string) => {
    setLoading(true);
    try {
      // Update the approval status
      localStorageCRUD.update(LOCAL_STORAGE_KEYS.APPROVALS, id, { status: 'rejected' });
      setApprovals(localStorageCRUD.get(LOCAL_STORAGE_KEYS.APPROVALS));

      toast({
        title: 'Request rejected!',
        description: 'The request has been rejected.'
      });
    } catch (error) {
      toast({ title: 'Error rejecting request', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Pending Approvals</h1>
        <p className="text-muted-foreground">Review and approve moderator actions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Approval Requests</CardTitle>
          <CardDescription>Requests that need your review</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </div>
            ) : approvals.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No pending approvals</p>
            ) : (
              approvals.map((approval) => (
                <div key={approval.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${approval.status === 'pending'
                          ? 'bg-warning/10 text-warning'
                          : approval.status === 'approved'
                            ? 'bg-success/10 text-success'
                            : 'bg-destructive/10 text-destructive'
                          }`}>
                          {approval.status}
                        </span>
                        <h3 className="font-medium">{getApprovalTitle(approval.type)}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Requested by: {approval.created_by_name}</p>
                      <p className="text-xs text-muted-foreground">Date: {new Date(approval.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => handleApprove(approval.id, approval.type)}
                        disabled={approval.status !== 'pending'}
                      >
                        <CheckCircle className="w-3 h-3 text-success" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => handleReject(approval.id)}
                        disabled={approval.status !== 'pending'}
                      >
                        <XCircle className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getApprovalTitle(type: string) {
  const titles = {
    'question': 'New Question',
    'question_delete': 'Delete Question',
    'competition': 'New Competition',
    'competition_delete': 'Delete Competition',
    'school': 'New School',
    'school_delete': 'Delete School',
    'user': 'New User',
    'user_delete': 'Delete User',
    'avatar': 'New Avatar',
    'avatar_delete': 'Delete Avatar',
    'question_set': 'New Question Set',
    'question_set_delete': 'Delete Question Set',
    'bulk_users': 'Bulk User Creation',
    'user_role_change': 'User Role Change',
    'message': 'New Message'
  };
  return titles[type] || type;
}

// Grading Tab Component
function GradingTab() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [gradeInput, setGradeInput] = useState({ score: 0, feedback: '' });
  const { toast } = useToast();

  useEffect(() => {
    setQueue(localStorageCRUD.get(LOCAL_STORAGE_KEYS.GRADING_QUEUE));
  }, []);

  const handleGrade = () => {
    if (!selectedItem) return;

    // Validate Score
    const maxPoints = selectedItem.max_points || 0;
    if (gradeInput.score < 0 || gradeInput.score > maxPoints) {
      toast({ title: `Score must be between 0 and ${maxPoints}`, variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // 1. Update status in Queue
      localStorageCRUD.update(LOCAL_STORAGE_KEYS.GRADING_QUEUE, selectedItem.id, {
        status: 'graded',
        assigned_score: gradeInput.score,
        feedback: gradeInput.feedback,
        graded_at: new Date().toISOString()
      });

      const allResults = localStorageCRUD.get('lumora_results');

      const resultIndex = allResults.findIndex(r => r.id === selectedItem.result_id);
      if (resultIndex !== -1) {
        const result = allResults[resultIndex];
        const oldScore = result.score || 0;
        const newScore = oldScore + gradeInput.score;

        const updatedResult = {
          ...result,
          score: newScore,
          answers: { ...result.answers, [selectedItem.question_id]: `[GRADED] ${result.answers[selectedItem.question_id]}` }
        };

        allResults[resultIndex] = updatedResult;
        localStorageCRUD.set('lumora_results', allResults);

        // 3. Update User Profile Total Score (Manual Adjustment)
        const users = localStorageCRUD.get(LOCAL_STORAGE_KEYS.USERS);
        const userIndex = users.findIndex(u => u.id === selectedItem.student_id);
        if (userIndex !== -1) {
          users[userIndex].score = (users[userIndex].score || 0) + gradeInput.score;
          localStorageCRUD.set(LOCAL_STORAGE_KEYS.USERS, users);
        }
      }

      setQueue(localStorageCRUD.get(LOCAL_STORAGE_KEYS.GRADING_QUEUE));
      setSelectedItem(null);
      toast({ title: 'Grade submitted successfully' });

    } catch (error) {
      toast({ title: 'Error submitting grade', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const pendingItems = queue.filter(item => item.status === 'pending');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Grading Queue</h1>
        <p className="text-muted-foreground">Review and grade student writing answers</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Reviews ({pendingItems.length})</CardTitle>
          <CardDescription>Items waiting for manual grading</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No items pending grading.</p>
          ) : (
            <div className="space-y-4">
              {pendingItems.map(item => (
                <div key={item.id} className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition opacity">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-full mb-2 inline-block">
                        {item.question_set_name || 'Question Set'}
                      </span>
                      <h3 className="font-semibold">{item.question_text}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground">Max Points: {item.max_points}</span>
                      <p className="text-xs text-muted-foreground">{new Date(item.submitted_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="bg-muted p-3 rounded-md mb-3">
                    <p className="text-sm font-medium mb-1 text-muted-foreground">Student Answer:</p>
                    <p className="text-sm">{item.answer}</p>
                  </div>

                  {item.model_answer && (
                    <div className="bg-muted/50 p-2 rounded-md mb-3 border-l-2 border-primary/50">
                      <p className="text-xs font-medium text-muted-foreground">Model Answer:</p>
                      <p className="text-xs italic">{item.model_answer}</p>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button size="sm" onClick={() => {
                      setSelectedItem(item);
                      setGradeInput({ score: 0, feedback: '' });
                    }}>
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Grade
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grade Answer</DialogTitle>
            <DialogDescription>Assign points and provide feedback</DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Score (Max: {selectedItem.max_points})</Label>
                <Input
                  type="number"
                  min="0"
                  max={selectedItem.max_points}
                  value={gradeInput.score}
                  onChange={(e) => setGradeInput({ ...gradeInput, score: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Feedback (Optional)</Label>
                <Textarea
                  placeholder="Great job, but..."
                  value={gradeInput.feedback}
                  onChange={(e) => setGradeInput({ ...gradeInput, feedback: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedItem(null)}>Cancel</Button>
            <Button onClick={handleGrade} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Grade'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [newMessage, setNewMessage] = useState({
    recipientRole: 'student', // 'student', 'teacher', 'moderator', 'all'
    recipientId: '', // Optional, for specific user
    subject: '',
    content: ''
  });

  const filteredMessages = messages.filter(message =>
    (message.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (message.sender || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (message.content || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const messagesData = localStorageCRUD.get(LOCAL_STORAGE_KEYS.MESSAGES);
      // Filter for messages relevant to admin (sent by admin, or approved messages visible to everyone if we want, but usually admin sees all)
      // For now, show all messages
      setMessages(messagesData.reverse()); // Show newest first
    } catch (error) {
      // toast({ title: 'Error fetching messages', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleSendMessage = async () => {
    if (!newMessage.subject || !newMessage.content) {
      toast({ title: 'Subject and Content are required', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const msg = {
        id: `msg-${Date.now()}`,
        sender: profile.display_name || 'Admin',
        senderId: profile.id,
        senderRole: 'admin',
        recipientRole: newMessage.recipientRole,
        recipientId: newMessage.recipientId || null,
        subject: newMessage.subject,
        content: newMessage.content,
        date: new Date().toISOString(),
        read: false,
        status: 'approved', // Admin messages are auto-approved
        replies: []
      };

      localStorageCRUD.add(LOCAL_STORAGE_KEYS.MESSAGES, msg);
      fetchMessages();
      setIsComposeOpen(false);
      setNewMessage({ recipientRole: 'student', recipientId: '', subject: '', content: '' });
      toast({ title: 'Message sent successfully!' });
    } catch (error) {
      toast({ title: 'Error sending message', variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleSendReply = async () => {
    if (!replyContent || !selectedMessage) return;

    setSendingReply(true);
    try {
      // Add reply to message
      const updatedMessage = {
        ...selectedMessage,
        replies: [...(selectedMessage.replies || []), {
          id: `reply-${Date.now()}`,
          sender: profile.display_name || 'Admin',
          senderId: profile.id,
          content: replyContent,
          date: new Date().toISOString()
        }]
      };

      localStorageCRUD.update(LOCAL_STORAGE_KEYS.MESSAGES, selectedMessage.id, updatedMessage);
      fetchMessages();
      setSelectedMessage(updatedMessage);
      toast({ title: 'Reply sent successfully!' });
      setReplyContent('');
    } catch (error) {
      toast({ title: 'Error sending reply', description: error.message, variant: 'destructive' });
    }
    setSendingReply(false);
  };

  const handleDeleteMessage = async (messageId: string) => {
    setLoading(true);
    try {
      localStorageCRUD.remove(LOCAL_STORAGE_KEYS.MESSAGES, messageId);
      fetchMessages();
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
      toast({ title: 'Message deleted successfully!' });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Messages</h1>
          <p className="text-muted-foreground">User communications</p>
        </div>
        <Button onClick={() => setIsComposeOpen(true)} className="gradient-hero">
          <Plus className="w-4 h-4 mr-2" />
          Compose
        </Button>
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
                        className={`w-full text-left p-3 rounded-lg transition-colors ${selectedMessage?.id === message.id
                          ? 'bg-primary/10 border border-primary'
                          : 'hover:bg-muted/50'
                          } ${!message.read && 'border-l-2 border-primary'}`}
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

      {/* Compose Message Dialog */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Compose Message</DialogTitle>
            <DialogDescription>Send a message to a student, teacher, or moderator.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Recipient Type</Label>
                <Select
                  value={newMessage.recipientRole}
                  onValueChange={(val: any) => setNewMessage({ ...newMessage, recipientRole: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="teacher">Teachers</SelectItem>
                    <SelectItem value="moderator">Moderators</SelectItem>
                    <SelectItem value="all">All Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Specific Email (Optional)</Label>
                <Input
                  placeholder="user@example.com"
                  value={newMessage.recipientId}
                  onChange={(e) => setNewMessage({ ...newMessage, recipientId: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                placeholder="Message subject"
                value={newMessage.subject}
                onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                placeholder="Type your message here..."
                rows={10}
                value={newMessage.content}
                onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsComposeOpen(false)}>Cancel</Button>
            <Button onClick={handleSendMessage} disabled={loading || !newMessage.subject || !newMessage.content} className="gradient-hero">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MessageSquare className="w-4 h-4 mr-2" />}
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Admin Leaderboard Tab Component
function AdminLeaderboardTab() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [users, setUsers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompId, setSelectedCompId] = useState('all');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const comps = localStorage.getItem('lumora_competitions') ? JSON.parse(localStorage.getItem('lumora_competitions')) : [];
      setCompetitions(comps);

      const usersData = localStorage.getItem('lumora_users') ? JSON.parse(localStorage.getItem('lumora_users')) : [];
      setUsers(usersData);

      const schoolsData = localStorage.getItem('lumora_schools') ? JSON.parse(localStorage.getItem('lumora_schools')) : [];
      setSchools(schoolsData);

      // Filter by competition if selected, exclude non-students
      let filteredData = usersData.filter(u => u.role === 'student');

      if (selectedCompId !== 'all') {
        const results = localStorage.getItem('lumora_results') ? JSON.parse(localStorage.getItem('lumora_results')) : [];
        const compResults = results.filter(r => r.question_set_id === selectedCompId || r.competition_id === selectedCompId);

        const userScores = {};
        compResults.forEach(r => {
          if (!userScores[r.student_id] || r.score > userScores[r.student_id]) {
            userScores[r.student_id] = r.score;
          }
        });

        filteredData = filteredData
          .filter(u => userScores[u.id] !== undefined)
          .map(u => ({ ...u, score: userScores[u.id] }));
      }

      const sortedUsers = filteredData.sort((a, b) => (b.score || 0) - (a.score || 0));
      setLeaderboardData(sortedUsers);
    } catch (error) {
      toast({ title: 'Error fetching leaderboard', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInitialData();
  }, [selectedCompId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Global Leaderboard</h1>
          <p className="text-muted-foreground">Master view of platform-wide performance</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium whitespace-nowrap text-muted-foreground">Filter by Competition:</span>
          <div className="w-[250px]">
            <Select value={selectedCompId} onValueChange={setSelectedCompId}>
              <SelectTrigger>
                <SelectValue placeholder="All Competitions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Competitions</SelectItem>
                {competitions.map((comp) => (
                  <SelectItem key={comp.id} value={comp.id}>{comp.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Student Rankings</CardTitle>
              <CardDescription>Top participants across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="text-center py-4"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>
                ) : leaderboardData.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No data available.</p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="p-3 text-left font-medium">Rank</th>
                        <th className="p-3 text-left font-medium">Email</th>
                        <th className="p-3 text-left font-medium">Username</th>
                        <th className="p-3 text-right font-medium">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboardData.map((student, index) => (
                        <tr key={student.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                          <td className="p-3 font-semibold text-lg">{index + 1}</td>
                          <td className="p-3 text-sm">{student.email}</td>
                          <td className="p-3 text-sm italic">{student.display_name || 'No username'}</td>
                          <td className="p-3 text-right font-mono font-bold text-primary">{student.score?.toLocaleString() || '0'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>School Leaderboard</CardTitle>
              <CardDescription>Aggregate institution performance</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminSchoolLeaderboard selectedCompId={selectedCompId} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AdminSchoolLeaderboard({ selectedCompId }: { selectedCompId: string }) {
  const [schoolData, setSchoolData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSchools = async () => {
      setLoading(true);
      try {
        const schools = localStorage.getItem('lumora_schools') ? JSON.parse(localStorage.getItem('lumora_schools')) : [];
        const users = localStorage.getItem('lumora_users') ? JSON.parse(localStorage.getItem('lumora_users')) : [];
        const results = localStorage.getItem('lumora_results') ? JSON.parse(localStorage.getItem('lumora_results')) : [];

        const aggregatedSchools = schools.map(school => {
          const schoolStudents = users.filter(u => u.school_id === school.id);
          let totalPoints = 0;

          if (selectedCompId === 'all') {
            totalPoints = schoolStudents.reduce((sum, u) => sum + (u.score || 0), 0);
          } else {
            schoolStudents.forEach(student => {
              const studentResults = results.filter(r => (r.question_set_id === selectedCompId || r.competition_id === selectedCompId) && r.student_id === student.id);
              if (studentResults.length > 0) {
                totalPoints += Math.max(...studentResults.map(r => r.score || 0));
              }
            });
          }

          return { ...school, totalPoints };
        });

        const sortedSchools = aggregatedSchools.sort((a, b) => b.totalPoints - a.totalPoints);
        setSchoolData(sortedSchools);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchSchools();
  }, [selectedCompId]);

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>
      ) : schoolData.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">No data found.</p>
      ) : (
        <div className="space-y-4">
          {schoolData.map((school, index) => (
            <div key={school.id} className="p-3 rounded-lg border border-border/50 bg-muted/20 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{school.name}</p>
                <p className="text-xs text-muted-foreground">{school.country || 'Global'}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-primary font-bold">{school.totalPoints.toLocaleString()}</p>
                <p className="text-[10px] uppercase text-muted-foreground">Total Pts</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Profile View Component
function ProfileView() {
  const { profile } = useAuth();
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your admin account</p>
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
              <p className="text-sm text-muted-foreground">Competitions Organized</p>
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

// Practice Manager Tab Component
function PracticeManagerTab() {
  const [practiceSets, setPracticeSets] = useState([]);
  const [globalQuestions, setGlobalQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [isCreateQuestionDialogOpen, setIsCreateQuestionDialogOpen] = useState(false);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false); // New: Track edit mode
  const [selectedSet, setSelectedSet] = useState<any>(null);
  const [newSet, setNewSet] = useState({
    id: '',
    name: '',
    description: '',
    category: 'General',
    questions: [] as string[],
    created_at: '',
  });

  const [newQuestion, setNewQuestion] = useState({
    id: '',
    text: '',
    type: 'mcq' as 'mcq' | 'text',
    options: ['', '', '', ''], // Initial 4, can be changed
    correct_answer: '',
    category: 'General',
    difficulty: 'medium',
    points: 10,
    explanation: '',
    exact_match_required: false,
    created_at: '',
    updated_at: ''
  });

  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const sets = localStorage.getItem('lumora_practice_sets') ? JSON.parse(localStorage.getItem('lumora_practice_sets')) : [];
    const questions = localStorageCRUD.get(LOCAL_STORAGE_KEYS.QUESTIONS);
    setPracticeSets(sets);
    setGlobalQuestions(questions);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSet = () => {
    if (!newSet.name) {
      toast({ title: 'Name is required', variant: 'destructive' });
      return;
    }
    const setToAdd = {
      ...newSet,
      id: `p-set-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    const current = localStorage.getItem('lumora_practice_sets') ? JSON.parse(localStorage.getItem('lumora_practice_sets')) : [];
    const updated = [...current, setToAdd];
    localStorage.setItem('lumora_practice_sets', JSON.stringify(updated));
    setPracticeSets(updated);
    setIsAddDialogOpen(false);
    setNewSet({ id: '', name: '', description: '', category: 'General', questions: [], created_at: '' });
    toast({ title: 'Practice Set Created!' });
  };

  const toggleQuestionInSet = (questionId: string) => {
    if (!selectedSet) return;
    const currentQuestions = [...selectedSet.questions];
    const index = currentQuestions.indexOf(questionId);

    if (index > -1) {
      currentQuestions.splice(index, 1);
    } else {
      currentQuestions.push(questionId);
    }

    const updatedSet = { ...selectedSet, questions: currentQuestions };
    setSelectedSet(updatedSet);
  };

  const handleSaveQuestions = () => {
    if (!selectedSet) return;
    const updatedSets = practiceSets.map((s: any) => s.id === selectedSet.id ? selectedSet : s);
    localStorage.setItem('lumora_practice_sets', JSON.stringify(updatedSets));
    setPracticeSets(updatedSets);
    setIsManageDialogOpen(false);
    toast({ title: 'Questions updated for set!' });
  };

  const addOption = () => {
    setNewQuestion({ ...newQuestion, options: [...newQuestion.options, ''] });
  };

  const removeOption = (index: number) => {
    if (newQuestion.options.length <= 2) return; // Keep at least 2
    const next = newQuestion.options.filter((_, i) => i !== index);
    setNewQuestion({ ...newQuestion, options: next });
  };

  const handleEditQuestionClick = (q: any) => {
    setNewQuestion({
      ...q,
      options: q.options || ['', '', '', '']
    });
    setIsEditingQuestion(true);
    setIsCreateQuestionDialogOpen(true);
  };

  const handleCreateAndAddQuestion = (keepOpen: boolean = false) => {
    if (!newQuestion.text || !newQuestion.correct_answer) {
      toast({ title: 'Question text and correct answer are required', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const qId = isEditingQuestion ? newQuestion.id : `question-${Date.now()}`;
      const questionToAdd = {
        ...newQuestion,
        id: qId,
        updated_at: new Date().toISOString()
      };

      if (!isEditingQuestion) {
        questionToAdd.created_at = new Date().toISOString();
        // Add to global questions
        localStorageCRUD.add(LOCAL_STORAGE_KEYS.QUESTIONS, questionToAdd);
      } else {
        // Update globally
        localStorageCRUD.update(LOCAL_STORAGE_KEYS.QUESTIONS, qId, questionToAdd);

        // Also update in all sets that might have it (optional but good for consistency)
        // In this app, we fetch globalQuestions and Sets separately, so we just need to ensure sets that store full objects are updated.
        // Earlier logic suggested sets might store full objects or IDs. 
        // Practice sets store IDs in the 'questions' array (string[]).
      }

      // Add to current practice set if creating
      if (!isEditingQuestion && selectedSet) {
        const updatedSet = {
          ...selectedSet,
          questions: [...(selectedSet.questions || []), qId]
        };
        const updatedSets = practiceSets.map((s: any) => s.id === selectedSet.id ? updatedSet : s);
        localStorage.setItem('lumora_practice_sets', JSON.stringify(updatedSets));
        setPracticeSets(updatedSets);
      }

      setGlobalQuestions(localStorageCRUD.get(LOCAL_STORAGE_KEYS.QUESTIONS));
      toast({ title: isEditingQuestion ? 'Question updated!' : (keepOpen ? 'Question added! Ready for next.' : 'Question created and added to set!') });

      if (!keepOpen) {
        setIsCreateQuestionDialogOpen(false);
      }

      setIsEditingQuestion(false);

      // Reset question state
      setNewQuestion({
        id: '', text: '', type: 'mcq', options: ['', '', '', ''],
        correct_answer: '', category: 'General', difficulty: 'medium', points: 10,
        explanation: '', exact_match_required: false, created_at: '', updated_at: ''
      });
    } catch (error) {
      toast({ title: 'Error saving question', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleDeleteSet = (id: string) => {
    const updated = practiceSets.filter((s: any) => s.id !== id);
    localStorage.setItem('lumora_practice_sets', JSON.stringify(updated));
    setPracticeSets(updated);
    toast({ title: 'Practice set deleted' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold">Practice Manager</h1>
          <p className="text-muted-foreground">Manage self-paced practice sets for students</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gradient-hero">
          <Plus className="w-4 h-4 mr-2" /> Create New Practice Set
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {practiceSets.map((set: any) => (
          <Card key={set.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{set.name}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteSet(set.id)} className="text-destructive h-8 w-8 p-0">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <CardDescription className="line-clamp-2">{set.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Questions:</span>
                  <span className="font-bold">{set.questions?.length || 0}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" className="w-full flex items-center gap-2" onClick={() => { setSelectedSet(set); setIsManageDialogOpen(true); }}>
                    <Plus className="w-3 h-3" /> Manage Existing
                  </Button>
                  <Button variant="outline" size="sm" className="w-full flex items-center gap-2 border-primary/30 text-primary hover:bg-primary/5" onClick={() => { setSelectedSet(set); setIsCreateQuestionDialogOpen(true); }}>
                    <Plus className="w-3 h-3" /> Create & Add New
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {practiceSets.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border-dashed border-2 rounded-xl">
            No practice sets created yet. Start by creating one!
          </div>
        )}
      </div>

      {/* Create Set Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Practice Set</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Set Name</Label>
              <Input value={newSet.name} onChange={e => setNewSet({ ...newSet, name: e.target.value })} placeholder="e.g. Vocabulary Booster" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={newSet.description} onChange={e => setNewSet({ ...newSet, description: e.target.value })} placeholder="What will students learn?" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateSet} className="gradient-hero">Create Set</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col overflow-hidden p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Assign Questions: {selectedSet?.name}</DialogTitle>
            <DialogDescription>Select questions from the global question bank to add to this practice set.</DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 px-6 mt-4">
            <div className="space-y-4">
              {globalQuestions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No questions found in the question bank.</p>
              ) : (
                globalQuestions.map((q: any) => (
                  <div key={q.id} className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                    <Checkbox
                      id={`q-${q.id}`}
                      checked={selectedSet?.questions?.includes(q.id)}
                      onCheckedChange={() => toggleQuestionInSet(q.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <Label htmlFor={`q-${q.id}`} className="font-medium cursor-pointer block truncate">{q.prompt || q.text}</Label>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">{q.type}</span>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{q.category}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleEditQuestionClick(q)} className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 pt-2">
            <Button variant="outline" onClick={() => setIsManageDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveQuestions} className="gradient-hero">Save Assignments</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateQuestionDialogOpen} onOpenChange={(open) => { setIsCreateQuestionDialogOpen(open); if (!open) setIsEditingQuestion(false); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>{isEditingQuestion ? 'Edit Question' : `New Question for ${selectedSet?.name}`}</DialogTitle>
            <DialogDescription>
              {isEditingQuestion ? 'Update question details globally.' : 'Create a question that will be saved globally and added to this set.'}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 px-6 mt-4">
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Question Type</Label>
                <div className="flex gap-4 p-2 bg-muted/50 rounded-lg">
                  <Button variant={newQuestion.type === 'mcq' ? 'default' : 'ghost'} size="sm" onClick={() => setNewQuestion({ ...newQuestion, type: 'mcq' })} className="flex-1 h-8">MCQ</Button>
                  <Button variant={newQuestion.type === 'text' ? 'default' : 'ghost'} size="sm" onClick={() => setNewQuestion({ ...newQuestion, type: 'text' })} className="flex-1 h-8">Writing</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Question Text</Label>
                <Textarea value={newQuestion.text} onChange={e => setNewQuestion({ ...newQuestion, text: e.target.value })} placeholder="What is..." />
              </div>

              {newQuestion.type === 'mcq' ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-muted/30 p-2 rounded-lg border border-dashed">
                    <Label className="font-bold">Options (Mark correct one)</Label>
                    <Button variant="secondary" size="sm" onClick={addOption} className="h-8 font-bold text-xs shadow-sm border border-primary/20">
                      <Plus className="w-4 h-4 mr-1.5" /> Add Options
                    </Button>
                  </div>
                  {newQuestion.options.map((opt, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input value={opt} onChange={e => {
                        const next = [...newQuestion.options];
                        next[i] = e.target.value;
                        setNewQuestion({ ...newQuestion, options: next });
                      }} placeholder={`Option ${i + 1}`} className="h-9" />
                      <Button
                        size="sm"
                        variant={newQuestion.correct_answer === opt && opt !== '' ? 'default' : 'outline'}
                        onClick={() => setNewQuestion({ ...newQuestion, correct_answer: opt })}
                        className="shrink-0 h-9"
                      >
                        {newQuestion.correct_answer === opt && opt !== '' ? '✓' : 'Set'}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => removeOption(i)} disabled={newQuestion.options.length <= 2} className="h-9 w-9 p-0 text-destructive/40 hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Expected Keywords / Correct Answer</Label>
                  <Textarea value={newQuestion.correct_answer} onChange={e => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })} placeholder="Expected answer..." />
                  <div className="flex items-center gap-2 py-1">
                    <Checkbox id="exact" checked={newQuestion.exact_match_required} onCheckedChange={v => setNewQuestion({ ...newQuestion, exact_match_required: !!v })} />
                    <Label htmlFor="exact" className="text-xs">Exact match required</Label>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={newQuestion.difficulty} onValueChange={v => setNewQuestion({ ...newQuestion, difficulty: v })}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Points</Label>
                  <Input type="number" value={newQuestion.points} onChange={e => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) || 10 })} className="h-9" />
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 pt-4 border-t gap-2">
            <Button variant="ghost" onClick={() => setIsCreateQuestionDialogOpen(false)}>Cancel</Button>
            {!isEditingQuestion && (
              <Button variant="outline" onClick={() => handleCreateAndAddQuestion(true)} disabled={loading}>
                Save & Add Another
              </Button>
            )}
            <Button onClick={() => handleCreateAndAddQuestion(false)} className="gradient-hero" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditingQuestion ? 'Save Changes' : 'Save & Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}