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
    ChevronUp,
    Check,
    CheckCircle2,
    AlertCircle,
    Zap,
    LogOut,
    Presentation
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
import { supabase } from '@/lib/supabase';

function StudentSidebar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
    const { profile } = useAuth();
    const navItems = [
        { id: 'overview', icon: Users, label: 'Overview' },
        { id: 'competitions', icon: Trophy, label: 'Competitions' },
        { id: 'practice', icon: LayoutTemplate, label: 'Practice' },
        { id: 'leaderboard', icon: CheckSquare, label: 'Leaderboard' },
        { id: 'messages', icon: MessageSquare, label: 'Messages' },
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
                                profile?.display_name?.substring(0, 2).toUpperCase() || 'ST'
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{profile?.display_name || 'Student'}</p>
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

export default function StudentDashboard() {
    const [selectedCompetitionId, setSelectedCompetitionId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(false);
    const [activeDuel, setActiveDuel] = useState<any>(null);
    const [incomingDuel, setIncomingDuel] = useState<any>(null);
    const { toast } = useToast();
    const { profile } = useAuth();

    const handleNavigate = (tab: string, competitionId?: string) => {
        if (competitionId) {
            setSelectedCompetitionId(competitionId);
        } else {
            setSelectedCompetitionId(null);
        }
        setActiveTab(tab);
    };

    useEffect(() => {
        if (!profile?.id) return;

        // Fetch any existing in_progress duel for this user
        const fetchCurrentDuel = async () => {
            const { data } = await supabase
                .from('duels')
                .select('*')
                .or(`challenger_id.eq.${profile.id},challenged_id.eq.${profile.id}`)
                .eq('status', 'in_progress')
                .limit(1);
            if (data && data.length > 0) {
                // Determine if we are done with it
                const isChallenger = data[0].challenger_id === profile.id;
                const isDone = isChallenger ? data[0].challenger_done : data[0].challenged_done;
                if (!isDone) {
                    setActiveDuel(data[0]);
                }
            }
        };
        fetchCurrentDuel();

        const channel = supabase.channel('duels_changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'duels' },
                (payload) => {
                    const newDuel = payload.new as any;
                    if (!newDuel) return;

                    // Incoming invite
                    if (newDuel.status === 'pending' && newDuel.challenged_id === profile.id) {
                        // Fetch challenger name
                        supabase.from('profiles').select('display_name').eq('id', newDuel.challenger_id).single().then(({ data }) => {
                            setIncomingDuel({ ...newDuel, challenger_name: data?.display_name || 'Someone' });
                            toast({
                                title: 'New 1v1 Challenge!',
                                description: `${data?.display_name || 'A student'} has challenged you to a 1v1 duel!`,
                            });
                        });
                    }

                    // Duel accepted/started
                    if (newDuel.status === 'in_progress' && (newDuel.challenger_id === profile.id || newDuel.challenged_id === profile.id)) {
                        const isChallenger = newDuel.challenger_id === profile.id;
                        const isDone = isChallenger ? newDuel.challenger_done : newDuel.challenged_done;
                        if (!isDone) {
                            setActiveDuel(newDuel);
                        }
                    }

                    // Duel rejected
                    if (newDuel.status === 'rejected' && newDuel.challenger_id === profile.id) {
                        toast({ title: 'Duel Rejected', description: 'Your friend rejected the challenge.', variant: 'destructive' });
                        setActiveDuel(null);
                    }

                    // Duel forfeited
                    if (newDuel.status === 'forfeited' && (newDuel.challenger_id === profile.id || newDuel.challenged_id === profile.id)) {
                        const isMe = newDuel.forfeited_by === profile.id;
                        if (!isMe) {
                            console.log("URGENT: Forfeit detected by listener", newDuel);
                            toast({ 
                                title: 'Duel Ended - Opponent Left', 
                                description: `${newDuel.forfeited_name || 'Your opponent'} has forfeited the match.`,
                                duration: 10000, // Show for 10 seconds
                            });
                            // If we are currently in a duel, this will force us back to dashboard
                            setActiveDuel(null);
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [profile?.id]);

    const handleAcceptDuel = async () => {
        if (!incomingDuel) return;
        const { error } = await supabase.from('duels').update({ status: 'in_progress' }).eq('id', incomingDuel.id);
        if (error) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } else {
            setIncomingDuel(null);
        }
    };

    const handleRejectDuel = async () => {
        if (!incomingDuel) return;
        await supabase.from('duels').update({ status: 'rejected' }).eq('id', incomingDuel.id);
        setIncomingDuel(null);
    };

    if (activeDuel) {
        return <DuelQuizInterface duel={activeDuel} onExit={() => setActiveDuel(null)} />;
    }

    return (
        <DashboardLayout
            title="Lumora Student Dashboard"
            sidebar={<StudentSidebar activeTab={activeTab} setActiveTab={handleNavigate} />}
            onNavItemClick={handleNavigate}
        >
            {activeTab === 'overview' && <StudentOverviewTab onNavigate={handleNavigate} loading={loading} />}
            {activeTab === 'competitions' && <CompetitionsTab initialCompetitionId={selectedCompetitionId} />}
            {activeTab === 'practice' && <PracticeTab />}
            {activeTab === 'leaderboard' && <LeaderboardTab />}
            {activeTab === 'messages' && <MessagesTab />}
            {activeTab === 'profile' && <ProfileView />}

            <AlertDialog open={!!incomingDuel}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>You've been challenged!</AlertDialogTitle>
                        <AlertDialogDescription>
                            <span className="font-bold text-primary">{incomingDuel?.challenger_name}</span> has invited you to a 1v1 practice duel. Do you accept?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleRejectDuel}>Reject</AlertDialogCancel>
                        <AlertDialogAction onClick={handleAcceptDuel} className="gradient-hero">Accept Challenge</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
}

function StudentOverviewTab({ onNavigate, loading: parentLoading }: { onNavigate: (tab: string, competitionId?: string) => void, loading: boolean }) {
    const { toast } = useToast();
    const { profile, setProfile } = useAuth();
    const [stats, setStats] = useState({
        totalCompetitions: 0,
        correctAnswers: 0,
        questionsAttempted: 0,
        score: 0,
        recentActivity: [] as any[]
    });
    const [loading, setLoading] = useState(false);

    const fetchStats = async () => {
        if (!profile?.id) return;
        setLoading(true);
        try {
            const [
                { count: joinedCount },
                { data: allResults, error: resultsErr },
                { data: recentJoins },
                { data: recentDuels },
                { data: currentProfile, error: profileErr }
            ] = await Promise.all([
                supabase.from('joined_competitions').select('*', { count: 'exact', head: true }).eq('user_id', profile.id),
                supabase.from('results').select('*, competitions(name), practice_sets(name)').eq('student_id', profile.id).order('submitted_at', { ascending: false }).limit(20),
                supabase.from('joined_competitions').select('*, competitions(name)').eq('user_id', profile.id).order('joined_at', { ascending: false }).limit(10),
                supabase.from('duels').select('*, challenger:profiles!challenger_id(display_name), challenged:profiles!challenged_id(display_name)').or(`challenger_id.eq.${profile.id},challenged_id.eq.${profile.id}`).order('created_at', { ascending: false }).limit(10),
                supabase.from('profiles').select('score').eq('id', profile.id).single()
            ]);

            if (resultsErr) console.error('Results fetch error:', resultsErr);
            if (profileErr) console.error('Profile fetch error:', profileErr);

            // Calculate core stats (excluding practice)
            const coreResults = (allResults || []).filter(r => !r.practice_set_id);
            const correctCount = coreResults.reduce((sum, r: any) => sum + (r.correct_count || 0), 0);
            const attemptedCount = coreResults.reduce((sum, r: any) => sum + (r.total_questions || 0), 0);

            // Build Activities
            const activities: any[] = [];

            // 1. Joins
            (recentJoins || []).forEach(j => {
                activities.push({
                    id: `join-${j.id}`,
                    timestamp: new Date(j.joined_at).getTime(),
                    title: (j.competitions as any)?.name || 'Competition',
                    action: 'Joined competition',
                    time: new Date(j.joined_at).toLocaleDateString(),
                    type: 'competition',
                    competition_id: j.competition_id
                });
            });

            // 2. Duels
            (recentDuels || []).forEach(d => {
                const opponent = d.challenger_id === profile.id ? d.challenged?.display_name : d.challenger?.display_name;
                activities.push({
                    id: `duel-${d.id}`,
                    timestamp: new Date(d.created_at).getTime(),
                    title: `1v1 vs ${opponent || 'Someone'}`,
                    action: d.status === 'completed' ? `Duel ${d.challenger_score > d.challenged_score ? (d.challenger_id === profile.id ? 'Won' : 'Lost') : 'Finished'}` : 'Duel activity',
                    time: new Date(d.created_at).toLocaleDateString(),
                    type: 'duel'
                });
            });

            // 3. Practice / Results
            (allResults || []).forEach(r => {
                const isPractice = !!r.practice_set_id;
                activities.push({
                    id: `result-${r.id}`,
                    timestamp: new Date(r.submitted_at).getTime(),
                    title: isPractice ? (r.practice_sets?.name || 'Practice Set') : (r.competitions?.name || 'Quiz'),
                    action: isPractice ? 'Completed practice set' : 'Submitted competition entry',
                    time: new Date(r.submitted_at).toLocaleDateString(),
                    type: isPractice ? 'practice' : 'competition'
                });
            });

            // Sort and limit
            const sortedActivities = activities
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 20);

            setStats({
                totalCompetitions: joinedCount || 0,
                correctAnswers: correctCount,
                questionsAttempted: attemptedCount,
                score: currentProfile?.score ?? profile?.score ?? 0,
                recentActivity: sortedActivities
            });
        } catch (error: any) {
            console.error('Error fetching student stats:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchStats();
    }, [profile?.id, profile?.score, profile?.progress]);

    const quickActions = [
        { id: 'competitions', icon: Trophy, title: 'Join Competitions', description: 'Participate in learning challenges' },
        { id: 'practice', icon: LayoutTemplate, title: 'Practice Sets', description: 'Improve your skills with practice' },
        { id: 'leaderboard', icon: CheckSquare, title: 'View Leaderboard', description: 'See how you rank against others' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold">Student Dashboard - Hello {profile?.display_name || 'User'} 👋</h1>
                    <p className="text-muted-foreground">Track your learning progress and achievements</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    title="Competitions"
                    value={stats.totalCompetitions.toString()}
                    icon={Trophy}
                    className="bg-primary/10 border-primary/20"
                />
                <StatCard
                    title="Questions Attempted"
                    value={stats.questionsAttempted.toLocaleString()}
                    icon={FileQuestion}
                    className="bg-accent/10 border-accent/20"
                />
                <StatCard
                    title="Correct Answers"
                    value={stats.correctAnswers.toLocaleString()}
                    icon={CheckCircle}
                    className="bg-success/10 border-success/20"
                />
                <StatCard
                    title="Total Score"
                    value={stats.score.toLocaleString()}
                    icon={TrendingUp}
                    className="bg-warning/10 border-warning/20"
                />
            </div>

            {/* Quick Actions and Recent Activity in 2 columns */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common student tasks</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            {quickActions.map((action, index) => (
                                <button
                                    key={action.id}
                                    onClick={() => onNavigate(action.id)}
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
                        <CardDescription>Your latest learning events</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-[260px] overflow-y-auto pr-2 custom-scrollbar">
                            {stats.recentActivity.length === 0 ? (
                                <p className="text-center text-muted-foreground py-4">No recent activity</p>
                            ) : (
                                stats.recentActivity.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                                        onClick={() => {
                                            if (activity.type === 'competition' && activity.competition_id) {
                                                onNavigate('competitions', activity.competition_id);
                                            }
                                        }}
                                    >
                                        <div className="p-2 rounded-lg bg-muted">
                                            {activity.type === 'competition' && <Trophy className="w-4 h-4 text-primary" />}
                                            {activity.type === 'practice' && <CheckSquare className="w-4 h-4 text-green-500" />}
                                            {activity.type === 'duel' && <Zap className="w-4 h-4 text-yellow-500" />}
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

// Practice Tab Component
function PracticeTab() {
    const [practiceSets, setPracticeSets] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeSet, setActiveSet] = useState(null);
    const [difficultyFilter, setDifficultyFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('none');
    const [isDuelDialogOpen, setIsDuelDialogOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const { profile } = useAuth();

    useEffect(() => {
        const fetchPracticeData = async () => {
            setLoading(true);
            try {
                const [{ data: sets }, { data: userResults }] = await Promise.all([
                    supabase.from('practice_sets').select('*').order('created_at', { ascending: false }),
                    supabase.from('results').select('*').eq('student_id', profile?.id).is('question_set_id', null)
                ]);
                setPracticeSets(sets || []);
                setResults(userResults || []);
            } catch (error) {
                console.error('Error fetching practice data:', error);
            }
            setLoading(false);
        };
        fetchPracticeData();
    }, [profile?.id, refreshKey]);

    if (activeSet) {
        return <QuizInterface questionSet={activeSet} onExit={() => { setActiveSet(null); setRefreshKey(prev => prev + 1); }} />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold">Practice Mode</h1>
                    <p className="text-muted-foreground">Improve your skills with self-paced learning</p>
                </div>
                <Button
                    className="gradient-hero"
                    onClick={() => setIsDuelDialogOpen(true)}
                >
                    <Users className="w-4 h-4 mr-2" />
                    1v1 Friend
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-muted/30 p-4 rounded-xl border border-border/50">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground ml-1">Filter:</Label>
                    <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                        <SelectTrigger className="w-full sm:w-[140px] h-9 bg-background">
                            <SelectValue placeholder="All Difficulties" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Difficulties</SelectItem>
                            <SelectItem value="easy">Easy Only</SelectItem>
                            <SelectItem value="medium">Medium Only</SelectItem>
                            <SelectItem value="hard">Hard Only</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground ml-1">Sort:</Label>
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                        <SelectTrigger className="w-full sm:w-[160px] h-9 bg-background">
                            <SelectValue placeholder="Default Sort" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Default Sort</SelectItem>
                            <SelectItem value="easy-to-hard">Easy to Hard</SelectItem>
                            <SelectItem value="hard-to-easy">Hard to Easy</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {practiceSets
                    .filter((set: any) => difficultyFilter === 'all' || (set.difficulty || 'medium') === difficultyFilter)
                    .sort((a: any, b: any) => {
                        const levels = { easy: 1, medium: 2, hard: 3 };
                        if (sortOrder === 'easy-to-hard') return (levels[a.difficulty] || 2) - (levels[b.difficulty] || 2);
                        if (sortOrder === 'hard-to-easy') return (levels[b.difficulty] || 2) - (levels[a.difficulty] || 2);
                        return 0;
                    })
                    .map((set: any) => {
                        const userResultsSet = results.filter((r: any) => r.practice_set_id === set.id);
                        const userResult = userResultsSet.length > 0 ? userResultsSet.sort((a: any, b: any) => (b.score || 0) - (a.score || 0))[0] : null;
                        const isCompleted = !!userResult;

                        return (
                            <Card key={set.id} className={`relative overflow-hidden transition-all hover:shadow-lg ${isCompleted ? 'border-success/30 bg-success/5 shadow-inner' : 'hover:border-primary/50'}`}>
                                {/* Difficulty Tag on Top Right */}
                                <div className="absolute top-0 right-0">
                                    <span className={`px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-wider shadow-sm ${set.difficulty === 'hard' ? 'bg-red-500 text-white' :
                                        set.difficulty === 'easy' ? 'bg-green-500 text-white' :
                                            'bg-yellow-500 text-white'
                                        }`}>
                                        {set.difficulty || 'Medium'}
                                    </span>
                                </div>

                                {/* Completion Tick in Corner */}
                                {isCompleted && (
                                    <div className="absolute top-2 left-2 z-10">
                                        <div className="bg-success text-success-foreground p-1 rounded-full shadow-glow-success animate-in fade-in zoom-in-50 duration-500">
                                            <Check className="w-3 h-3" />
                                        </div>
                                    </div>
                                )}

                                <CardHeader className="pt-8">
                                    <CardTitle className="text-lg">{set.name}</CardTitle>
                                    <CardDescription className="text-xs line-clamp-2">{set.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">{set.category}</span>
                                        {isCompleted && (
                                            <div className="text-right shrink-0">
                                                <div className="text-[10px] font-bold text-success uppercase leading-none">Best Score</div>
                                                <div className="text-sm font-mono font-bold text-primary">{userResult.score} / {userResult.total_points}</div>
                                            </div>
                                        )}
                                    </div>
                                    <Button className={`w-full h-9 text-sm ${isCompleted ? 'bg-success hover:bg-success/90 text-white' : 'gradient-hero shadow-glow hover:scale-[1.02]'}`} onClick={() => setActiveSet(set)}>
                                        {isCompleted ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 mr-2" />
                                                Retry Practice
                                            </>
                                        ) : (
                                            <>
                                                <Zap className="w-4 h-4 mr-2" />
                                                Attempt Practice
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                {practiceSets.length === 0 && (
                    <Card className="col-span-full p-12 text-center text-muted-foreground border-dashed">
                        <p className="text-lg font-medium text-foreground mb-2">No Practice Sets Yet</p>
                        <p>Check back later for new self-paced content from your teachers or admins.</p>
                    </Card>
                )}
            </div>

            <DuelInviteDialog open={isDuelDialogOpen} onOpenChange={setIsDuelDialogOpen} profile={profile} />
        </div>
    );
}

// High-performance Slide Player with Zero Delay Buffering
const SlidePlayer = ({ url }: { url: string }) => {
    const [currentSlide, setCurrentSlide] = useState(1);
    const [activeFrame, setActiveFrame] = useState(1);
    const [frame1Slide, setFrame1Slide] = useState(1);
    const [frame2Slide, setFrame2Slide] = useState(1);

    const getBaseUrl = (u: string) => {
        if (!u) return '';
        return u.includes('/pub')
            ? (u + (u.includes('?') ? '&' : '?') + 'rm=minimal')
            : (u.replace(/\/edit.*$/, '/embed') + '?rm=minimal');
    };

    const handleNext = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const nextSlide = currentSlide + 1;
        setCurrentSlide(nextSlide);

        if (activeFrame === 1) {
            setActiveFrame(2);
            // Slide 2 is already loaded in frame 2, now preload Slide 3 in frame 1
            setTimeout(() => setFrame1Slide(nextSlide + 1), 50);
        } else {
            setActiveFrame(1);
            // Slide X is already loaded in frame 1, now preload Slide X+1 in frame 2
            setTimeout(() => setFrame2Slide(nextSlide + 1), 50);
        }
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentSlide <= 1) return;

        const prevSlide = currentSlide - 1;
        setCurrentSlide(prevSlide);

        if (activeFrame === 1) {
            setActiveFrame(2);
            setTimeout(() => setFrame1Slide(prevSlide - 1 || 1), 20);
        } else {
            setActiveFrame(1);
            setTimeout(() => setFrame2Slide(prevSlide - 1 || 1), 20);
        }
    };

    const baseUrl = getBaseUrl(url);

    // Preload slide 2 after initial paint to avoid iframe flicker/shuffle
    useEffect(() => {
        setCurrentSlide(1);
        setActiveFrame(1);
        setFrame1Slide(1);
        setFrame2Slide(2);
    }, [baseUrl]);

    return (
        <div className="relative group rounded-xl border border-border/50 overflow-hidden bg-black shadow-2xl aspect-video select-none">
            {/* Buffering Frame 1 */}
            <iframe
                src={`${baseUrl}&slide=${frame1Slide}`}
                className={`absolute inset-0 w-full h-full border-0 transition-opacity duration-150 ${activeFrame === 1 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
                allowFullScreen
            />
            {/* Buffering Frame 2 */}
            <iframe
                src={`${baseUrl}&slide=${frame2Slide}`}
                className={`absolute inset-0 w-full h-full border-0 transition-opacity duration-150 ${activeFrame === 2 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
                allowFullScreen
            />

            {/* Total Click Blocker Overlay */}
            <div className="absolute inset-0 z-30 cursor-default bg-transparent" />

            {/* Navigation Overlay - Highest Z-Index */}
            <div className="absolute inset-0 z-40 flex items-center justify-between px-4 pointer-events-none">
                <Button
                    variant="secondary"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-black/70 text-white hover:bg-black/90 border-0 shadow-2xl pointer-events-auto active:scale-95 transition-all opacity-0 group-hover:opacity-100"
                    onClick={handlePrev}
                    disabled={currentSlide === 1}
                >
                    <ChevronRight className="w-6 h-6 rotate-180" />
                </Button>

                <Button
                    variant="secondary"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-black/70 text-white hover:bg-black/90 border-0 shadow-2xl pointer-events-auto active:scale-95 transition-all opacity-0 group-hover:opacity-100"
                    onClick={handleNext}
                >
                    <ChevronRight className="w-6 h-6" />
                </Button>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/60 text-white text-xs font-bold rounded-full z-40 opacity-0 group-hover:opacity-100 transition-all pointer-events-none backdrop-blur-md border border-white/10">
                Slide {currentSlide}
            </div>
        </div>
    );
};

function QuizInterface({ questionSet, onExit }) {
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [reviewMode, setReviewMode] = useState(false);
    const [finished, setFinished] = useState(false);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(false);
    const [loadingQuestions, setLoadingQuestions] = useState(true);
    const [questions, setQuestions] = useState<any[]>([]);
    const [questionTimeLeft, setQuestionTimeLeft] = useState<number | null>(null);
    const { profile, setProfile } = useAuth();
    const { toast } = useToast();
    const [reviewIndex, setReviewIndex] = useState(0);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [maxLockedIndex, setMaxLockedIndex] = useState(-1);

    const currentQuestion = questions[currentQuestionIndex] || {};
    const isSlide = currentQuestion?.type === 'slide';
    const canProgress = isSlide || !currentQuestion.is_required || !!answers[currentQuestion.id];

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setLoadingQuestions(true);

                // 1. Fetch questions using the same logic as before
                const { data: fetchedQuestions, error: setErr } = await supabase
                    .from('questions')
                    .select('*')
                    .eq('question_set_id', questionSet.id);

                let finalQuestions = fetchedQuestions || [];
                if (!setErr && finalQuestions.length === 0) {
                    const questionIds = (questionSet.question_ids || questionSet.questions || []);
                    if (questionIds.length > 0) {
                        const { data } = await supabase
                            .from('questions')
                            .select('*')
                            .in('id', questionIds);
                        finalQuestions = questionIds.map(id => (data || []).find(q => q.id === id)).filter(Boolean);
                    }
                }
                setQuestions(finalQuestions);

                // 2. Check for existing results to satisfy the "one-time/retryable" logic
                const isPractice = questionSet.questions !== undefined && !questionSet.question_ids;
                const setIdColumn = isPractice ? 'practice_set_id' : 'question_set_id';
                const { data: existingResults } = await supabase
                    .from('results')
                    .select('*')
                    .eq('student_id', profile?.id)
                    .eq(setIdColumn, questionSet.id)
                    .order('submitted_at', { ascending: false });

                if (existingResults && existingResults.length > 0) {
                    const lastResult = existingResults[0];
                    const scoringType = questionSet.scoring_type || 'highest';

                    // Practice sets always allow retries.
                    // For question sets, if scoring is best_of_3 or highest, allow retries even if allow_retries boolean is false.
                    const explicitlyDenied = questionSet.allow_retries === false;
                    let allowRetries = isPractice ? true : true;
                    if (!isPractice && explicitlyDenied && !['best_of_3', 'highest'].includes(scoringType)) {
                        allowRetries = false;
                    }

                    // Determine if retries are blocked
                    let blockRetry = false;
                    if (!allowRetries || scoringType === 'first_attempt') {
                        blockRetry = true;
                    } else if (scoringType === 'best_of_3' && existingResults.length >= 3) {
                        blockRetry = true;
                    }

                    if (blockRetry) {
                        // Jump straight to finished screen
                        setAnswers(lastResult.answers || {});
                        setScore(lastResult.score || 0);
                        setFinished(true);
                    }
                }
            } catch (error: any) {
                console.error('Error fetching questions:', error);
                toast({ title: 'Error loading questions', description: error.message, variant: 'destructive' });
            }
            setLoadingQuestions(false);
        };

        fetchQuestions();
    }, [questionSet.id, profile?.id]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Timer logic per question
    useEffect(() => {
        const q = questions[currentQuestionIndex];
        if (!q || finished || reviewMode) {
            setQuestionTimeLeft(null);
            return;
        }

        // Initialize timer if question has one
        if (q.timer > 0 && questionTimeLeft === null) {
            setQuestionTimeLeft(q.timer);
            return;
        }

        if (questionTimeLeft === null) return;

        if (questionTimeLeft <= 0) {
            setMaxLockedIndex(prev => Math.max(prev, currentQuestionIndex));
            // Auto-advance
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setQuestionTimeLeft(null); // Reset for next question
            } else {
                handleSubmit();
            }
            return;
        }

        const timer = setInterval(() => {
            setQuestionTimeLeft(prev => (prev !== null && prev > 0) ? prev - 1 : prev);
        }, 1000);
        return () => clearInterval(timer);
    }, [questionTimeLeft, currentQuestionIndex, questions, finished, reviewMode]);

    // Reset timer when question changes manually
    useEffect(() => {
        const q = questions[currentQuestionIndex];
        if (q?.timer > 0) {
            setQuestionTimeLeft(q.timer);
        } else {
            setQuestionTimeLeft(null);
        }
    }, [currentQuestionIndex, questions]);

    const handleAnswer = (val) => {
        if (!currentQuestion?.id) return;
        setAnswers({ ...answers, [currentQuestion.id]: val });
    };

    const handleSubmit = async (finalAnswers?: Record<string, string>) => {
        const currentAnswersMap = finalAnswers || answers;
        if (!finished) {
            setLoading(true);
            try {
                // Calculate Score
                let calculatedScore = 0;
                let totalPoints = 0;

                const questionObjects = questions;

                for (const q of questionObjects) {
                    if (!q) continue;
                    totalPoints += (q.points || 10);
                    const studentAns = currentAnswersMap[q.id];

                    // Slide questions auto-award max points when viewed
                    if (q.type === 'slide') {
                        calculatedScore += (q.points || 10);
                    } else if (q.type === 'text') {
                        const sAns = (studentAns || '').trim();
                        const mAns = (q.correct_answer || '').trim();

                        if (sAns.length > 0) {
                            let isCorrect = false;
                            if (q.exact_match_required) {
                                isCorrect = sAns === mAns;
                            } else {
                                isCorrect = sAns.toLowerCase() === mAns.toLowerCase();
                            }

                            if (isCorrect) {
                                calculatedScore += (q.points || 10);
                            }
                        }
                    } else {
                        if (currentAnswersMap[q.id] === q.correct_answer) {
                            calculatedScore += (q.points || 10);
                        }
                    }
                }

                setScore(calculatedScore);

                // Detect if this is a practice_set or question_set
                const isPracticeSet = questionSet.questions !== undefined && !questionSet.question_ids;
                // Fetch previous results for this set and user to calculate score delta
                const setCol = isPracticeSet ? 'practice_set_id' : 'question_set_id';
                const { data: previousResults, error: prevError } = await supabase
                    .from('results')
                    .select('*')
                    .eq('student_id', profile?.id)
                    .eq(setCol, questionSet.id);

                if (prevError) throw prevError;

                let previousEffectiveScore = 0;
                if (previousResults && previousResults.length > 0) {
                    const scores = previousResults.map((r: any) => r.score);
                    if (questionSet.scoring_type === 'best_of_3') {
                        previousEffectiveScore = Math.max(...scores);
                    } else if (questionSet.scoring_type === 'first_attempt') {
                        previousEffectiveScore = scores[0];
                    } else {
                        previousEffectiveScore = Math.max(...scores);
                    }
                }

                // Save Current Result
                const resultData: Record<string, any> = {
                    student_id: profile?.id,
                    score: calculatedScore,
                    total_points: totalPoints,
                    correct_count: questionObjects.filter(q => {
                        if (!q) return false;
                        if (q.type === 'slide') return true;
                        if (q.type === 'text') {
                            const sAns = (currentAnswersMap[q.id] || '').trim().toLowerCase();
                            const mAns = (q.correct_answer || '').trim().toLowerCase();
                            return q.exact_match_required ? currentAnswersMap[q.id]?.trim() === q.correct_answer?.trim() : sAns === mAns;
                        }
                        return currentAnswersMap[q.id] === q.correct_answer;
                    }).length,
                    total_questions: questionObjects.length,
                    answers: currentAnswersMap,
                    submitted_at: new Date().toISOString()
                };
                // Use the correct foreign key column
                if (isPracticeSet) {
                    resultData.practice_set_id = questionSet.id;
                } else {
                    resultData.question_set_id = questionSet.id;
                    // Fix: Add competition_id to results so it shows as "Done"
                    // We check if the questionSet has competition_ids, and if we are in a competition context
                    // QuizInterface gets questionSet. We might need to pass competitionId explicitly.
                    if (questionSet.competition_id) {
                        resultData.competition_id = questionSet.competition_id;
                    }
                }
                const { error: insertError } = await supabase.from('results').insert(resultData);
                if (insertError) throw insertError;

                // Calculate New Effective Score
                const allScores = [...(previousResults?.map((r: any) => r.score) || []), calculatedScore];
                let newEffectiveScore = 0;
                if (questionSet.scoring_type === 'best_of_3') {
                    newEffectiveScore = Math.max(...allScores);
                } else if (questionSet.scoring_type === 'first_attempt') {
                    newEffectiveScore = allScores[0];
                } else {
                    newEffectiveScore = Math.max(...allScores);
                }

                const scoreDelta = Math.max(0, newEffectiveScore - previousEffectiveScore);

                // Practice attempts should not affect score/progress
                if (!isPracticeSet && scoreDelta > 0) {
                    const updatedProfileData = {
                        score: (profile?.score || 0) + scoreDelta,
                        progress: Math.min((profile?.progress || 0) + 10, 100),
                        updated_at: new Date().toISOString()
                    };
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .update(updatedProfileData)
                        .eq('id', profile?.id);
                    if (profileError) throw profileError;

                    if (setProfile) {
                        setProfile({
                            ...profile,
                            ...updatedProfileData
                        });
                    }
                    toast({ title: `Quiz Completed! You earned ${scoreDelta} new points!` });
                } else {
                    toast({ title: `Quiz Completed! Score: ${calculatedScore}.` });
                }

                setFinished(true);
            } catch (error: any) {
                console.error('Error submitting quiz:', error);
                toast({ title: 'Error submitting quiz', description: error.message, variant: 'destructive' });
            }
            setLoading(false);
        } else {
            onExit();
        }
    };

    const handleExitClick = () => {
        if (finished) {
            onExit();
        } else {
            setShowExitConfirm(true);
        }
    };

    const confirmExit = async () => {
        // If one-time attempt, submit as is before leaving
        if (!questionSet.allow_retries) {
            await handleSubmit();
        }
        setShowExitConfirm(false);
        onExit();
    };

    if (loadingQuestions) return <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /><p className="mt-2 text-muted-foreground">Loading questions...</p></div>;

    if (questions.length === 0) return <div className="p-8 text-center">No questions in this set <Button onClick={onExit} variant="link">Go Back</Button></div>;

    if (finished) {
        const reviewQuestion = questions[reviewIndex];
        return (
            <Card className="max-w-2xl mx-auto mt-8 text-center animate-in zoom-in-95 duration-300">
                <CardHeader>
                    <div className="flex justify-center mb-2">
                        <div className="bg-success/10 p-3 rounded-full">
                            <CheckCircle2 className="w-12 h-12 text-success" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl">Set Completed!</CardTitle>
                    <CardDescription>You scored <span className="text-primary font-bold text-lg">{score}</span> out of {questions.reduce((a, b) => a + (b.points || 10), 0)}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-6 bg-muted/30 rounded-2xl border border-border/50 relative">
                        <div className="absolute top-2 right-4 text-[10px] font-mono text-muted-foreground">Review {reviewIndex + 1} / {questions.length}</div>

                        <div className="min-h-[200px] flex flex-col justify-center py-4">
                            <h4 className="text-lg font-medium mb-4">{reviewQuestion?.text}</h4>

                            {reviewQuestion?.image_url && (
                                <div className="mb-4 rounded-lg overflow-hidden border border-border max-w-xs mx-auto">
                                    <img src={reviewQuestion.image_url} alt="Question Resource" className="w-full h-auto object-contain" />
                                </div>
                            )}

                            <div className={`p-4 rounded-xl border-2 transition-all ${answers[reviewQuestion?.id] === reviewQuestion?.correct_answer ? 'bg-success/5 border-success/30' : 'bg-destructive/5 border-destructive/30'}`}>
                                <p className="text-sm font-semibold mb-1">Your Answer:</p>
                                <p className="text-md">{answers[reviewQuestion?.id] || <span className="italic opacity-50 text-sm">(No answer provided)</span>}</p>

                                {answers[reviewQuestion?.id] !== reviewQuestion?.correct_answer && (
                                    <div className="mt-3 pt-3 border-t border-destructive/10">
                                        <p className="text-xs font-bold text-success uppercase tracking-wider">Correct Answer:</p>
                                        <p className="font-medium text-success">{reviewQuestion?.correct_answer}</p>
                                    </div>
                                )}
                            </div>

                            {reviewQuestion?.explanation && (
                                <div className="mt-4 p-3 bg-primary/5 rounded-lg text-left">
                                    <p className="text-xs font-bold text-primary mb-1">Explanation:</p>
                                    <p className="text-xs text-muted-foreground">{reviewQuestion.explanation}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center mt-6">
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={reviewIndex === 0}
                                onClick={() => setReviewIndex(prev => prev - 1)}
                            >
                                <ChevronRight className="w-4 h-4 mr-2 rotate-180" /> Previous
                            </Button>
                            <div className="flex gap-1">
                                {questions.map((_, i) => (
                                    <div key={i} className={`h-1.5 rounded-full transition-all ${i === reviewIndex ? 'w-4 bg-primary' : 'w-1.5 bg-border'}`} />
                                ))}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={reviewIndex === questions.length - 1}
                                onClick={() => setReviewIndex(prev => prev + 1)}
                            >
                                Next <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
                <div className="p-6">
                    <Button onClick={onExit} className="w-full gradient-hero">Back to Dashboard</Button>
                </div>
            </Card>
        );
    }

    return (
        <Card className="max-w-3xl mx-auto mt-4">
            <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to exit?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {!questionSet.allow_retries
                                ? "This is a one-time attempt. If you leave now, your current progress will be submitted and you won't be able to try again."
                                : questionSet.scoring_type === 'best_of_3'
                                    ? "You have limited attempts. Leaving now will count as an attempt."
                                    : "Your progress for this attempt will be lost."
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Continue Quiz</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmExit} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Exit Anyway
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <CardHeader>
                <div className="flex items-center gap-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleExitClick}
                        className="text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1.5 h-8 px-2"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold uppercase tracking-tighter">Exit</span>
                    </Button>
                    <CardTitle className="truncate">{questionSet.name}</CardTitle>
                    <div className="flex items-center gap-4 ml-auto">
                        {questionTimeLeft !== null && questionTimeLeft >= 0 ? (
                            <div className="flex flex-col items-end gap-1">
                                <div className={`flex items-center gap-2 font-mono font-bold ${questionTimeLeft <= 5 ? 'text-destructive animate-pulse' : 'text-primary'}`}>
                                    <Clock className="w-4 h-4" />
                                    {questionTimeLeft}s
                                </div>
                                <div className="w-24 bg-muted h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-destructive h-full transition-all duration-1000 ease-linear" style={{ width: `${(questionTimeLeft / (currentQuestion?.timer || 1)) * 100}%` }}></div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 font-mono font-bold text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                Unlimited
                            </div>
                        )}
                        <span className="text-muted-foreground text-sm">Question {currentQuestionIndex + 1} of {questions.length || 1}</span>
                    </div>
                </div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden mt-2">
                    <div className="bg-primary h-full transition-all" style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}></div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="text-lg font-medium">{currentQuestion.text || currentQuestion.prompt}</div>

                    {currentQuestion.image_url && !currentQuestion.slide_url && (
                        <div className="rounded-xl border border-border/50 overflow-hidden bg-muted/20">
                            <img
                                src={currentQuestion.image_url}
                                alt="Question context"
                                className="w-full h-auto max-h-[300px] object-contain mx-auto"
                            />
                        </div>
                    )}

                    {currentQuestion.slide_url && (
                        <SlidePlayer key={currentQuestion.id} url={currentQuestion.slide_url} />
                    )}
                </div>

                <div className="space-y-4">
                    {currentQuestion.is_required && !answers[currentQuestion.id] && (
                        <div className="text-[10px] text-destructive bg-destructive/5 px-2 py-1 rounded inline-flex items-center gap-1 font-bold italic uppercase">
                            <AlertCircle className="w-3 h-3" /> Answer Required
                        </div>
                    )}
                    {currentQuestion.type === 'mcq' ? (
                        <div className="grid gap-3">
                            {currentQuestion.options.map((opt, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleAnswer(opt)}
                                    className={`p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-all ${answers[currentQuestion.id] === opt ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border'}`}
                                >
                                    {opt}
                                </div>
                            ))}
                        </div>
                    ) : currentQuestion.type === 'slide' ? (
                        <div className="hidden"></div>
                    ) : (
                        <Textarea
                            placeholder="Type your answer here..."
                            className="min-h-[150px]"
                            value={answers[currentQuestion.id] || ''}
                            onChange={(e) => handleAnswer(e.target.value)}
                        />
                    )}
                </div>
            </CardContent>
            <div className="p-6 flex justify-between border-t border-border/50 bg-muted/10">
                <Button
                    variant="outline"
                    disabled={currentQuestionIndex === 0 || questionTimeLeft !== null || currentQuestionIndex - 1 <= maxLockedIndex}
                    onClick={() => setCurrentQuestionIndex(curr => curr - 1)}
                    className="h-10 px-6 rounded-xl"
                >
                    <ChevronRight className="w-4 h-4 mr-2 rotate-180" /> Previous
                </Button>
                {currentQuestionIndex < questions.length - 1 ? (
                    <Button
                        onClick={() => {
                            if (isSlide) handleAnswer('slide_viewed');
                            if (currentQuestion?.timer > 0) {
                                setMaxLockedIndex(prev => Math.max(prev, currentQuestionIndex));
                            }
                            setCurrentQuestionIndex(curr => curr + 1);
                        }}
                        disabled={!canProgress}
                        className="h-10 px-6 rounded-xl gradient-hero shadow-lg"
                    >
                        Next <ChevronRight className="w-4 h-4 ml-2" />
                        {currentQuestion.is_required && !canProgress && <Lock className="w-3 h-3 ml-2 opacity-50" />}
                    </Button>
                ) : (
                    <Button
                        onClick={() => {
                            const final = { ...answers };
                            if (isSlide) final[currentQuestion.id] = 'slide_viewed';
                            if (currentQuestion?.timer > 0) {
                                setMaxLockedIndex(prev => Math.max(prev, currentQuestionIndex));
                            }
                            handleSubmit(final);
                        }}
                        className="h-10 px-6 rounded-xl gradient-hero shadow-lg"
                        disabled={!canProgress}
                    >
                        Submit Set <Check className="w-4 h-4 ml-2" />
                        {currentQuestion.is_required && !canProgress && <Lock className="w-3 h-3 ml-2 opacity-50" />}
                    </Button>
                )}
            </div>
        </Card>
    );
}

// Competitions Tab Component
function CompetitionsTab({ initialCompetitionId }: { initialCompetitionId?: string | null }) {
    const [competitions, setCompetitions] = useState([]);
    const [joinedCompIds, setJoinedCompIds] = useState([]);
    const [selectedComp, setSelectedComp] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'find' | 'participating'>('participating');
    const [practiceSets, setPracticeSets] = useState([]);
    const [joinCode, setJoinCode] = useState('');
    const { toast } = useToast();
    const { profile } = useAuth();

    const fetchCompetitions = async () => {
        setLoading(true);
        try {
            const [{ data: comps }, { data: joined }, { data: psets }] = await Promise.all([
                supabase.from('competitions').select('*').eq('is_active', true),
                supabase.from('joined_competitions').select('competition_id').eq('user_id', profile?.id),
                supabase.from('practice_sets').select('*').eq('is_active', true)
            ]);
            setCompetitions(comps || []);
            setJoinedCompIds((joined || []).map(j => j.competition_id));
            setPracticeSets(psets || []);
        } catch (error: any) {
            toast({ title: 'Error fetching competitions', description: error.message, variant: 'destructive' });
        }
        setLoading(false);
    };

    useEffect(() => {
        if (profile?.id) {
            fetchCompetitions().then(() => {
                if (initialCompetitionId) {
                    const comp = competitions.find((c: any) => c.id === initialCompetitionId);
                    if (comp) setSelectedComp(comp);
                }
            });
        }
    }, [profile?.id, profile?.school_id]);

    useEffect(() => {
        if (initialCompetitionId && competitions.length > 0) {
            const comp = competitions.find((c: any) => c.id === initialCompetitionId);
            if (comp) setSelectedComp(comp);
        }
    }, [initialCompetitionId, competitions]);

    const handleJoinByCode = async () => {
        if (!joinCode.trim()) return;
        setLoading(true);
        try {
            const { data, error } = await supabase.from('competitions').select('id, name').eq('access_code', joinCode.trim()).single();
            if (error || !data) {
                toast({ title: 'Invalid Access Code', description: 'No competition found with this code.', variant: 'destructive' });
            } else {
                await handleJoin(data.id);
                setJoinCode('');
                toast({ title: 'Success!', description: `You found: ${data.name}` });
                fetchCompetitions();
            }
        } catch (e: any) {
            toast({ title: 'Error', description: e.message, variant: 'destructive' });
        }
        setLoading(false);
    };

    const handleJoin = async (compId: string) => {
        try {
            const { error } = await supabase.from('joined_competitions').insert({
                user_id: profile?.id,
                competition_id: compId,
                joined_at: new Date().toISOString()
            });
            if (error) {
                if (error.code === '23505') { // Unique violation
                    toast({ title: 'Already joined this competition' });
                    const comp = (competitions || []).find((c: any) => c.id === compId);
                    if (comp) setSelectedComp(comp);
                } else throw error;
            } else {
                setJoinedCompIds(prev => [...prev, compId]);
                toast({ title: 'Joined competition successfully!' });
                const comp = (competitions || []).find((c: any) => c.id === compId);
                if (comp) setSelectedComp(comp);
            }
        } catch (e: any) {
            toast({ title: 'Error joining', description: e.message, variant: 'destructive' });
        }
    };

    const handleLeave = async (compId: string) => {
        try {
            const { error } = await supabase.from('joined_competitions').delete().eq('user_id', profile?.id).eq('competition_id', compId);
            if (error) throw error;
            setJoinedCompIds(prev => prev.filter(id => id !== compId));
            toast({ title: 'Left competition successfully!' });
        } catch (e: any) {
            toast({ title: 'Error leaving', description: e.message, variant: 'destructive' });
        }
        fetchCompetitions(); // Refetch to sync state
    };

    if (selectedComp) {
        return <CompetitionDetailView competition={selectedComp} onBack={() => setSelectedComp(null)} />;
    }

    const myCompetitions = (competitions || []).filter(c => {
        const isJoinedManually = joinedCompIds.includes(c.id);
        const isAssignedBySchool = (profile?.school_id && c.participating_schools?.includes(profile.school_id));
        const matchesSearch = ((c?.name || "").toLowerCase().includes((searchTerm || "").toLowerCase()));
        return (isJoinedManually || isAssignedBySchool) && matchesSearch;
    });

    const discoverCompetitions = (competitions || []).filter(c => {
        const isJoinedManually = joinedCompIds.includes(c.id);
        const isAssignedBySchool = (profile?.school_id && c.participating_schools?.includes(profile.school_id));
        const matchesSearch = ((c?.name || "").toLowerCase().includes((searchTerm || "").toLowerCase()));
        // Don't show if already joined, or if it has an access code (private)
        return !isJoinedManually && !isAssignedBySchool && c.is_active && !c.access_code && matchesSearch;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold">Competitions</h1>
                    <p className="text-muted-foreground">Manage your competitions and discover new ones</p>
                </div>
                <div className="flex bg-muted p-1 rounded-lg">
                    <Button variant={viewMode === 'participating' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('participating')} className="rounded-md h-8 text-xs px-4">Participating</Button>
                    <Button variant={viewMode === 'find' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('find')} className="rounded-md h-8 text-xs px-4">Find Competitions</Button>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search competitions..." className="pl-10 h-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            <Card className="bg-muted/30 border-dashed border-primary/20">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-full text-primary"><Lock className="w-4 h-4" /></div>
                            <div>
                                <h3 className="font-semibold text-sm">Have a Private Access Code?</h3>
                                <p className="text-xs text-muted-foreground">Enter the code provided by your instructor to join a private competition.</p>
                            </div>
                        </div>
                        <div className="flex w-full sm:w-auto gap-2">
                            <Input placeholder="Enter Access Code" className="bg-background max-w-[200px]" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} />
                            <Button onClick={handleJoinByCode} disabled={!joinCode || loading} className="gradient-hero shrink-0">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Join'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {viewMode === 'participating' ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myCompetitions.length === 0 ? (
                        <Card className="col-span-full p-12 text-center text-muted-foreground border-dashed">
                            <p>You haven't joined any competitions yet.</p>
                            <Button variant="link" className="mt-2" onClick={() => setViewMode('find')}>Explore open competitions</Button>
                        </Card>
                    ) : (
                        myCompetitions.map(comp => {
                            const isMandatory = comp.participating_schools?.includes(profile?.school_id) || comp.can_leave === false;
                            return (
                                <Card key={comp.id} className="hover:border-primary/50 transition-colors flex flex-col overflow-hidden">
                                    {comp.banner_url && (
                                        <div className="h-32 w-full overflow-hidden">
                                            <img src={comp.banner_url} alt={comp.name} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <CardHeader className="flex-1 p-4 pb-2 space-y-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <CardTitle className="text-lg">{comp.name}</CardTitle>
                                            {isMandatory && <span className="px-2 py-0.5 rounded-full bg-warning/10 text-warning text-[10px] font-bold">MANDATORY</span>}
                                        </div>
                                        <CardDescription className="line-clamp-2 text-xs">{comp.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <div className="flex flex-col gap-2">
                                            <Button className="w-full h-9 gradient-hero text-sm" onClick={() => setSelectedComp(comp)}>Participate</Button>
                                            {!isMandatory && <Button variant="outline" size="sm" className="w-full text-xs text-destructive hover:bg-destructive/5" onClick={(e) => { e.stopPropagation(); handleLeave(comp.id); }}>Leave Competition</Button>}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {discoverCompetitions.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-muted-foreground border border-dashed rounded-lg">No new competitions found to join.</div>
                    ) : (
                        discoverCompetitions.map(comp => (
                            <Card key={comp.id} className="flex flex-col overflow-hidden">
                                {comp.banner_url && (
                                    <div className="h-32 w-full overflow-hidden">
                                        <img src={comp.banner_url} alt={comp.name} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <CardHeader className="flex-1 p-4 pb-2 space-y-1">
                                    <CardTitle className="text-lg">{comp.name}</CardTitle>
                                    <CardDescription className="line-clamp-2 text-xs">{comp.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="mb-2"><span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] uppercase font-bold">{comp.category || 'General'}</span></div>
                                    <Button className="w-full h-9 gradient-hero text-sm" onClick={() => handleJoin(comp.id)}>Join Competition</Button>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

function CompetitionDetailView({ competition, onBack }) {
    const [questionSets, setQuestionSets] = useState([]);
    const [results, setResults] = useState([]);
    const [activeSet, setActiveSet] = useState(null);
    const [difficultyFilter, setDifficultyFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('none');
    const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});
    const [refreshKey, setRefreshKey] = useState(0);
    const { profile } = useAuth();

    useEffect(() => {
        const fetchSetsAndResults = async () => {
            try {
                // Fetch question sets that have this competition ID in their competition_ids array
                const [{ data: sets }, { data: userResults }] = await Promise.all([
                    supabase
                        .from('question_sets')
                        .select('*')
                        .contains('competition_ids', [competition.id]),
                    supabase
                        .from('results')
                        .select('*')
                        .eq('student_id', profile?.id)
                        .eq('competition_id', competition.id)
                        .order('score', { ascending: false })
                ]);

                setQuestionSets(sets || []);
                setResults(userResults || []);

                // Fetch actual question counts for each set
                if (sets && sets.length > 0) {
                    const counts: Record<string, number> = {};
                    await Promise.all((sets || []).map(async (s: any) => {
                        const { count } = await supabase
                            .from('questions')
                            .select('*', { count: 'exact', head: true })
                            .eq('question_set_id', s.id);
                        const fkCount = count || 0;
                        const idsCount = s.question_ids?.length || 0;
                        counts[s.id] = Math.max(fkCount, idsCount);
                    }));
                    setQuestionCounts(counts);
                }
            } catch (error) {
                console.error('Error fetching sets:', error);
            }
        };
        fetchSetsAndResults();
    }, [competition.id, refreshKey]);

    if (activeSet) {
        return <QuizInterface questionSet={{ ...activeSet, competition_id: competition.id }} onExit={() => { setActiveSet(null); setRefreshKey(prev => prev + 1); }} />;
    }

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={onBack} className="mb-2">
                <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
                Back to Competitions
            </Button>

            {competition.banner_url && (
                <div className="w-full h-48 md:h-64 rounded-2xl overflow-hidden border border-border shadow-md mb-6 relative group">
                    <img src={competition.banner_url} alt={competition.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                        <h1 className="text-3xl font-display font-bold drop-shadow-md">{competition.name}</h1>
                        <p className="text-white/80 line-clamp-1 max-w-xl text-sm italic">{competition.description}</p>
                    </div>
                </div>
            )}

            {!competition.banner_url && (
                <div className="mb-6">
                    <h1 className="text-2xl font-display font-bold">{competition.name}</h1>
                    <p className="text-muted-foreground">{competition.description}</p>
                </div>
            )}

            {/* Filters and Sorting */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-muted/30 p-4 rounded-xl border border-border/50">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground ml-1">Filter:</Label>
                    <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                        <SelectTrigger className="w-full sm:w-[140px] h-9 bg-background">
                            <SelectValue placeholder="All Difficulties" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Difficulties</SelectItem>
                            <SelectItem value="easy">Easy Only</SelectItem>
                            <SelectItem value="medium">Medium Only</SelectItem>
                            <SelectItem value="hard">Hard Only</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground ml-1">Sort:</Label>
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                        <SelectTrigger className="w-full sm:w-[160px] h-9 bg-background">
                            <SelectValue placeholder="Default Sort" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Default Sort</SelectItem>
                            <SelectItem value="easy-to-hard">Easy to Hard</SelectItem>
                            <SelectItem value="hard-to-easy">Hard to Easy</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {questionSets
                    .filter(set => difficultyFilter === 'all' || (set.difficulty || 'medium') === difficultyFilter)
                    .sort((a, b) => {
                        const levels = { easy: 1, medium: 2, hard: 3 };
                        if (sortOrder === 'easy-to-hard') return (levels[a.difficulty] || 2) - (levels[b.difficulty] || 2);
                        if (sortOrder === 'hard-to-easy') return (levels[b.difficulty] || 2) - (levels[a.difficulty] || 2);
                        return 0;
                    })
                    .map(set => {
                        const userResultsSet = results.filter(r => r.question_set_id === set.id);
                        const userResult = userResultsSet.length > 0 ? userResultsSet[0] : null; // Assuming results are sorted descending, so 0 is latest/best
                        const isCompleted = !!userResult;

                        const scoringType = set.scoring_type || 'highest';
                        const explicitlyDenied = set.allow_retries === false;
                        let canRetry = true;
                        if (explicitlyDenied && !['best_of_3', 'highest'].includes(scoringType)) {
                            canRetry = false;
                        } else if (scoringType === 'first_attempt') {
                            canRetry = false;
                        } else if (scoringType === 'best_of_3' && userResultsSet.length >= 3) {
                            canRetry = false;
                        }

                        return (
                            <Card key={set.id} className={`relative overflow-hidden transition-all hover:shadow-lg ${isCompleted ? 'border-success/30 bg-success/5 shadow-inner' : 'hover:border-primary/50'}`}>
                                {/* Difficulty Tag on Top Right */}
                                <div className="absolute top-0 right-0">
                                    <span className={`px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-wider shadow-sm ${set.difficulty === 'hard' ? 'bg-red-500 text-white' :
                                        set.difficulty === 'easy' ? 'bg-green-500 text-white' :
                                            'bg-yellow-500 text-white'
                                        }`}>
                                        {set.difficulty || 'Medium'}
                                    </span>
                                </div>

                                {/* Completion Tick in Corner */}
                                {isCompleted && (
                                    <div className="absolute top-2 left-2 z-10">
                                        <div className="bg-success text-success-foreground p-1 rounded-full shadow-glow-success animate-in fade-in zoom-in-50 duration-500">
                                            <Check className="w-3 h-3" />
                                        </div>
                                    </div>
                                )}

                                <CardHeader className="pt-8">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 text-left">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                {set.name}
                                            </CardTitle>
                                            <CardDescription className="text-xs line-clamp-2">{set.description}</CardDescription>
                                        </div>
                                        {isCompleted && (
                                            <div className="text-right shrink-0">
                                                <div className="text-[10px] font-bold text-success uppercase">Completed</div>
                                                <div className="text-sm font-mono font-bold text-primary">{userResult.score} / {userResult.total_points}</div>
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                                        <div className="flex items-center gap-2">
                                            <FileQuestion className="w-4 h-4" />
                                            {questionCounts[set.id] || set.question_ids?.length || (set.questions && Array.isArray(set.questions) ? set.questions.length : 0)} Questions
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            {set.time_limit > 0 ? `Expected: ${set.time_limit} mins` : 'Unlimited'}
                                        </div>
                                    </div>

                                    {isCompleted && !canRetry ? (
                                        <Button variant="outline" className="w-full border-dashed" onClick={() => setActiveSet(set)}>
                                            View Results
                                        </Button>
                                    ) : (
                                        <Button className={`w-full h-10 ${isCompleted ? 'bg-success hover:bg-success/90 text-white' : 'gradient-hero shadow-glow hover:scale-[1.02]'}`} onClick={() => setActiveSet(set)}>
                                            {isCompleted ? (
                                                <>
                                                    <RefreshCw className="w-4 h-4 mr-2" />
                                                    Retry Quiz
                                                </>
                                            ) : (
                                                <>
                                                    <Zap className="w-4 h-4 mr-2" />
                                                    Enter Quiz Set
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                {questionSets.length === 0 && (
                    <div className="col-span-full p-12 text-center text-muted-foreground border rounded-lg">
                        No question sets available for this competition yet.
                    </div>
                )}
            </div>
        </div>
    );
}


// Leaderboard Tab Component
function LeaderboardTab() {
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
            const { data: comps } = await supabase.from('competitions').select('id, name');
            setCompetitions(comps || []);

            // 2. Fetch students based on tab
            let studentQuery = supabase.from('profiles').select('*').eq('role', 'student');
            if (leaderboardType === 'myschool' && profile?.school_id) {
                studentQuery = studentQuery.eq('school_id', profile.school_id);
            }
            const { data: students, error: studentError } = await studentQuery;
            if (studentError) throw studentError;

            let filteredStudents = students || [];

            // 3. Handle scoring based on competition filter
            if (selectedCompId === 'all') {
                // Use total profile score
                const sorted = filteredStudents.sort((a: any, b: any) => (b.score || 0) - (a.score || 0));
                setLeaderboardData(sorted as any);
            } else {
                // Fix: Fetch all sets for this competition to sum scores
                const { data: sets } = await supabase.from('question_sets').select('id').contains('competition_ids', [selectedCompId]);
                const setIds = (sets || []).map(s => s.id);

                if (setIds.length === 0) {
                    setLeaderboardData([]);
                } else {
                    const { data: results } = await supabase.from('results').select('student_id, question_set_id, score').in('question_set_id', setIds);

                    // Track max score per set per student
                    const studentSetScores: Record<string, Record<string, number>> = {};
                    (results || []).forEach(r => {
                        if (!studentSetScores[r.student_id]) {
                            studentSetScores[r.student_id] = {};
                        }
                        const currentMax = studentSetScores[r.student_id][r.question_set_id] || 0;
                        if ((r.score || 0) > currentMax) {
                            studentSetScores[r.student_id][r.question_set_id] = r.score || 0;
                        }
                    });

                    // Sum max scores for each student
                    const studentScores: Record<string, number> = {};
                    Object.entries(studentSetScores).forEach(([studentId, sets]) => {
                        studentScores[studentId] = Object.values(sets).reduce((sum, score) => sum + score, 0);
                    });

                    const mappedData = filteredStudents
                        .map(s => ({ ...s, competitionScore: studentScores[s.id] || 0 }))
                        .sort((a: any, b: any) => b.competitionScore - a.competitionScore);

                    setLeaderboardData(mappedData as any);
                }
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
                    <p className="text-muted-foreground">Compare yourself with others</p>
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
                        <SchoolLeaderboard selectedCompId={selectedCompId} searchTerm={searchTerm} />
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>{leaderboardType === 'global' ? 'Global Rankings' : 'Students In My School'}</CardTitle>
                        <CardDescription>Top performers based on {selectedCompId === 'all' ? 'total points' : 'competition points'}</CardDescription>
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
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                                                            {(student.display_name || student.email || '??').substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-sm">{student.display_name || 'Anonymous'}</p>
                                                            <p className="text-[10px] text-muted-foreground">{student.email}</p>
                                                        </div>
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

function SchoolLeaderboard({ selectedCompId, searchTerm }: { selectedCompId: string, searchTerm: string }) {
    const [schoolData, setSchoolData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSchools = async () => {
            setLoading(true);
            try {
                const [{ data: schools }, { data: users }, { data: results }] = await Promise.all([
                    supabase.from('schools').select('*'),
                    supabase.from('profiles').select('*').eq('role', 'student'),
                    supabase.from('results').select('*')
                ]);

                if (!schools || !users || !results) return;

                const aggregatedSchools = await Promise.all(schools.map(async (school: any) => {
                    const schoolStudents = users.filter((u: any) => u.school_id === school.id);
                    let totalPoints = 0;

                    if (selectedCompId === 'all') {
                        totalPoints = schoolStudents.reduce((sum, u: any) => sum + (u.score || 0), 0);
                    } else {
                        // Sum scores for all question sets in this competition for all students in the school
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
            } catch (e) {
                console.error(e);
            }
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
            ) : filteredSchools.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No school data found for this selection.</p>
            ) : (
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="p-3 text-left font-medium">School Name</th>
                            <th className="p-3 text-left font-medium">Country</th>
                            <th className="p-3 text-right font-medium">Total Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSchools.map((school) => (
                            <tr key={school.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                                <td className="p-3 font-semibold">{school.name}</td>
                                <td className="p-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">{school.country || 'Global'}</span>
                                    </div>
                                </td>
                                <td className="p-3 text-right font-mono text-primary font-bold">{school.totalPoints.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
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
    const { profile } = useAuth();

    const filteredMessages = messages.filter(message =>
        (message.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (message.sender_name || message.sender_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (message.body || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fetchMessages = async () => {
        if (!profile?.id) return;
        setLoading(true);
        try {
            // Fetch direct messages and announcements
            // We use .or to filter for: 
            // 1. Messages sent directly to this user ID
            // 2. Announcements sent to 'student' role
            // 3. Global announcements sent to 'all' role
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`recipient_id.eq.${profile.id},recipient_role.eq.student,recipient_role.eq.all`)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMessages((data || []) as any);
        } catch (error: any) {
            console.error('Fetch messages error:', error);
            toast({ title: 'Error fetching messages', description: error.message, variant: 'destructive' });
        }
        setLoading(false);
    };

    const handleMarkRead = async (id: string) => {
        try {
            // Immediate UI update for responsiveness
            setMessages((prev: any) => prev.map((m: any) => m.id === id ? { ...m, is_read: true } : m));

            const { error } = await supabase.from('messages').update({ is_read: true }).eq('id', id);
            if (error) throw error;

            if (selectedMessage?.id === id) {
                setSelectedMessage((prev: any) => prev ? { ...prev, is_read: true } : null);
            }
        } catch (e) {
            console.error('Error marking as read:', e);
            // Revert on error if necessary, but usually ephemeral errors shouldn't break the UI
        }
    };

    const handleSendReply = async () => {
        if (!replyContent.trim() || !selectedMessage || !profile?.id) return;

        setSendingReply(true);
        try {
            const { error } = await supabase.from('messages').insert({
                subject: `Re: ${(selectedMessage as any).subject}`,
                body: replyContent,
                sender_id: profile.id,
                sender_name: profile.display_name || profile.email || 'User',
                sender_role: profile.role || 'student',
                recipient_id: (selectedMessage as any).sender_id,
                recipient_role: 'specific', // Replies are always specific
            });

            if (error) throw error;

            toast({ title: 'Reply sent successfully!' });
            setReplyContent('');
            await fetchMessages(); // Refresh to see sent reply if needed (though student view usually only shows inbox)
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
            setMessages(messages.filter((msg: any) => msg.id !== messageId));
            if (selectedMessage?.id === messageId) {
                setSelectedMessage(null);
            }
            toast({ title: 'Message deleted successfully!' });
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
                <p className="text-muted-foreground">Your communications</p>
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
                                                        {(message.sender_name || 'Admin').split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className="text-sm font-medium truncate">{message.sender_name || 'Admin'}</p>
                                                            <p className="text-xs text-muted-foreground whitespace-nowrap">
                                                                {message.created_at ? new Date(message.created_at).toLocaleDateString() : ''}
                                                            </p>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground truncate">{message.subject}</p>
                                                        <p className="text-xs text-muted-foreground/60 truncate mt-1">{message.body}</p>
                                                        {!message.is_read && (
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
                                    From: {selectedMessage.sender_name} • {selectedMessage.created_at ? new Date(selectedMessage.created_at).toLocaleString() : ''}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="p-4 bg-muted/50 rounded-lg">
                                        <p className="text-sm">{selectedMessage.body}</p>
                                    </div>

                                    {/* Students and Teachers can only see Announcements, no reply section */}
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
    const { profile, setProfile } = useAuth();
    const { toast } = useToast();
    const [displayName, setDisplayName] = useState(profile?.display_name || '');
    const [solvedCount, setSolvedCount] = useState(0);
    const [generatedUsernames, setGeneratedUsernames] = useState<string[]>([]);
    const [genIndex, setGenIndex] = useState(0);

    const RANDOM_ADJECTIVES = ['Swift', 'Blue', 'Happy', 'Clever', 'Brave', 'Calm', 'Bright', 'Neon', 'Cyber', 'Pixel'];
    const RANDOM_NOUNS = ['Fox', 'Eagle', 'Panda', 'Tiger', 'Star', 'Moon', 'Comet', 'Ninja', 'Wizard', 'Robot'];

    useEffect(() => {
        const fetchStats = async () => {
            if (!profile?.id) return;
            try {
                const lastRerollAt = (profile as any).last_reroll_at || '1970-01-01T00:00:00Z';
                const { count } = await supabase
                    .from('results')
                    .select('*', { count: 'exact', head: true })
                    .eq('student_id', profile.id)
                    .gt('submitted_at', lastRerollAt);
                setSolvedCount(count || 0);
            } catch (e) { console.error(e); }
        };
        fetchStats();
    }, [profile]);

    const generateUsernames = async () => {
        // No restriction on rerolling names
        const newNames: string[] = [];
        while (newNames.length < 5) {
            const adj = RANDOM_ADJECTIVES[Math.floor(Math.random() * RANDOM_ADJECTIVES.length)];
            const noun = RANDOM_NOUNS[Math.floor(Math.random() * RANDOM_NOUNS.length)];
            const name = `${adj}-${noun}${Math.floor(Math.random() * 1000)}`;
            const { data } = await supabase.from('profiles').select('id').eq('display_name', name).limit(1);
            if (!data || data.length === 0) newNames.push(name);
        }
        setGeneratedUsernames(newNames);
        setGenIndex(0);
        setDisplayName(newNames[0]);
    };

    const cycleUsername = () => {
        const next = (genIndex + 1) % 5;
        setGenIndex(next);
        setDisplayName(generatedUsernames[next]);
    };

    const handleSave = async () => {
        if (!profile?.id) return;
        const updates: any = {
            display_name: displayName,
            updated_at: new Date().toISOString(),
        };
        if (displayName !== profile.display_name) {
            updates.last_reroll_at = new Date().toISOString();
        }
        const { error } = await supabase.from('profiles').update(updates).eq('id', profile.id);
        if (error) {
            toast({ title: 'Error saving profile', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Profile updated!' });
            if (setProfile) setProfile({ ...profile, ...updates });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-display font-bold">My Profile</h1>
                <p className="text-muted-foreground">Manage your student account</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col items-center pb-6">
                            <div className="w-24 h-24 rounded-full gradient-hero flex items-center justify-center text-4xl font-bold text-white overflow-hidden border-4 border-background shadow-lg mb-4">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    profile?.display_name?.substring(0, 2).toUpperCase() || 'US'
                                )}
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">{profile?.email}</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Username</Label>
                            <div className="flex gap-2">
                                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="CoolUser123" />
                                {generatedUsernames.length > 0 ? (
                                    <Button variant="outline" onClick={cycleUsername}>
                                        {genIndex + 1}/5
                                    </Button>
                                ) : (
                                    <Button variant="outline" onClick={generateUsernames} title="Generate 5 Random Usernames">
                                        <RefreshCw className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                {profile?.display_name ? 'Rerolls available anytime' : 'Generate 5 names to start'}
                            </p>
                        </div>

                        <Button onClick={handleSave} className="w-full gradient-hero mt-4">Save Changes</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Score</p>
                            <p className="text-2xl font-bold">{profile?.score?.toLocaleString() || '0'}</p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Progress</p>
                            <p className="text-2xl font-bold">{profile?.progress?.toLocaleString() || '0'}%</p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Competitions Joined</p>
                            <p className="text-2xl font-bold">0</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// 1v1 Feature Components
function DuelInviteDialog({ open, onOpenChange, profile }: any) {
    const [targetUsername, setTargetUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSendInvite = async () => {
        if (!targetUsername.trim()) return;
        setLoading(true);
        try {
            const { data: users, error: userError } = await supabase
                .from('profiles')
                .select('*')
                .ilike('display_name', targetUsername.trim())
                .eq('role', 'student')
                .limit(1);

            if (userError) throw userError;
            if (!users || users.length === 0) {
                toast({ title: 'User not found', description: 'Could not find a student with that username.', variant: 'destructive' });
                setLoading(false);
                return;
            }

            const targetUser = users[0];
            if (targetUser.id === profile.id) {
                toast({ title: 'Invalid Target', description: 'You cannot challenge yourself.', variant: 'destructive' });
                setLoading(false);
                return;
            }

            const { data: qs } = await supabase.from('questions').select('id, points').limit(100);
            if (!qs || qs.length < 10) {
                toast({ title: 'Insufficient Questions', description: `Not enough questions available (Need 10, found ${qs?.length || 0}). Come back when there are more questions.`, variant: 'destructive' });
                setLoading(false);
                return;
            }

            const shuffled = qs.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, 10);
            const selectedIds = selected.map(q => q.id);
            const totalPoints = selected.reduce((sum, q) => sum + (q.points || 10), 0);

            const { error: duelError } = await supabase.from('duels').insert({
                challenger_id: profile.id,
                challenged_id: targetUser.id,
                status: 'pending',
                question_ids: selectedIds,
                total_points: totalPoints
            });

            if (duelError) throw duelError;

            toast({ title: 'Challenge Sent!', description: `Waiting for ${targetUser.display_name} to accept.` });
            onOpenChange(false);
        } catch (e: any) {
            toast({ title: 'Error', description: e.message, variant: 'destructive' });
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Challenge a Friend</DialogTitle>
                    <DialogDescription>Enter your friend's exact username to send a 1v1 practice challenge. The match will have 10 random questions.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label>Username</Label>
                        <Input
                            placeholder="Enter username..."
                            value={targetUsername}
                            onChange={(e) => setTargetUsername(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button className="gradient-hero" onClick={handleSendInvite} disabled={loading || !targetUsername.trim()}>
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Send Challenge
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function DuelQuizInterface({ duel, onExit }: any) {
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [finished, setFinished] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [questionTimeLeft, setQuestionTimeLeft] = useState<number | null>(null);
    const [localScore, setLocalScore] = useState(0);
    const [liveDuel, setLiveDuel] = useState<any>(duel);
    const [maxLockedIndex, setMaxLockedIndex] = useState(-1);

    const { profile } = useAuth();
    const { toast } = useToast();
    const [isForfeitConfirmOpen, setIsForfeitConfirmOpen] = useState(false);

    // Determine role
    const isChallenger = liveDuel.challenger_id === profile?.id;

    useEffect(() => {
        const fetchQs = async () => {
            setLoading(true);
            try {
                const { data } = await supabase.from('questions').select('*').in('id', duel.question_ids);
                if (data) {
                    const sorted = duel.question_ids.map((id: string) => data.find(q => q.id === id)).filter(Boolean);
                    setQuestions(sorted);
                }
            } catch (e: any) {
                toast({ title: 'Error loading duel questions', description: e.message, variant: 'destructive' });
            }
            setLoading(false);
        };
        fetchQs();

        // Listen for duel updates (to see when opponent finishes)
        const channel = supabase.channel(`duel_${duel.id}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'duels', filter: `id=eq.${duel.id}` }, (payload) => {
                setLiveDuel(payload.new);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [duel.id, duel.question_ids]);

    useEffect(() => {
        if (liveDuel.status === 'forfeited' && liveDuel.forfeited_by && liveDuel.forfeited_by !== profile?.id) {
            console.log("URGENT: Forfeit detected inside DuelQuizInterface", liveDuel);
            toast({
                title: 'Match Terminated',
                description: `${liveDuel.forfeited_name || 'Your opponent'} has forfeited..`,
                duration: 10000
            });
            onExit();
        }
    }, [liveDuel.status, liveDuel.forfeited_by, liveDuel.forfeited_name, profile?.id, onExit]);

    const q = questions[currentQuestionIndex];

    // Timer logic copied from QuizInterface roughly
    useEffect(() => {
        if (!q || finished) return;
        if ((q.timer || 0) > 0 && questionTimeLeft === null) {
            setQuestionTimeLeft(q.timer);
        }
        if (questionTimeLeft === null || questionTimeLeft <= 0) {
            if (questionTimeLeft === 0) {
                setMaxLockedIndex(prev => Math.max(prev, currentQuestionIndex));
                handleNextOrSubmit();
            }
            return;
        }
        const timer = setInterval(() => {
            setQuestionTimeLeft(prev => prev !== null ? prev - 1 : null);
        }, 1000);
        return () => clearInterval(timer);
    }, [questionTimeLeft, currentQuestionIndex, questions, finished]);

    useEffect(() => {
        // Force 10s timer if none set
        setQuestionTimeLeft(q?.timer > 0 ? q.timer : 10);
    }, [currentQuestionIndex, questions]);

    const handleAnswer = (val: string) => {
        if (!q) return;
        setAnswers(prev => ({ ...prev, [q.id]: val }));
    };

    const handleNextOrSubmit = () => {
        if (q?.timer > 0) {
            setMaxLockedIndex(prev => Math.max(prev, currentQuestionIndex));
        }
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(c => c + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);
        let calcScore = 0;
        for (const qObj of questions) {
            if (!qObj) continue;
            const ans = answers[qObj.id];
            if (qObj.type === 'slide') {
                calcScore += (qObj.points || 10);
            } else if (qObj.type === 'text') {
                const sAns = (ans || '').trim();
                const mAns = (qObj.correct_answer || '').trim();
                if (sAns.length > 0) {
                    const isCorrect = qObj.exact_match_required ? (sAns === mAns) : (sAns.toLowerCase() === mAns.toLowerCase());
                    if (isCorrect) calcScore += (qObj.points || 10);
                }
            } else {
                if (ans === qObj.correct_answer) {
                    calcScore += (qObj.points || 10);
                }
            }
        }
        setLocalScore(calcScore);

        try {
            const updates: any = {};
            if (isChallenger) {
                updates.challenger_score = calcScore;
                updates.challenger_answers = answers;
                updates.challenger_done = true;
            } else {
                updates.challenged_score = calcScore;
                updates.challenged_answers = answers;
                updates.challenged_done = true;
            }
            const { data } = await supabase.from('duels').update(updates).eq('id', duel.id).select().single();
            if (data) setLiveDuel(data);
            setFinished(true);
        } catch (e: any) {
            toast({ title: 'Error submitting duel', description: e.message, variant: 'destructive' });
        }
        setSubmitting(false);
    };

    if (loading) return <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /><p className="mt-2 text-muted-foreground">Loading Duel...</p></div>;

    if (finished) {
        const opponentDone = isChallenger ? liveDuel.challenged_done : liveDuel.challenger_done;
        const myScore = isChallenger ? liveDuel.challenger_score : liveDuel.challenged_score;
        const opScore = isChallenger ? liveDuel.challenged_score : liveDuel.challenger_score;

        let resultMsg = "Waiting for opponent...";
        let resultColor = "text-muted-foreground";
        if (opponentDone) {
            if (myScore > opScore) { resultMsg = "You Won! 🎉"; resultColor = "text-success"; }
            else if (myScore < opScore) { resultMsg = "You Lost! 😔"; resultColor = "text-destructive"; }
            else { resultMsg = "It's a Tie! 🤝"; resultColor = "text-warning"; }
        }

        return (
            <div className="max-w-2xl mx-auto p-6 mt-12">
                <Card className="text-center overflow-hidden">
                    <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-8 border-b border-border/50">
                        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Crown className="w-10 h-10 text-primary" />
                        </div>
                        <h2 className="text-3xl font-display font-bold mb-2">Duel Complete</h2>
                        <p className={`text-xl font-bold ${resultColor}`}>{resultMsg}</p>
                    </div>
                    <CardContent className="pt-8">
                        <div className="flex justify-around items-center mb-8">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground mb-1">Your Score</p>
                                <p className="text-4xl font-bold text-primary">{myScore}</p>
                                <p className="text-xs text-muted-foreground mt-1">out of {liveDuel.total_points}</p>
                            </div>
                            <div className="text-3xl font-bold text-muted-foreground/30">VS</div>
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground mb-1">Opponent Score</p>
                                {opponentDone ? (
                                    <>
                                        <p className="text-4xl font-bold">{opScore}</p>
                                        <p className="text-xs text-muted-foreground mt-1">out of {liveDuel.total_points}</p>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-[52px]">
                                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <Button className="w-full gradient-hero" onClick={onExit}>
                            Return to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const confirmForfeit = async () => {
        setIsForfeitConfirmOpen(false);
        try {
            await supabase.from('duels').update({
                status: 'forfeited',
                forfeited_by: profile?.id,
                forfeited_name: profile?.display_name || 'Someone'
            }).eq('id', duel.id);
            onExit();
        } catch (e) {
            onExit(); // Exit anyway if update fails
        }
    };

    const handleForfeit = () => {
        setIsForfeitConfirmOpen(true);
    };

    if (!q) return null;

    const currentAnswer = answers[q.id];
    const canProgress = !q.is_required || (currentAnswer !== undefined && currentAnswer.trim() !== '' || q.type === 'slide');

    return (
        <div className="w-full h-screen bg-background flex flex-col items-center justify-center p-4">
            <Card className="w-full max-w-4xl shadow-2xl relative overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-500">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-muted">
                    <div className="bg-primary h-full transition-all" style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}></div>
                </div>
                <CardHeader className="bg-muted/30 border-b border-border/50 space-y-4">
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" size="sm" onClick={handleForfeit} className="text-muted-foreground hover:text-destructive transition-colors">
                            <XCircle className="w-4 h-4 mr-2" /> Forfeit Duel
                        </Button>
                        <span className="text-muted-foreground text-sm font-medium">Question {currentQuestionIndex + 1} of {questions.length}</span>
                    </div>
                    <div className="flex items-center gap-4 ml-auto">
                        {questionTimeLeft !== null && questionTimeLeft >= 0 ? (
                            <div className="flex flex-col items-end gap-1">
                                <div className={`flex items-center gap-2 font-mono font-bold ${questionTimeLeft <= 5 ? 'text-destructive animate-pulse' : 'text-primary'}`}>
                                    <Clock className="w-4 h-4" /> {questionTimeLeft}s
                                </div>
                                <div className="w-24 bg-muted h-1.5 rounded-full overflow-hidden">
                                     <div className="bg-destructive h-full transition-all duration-1000 ease-linear" style={{ width: `${(questionTimeLeft / (q?.timer > 0 ? q.timer : 10)) * 100}%` }}></div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 font-mono font-bold text-muted-foreground">
                                <Clock className="w-4 h-4" /> Unlimited
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-8 flex-grow">
                    <h2 className="text-2xl font-bold mb-8 leading-relaxed max-w-3xl pl-4 border-l-4 border-primary">{q.text}</h2>
                    <div className="space-y-4">
                        {q.type === 'slide' ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Presentation className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>Viewing Slide. Click Next when done.</p>
                            </div>
                        ) : q.type === 'mcq' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(q.options || []).map((option: string, i: number) => {
                                    const isSelected = currentAnswer === option;
                                    return (
                                        <button key={i} onClick={() => handleAnswer(option)}
                                            className={`p-6 rounded-xl border-2 text-left transition-all ${isSelected ? 'border-primary bg-primary/10 shadow-md ring-2 ring-primary/20 scale-[1.02]' : 'border-border hover:border-primary/50 hover:bg-muted/50'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{String.fromCharCode(65 + i)}</div>
                                                <span className={`font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>{option}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <Textarea className="min-h-[150px] text-lg p-6 bg-muted/30 focus:bg-background transition-colors" placeholder="Type your answer here..."
                                value={currentAnswer || ''} onChange={(e) => handleAnswer(e.target.value)}
                            />
                        )}
                    </div>
                </CardContent>
                <div className="p-6 flex justify-between border-t border-border/50 bg-muted/10">
                    <Button variant="outline" disabled={currentQuestionIndex === 0 || questionTimeLeft !== null || currentQuestionIndex - 1 <= maxLockedIndex} onClick={() => setCurrentQuestionIndex(cur => cur - 1)} className="h-10 px-6 rounded-xl"><ChevronRight className="w-4 h-4 mr-2 rotate-180" /> Previous</Button>
                    {currentQuestionIndex < questions.length - 1 ? (
                        <Button onClick={handleNextOrSubmit} disabled={!canProgress} className="h-10 px-6 rounded-xl gradient-hero shadow-lg">Next <ChevronRight className="w-4 h-4 ml-2" /></Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={!canProgress || submitting} className="h-10 px-6 rounded-xl gradient-hero shadow-lg">
                            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />} Submit Duel
                        </Button>
                    )}
                </div>
            </Card>

            <AlertDialog open={isForfeitConfirmOpen} onOpenChange={setIsForfeitConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to forfeit?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Your opponent will win automatically and you will lose any progress made in this duel.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Continue Match</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmForfeit} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Confirm Forfeit
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}