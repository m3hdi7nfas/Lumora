import { useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  User
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button'; // Added Button import

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

  return (
    <DashboardLayout
      title="Teacher Dashboard"
      sidebar={<TeacherSidebar activeTab={activeTab} setActiveTab={setActiveTab} />}
    >
      {activeTab === 'overview' && <TeacherOverview />}
      {activeTab === 'students' && <StudentsTab />}
      {activeTab === 'leaderboard' && <LeaderboardTab />}
      {activeTab === 'messages' && <MessagesTab />}
      {activeTab === 'profile' && <ProfileView />}
    </DashboardLayout>
  );
}

function TeacherOverview() {
  const { data: stats } = useQuery({
    queryKey: ['teacher-stats'],
    queryFn: async () => {
      const [answers, profiles] = await Promise.all([
        supabase.from('student_answers').select('is_correct, points_earned'),
        supabase.from('profiles').select('id').eq('role', 'student'),
      ]);

      const totalAnswers = answers.data?.length || 0;
      const correctAnswers = answers.data?.filter(a => a.is_correct).length || 0;
      const totalPoints = answers.data?.reduce((sum, a) => sum + (a.points_earned || 0), 0) || 0;

      return {
        students: profiles.data?.length || 0,
        totalAnswers,
        correctAnswers,
        accuracy: totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0,
        totalPoints,
      };
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold">Student Performance Overview</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border/50 shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-display font-bold">{stats?.students || 0}</p>
                <p className="text-muted-foreground">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-accent/10">
                <BarChart3 className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-3xl font-display font-bold">{stats?.totalAnswers || 0}</p>
                <p className="text-muted-foreground">Questions Answered</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-success/10">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-3xl font-display font-bold">{stats?.accuracy || 0}%</p>
                <p className="text-muted-foreground">Average Accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gold/10">
                <Trophy className="w-6 h-6 text-gold" />
              </div>
              <div>
                <p className="text-3xl font-display font-bold">{stats?.totalPoints || 0}</p>
                <p className="text-muted-foreground">Total Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Student Activity</CardTitle>
          <CardDescription>Latest answers from your students</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Activity will appear here when students start answering questions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function StudentsTab() {
  const [search, setSearch] = useState('');

  const { data: students } = useQuery({
    queryKey: ['students-progress'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student');

      if (error) throw error;

      // Get answers for each student
      const studentsWithStats = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: answers } = await supabase
            .from('student_answers')
            .select('is_correct, points_earned')
            .eq('user_id', profile.user_id);

          const totalAnswers = answers?.length || 0;
          const correctAnswers = answers?.filter(a => a.is_correct).length || 0;
          const points = answers?.reduce((sum, a) => sum + (a.points_earned || 0), 0) || 0;

          return {
            ...profile,
            totalAnswers,
            correctAnswers,
            accuracy: totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0,
            points,
          };
        })
      );

      return studentsWithStats;
    },
  });

  const filteredStudents = students?.filter(s =>
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.display_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold">Student Progress</h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredStudents?.map((student) => (
          <Card key={student.id} className="hover:shadow-card transition-shadow">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-bold">
                    {student.email.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold">{student.display_name || student.email}</h3>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{student.totalAnswers}</p>
                    <p className="text-xs text-muted-foreground">Answered</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-2xl font-bold text-success">{student.correctAnswers}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Correct</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{student.accuracy}%</p>
                    <p className="text-xs text-muted-foreground">Accuracy</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gold">{student.points}</p>
                    <p className="text-xs text-muted-foreground">Points</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function LeaderboardTab() {
  const { data: leaderboard } = useQuery({
    queryKey: ['teacher-leaderboard'],
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student');

      const studentsWithPoints = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: answers } = await supabase
            .from('student_answers')
            .select('is_correct, points_earned')
            .eq('user_id', profile.user_id);

          const correctAnswers = answers?.filter(a => a.is_correct).length || 0;
          const points = answers?.reduce((sum, a) => sum + (a.points_earned || 0), 0) || 0;

          return { ...profile, correctAnswers, points };
        })
      );

      return studentsWithPoints.sort((a, b) => b.correctAnswers - a.correctAnswers);
    },
  });

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-gold/10 border-gold text-gold';
    if (rank === 2) return 'bg-silver/10 border-silver text-silver';
    if (rank === 3) return 'bg-bronze/10 border-bronze text-bronze';
    return 'bg-muted border-border';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold">Student Leaderboard</h2>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {leaderboard?.map((student, index) => (
              <div
                key={student.id}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 ${getRankStyle(index + 1)}`}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{student.display_name || student.email}</h3>
                  <p className="text-sm opacity-70">{student.correctAnswers} correct answers</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{student.points}</p>
                  <p className="text-xs opacity-70">points</p>
                </div>
              </div>
            ))}

            {(!leaderboard || leaderboard.length === 0) && (
              <p className="text-center text-muted-foreground py-8">
                No students have answered questions yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MessagesTab() {
  const { profile } = useAuth();

  const { data: messages, isLoading } = useQuery({
    queryKey: ['teacher-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(display_name, email, role)
        `)
        .eq('receiver_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold">Inbox</h2>

      {isLoading ? (
        <p className="text-center text-muted-foreground py-8">Loading messages...</p>
      ) : messages?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No messages in your inbox.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages?.map((msg: any) => (
            <Card key={msg.id} className={`${!msg.read_at ? 'border-primary/50 bg-primary/5' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{msg.subject}</CardTitle>
                    <CardDescription>
                      From: <span className="font-medium text-foreground">{msg.sender?.display_name || msg.sender?.email}</span> ({msg.sender?.role})
                    </CardDescription>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(msg.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
function ProfileView() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [showPassword, setShowPassword] = useState(false);

  const updateProfile = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
        })
        .eq('id', profile?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({ title: 'Profile updated!', description: 'Your changes have been saved.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating profile', description: error.message, variant: 'destructive' });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold">Teacher Profile</h2>
        <Button onClick={() => updateProfile.mutate()} disabled={updateProfile.isPending}>
          {updateProfile.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="overflow-hidden">
            <div className="h-24 gradient-hero" />
            <CardContent className="pt-0 -mt-12">
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 mb-4">
                  <div className="w-full h-full rounded-full gradient-hero flex items-center justify-center text-primary-foreground text-4xl font-bold border-4 border-background">
                    {profile?.display_name?.substring(0, 2).toUpperCase() || profile?.email?.substring(0, 2).toUpperCase()}
                  </div>
                </div>
                <h3 className="text-xl font-semibold">{displayName || 'Teacher'}</h3>
                <p className="text-muted-foreground">{profile?.email}</p>
                <span className="mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm capitalize font-medium">
                  {profile?.role}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>Your personal teacher information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value="••••••••"
                    disabled
                    className="bg-muted pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Password can only be changed by administrators</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
