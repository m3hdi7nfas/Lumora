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
  Users
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
    { id: 'overview', icon: BookOpen, label: 'My Learning' },
    { id: 'competitions', icon: Trophy, label: 'Competitions' },
    { id: 'challenges', icon: Swords, label: 'Challenges' },
    { id: 'badges', icon: Award, label: 'My Badges' },
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
            <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-bold text-sm">
              {profile?.display_name?.substring(0, 2).toUpperCase() || profile?.email?.substring(0, 2).toUpperCase() || 'ST'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{profile?.display_name || 'Student'}</p>
              <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={() => setActiveTab('profile')}>
            <User className="w-3 h-3 mr-2" />
            My Profile
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <DashboardLayout
      title="Lumora Student Dashboard"
      sidebar={<StudentSidebar activeTab={activeTab} setActiveTab={setActiveTab} />}
    >
      {activeTab === 'overview' && <StudentOverview />}
      {activeTab === 'competitions' && <CompetitionsTab />}
      {activeTab === 'challenges' && <ChallengesTab />}
      {activeTab === 'badges' && <BadgesTab />}
      {activeTab === 'messages' && <MessagesTab />}
      {activeTab === 'profile' && <ProfileView />}
    </DashboardLayout>
  );
}

// Student Overview Component
function StudentOverview() {
  const { profile } = useAuth();
  const { toast } = useToast();

  // Mock data - replace with real API calls
  const stats = {
    totalPoints: 4580,
    competitions: 3,
    questionsAnswered: 1245,
    badgesEarned: 8,
    currentStreak: 14,
    recentActivity: [
      { id: 1, type: 'competition', title: 'Spring Challenge 2024', action: 'completed', time: '2 hours ago', points: 1250 },
      { id: 2, type: 'badge', title: 'Quick Learner', action: 'earned', time: '5 hours ago' },
      { id: 3, type: 'question', title: 'Math Question #45', action: 'answered correctly', time: '1 day ago', points: 50 },
      { id: 4, type: 'streak', title: 'Daily Streak', action: 'maintained', time: '2 days ago', points: 20 },
    ]
  };

  const quickActions = [
    { id: 'competitions', icon: Trophy, title: 'Join Competition', description: 'Participate in challenges' },
    { id: 'practice', icon: BookOpen, title: 'Practice Mode', description: 'Sharpen your skills' },
    { id: 'challenges', icon: Swords, title: '1v1 Challenges', description: 'Challenge friends' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">My Learning Journey</h1>
        <p className="text-muted-foreground">Welcome back, {profile?.display_name || 'Student'}! Here's your progress.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Points"
          value={stats.totalPoints.toLocaleString()}
          icon={Star}
          className="bg-primary/10 border-primary/20"
        />
        <StatCard
          title="Competitions"
          value={stats.competitions.toString()}
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
          title="Current Streak"
          value={`${stats.currentStreak} days`}
          icon={Crown}
          className="bg-warning/10 border-warning/20"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Continue your learning journey</CardDescription>
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
          <CardDescription>Your latest achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-lg bg-muted">
                  {activity.type === 'competition' && <Trophy className="w-4 h-4 text-primary" />}
                  {activity.type === 'badge' && <Award className="w-4 h-4 text-primary" />}
                  {activity.type === 'question' && <BookOpen className="w-4 h-4 text-primary" />}
                  {activity.type === 'streak' && <Crown className="w-4 h-4 text-primary" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.action} • {activity.time}</p>
                </div>
                {activity.points && (
                  <div className="flex items-center gap-1 bg-success/10 px-2 py-1 rounded-lg">
                    <Star className="w-3 h-3 text-success" />
                    <span className="text-xs font-bold text-success">+{activity.points}</span>
                  </div>
                )}
              </div>
            ))}
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

  // Mock competitions data - replace with real API calls
  const competitions = [
    { id: 1, name: 'Spring Challenge 2024', description: 'Annual spring competition', status: 'active', startDate: '2024-03-01', endDate: '2024-05-31', yourScore: 1250, totalQuestions: 150, completed: 85 },
    { id: 2, name: 'Math Olympiad 2024', description: 'Advanced mathematics competition', status: 'upcoming', startDate: '2024-06-15', endDate: '2024-08-15', yourScore: 0, totalQuestions: 100, completed: 0 },
    { id: 3, name: 'Science Fair 2024', description: 'Inter-school science competition', status: 'completed', startDate: '2023-11-01', endDate: '2023-12-15', yourScore: 870, totalQuestions: 120, completed: 100 },
  ];

  const filteredCompetitions = competitions.filter(comp =>
    comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Competitions</h1>
        <p className="text-muted-foreground">Participate in challenges and improve your skills</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Competitions</CardTitle>
          <CardDescription>All competitions you're participating in</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search competitions..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              {filteredCompetitions.map((comp) => (
                <div key={comp.id} className="p-4 rounded-xl border border-border/50 hover:border-primary/50 transition-all">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium">{comp.name}</h3>
                      <p className="text-sm text-muted-foreground">{comp.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs capitalize ${comp.status === 'active' ? 'bg-success/10 text-success' : comp.status === 'upcoming' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'}`}>
                          {comp.status}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {comp.startDate} - {comp.endDate}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Your Score</p>
                        <p className="text-xl font-bold">{comp.yourScore.toLocaleString()}</p>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Progress</p>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full">
                            <div
                              className="h-2 bg-primary rounded-full"
                              style={{ width: `${comp.completed}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{comp.completed}%</span>
                        </div>
                      </div>

                      <Button size="sm" className="gradient-hero">
                        {comp.status === 'active' ? 'Continue' : comp.status === 'upcoming' ? 'Prepare' : 'Review'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Challenges Tab Component
function ChallengesTab() {
  const [activeTab, setActiveTab] = useState('active');

  // Mock challenges data - replace with real API calls
  const activeChallenges = [
    { id: 1, opponent: 'Michael Chen', competition: 'Spring Challenge 2024', status: 'in-progress', yourScore: 450, opponentScore: 380, timeLeft: '2h 30m' },
    { id: 2, opponent: 'Emily Rodriguez', competition: 'Math Olympiad 2024', status: 'pending', yourScore: 0, opponentScore: 0, timeLeft: 'Not started' },
  ];

  const completedChallenges = [
    { id: 1, opponent: 'Sarah Johnson', competition: 'Science Fair 2024', status: 'won', yourScore: 870, opponentScore: 750, date: '2024-03-10' },
    { id: 2, opponent: 'David Kim', competition: 'Spring Challenge 2024', status: 'lost', yourScore: 320, opponentScore: 410, date: '2024-03-05' },
    { id: 3, opponent: 'Jessica Lee', competition: 'Math Practice', status: 'won', yourScore: 480, opponentScore: 450, date: '2024-02-28' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">1v1 Challenges</h1>
        <p className="text-muted-foreground">Compete against your friends and classmates</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Challenges</CardTitle>
          <CardDescription>Head-to-head competitions</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="space-y-4">
            <TabsList>
              <TabsTrigger value="active" onClick={() => setActiveTab('active')}>Active</TabsTrigger>
              <TabsTrigger value="completed" onClick={() => setActiveTab('completed')}>Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              <div className="space-y-4">
                {activeChallenges.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No active challenges</p>
                    <Button className="mt-4 gradient-hero" size="sm">
                      <Swords className="w-4 h-4 mr-2" />
                      Find New Opponent
                    </Button>
                  </div>
                ) : (
                  activeChallenges.map((challenge) => (
                    <div key={challenge.id} className="p-4 rounded-xl border border-border/50 hover:border-primary/50 transition-all">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-medium">vs {challenge.opponent}</h3>
                          <p className="text-sm text-muted-foreground">{challenge.competition}</p>
                          <span className={`px-2 py-1 rounded-full text-xs capitalize ${challenge.status === 'in-progress' ? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning'}`}>
                            {challenge.status.replace('-', ' ')}
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Your Score</p>
                            <p className="text-xl font-bold">{challenge.yourScore}</p>
                          </div>

                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Opponent</p>
                            <p className="text-xl font-bold">{challenge.opponentScore}</p>
                          </div>

                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Time Left</p>
                            <p className="text-sm font-medium">{challenge.timeLeft}</p>
                          </div>

                          <Button size="sm" className="gradient-hero">
                            {challenge.status === 'in-progress' ? 'Continue' : 'Prepare'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="completed">
              <div className="space-y-4">
                {completedChallenges.map((challenge) => (
                  <div key={challenge.id} className="p-4 rounded-xl border border-border/50 hover:border-primary/50 transition-all">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-medium">vs {challenge.opponent}</h3>
                        <p className="text-sm text-muted-foreground">{challenge.competition}</p>
                        <span className={`px-2 py-1 rounded-full text-xs capitalize ${challenge.status === 'won' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                          You {challenge.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Your Score</p>
                          <p className="text-xl font-bold">{challenge.yourScore}</p>
                        </div>

                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Opponent</p>
                          <p className="text-xl font-bold">{challenge.opponentScore}</p>
                        </div>

                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Date</p>
                          <p className="text-sm font-medium">{challenge.date}</p>
                        </div>

                        <Button size="sm" variant="outline">
                          Review
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Badges Tab Component
function BadgesTab() {
  const { profile } = useAuth();

  // Mock badges data - replace with real API calls
  const earnedBadges = [
    { id: 1, name: 'Quick Learner', description: 'Answer 50 questions correctly', earnedAt: '2024-03-15', image: '/placeholder.svg?height=64&width=64' },
    { id: 2, name: 'Competition Champion', description: 'Win a competition', earnedAt: '2024-03-10', image: '/placeholder.svg?height=64&width=64' },
    { id: 3, name: 'Perfect Score', description: 'Get 100% in a section', earnedAt: '2024-03-05', image: '/placeholder.svg?height=64&width=64' },
    { id: 4, name: 'Consistent Performer', description: 'Participate in 5 competitions', earnedAt: '2024-02-28', image: '/placeholder.svg?height=64&width=64' },
    { id: 5, name: 'Early Bird', description: 'Complete first competition', earnedAt: '2024-02-20', image: '/placeholder.svg?height=64&width=64' },
    { id: 6, name: 'Weekend Warrior', description: 'Answer questions on weekends', earnedAt: '2024-02-15', image: '/placeholder.svg?height=64&width=64' },
  ];

  const availableBadges = [
    { id: 1, name: 'Master Mind', description: 'Answer 1000 questions correctly', requirement: '950/1000', image: '/placeholder.svg?height=64&width=64' },
    { id: 2, name: 'Speed Demon', description: 'Answer 50 questions in under 30 minutes', requirement: '25/50', image: '/placeholder.svg?height=64&width=64' },
    { id: 3, name: 'All-Rounder', description: 'Complete all subject categories', requirement: '6/8', image: '/placeholder.svg?height=64&width=64' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">My Badges</h1>
        <p className="text-muted-foreground">Show off your achievements</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Earned Badges</CardTitle>
            <CardDescription>Your collection of achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {earnedBadges.map((badge) => (
                <div key={badge.id} className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border">
                    <img src={badge.image} alt={badge.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-xs text-center font-medium">{badge.name}</p>
                  <p className="text-[10px] text-center text-muted-foreground">{badge.earnedAt}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Badges</CardTitle>
            <CardDescription>Badges you can earn next</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {availableBadges.map((badge) => (
                <div key={badge.id} className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors opacity-60">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border/50">
                    <img src={badge.image} alt={badge.name} className="w-full h-full object-cover grayscale" />
                  </div>
                  <p className="text-xs text-center font-medium">{badge.name}</p>
                  <p className="text-[10px] text-center text-muted-foreground">{badge.requirement}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Badge Progress</CardTitle>
          <CardDescription>Track your progress toward achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availableBadges.map((badge) => (
              <div key={badge.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-border">
                  <img src={badge.image} alt={badge.name} className="w-full h-full object-cover grayscale" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{badge.name}</h3>
                  <p className="text-sm text-muted-foreground">{badge.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{badge.requirement}</p>
                  <div className="w-24 h-2 bg-muted rounded-full mt-1">
                    <div
                      className="h-2 bg-primary rounded-full"
                      style={{ width: badge.requirement.split('/')[0] + '%' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Messages Tab Component
function MessagesTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Mock messages data - replace with real API calls
  const messages = [
    { id: 1, subject: 'Competition Results', content: 'Great job on the Spring Challenge! You scored in the top 10%...', sender: 'Moderator', senderEmail: 'moderator@lumora.com', date: '2024-03-15', read: true },
    { id: 2, subject: 'New Badge Earned', content: 'Congratulations! You just earned the "Quick Learner" badge...', sender: 'System', senderEmail: 'system@lumora.com', date: '2024-03-14', read: false },
    { id: 3, subject: 'Weekly Update', content: 'Here\'s your weekly progress report and recommendations...', sender: 'Teacher', senderEmail: 'teacher@springfield.edu', date: '2024-03-10', read: true },
  ];

  const filteredMessages = messages.filter(message =>
    message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendReply = async () => {
    if (!replyContent || !selectedMessage) return;

    setSendingReply(true);

    try {
      // Replace with actual API call
      // const { error } = await supabase.from('messages').insert({
      //   content: replyContent,
      //   receiver_id: selectedMessage.senderEmail,
      //   sender_id: profile?.email,
      //   subject: `Re: ${selectedMessage.subject}`
      // });

      // if (error) throw error;

      toast({ title: 'Reply sent successfully!' });
      setReplyContent('');
    } catch (error) {
      toast({ title: 'Error sending reply', description: error.message, variant: 'destructive' });
    }

    setSendingReply(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Messages</h1>
        <p className="text-muted-foreground">Communications from teachers and moderators</p>
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
                  {filteredMessages.map((message) => (
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
                  ))}
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
            <CardTitle>Learning Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Points</p>
              <p className="text-2xl font-bold">4,580</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Competitions Completed</p>
              <p className="text-2xl font-bold">3</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Badges Earned</p>
              <p className="text-2xl font-bold">8</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}