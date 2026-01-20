import { useState, useEffect } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  BookOpen,
  Award,
  Swords,
  Mail,
  User,
  Lock,
  Calendar,
  ChevronRight,
  Crown,
  Medal,
  Star,
  RefreshCw,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

function StudentSidebar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const { profile } = useAuth();
  const navItems = [
    { id: 'home', icon: Trophy, label: 'Home' },
    { id: 'competitions', icon: Calendar, label: 'Competitions' },
    { id: 'practice', icon: BookOpen, label: 'Practice' },
    { id: 'leaderboard', icon: Medal, label: 'Leaderboard' },
    { id: 'challenges', icon: Swords, label: '1v1 Challenges' },
    { id: 'badges', icon: Award, label: 'My Badges' },
    { id: 'inbox', icon: Mail, label: 'Inbox' },
    { id: 'profile', icon: User, label: 'Profile' },
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
            <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-bold">
              {profile?.email?.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{profile?.display_name || 'Student'}</p>
              <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={() => setActiveTab('profile')}>
            <User className="w-3 h-3 mr-2" />
            View Profile
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <DashboardLayout
      title="Student Dashboard"
      sidebar={<StudentSidebar activeTab={activeTab} setActiveTab={setActiveTab} />}
    >
      {activeTab === 'home' && <StudentHome />}
      {activeTab === 'competitions' && <CompetitionsView />}
      {activeTab === 'practice' && <PracticeView />}
      {activeTab === 'leaderboard' && <LeaderboardView />}
      {activeTab === 'challenges' && <ChallengesView />}
      {activeTab === 'badges' && <BadgesView />}
      {activeTab === 'inbox' && <InboxView />}
      {activeTab === 'profile' && <ProfileView />}
    </DashboardLayout>
  );
}

function StudentHome() {
  const { profile, user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['student-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: answers } = await supabase
        .from('student_answers')
        .select('is_correct, points_earned')
        .eq('user_id', user.id);

      const { data: badges } = await supabase
        .from('user_badges')
        .select('id')
        .eq('user_id', user.id);

      const totalAnswers = answers?.length || 0;
      const correctAnswers = answers?.filter(a => a.is_correct).length || 0;
      const points = answers?.reduce((sum, a) => sum + (a.points_earned || 0), 0) || 0;

      return {
        totalAnswers,
        correctAnswers,
        points,
        badges: badges?.length || 0,
      };
    },
    enabled: !!user?.id,
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="gradient-hero text-primary-foreground overflow-hidden relative">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary-foreground/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <CardContent className="py-8 relative z-10">
          <h1 className="text-3xl font-display font-bold mb-2">
            Welcome back, {profile?.display_name || 'Student'}! 👋
          </h1>
          <p className="opacity-90 text-lg">Ready to learn and compete today?</p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-card transition-shadow">
          <CardContent className="pt-6 text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-gold" />
            <p className="text-3xl font-display font-bold">{stats?.points || 0}</p>
            <p className="text-sm text-muted-foreground">Total Points</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-card transition-shadow">
          <CardContent className="pt-6 text-center">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-accent" />
            <p className="text-3xl font-display font-bold">{stats?.totalAnswers || 0}</p>
            <p className="text-sm text-muted-foreground">Questions Answered</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-card transition-shadow">
          <CardContent className="pt-6 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-success" />
            <p className="text-3xl font-display font-bold">{stats?.correctAnswers || 0}</p>
            <p className="text-sm text-muted-foreground">Correct Answers</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-card transition-shadow">
          <CardContent className="pt-6 text-center">
            <Award className="w-8 h-8 mx-auto mb-2 text-warning" />
            <p className="text-3xl font-display font-bold">{stats?.badges || 0}</p>
            <p className="text-sm text-muted-foreground">Badges Earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="hover:shadow-card-hover transition-all cursor-pointer group">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-gold/10">
                  <Trophy className="w-8 h-8 text-gold" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold">Competitions</h3>
                  <p className="text-muted-foreground">Join active competitions</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-card-hover transition-all cursor-pointer group">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-accent/10">
                  <BookOpen className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold">Practice</h3>
                  <p className="text-muted-foreground">Sharpen your skills</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PracticeView() {
  const { data: practiceCompetitions } = useQuery({
    queryKey: ['practice-competitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .eq('is_practice', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold">Practice Mode</h2>
        <p className="text-muted-foreground mt-1">Sharpen your skills with unranked practice competitions</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {practiceCompetitions?.map((comp) => (
          <Card key={comp.id} className="hover:shadow-card-hover transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {comp.name}
                    <span className="text-xs font-normal px-2 py-1 rounded-full bg-accent/20 text-accent">
                      Practice
                    </span>
                  </CardTitle>
                  {comp.description && (
                    <CardDescription className="mt-2">{comp.description}</CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full gradient-hero">
                <BookOpen className="w-4 h-4 mr-2" />
                Start Practice
              </Button>
            </CardContent>
          </Card>
        ))}

        {(!practiceCompetitions || practiceCompetitions.length === 0) && (
          <Card className="md:col-span-2">
            <CardContent className="py-12 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No practice competitions available yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function CompetitionsView() {
  const { data: competitions } = useQuery({
    queryKey: ['student-competitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .eq('is_practice', false)
        .order('start_date', { ascending: true }); // Order by nearest start date
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold">Competitions</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {competitions?.map((comp) => (
          <CompetitionCard key={comp.id} comp={comp} />
        ))}

        {(!competitions || competitions.length === 0) && (
          <Card className="md:col-span-2">
            <CardContent className="py-12 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No competitions available yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function CompetitionCard({ comp }: { comp: any }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [status, setStatus] = useState<'upcoming' | 'active' | 'ended'>('upcoming');

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();

      // Use open_time and close_time if available, otherwise treat as always active
      if (!comp.open_time && !comp.close_time) {
        setStatus('active');
        return 0;
      }

      const start = comp.open_time ? new Date(comp.open_time).getTime() : 0;
      const end = comp.close_time ? new Date(comp.close_time).getTime() : Infinity;

      if (comp.open_time && now < start) {
        setStatus('upcoming');
        return start - now;
      } else if (comp.close_time && now >= end) {
        setStatus('ended');
        return 0;
      } else {
        setStatus('active');
        if (comp.close_time) {
          return end - now;
        }
        return 0;
      }
    };

    const formatTime = (ms: number) => {
      const days = Math.floor(ms / (1000 * 60 * 60 * 24));
      const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((ms % (1000 * 60)) / 1000);
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    };

    const timer = setInterval(() => {
      const diff = calculateTime();
      if (diff > 0) {
        setTimeLeft(formatTime(diff));
      } else {
        setTimeLeft('');
      }
    }, 1000);

    // Initial call
    const diff = calculateTime();
    if (diff > 0) setTimeLeft(formatTime(diff));

    return () => clearInterval(timer);
  }, [comp.open_time, comp.close_time]);

  const isLocked = status === 'upcoming';
  const isEnded = status === 'ended';

  return (
    <Card className={`relative overflow-hidden ${isLocked || isEnded ? 'opacity-90' : 'hover:shadow-card-hover'} transition-all`}>
      {/* Status Overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center z-10">
          <div className="text-center p-4 bg-background/80 rounded-xl shadow-lg border border-border/50">
            <Lock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="font-bold text-lg mb-1">Coming Soon</p>
            <p className="text-sm font-mono text-primary animate-pulse">{timeLeft}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Opens {new Date(comp.start_date).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}

      {isEnded && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center z-10">
          <div className="text-center p-4 bg-background/80 rounded-xl shadow-lg">
            <p className="font-bold text-lg text-muted-foreground">Competition Ended</p>
          </div>
        </div>
      )}

      {/* Active Banner */}
      {status === 'active' && (
        <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 flex items-center justify-between px-4">
          <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Now
          </span>
          <span className="text-xs font-mono font-medium text-emerald-600">{timeLeft} remaining</span>
        </div>
      )}
      {!status && <div className="absolute top-0 left-0 right-0 h-1 gradient-gold" />}

      <CardHeader className={status === 'active' ? 'pt-12' : ''}>
        <div className="flex items-center gap-2">
          <Trophy className={`w-5 h-5 ${status === 'active' ? 'text-emerald-500' : 'text-gold'}`} />
          <CardTitle>{comp.name}</CardTitle>
        </div>
        <CardDescription>{comp.description || 'Competition'}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button className={`w-full ${status === 'active' ? 'gradient-success' : 'gradient-hero'}`} disabled={isLocked || isEnded}>
          {status === 'active' ? 'Enter Competition' : isEnded ? 'Ended' : 'Wait for Start'}
        </Button>
      </CardContent>
    </Card>
  );
}


function LeaderboardView() {
  const { user } = useAuth();
  const [leaderboardTab, setLeaderboardTab] = useState<'students' | 'schools'>('students');

  const { data: studentLeaderboard, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['student-leaderboard'],
    queryFn: async () => {
      // First get profiles and their school names
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          school_memberships (
            school_id,
            schools (name)
          )
        `)
        .eq('role', 'student');

      if (profileError) throw profileError;

      const studentsWithPoints = await Promise.all(
        (profiles || []).map(async (profile: any) => {
          const { data: answers } = await supabase
            .from('student_answers')
            .select('is_correct, points_earned')
            .eq('user_id', profile.user_id);

          const correctAnswers = answers?.filter(a => a.is_correct).length || 0;
          const points = answers?.reduce((sum, a) => sum + (a.points_earned || 0), 0) || 0;
          const schoolName = profile.school_memberships?.[0]?.schools?.name || 'Grand Scholar';

          return { ...profile, correctAnswers, points, schoolName };
        })
      );

      return studentsWithPoints.sort((a, b) => b.correctAnswers - a.correctAnswers);
    },
  });

  const { data: schoolLeaderboard, isLoading: isLoadingSchools } = useQuery({
    queryKey: ['school-leaderboard'],
    queryFn: async () => {
      const { data: schools, error: schoolError } = await (supabase as any)
        .from('schools')
        .select(`
          id,
          name,
          school_memberships (
            user_id,
            profiles (
              role,
              student_answers (
                is_correct,
                points_earned
              )
            )
          )
        `);

      if (schoolError) throw schoolError;

      const results = (schools || []).map((school: any) => {
        let totalPoints = 0;
        let totalCorrect = 0;
        let studentsCount = 0;

        school.school_memberships?.forEach((membership: any) => {
          if (membership.profiles?.role === 'student') {
            studentsCount++;
            membership.profiles.student_answers?.forEach((answer: any) => {
              if (answer.is_correct) totalCorrect++;
              totalPoints += (answer.points_earned || 0);
            });
          }
        });

        return {
          id: school.id,
          name: school.name,
          points: totalPoints,
          correctAnswers: totalCorrect,
          studentsCount
        };
      });

      return results.sort((a, b) => b.points - a.points);
    },
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-gold" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-silver" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-bronze" />;
    return <span className="w-6 h-6 flex items-center justify-center font-bold">{rank}</span>;
  };

  const myRank = studentLeaderboard?.findIndex(s => s.user_id === user?.id) ?? -1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-display font-bold">Leaderboards</h2>
        <div className="flex bg-muted p-1 rounded-xl">
          <Button
            variant={leaderboardTab === 'students' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setLeaderboardTab('students')}
            className="rounded-lg"
          >
            Students
          </Button>
          <Button
            variant={leaderboardTab === 'schools' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setLeaderboardTab('schools')}
            className="rounded-lg"
          >
            Schools
          </Button>
        </div>
      </div>

      {leaderboardTab === 'students' ? (
        <>
          {/* Top 3 Podium */}
          {studentLeaderboard && studentLeaderboard.length >= 1 && (
            <div className="flex justify-center items-end gap-2 md:gap-4 mb-8 pt-4">
              {/* 2nd Place */}
              {studentLeaderboard[1] && (
                <div className="text-center w-24 md:w-32">
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full gradient-card border-4 border-slate-300 flex items-center justify-center text-xl md:text-2xl font-bold mb-2">
                    {studentLeaderboard[1].email.substring(0, 2).toUpperCase()}
                  </div>
                  <p className="font-semibold truncate">{studentLeaderboard[1].display_name || 'Student'}</p>
                  <p className="text-slate-400 text-xs truncate">{studentLeaderboard[1].schoolName}</p>
                  <p className="text-slate-500 font-bold">{studentLeaderboard[1].correctAnswers} ✓</p>
                  <div className="h-16 md:h-20 gradient-card rounded-t-xl mt-2 flex items-center justify-center">
                    <span className="text-2xl font-bold text-slate-300">2</span>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              <div className="text-center w-28 md:w-36">
                <Crown className="w-8 h-8 text-gold mx-auto mb-1 animate-bounce" />
                <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full gradient-gold flex items-center justify-center text-2xl md:text-3xl font-bold mb-2 shadow-glow">
                  {studentLeaderboard[0].email.substring(0, 2).toUpperCase()}
                </div>
                <p className="font-bold truncate">{studentLeaderboard[0].display_name || 'Student'}</p>
                <p className="text-gold text-xs truncate">{studentLeaderboard[0].schoolName}</p>
                <p className="text-gold font-bold">{studentLeaderboard[0].correctAnswers} ✓</p>
                <div className="h-24 md:h-32 gradient-gold rounded-t-xl mt-2 flex items-center justify-center shadow-glow">
                  <span className="text-3xl font-bold">1</span>
                </div>
              </div>

              {/* 3rd Place */}
              {studentLeaderboard[2] && (
                <div className="text-center w-24 md:w-32">
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full gradient-card border-4 border-amber-700 flex items-center justify-center text-xl md:text-2xl font-bold mb-2">
                    {studentLeaderboard[2].email.substring(0, 2).toUpperCase()}
                  </div>
                  <p className="font-semibold truncate">{studentLeaderboard[2].display_name || 'Student'}</p>
                  <p className="text-amber-800 text-xs truncate">{studentLeaderboard[2].schoolName}</p>
                  <p className="text-amber-800 font-bold">{studentLeaderboard[2].correctAnswers} ✓</p>
                  <div className="h-12 md:h-16 gradient-card rounded-t-xl mt-2 flex items-center justify-center">
                    <span className="text-2xl font-bold text-amber-700">3</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* My Position */}
          {myRank >= 0 && (
            <Card className="border-2 border-primary shadow-glow">
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-primary">#{myRank + 1}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-lg">Your Global Standing</p>
                    <p className="text-sm text-muted-foreground">
                      {studentLeaderboard?.[myRank]?.correctAnswers || 0} correct answers
                      • {studentLeaderboard?.[myRank]?.schoolName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gradient">{studentLeaderboard?.[myRank]?.points || 0}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Total Points</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Full List */}
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {studentLeaderboard?.slice(3).map((student, index) => (
                  <div
                    key={student.id}
                    className={`flex items-center gap-4 p-4 transition-colors ${student.user_id === user?.id ? 'bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                  >
                    <div className="w-8 text-center font-bold text-muted-foreground">{index + 4}</div>
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground font-semibold border-2 border-border/50">
                      {student.email.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{student.display_name || student.email}</p>
                      <p className="text-xs text-muted-foreground truncate">{student.schoolName}</p>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div className="hidden sm:block">
                        <p className="text-sm font-bold">{student.correctAnswers} ✓</p>
                        <p className="text-[10px] text-muted-foreground">Correct</p>
                      </div>
                      <div>
                        <p className="font-bold text-primary">{student.points}</p>
                        <p className="text-[10px] text-muted-foreground">Points</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="grid gap-4">
          {schoolLeaderboard?.map((school, index) => (
            <Card key={school.id} className={index < 3 ? 'border-primary/50 shadow-sm' : ''}>
              <CardContent className="py-6">
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl ${index === 0 ? 'bg-gold text-gold-foreground shadow-glow' :
                      index === 1 ? 'bg-slate-200 text-slate-700' :
                        index === 2 ? 'bg-amber-100 text-amber-800' :
                          'bg-muted text-muted-foreground'
                    }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display font-bold">{school.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" /> {school.studentsCount} Students
                      </span>
                      <span className="flex items-center gap-1">
                        <Trophy className="w-4 h-4" /> {school.correctAnswers} Correct
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{school.points}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Aggregated Pts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ChallengesView() {
  const { user } = useAuth();

  const { data: challenges } = useQuery({
    queryKey: ['my-challenges', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold">1v1 Challenges</h2>
        <Button className="gradient-hero">
          <Swords className="w-4 h-4 mr-2" />
          Challenge a Friend
        </Button>
      </div>

      <div className="grid gap-4">
        {challenges?.map((challenge) => (
          <Card key={challenge.id} className="hover:shadow-card transition-shadow">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Swords className="w-6 h-6 text-warning" />
                  <div>
                    <p className="font-semibold">Challenge</p>
                    <p className="text-sm text-muted-foreground capitalize">{challenge.status}</p>
                  </div>
                </div>
                {challenge.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Decline</Button>
                    <Button size="sm" className="gradient-success text-success-foreground">Accept</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {(!challenges || challenges.length === 0) && (
          <Card>
            <CardContent className="py-12 text-center">
              <Swords className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No challenges yet. Challenge a friend!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function BadgesView() {
  const { user } = useAuth();

  const { data: allBadges } = useQuery({
    queryKey: ['all-badges'],
    queryFn: async () => {
      const { data, error } = await supabase.from('badges').select('*');
      if (error) throw error;
      return data;
    },
  });

  const { data: earnedBadges } = useQuery({
    queryKey: ['earned-badges', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', user.id);
      if (error) throw error;
      return data.map(b => b.badge_id);
    },
    enabled: !!user?.id,
  });

  const earnedSet = new Set(earnedBadges || []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold">My Badges</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {allBadges?.map((badge) => {
          const isEarned = earnedSet.has(badge.id);
          return (
            <Card key={badge.id} className={`text-center ${!isEarned && 'opacity-50'}`}>
              <CardContent className="pt-6">
                <div className={`w-16 h-16 mx-auto rounded-2xl ${isEarned ? 'gradient-gold' : 'bg-muted'} flex items-center justify-center mb-4`}>
                  <Award className={`w-8 h-8 ${isEarned ? 'text-warning-foreground' : 'text-muted-foreground'}`} />
                </div>
                <h3 className="font-semibold">{badge.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                {isEarned ? (
                  <span className="inline-block mt-3 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
                    Earned!
                  </span>
                ) : (
                  <span className="inline-block mt-3 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                    Locked
                  </span>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function InboxView() {
  const { user } = useAuth();

  const { data: messages } = useQuery({
    queryKey: ['inbox', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold">Inbox</h2>

      <div className="space-y-4">
        {messages?.map((message) => (
          <Card key={message.id} className={`hover:shadow-card transition-shadow ${!message.read_at && 'border-l-4 border-l-primary'}`}>
            <CardContent className="py-4">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-semibold">{message.subject || 'System Message'}</h3>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1">{message.content}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!messages || messages.length === 0) && (
          <Card>
            <CardContent className="py-12 text-center">
              <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Your inbox is empty.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function ProfileView() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(profile?.avatar_id || null);

  const { data: avatars } = useQuery({
    queryKey: ['avatars'],
    queryFn: async () => {
      const { data, error } = await supabase.from('avatars').select('*');
      if (error) throw error;
      return data;
    },
  });

  const updateProfile = useMutation({
    mutationFn: async () => {
      const updates: any = {
        id: profile?.id,
        display_name: displayName,
        avatar_id: selectedAvatar,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Profile updated' });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const generateUsername = useMutation({
    mutationFn: async () => {
      const adjectives = ['Swift', 'Blue', 'Happy', 'Clever', 'Brave'];
      const nouns = ['Fox', 'Eagle', 'Panda', 'Tiger', 'Star'];
      let username = '';
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 10) {
        username = `${adjectives[Math.floor(Math.random() * adjectives.length)]}-${nouns[Math.floor(Math.random() * nouns.length)]}${Math.floor(Math.random() * 1000)}`;
        const { data } = await supabase.from('profiles').select('id').eq('display_name', username).single();
        if (!data) isUnique = true;
        attempts++;
      }
      return username;
    },
    onSuccess: (username) => setDisplayName(username),
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold">My Profile</h2>
        <Button onClick={() => updateProfile.mutate()} disabled={updateProfile.isPending}>
          {updateProfile.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="py-8">
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 mb-4">
                  {selectedAvatar ? (
                    <img
                      src={avatars?.find(a => a.id === selectedAvatar)?.image_url}
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover border-4 border-primary/20"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full gradient-hero flex items-center justify-center text-primary-foreground text-4xl font-bold">
                      {profile?.email?.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-semibold">{displayName || 'Student'}</h3>
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
              <CardDescription>Personal identification and login information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <div className="flex gap-2">
                  <Input value={displayName} disabled className="bg-muted" />
                  <Button variant="outline" onClick={() => generateUsername.mutate()} disabled={generateUsername.isPending}>
                    {generateUsername.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} value="demo1234" disabled className="bg-muted pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Choose Avatar</CardTitle>
              <CardDescription>Select a profile picture uploaded by the moderator</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {avatars?.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => setSelectedAvatar(avatar.id)}
                    className={`relative aspect-square rounded-xl overflow-hidden transition-all ${selectedAvatar === avatar.id ? 'ring-4 ring-primary' : 'hover:scale-105'}`}
                  >
                    <img src={avatar.image_url} alt={avatar.name} className="w-full h-full object-cover" />
                  </button>
                ))}
                {!avatars?.length && <p className="col-span-full text-center py-6 text-muted-foreground text-sm italic">No avatars available yet</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
