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
  Mail,
  Send,
  Shield,
  BookOpen,
  Award,
  Image as ImageIcon,
  Badge as BadgeIcon
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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

function AdminSidebar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const { profile } = useAuth();
  const navItems = [
    { id: 'overview', icon: Users, label: 'Overview' },
    { id: 'competitions', icon: Trophy, label: 'Competitions' },
    { id: 'questions', icon: FileQuestion, label: 'Questions' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'schools', icon: School, label: 'Schools' },
    { id: 'approvals', icon: CheckSquare, label: 'Approvals' },
    { id: 'messages', icon: MessageSquare, label: 'Messages' },
    { id: 'avatars', icon: ImageIcon, label: 'Avatars' },
    { id: 'badges', icon: BadgeIcon, label: 'Badges' },
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
      title="Lumora Admin Dashboard"
      sidebar={<AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />}
    >
      <div className="p-6">
        {activeTab === 'overview' && <AdminOverviewTab setActiveTab={setActiveTab} showAds={showAds} handleAdsToggle={handleAdsToggle} loading={loading} />}
        {activeTab === 'competitions' && <CompetitionsTab />}
        {activeTab === 'questions' && <QuestionsTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'schools' && <SchoolsTab />}
        {activeTab === 'approvals' && <ApprovalsTab />}
        {activeTab === 'messages' && <MessagesTab />}
        {activeTab === 'avatars' && <AvatarsTab />}
        {activeTab === 'badges' && <BadgesTab />}
        {activeTab === 'profile' && <ProfileView />}
      </div>
    </DashboardLayout>
  );
}

// Admin Overview Component
function AdminOverviewTab({ setActiveTab, showAds, handleAdsToggle, loading }: { setActiveTab: (tab: string) => void, showAds: boolean, handleAdsToggle: (checked: boolean) => void, loading: boolean }) {
  const { toast } = useToast();
  const { profile } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      try {
        const { data: users, error: usersError } = await supabase.from('profiles').select('*');
        if (usersError) throw usersError;

        const { data: competitions, error: compError } = await supabase.from('competitions').select('*');
        if (compError) throw compError;

        const { data: questions, error: questionsError } = await supabase.from('questions').select('*');
        if (questionsError) throw questionsError;

        const { data: pending, error: pendingError } = await supabase.from('pending_approvals').select('*');
        if (pendingError) throw pendingError;

        return {
          totalUsers: users.length,
          activeCompetitions: competitions.length,
          totalQuestions: questions.length,
          pendingReviews: pending.length
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
          title="Pending Approvals"
          value={stats?.pendingReviews?.toString() || '0'}
          icon={Clock}
          className="bg-warning/10 border-warning/20"
          loading={statsLoading}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common admin tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

// Competitions Tab Component
function CompetitionsTab() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCompetition, setNewCompetition] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    is_active: true,
    max_participants: 100,
    difficulty: 'medium'
  });
  const { toast } = useToast();

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

  const handleAddCompetition = async () => {
    if (!newCompetition.name || !newCompetition.description) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('competitions').insert([newCompetition]);
      if (error) throw error;

      toast({ title: 'Competition added successfully!' });
      setIsAddDialogOpen(false);
      setNewCompetition({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        is_active: true,
        max_participants: 100,
        difficulty: 'medium'
      });
      fetchCompetitions();
    } catch (error) {
      toast({ title: 'Error adding competition', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleDeleteCompetition = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('competitions').delete().eq('id', id);
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
            <DialogTitle>Add New Competition</DialogTitle>
            <DialogDescription>Create a new competition for students</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Competition Name</Label>
              <Input
                value={newCompetition.name}
                onChange={(e) => setNewCompetition({ ...newCompetition, name: e.target.value })}
                placeholder="e.g., Math Olympiad 2024"
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
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    category: 'math',
    difficulty: 'medium',
    options: ['', '', '', ''],
    correct_answer: '',
    explanation: '',
    is_approved: true
  });
  const { toast } = useToast();

  const filteredQuestions = questions.filter(q =>
    q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.category.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleAddQuestion = async () => {
    if (!newQuestion.question_text || !newQuestion.correct_answer) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('questions').insert([newQuestion]);
      if (error) throw error;

      toast({ title: 'Question added successfully!' });
      setIsAddDialogOpen(false);
      setNewQuestion({
        question_text: '',
        category: 'math',
        difficulty: 'medium',
        options: ['', '', '', ''],
        correct_answer: '',
        explanation: '',
        is_approved: true
      });
      fetchQuestions();
    } catch (error) {
      toast({ title: 'Error adding question', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleDeleteQuestion = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('questions').delete().eq('id', id);
      if (error) throw error;

      toast({ title: 'Question deleted successfully!' });
      fetchQuestions();
    } catch (error) {
      toast({ title: 'Error deleting question', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...newQuestion.options];
    newOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Question</DialogTitle>
            <DialogDescription>Create a new question for competitions</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Question Text</Label>
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
    email: '',
    display_name: '',
    role: 'student',
    school_id: '',
    password: 'default123'
  });
  const [bulkUsers, setBulkUsers] = useState('');
  const { toast } = useToast();
  const { profile } = useAuth();

  const filteredUsers = users.filter(user =>
    (user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (roleFilter === 'all' || user.role === roleFilter)
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

  const handleAddUser = async () => {
    if (!newUser.email) {
      toast({ title: 'Email is required', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // First create the auth user
      const { error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        email_confirm: true,
      });

      if (authError) throw authError;

      // Then create the profile
      const { error: profileError } = await supabase.from('profiles').insert([{
        user_id: `user-${Date.now()}`,
        email: newUser.email,
        display_name: newUser.display_name,
        role: newUser.role,
        school_id: newUser.school_id,
        is_active: true
      }]);

      if (profileError) throw profileError;

      toast({ title: 'User added successfully!' });
      setIsAddDialogOpen(false);
      setNewUser({
        email: '',
        display_name: '',
        role: 'student',
        school_id: '',
        password: 'default123'
      });
      fetchUsers();
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
        const [email, name, role = 'student', school = ''] = line.split(',').map(item => item.trim());
        if (!email) continue;

        usersToAdd.push({
          user_id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          email,
          display_name: name || email.split('@')[0],
          role: role || 'student',
          school_id: school || null,
          is_active: true
        });
      }

      const { error } = await supabase.from('profiles').insert(usersToAdd);
      if (error) throw error;

      toast({ title: `Successfully added ${usersToAdd.length} users!` });
      setIsBulkAddDialogOpen(false);
      setBulkUsers('');
      fetchUsers();
    } catch (error) {
      toast({ title: 'Error adding users', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleDeleteUser = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;

      toast({ title: 'User deleted successfully!' });
      fetchUsers();
    } catch (error) {
      toast({ title: 'Error deleting user', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      if (error) throw error;

      toast({ title: 'Role updated successfully!' });
      fetchUsers();
    } catch (error) {
      toast({ title: 'Error updating role', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="user@school.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input
                value={newUser.display_name}
                onChange={(e) => setNewUser({ ...newUser, display_name: e.target.value })}
                placeholder="John Doe"
              />
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
              <Label>Password</Label>
              <Input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="••••••••"
              />
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Add Users</DialogTitle>
            <DialogDescription>Add multiple users at once (CSV format: email,name,role,school)</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>User Data</Label>
              <Textarea
                value={bulkUsers}
                onChange={(e) => setBulkUsers(e.target.value)}
                placeholder={`user1@school.com,John Doe,student,school123\nuser2@school.com,Jane Smith,teacher,school123\nuser3@school.com,Bob Johnson,moderator`}
                rows={10}
                className="font-mono"
              />
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Format Instructions:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• One user per line</li>
                <li>• Format: email,name,role,school</li>
                <li>• Role can be: student, teacher, moderator, admin</li>
                <li>• School is optional</li>
                <li>• Example: user@school.com,John Doe,student,school123</li>
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
                'Bulk Add Users'
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
    name: '',
    location: '',
    contact_email: '',
    max_students: 1000,
    is_active: true
  });
  const { toast } = useToast();

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.location.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleAddSchool = async () => {
    if (!newSchool.name) {
      toast({ title: 'School name is required', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('schools').insert([newSchool]);
      if (error) throw error;

      toast({ title: 'School added successfully!' });
      setIsAddDialogOpen(false);
      setNewSchool({
        name: '',
        location: '',
        contact_email: '',
        max_students: 1000,
        is_active: true
      });
      fetchSchools();
    } catch (error) {
      toast({ title: 'Error adding school', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleDeleteSchool = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('schools').delete().eq('id', id);
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
                {filteredSchools.map((school) => (
                  <div key={school.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{school.name}</h3>
                        <p className="text-xs text-muted-foreground">{school.location}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-muted-foreground">Students: {school.students || 0}/{school.max_students}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${school.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                            {school.is_active ? 'Active' : 'Inactive'}
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
            <DialogTitle>Add New School</DialogTitle>
            <DialogDescription>Register a new school</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>School Name</Label>
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

// Approvals Tab Component
function ApprovalsTab() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const filteredApprovals = approvals.filter(approval =>
    approval.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    approval.created_by_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('pending_approvals').select('*');
      if (error) throw error;
      setApprovals(data || []);
    } catch (error) {
      toast({ title: 'Error fetching approvals', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    setLoading(true);
    try {
      const approval = approvals.find(a => a.id === id);
      if (!approval) return;

      // Process the approval based on type
      if (approval.type === 'question') {
        // Approve question
        await supabase.from('questions').update({
          is_approved: true,
          approved_by: 'admin',
          approved_at: new Date().toISOString()
        }).eq('id', approval.data.question_id);
      }

      // Remove from pending approvals
      await supabase.from('pending_approvals').delete().eq('id', id);

      toast({ title: 'Approval processed successfully!' });
      fetchApprovals();
    } catch (error) {
      toast({ title: 'Error processing approval', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleReject = async (id: string) => {
    setLoading(true);
    try {
      await supabase.from('pending_approvals').delete().eq('id', id);
      toast({ title: 'Approval rejected successfully!' });
      fetchApprovals();
    } catch (error) {
      toast({ title: 'Error rejecting approval', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

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
                          </div>
                          <h3 className="font-medium">{approval.type}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Created by: {approval.created_by_name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">Date: {new Date(approval.created_at).toLocaleString()}</p>
                        {approval.type === 'question' && (
                          <p className="text-sm mt-2">Question: {approval.data?.question_text || 'N/A'}</p>
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
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [newMessage, setNewMessage] = useState({
    subject: '',
    content: '',
    receiver_email: '',
    receiver_role: 'all'
  });
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

  const handleSendNewMessage = async () => {
    if (!newMessage.subject || !newMessage.content || !newMessage.receiver_email) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      let receiverIds = [];

      if (newMessage.receiver_role === 'all') {
        const { data: users, error: usersError } = await supabase.from('profiles').select('id');
        if (usersError) throw usersError;
        receiverIds = users.map(user => user.id);
      } else {
        const { data: users, error: usersError } = await supabase.from('profiles').select('id').eq('role', newMessage.receiver_role);
        if (usersError) throw usersError;
        receiverIds = users.map(user => user.id);
      }

      if (newMessage.receiver_email.includes('@')) {
        const { data: user, error: userError } = await supabase.from('profiles').select('id').eq('email', newMessage.receiver_email).single();
        if (userError) throw userError;
        receiverIds = [user.id];
      }

      const messageData = receiverIds.map(receiverId => ({
        subject: newMessage.subject,
        content: newMessage.content,
        receiver_id: receiverId,
        sender_id: profile?.id,
        sender_email: profile?.email,
        is_system: false
      }));

      const { error } = await supabase.from('messages').insert(messageData);

      if (error) throw error;

      toast({ title: `Message sent to ${receiverIds.length} recipient(s)!` });
      setNewMessage({
        subject: '',
        content: '',
        receiver_email: '',
        receiver_role: 'all'
      });
      setIsComposeOpen(false);
    } catch (error) {
      toast({ title: 'Error sending message', description: error.message, variant: 'destructive' });
    }

    setLoading(false);
  };

  const handleDeleteMessage = async (messageId: string) => {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Messages</h1>
          <p className="text-muted-foreground">Your communications</p>
        </div>
        <Button onClick={() => setIsComposeOpen(true)} className="gradient-hero">
          <Send className="w-4 h-4 mr-2" />
          Compose Message
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

      {/* Compose Message Dialog */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Compose New Message</DialogTitle>
            <DialogDescription>Send a message to users</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
                rows={8}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsComposeOpen(false)}>Cancel</Button>
            <Button onClick={handleSendNewMessage} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Message'
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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAvatar, setNewAvatar] = useState({
    name: '',
    image_url: '',
    category: 'default'
  });
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

  const handleAddAvatar = async () => {
    if (!newAvatar.name || !newAvatar.image_url) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('avatars').insert([newAvatar]);
      if (error) throw error;

      toast({ title: 'Avatar added successfully!' });
      setIsAddDialogOpen(false);
      setNewAvatar({
        name: '',
        image_url: '',
        category: 'default'
      });
      fetchAvatars();
    } catch (error) {
      toast({ title: 'Error adding avatar', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleDeleteAvatar = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('avatars').delete().eq('id', id);
      if (error) throw error;

      toast({ title: 'Avatar deleted successfully!' });
      fetchAvatars();
    } catch (error) {
      toast({ title: 'Error deleting avatar', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAvatars();
  }, []);

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
          <CardTitle>Avatars Gallery</CardTitle>
          <CardDescription>All available user avatars</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {loading ? (
              <div className="text-center py-4 col-span-full">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </div>
            ) : avatars.length === 0 ? (
              <p className="text-center text-muted-foreground py-4 col-span-full">No avatars found</p>
            ) : (
              avatars.map((avatar) => (
                <div key={avatar.id} className="text-center">
                  <div className="relative group">
                    <img
                      src={avatar.image_url}
                      alt={avatar.name}
                      className="w-16 h-16 rounded-full object-cover mx-auto mb-2 border-2 border-border"
                    />
                    <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon" className="h-6 w-6 rounded-full">
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
                  <p className="text-xs truncate">{avatar.name}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Avatar Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Avatar</DialogTitle>
            <DialogDescription>Upload a new avatar for users</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Avatar Name</Label>
              <Input
                value={newAvatar.name}
                onChange={(e) => setNewAvatar({ ...newAvatar, name: e.target.value })}
                placeholder="e.g., Astronaut"
              />
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={newAvatar.image_url}
                onChange={(e) => setNewAvatar({ ...newAvatar, image_url: e.target.value })}
                placeholder="https://example.com/avatar.png"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={newAvatar.category}
                onValueChange={(value) => setNewAvatar({ ...newAvatar, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="animals">Animals</SelectItem>
                  <SelectItem value="professions">Professions</SelectItem>
                  <SelectItem value="fantasy">Fantasy</SelectItem>
                  <SelectItem value="seasonal">Seasonal</SelectItem>
                </SelectContent>
              </Select>
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

// Badges Tab Component
function BadgesTab() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newBadge, setNewBadge] = useState({
    name: '',
    description: '',
    image_url: '',
    category: 'achievement',
    points_required: 100
  });
  const { toast } = useToast();

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

  const handleAddBadge = async () => {
    if (!newBadge.name || !newBadge.description) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('badges').insert([newBadge]);
      if (error) throw error;

      toast({ title: 'Badge added successfully!' });
      setIsAddDialogOpen(false);
      setNewBadge({
        name: '',
        description: '',
        image_url: '',
        category: 'achievement',
        points_required: 100
      });
      fetchBadges();
    } catch (error) {
      toast({ title: 'Error adding badge', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleDeleteBadge = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('badges').delete().eq('id', id);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Badges</h1>
          <p className="text-muted-foreground">Manage achievement badges</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gradient-hero">
          <Plus className="w-4 h-4 mr-2" />
          Add Badge
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Badges Collection</CardTitle>
          <CardDescription>All available achievement badges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading ? (
              <div className="text-center py-4 col-span-full">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </div>
            ) : badges.length === 0 ? (
              <p className="text-center text-muted-foreground py-4 col-span-full">No badges found</p>
            ) : (
              badges.map((badge) => (
                <div key={badge.id} className="p-4 rounded-xl bg-muted/50 border border-border/50">
                  <div className="relative group">
                    <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <Award className="w-8 h-8 text-gold" />
                    </div>
                    <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon" className="h-6 w-6 rounded-full">
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
                  <h3 className="font-medium text-sm text-center">{badge.name}</h3>
                  <p className="text-xs text-muted-foreground text-center mt-1">{badge.description}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">{badge.category}</span>
                    <span className="px-2 py-1 rounded-full text-xs bg-success/10 text-success">{badge.points_required} pts</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Badge Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Badge</DialogTitle>
            <DialogDescription>Create a new achievement badge</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Badge Name</Label>
              <Input
                value={newBadge.name}
                onChange={(e) => setNewBadge({ ...newBadge, name: e.target.value })}
                placeholder="e.g., Math Master"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newBadge.description}
                onChange={(e) => setNewBadge({ ...newBadge, description: e.target.value })}
                placeholder="Describe what this badge represents..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Image URL (optional)</Label>
              <Input
                value={newBadge.image_url}
                onChange={(e) => setNewBadge({ ...newBadge, image_url: e.target.value })}
                placeholder="https://example.com/badge.png"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={newBadge.category}
                  onValueChange={(value) => setNewBadge({ ...newBadge, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="achievement">Achievement</SelectItem>
                    <SelectItem value="competition">Competition</SelectItem>
                    <SelectItem value="skill">Skill</SelectItem>
                    <SelectItem value="participation">Participation</SelectItem>
                    <SelectItem value="special">Special</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Points Required</Label>
                <Input
                  type="number"
                  value={newBadge.points_required}
                  onChange={(e) => setNewBadge({ ...newBadge, points_required: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddBadge} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Badge'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">0</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Active Competitions</p>
              <p className="text-2xl font-bold">0</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Pending Approvals</p>
              <p className="text-xl font-bold">0</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}