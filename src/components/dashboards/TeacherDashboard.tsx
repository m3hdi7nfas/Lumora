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
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
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
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const { toast } = useToast();
  const { profile, currentView, isAdminOrModerator } = useAuth();

  // Fetch stats from database
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['teacher-stats'],
    queryFn: async () => {
      try {
        // Get students (profiles) from Firestore
        const studentsQuery = query(collection(db, 'profiles'), where('role', '==', 'student'));
        const studentsSnap = await getDocs(studentsQuery);

        // Get competitions from Firestore
        const competitionsSnap = await getDocs(collection(db, 'competitions'));

        return {
          totalStudents: studentsSnap.size,
          activeStudents: studentsSnap.size,
          competitions: competitionsSnap.size,
          questionsAnswered: 0,
          avgScore: 0,
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
        <Button onClick={() => setIsReportDialogOpen(true)} variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive">
          <MessageSquare className="w-4 h-4 mr-2" />
          Report Issue
        </Button>
      </div>

      <ReportIssueDialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen} />

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
            {!stats || !stats.recentActivity || stats.recentActivity.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No recent activity</p>
            ) : (
              stats.recentActivity.map((activity: any) => (
                <div key={activity?.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="p-2 rounded-lg bg-muted">
                    {activity?.type === 'competition' && <Trophy className="w-4 h-4 text-primary" />}
                    {activity?.type === 'student' && <Users className="w-4 h-4 text-primary" />}
                    {activity?.type === 'question' && <Eye className="w-4 h-4 text-primary" />}
                    {activity?.type === 'badge' && <CheckCircle className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity?.title || 'Unknown Activity'}</p>
                    <p className="text-xs text-muted-foreground">{activity?.action} • {activity?.time}</p>
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

  const filteredStudents = (students || []).filter(student =>
    ((student?.display_name || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
      (student?.email || "").toLowerCase().includes((searchTerm || "").toLowerCase())) &&
    (selectedClass === 'all' || student?.class === selectedClass || student?.school_id === selectedClass)
  );

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // Fetch students from Firestore
      const studentsQuery = query(collection(db, 'profiles'), where('role', '==', 'student'));
      const studentsSnap = await getDocs(studentsQuery);
      const studentsList = studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(studentsList as any);
    } catch (error: any) {
      toast({ title: 'Error fetching students', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const fetchClasses = async () => {
    try {
      const schoolsSnap = await getDocs(collection(db, 'schools'));
      const schoolsList = schoolsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClasses(schoolsList as any);
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
      const studentRef = doc(db, 'profiles', editingStudent.id);
      await updateDoc(studentRef, {
        display_name: editingStudent.name,
        is_active: editingStudent.is_active,
        updated_at: serverTimestamp()
      });

      toast({ title: 'Student updated successfully!' });
      setEditingStudent(null);
      fetchStudents();
    } catch (error: any) {
      toast({ title: 'Error updating student', description: error.message, variant: 'destructive' });
    }

    setLoading(false);
  };

  const handleDeleteStudent = async (studentId: string) => {
    setLoading(true);
    try {
      const studentRef = doc(db, 'profiles', studentId);
      await deleteDoc(studentRef);

      toast({ title: 'Student deleted successfully!' });
      fetchStudents();
    } catch (error: any) {
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
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold font-mono">
                            {(student?.display_name || student?.email || '??').split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase()}
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
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompId, setSelectedCompId] = useState('all');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Fetch competitions from Firestore
      const compsSnap = await getDocs(collection(db, 'competitions'));
      const comps = compsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCompetitions(comps as any);

      // Fetch leaderboard data
      const profilesSnap = await getDocs(query(collection(db, 'profiles'), where('role', '==', 'student')));
      let filteredData = profilesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Exclude demo accounts
      const demoEmails = [
        'demo.admin@lumora.com',
        'demo.moderator@lumora.com',
        'demo.teacher@lumora.com',
        'demo.student@lumora.com'
      ];
      filteredData = filteredData.filter((u: any) => !demoEmails.includes(u.email));

      if (selectedCompId !== 'all') {
        const resultsSnap = await getDocs(collection(db, 'results'));
        const results = resultsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const compResults = (results || []).filter((r: any) => r?.question_set_id === selectedCompId || r?.competition_id === selectedCompId);

        const userScores: Record<string, number> = {};
        compResults.forEach((r: any) => {
          if (!userScores[r.student_id] || r.score > userScores[r.student_id]) {
            userScores[r.student_id] = r.score;
          }
        });

        filteredData = filteredData
          .filter((u: any) => u?.id && userScores[u.id] !== undefined)
          .map((u: any) => ({ ...u, score: userScores[u.id] }));
      }

      const sortedUsers = filteredData.sort((a: any, b: any) => (b.score || 0) - (a.score || 0));
      setLeaderboardData(sortedUsers as any);
    } catch (error: any) {
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
          <h1 className="text-2xl font-display font-bold">Class Leaderboard</h1>
          <p className="text-muted-foreground">Track student performance across competitions</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium whitespace-nowrap text-muted-foreground">Filter by Competition:</span>
          <Select value={selectedCompId} onValueChange={setSelectedCompId}>
            <SelectTrigger className="w-[200px]">
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

      <Card>
        <CardHeader>
          <CardTitle>Student Rankings</CardTitle>
          <CardDescription>Performance details for individual students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-4"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>
            ) : leaderboardData.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No data available for this selection.</p>
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

      <Card>
        <CardHeader>
          <CardTitle>School Leaderboard</CardTitle>
          <CardDescription>Aggregate performance by institution</CardDescription>
        </CardHeader>
        <CardContent>
          <TeacherSchoolLeaderboard selectedCompId={selectedCompId} />
        </CardContent>
      </Card>
    </div>
  );
}

function TeacherSchoolLeaderboard({ selectedCompId }: { selectedCompId: string }) {
  const [schoolData, setSchoolData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSchools = async () => {
      setLoading(true);
      try {
        const schoolsSnap = await getDocs(collection(db, 'schools'));
        const schools = schoolsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const usersSnap = await getDocs(query(collection(db, 'profiles'), where('role', '==', 'student')));
        const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const resultsSnap = await getDocs(collection(db, 'results'));
        const results = resultsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const aggregatedSchools = (schools || []).map((school: any) => {
          const schoolStudents = (users || []).filter((u: any) => u?.school_id === school?.id);
          let totalPoints = 0;

          if (selectedCompId === 'all') {
            totalPoints = schoolStudents.reduce((sum, u: any) => sum + (u.score || 0), 0);
          } else {
            schoolStudents.forEach((student: any) => {
              const studentResults = (results || []).filter((r: any) => (r?.question_set_id === selectedCompId || r?.competition_id === selectedCompId) && r?.student_id === student?.id);
              if (studentResults.length > 0) {
                totalPoints += Math.max(...studentResults.map((r: any) => r?.score || 0));
              }
            });
          }

          return { ...school, totalPoints };
        });

        const sortedSchools = aggregatedSchools.sort((a, b) => b.totalPoints - a.totalPoints);
        setSchoolData(sortedSchools as any);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchSchools();
  }, [selectedCompId]);

  return (
    <div className="overflow-x-auto">
      {loading ? (
        <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>
      ) : schoolData.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">No data found.</p>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="p-3 text-left font-medium">School Name</th>
              <th className="p-3 text-left font-medium">Country</th>
              <th className="p-3 text-right font-medium">Combined Points</th>
            </tr>
          </thead>
          <tbody>
            {schoolData.map((school) => (
              <tr key={school.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="p-3 font-semibold">{school.name}</td>
                <td className="p-3 text-sm">{school.country || 'Global'}</td>
                <td className="p-3 text-right font-mono text-primary font-bold">{school.totalPoints.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function ReportIssueDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  const { toast } = useToast();

  const handleSend = async () => {
    if (!subject || !content) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'messages'), {
        sender: profile?.display_name || profile?.email || 'Teacher',
        sender_id: profile?.id,
        sender_role: 'teacher',
        receiver_role: 'admin',
        subject: `[ISSUE] ${subject}`,
        content,
        created_at: serverTimestamp(),
        read: false,
        status: 'pending',
        replies: []
      });

      toast({ title: 'Issue reported!', description: 'Admins will review your report shortly.' });
      onOpenChange(false);
      setSubject('');
      setContent('');
    } catch (e: any) {
      toast({ title: 'Error sending report', description: e.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Report an Issue</DialogTitle>
          <DialogDescription>Send a message directly to platform administrators.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="What is the issue about?" />
          </div>
          <div className="space-y-2">
            <Label>Details</Label>
            <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Describe the issue in detail..." rows={5} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSend} disabled={loading} className="gradient-hero">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MessageSquare className="w-4 h-4 mr-2" />}
            Send Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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

  const filteredMessages = (messages || []).filter(message =>
    (message?.subject || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
    (message?.sender || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
    (message?.content || "").toLowerCase().includes((searchTerm || "").toLowerCase())
  );

  const fetchMessages = async () => {
    setLoading(true);
    try {
      let messagesQuery;
      if (isAdminOrModerator && currentView) {
        messagesQuery = collection(db, 'messages');
      } else {
        messagesQuery = query(collection(db, 'messages'), where('receiver_id', '==', profile?.id));
      }

      const messagesSnap = await getDocs(messagesQuery);
      const messagesList = messagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(messagesList as any);
    } catch (error: any) {
      toast({ title: 'Error fetching messages', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleSendReply = async () => {
    if (!replyContent || !selectedMessage) return;

    setSendingReply(true);

    try {
      await addDoc(collection(db, 'messages'), {
        content: replyContent,
        receiver_id: (selectedMessage as any).senderEmail,
        sender_id: profile?.email,
        subject: `Re: ${(selectedMessage as any).subject}`,
        created_at: serverTimestamp()
      });

      toast({ title: 'Reply sent successfully!' });
      setReplyContent('');
    } catch (error: any) {
      toast({ title: 'Error sending reply', description: error.message, variant: 'destructive' });
    }

    setSendingReply(false);
  };

  const handleDeleteMessage = async (messageId: string) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'messages', messageId));

      toast({ title: 'Message deleted successfully!' });
      setMessages(messages.filter(msg => (msg as any).id !== messageId));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error: any) {
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
                            {(message?.sender || "??").split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase()}
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
                          {(profile?.role !== 'student' && profile?.role !== 'teacher') && (
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
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedMessage.content}</p>
                  </div>

                  {/* Teachers can only see Announcements, no reply section */}
                  {profile?.role !== 'student' && profile?.role !== 'teacher' ? (
                    <div className="space-y-4 pt-4 border-t">
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
                  ) : (
                    <div className="pt-4 border-t">
                      <p className="text-xs text-muted-foreground italic text-center">
                        This is a read-only announcement. Replies are disabled.
                      </p>
                    </div>
                  )}
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