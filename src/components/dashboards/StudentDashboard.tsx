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
import { Textarea } from '@/components/ui/textarea';

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

// Messages Tab Component - Students cannot reply
function MessagesTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const { toast } = useToast();

  const filteredMessages = messages.filter(message =>
    message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

                  {/* Students cannot reply - show info message instead */}
                  <div className="p-4 bg-muted/50 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">Reply Disabled</h3>
                        <p className="text-sm text-muted-foreground">
                          Students cannot reply to messages from teachers and moderators.
                          If you need to respond, please contact your teacher directly.
                        </p>
                      </div>
                    </div>
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

// Rest of the StudentDashboard components remain the same...
function StudentOverview() {
  const { profile } = useAuth();
  const { toast } = useToast();

  // Data will be loaded from API
  const stats = {
    totalPoints: 0,
    competitions: 0,
    questionsAnswered: 0,
    badgesEarned: 0,
    currentStreak: 0,
    recentActivity: []
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
            {stats.recentActivity.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No recent activity</p>
            ) : (
              stats.recentActivity.map((activity) => (
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

function CompetitionsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Data will be loaded from API
  const competitions = [];

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
              {filteredCompetitions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No competitions found</p>
              ) : (
                filteredCompetitions.map((comp) => (
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
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ChallengesTab() {
  const [activeTab, setActiveTab] = useState('active');
  const { toast } = useToast();

  // Data will be loaded from API
  const activeChallenges = [];
  const completedChallenges = [];

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
                {completedChallenges.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No completed challenges</p>
                ) : (
                  completedChallenges.map((challenge) => (
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
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function BadgesTab() {
  const { profile } = useAuth();
  const { toast } = useToast();

  // Data will be loaded from API
  const earnedBadges = [];
  const availableBadges = [];

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
            {earnedBadges.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No badges earned yet</p>
            ) : (
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
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Badges</CardTitle>
            <CardDescription>Badges you can earn next</CardDescription>
          </CardHeader>
          <CardContent>
            {availableBadges.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No available badges</p>
            ) : (
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
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Badge Progress</CardTitle>
          <CardDescription>Track your progress toward achievements</CardDescription>
        </CardHeader>
        <CardContent>
          {availableBadges.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No badge progress to show</p>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}

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
              <p className="text-2xl font-bold">0</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Competitions Completed</p>
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