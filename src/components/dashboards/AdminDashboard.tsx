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
  Type,
  Pencil,
  BookOpen
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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
  SETTINGS: 'lumora_settings'
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
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'avatars', icon: User, label: 'Avatars' },
    { id: 'approvals', icon: CheckSquare, label: 'Pending Approvals' },
    { id: 'messages', icon: MessageSquare, label: 'Messages' },
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'preview', icon: Eye, label: 'Preview Views' },
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
      {activeTab === 'question-sets' && <QuestionSetsTab />}
      {activeTab === 'questions' && <QuestionsTab />}
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'avatars' && <AvatarsTab />}
      {activeTab === 'approvals' && <ApprovalsTab />}
      {activeTab === 'messages' && <MessagesTab />}
      {activeTab === 'settings' && <SettingsTab />}
      {activeTab === 'preview' && <PreviewViewsTab />}
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
  const questionSets = localStorageCRUD.get(LOCAL_STORAGE_KEYS.QUESTION_SETS);

  const stats = {
    totalUsers: users.length,
    activeCompetitions: competitions.length,
    totalQuestions: questions.length,
    totalQuestionSets: questionSets.length,
    pendingReviews: pending.length
  };

  const quickActions = [
    { id: 'schools', icon: School, title: 'Manage Schools', description: 'Configure school access' },
    { id: 'competitions', icon: Trophy, title: 'Manage Competitions', description: 'Create and edit competitions' },
    { id: 'question-sets', icon: LayoutTemplate, title: 'Question Sets', description: 'Organize questions into sets' },
    { id: 'questions', icon: FileQuestion, title: 'Review Questions', description: 'Approve pending questions' },
    { id: 'users', icon: Users, label: 'User Management', description: 'Manage user accounts' },
    { id: 'avatars', icon: User, title: 'Manage Avatars', description: 'Upload and manage avatars' },
    { id: 'approvals', icon: CheckSquare, title: 'Pending Approvals', description: 'Review moderator actions' },
    { id: 'messages', icon: MessageSquare, title: 'Messages', description: 'User communications' },
    { id: 'settings', icon: Settings, title: 'Platform Settings', description: 'Configure platform features' },
    { id: 'preview', icon: Eye, title: 'Preview Views', description: 'View as different roles' },
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
          title="Question Sets"
          value={stats.totalQuestionSets.toString()}
          icon={LayoutTemplate}
          className="bg-success/10 border-success/20"
        />
        <StatCard
          title="Total Questions"
          value={stats.totalQuestions.toLocaleString()}
          icon={FileQuestion}
          className="bg-warning/10 border-warning/20"
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingReviews.toString()}
          icon={Clock}
          className="bg-destructive/10 border-destructive/20"
        />
      </div>

      {/* Quick Actions and Recent Activity in 2 columns */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
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
    </div>
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

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSchool = async () => {
    // Validate required fields
    if (!newSchool.name) {
      toast({ title: 'School name is required', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Generate ID
      const newId = `school-${Date.now()}`;
      const schoolToAdd = {
        ...newSchool,
        id: newId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add to local storage
      localStorageCRUD.add(LOCAL_STORAGE_KEYS.SCHOOLS, schoolToAdd);
      setSchools(localStorageCRUD.get(LOCAL_STORAGE_KEYS.SCHOOLS));

      toast({ title: 'School added successfully!' });
      setIsAddDialogOpen(false);
      setNewSchool({
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
    } catch (error) {
      toast({ title: 'Error adding school', description: error.message, variant: 'destructive' });
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
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New School</DialogTitle>
            <DialogDescription>Register a new educational institution</DialogDescription>
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
                checked={newSchool.is_active}
                onCheckedChange={(checked) => setNewSchool({ ...newSchool, is_active: checked })}
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
                'Add School'
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
  const [newCompetition, setNewCompetition] = useState({
    id: '',
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    is_active: true,
    category: '',
    difficulty: 'medium',
    question_set_id: '',
    created_at: '',
    updated_at: ''
  });
  const [questionSets, setQuestionSets] = useState([]);
  const { toast } = useToast();

  // Load competitions and question sets from local storage
  useEffect(() => {
    setCompetitions(localStorageCRUD.get(LOCAL_STORAGE_KEYS.COMPETITIONS));
    setQuestionSets(localStorageCRUD.get(LOCAL_STORAGE_KEYS.QUESTION_SETS));
  }, []);

  const filteredCompetitions = competitions.filter(competition =>
    competition.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    competition.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCompetition = async () => {
    // Validate required fields
    if (!newCompetition.name) {
      toast({ title: 'Competition name is required', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Generate ID
      const newId = `comp-${Date.now()}`;
      const competitionToAdd = {
        ...newCompetition,
        id: newId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add to local storage
      localStorageCRUD.add(LOCAL_STORAGE_KEYS.COMPETITIONS, competitionToAdd);
      setCompetitions(localStorageCRUD.get(LOCAL_STORAGE_KEYS.COMPETITIONS));

      toast({ title: 'Competition added successfully!' });
      setIsAddDialogOpen(false);
      setNewCompetition({
        id: '',
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        is_active: true,
        category: '',
        difficulty: 'medium',
        question_set_id: '',
        created_at: '',
        updated_at: ''
      });
    } catch (error) {
      toast({ title: 'Error adding competition', description: error.message, variant: 'destructive' });
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
                          <span className="text-xs text-muted-foreground">Category: {competition.category}</span>
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
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Competition</DialogTitle>
            <DialogDescription>Create a new learning competition</DialogDescription>
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
              <Label>Question Set</Label>
              <Select
                value={newCompetition.question_set_id}
                onValueChange={(value) => setNewCompetition({ ...newCompetition, question_set_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select question set" />
                </SelectTrigger>
                <SelectContent>
                  {questionSets.map((set) => (
                    <SelectItem key={set.id} value={set.id}>{set.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="is-active"
                checked={newCompetition.is_active}
                onCheckedChange={(checked) => setNewCompetition({ ...newCompetition, is_active: checked })}
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

// Question Sets Tab Component
function QuestionSetsTab() {
  const [questionSets, setQuestionSets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newQuestionSet, setNewQuestionSet] = useState({
    id: '',
    name: '',
    description: '',
    category: '',
    question_type: 'mcq', // 'mcq' or 'written'
    questions: [],
    created_at: '',
    updated_at: ''
  });
  const { toast } = useToast();

  // Load question sets from local storage
  useEffect(() => {
    setQuestionSets(localStorageCRUD.get(LOCAL_STORAGE_KEYS.QUESTION_SETS));
  }, []);

  const filteredQuestionSets = questionSets.filter(qs =>
    qs.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    qs.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddQuestionSet = async () => {
    // Validate required fields
    if (!newQuestionSet.name) {
      toast({ title: 'Question set name is required', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Generate ID
      const newId = `qset-${Date.now()}`;
      const questionSetToAdd = {
        ...newQuestionSet,
        id: newId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add to local storage
      localStorageCRUD.add(LOCAL_STORAGE_KEYS.QUESTION_SETS, questionSetToAdd);
      setQuestionSets(localStorageCRUD.get(LOCAL_STORAGE_KEYS.QUESTION_SETS));

      toast({ title: 'Question set added successfully!' });
      setIsAddDialogOpen(false);
      setNewQuestionSet({
        id: '',
        name: '',
        description: '',
        category: '',
        question_type: 'mcq',
        questions: [],
        created_at: '',
        updated_at: ''
      });
    } catch (error) {
      toast({ title: 'Error adding question set', description: error.message, variant: 'destructive' });
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
                          <span className="px-2 py-1 rounded-full text-xs bg-accent/10 text-accent">
                            {questionSet.question_type === 'mcq' ? 'Multiple Choice' : 'Written Answers'}
                          </span>
                          <span className="text-xs text-muted-foreground">Questions: {questionSet.questions?.length || 0}</span>
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
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Question Set</DialogTitle>
            <DialogDescription>Create a new question set for organizing competition questions</DialogDescription>
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
              <Label>Question Type</Label>
              <RadioGroup
                value={newQuestionSet.question_type}
                onValueChange={(value) => setNewQuestionSet({ ...newQuestionSet, question_type: value })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mcq" id="mcq" />
                  <Label htmlFor="mcq" className="flex items-center gap-2">
                    <List className="w-4 h-4" />
                    Multiple Choice
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="written" id="written" />
                  <Label htmlFor="written" className="flex items-center gap-2">
                    <Pencil className="w-4 h-4" />
                    Written Answers
                  </Label>
                </div>
              </RadioGroup>
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
                'Add Question Set'
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
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    id: '',
    text: '',
    options: ['', '', '', ''],
    correct_answer: '',
    category: '',
    difficulty: 'medium',
    points: 10,
    explanation: '',
    question_set_id: '',
    question_type: 'mcq',
    created_at: '',
    updated_at: ''
  });
  const [questionSets, setQuestionSets] = useState([]);
  const { toast } = useToast();

  // Load questions and question sets from local storage
  useEffect(() => {
    setQuestions(localStorageCRUD.get(LOCAL_STORAGE_KEYS.QUESTIONS));
    setQuestionSets(localStorageCRUD.get(LOCAL_STORAGE_KEYS.QUESTION_SETS));
  }, []);

  const filteredQuestions = questions.filter(question =>
    question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddQuestion = async () => {
    // Validate required fields
    if (!newQuestion.text || !newQuestion.correct_answer) {
      toast({ title: 'Question text and correct answer are required', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Generate ID
      const newId = `question-${Date.now()}`;
      const questionToAdd = {
        ...newQuestion,
        id: newId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add to local storage
      localStorageCRUD.add(LOCAL_STORAGE_KEYS.QUESTIONS, questionToAdd);
      setQuestions(localStorageCRUD.get(LOCAL_STORAGE_KEYS.QUESTIONS));

      // Update the question set to include this question
      if (newQuestion.question_set_id) {
        const questionSet = questionSets.find(set => set.id === newQuestion.question_set_id);
        if (questionSet) {
          const updatedSet = {
            ...questionSet,
            questions: [...(questionSet.questions || []), newId]
          };
          localStorageCRUD.update(LOCAL_STORAGE_KEYS.QUESTION_SETS, questionSet.id, updatedSet);
          setQuestionSets(localStorageCRUD.get(LOCAL_STORAGE_KEYS.QUESTION_SETS));
        }
      }

      toast({ title: 'Question added successfully!' });
      setIsAddDialogOpen(false);
      setNewQuestion({
        id: '',
        text: '',
        options: ['', '', '', ''],
        correct_answer: '',
        category: '',
        difficulty: 'medium',
        points: 10,
        explanation: '',
        question_set_id: '',
        question_type: 'mcq',
        created_at: '',
        updated_at: ''
      });
    } catch (error) {
      toast({ title: 'Error adding question', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleDeleteQuestion = async (id: string) => {
    setLoading(true);
    try {
      localStorageCRUD.remove(LOCAL_STORAGE_KEYS.QUESTIONS, id);
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
                        <p className="text-xs text-muted-foreground mt-1">Category: {question.category} • Difficulty: {question.difficulty}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">{question.points} pts</span>
                          <span className="px-2 py-1 rounded-full text-xs bg-accent/10 text-accent">
                            {question.question_type === 'mcq' ? 'MCQ' : 'Written'}
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
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Question</DialogTitle>
            <DialogDescription>Create a new competition question</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Question Set *</Label>
              <Select
                value={newQuestion.question_set_id}
                onValueChange={(value) => setNewQuestion({ ...newQuestion, question_set_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select question set" />
                </SelectTrigger>
                <SelectContent>
                  {questionSets.map((set) => (
                    <SelectItem key={set.id} value={set.id}>{set.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">You must create a question set first before adding questions</p>
            </div>

            <div className="space-y-2">
              <Label>Question Type</Label>
              <RadioGroup
                value={newQuestion.question_type}
                onValueChange={(value) => setNewQuestion({ ...newQuestion, question_type: value })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mcq" id="mcq-question" />
                  <Label htmlFor="mcq-question" className="flex items-center gap-2">
                    <List className="w-4 h-4" />
                    Multiple Choice
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="written" id="written-question" />
                  <Label htmlFor="written-question" className="flex items-center gap-2">
                    <Pencil className="w-4 h-4" />
                    Written Answers
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Question Text *</Label>
              <Textarea
                value={newQuestion.text}
                onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                placeholder="What is the capital of France?"
                rows={3}
              />
            </div>

            {newQuestion.question_type === 'mcq' && (
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={newQuestion.category}
                  onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                  placeholder="e.g., Math, Science, etc."
                />
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
                'Add Question'
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
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBulkAddDialogOpen, setIsBulkAddDialogOpen] = useState(false);
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
  const [bulkUsers, setBulkUsers] = useState('');
  const { toast } = useToast();
  const { profile } = useAuth();

  // Load users from local storage
  useEffect(() => {
    setUsers(localStorageCRUD.get(LOCAL_STORAGE_KEYS.USERS));
  }, []);

  // Add null check for users
  const filteredUsers = (users || []).filter(user =>
    (user?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user?.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (roleFilter === 'all' || user?.role === roleFilter)
  );

  const handleAddUser = async () => {
    // Validate email
    if (!newUser.email) {
      toast({ title: 'Email is required', variant: 'destructive' });
      return;
    }

    // Auto-generate password if not provided
    if (!newUser.password) {
      newUser.password = generateRandomPassword();
    }

    // Auto-generate display name if not provided
    if (!newUser.display_name) {
      newUser.display_name = newUser.email.split('@')[0];
    }

    setLoading(true);
    try {
      // Generate ID
      const newId = `user-${Date.now()}`;
      const userToAdd = {
        ...newUser,
        id: newId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add to local storage
      localStorageCRUD.add(LOCAL_STORAGE_KEYS.USERS, userToAdd);
      setUsers(localStorageCRUD.get(LOCAL_STORAGE_KEYS.USERS));

      toast({
        title: 'User added successfully!',
        description: `Password: ${userToAdd.password}`
      });
      setIsAddDialogOpen(false);
      setNewUser({
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
    } catch (error) {
      toast({ title: 'Error adding user', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleBulkAddUsers = async () => {
    if (!bulkUsers.trim()) {
      toast({ title: 'Please enter user data', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const lines = bulkUsers.split('\n').filter(line => line.trim());
      const usersToAdd = [];

      for (const line of lines) {
        const email = line.trim();
        if (!email) continue;

        // Auto-generate password and display name
        const password = generateRandomPassword();
        const displayName = email.split('@')[0];

        usersToAdd.push({
          id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          email,
          display_name: displayName,
          role: 'student',
          school_id: null,
          password: password,
          is_active: true,
          score: 0,
          progress: 0,
          avatar_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      // Add all users to local storage
      usersToAdd.forEach(user => {
        localStorageCRUD.add(LOCAL_STORAGE_KEYS.USERS, user);
      });

      setUsers(localStorageCRUD.get(LOCAL_STORAGE_KEYS.USERS));

      toast({
        title: `Bulk users added successfully!`,
        description: `${usersToAdd.length} users added with auto-generated passwords.`
      });
      setIsBulkAddDialogOpen(false);
      setBulkUsers('');
    } catch (error) {
      toast({ title: 'Error adding bulk users', description: error.message, variant: 'destructive' });
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
                              {user.display_name?.split(' ').map(n => n[0]).join('') || user.email?.substring(0, 2).toUpperCase()}
                            </div>
                            <span>{user.display_name || 'No name'}</span>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">{user.email}</td>
                        <td className="p-3">
                          <Select
                            value={user.role}
                            onValueChange={(value) => handleRoleChange(user.id, value)}
                            disabled={user.id === profile?.id || (value === 'admin' && profile?.role !== 'admin')}
                          >
                            <SelectTrigger className="w-[120px] h-8">
                              <SelectValue />
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
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
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
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account</DialogDescription>
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
              <Input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Leave empty to auto-generate"
              />
              <p className="text-xs text-muted-foreground">If left empty, a secure password will be auto-generated</p>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="is-active"
                checked={newUser.is_active}
                onCheckedChange={(checked) => setNewUser({ ...newUser, is_active: checked })}
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
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Add Users</DialogTitle>
            <DialogDescription>Add multiple users at once (one email per line)</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>User Emails</Label>
              <Textarea
                value={bulkUsers}
                onChange={(e) => setBulkUsers(e.target.value)}
                placeholder={`user1@school.com\nuser2@school.com\nuser3@school.com`}
                rows={10}
                className="font-mono"
              />
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Format Instructions:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• One email per line</li>
                <li>• Passwords will be auto-generated</li>
                <li>• Display names will be derived from email prefixes</li>
                <li>• All users will be created as students by default</li>
                <li>• Example: user@school.com</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleBulkAddUsers} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Users'
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
  const [newAvatar, setNewAvatar] = useState({
    id: '',
    name: '',
    image_url: '',
    category: 'default',
    created_at: '',
    updated_at: ''
  });
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const { toast } = useToast();

  // Load avatars from local storage
  useEffect(() => {
    setAvatars(localStorageCRUD.get(LOCAL_STORAGE_KEYS.AVATARS));
  }, []);

  const filteredAvatars = avatars.filter(avatar =>
    avatar.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    avatar.category.toLowerCase().includes(searchTerm.toLowerCase())
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
    // Validate required fields
    if (!newAvatar.name || !newAvatar.image_url) {
      toast({ title: 'Name and image are required', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Generate ID
      const newId = `avatar-${Date.now()}`;
      const avatarToAdd = {
        ...newAvatar,
        id: newId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add to local storage
      localStorageCRUD.add(LOCAL_STORAGE_KEYS.AVATARS, avatarToAdd);
      setAvatars(localStorageCRUD.get(LOCAL_STORAGE_KEYS.AVATARS));

      toast({ title: 'Avatar added successfully!' });
      setIsAddDialogOpen(false);
      setNewAvatar({
        id: '',
        name: '',
        image_url: '',
        category: 'default',
        created_at: '',
        updated_at: ''
      });
      setFilePreview(null);
    } catch (error) {
      toast({ title: 'Error adding avatar', description: error.message, variant: 'destructive' });
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
                      <img
                        src={avatar.image_url}
                        alt={avatar.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="text-center">
                        <h3 className="font-medium text-sm">{avatar.name}</h3>
                        <p className="text-xs text-muted-foreground">{avatar.category}</p>
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
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Avatar</DialogTitle>
            <DialogDescription>Upload a new avatar image</DialogDescription>
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
                'Add Avatar'
              )}
            </Button>
          </DialogFooter>
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
      const allowedTypes = ['question', 'question_delete', 'competition', 'competition_delete', 'school', 'school_delete', 'user', 'user_delete', 'avatar', 'avatar_delete', 'question_set', 'question_set_delete', 'bulk_users', 'user_role_change'];

      if (!allowedTypes.includes(type)) {
        toast({ title: 'You cannot approve this type of request', variant: 'destructive' });
        return;
      }

      // Update the approval status
      localStorageCRUD.update(LOCAL_STORAGE_KEYS.APPROVALS, id, { status: 'approved' });
      setApprovals(localStorageCRUD.get(LOCAL_STORAGE_KEYS.APPROVALS));

      toast({ title: 'Request approved!', description: 'The request has been approved and will be processed.' });
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

      toast({ title: 'Request rejected!', description: 'The request has been rejected.' });
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
                        <span className={`px-2 py-1 rounded-full text-xs ${approval.status === 'pending' ? 'bg-warning/10 text-warning' : approval.status === 'approved' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
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
    'user_role_change': 'User Role Change'
  };
  return titles[type] || type;
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

  const filteredMessages = messages.filter(message =>
    message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchMessages = async () => {
    setLoading(true);
    try {
      // Load messages from local storage
      const messagesData = localStorageCRUD.get(LOCAL_STORAGE_KEYS.MESSAGES);
      setMessages(messagesData);
    } catch (error) {
      toast({ title: 'Error fetching messages', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleSendReply = async () => {
    if (!replyContent || !selectedMessage) return;

    setSendingReply(true);

    try {
      // Mock send reply
      await new Promise(resolve => setTimeout(resolve, 1000));

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
      // Only admins can delete messages
      if (profile?.role !== 'admin') {
        toast({ title: 'Only admins can delete messages', variant: 'destructive' });
        return;
      }

      localStorageCRUD.remove(LOCAL_STORAGE_KEYS.MESSAGES, messageId);
      setMessages(messages.filter(msg => msg.id !== messageId));
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
      <div>
        <h1 className="text-2xl font-display font-bold">Messages</h1>
        <p className="text-muted-foreground">User communications</p>
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
                          {profile?.role === 'admin' && (
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
                          )}
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

// Settings Tab Component
function SettingsTab() {
  const [settings, setSettings] = useState({
    enable1v1Challenges: false,
    enableStudentMessaging: true,
    enableTeacherMessaging: true,
    enableCompetitions: true,
    enablePracticeMode: true,
    enableLeaderboards: true
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Load settings from local storage
  useEffect(() => {
    const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEYS.SETTINGS);
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error parsing settings:', error);
      }
    }
  }, []);

  const handleSettingChange = (setting: string, value: boolean) => {
    const updatedSettings = { ...settings, [setting]: value };
    setSettings(updatedSettings);
    localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
    toast({ title: 'Settings updated successfully!' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Platform Settings</h1>
        <p className="text-muted-foreground">Configure platform features and behavior</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Feature Toggles</CardTitle>
            <CardDescription>Enable or disable platform features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-medium">1v1 Challenges</h3>
                  <p className="text-xs text-muted-foreground">Allow students to challenge each other</p>
                </div>
              </div>
              <Switch
                checked={settings.enable1v1Challenges}
                onCheckedChange={(checked) => handleSettingChange('enable1v1Challenges', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-medium">Student Messaging</h3>
                  <p className="text-xs text-muted-foreground">Allow students to send messages</p>
                </div>
              </div>
              <Switch
                checked={settings.enableStudentMessaging}
                onCheckedChange={(checked) => handleSettingChange('enableStudentMessaging', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-medium">Teacher Messaging</h3>
                  <p className="text-xs text-muted-foreground">Allow teachers to send messages</p>
                </div>
              </div>
              <Switch
                checked={settings.enableTeacherMessaging}
                onCheckedChange={(checked) => handleSettingChange('enableTeacherMessaging', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-medium">Competitions</h3>
                  <p className="text-xs text-muted-foreground">Enable competition functionality</p>
                </div>
              </div>
              <Switch
                checked={settings.enableCompetitions}
                onCheckedChange={(checked) => handleSettingChange('enableCompetitions', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-medium">Practice Mode</h3>
                  <p className="text-xs text-muted-foreground">Allow students to practice questions</p>
                </div>
              </div>
              <Switch
                checked={settings.enablePracticeMode}
                onCheckedChange={(checked) => handleSettingChange('enablePracticeMode', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
              <div className="flex items-center gap-3">
                <CheckSquare className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-medium">Leaderboards</h3>
                  <p className="text-xs text-muted-foreground">Show student rankings</p>
                </div>
              </div>
              <Switch
                checked={settings.enableLeaderboards}
                onCheckedChange={(checked) => handleSettingChange('enableLeaderboards', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Information</CardTitle>
            <CardDescription>Current platform status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{localStorageCRUD.get(LOCAL_STORAGE_KEYS.USERS).length}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Competitions</p>
              <p className="text-2xl font-bold">{localStorageCRUD.get(LOCAL_STORAGE_KEYS.COMPETITIONS).length}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Questions</p>
              <p className="text-2xl font-bold">{localStorageCRUD.get(LOCAL_STORAGE_KEYS.QUESTIONS).length}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Preview Views Tab Component
function PreviewViewsTab() {
  const [activePreview, setActivePreview] = useState('student');
  const { setCurrentView } = useAuth();
  const { toast } = useToast();

  const handlePreview = (role: string) => {
    setCurrentView(role as any);
    setActivePreview(role);
    toast({
      title: 'Preview Mode Activated',
      description: `You are now viewing the platform as a ${role}`
    });
  };

  const handleExitPreview = () => {
    setCurrentView(null);
    setActivePreview('student');
    toast({
      title: 'Preview Mode Deactivated',
      description: 'You are now viewing with your actual role'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Preview Views</h1>
        <p className="text-muted-foreground">View the platform from different user perspectives</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Preview</CardTitle>
          <CardDescription>Select a role to preview the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handlePreview('student')}
              className={`p-6 rounded-xl border-2 transition-all ${activePreview === 'student' ? 'border-primary bg-primary/10' : 'border-border/50 hover:border-primary/50 hover:bg-primary/5'}`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-medium">Student View</h3>
                <p className="text-xs text-muted-foreground text-center">See what students experience</p>
              </div>
            </button>

            <button
              onClick={() => handlePreview('teacher')}
              className={`p-6 rounded-xl border-2 transition-all ${activePreview === 'teacher' ? 'border-primary bg-primary/10' : 'border-border/50 hover:border-primary/50 hover:bg-primary/5'}`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-medium">Teacher View</h3>
                <p className="text-xs text-muted-foreground text-center">See what teachers experience</p>
              </div>
            </button>

            <button
              onClick={() => handlePreview('moderator')}
              className={`p-6 rounded-xl border-2 transition-all ${activePreview === 'moderator' ? 'border-primary bg-primary/10' : 'border-border/50 hover:border-primary/50 hover:bg-primary/5'}`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-medium">Moderator View</h3>
                <p className="text-xs text-muted-foreground text-center">See what moderators experience</p>
              </div>
            </button>
          </div>

          <div className="mt-6 flex justify-center">
            <Button
              onClick={handleExitPreview}
              variant="outline"
              className="gap-2"
            >
              <EyeOff className="w-4 h-4" />
              Exit Preview Mode
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Use the preview mode to see how the platform appears to different user roles. This helps you understand the user experience and test features.
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Click on any role card to activate preview mode</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>The entire dashboard will refresh to show the selected role's view</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Click "Exit Preview Mode" to return to your actual role</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Preview mode doesn't affect actual user data or permissions</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
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
              <p className="text-2xl font-bold">{localStorageCRUD.get(LOCAL_STORAGE_KEYS.USERS).length}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Competitions Organized</p>
              <p className="text-2xl font-bold">{localStorageCRUD.get(LOCAL_STORAGE_KEYS.COMPETITIONS).length}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Questions Approved</p>
              <p className="text-2xl font-bold">{localStorageCRUD.get(LOCAL_STORAGE_KEYS.QUESTIONS).length}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}