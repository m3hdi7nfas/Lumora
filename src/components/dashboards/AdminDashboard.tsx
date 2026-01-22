import { useState, useEffect } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  BarChart3,
  Trophy,
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
  Clock,
  AlertTriangle,
  Settings,
  FileText
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { QuestionSetForm } from '@/components/questions/QuestionSetForm';
import { Switch } from '@/components/ui/switch';

function AdminSidebar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const { profile } = useAuth();
  const navItems = [
    { id: 'overview', icon: BarChart3, label: 'Overview' },
    { id: 'competitions', icon: Trophy, label: 'Competitions' },
    { id: 'question-sets', icon: Trophy, label: 'Question Sets' },
    { id: 'students', icon: Users, label: 'Students' },
    { id: 'leaderboard', icon: Trophy, label: 'Leaderboard' },
    { id: 'messages', icon: MessageSquare, label: 'Inbox' },
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

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { profile, currentView, isAdminOrModerator } = useAuth();

  return (
    <DashboardLayout
      title="Lumora Admin Dashboard"
      sidebar={<AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />}
    >
      {activeTab === 'overview' && <AdminOverview setActiveTab={setActiveTab} />}
      {activeTab === 'competitions' && <CompetitionsTab />}
      {activeTab === 'question-sets' && <QuestionSetsTab />}
      {activeTab === 'students' && <StudentsTab />}
      {activeTab === 'leaderboard' && <AdminLeaderboardTab />}
      {activeTab === 'messages' && <MessagesTab />}
      {activeTab === 'profile' && <ProfileView />}
    </DashboardLayout>
  );
}

// Admin Overview Component
function AdminOverview({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { toast } = useToast();
  const { profile, currentView, isAdminOrModerator } = useAuth();

  // Fetch stats from database
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      try {
        // Get students
        const { data: students, error: studentsError } = await supabase.from('profiles').select('*').eq('role', 'student');
        if (studentsError) throw studentsError;

        // Get teachers
        const { data: teachers, error: teachersError } = await supabase.from('profiles').select('*').eq('role', 'teacher');
        if (teachersError) throw teachersError;

        // Get competitions
        const { data: competitions, error: compError } = await supabase.from('competitions').select('*');
        if (compError) throw compError;

        // Get question sets
        const { data: questionSets, error: qsError } = await supabase.from('question_sets').select('*');
        if (qsError) throw qsError;

        return {
          totalStudents: students.length,
          activeStudents: students.filter(s => s.is_active).length,
          totalTeachers: teachers.length,
          activeTeachers: teachers.filter(t => t.is_active).length,
          competitions: competitions.length,
          questionSets: questionSets.length,
          questionsAnswered: 0, // This would come from a more complex query
          avgScore: 0, // This would come from a more complex query
          recentActivity: []
        };
      } catch (error) {
        console.error('Error fetching stats:', error);
        return {
          totalStudents: 0,
          activeStudents: 0,
          totalTeachers: 0,
          activeTeachers: 0,
          competitions: 0,
          questionSets: 0,
          questionsAnswered: 0,
          avgScore: 0,
          recentActivity: []
        };
      }
    }
  });

  const quickActions = [
    { id: 'competitions', icon: Trophy, title: 'Manage Competitions', description: 'Create and manage competitions' },
    { id: 'question-sets', icon: Trophy, title: 'Question Sets', description: 'Create and manage question sets' },
    { id: 'students', icon: Users, title: 'View Students', description: 'Check student progress' },
    { id: 'leaderboard', icon: Trophy, title: 'Global Leaderboard', description: 'See top performers' },
  ];

  const handleResetDemoData = () => {
    // Reset demo accounts data
    const users = JSON.parse(localStorage.getItem('lumora_users') || '[]');
    const updatedUsers = users.map(user => {
      if (user.email.includes('demo.')) {
        return {
          ...user,
          score: 0,
          progress: 0,
          display_name: user.email.split('@')[0].replace('demo.', '').replace(/\./g, ' '),
          email: user.email // Keep email but reset other data
        };
      }
      return user;
    });

    localStorage.setItem('lumora_users', JSON.stringify(updatedUsers));

    // Reset competitions
    const defaultCompetitions = [
      {
        id: 'comp-1',
        name: 'Math Challenge',
        description: 'Annual math competition for all students',
        is_active: true,
        max_participants: 100,
        current_participants: 0, // Reset to 0
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'comp-2',
        name: 'Science Olympiad',
        description: 'Science competition covering physics, chemistry, and biology',
        is_active: false,
        max_participants: 50,
        current_participants: 0, // Reset to 0
        start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    localStorage.setItem('lumora_competitions', JSON.stringify(defaultCompetitions));

    // Reset questions
    const defaultQuestions = [
      {
        id: 'q-1',
        text: 'What is 2 + 2?',
        category: 'Math',
        difficulty: 'easy',
        points: 10,
        options: ['2', '3', '4', '5'],
        correct_answer: '4',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'q-2',
        text: 'What is the capital of France?',
        category: 'Geography',
        difficulty: 'medium',
        points: 15,
        options: ['London', 'Berlin', 'Paris', 'Madrid'],
        correct_answer: 'Paris',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    localStorage.setItem('lumora_questions', JSON.stringify(defaultQuestions));

    toast({
      title: 'Demo data reset',
      description: 'All demo accounts have been reset to default values',
      variant: 'success'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of platform performance and activities</p>
        {isAdminOrModerator && currentView && (
          <div className="mt-2 flex items-center gap-2 text-sm text-primary">
            <Eye className="w-4 h-4" />
            <span>Viewing as Admin - Full platform access</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents?.toString() || '0'}
          icon={Users}
          className="bg-primary/10 border-primary/20"
          loading={statsLoading}
        />
        <StatCard
          title="Active Students"
          value={stats?.activeStudents?.toString() || '0'}
          icon={CheckCircle}
          className="bg-success/10 border-success/20"
          loading={statsLoading}
        />
        <StatCard
          title="Total Teachers"
          value={stats?.totalTeachers?.toString() || '0'}
          icon={Users}
          className="bg-accent/10 border-accent/20"
          loading={statsLoading}
        />
        <StatCard
          title="Question Sets"
          value={stats?.questionSets?.toString() || '0'}
          icon={Trophy}
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

          {/* Reset Demo Data Button */}
          <div className="mt-6 pt-4 border-t border-border/50">
            <Button
              onClick={handleResetDemoData}
              variant="outline"
              className="w-full gradient-hero hover:scale-105 transition-transform"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset Demo Data
            </Button>
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
            {!stats || stats.recentActivity?.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No recent activity</p>
            ) : (
              stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="p-2 rounded-lg bg-muted">
                    {activity.type === 'competition' && <Trophy className="w-4 h-4 text-primary" />}
                    {activity.type === 'student' && <Users className="w-4 h-4 text-primary" />}
                    {activity.type === 'question' && <Eye className="w-4 h-4 text-primary" />}
                    {activity.type === 'badge' && <CheckCircle className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.action} • {activity.time}</p>
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
  const { toast } = useToast();

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

  const filteredCompetitions = competitions.filter(competition =>
    competition.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    competition.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchCompetitions();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Competitions</h1>
          <p className="text-muted-foreground">Manage platform competitions</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Competitions List</CardTitle>
          <CardDescription>Available competitions</CardDescription>
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
                          <span className="text-xs text-muted-foreground">Participants: {competition.current_participants || 0}/{competition.max_participants}</span>
                        </div>
                      </div>
                      <Button size="sm" className="gradient-hero">
                        Manage
                      </Button>
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

// Question Sets Tab Component
function QuestionSetsTab() {
  const [questionSets, setQuestionSets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSet, setEditingSet] = useState(null);
  const { toast } = useToast();

  const filteredQuestionSets = questionSets.filter(set =>
    set.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    set.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchQuestionSets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('question_sets').select('*');
      if (error) throw error;
      setQuestionSets(data || []);
    } catch (error) {
      toast({ title: 'Error fetching question sets', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleAddOrUpdateSet = async (setData) => {
    setLoading(true);
    try {
      if (setData.id) {
        // Update existing set
        const { error } = await supabase.from('question_sets').update(setData).eq('id', setData.id);
        if (error) throw error;
        toast({ title: 'Question set updated successfully!' });
      } else {
        // Add new set
        const newSet = {
          ...setData,
          id: `set-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        const { error } = await supabase.from('question_sets').insert(newSet);
        if (error) throw error;
        toast({ title: 'Question set added successfully!' });
      }

      fetchQuestionSets();
      setIsAddDialogOpen(false);
      setEditingSet(null);
    } catch (error) {
      toast({ title: 'Error saving question set', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleDeleteSet = async (setId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('question_sets').delete().eq('id', setId);
      if (error) throw error;

      toast({ title: 'Question set deleted successfully!' });
      fetchQuestionSets();
    } catch (error) {
      toast({ title: 'Error deleting question set', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleToggleRedo = async (setId: string, allowRedo: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('question_sets').update({
        allow_redo: allowRedo,
        updated_at: new Date().toISOString()
      }).eq('id', setId);

      if (error) throw error;

      toast({
        title: 'Redo setting updated',
        description: `Students can ${allowRedo ? 'now' : 'no longer'} redo this question set`
      });

      fetchQuestionSets();
    } catch (error) {
      toast({ title: 'Error updating redo setting', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleToggleScoring = async (setId: string, scoringMethod: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('question_sets').update({
        scoring_method: scoringMethod,
        updated_at: new Date().toISOString()
      }).eq('id', setId);

      if (error) throw error;

      toast({
        title: 'Scoring method updated',
        description: `Scoring method set to: ${scoringMethod}`
      });

      fetchQuestionSets();
    } catch (error) {
      toast({ title: 'Error updating scoring method', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const getTimerInfo = (set) => {
    if (!set.is_timed) return 'No time limit';
    return `${set.time_limit_minutes} min${set.auto_submit ? ' (auto-submit)' : ''}`;
  };

  const getScoringMethodLabel = (method) => {
    switch (method) {
      case 'highest': return 'Highest Score';
      case 'best_of_three': return 'Best of 3 Attempts';
      case 'first_attempt': return 'First Attempt Only';
      default: return 'Highest Score';
    }
  };

  useEffect(() => {
    fetchQuestionSets();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Question Sets</h1>
          <p className="text-muted-foreground">Manage question collections</p>
        </div>
        <Button onClick={() => {
          setEditingSet(null);
          setIsAddDialogOpen(true);
        }} className="gradient-hero">
          <Plus className="w-4 h-4 mr-2" />
          Add Question Set
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question Sets List</CardTitle>
          <CardDescription>All question sets</CardDescription>
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
                {filteredQuestionSets.map((set) => (
                  <div key={set.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{set.name}</h3>
                        <p className="text-xs text-muted-foreground">{set.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                            {set.questions_count || 0} questions
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs bg-success/10 text-success">
                            {set.category}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${set.is_timed ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'}`}>
                            {set.is_timed ? (
                              <>
                                <Clock className="w-3 h-3 inline mr-1" />
                                {getTimerInfo(set)}
                              </>
                            ) : (
                              'No timer'
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setEditingSet(set);
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
                              <AlertDialogTitle>Delete Question Set</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this question set? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={() => handleDeleteSet(set.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    {/* Admin Controls */}
                    <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Allow Redo</Label>
                        <Switch
                          checked={set.allow_redo || false}
                          onCheckedChange={(checked) => handleToggleRedo(set.id, checked)}
                          disabled={loading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Scoring Method</Label>
                        <Select
                          value={set.scoring_method || 'highest'}
                          onValueChange={(value) => handleToggleScoring(set.id, value)}
                          disabled={loading}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select scoring method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="highest">Highest Score</SelectItem>
                            <SelectItem value="best_of_three">Best of 3 Attempts</SelectItem>
                            <SelectItem value="first_attempt">First Attempt Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Settings className="w-3 h-3" />
                        <span>Current: {getScoringMethodLabel(set.scoring_method || 'highest')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Question Set Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setEditingSet(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSet ? 'Edit' : 'Add'} Question Set</DialogTitle>
            <DialogDescription>
              {editingSet ? 'Update' : 'Create a new'} question set with optional timer settings
            </DialogDescription>
          </DialogHeader>
          <QuestionSetForm
            initialData={editingSet}
            onSubmit={handleAddOrUpdateSet}
            onCancel={() => {
              setIsAddDialogOpen(false);
              setEditingSet(null);
            }}
            isLoading={loading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Students Tab Component
function StudentsTab() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('role', 'student');
      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      toast({ title: 'Error fetching students', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Student Management</h1>
          <p className="text-muted-foreground">View and manage all students</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Students List</CardTitle>
          <CardDescription>All students across all schools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </div>
            ) : filteredStudents.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No students found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="p-3 text-left font-medium">Name</th>
                      <th className="p-3 text-left font-medium">Email</th>
                      <th className="p-3 text-left font-medium">School</th>
                      <th className="p-3 text-left font-medium">Score</th>
                      <th className="p-3 text-left font-medium">Progress</th>
                      <th className="p-3 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="border-b border-border/50 last:border-none hover:bg-muted/50 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                              {student.display_name?.split(' ').map(n => n[0]).join('') || student.email?.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium">{student.display_name || 'No name'}</p>
                              <p className="text-xs text-muted-foreground">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">{student.email}</td>
                        <td className="p-3 text-muted-foreground">{student.school || 'N/A'}</td>
                        <td className="p-3 font-bold">{student.score?.toLocaleString() || '0'}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-full h-2 bg-muted rounded-full">
                              <div
                                className="h-2 bg-primary rounded-full"
                                style={{ width: `${student.progress || 0}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{student.progress || 0}%</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs capitalize ${student.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                            {student.is_active ? 'active' : 'inactive'}
                          </span>
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
    </div>
  );
}

// Leaderboard Tab Component
function AdminLeaderboardTab() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // Fetch students with scores
      const { data, error } = await supabase.from('profiles').select('*').eq('role', 'student').order('score', { ascending: false });
      if (error) throw error;

      setLeaderboardData(data || []);
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
        <h1 className="text-2xl font-display font-bold">Global Leaderboard</h1>
        <p className="text-muted-foreground">Track all students' performance</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Rankings</CardTitle>
          <CardDescription>Top performers across all competitions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </div>
            ) : leaderboardData.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No leaderboard data available</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-3 text-left font-medium">Rank</th>
                    <th className="p-3 text-left font-medium">Student</th>
                    <th className="p-3 text-left font-medium">School</th>
                    <th className="p-3 text-left font-medium">Score</th>
                    <th className="p-3 text-left font-medium">Progress</th>
                    <th className="p-3 text-left font-medium">Achievement</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((student, index) => (
                    <tr key={student.id} className="border-b border-border/50 last:border-none hover:bg-muted/50 transition-colors">
                      <td className="p-3 font-medium">{index + 1}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                            {student.display_name?.split(' ').map(n => n[0]).join('') || student.email?.substring(0, 2).toUpperCase()}
                          </div>
                          <span>{student.display_name || 'No name'}</span>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">{student.school || 'N/A'}</td>
                      <td className="p-3 font-bold">{student.score?.toLocaleString() || '0'}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-full h-2 bg-muted rounded-full">
                            <div
                              className="h-2 bg-primary rounded-full"
                              style={{ width: `${student.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{student.progress || 0}%</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index < 3 ? (index === 0 ? 'bg-gold text-gold-foreground' : index === 1 ? 'bg-silver text-silver-foreground' : 'bg-bronze text-bronze-foreground') : 'bg-muted text-muted-foreground'}`}>
                          {index + 1}
                        </div>
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

// Messages Tab Component
function MessagesTab() {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { profile, currentView, isAdminOrModerator } = useAuth();
  const queryClient = useQueryClient();

  const filteredMessages = messages.filter(message =>
    message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchMessages = async () => {
    setLoading(true);
    try {
      // Fetch messages - if admin/moderator viewing as teacher, show all messages
      let query = supabase.from('messages').select('*').eq('receiver_id', profile?.id);

      if (isAdminOrModerator && currentView) {
        // Admin/moderator can see all messages
        query = supabase.from('messages').select('*');
      }

      const { data, error } = await query;
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
      <div>
        <h1 className="text-2xl font-display font-bold">Messages</h1>
        <p className="text-muted-foreground">User communications</p>
        {isAdminOrModerator && currentView && (
          <div className="mt-2 flex items-center gap-2 text-sm text-primary">
            <Eye className="w-4 h-4" />
            <span>Viewing as Admin - Can see messages from all users</span>
          </div>
        )}
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
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-2xl font-bold">0</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Teachers</p>
              <p className="text-2xl font-bold">0</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Competitions Organized</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboard;