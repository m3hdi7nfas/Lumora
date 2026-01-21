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
  MESSAGES: 'lumora_messages'
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
    { id: 'users', icon: Users, label: 'Users' },
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
  const [showAds, setShowAds] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Load ads setting from localStorage
  useEffect(() => {
    const savedShowAds = localStorage.getItem('showAds');
    if (savedShowAds !== null) {
      setShowAds(savedShowAds === 'true');
    }
  }, []);

  const handleAdsToggle = (checked: boolean) => {
    setLoading(true);
    setShowAds(checked);
    localStorage.setItem('showAds', checked.toString());

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('adsSettingChanged', {
      detail: { showAds: checked }
    }));

    setLoading(false);
  };

  return (
    <DashboardLayout
      title="Lumora Moderator Dashboard"
      sidebar={<ModeratorSidebar activeTab={activeTab} setActiveTab={setActiveTab} />}
    >
      {activeTab === 'overview' && <ModeratorOverviewTab setActiveTab={setActiveTab} showAds={showAds} handleAdsToggle={handleAdsToggle} loading={loading} />}
      {activeTab === 'schools' && <SchoolsTab />}
      {activeTab === 'competitions' && <CompetitionsTab />}
      {activeTab === 'questions' && <QuestionsTab />}
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'approvals' && <ApprovalsTab />}
      {activeTab === 'messages' && <MessagesTab />}
      {activeTab === 'profile' && <ProfileView />}
    </DashboardLayout>
  );
}

// Moderator Overview Component
function ModeratorOverviewTab({ setActiveTab, showAds, handleAdsToggle, loading }: { setActiveTab: (tab: string) => void, showAds: boolean, handleAdsToggle: (checked: boolean) => void, loading: boolean }) {
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
    { id: 'users', icon: Users, label: 'User Management', description: 'Manage user accounts' },
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
            <div className="grid grid-cols-1 gap-4">
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
    max_participants: 100,
    difficulty: 'medium',
    participants: 0
  });
  const { toast } = useToast();
  const { profile } = useAuth();

  // Load competitions from local storage
  useEffect(() => {
    setCompetitions(localStorageCRUD.get(LOCAL_STORAGE_KEYS.COMPETITIONS));
  }, []);

  const filteredCompetitions = competitions.filter(comp =>
    comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCompetition = async () => {
    // Check if required fields are filled
    const missingFields = [];
    if (!newCompetition.name) missingFields.push('Name');
    if (!newCompetition.description) missingFields.push('Description');

    if (missingFields.length > 0) {
      const confirm = window.confirm(`The following required fields are missing: ${missingFields.join(', ')}. Do you want to continue anyway?`);
      if (!confirm) return;
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

      // Create pending approval instead of directly adding
      const approvalItem = {
        id: `approval-${Date.now()}`,
        type: 'competition',
        data: competitionToAdd,
        created_by: profile?.id,
        created_by_name: profile?.display_name || profile?.email,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      // Add to approvals
      localStorageCRUD.add(LOCAL_STORAGE_KEYS.APPROVALS, approvalItem);
      setCompetitions(localStorageCRUD.get(LOCAL_STORAGE_KEYS.COMPETITIONS));

      toast({ title: 'Competition submitted for admin approval!', description: 'An admin will review this shortly.' });
      setIsAddDialogOpen(false);
      setNewCompetition({
        id: '',
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        is_active: true,
        max_participants: 100,
        difficulty: 'medium',
        participants: 0
      });
    } catch (error) {
      toast({ title: 'Error submitting competition', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleDeleteCompetition = async (id: string) => {
    setLoading(true);
    try {
      // Create pending approval for deletion
      const competitionToDelete = competitions.find(comp => comp.id === id);
      const approvalItem = {
        id: `approval-${Date.now()}`,
        type: 'competition_delete',
        data: { competition_id: id, competition_name: competitionToDelete?.name },
        created_by: profile?.id,
        created_by_name: profile?.display_name || profile?.email,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      // Add to approvals
      localStorageCRUD.add(LOCAL_STORAGE_KEYS.APPROVALS, approvalItem);
      setCompetitions(localStorageCRUD.get(LOCAL_STORAGE_KEYS.COMPETITIONS));

      toast({ title: 'Competition deletion submitted for admin approval!', description: 'An admin will review this shortly.' });
    } catch (error) {
      toast({ title: 'Error submitting deletion request', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Competitions</h1>
          <p className="text-muted-foreground">Manage all competitions</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gradient-hero">
          <Plus className="w-4 h-4 mr-2" />
          Add Competition
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Competitions List</CardTitle>
          <CardDescription>All platform competitions</CardDescription>
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
                          <span className="text-xs text-muted-foreground">Participants: {competition.participants || 0}/{competition.max_participants}</span>
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
                                This action will be submitted for admin approval. Are you sure you want to request deletion of this competition?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={() => handleDeleteCompetition(competition.id)}
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

      {/* Add Competition Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Competition</DialogTitle>
            <DialogDescription>Create a new competition for students (requires admin approval)</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Competition Name *</Label>
              <Input
                value={newCompetition.name}
                onChange={(e) => setNewCompetition({ ...newCompetition, name: e.target.value })}
                placeholder="e.g., Math Olympiad 2024"
              />
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                value={newCompetition.description}
                onChange={(e) => setNewCompetition({ ...newCompetition, description: e.target.value })}
                placeholder="Describe the competition..."
                rows={3}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
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
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Participants</Label>
                <Input
                  type="number"
                  value={newCompetition.max_participants}
                  onChange={(e) => setNewCompetition({ ...newCompetition, max_participants: parseInt(e.target.value) })}
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

// Questions Tab Component
function QuestionsTab() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    id: '',
    question_text: '',
    category: 'math',
    difficulty: 'medium',
    question_type: 'mcq',
    options: ['', '', '', ''],
    correct_answer: '',
    explanation: '',
    is_approved: true,
    created_at: '',
    updated_at: ''
  });
  const { toast } = useToast();
  const { profile } = useAuth();

  // Load questions from local storage
  useEffect(() => {
    setQuestions(localStorageCRUD.get(LOCAL_STORAGE_KEYS.QUESTIONS));
  }, []);

  const filteredQuestions = questions.filter(q =>
    q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddQuestion = async () => {
    // Check if required fields are filled
    const missingFields = [];
    if (!newQuestion.question_text) missingFields.push('Question Text');
    if (newQuestion.question_type === 'mcq' && !newQuestion.correct_answer) missingFields.push('Correct Answer');

    if (missingFields.length > 0) {
      const confirm = window.confirm(`The following required fields are missing: ${missingFields.join(', ')}. Do you want to continue anyway?`);
      if (!confirm) return;
    }

    setLoading(true);
    try {
      // Generate ID
      const newId = `quest-${Date.now()}`;
      const questionToAdd = {
        ...newQuestion,
        id: newId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Create pending approval for question
      const approvalItem = {
        id: `approval-${Date.now()}`,
        type: 'question',
        data: questionToAdd,
        created_by: profile?.id,
        created_by_name: profile?.display_name || profile?.email,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      // Add to approvals
      localStorageCRUD.add(LOCAL_STORAGE_KEYS.APPROVALS, approvalItem);
      setQuestions(localStorageCRUD.get(LOCAL_STORAGE_KEYS.QUESTIONS));

      toast({ title: 'Question submitted for admin approval!', description: 'An admin will review this shortly.' });
      setIsAddDialogOpen(false);
      setNewQuestion({
        id: '',
        question_text: '',
        category: 'math',
        difficulty: 'medium',
        question_type: 'mcq',
        options: ['', '', '', ''],
        correct_answer: '',
        explanation: '',
        is_approved: true,
        created_at: '',
        updated_at: ''
      });
    } catch (error) {
      toast({ title: 'Error submitting question', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleDeleteQuestion = async (id: string) => {
    setLoading(true);
    try {
      // Create pending approval for question deletion
      const questionToDelete = questions.find(q => q.id === id);
      const approvalItem = {
        id: `approval-${Date.now()}`,
        type: 'question_delete',
        data: { question_id: id, question_text: questionToDelete?.question_text },
        created_by: profile?.id,
        created_by_name: profile?.display_name || profile?.email,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      // Add to approvals
      localStorageCRUD.add(LOCAL_STORAGE_KEYS.APPROVALS, approvalItem);
      setQuestions(localStorageCRUD.get(LOCAL_STORAGE_KEYS.QUESTIONS));

      toast({ title: 'Question deletion submitted for admin approval!', description: 'An admin will review this shortly.' });
    } catch (error) {
      toast({ title: 'Error submitting deletion request', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...newQuestion.options];
    newOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Questions</h1>
          <p className="text-muted-foreground">Manage all questions</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gradient-hero">
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Questions List</CardTitle>
          <CardDescription>All platform questions</CardDescription>
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
                        <h3 className="font-medium">{question.question_text}</h3>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">{question.category}</span>
                          <span className="px-2 py-1 rounded-full text-xs bg-accent/10 text-accent">{question.difficulty}</span>
                          <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">{question.question_type}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${question.is_approved ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                            {question.is_approved ? 'Approved' : 'Pending'}
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
                                This action will be submitted for admin approval. Are you sure you want to request deletion of this question?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={() => handleDeleteQuestion(question.id)}
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

      {/* Add Question Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Question</DialogTitle>
            <DialogDescription>Create a new question for competitions (requires admin approval)</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Question Type</Label>
              <Select
                value={newQuestion.question_type}
                onValueChange={(value) => setNewQuestion({ ...newQuestion, question_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select question type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mcq">Multiple Choice Question (MCQ)</SelectItem>
                  <SelectItem value="written">Written Answer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Question Text *</Label>
              <Textarea
                value={newQuestion.question_text}
                onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                placeholder="Enter the question..."
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={newQuestion.category}
                  onValueChange={(value) => setNewQuestion({ ...newQuestion, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="math">Math</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="general">General Knowledge</SelectItem>
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

            {newQuestion.question_type === 'mcq' && (
              <div className="space-y-2">
                <Label>Options</Label>
                <div className="space-y-3">
                  {newQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      <Button
                        variant={newQuestion.correct_answer === option ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setNewQuestion({ ...newQuestion, correct_answer: option })}
                      >
                        {newQuestion.correct_answer === option ? 'Correct ✓' : 'Mark Correct'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Explanation</Label>
              <Textarea
                value={newQuestion.explanation}
                onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                placeholder="Explain why the correct answer is right..."
                rows={3}
              />
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="is-approved"
                checked={newQuestion.is_approved}
                onCheckedChange={(checked) => setNewQuestion({ ...newQuestion, is_approved: checked })}
              />
              <Label htmlFor="is-approved">Approved</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddQuestion} disabled={loading}>
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
    // Check if email is provided
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

// Schools Tab Component
function SchoolsTab() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSchool, setNewSchool] = useState({
    id: '',
    name: '',
    location: '',
    contact_email: '',
    max_students: 1000,
    is_active: true,
    students: 0,
    created_at: '',
    updated_at: ''
  });
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [expandedSchools, setExpandedSchools] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { profile } = useAuth();

  // Load schools from local storage
  useEffect(() => {
    setSchools(localStorageCRUD.get(LOCAL_STORAGE_KEYS.SCHOOLS));
  }, []);

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSchool = async () => {
    // Check if required fields are filled
    const missingFields = [];
    if (!newSchool.name) missingFields.push('Name');

    if (missingFields.length > 0) {
      const confirm = window.confirm(`The following required fields are missing: ${missingFields.join(', ')}. Do you want to continue anyway?`);
      if (!confirm) return;
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

      // Create pending approval for school creation
      const approvalItem = {
        id: `approval-${Date.now()}`,
        type: 'school',
        data: schoolToAdd,
        created_by: profile?.id,
        created_by_name: profile?.display_name || profile?.email,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      // Add to approvals
      localStorageCRUD.add(LOCAL_STORAGE_KEYS.APPROVALS, approvalItem);
      setSchools(localStorageCRUD.get(LOCAL_STORAGE_KEYS.SCHOOLS));

      toast({ title: 'School creation submitted for admin approval!', description: 'An admin will review this shortly.' });
      setIsAddDialogOpen(false);
      setNewSchool({
        id: '',
        name: '',
        location: '',
        contact_email: '',
        max_students: 1000,
        is_active: true,
        students: 0,
        created_at: '',
        updated_at: ''
      });
    } catch (error) {
      toast({ title: 'Error submitting school', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleDeleteSchool = async (id: string) => {
    setLoading(true);
    try {
      // Create pending approval for school deletion
      const schoolToDelete = schools.find(school => school.id === id);
      const approvalItem = {
        id: `approval-${Date.now()}`,
        type: 'school_delete',
        data: { school_id: id, school_name: schoolToDelete?.name },
        created_by: profile?.id,
        created_by_name: profile?.display_name || profile?.email,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      // Add to approvals
      localStorageCRUD.add(LOCAL_STORAGE_KEYS.APPROVALS, approvalItem);
      setSchools(localStorageCRUD.get(LOCAL_STORAGE_KEYS.SCHOOLS));

      toast({ title: 'School deletion submitted for admin approval!', description: 'An admin will review this shortly.' });
    } catch (error) {
      toast({ title: 'Error submitting deletion request', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const toggleExpandSchool = (schoolId: string) => {
    const newSet = new Set(expandedSchools);
    if (newSet.has(schoolId)) {
      newSet.delete(schoolId);
    } else {
      newSet.add(schoolId);
    }
    setExpandedSchools(newSet);
  };

  const getStudentsForSchool = (schoolId: string) => {
    const users = localStorageCRUD.get(LOCAL_STORAGE_KEYS.USERS);
    return users.filter(user => user.school_id === schoolId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Schools</h1>
          <p className="text-muted-foreground">Manage all schools</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gradient-hero">
          <Plus className="w-4 h-4 mr-2" />
          Add School
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schools List</CardTitle>
          <CardDescription>All platform schools</CardDescription>
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
                {filteredSchools.map((school) => {
                  const isExpanded = expandedSchools.has(school.id);
                  const students = getStudentsForSchool(school.id);

                  return (
                    <div key={school.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{school.name}</h3>
                          <p className="text-xs text-muted-foreground">{school.location}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-muted-foreground">Students: {students.length}/{school.max_students}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${school.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                              {school.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => toggleExpandSchool(school.id)}
                          >
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </Button>
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
                                  This action will be submitted for admin approval. Are you sure you want to request deletion of this school?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive hover:bg-destructive/90"
                                  onClick={() => handleDeleteSchool(school.id)}
                                >
                                  Request Deletion
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>

                      {isExpanded && students.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <h4 className="font-medium mb-2">Students in this school</h4>
                          <ScrollArea className="max-h-60">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-border">
                                  <th className="p-2 text-left font-medium">Name</th>
                                  <th className="p-2 text-left font-medium">Email</th>
                                  <th className="p-2 text-left font-medium">Role</th>
                                </tr>
                              </thead>
                              <tbody>
                                {students.map((student) => (
                                  <tr key={student.id} className="border-b border-border/50 last:border-none">
                                    <td className="p-2">
                                      <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                                          {student.display_name?.split(' ').map(n => n[0]).join('') || student.email?.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span>{student.display_name || 'No name'}</span>
                                      </div>
                                    </td>
                                    <td className="p-2 text-muted-foreground">{student.email}</td>
                                    <td className="p-2">
                                      <span className={`px-2 py-1 rounded-full text-xs capitalize ${student.role === 'student' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
                                        {student.role}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </ScrollArea>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add School Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New School</DialogTitle>
            <DialogDescription>Register a new school (requires admin approval)</DialogDescription>
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
              <Label>Location</Label>
              <Input
                value={newSchool.location}
                onChange={(e) => setNewSchool({ ...newSchool, location: e.target.value })}
                placeholder="City, Country"
              />
            </div>
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
              <Label>Max Students</Label>
              <Input
                type="number"
                value={newSchool.max_students}
                onChange={(e) => setNewSchool({ ...newSchool, max_students: parseInt(e.target.value) })}
              />
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="school-active"
                checked={newSchool.is_active}
                onCheckedChange={(checked) => setNewSchool({ ...newSchool, is_active: checked })}
              />
              <Label htmlFor="school-active">Active School</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSchool} disabled={loading}>
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

// Approvals Tab Component
function ApprovalsTab() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Load approvals from local storage
  useEffect(() => {
    setApprovals(localStorageCRUD.get(LOCAL_STORAGE_KEYS.APPROVALS));
  }, []);

  const filteredApprovals = approvals.filter(approval =>
    approval.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    approval.created_by_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApprove = async (id: string) => {
    setLoading(true);
    try {
      const approval = approvals.find(a => a.id === id);
      if (!approval) return;

      // Process the approval based on type
      if (approval.type === 'question') {
        // Approve question
        localStorageCRUD.add(LOCAL_STORAGE_KEYS.QUESTIONS, approval.data);
      } else if (approval.type === 'competition') {
        // Add competition
        localStorageCRUD.add(LOCAL_STORAGE_KEYS.COMPETITIONS, approval.data);
      } else if (approval.type === 'user') {
        // Add user
        localStorageCRUD.add(LOCAL_STORAGE_KEYS.USERS, approval.data);
      } else if (approval.type === 'school') {
        // Add school
        localStorageCRUD.add(LOCAL_STORAGE_KEYS.SCHOOLS, approval.data);
      }

      // Remove from pending approvals
      localStorageCRUD.remove(LOCAL_STORAGE_KEYS.APPROVALS, id);
      setApprovals(localStorageCRUD.get(LOCAL_STORAGE_KEYS.APPROVALS));

      toast({ title: 'Approval processed successfully!' });
    } catch (error) {
      toast({ title: 'Error processing approval', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleReject = async (id: string) => {
    setLoading(true);
    try {
      localStorageCRUD.remove(LOCAL_STORAGE_KEYS.APPROVALS, id);
      setApprovals(localStorageCRUD.get(LOCAL_STORAGE_KEYS.APPROVALS));

      toast({ title: 'Approval rejected successfully!' });
    } catch (error) {
      toast({ title: 'Error rejecting approval', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Pending Approvals</h1>
        <p className="text-muted-foreground">Review moderator actions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>Actions requiring admin approval</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search approvals..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </div>
            ) : filteredApprovals.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No pending approvals</p>
            ) : (
              <div className="space-y-4">
                {filteredApprovals.map((approval) => (
                  <div key={approval.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-muted">
                            {approval.type === 'question' && <FileQuestion className="w-4 h-4 text-primary" />}
                            {approval.type === 'competition' && <Trophy className="w-4 h-4 text-primary" />}
                            {approval.type === 'user' && <User className="w-4 h-4 text-primary" />}
                            {approval.type === 'school' && <School className="w-4 h-4 text-primary" />}
                            {approval.type.includes('delete') && <Trash2 className="w-4 h-4 text-destructive" />}
                            {approval.type.includes('role') && <User className="w-4 h-4 text-warning" />}
                          </div>
                          <h3 className="font-medium">{approval.type}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Created by: {approval.created_by_name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">Date: {new Date(approval.created_at).toLocaleString()}</p>
                        {approval.type === 'question' && (
                          <p className="text-sm mt-2">Question: {approval.data?.question_text || 'N/A'}</p>
                        )}
                        {approval.type === 'competition' && (
                          <p className="text-sm mt-2">Competition: {approval.data?.name || 'N/A'}</p>
                        )}
                        {approval.type === 'user' && (
                          <p className="text-sm mt-2">User: {approval.data?.email || 'N/A'}</p>
                        )}
                        {approval.type === 'school' && (
                          <p className="text-sm mt-2">School: {approval.data?.name || 'N/A'}</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          className="bg-success hover:bg-success/90 h-8 w-8 p-0"
                          onClick={() => handleApprove(approval.id)}
                          disabled={loading}
                        >
                          <CheckCircle className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 w-8 p-0"
                          onClick={() => handleReject(approval.id)}
                          disabled={loading}
                        >
                          <XCircle className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
  const [newMessage, setNewMessage] = useState({
    subject: '',
    content: '',
    receiver_email: '',
    receiver_role: 'all'
  });
  const { toast } = useToast();
  const { profile } = useAuth();

  // Load messages from local storage
  useEffect(() => {
    setMessages(localStorageCRUD.get(LOCAL_STORAGE_KEYS.MESSAGES));
  }, []);

  const filteredMessages = messages.filter(message =>
    message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendReply = async () => {
    if (!replyContent || !selectedMessage) return;

    setSendingReply(true);

    try {
      const replyMessage = {
        id: `msg-${Date.now()}`,
        subject: `Re: ${selectedMessage.subject}`,
        content: replyContent,
        sender: profile?.display_name || profile?.email,
        senderEmail: profile?.email,
        receiver_id: selectedMessage.senderEmail,
        receiverEmail: selectedMessage.senderEmail,
        date: new Date().toISOString(),
        read: false,
        created_at: new Date().toISOString()
      };

      // Add to local storage
      localStorageCRUD.add(LOCAL_STORAGE_KEYS.MESSAGES, replyMessage);
      setMessages(localStorageCRUD.get(LOCAL_STORAGE_KEYS.MESSAGES));

      toast({ title: 'Reply sent successfully!' });
      setReplyContent('');
    } catch (error) {
      toast({ title: 'Error sending reply', description: error.message, variant: 'destructive' });
    }

    setSendingReply(false);
  };

  const handleSendNewMessage = async () => {
    if (!newMessage.subject || !newMessage.content || !newMessage.receiver_email) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      let receiverIds = [];

      if (newMessage.receiver_role === 'all') {
        const users = localStorageCRUD.get(LOCAL_STORAGE_KEYS.USERS);
        receiverIds = users.map(user => user.email);
      } else {
        const users = localStorageCRUD.get(LOCAL_STORAGE_KEYS.USERS);
        receiverIds = users
          .filter(user => user.role === newMessage.receiver_role)
          .map(user => user.email);
      }

      if (newMessage.receiver_email.includes('@')) {
        receiverIds = [newMessage.receiver_email];
      }

      const messageData = receiverIds.map(receiverId => ({
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        subject: newMessage.subject,
        content: newMessage.content,
        sender: profile?.display_name || profile?.email,
        senderEmail: profile?.email,
        receiver_id: receiverId,
        receiverEmail: receiverId,
        date: new Date().toISOString(),
        read: false,
        created_at: new Date().toISOString()
      }));

      // Add all messages to local storage
      messageData.forEach(message => {
        localStorageCRUD.add(LOCAL_STORAGE_KEYS.MESSAGES, message);
      });

      setMessages(localStorageCRUD.get(LOCAL_STORAGE_KEYS.MESSAGES));

      toast({ title: `Message sent to ${receiverIds.length} recipient(s)!` });
      setNewMessage({
        subject: '',
        content: '',
        receiver_email: '',
        receiver_role: 'all'
      });
    } catch (error) {
      toast({ title: 'Error sending message', description: error.message, variant: 'destructive' });
    }

    setLoading(false);
  };

  const handleDeleteMessage = async (messageId: string) => {
    setLoading(true);
    try {
      localStorageCRUD.remove(LOCAL_STORAGE_KEYS.MESSAGES, messageId);
      setMessages(localStorageCRUD.get(LOCAL_STORAGE_KEYS.MESSAGES));

      toast({ title: 'Message deleted successfully!' });
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      toast({ title: 'Error deleting message', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Messages</h1>
        <p className="text-muted-foreground">Your communications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Send New Message</CardTitle>
          <CardDescription>Send messages to users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={newMessage.subject}
                onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                placeholder="Enter message subject"
              />
            </div>

            <div className="space-y-2">
              <Label>Message Content</Label>
              <Textarea
                value={newMessage.content}
                onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                placeholder="Enter your message"
                rows={6}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Send To</Label>
                <Select
                  value={newMessage.receiver_role}
                  onValueChange={(value) => setNewMessage({ ...newMessage, receiver_role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="student">All Students</SelectItem>
                    <SelectItem value="teacher">All Teachers</SelectItem>
                    <SelectItem value="moderator">All Moderators</SelectItem>
                    <SelectItem value="specific">Specific Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newMessage.receiver_role === 'specific' && (
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    value={newMessage.receiver_email}
                    onChange={(e) => setNewMessage({ ...newMessage, receiver_email: e.target.value })}
                    placeholder="user@school.com"
                  />
                </div>
              )}
            </div>

            <Button
              onClick={handleSendNewMessage}
              disabled={loading}
              className="gradient-hero"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Message'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

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

// Profile View Component
function ProfileView() {
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
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{localStorageCRUD.get(LOCAL_STORAGE_KEYS.USERS).length}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Active Competitions</p>
              <p className="text-2xl font-bold">{localStorageCRUD.get(LOCAL_STORAGE_KEYS.COMPETITIONS).length}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Pending Approvals</p>
              <p className="text-2xl font-bold">{localStorageCRUD.get(LOCAL_STORAGE_KEYS.APPROVALS).length}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}