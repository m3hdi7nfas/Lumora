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
import { supabase } from '@/integrations/supabase/client';

function StudentSidebar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const { profile } = useAuth();
  const navItems = [
    { id: 'overview', icon: Users, label: 'Overview' },
    { id: 'competitions', icon: Trophy, label: 'Competitions' },
    { id: 'practice', icon: LayoutTemplate, label: 'Practice' },
    { id: 'challenges', icon: FileQuestion, label: 'Challenges' },
    { id: 'leaderboard', icon: CheckSquare, label: 'Leaderboard' },
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
              {profile?.display_name?.substring(0, 2).toUpperCase() || 'ST'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{profile?.display_name || 'Student'}</p>
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

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  return (
    <DashboardLayout
      title="Lumora Student Dashboard"
      sidebar={<StudentSidebar activeTab={activeTab} setActiveTab={setActiveTab} />}
    >
      {activeTab === 'overview' && <StudentOverviewTab setActiveTab={setActiveTab} loading={loading} />}
      {activeTab === 'competitions' && <CompetitionsTab />}
      {activeTab === 'practice' && <PracticeTab />}
      {activeTab === 'challenges' && <ChallengesTab />}
      {activeTab === 'leaderboard' && <LeaderboardTab />}
      {activeTab === 'messages' && <MessagesTab />}
      {activeTab === 'profile' && <ProfileView />}
    </DashboardLayout>
  );
}

// Student Overview Component
function StudentOverviewTab({ setActiveTab, loading }: { setActiveTab: (tab: string) => void, loading: boolean }) {
  const { toast } = useToast();
  const { profile } = useAuth();

  // Get stats from local storage
  const competitions = localStorage.getItem('lumora_competitions') ? JSON.parse(localStorage.getItem('lumora_competitions')) : [];
  const questions = localStorage.getItem('lumora_questions') ? JSON.parse(localStorage.getItem('lumora_questions')) : [];

  const stats = {
    totalCompetitions: competitions.length,
    totalQuestions: questions.length,
    score: profile?.score || 0,
    progress: profile?.progress || 0
  };

  const quickActions = [
    { id: 'competitions', icon: Trophy, title: 'Join Competitions', description: 'Participate in learning challenges' },
    { id: 'challenges', icon: FileQuestion, title: 'Complete Challenges', description: 'Earn extra points and badges' },
    { id: 'leaderboard', icon: CheckSquare, title: 'View Leaderboard', description: 'See how you rank against others' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Student Dashboard</h1>
          <p className="text-muted-foreground">Track your learning progress and achievements</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Competitions"
          value={stats.totalCompetitions.toString()}
          icon={Trophy}
          className="bg-primary/10 border-primary/20"
        />
        <StatCard
          title="Total Questions"
          value={stats.totalQuestions.toLocaleString()}
          icon={FileQuestion}
          className="bg-accent/10 border-accent/20"
        />
        <StatCard
          title="Your Score"
          value={stats.score.toLocaleString()}
          icon={Star}
          className="bg-success/10 border-success/20"
        />
        <StatCard
          title="Progress"
          value={`${stats.progress}%`}
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
                  onClick={() => setActiveTab(action.id)}
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

// Practice Tab Component
function PracticeTab() {
  const [practiceSets, setPracticeSets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSet, setActiveSet] = useState(null);

  useEffect(() => {
    const sets = localStorage.getItem('lumora_practice_sets') ? JSON.parse(localStorage.getItem('lumora_practice_sets')) : [];
    setPracticeSets(sets);
  }, []);

  if (activeSet) {
    return <QuizInterface questionSet={activeSet} onExit={() => setActiveSet(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Practice Mode</h1>
          <p className="text-muted-foreground">Improve your skills with self-paced learning</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {practiceSets.map((set: any) => (
          <Card key={set.id} className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg">{set.name}</CardTitle>
              <CardDescription className="text-xs line-clamp-2">{set.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">{set.category}</span>
              </div>
              <Button className="w-full gradient-hero h-9 text-sm" onClick={() => setActiveSet(set)}>Attempt Practice</Button>
            </CardContent>
          </Card>
        ))}
        {practiceSets.length === 0 && (
          <Card className="col-span-full p-12 text-center text-muted-foreground border-dashed">
            <p className="text-lg font-medium text-foreground mb-2">No Practice Sets Yet</p>
            <p>Check back later for new self-paced content from your teachers or admins.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

function QuizInterface({ questionSet, onExit }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const { profile } = useAuth();
  const { toast } = useToast();

  const questions = questionSet.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (val) => {
    setAnswers({ ...answers, [currentQuestion.id]: val });
  };

  const handleSubmit = () => {
    if (!finished) {
      // Calculate Score
      let calculatedScore = 0;
      let totalPoints = 0;

      questions.forEach(q => {
        totalPoints += (q.points || 10);
        const studentAns = answers[q.id];

        if (q.type === 'text') {
          const studentAns = (answers[q.id] || '').trim();
          const modelAns = (q.correct_answer || '').trim();

          if (studentAns.length > 0) {
            let isCorrect = false;

            if (q.exact_match_required) {
              isCorrect = studentAns === modelAns;
            } else {
              isCorrect = studentAns.toLowerCase() === modelAns.toLowerCase();
            }

            if (isCorrect) {
              calculatedScore += (q.points || 10);
            } else {
              // Create Grading Request for manual review if it didn't match
              const gradingRequest = {
                id: `grad-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                student_id: profile.id,
                student_name: profile.display_name,
                question_set_id: questionSet.id,
                question_set_name: questionSet.name,
                question_id: q.id,
                question_text: q.text,
                answer: studentAns,
                max_points: q.points || 10,
                model_answer: q.correct_answer,
                status: 'pending',
                submitted_at: new Date().toISOString()
              };

              const queue = localStorage.getItem('lumora_grading_queue') ? JSON.parse(localStorage.getItem('lumora_grading_queue')) : [];
              queue.push(gradingRequest);
              localStorage.setItem('lumora_grading_queue', JSON.stringify(queue));
            }
          }
        } else {
          if (answers[q.id] === q.correct_answer) {
            calculatedScore += (q.points || 10);
          }
        }
      });

      setScore(calculatedScore);
      setFinished(true);

      // Save Results
      const result = {
        id: `res-${Date.now()}`,
        student_id: profile.id,
        question_set_id: questionSet.id,
        score: calculatedScore,
        total_points: totalPoints,
        answers: answers,
        date: new Date().toISOString()
      };

      const allResults = localStorage.getItem('lumora_results') ? JSON.parse(localStorage.getItem('lumora_results')) : [];
      allResults.push(result);
      localStorage.setItem('lumora_results', JSON.stringify(allResults));

      // Update User Profile Score based on strategy
      // We calculate the 'effective points' this set contributes to the total score
      const previousSetResults = allResults.filter(r => r.student_id === profile.id && r.question_set_id === questionSet.id && r.id !== result.id);

      let previousEffectiveScore = 0;
      if (previousSetResults.length > 0) {
        const scores = previousSetResults.map(r => r.score);
        if (questionSet.scoring_type === 'best_of_3') {
          // Be careful: if we are at attempt 4 (which shouldn't happen if UI blocks it), we take max of first 3? 
          // UI logic blocks starting attempt 4. So we just look at max of existing.
          previousEffectiveScore = Math.max(...scores);
        } else if (questionSet.scoring_type === 'first_attempt') {
          // Should be just the first one.
          previousEffectiveScore = scores[0];
        } else {
          // Default Highest
          previousEffectiveScore = Math.max(...scores);
        }
      }

      let newEffectiveScore = 0;
      // Include current result
      const allSetResultsIncludingCurrent = [...previousSetResults, result];
      const allScores = allSetResultsIncludingCurrent.map(r => r.score);

      if (questionSet.scoring_type === 'best_of_3') {
        // If somehow we have more than 3, we strictly only count first 3. But UI blocks start. 
        // Let's assume valid attempts.
        newEffectiveScore = Math.max(...allScores);
      } else if (questionSet.scoring_type === 'first_attempt') {
        newEffectiveScore = allScores[0];
      } else {
        // Highest
        newEffectiveScore = Math.max(...allScores);
      }

      const scoreDelta = Math.max(0, newEffectiveScore - previousEffectiveScore);

      if (scoreDelta > 0) {
        const users = JSON.parse(localStorage.getItem('lumora_users') || '[]');
        const updatedUsers = users.map(u => {
          if (u.id === profile.id) {
            return { ...u, score: (u.score || 0) + scoreDelta, progress: Math.min((u.progress || 0) + 10, 100) };
          }
          return u;
        });
        localStorage.setItem('lumora_users', JSON.stringify(updatedUsers));
        toast({ title: `Quiz Completed! You earned ${scoreDelta} new points!` });
      } else {
        toast({ title: `Quiz Completed! Score: ${calculatedScore}. (Writing answers pending grading)` });
      }
    } else {
      onExit();
    }
  };

  if (questions.length === 0) return <div className="p-8 text-center">No questions in this set <Button onClick={onExit} variant="link">Go Back</Button></div>;

  if (finished) {
    return (
      <Card className="max-w-2xl mx-auto mt-8 text-center">
        <CardHeader>
          <CardTitle className="text-3xl">Set Completed!</CardTitle>
          <CardDescription>You scored</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-6xl font-bold text-primary">{score}</div>
          <p className="text-muted-foreground">Total Points Available: {questions.reduce((a, b) => a + (b.points || 10), 0)}</p>

          <div className="p-4 bg-muted rounded-lg text-left text-sm max-h-60 overflow-y-auto">
            <p className="font-semibold mb-2">Review:</p>
            {questions.map((q, i) => (
              <div key={q.id} className="mb-2 border-b pb-2 last:border-0">
                <p className="font-medium">{i + 1}. {q.text}</p>
                <p className={`text-xs ${answers[q.id] === q.correct_answer ? 'text-success' : 'text-destructive'}`}>
                  Your Answer: {answers[q.id] || '(Skipped)'}
                  {q.type === 'mcq' && answers[q.id] !== q.correct_answer && ` (Correct: ${q.correct_answer})`}
                </p>
              </div>
            ))}
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
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{questionSet.name}</CardTitle>
          <span className="text-muted-foreground text-sm">Question {currentQuestionIndex + 1} of {questions.length}</span>
        </div>
        <div className="w-full bg-muted h-2 rounded-full overflow-hidden mt-2">
          <div className="bg-primary h-full transition-all" style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}></div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-lg font-medium">{currentQuestion.text}</div>

        <div className="space-y-4">
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
      <div className="p-6 flex justify-between">
        <Button
          variant="outline"
          disabled={currentQuestionIndex === 0}
          onClick={() => setCurrentQuestionIndex(curr => curr - 1)}
        >
          Previous
        </Button>
        {currentQuestionIndex < questions.length - 1 ? (
          <Button onClick={() => setCurrentQuestionIndex(curr => curr + 1)}>Next</Button>
        ) : (
          <Button onClick={handleSubmit} className="gradient-hero">Submit Set</Button>
        )}
      </div>
    </Card>
  );
}

// Competitions Tab Component
function CompetitionsTab() {
  const [competitions, setCompetitions] = useState([]);
  const [joinedCompIds, setJoinedCompIds] = useState([]);
  const [selectedComp, setSelectedComp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'find' | 'participating'>('participating');
  const [practiceSets, setPracticeSets] = useState([]); // Added practiceSets state
  const { toast } = useToast();
  const { profile } = useAuth();

  const fetchCompetitions = async () => {
    setLoading(true);
    try {
      const competitionsData = localStorage.getItem('lumora_competitions') ? JSON.parse(localStorage.getItem('lumora_competitions')) : [];
      setCompetitions(competitionsData);

      const allJoined = localStorage.getItem('lumora_joined_competitions') ? JSON.parse(localStorage.getItem('lumora_joined_competitions')) : [];
      const userJoined = allJoined.filter(jc => jc.user_id === profile.id).map(jc => jc.competition_id);
      setJoinedCompIds(userJoined);

      const pSets = localStorage.getItem('lumora_practice_sets') ? JSON.parse(localStorage.getItem('lumora_practice_sets')) : [];
      setPracticeSets(pSets);
    } catch (error) {
      toast({ title: 'Error fetching competitions', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const handleJoin = (compId) => {
    try {
      const allJoined = localStorage.getItem('lumora_joined_competitions') ? JSON.parse(localStorage.getItem('lumora_joined_competitions')) : [];
      if (!allJoined.some(jc => jc.user_id === profile.id && jc.competition_id === compId)) {
        allJoined.push({ user_id: profile.id, competition_id: compId });
        localStorage.setItem('lumora_joined_competitions', JSON.stringify(allJoined));

        // Refresh local state
        setJoinedCompIds(prev => [...prev, compId]);

        toast({ title: 'Joined competition successfully!' });
      }
    } catch (e) { toast({ title: 'Error joining' }); }
  };

  const handleLeave = (compId) => {
    try {
      const allJoined = localStorage.getItem('lumora_joined_competitions') ? JSON.parse(localStorage.getItem('lumora_joined_competitions')) : [];
      const updatedJoined = allJoined.filter(jc => !(jc.user_id === profile.id && jc.competition_id === compId));
      localStorage.setItem('lumora_joined_competitions', JSON.stringify(updatedJoined));

      // Refresh local state
      setJoinedCompIds(prev => prev.filter(id => id !== compId));

      toast({ title: 'Left competition successfully!' });
    } catch (e) { toast({ title: 'Error leaving' }); }
  };

  if (selectedComp) {
    return <CompetitionDetailView competition={selectedComp} onBack={() => setSelectedComp(null)} />;
  }

  const myCompetitions = competitions.filter(c => {
    const isJoinedManually = joinedCompIds.includes(c.id);
    const isAssignedBySchool = c.participating_schools?.includes(profile?.school_id);
    return (isJoinedManually || isAssignedBySchool) && (c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const discoverCompetitions = competitions.filter(c => {
    const isJoinedManually = joinedCompIds.includes(c.id);
    const isAssignedBySchool = c.participating_schools?.includes(profile?.school_id);
    return !isJoinedManually && !isAssignedBySchool && c.is_active && (c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Competitions</h1>
          <p className="text-muted-foreground">Manage your competitions and discover new ones</p>
        </div>
        <div className="flex bg-muted p-1 rounded-lg">
          <Button
            variant={viewMode === 'participating' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('participating')}
            className="rounded-md h-8 text-xs px-4"
          >
            Participating
          </Button>
          <Button
            variant={viewMode === 'find' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('find')}
            className="rounded-md h-8 text-xs px-4"
          >
            Find Competitions
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search competitions..."
          className="pl-10 h-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {viewMode === 'participating' ? (
        <div className="space-y-6">
          {myCompetitions.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground border-dashed">
              <p>You haven't joined any competitions yet.</p>
              <Button variant="link" className="mt-2" onClick={() => setViewMode('find')}>
                Explore open competitions
              </Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCompetitions.map(comp => {
                const isMandatory = comp.participating_schools?.includes(profile?.school_id) || comp.can_leave === false;

                return (
                  <Card key={comp.id} className="hover:border-primary/50 transition-colors flex flex-col">
                    <CardHeader className="flex-1 pb-2">
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-lg">{comp.name}</CardTitle>
                        {isMandatory && <span className="px-2 py-0.5 rounded-full bg-warning/10 text-warning text-[10px] font-bold">MANDATORY</span>}
                      </div>
                      <CardDescription className="line-clamp-2 text-xs">{comp.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-col gap-2 mt-4">
                        <Button className="w-full h-9 gradient-hero text-sm" onClick={() => setSelectedComp(comp)}>
                          Participate
                        </Button>
                        {!isMandatory && (
                          <Button variant="outline" size="sm" className="w-full text-xs text-destructive hover:bg-destructive/5" onClick={(e) => { e.stopPropagation(); handleLeave(comp.id); }}>
                            Leave Competition
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {discoverCompetitions.map(comp => (
              <Card key={comp.id} className="flex flex-col">
                <CardHeader className="flex-1 pb-2">
                  <CardTitle className="text-lg">{comp.name}</CardTitle>
                  <CardDescription className="line-clamp-2 text-xs">{comp.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] uppercase font-bold">{comp.category || 'General'}</span>
                  </div>
                  <Button className="w-full h-9 gradient-hero text-sm" onClick={() => handleJoin(comp.id)}>Join Competition</Button>
                </CardContent>
              </Card>
            ))}
            {discoverCompetitions.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground border border-dashed rounded-lg">
                No new competitions found to join.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CompetitionDetailView({ competition, onBack }) {
  const [questionSets, setQuestionSets] = useState([]);
  const [activeSet, setActiveSet] = useState(null);
  const { profile } = useAuth();

  useEffect(() => {
    const allSets = localStorage.getItem('lumora_question_sets') ? JSON.parse(localStorage.getItem('lumora_question_sets')) : [];
    // Only show sets that are linked to this competition id OR its participating schools if applicable
    // In our current local storage setup, question sets have question_set_id which might match competition id in some logic
    // Let's filter by matching competition_id from the set object if it exists
    const filtered = allSets.filter(set => set.competition_id === competition.id);
    setQuestionSets(filtered);
  }, [competition.id]);

  if (activeSet) {
    return <QuizInterface questionSet={activeSet} onExit={() => setActiveSet(null)} />;
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-2">
        <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
        Back to Competitions
      </Button>

      <div>
        <h1 className="text-2xl font-display font-bold">{competition.name}</h1>
        <p className="text-muted-foreground">{competition.description}</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {questionSets.map(set => (
          <Card key={set.id}>
            <CardHeader>
              <CardTitle>{set.name}</CardTitle>
              <CardDescription>{set.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2"><FileQuestion className="w-4 h-4" /> {set.questions?.length || 0} Questions</div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {set.time_limit} mins</div>
              </div>
              <Button className="w-full gradient-hero" onClick={() => setActiveSet(set)}>Enter Question Set</Button>
            </CardContent>
          </Card>
        ))}
        {questionSets.length === 0 && (
          <div className="col-span-full p-12 text-center text-muted-foreground border rounded-lg">
            No question sets available for this competition yet.
          </div>
        )}
      </div>
    </div>
  );
}

// Challenges Tab Component
function ChallengesTab() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      // Fetch challenges from local storage - now empty by default
      const challengesData = localStorage.getItem('lumora_challenges') ? JSON.parse(localStorage.getItem('lumora_challenges')) : [];
      setChallenges(challengesData);
    } catch (error) {
      toast({ title: 'Error fetching challenges', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Challenges</h1>
          <p className="text-muted-foreground">Complete challenges to earn extra points</p>
        </div>
        <Button
          className="gradient-hero"
          onClick={() => toast({ title: "Coming Soon!", description: "1v1 Friends feature is currently under development.", variant: "default" })}
        >
          <Users className="w-4 h-4 mr-2" />
          1v1 Friend
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Challenges</CardTitle>
          <CardDescription>Complete these to earn points and badges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </div>
            ) : challenges.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No challenges available</p>
            ) : (
              challenges.map((challenge) => (
                <div key={challenge.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{challenge.name}</h3>
                      <p className="text-xs text-muted-foreground">{challenge.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">{challenge.category}</span>
                        <span className="px-2 py-1 rounded-full text-xs bg-success/10 text-success">{challenge.points} pts</span>
                      </div>
                    </div>
                    <Button size="sm" className="gradient-hero">
                      Start
                    </Button>
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

// Leaderboard Tab Component
function LeaderboardTab() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompId, setSelectedCompId] = useState('all');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Fetch competitions
      const comps = localStorage.getItem('lumora_competitions') ? JSON.parse(localStorage.getItem('lumora_competitions')) : [];
      setCompetitions(comps);

      // Fetch leaderboard data from local storage
      const usersData = localStorage.getItem('lumora_users') ? JSON.parse(localStorage.getItem('lumora_users')) : [];

      // Filter by competition if selected, exclude non-students
      let filteredData = usersData.filter(u => u.role === 'student');

      if (selectedCompId !== 'all') {
        const results = localStorage.getItem('lumora_results') ? JSON.parse(localStorage.getItem('lumora_results')) : [];
        const compResults = results.filter(r => r.question_set_id === selectedCompId || r.competition_id === selectedCompId);

        // Map user IDs to their best score in this specific competition
        const userScores = {};
        compResults.forEach(r => {
          if (!userScores[r.student_id] || r.score > userScores[r.student_id]) {
            userScores[r.student_id] = r.score;
          }
        });

        filteredData = filteredData
          .filter(u => userScores[u.id] !== undefined)
          .map(u => ({ ...u, score: userScores[u.id] }));
      }

      // Sort by score descending
      const sortedUsers = filteredData.sort((a, b) => (b.score || 0) - (a.score || 0));
      setLeaderboardData(sortedUsers);
    } catch (error) {
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
          <h1 className="text-2xl font-display font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">See how you rank against others</p>
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
                    <th className="p-3 text-left font-medium">Email</th>
                    <th className="p-3 text-left font-medium">Username</th>
                    <th className="p-3 text-right font-medium">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((student, index) => (
                    <tr key={student.id} className="border-b border-border/50 last:border-none hover:bg-muted/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">{index + 1}</span>
                          {index === 0 && <Crown className="w-4 h-4 text-warning" />}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                            {student.email?.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm">{student.email}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm italic">{student.display_name || 'No username set'}</td>
                      <td className="p-3 text-right font-mono font-bold text-primary">{student.score?.toLocaleString() || '0'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* School Leaderboard Section */}
      <Card>
        <CardHeader>
          <CardTitle>School Leaderboard</CardTitle>
          <CardDescription>Schools with total combined points from active students</CardDescription>
        </CardHeader>
        <CardContent>
          <SchoolLeaderboard selectedCompId={selectedCompId} />
        </CardContent>
      </Card>
    </div>
  );
}

function SchoolLeaderboard({ selectedCompId }: { selectedCompId: string }) {
  const [schoolData, setSchoolData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSchools = async () => {
      setLoading(true);
      try {
        const schools = localStorage.getItem('lumora_schools') ? JSON.parse(localStorage.getItem('lumora_schools')) : [];
        const users = localStorage.getItem('lumora_users') ? JSON.parse(localStorage.getItem('lumora_users')) : [];
        const results = localStorage.getItem('lumora_results') ? JSON.parse(localStorage.getItem('lumora_results')) : [];

        const aggregatedSchools = schools.map(school => {
          const schoolStudents = users.filter(u => u.school_id === school.id);
          let totalPoints = 0;

          if (selectedCompId === 'all') {
            totalPoints = schoolStudents.reduce((sum, u) => sum + (u.score || 0), 0);
          } else {
            // Calculate based on specific competition
            schoolStudents.forEach(student => {
              const studentResults = results.filter(r => (r.question_set_id === selectedCompId || r.competition_id === selectedCompId) && r.student_id === student.id);
              if (studentResults.length > 0) {
                totalPoints += Math.max(...studentResults.map(r => r.score || 0));
              }
            });
          }

          return {
            ...school,
            totalPoints
          };
        });

        const sortedSchools = aggregatedSchools.sort((a, b) => b.totalPoints - a.totalPoints);
        setSchoolData(sortedSchools);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };

    fetchSchools();
  }, [selectedCompId]);

  return (
    <div className="overflow-x-auto">
      {loading ? (
        <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>
      ) : schoolData.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">No school data found for this competition.</p>
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
            {schoolData.map((school) => (
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
    message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchMessages = async () => {
    setLoading(true);
    try {
      // Mock data for messages
      const mockMessages = [
        {
          id: '1',
          sender: 'John Doe',
          senderEmail: 'john@example.com',
          subject: 'Question about competition',
          content: 'Hello, I have a question about the upcoming math competition...',
          date: '2025-06-01',
          read: false
        },
        {
          id: '2',
          sender: 'Jane Smith',
          senderEmail: 'jane@example.com',
          subject: 'Technical issue',
          content: 'I am having trouble accessing the practice questions...',
          date: '2025-05-30',
          read: true
        }
      ];
      setMessages(mockMessages);
    } catch (error) {
      toast({ title: 'Error fetching messages', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleSendReply = async () => {
    if (!replyContent || !selectedMessage) return;

    setSendingReply(true);

    try {
      // Mock send reply
      await new Promise(resolve => setTimeout(resolve, 1000));

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
      setMessages(messages.filter(msg => msg.id !== messageId));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
      toast({ title: 'Message deleted successfully!' });
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
                    <p className="text-sm">{selectedMessage.content}</p>
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
  const { profile } = useAuth();
  const { toast } = useToast();

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