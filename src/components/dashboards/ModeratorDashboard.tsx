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
  ChevronUp
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

// Local storage utilities
const LOCAL_STORAGE_KEYS = {
  USERS: 'lumora_users',
  COMPETITIONS: 'lumora_competitions',
  QUESTIONS: 'lumora_questions',
  SCHOOLS: 'lumora_schools',
  APPROVALS: 'lumora_approvals',
  MESSAGES: 'lumora_messages',
  AVATARS: 'lumora_avatars',
  QUESTION_SETS: 'lumora_question_sets'
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

function ModeratorSidebar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const { profile } = useAuth();
  const navItems = [
    { id: 'overview', icon: Users, label: 'Overview' },
    { id: 'schools', icon: School, label: 'Schools' },
    { id: 'competitions', icon: Trophy, label: 'Competitions' },
    { id: 'questions', icon: FileQuestion, label: 'Questions' },
    { id: 'question-sets', icon: LayoutTemplate, label: 'Question Sets' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'avatars', icon: User, label: 'Avatars' },
    { id: 'approvals', icon: CheckSquare, label: 'Pending Approvals' },
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
              {profile?.display_name?.substring(0, 2).toUpperCase() || 'MD'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{profile?.display_name || 'Moderator'}</p>
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

export default function ModeratorDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  return (
    <DashboardLayout
      title="Lumora Moderator Dashboard"
      sidebar={<ModeratorSidebar activeTab={activeTab} setActiveTab={setActiveTab} />}
    >
      {activeTab === 'overview' && <ModeratorOverviewTab setActiveTab={setActiveTab} loading={loading} />}
      {activeTab === 'schools' && <SchoolsTab />}
      {activeTab === 'competitions' && <CompetitionsTab />}
      {activeTab === 'questions' && <QuestionsTab />}
      {activeTab === 'question-sets' && <QuestionSetsTab />}
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'avatars' && <AvatarsTab />}
      {activeTab === 'approvals' && <ApprovalsTab />}
      {activeTab === 'messages' && <MessagesTab />}
      {activeTab === 'profile' && <ProfileView />}
    </DashboardLayout>
  );
}

// Moderator Overview Component
function ModeratorOverviewTab({ setActiveTab, loading }: { setActiveTab: (tab: string) => void, loading: boolean }) {
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
    { id: 'question-sets', icon: LayoutTemplate, title: 'Question Sets', description: 'Organize questions into sets' },
    { id: 'users', icon: Users, label: 'User Management', description: 'Manage user accounts' },
    { id: 'avatars', icon: User, title: 'Manage Avatars', description: 'Upload and manage avatars' },
    { id: 'approvals', icon: CheckSquare, title: 'Pending Approvals', description: 'Review moderator actions' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Moderator Dashboard</h1>
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

      {/* Quick Actions and Recent Activity in 2 columns */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common moderator tasks</CardDescription>
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
    questions: [],
    created_at: '',
    updated_at: ''
  });
  const { toast } = useToast();
  const { profile } = useAuth();

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

      // Create pending approval for question set
      const approvalItem = {
        id: `approval-${Date.now()}`,
        type: 'question_set',
        data: questionSetToAdd,
        created_by: profile?.id,
        created_by_name: profile?.display_name || profile?.email,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      // Add to approvals
      localStorageCRUD.add(LOCAL_STORAGE_KEYS.APPROVALS, approvalItem);
      setQuestionSets(localStorageCRUD.get(LOCAL_STORAGE_KEYS.QUESTION_SETS));

      toast({ title: 'Question set submitted for admin approval!', description: 'An admin will review this shortly.' });
      setIsAddDialogOpen(false);
      setNewQuestionSet({
        id: '',
        name: '',
        description: '',
        category: '',
        questions: [],
        created_at: '',
        updated_at: ''
      });
    } catch (error) {
      toast({ title: 'Error submitting question set', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleDeleteQuestionSet = async (id: string) => {
    setLoading(true);
    try {
      // Create pending approval for question set deletion
      const questionSetToDelete = questionSets.find(qs => qs.id === id);
      const approvalItem = {
        id: `approval-${Date.now()}`,
        type: 'question_set_delete',
        data: { question_set_id: id, question_set_name: questionSetToDelete?.name },
        created_by: profile?.id,
        created_by_name: profile?.display_name || profile?.email,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      // Add to approvals
      localStorageCRUD.add(LOCAL_STORAGE_KEYS.APPROVALS, approvalItem);
      setQuestionSets(localStorageCRUD.get(LOCAL_STORAGE_KEYS.QUESTION_SETS));

      toast({ title: 'Question set deletion submitted for admin approval!', description: 'An admin will review this shortly.' });
    } catch (error) {
      toast({ title: 'Error submitting deletion request', description: error.message, variant: 'destructive' });
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
                                This action will be submitted for admin approval. Are you sure you want to request deletion of this question set?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={() => handleDeleteQuestionSet(questionSet.id)}
                              >
                                Request Deletion
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
            <DialogTitle>Add New Question Set</DialogTitle>
            <DialogDescription>Create a new question set for organizing competition questions (requires admin approval)</DialogDescription>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddQuestionSet} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit for Approval'
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
  const { profile } = useAuth();

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

      // Create pending approval for avatar
      const approvalItem = {
        id: `approval-${Date.now()}`,
        type: 'avatar',
        data: avatarToAdd,
        created_by: profile?.id,
        created_by_name: profile?.display_name || profile?.email,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      // Add to approvals
      localStorageCRUD.add(LOCAL_STORAGE_KEYS.APPROVALS, approvalItem);
      setAvatars(localStorageCRUD.get(LOCAL_STORAGE_KEYS.AVATARS));

      toast({ title: 'Avatar submitted for admin approval!', description: 'An admin will review this shortly.' });
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
      toast({ title: 'Error submitting avatar', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleDeleteAvatar = async (id: string) => {
    setLoading(true);
    try {
      // Create pending approval for avatar deletion
      const avatarToDelete = avatars.find(avatar => avatar.id === id);
      const approvalItem = {
        id: `approval-${Date.now()}`,
        type: 'avatar_delete',
        data: { avatar_id: id, avatar_name: avatarToDelete?.name },
        created_by: profile?.id,
        created_by_name: profile?.display_name || profile?.email,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      // Add to approvals
      localStorageCRUD.add(LOCAL_STORAGE_KEYS.APPROVALS, approvalItem);
      setAvatars(localStorageCRUD.get(LOCAL_STORAGE_KEYS.AVATARS));

      toast({ title: 'Avatar deletion submitted for admin approval!', description: 'An admin will review this shortly.' });
    } catch (error) {
      toast({ title: 'Error submitting deletion request', description: error.message, variant: 'destructive' });
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
                                This action will be submitted for admin approval. Are you sure you want to request deletion of this avatar?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={() => handleDeleteAvatar(avatar.id)}
                              >
                                Request Deletion
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
            <DialogTitle>Add New Avatar</DialogTitle>
            <DialogDescription>Upload a new avatar image (requires admin approval)</DialogDescription>
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
                  Submitting...
                </>
              ) : (
                'Submit for Approval'
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

      // Create pending approval for user creation
      const approvalItem = {
        id: `approval-${Date.now()}`,
        type: 'user',
        data: userToAdd,
        created_by: profile?.id,
        created_by_name: profile?.display_name || profile?.email,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      // Add to approvals
      localStorageCRUD.add(LOCAL_STORAGE_KEYS.APPROVALS, approvalItem);
      setUsers(localStorageCRUD.get(LOCAL_STORAGE_KEYS.USERS));

      toast({
        title: 'User creation submitted for admin approval!',
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
      toast({ title: 'Error submitting user', description: error.message, variant: 'destructive' });
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

      // Create pending approval for bulk user creation
      const approvalItem = {
        id: `approval-${Date.now()}`,
        type: 'bulk_users',
        data: { users: usersToAdd },
        created_by: profile?.id,
        created_by_name: profile?.display_name || profile?.email,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      // Add to approvals
      localStorageCRUD.add(LOCAL_STORAGE_KEYS.APPROVALS, approvalItem);
      setUsers(localStorageCRUD.get(LOCAL_STORAGE_KEYS.USERS));

      toast({
        title: `Bulk user creation submitted for admin approval!`,
        description: `${usersToAdd.length} users will be reviewed by an admin.`
      });
      setIsBulkAddDialogOpen(false);
      setBulkUsers('');
    } catch (error) {
      toast({ title: 'Error submitting bulk users', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleDeleteUser = async (id: string) => {
    setLoading(true);
    try {
      // Create pending approval for user deletion
      const userToDelete = users.find(user => user.id === id);
      const approvalItem = {
        id: `approval-${Date.now()}`,
        type: 'user_delete',
        data: { user_id: id, user_email: userToDelete?.email, user_name: userToDelete?.display_name },
        created_by: profile?.id,
        created_by_name: profile?.display_name || profile?.email,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      // Add to approvals
      localStorageCRUD.add(LOCAL_STORAGE_KEYS.APPROVALS, approvalItem);
      setUsers(localStorageCRUD.get(LOCAL_STORAGE_KEYS.USERS));

      toast({ title: 'User deletion submitted for admin approval!', description: 'An admin will review this shortly.' });
    } catch (error) {
      toast({ title: 'Error submitting deletion request', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setLoading(true);
    try {
      // Create pending approval for role change
      const userToUpdate = users.find(user => user.id === userId);
      const approvalItem = {
        id: `approval-${Date.now()}`,
        type: 'user_role_change',
        data: {
          user_id: userId,
          current_role: userToUpdate?.role,
          new_role: newRole,
          user_email: userToUpdate?.email,
          user_name: userToUpdate?.display_name
        },
        created_by: profile?.id,
        created_by_name: profile?.display_name || profile?.email,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      // Add to approvals
      localStorageCRUD.add(LOCAL_STORAGE_KEYS.APPROVALS, approvalItem);
      setUsers(localStorageCRUD.get(LOCAL_STORAGE_KEYS.USERS));

      toast({ title: 'Role change submitted for admin approval!', description: 'An admin will review this shortly.' });
    } catch (error) {
      toast({ title: 'Error submitting role change', description: error.message, variant: 'destructive' });
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
                                    This action will be submitted for admin approval. Are you sure you want to request deletion of this user?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive hover:bg-destructive/90"
                                    onClick={() => handleDeleteUser(user.id)}
                                  >
                                    Request Deletion
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
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account (requires admin approval)</DialogDescription>
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
                  Submitting...
                </>
              ) : (
                'Submit for Approval'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Add Users Dialog */}
      <Dialog open={isBulkAddDialogOpen} onOpenChange={setIsBulkAddDialogOpen}>
        <DialogContent className="max-w-2xl">
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
                  Submitting...
                </>
              ) : (
                'Submit for Approval'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Rest of the file remains the same...
// (Keeping the existing SchoolsTab, CompetitionsTab, QuestionsTab, ApprovalsTab, MessagesTab, and ProfileView components)