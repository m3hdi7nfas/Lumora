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
  Trash2
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

function TeacherSidebar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const { profile } = useAuth();
  const navItems = [
    { id: 'overview', icon: BarChart3, label: 'Overview' },
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
              {profile?.display_name?.substring(0, 2).toUpperCase() || 'TD'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{profile?.display_name || 'Teacher'}</p>
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

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { profile, currentView, isAdminOrModerator } = useAuth();

  return (
    <DashboardLayout
      title="Lumora Teacher Dashboard"
      sidebar={<TeacherSidebar activeTab={activeTab} setActiveTab={setActiveTab} />}
    >
      {activeTab === 'overview' && <TeacherOverview setActiveTab={setActiveTab} />}
      {activeTab === 'students' && <StudentsTab />}
      {activeTab === 'leaderboard' && <TeacherLeaderboardTab />}
      {activeTab === 'messages' && <MessagesTab />}
      {activeTab === 'profile' && <ProfileView />}
    </DashboardLayout>
  );
}

// Teacher Overview Component
function TeacherOverview({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { toast } = useToast();
  const { profile, currentView, isAdminOrModerator } = useAuth();

  // Fetch stats from database
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['teacher-stats'],
    queryFn: async () => {
      try {
        // Get students for this teacher
        const { data: students, error: studentsError } = await supabase.from('profiles').select('*').eq('role', 'student');
        if (studentsError) throw studentsError;

        // Get competitions
        const { data: competitions, error: compError } = await supabase.from('competitions').select('*');
        if (compError) throw compError;

        return {
          totalStudents: students.length,
          activeStudents: students.length,
          competitions: competitions.length,
          questionsAnswered: 0, // This would come from a more complex query
          avgScore: 0, // This would come from a more complex query
          recentActivity: []
        };
      } catch (error) {
        console.error('Error fetching stats:', error);
        return {
          totalStudents: 0,
          activeStudents: 0,
          competitions: 0,
          questionsAnswered: 0,
          avgScore: 0,
          recentActivity: []
        };
      }
    }
  });

  const quickActions = [
    { id: 'students', icon: Users, title: 'View Students', description: 'Check student progress' },
    { id: 'leaderboard', icon: Trophy, title: 'Class Leaderboard', description: 'See top performers' },
    { id: 'messages', icon: MessageSquare, title: 'Student Messages', description: 'Read student communications' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Teacher Dashboard</h1>
        <p className="text-muted-foreground">Overview of your class performance and activities</p>
        {isAdminOrModerator && currentView && (
          <div className="mt-2 flex items-center gap-2 text-sm text-primary">
            <Eye className="w-4 h-4" />
            <span>Viewing as Teacher - Can access all schools and competitions</span>
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
          title="Competitions"
          value={stats?.competitions?.toString() || '0'}
          icon={Trophy}
          className="bg-accent/10 border-accent/20"
          loading={statsLoading}
        />
        <StatCard
          title="Avg. Score"
          value={`${stats?.avgScore || 0}%`}
          icon={BarChart3}
          className="bg-warning/10 border-warning/20"
          loading={statsLoading}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common teacher tasks</CardDescription>
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
          <CardDescription>Latest class events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentActivity?.length === 0 ? (
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

// Students Tab Component
function StudentsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const { toast } = useToast();
  const { profile, currentView, isAdminOrModerator } = useAuth();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const queryClient = useQueryClient();

  const filteredStudents = students.filter(student =>
    (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     student.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedClass === 'all' || student.class === selectedClass)
  );

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // Fetch students - if admin/moderator viewing as teacher, show all students
      let query = supabase.from('profiles').select('*').eq('role', 'student');

      if (!isAdminOrModerator || !currentView) {
        // Regular teacher can only see students from their school
        // query = query.eq('school_id', profile?.school_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      toast({ title: 'Error fetching students', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase.from('schools').select('*');
      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleUpdateStudent = async () => {
    if (!editingStudent.name) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('profiles').update({
        display_name: editingStudent.name,
        is_active: editingStudent.is_active
      }).eq('id', editingStudent.id);

      if (error) throw error;

      toast({ title: 'Student updated successfully!' });
      setEditingStudent(null);
      fetchStudents();
    } catch (error) {
      toast({ title: 'Error updating student', description: error.message, variant: 'destructive' });
    }

    setLoading(false);
  };

  const handleDeleteStudent = async (studentId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', studentId);
      if (error) throw error;

      toast({ title: 'Student deleted successfully!' });
      fetchStudents();
    } catch (error) {
      toast({ title: 'Error deleting student', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Student Management</h1>
          <p className="text-muted-foreground">View and manage your students</p>
          {isAdminOrModerator && currentView && (
            <div className="mt-2 flex items-center gap-2 text-sm text-primary">
              <Unlock className="w-4 h-4" />
              <span>Admin/Moderator View - Can see all schools</span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map(cls => (
                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Students List</CardTitle>
          <CardDescription>{isAdminOrModerator && currentView ? 'All students across all schools' : 'Your students'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </div>
            ) : filteredStudents.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No students found</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-3 text-left font-medium">Name</th>
                    <th className="p-3 text-left font-medium">Class</th>
                    <th className="p-3 text-left font-medium">School</th>
                    <th className="p-3 text-left font-medium">Score</th>
                    <th className="p-3 text-left font-medium">Progress</th>
                    <th className="p-3 text-left font-medium">Status</th>
                    <th className="p-3 text-left font-medium">Actions</th>
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
                      <td className="p-3 text-muted-foreground">{student.class || 'N/A'}</td>
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
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setEditingStudent(student)}
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
                                <AlertDialogTitle>Delete Student</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this student? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive hover:bg-destructive/90"
                                  onClick={() => handleDeleteStudent(student.id)}
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
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Student Dialog */}
      {editingStudent && (
        <Dialog open={!!editingStudent} onOpenChange={() => setEditingStudent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
              <DialogDescription>Update student information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={editingStudent.display_name || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, display_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={editingStudent.email || ''}
                  disabled
                />
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="is-active"
                  checked={editingStudent.is_active}
                  onCheckedChange={(checked) => setEditingStudent({ ...editingStudent, is_active: checked })}
                />
                <Label htmlFor="is-active">Active Student</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingStudent(null)}>Cancel</Button>
              <Button onClick={handleUpdateStudent} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Student'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Teacher Leaderboard Tab Component
function TeacherLeaderboardTab() {
  const [selectedCompetition, setSelectedCompetition] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const { toast } = useToast();
  const { profile, currentView, isAdminOrModerator } = useAuth();
  const [loading, setLoading] = useState(false);
  const [competitions, setCompetitions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]);

  const badgeColors = {
    gold: 'bg-gold text-gold-foreground',
    silver: 'bg-silver text-silver-foreground',
    bronze: 'bg-bronze text-bronze-foreground',
    none: 'bg-muted text-muted-foreground'
  };

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

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase.from('schools').select('*');
      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // Fetch students with scores
      let query = supabase.from('profiles').select('*').eq('role', 'student').order('score', { ascending: false });

      if (!isAdminOrModerator || !currentView) {
        // Regular teacher can only see students from their school
        // query = query.eq('school_id', profile?.school_id);
      }

      const { data, error } = await query;
      if (error) throw error;

      setLeaderboardData(data || []);
    } catch (error) {
      toast({ title: 'Error fetching leaderboard', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCompetitions();
    fetchClasses();
    fetchLeaderboard();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Class Leaderboard</h1>
          <p className="text-muted-foreground">Track your students' performance</p>
          {isAdminOrModerator && currentView && (
            <div className="mt-2 flex items-center gap-2 text-sm text-primary">
              <Unlock className="w-4 h-4" />
              <span>Admin/Moderator View - Can see all competitions</span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Select value={selectedCompetition} onValueChange={setSelectedCompetition}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select competition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Competitions</SelectItem>
              {competitions.map(comp => (
                <SelectItem key={comp.id} value={comp.id}>{comp.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map(cls => (
                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Performance</CardTitle>
          <CardDescription>{isAdminOrModerator && currentView ? 'All students across all schools' : 'Your students'} scores and progress</CardDescription>
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
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${badgeColors[index < 3 ? (index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze') : 'none']}`}>
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

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Class Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-4">No class statistics available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-4">No top performers data available</p>
          </CardContent>
        </Card>
      </div>
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

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Messages</h1>
        <p className="text-muted-foreground">Student communications</p>
        {isAdminOrModerator && currentView && (
          <div className="mt-2 flex items-center gap-2 text-sm text-primary">
            <Eye className="w-4 h-4" />
            <span>Viewing as Teacher - Can see messages from all students</span>
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
        <p className="text-muted-foreground">Manage your teacher account</p>
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
              <p className="text-sm text-muted-foreground">Students Taught</p>
              <p className="text-2xl font-bold">0</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Competitions Organized</p>
              <p className="text-2xl font-bold">0</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Avg. Class Score</p>
              <p className="text-2xl font-bold">0%</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}