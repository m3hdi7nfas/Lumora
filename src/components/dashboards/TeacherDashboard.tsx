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
import { supabase } from '@/lib/supabase';
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

  const { setIsProfileDialogOpen } = useAuth();
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
            <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-bold text-sm overflow-hidden border border-border">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                profile?.display_name?.substring(0, 2).toUpperCase() || 'TD'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{profile?.display_name || 'Teacher'}</p>
              <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={() => setIsProfileDialogOpen(true)}>
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
      onNavItemClick={setActiveTab}
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
        // 1. Fetch Students
        let profilesQuery = supabase.from('profiles').select('id, score', { count: 'exact' }).eq('role', 'student');
        if (profile?.school_id && !isAdminOrModerator) {
          profilesQuery = profilesQuery.eq('school_id', profile.school_id);
        }
        const { data: profiles, count: totalStudents } = await profilesQuery;
        const studentIds = (profiles || []).map(p => p.id);

        // 2. Fetch Competitions
        const { count: competitions } = await supabase.from('competitions').select('*', { count: 'exact', head: true }).eq('is_active', true);

        // 3. Fetch Results for these students
        let questionsCorrectlyAnswered = 0;
        let questionsAttempted = 0;
        let avgScore = 0;

        if (studentIds.length > 0) {
          const { data: results, error: resultsError } = await supabase
            .from('results')
            .select('*')
            .in('student_id', studentIds)
            .limit(1000);

          if (resultsError) console.error('Results fetch error:', resultsError);

          if (results && results.length > 0) {
            questionsCorrectlyAnswered = results.reduce((sum, r: any) => sum + (r.correct_count || Math.round((r.score || 0) / 10)), 0);
            questionsAttempted = results.reduce((sum, r: any) => sum + (r.total_questions || Math.round((r.total_points || 0) / 10)), 0);
            avgScore = questionsAttempted > 0 ? Math.round((questionsCorrectlyAnswered / questionsAttempted) * 100) : 0;
          }
        }

        return {
          totalStudents: totalStudents || 0,
          questionsCorrectlyAnswered,
          questionsAttempted,
          avgScore,
          recentActivity: []
        };
      } catch (error) {
        console.error('Error fetching stats:', error);
        return {
          totalStudents: 0,
          questionsCorrectlyAnswered: 0,
          questionsAttempted: 0,
          avgScore: 0,
          recentActivity: []
        };
      }
    }
  });

  const quickActions = [
    { id: 'students', icon: Users, title: 'View Students', description: 'Check student progress' },
    { id: 'leaderboard', icon: Trophy, title: 'Class Leaderboard', description: 'See top performers' },
    { id: 'messages', icon: MessageSquare, title: 'Messages', description: 'Communications' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Teacher Dashboard - Hello {profile?.display_name || 'Teacher'} 👋</h1>
          <p className="text-muted-foreground">Overview of your class performance and activities</p>
          {isAdminOrModerator && currentView && (
            <div className="mt-2 flex items-center gap-2 text-sm text-primary">
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
          title="Correct Answers"
          value={stats?.questionsCorrectlyAnswered?.toLocaleString() || '0'}
          icon={CheckCircle}
          className="bg-success/10 border-success/20"
          loading={statsLoading}
        />
        <StatCard
          title="Questions Attempted"
          value={stats?.questionsAttempted?.toLocaleString() || '0'}
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
  const { toast } = useToast();
  const { profile, currentView, isAdminOrModerator } = useAuth();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);

  const filteredStudents = (students || []).filter(student =>
  ((student?.display_name || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
    (student?.email || "").toLowerCase().includes((searchTerm || "").toLowerCase()))
  );

  const fetchStudents = async () => {
    setLoading(true);
    try {
      let q = supabase.from('profiles').select('*').eq('role', 'student');
      if (profile?.school_id && !isAdminOrModerator) {
        q = q.eq('school_id', profile.school_id);
      }
      const { data: profilesData, error: profilesError } = await q;
      if (profilesError) throw profilesError;

      const studentIds = (profilesData || []).map(p => p.id);
      const [
        { data: schoolsData },
        { data: allComps },
        { data: allSets },
        { data: allResults },
        { data: joinedComps }
      ] = await Promise.all([
        supabase.from('schools').select('id, name'),
        supabase.from('competitions').select('id, participating_schools, is_active'),
        supabase.from('question_sets').select('id, competition_ids'),
        supabase.from('results').select('student_id, question_set_id').in('student_id', studentIds),
        supabase.from('joined_competitions').select('user_id, competition_id').in('user_id', studentIds)
      ]);

      const schoolsMap = new Map((schoolsData || []).map(s => [s.id, s.name]));

      const studentsList = (profilesData || []).map(student => {
        // Find competitions this student is part of
        const joinedCompIds = (joinedComps || [])
          .filter(j => j.user_id === student.id)
          .map(j => j.competition_id);

        const assignedCompIds = (allComps || [])
          .filter(c => c.participating_schools?.includes(student.school_id))
          .map(c => c.id);

        const studentComps = new Set([...joinedCompIds, ...assignedCompIds]);

        // Find total available question sets in those competitions
        const availableSets = new Set();
        (allSets || []).forEach(set => {
          if ((set.competition_ids || []).some((cId: string) => studentComps.has(cId))) {
            availableSets.add(set.id);
          }
        });

        // Find attempted question sets
        const attemptedSets = new Set();
        (allResults || []).forEach(res => {
          if (res.student_id === student.id && res.question_set_id && availableSets.has(res.question_set_id)) {
            attemptedSets.add(res.question_set_id);
          }
        });

        const totalAvailable = availableSets.size;
        const totalAttempted = attemptedSets.size;

        return {
          ...student,
          school: schoolsMap.get(student.school_id) || 'N/A',
          progressText: `${totalAttempted} / ${totalAvailable}`,
          progressPercentage: totalAvailable > 0 ? Math.round((totalAttempted / totalAvailable) * 100) : 0
        };
      });

      setStudents(studentsList as any);
    } catch (error: any) {
      toast({ title: 'Error fetching students', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Student Management</h1>
          <p className="text-muted-foreground">View your students' progress</p>
          {isAdminOrModerator && currentView && (
            <div className="mt-2 flex items-center gap-2 text-sm text-primary">
              <span></span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Students List</CardTitle>
          <CardDescription>{isAdminOrModerator && currentView ? 'All students across all schools' : 'Your students'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
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
                    <th className="p-3 text-left font-medium">School</th>
                    <th className="p-3 text-center font-medium">Score</th>
                    <th className="p-3 text-center font-medium">Progress</th>
                    <th className="p-3 text-center font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="border-b border-border/50 last:border-none hover:bg-muted/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold font-mono">
                            {(student?.display_name || student?.email || '??').split(' ').filter(Boolean).map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{student.display_name || 'No name'}</p>
                            <p className="text-xs text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">{student.school || 'N/A'}</td>
                      <td className="p-3 text-center font-bold">{student.score?.toLocaleString() || '0'}</td>
                      <td className="p-3 text-center">
                        <span className="font-medium">{student.progressPercentage}%</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs capitalize ${student.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                          {student.is_active ? 'active' : 'inactive'}
                        </span>
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

// Teacher Leaderboard Tab Component
function TeacherLeaderboardTab() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompId, setSelectedCompId] = useState('all');
  const [leaderboardType, setLeaderboardType] = useState<'global' | 'schools' | 'myschool'>('global');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch competitions
      const { data: comps } = await supabase.from('competitions').select('*');
      if (comps) setCompetitions(comps as any);

      // 2. Fetch students
      let studentQuery = supabase.from('profiles').select('*').eq('role', 'student');
      if (leaderboardType === 'myschool' && profile?.school_id) {
        studentQuery = studentQuery.eq('school_id', profile.school_id);
      }
      const { data: students, error: studentError } = await studentQuery;
      if (studentError) throw studentError;

      // Filter out demo accounts
      const demoEmails = ['demo.admin@lumora.com', 'demo.moderator@lumora.com', 'demo.teacher@lumora.com', 'demo.student@lumora.com'];
      let filteredStudents = (students || []).filter((u: any) => !demoEmails.includes(u.email));

      // 3. Handle scoring based on competition filter
      if (selectedCompId === 'all') {
        // Use total profile score
        const sorted = filteredStudents.sort((a: any, b: any) => (b.score || 0) - (a.score || 0));
        setLeaderboardData(sorted as any);
      } else {
        // Sum scores for all question sets in this competition
        // First identify sets linked to this comp
        const { data: sets } = await supabase.from('question_sets').select('id').contains('competition_ids', [selectedCompId]);
        const setIds = (sets || []).map(s => s.id);

        const { data: results } = await supabase.from('results').select('student_id, score, question_set_id').in('question_set_id', setIds);

        // Map student IDs to their SUMMED score for this competition's sets
        const studentScores: Record<string, number> = {};
        (results || []).forEach(r => {
          studentScores[r.student_id] = (studentScores[r.student_id] || 0) + (r.score || 0);
        });

        const mappedData = filteredStudents
          .map(s => ({ ...s, competitionScore: studentScores[s.id] || 0 }))
          .sort((a: any, b: any) => b.competitionScore - a.competitionScore);

        setLeaderboardData(mappedData as any);
      }
    } catch (error: any) {
      toast({ title: 'Error fetching leaderboard', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInitialData();
  }, [selectedCompId, leaderboardType, profile?.school_id]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">Compare performance across different levels</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-muted p-1 rounded-lg">
            <Button
              variant={leaderboardType === 'global' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLeaderboardType('global')}
              className="h-8 text-xs"
            >Global</Button>
            <Button
              variant={leaderboardType === 'myschool' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLeaderboardType('myschool')}
              className="h-8 text-xs"
            >My School</Button>
            <Button
              variant={leaderboardType === 'schools' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLeaderboardType('schools')}
              className="h-8 text-xs"
            >School Ranking</Button>
          </div>

          <Select value={selectedCompId} onValueChange={setSelectedCompId}>
            <SelectTrigger className="w-[180px] h-10">
              <SelectValue placeholder="All Competitions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Competitions</SelectItem>
              {competitions.map((comp) => (
                <SelectItem key={comp.id} value={comp.id}>{comp.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative w-full md:w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-9 h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {leaderboardType === 'schools' ? (
        <Card>
          <CardHeader>
            <CardTitle>School Leaderboard</CardTitle>
            <CardDescription>Aggregate performance by institution</CardDescription>
          </CardHeader>
          <CardContent>
            <TeacherSchoolLeaderboard selectedCompId={selectedCompId} searchTerm={searchTerm} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{leaderboardType === 'global' ? 'Global Rankings' : 'Students In My School'}</CardTitle>
            <CardDescription>Top performing students based on {selectedCompId === 'all' ? 'total points' : 'competition points'}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>
              ) : leaderboardData.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No data found for this selection.</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="p-3 text-left font-medium">Rank</th>
                      <th className="p-3 text-left font-medium">Student</th>
                      <th className="p-3 text-right font-medium">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData
                      .filter((s: any) =>
                        (s.display_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (s.email || '').toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((student, index) => (
                        <tr key={student.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{index + 1}</span>
                              {index < 3 && <Crown className={`w-3 h-3 ${index === 0 ? 'text-warning' : index === 1 ? 'text-muted-foreground' : 'text-orange-400'}`} />}
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <p className="font-medium text-sm">{student.display_name || 'Anonymous'}</p>
                              <p className="text-[10px] text-muted-foreground">{student.email}</p>
                            </div>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-primary">
                            {(selectedCompId === 'all' ? student.score : student.competitionScore)?.toLocaleString() || '0'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TeacherSchoolLeaderboard({ selectedCompId, searchTerm }: { selectedCompId: string, searchTerm: string }) {
  const [schoolData, setSchoolData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSchools = async () => {
      setLoading(true);
      try {
        const { data: schools } = await supabase.from('schools').select('*');
        const { data: users } = await supabase.from('profiles').select('*').eq('role', 'student');
        const { data: results } = await supabase.from('results').select('*');

        const aggregatedSchools = await Promise.all((schools || []).map(async (school: any) => {
          const schoolStudents = (users || []).filter((u: any) => u?.school_id === school?.id);
          let totalPoints = 0;

          if (selectedCompId === 'all') {
            totalPoints = schoolStudents.reduce((sum, u: any) => sum + (u.score || 0), 0);
          } else {
            // Find all sets for this competition
            const { data: sets } = await supabase.from('question_sets').select('id').contains('competition_ids', [selectedCompId]);
            const setIds = (sets || []).map(s => s.id);

            if (setIds.length > 0) {
              const schoolStudentIds = schoolStudents.map(s => s.id);
              const { data: compResults } = await supabase.from('results').select('student_id, score').in('question_set_id', setIds).in('student_id', schoolStudentIds);
              totalPoints = (compResults || []).reduce((sum, r) => sum + (r.score || 0), 0);
            }
          }

          return { ...school, totalPoints };
        }));

        const sortedSchools = aggregatedSchools.sort((a, b) => b.totalPoints - a.totalPoints);
        setSchoolData(sortedSchools as any);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchSchools();
  }, [selectedCompId]);

  const filteredSchools = schoolData.filter((s: any) =>
    (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.country || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="overflow-x-auto max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
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
            {filteredSchools.map((school) => (
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('messages').insert({
        sender_name: profile?.display_name || profile?.email || 'Teacher',
        sender_id: user.id,
        sender_role: 'teacher',
        recipient_role: 'admin',
        subject: `[ISSUE] ${subject}`,
        body: content,
        is_read: false
      });
      if (error) throw error;

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
    (message?.sender_name || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
    (message?.body || "").toLowerCase().includes((searchTerm || "").toLowerCase())
  );

  const fetchMessages = async () => {
    setLoading(true);
    try {
      let q = supabase.from('messages').select('*').order('created_at', { ascending: false });

      if (!(isAdminOrModerator && currentView)) {
        q = q.or(`recipient_id.eq.${profile?.id},recipient_role.eq.${profile?.role},recipient_role.eq.all`);
      }

      const { data, error } = await q;
      if (error) throw error;
      setMessages(data as any);
    } catch (error: any) {
      toast({ title: 'Error fetching messages', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleMarkRead = async (id: string) => {
    try {
      await supabase.from('messages').update({ is_read: true }).eq('id', id);
      setMessages((prev: any) => prev.map((m: any) => m.id === id ? { ...m, is_read: true } : m));
    } catch (e) {
      console.error('Error marking as read:', e);
    }
  };

  const handleSendReply = async () => {
    if (!replyContent || !selectedMessage) return;

    setSendingReply(true);

    try {
      const { error } = await supabase.from('messages').insert({
        body: replyContent,
        recipient_id: (selectedMessage as any).sender_id || (selectedMessage as any).recipient_id,
        recipient_role: (selectedMessage as any).sender_role || 'specific',
        sender_id: profile?.id,
        sender_name: profile?.display_name || profile?.email || 'Teacher',
        sender_role: 'teacher',
        subject: `Re: ${(selectedMessage as any).subject}`,
      });

      if (error) throw error;
      toast({ title: 'Reply sent successfully!' });
      setReplyContent('');
      fetchMessages();
    } catch (error: any) {
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
        <p className="text-muted-foreground">Communications</p>
        {isAdminOrModerator && currentView && (
          <div className="mt-2 flex items-center gap-2 text-sm text-primary">
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
                        onClick={() => {
                          setSelectedMessage(message);
                          if (!message.is_read) handleMarkRead(message.id);
                        }}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${selectedMessage?.id === message.id ? 'bg-primary/10 border border-primary' : 'hover:bg-muted/50'} ${!message.is_read && 'border-l-2 border-primary'}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {(message?.sender_name || "??").split(' ').filter(Boolean).map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-medium truncate">{message.sender_name}</p>
                              <p className="text-xs text-muted-foreground whitespace-nowrap">{message.created_at ? new Date(message.created_at).toLocaleDateString() : ''}</p>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{message.subject}</p>
                            <p className="text-xs text-muted-foreground/60 truncate mt-1">{message.body}</p>
                            {!message.is_read && (
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
                  From: {selectedMessage.sender_name} • {selectedMessage.created_at ? new Date(selectedMessage.created_at).toLocaleDateString() : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedMessage.body}</p>
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