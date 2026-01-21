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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

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
              {profile?.display_name?.substring(0, 2).toUpperCase() || 'ST'}
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
      {activeTab === 'profile' && <ProfileTab />}
    </DashboardLayout>
  );
}

// Student Overview Component
function StudentOverview() {
  const { profile } = useAuth();
  const { toast } = useToast();

  // Fetch student stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['student-stats'],
    queryFn: async () => {
      try {
        // Get student data
        const { data: student, error: studentError } = await supabase.from('profiles').select('*').eq('id', profile?.id).single();
        if (studentError) throw studentError;

        return {
          totalScore: student.score || 0,
          competitionsEntered: 0,
          badgesEarned: 0,
          questionsAnswered: 0,
          rank: 0
        };
      } catch (error) {
        console.error('Error fetching student stats:', error);
        return {
          totalScore: 0,
          competitionsEntered: 0,
          badgesEarned: 0,
          questionsAnswered: 0,
          rank: 0
        };
      }
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">My Learning Journey</h1>
        <p className="text-muted-foreground">Track your progress and achievements</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Score"
          value={stats?.totalScore?.toLocaleString() || '0'}
          icon={Star}
          className="bg-primary/10 border-primary/20"
          loading={statsLoading}
        />
        <StatCard
          title="Competitions"
          value={stats?.competitionsEntered?.toString() || '0'}
          icon={Trophy}
          className="bg-accent/10 border-accent/20"
          loading={statsLoading}
        />
        <StatCard
          title="Badges Earned"
          value={stats?.badgesEarned?.toString() || '0'}
          icon={Award}
          className="bg-success/10 border-success/20"
          loading={statsLoading}
        />
        <StatCard
          title="Questions Answered"
          value={stats?.questionsAnswered?.toLocaleString() || '0'}
          icon={BookOpen}
          className="bg-warning/10 border-warning/20"
          loading={statsLoading}
        />
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>My Progress</CardTitle>
          <CardDescription>Learning journey overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Medal className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <p className="font-medium">Overall Progress</p>
                  <p className="text-sm text-muted-foreground">Based on completed activities</p>
                </div>
              </div>
              <span className="text-2xl font-bold">{stats?.progress || 0}%</span>
            </div>

            <div className="w-full h-2 bg-muted rounded-full">
              <div
                className="h-2 bg-primary rounded-full"
                style={{ width: `${stats?.progress || 0}%` }}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Current Rank</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{stats?.rank || 0}</span>
                  <span className="text-sm text-muted-foreground">out of 100</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Next Milestone</p>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-gold" />
                  <span className="text-sm">500 points - Math Master</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest learning activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-center text-muted-foreground py-4">No recent activity</p>
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

// Competitions Tab Component
function CompetitionsTab() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Competitions</h1>
        <p className="text-muted-foreground">Join competitions to earn points and badges</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Competitions</CardTitle>
          <CardDescription>Competitions you can participate in</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </div>
            ) : competitions.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No competitions found</p>
            ) : (
              competitions.map((competition) => (
                <div key={competition.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{competition.name}</h3>
                      <p className="text-xs text-muted-foreground">{competition.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${competition.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                          {competition.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-xs text-muted-foreground">Participants: {competition.participants || 0}/{competition.max_participants}</span>
                      </div>
                    </div>
                    <Button size="sm" className="gradient-hero">
                      Join
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

// Challenges Tab Component
function ChallengesTab() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      // Mock data for challenges
      const mockChallenges = [
        { id: '1', name: 'Daily Math Challenge', description: 'Solve 10 math problems daily', points: 50, category: 'math' },
        { id: '2', name: 'Science Quiz', description: 'Answer 15 science questions', points: 75, category: 'science' },
        { id: '3', name: 'History Trivia', description: 'Complete history trivia', points: 60, category: 'history' },
      ];
      setChallenges(mockChallenges);
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
      <div>
        <h1 className="text-2xl font-display font-bold">Challenges</h1>
        <p className="text-muted-foreground">Complete challenges to earn extra points</p>
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
              <p className="text-center text-muted-foreground py-4">No challenges found</p>
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

// Badges Tab Component
function BadgesTab() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchBadges = async () => {
    setLoading(true);
    try {
      // Mock data for badges
      const mockBadges = [
        { id: '1', name: 'Math Master', description: 'Complete 50 math questions', earned: true, category: 'math' },
        { id: '2', name: 'Science Explorer', description: 'Complete 30 science questions', earned: false, category: 'science' },
        { id: '3', name: 'History Buff', description: 'Complete 25 history questions', earned: false, category: 'history' },
        { id: '4', name: 'Quick Learner', description: 'Answer 10 questions correctly in a row', earned: true, category: 'general' },
      ];
      setBadges(mockBadges);
    } catch (error) {
      toast({ title: 'Error fetching badges', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">My Badges</h1>
        <p className="text-muted-foreground">Earn badges by completing challenges and competitions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Badges Collection</CardTitle>
          <CardDescription>Show off your achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading ? (
              <div className="text-center py-4 col-span-full">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </div>
            ) : badges.length === 0 ? (
              <p className="text-center text-muted-foreground py-4 col-span-full">No badges found</p>
            ) : (
              badges.map((badge) => (
                <div key={badge.id} className="p-4 rounded-xl bg-muted/50 border border-border/50">
                  <div className="relative">
                    <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center ${badge.earned ? 'bg-gradient-to-br from-primary to-accent' : 'bg-muted'}`}>
                      <Award className={`w-8 h-8 ${badge.earned ? 'text-gold' : 'text-muted-foreground'}`} />
                    </div>
                    {!badge.earned && (
                      <div className="absolute top-0 right-0">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium text-sm text-center">{badge.name}</h3>
                  <p className="text-xs text-muted-foreground text-center mt-1">{badge.description}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">{badge.category}</span>
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
      const { data, error } = await supabase.from('messages').select('*').eq('receiver_id', profile?.id);
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

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Messages</h1>
        <p className="text-muted-foreground">Your communications with teachers and admins</p>
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
              <Label>Display Name</Label>
              <Input value={profile?.display_name || 'Not set'} disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label>School</Label>
              <Input value={profile?.school_id || 'Not set'} disabled className="bg-muted" />
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
              <p className="text-2xl font-bold">{profile?.score || 0}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Badges Earned</p>
              <p className="text-2xl font-bold">0</p>
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