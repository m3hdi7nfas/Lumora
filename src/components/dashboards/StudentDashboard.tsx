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
  Loader2,
  Users,
  Search,
  Unlock
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

function StudentSidebar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const { profile } = useAuth();
  const navItems = [
    { id: 'overview', icon: Trophy, label: 'Overview' },
    { id: 'competitions', icon: Trophy, label: 'Competitions' },
    { id: 'practice', icon: BookOpen, label: 'Practice' },
    { id: 'challenges', icon: Swords, label: 'Challenges' },
    { id: 'badges', icon: Award, label: 'Badges' },
    { id: 'messages', icon: Mail, label: 'Messages' },
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
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} className="w-10 h-10 rounded-full object-cover" alt="Profile" />
            ) : (
              <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-bold text-sm">
                {profile?.display_name?.substring(0, 2).toUpperCase() || profile?.email?.substring(0, 2).toUpperCase() || 'ST'}
              </div>
            )}
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
  const { profile, currentView, isAdminOrModerator } = useAuth();

  return (
    <DashboardLayout
      title="Lumora Student Dashboard"
      sidebar={<StudentSidebar activeTab={activeTab} setActiveTab={setActiveTab} />}
    >
      {activeTab === 'overview' && <StudentOverview />}
      {activeTab === 'competitions' && <CompetitionsTab />}
      {activeTab === 'practice' && <PracticeTab />}
      {activeTab === 'challenges' && <ChallengesTab />}
      {activeTab === 'badges' && <BadgesTab />}
      {activeTab === 'messages' && <MessagesTab />}
      {activeTab === 'profile' && <ProfileTab />}
    </DashboardLayout>
  );
}

// Student Overview Component
function StudentOverview() {
  const { profile, currentView, isAdminOrModerator } = useAuth();
  const { toast } = useToast();

  // Data will be loaded from API
  const stats = {
    totalScore: 0,
    competitionsJoined: 0,
    badgesEarned: 0,
    challengesWon: 0,
    practiceSessions: 0,
    recentActivity: []
  };

  const quickActions = [
    { id: 'competitions', icon: Trophy, title: 'Join Competition', description: 'Participate in active competitions' },
    { id: 'practice', icon: BookOpen, title: 'Practice Mode', description: 'Sharpen your skills' },
    { id: 'challenges', icon: Swords, title: 'Challenge Friends', description: '1v1 battles' },
    { id: 'badges', icon: Award, title: 'View Badges', description: 'See your achievements' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Student Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {profile?.display_name || 'Student'}!</p>
        {isAdminOrModerator && currentView && (
          <div className="mt-2 flex items-center gap-2 text-sm text-primary">
            <Eye className="w-4 h-4" />
            <span>Viewing as Student - Can access all schools and competitions</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Score"
          value={stats.totalScore.toLocaleString()}
          icon={Trophy}
          className="bg-primary/10 border-primary/20"
        />
        <StatCard
          title="Competitions"
          value={stats.competitionsJoined.toString()}
          icon={Trophy}
          className="bg-accent/10 border-accent/20"
        />
        <StatCard
          title="Badges Earned"
          value={stats.badgesEarned.toString()}
          icon={Award}
          className="bg-success/10 border-success/20"
        />
        <StatCard
          title="Challenges Won"
          value={stats.challengesWon.toString()}
          icon={Swords}
          className="bg-warning/10 border-warning/20"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Jump into learning activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <CardDescription>Your latest learning journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivity.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No recent activity</p>
            ) : (
              stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="p-2 rounded-lg bg-muted">
                    {activity.type === 'competition' && <Trophy className="w-4 h-4 text-primary" />}
                    {activity.type === 'practice' && <BookOpen className="w-4 h-4 text-primary" />}
                    {activity.type === 'challenge' && <Swords className="w-4 h-4 text-primary" />}
                    {activity.type === 'badge' && <Award className="w-4 h-4 text-primary" />}
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

// Competitions Tab Component
function CompetitionsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const { toast } = useToast();
  const { profile, currentView, isAdminOrModerator } = useAuth();

  // Data will be loaded from API
  const competitions = [];
  const filteredCompetitions = competitions.filter(comp =>
    comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleJoinCompetition = async (competitionId: string) => {
    try {
      // API call to join competition
      const { error } = await supabase.from('competition_participants').insert({
        competition_id: competitionId,
        user_id: profile?.id,
        joined_at: new Date().toISOString()
      });

      if (error) throw error;

      toast({ title: 'Successfully joined competition!' });
    } catch (error) {
      toast({ title: 'Error joining competition', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Competitions</h1>
        <p className="text-muted-foreground">Join active competitions and challenge yourself</p>
        {isAdminOrModerator && currentView && (
          <div className="mt-2 flex items-center gap-2 text-sm text-primary">
            <Unlock className="w-4 h-4" />
            <span>Admin/Moderator View - Can see all competitions including locked ones</span>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search competitions..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {filteredCompetitions.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No competitions found</p>
        ) : (
          filteredCompetitions.map((competition) => (
            <Card key={competition.id}>
              <CardHeader>
                <CardTitle>{competition.name}</CardTitle>
                <CardDescription>{competition.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{competition.start_date} - {competition.end_date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{competition.participants} participants</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Trophy className="w-4 h-4 text-muted-foreground" />
                    <span>{competition.prize}</span>
                  </div>
                  {competition.locked && !isAdminOrModerator && (
                    <div className="flex items-center gap-2 text-sm text-warning">
                      <Lock className="w-4 h-4" />
                      <span>This competition is locked</span>
                    </div>
                  )}
                  <Button
                    onClick={() => handleJoinCompetition(competition.id)}
                    className="w-full gradient-hero"
                    disabled={competition.locked && !isAdminOrModerator}
                  >
                    {competition.locked && !isAdminOrModerator ? 'Locked Competition' : 'Join Competition'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// Practice Tab Component
function PracticeTab() {
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { profile, currentView, isAdminOrModerator } = useAuth();

  // Data will be loaded from API
  const subjects = [];
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const questions = [];

  const filteredQuestions = questions.filter(q =>
    (selectedSubject === 'all' || q.subject === selectedSubject) &&
    (selectedDifficulty === 'all' || q.difficulty === selectedDifficulty)
  );

  const handleNextQuestion = async () => {
    if (filteredQuestions.length === 0) return;

    setLoading(true);
    setShowAnswer(false);

    try {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get a random question
      const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
      setCurrentQuestion(filteredQuestions[randomIndex]);
    } catch (error) {
      toast({ title: 'Error loading question', description: error.message, variant: 'destructive' });
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Practice Mode</h1>
        <p className="text-muted-foreground">Sharpen your skills with practice questions</p>
        {isAdminOrModerator && currentView && (
          <div className="mt-2 flex items-center gap-2 text-sm text-primary">
            <Eye className="w-4 h-4" />
            <span>Viewing as Student - Can access all practice questions</span>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Practice Settings</CardTitle>
          <CardDescription>Customize your practice session</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  {difficulties.map(difficulty => (
                    <SelectItem key={difficulty} value={difficulty.toLowerCase()}>{difficulty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleNextQuestion}
            disabled={loading || filteredQuestions.length === 0}
            className="mt-6 gradient-hero"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading Question...
              </>
            ) : (
              'Start Practice'
            )}
          </Button>
        </CardContent>
      </Card>

      {currentQuestion && (
        <Card>
          <CardHeader>
            <CardTitle>Question</CardTitle>
            <CardDescription>Answer the question to earn points</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="font-medium">{currentQuestion.question}</p>
                {currentQuestion.image && (
                  <img
                    src={currentQuestion.image}
                    alt="Question illustration"
                    className="mt-4 max-w-full h-auto rounded-lg"
                  />
                )}
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Options:</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {currentQuestion.options.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start text-left"
                      disabled={showAnswer}
                    >
                      <span className="mr-2 font-medium">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setShowAnswer(!showAnswer)}
                  variant="outline"
                  className="flex-1"
                >
                  {showAnswer ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      Hide Answer
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Show Answer
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleNextQuestion}
                  className="flex-1 gradient-hero"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Next Question'
                  )}
                </Button>
              </div>

              {showAnswer && (
                <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                  <p className="font-medium text-success">Correct Answer:</p>
                  <p className="mt-2">{currentQuestion.correct_answer}</p>
                  {currentQuestion.explanation && (
                    <div className="mt-3">
                      <p className="font-medium text-success">Explanation:</p>
                      <p className="text-sm text-muted-foreground mt-1">{currentQuestion.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Challenges Tab Component
function ChallengesTab() {
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const { toast } = useToast();
  const { profile, currentView, isAdminOrModerator } = useAuth();

  const filteredActiveChallenges = activeChallenges.filter(challenge =>
    challenge.opponent.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCompletedChallenges = completedChallenges.filter(challenge =>
    challenge.opponent.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAcceptChallenge = async (challengeId: string) => {
    try {
      // API call to accept challenge
      const { error } = await supabase.from('challenges').update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      }).eq('id', challengeId);

      if (error) throw error;

      toast({ title: 'Challenge accepted!' });
      setActiveChallenges(activeChallenges.map(c =>
        c.id === challengeId ? { ...c, status: 'accepted' } : c
      ));
    } catch (error) {
      toast({ title: 'Error accepting challenge', description: error.message, variant: 'destructive' });
    }
  };

  const handleCompleteChallenge = async (challengeId: string, score: number) => {
    try {
      // API call to complete challenge
      const { error } = await supabase.from('challenges').update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        winner_id: profile?.id,
        challenger_score: score
      }).eq('id', challengeId);

      if (error) throw error;

      toast({ title: 'Challenge completed!' });
      setActiveChallenges(activeChallenges.filter(c => c.id !== challengeId));
      setCompletedChallenges([...completedChallenges, {
        id: challengeId,
        opponent: selectedChallenge.opponent,
        score,
        date: new Date().toISOString(),
        result: 'won'
      }]);
    } catch (error) {
      toast({ title: 'Error completing challenge', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Challenges</h1>
        <p className="text-muted-foreground">Challenge your friends to 1v1 battles</p>
        {isAdminOrModerator && currentView && (
          <div className="mt-2 flex items-center gap-2 text-sm text-primary">
            <Eye className="w-4 h-4" />
            <span>Viewing as Student - Can see all challenges</span>
          </div>
        )}
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Challenges</TabsTrigger>
          <TabsTrigger value="completed">Completed Challenges</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search challenges..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {filteredActiveChallenges.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No active challenges</p>
            ) : (
              filteredActiveChallenges.map((challenge) => (
                <Card key={challenge.id}>
                  <CardHeader>
                    <CardTitle>Challenge from {challenge.opponent}</CardTitle>
                    <CardDescription>Status: {challenge.status}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>Created: {challenge.created_at}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Trophy className="w-4 h-4 text-muted-foreground" />
                        <span>Prize: {challenge.prize} points</span>
                      </div>

                      {challenge.status === 'pending' && (
                        <Button
                          onClick={() => handleAcceptChallenge(challenge.id)}
                          className="w-full gradient-hero"
                        >
                          Accept Challenge
                        </Button>
                      )}

                      {challenge.status === 'accepted' && (
                        <Button
                          onClick={() => {
                            setSelectedChallenge(challenge);
                            // Open challenge modal
                          }}
                          className="w-full gradient-hero"
                        >
                          Start Challenge
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid md:grid-cols-2 gap-6">
            {filteredCompletedChallenges.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No completed challenges</p>
            ) : (
              filteredCompletedChallenges.map((challenge) => (
                <Card key={challenge.id}>
                  <CardHeader>
                    <CardTitle>Challenge vs {challenge.opponent}</CardTitle>
                    <CardDescription>Completed: {challenge.date}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Trophy className="w-4 h-4 text-muted-foreground" />
                        <span>Your Score: {challenge.score}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Crown className="w-4 h-4 text-muted-foreground" />
                        <span>Result: {challenge.result}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Badges Tab Component
function BadgesTab() {
  const [badges, setBadges] = useState([]);
  const { toast } = useToast();
  const { profile, currentView, isAdminOrModerator } = useAuth();

  // Data will be loaded from API
  const badgeCategories = [
    { id: 'all', name: 'All Badges' },
    { id: 'competition', name: 'Competition Badges' },
    { id: 'practice', name: 'Practice Badges' },
    { id: 'challenge', name: 'Challenge Badges' },
    { id: 'achievement', name: 'Achievement Badges' }
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredBadges = badges.filter(badge =>
    selectedCategory === 'all' || badge.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Badges & Achievements</h1>
        <p className="text-muted-foreground">Show off your accomplishments</p>
        {isAdminOrModerator && currentView && (
          <div className="mt-2 flex items-center gap-2 text-sm text-primary">
            <Eye className="w-4 h-4" />
            <span>Viewing as Student - Can see all badges</span>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Badges</CardTitle>
          <CardDescription>Badges you've earned through your learning journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            {badgeCategories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredBadges.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No badges earned yet</p>
            ) : (
              filteredBadges.map((badge) => (
                <div key={badge.id} className="p-4 rounded-xl bg-muted/50 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm">{badge.name}</h3>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${badge.earned ? 'bg-gold text-gold-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {badge.earned ? '✓' : '✗'}
                    </div>
                  </div>
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    {badge.earned ? (
                      <Medal className="w-8 h-8 text-gold" />
                    ) : (
                      <Lock className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground text-center">{badge.description}</p>
                </div>
              ))
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
  const { toast } = useToast();
  const { profile, currentView, isAdminOrModerator } = useAuth();

  const filteredMessages = messages.filter(message =>
    message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendReply = async () => {
    if (!replyContent || !selectedMessage) return;

    setSendingReply(true);

    try {
      // API call to send message
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

  const handleDeleteMessage = async (messageId: number) => {
    try {
      // API call to delete message
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
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Messages</h1>
        <p className="text-muted-foreground">Your communications with teachers and moderators</p>
        {isAdminOrModerator && currentView && (
          <div className="mt-2 flex items-center gap-2 text-sm text-primary">
            <Eye className="w-4 h-4" />
            <span>Viewing as Student - Can see all messages</span>
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
                  {filteredMessages.length === 0 ? (
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
                  <Mail className="w-12 h-12 mx-auto mb-4" />
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

// Profile Tab Component
function ProfileTab() {
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
              <p className="text-sm text-muted-foreground">Total Score</p>
              <p className="text-2xl font-bold">0</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Competitions Joined</p>
              <p className="text-2xl font-bold">0</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Badges Earned</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}