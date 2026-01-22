import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Eye, EyeOff, Loader2, RefreshCw, User, CheckCircle, XCircle, MessageSquare, AlertTriangle, Trash2, Mail, Users, Trophy, FileQuestion, CheckSquare, Clock, LayoutTemplate, School, TrendingUp, Calendar, ChevronRight, Crown, Medal, Star, Plus, Edit, Upload, ChevronDown, Shield, Unlock, Lock, Mail as MailIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { DashboardLayout } from './DashboardLayout';
import { Link } from 'react-router-dom';

export default function TeacherDashboard() {
  const { profile, currentView, isAdminOrModerator } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Sidebar navigation items
  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: LayoutTemplate },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'competitions', label: 'Competitions', icon: Trophy },
    { id: 'questions', label: 'Questions', icon: FileQuestion },
    { id: 'messages', label: 'Messages', icon: MailIcon },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Handle navigation item click
  const handleNavItemClick = (itemId) => {
    setActiveTab(itemId);
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <TeacherOverviewTab />;
      case 'leaderboard':
        return <TeacherLeaderboardTab />;
      case 'competitions':
        return <TeacherCompetitionsTab />;
      case 'questions':
        return <TeacherQuestionsTab />;
      case 'messages':
        return <MessagesTab />;
      case 'settings':
        return <TeacherSettingsTab />;
      default:
        return <TeacherOverviewTab />;
    }
  };

  return (
    <DashboardLayout
      title="Teacher Dashboard"
      sidebar={
        <div className="space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavItemClick(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === item.id ? 'bg-primary/10 border border-primary' : 'hover:bg-muted/50'}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      }
      onNavItemClick={handleNavItemClick}
    >
      {renderContent()}
    </DashboardLayout>
  );
}

// Overview Tab Component
function TeacherOverviewTab() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCompetitions: 0,
    totalQuestions: 0,
    activeCompetitions: 0,
    pendingApprovals: 0
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { profile, currentView, isAdminOrModerator } = useAuth();

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase.from('profiles').select('*');
      if (profilesError) throw profilesError;

      // Fetch competitions
      const { data: competitions, error: competitionsError } = await supabase.from('competitions').select('*');
      if (competitionsError) throw competitionsError;

      // Fetch questions
      const { data: questions, error: questionsError } = await supabase.from('questions').select('*');
      if (questionsError) throw questionsError;

      // Calculate stats
      const totalStudents = profiles.filter(p => p.role === 'student').length;
      const totalCompetitions = competitions.length;
      const totalQuestions = questions.length;
      const activeCompetitions = competitions.filter(c => c.is_active).length;
      const pendingApprovals = 0; // Placeholder for pending approvals

      setStats({
        totalStudents,
        totalCompetitions,
        totalQuestions,
        activeCompetitions,
        pendingApprovals
      });
    } catch (error) {
      toast({ title: 'Error fetching stats', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Teacher Dashboard</h1>
        <p className="text-muted-foreground">Overview of your class activity</p>
        {isAdminOrModerator && currentView && (
          <div className="mt-2 flex items-center gap-2 text-sm text-primary">
            <Unlock className="w-4 h-4" />
            <span>Admin/Moderator View - Can see all competitions</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents.toLocaleString()}
          icon={Users}
          color="text-primary"
        />
        <StatCard
          title="Competitions"
          value={stats.totalCompetitions.toLocaleString()}
          icon={Trophy}
          color="text-gold"
        />
        <StatCard
          title="Questions"
          value={stats.totalQuestions.toLocaleString()}
          icon={FileQuestion}
          color="text-success"
        />
        <StatCard
          title="Active Competitions"
          value={stats.activeCompetitions.toLocaleString()}
          icon={Clock}
          color="text-warning"
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovals.toLocaleString()}
          icon={AlertTriangle}
          color="text-destructive"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-4">No recent activity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-4">All systems operational</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Leaderboard Tab Component
function TeacherLeaderboardTab() {
  const [selectedCompetition, setSelectedCompetition] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const { toast } = useToast();
  const { profile, currentView, isAdminOrModerator } = useAuth();
  const [loading, setLoading] = useState(false);
  const [competitions, setCompetitions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [schoolLeaderboardData, setSchoolLeaderboardData] = useState([]);
  const [activeTab, setActiveTab] = useState('student'); // 'student' or 'school'

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

  const fetchSchoolLeaderboard = async () => {
    setLoading(true);
    try {
      // Fetch schools and calculate total points
      const { data: schools, error: schoolsError } = await supabase.from('schools').select('*');
      if (schoolsError) throw schoolsError;

      // Fetch all students
      const { data: students, error: studentsError } = await supabase.from('profiles').select('*').eq('role', 'student');
      if (studentsError) throw studentsError;

      // Calculate total points per school
      const schoolScores = schools.map(school => {
        const schoolStudents = students.filter(student => student.school_id === school.id);
        const totalPoints = schoolStudents.reduce((sum, student) => sum + (student.score || 0), 0);
        return {
          ...school,
          totalPoints,
          studentCount: schoolStudents.length
        };
      });

      // Sort by total points
      schoolScores.sort((a, b) => b.totalPoints - a.totalPoints);

      setSchoolLeaderboardData(schoolScores);
    } catch (error) {
      toast({ title: 'Error fetching school leaderboard', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCompetitions();
    fetchClasses();
    fetchLeaderboard();
    fetchSchoolLeaderboard();
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

      {/* Tabs for Student/School Leaderboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 max-w-[400px]">
          <TabsTrigger value="student">Student Leaderboard</TabsTrigger>
          <TabsTrigger value="school">School Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="student">
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
                        <th className="p-3 text-left font-medium">Email</th>
                        <th className="p-3 text-left font-medium">Username</th>
                        <th className="p-3 text-left font-medium">Points</th>
                        <th className="p-3 text-left font-medium">Achievement</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboardData.map((student, index) => (
                        <tr key={student.id} className="border-b border-border/50 last:border-none hover:bg-muted/50 transition-colors">
                          <td className="p-3 font-medium">{index + 1}</td>
                          <td className="p-3 text-muted-foreground">{student.email}</td>
                          <td className="p-3">{student.display_name || 'No username'}</td>
                          <td className="p-3 font-bold">{student.score?.toLocaleString() || '0'}</td>
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
        </TabsContent>

        <TabsContent value="school">
          <Card>
            <CardHeader>
              <CardTitle>School Performance</CardTitle>
              <CardDescription>Combined scores of all students per school</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="text-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </div>
                ) : schoolLeaderboardData.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No school leaderboard data available</p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="p-3 text-left font-medium">Rank</th>
                        <th className="p-3 text-left font-medium">School Name</th>
                        <th className="p-3 text-left font-medium">Country</th>
                        <th className="p-3 text-left font-medium">Total Points</th>
                        <th className="p-3 text-left font-medium">Students</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schoolLeaderboardData.map((school, index) => (
                        <tr key={school.id} className="border-b border-border/50 last:border-none hover:bg-muted/50 transition-colors">
                          <td className="p-3 font-medium">{index + 1}</td>
                          <td className="p-3 font-medium">{school.name}</td>
                          <td className="p-3 text-muted-foreground">{school.country || 'N/A'}</td>
                          <td className="p-3 font-bold">{school.totalPoints?.toLocaleString() || '0'}</td>
                          <td className="p-3 text-muted-foreground">{school.studentCount || '0'} students</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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

// Competitions Tab Component
function TeacherCompetitionsTab() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const { toast } = useToast();
  const { profile, currentView, isAdminOrModerator } = useAuth();

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

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const activeCompetitions = competitions.filter(comp => comp.is_active);
  const pastCompetitions = competitions.filter(comp => !comp.is_active);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Competitions</h1>
        <p className="text-muted-foreground">Manage class competitions</p>
        {isAdminOrModerator && currentView && (
          <div className="mt-2 flex items-center gap-2 text-sm text-primary">
            <Unlock className="w-4 h-4" />
            <span>Admin/Moderator View - Can see all competitions</span>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 max-w-[400px]">
          <TabsTrigger value="active">Active Competitions</TabsTrigger>
          <TabsTrigger value="past">Past Competitions</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Competitions</CardTitle>
              <CardDescription>Currently running competitions</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </div>
              ) : activeCompetitions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No active competitions</p>
              ) : (
                <div className="space-y-4">
                  {activeCompetitions.map(comp => (
                    <div key={comp.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{comp.name}</h3>
                          <p className="text-sm text-muted-foreground">{comp.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {comp.current_participants || 0}/{comp.max_participants || '∞'} participants
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(comp.start_date).toLocaleDateString()} - {new Date(comp.end_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="destructive" size="sm">Delete</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past">
          <Card>
            <CardHeader>
              <CardTitle>Past Competitions</CardTitle>
              <CardDescription>Completed competitions</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </div>
              ) : pastCompetitions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No past competitions</p>
              ) : (
                <div className="space-y-4">
                  {pastCompetitions.map(comp => (
                    <div key={comp.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{comp.name}</h3>
                          <p className="text-sm text-muted-foreground">{comp.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {comp.current_participants || 0}/{comp.max_participants || '∞'} participants
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(comp.start_date).toLocaleDateString()} - {new Date(comp.end_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">View Results</Button>
                          <Button variant="destructive" size="sm">Delete</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Questions Tab Component
function TeacherQuestionsTab() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();
  const { profile, currentView, isAdminOrModerator } = useAuth();

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

  useEffect(() => {
    fetchQuestions();
  }, []);

  const approvedQuestions = questions.filter(q => q.status === 'approved');
  const pendingQuestions = questions.filter(q => q.status === 'pending');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Questions</h1>
        <p className="text-muted-foreground">Manage question database</p>
        {isAdminOrModerator && currentView && (
          <div className="mt-2 flex items-center gap-2 text-sm text-primary">
            <Unlock className="w-4 h-4" />
            <span>Admin/Moderator View - Can see all questions</span>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 max-w-[400px]">
          <TabsTrigger value="all">All Questions</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Questions</CardTitle>
              <CardDescription>All questions in the database</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </div>
              ) : questions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No questions found</p>
              ) : (
                <div className="space-y-4">
                  {questions.map(question => (
                    <div key={question.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-medium">{question.text}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{question.category}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <span className="flex items-center gap-1">
                              <CheckSquare className="w-3 h-3" />
                              {question.difficulty}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              {question.points || 1} points
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="destructive" size="sm">Delete</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Approved Questions</CardTitle>
              <CardDescription>Questions ready for use</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </div>
              ) : approvedQuestions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No approved questions</p>
              ) : (
                <div className="space-y-4">
                  {approvedQuestions.map(question => (
                    <div key={question.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-medium">{question.text}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{question.category}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <span className="flex items-center gap-1">
                              <CheckSquare className="w-3 h-3" />
                              {question.difficulty}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              {question.points || 1} points
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="destructive" size="sm">Delete</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Questions</CardTitle>
              <CardDescription>Questions awaiting approval</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </div>
              ) : pendingQuestions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No pending questions</p>
              ) : (
                <div className="space-y-4">
                  {pendingQuestions.map(question => (
                    <div key={question.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-medium">{question.text}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{question.category}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <span className="flex items-center gap-1">
                              <CheckSquare className="w-3 h-3" />
                              {question.difficulty}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              {question.points || 1} points
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="gradient-success">Approve</Button>
                          <Button variant="destructive" size="sm">Reject</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
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

  const handleMarkAsRead = async (messageId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('messages').update({
        read: true,
        read_at: new Date().toISOString()
      }).eq('id', messageId);

      if (error) throw error;

      // Update local state
      setMessages(messages.map(msg =>
        msg.id === messageId ? { ...msg, read: true } : msg
      ));

      toast({ title: 'Message marked as read' });
    } catch (error) {
      toast({ title: 'Error marking message as read', description: error.message, variant: 'destructive' });
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
                        onClick={() => {
                          setSelectedMessage(message);
                          if (!message.read) {
                            handleMarkAsRead(message.id);
                          }
                        }}
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
                          {/* Only show delete button for admins/moderators */}
                          {(isAdminOrModerator || profile?.role === 'teacher') && (
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

                  {/* Only show reply for admins/moderators/teachers, not students */}
                  {(isAdminOrModerator || profile?.role === 'teacher') && (
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

// Settings Tab Component
function TeacherSettingsTab() {
  const [settings, setSettings] = useState({
    platformName: 'Lumora',
    maintenanceMode: false,
    registrationOpen: true,
    maxStudentsPerCompetition: 100,
    questionApprovalRequired: true
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Save settings to database
      const { error } = await supabase.from('settings').upsert(settings);
      if (error) throw error;

      toast({ title: 'Settings saved successfully!' });
    } catch (error) {
      toast({ title: 'Error saving settings', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Platform Settings</h1>
        <p className="text-muted-foreground">Configure global platform settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Basic platform configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Platform Name</Label>
            <Input
              value={settings.platformName}
              onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="maintenance-mode"
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
            />
            <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="registration-open"
              checked={settings.registrationOpen}
              onCheckedChange={(checked) => setSettings({ ...settings, registrationOpen: checked })}
            />
            <Label htmlFor="registration-open">Allow New Registrations</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Competition Settings</CardTitle>
          <CardDescription>Competition rules and limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Max Students per Competition</Label>
            <Input
              type="number"
              value={settings.maxStudentsPerCompetition}
              onChange={(e) => setSettings({ ...settings, maxStudentsPerCompetition: parseInt(e.target.value) || 0 })}
              min="10"
              max="1000"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content Settings</CardTitle>
          <CardDescription>Question and content moderation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              id="question-approval"
              checked={settings.questionApprovalRequired}
              onCheckedChange={(checked) => setSettings({ ...settings, questionApprovalRequired: checked })}
            />
            <Label htmlFor="question-approval">Require Question Approval</Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={loading} className="gradient-hero">
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Settings
        </Button>
      </div>
    </div>
  );
}