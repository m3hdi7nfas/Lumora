import { useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  School,
  Users,
  Trophy,
  FileQuestion,
  Award,
  Settings,
  Plus,
  Search,
  Edit,
  Trash2,
  UserPlus,
  BookOpen,
  Eye,
  ShieldPlus,
  MessageSquare,
  LayoutTemplate,
  ImagePlus,
  X,
  Loader2,
  Check,
  BarChart3,
  CheckSquare,
  Square
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';

function ModeratorSidebar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const { profile } = useAuth();
  const navItems = [
    { id: 'overview', icon: Settings, label: 'Overview' },
    { id: 'profile', icon: Users, label: 'My Profile' },
    { id: 'schools', icon: School, label: 'Schools' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'competitions', icon: Trophy, label: 'Competitions' },
    { id: 'questions', icon: FileQuestion, label: 'Questions' },
    { id: 'leaderboard', icon: BarChart3, label: 'Leaderboard' },
    { id: 'badges', icon: Award, label: 'Badges' },
    { id: 'avatars', icon: UserPlus, label: 'Avatars' },
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
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} className="w-10 h-10 rounded-full object-cover" alt="Profile" />
            ) : (
              <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-bold text-sm">
                {profile?.display_name?.substring(0, 2).toUpperCase() || profile?.email?.substring(0, 2).toUpperCase() || 'MD'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{profile?.display_name || 'Moderator'}</p>
              <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={() => setActiveTab('profile')}>
            <Settings className="w-3 h-3 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ModeratorDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <DashboardLayout
      title="Lumora Moderator Dashboard"
      sidebar={<ModeratorSidebar activeTab={activeTab} setActiveTab={setActiveTab} />}
    >
      {activeTab === 'overview' && <OverviewTab setActiveTab={setActiveTab} />}
      {activeTab === 'profile' && <ProfileTab />}
      {activeTab === 'schools' && <SchoolsTab />}
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'competitions' && <CompetitionsTab />}
      {activeTab === 'questions' && <QuestionsTab />}
      {activeTab === 'leaderboard' && <LeaderboardTab />}
      {activeTab === 'badges' && <BadgesTab />}
      {activeTab === 'avatars' && <AvatarsTab />}
      {activeTab === 'messages' && <MessagesTab />}
    </DashboardLayout>
  );
}

// Overview Tab Component
function OverviewTab({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { toast } = useToast();
  const [showAds, setShowAds] = useState(true);

  // Data will be loaded from API
  const stats = {
    totalUsers: 0,
    activeCompetitions: 0,
    totalQuestions: 0,
    pendingReviews: 0,
    newMessages: 0,
    recentActivity: []
  };

  const quickActions = [
    { id: 'competitions', icon: Trophy, title: 'Manage Competitions', description: 'Create and edit competitions' },
    { id: 'questions', icon: FileQuestion, title: 'Review Questions', description: 'Approve pending questions' },
    { id: 'users', icon: Users, title: 'User Management', description: 'Manage user accounts' },
    { id: 'schools', icon: School, title: 'School Settings', description: 'Configure school access' },
  ];

  const handleAdsToggle = async (checked: boolean) => {
    setShowAds(checked);
    try {
      // API call to update ad settings
      const { error } = await supabase.from('settings').upsert({
        key: 'show_ads',
        value: checked
      });

      if (error) throw error;

      toast({
        title: 'Ad settings updated',
        description: `Advertisements are now ${checked ? 'enabled' : 'disabled'}`
      });
    } catch (error) {
      toast({
        title: 'Error updating ad settings',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Moderator Dashboard</h1>
          <p className="text-muted-foreground">Overview of platform activity and quick actions</p>
        </div>
      </div>

      {/* Ads Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Advertisement Settings</CardTitle>
          <CardDescription>Control whether ads are displayed to users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LayoutTemplate className="w-5 h-5 text-primary" />
              <span>Show Advertisements</span>
            </div>
            <Switch
              checked={showAds}
              onCheckedChange={handleAdsToggle}
              id="ads-toggle"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          className="bg-primary/10 border-primary/20"
        />
        <StatCard
          title="Active Competitions"
          value={stats.activeCompetitions.toString()}
          icon={Trophy}
          className="bg-accent/10 border-accent/20"
        />
        <StatCard
          title="Total Questions"
          value={stats.totalQuestions.toLocaleString()}
          icon={FileQuestion}
          className="bg-success/10 border-success/20"
        />
        <StatCard
          title="Pending Reviews"
          value={stats.pendingReviews.toString()}
          icon={Eye}
          className="bg-warning/10 border-warning/20"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common moderator tasks</CardDescription>
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
          <CardDescription>Latest platform events</CardDescription>
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
                    {activity.type === 'user' && <Users className="w-4 h-4 text-primary" />}
                    {activity.type === 'question' && <FileQuestion className="w-4 h-4 text-primary" />}
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

// Competitions Tab Component with School Assignment
function CompetitionsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [newCompetitionName, setNewCompetitionName] = useState('');
  const [newCompetitionDescription, setNewCompetitionDescription] = useState('');
  const [creatingCompetition, setCreatingCompetition] = useState(false);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [selectAllSchools, setSelectAllSchools] = useState(false);
  const { toast } = useToast();

  // Data will be loaded from API
  const competitions = [];
  const schools = [
    { id: 'school1', name: 'Springfield High' },
    { id: 'school2', name: 'Shelbyville Elementary' },
    { id: 'school3', name: 'Capital City Academy' },
  ];

  const filteredCompetitions = competitions.filter(comp =>
    comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSchoolSelection = (schoolId: string) => {
    if (selectedSchools.includes(schoolId)) {
      setSelectedSchools(selectedSchools.filter(id => id !== schoolId));
    } else {
      setSelectedSchools([...selectedSchools, schoolId]);
    }
  };

  const handleSelectAll = () => {
    if (selectAllSchools) {
      setSelectedSchools([]);
    } else {
      setSelectedSchools(schools.map(school => school.id));
    }
    setSelectAllSchools(!selectAllSchools);
  };

  const handleCreateCompetition = async () => {
    if (!newCompetitionName) {
      toast({ title: 'Please enter competition name', variant: 'destructive' });
      return;
    }

    if (selectedSchools.length === 0) {
      toast({ title: 'Please select at least one school', variant: 'destructive' });
      return;
    }

    setCreatingCompetition(true);

    try {
      // API call to create competition
      const { error } = await supabase.from('competitions').insert({
        name: newCompetitionName,
        description: newCompetitionDescription,
        is_practice: false,
        assigned_schools: selectedSchools
      });

      if (error) throw error;

      toast({
        title: 'Competition created successfully!',
        description: `Assigned to ${selectedSchools.length} school(s)`
      });
      setNewCompetitionName('');
      setNewCompetitionDescription('');
      setSelectedSchools([]);
      setSelectAllSchools(false);
    } catch (error) {
      toast({ title: 'Error creating competition', description: error.message, variant: 'destructive' });
    }

    setCreatingCompetition(false);
  };

  const handleDeleteCompetition = async (competitionId: number) => {
    try {
      // API call to delete competition
      const { error } = await supabase.from('competitions').delete().eq('id', competitionId);

      if (error) throw error;

      toast({ title: 'Competition deleted successfully!' });
    } catch (error) {
      toast({ title: 'Error deleting competition', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Competition Management</h1>
          <p className="text-muted-foreground">Create and manage competitions</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gradient-hero">
              <Plus className="w-4 h-4 mr-2" />
              New Competition
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Competition</DialogTitle>
              <DialogDescription>Set up a new competition for students</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Competition Name</Label>
                <Input
                  value={newCompetitionName}
                  onChange={(e) => setNewCompetitionName(e.target.value)}
                  placeholder="Enter competition name"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newCompetitionDescription}
                  onChange={(e) => setNewCompetitionDescription(e.target.value)}
                  placeholder="Describe the competition"
                  rows={4}
                />
              </div>

              {/* School Assignment Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Assign to Schools</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="text-xs"
                  >
                    {selectAllSchools ? (
                      <>
                        <Square className="w-3 h-3 mr-1" /> Deselect All
                      </>
                    ) : (
                      <>
                        <CheckSquare className="w-3 h-3 mr-1" /> Select All
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto border rounded-lg p-3">
                  {schools.map((school) => (
                    <div
                      key={school.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleSchoolSelection(school.id)}
                    >
                      <Checkbox
                        checked={selectedSchools.includes(school.id)}
                        onCheckedChange={() => handleSchoolSelection(school.id)}
                        id={`school-${school.id}`}
                      />
                      <Label htmlFor={`school-${school.id}`} className="cursor-pointer">
                        {school.name}
                      </Label>
                    </div>
                  ))}
                </div>

                {selectedSchools.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Selected:</span>
                    {selectedSchools.map(schoolId => {
                      const school = schools.find(s => s.id === schoolId);
                      return (
                        <span key={schoolId} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                          {school?.name}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateCompetition} disabled={creatingCompetition}>
                {creatingCompetition && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Competition
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Competitions List</CardTitle>
          <CardDescription>All platform competitions</CardDescription>
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

            <div className="overflow-x-auto">
              {filteredCompetitions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No competitions found</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="p-3 text-left font-medium">Name</th>
                      <th className="p-3 text-left font-medium">Status</th>
                      <th className="p-3 text-left font-medium">Participants</th>
                      <th className="p-3 text-left font-medium">Assigned Schools</th>
                      <th className="p-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompetitions.map((comp) => (
                      <tr key={comp.id} className="border-b border-border/50 last:border-none hover:bg-muted/50 transition-colors">
                        <td className="p-3">
                          <div className="font-medium">{comp.name}</div>
                          <div className="text-xs text-muted-foreground">{comp.description}</div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs capitalize ${comp.status === 'active' ? 'bg-success/10 text-success' : comp.status === 'upcoming' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'}`}>
                            {comp.status}
                          </span>
                        </td>
                        <td className="p-3">{comp.participants}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {comp.assignedSchools.map((school: string) => (
                              <span key={school} className="px-2 py-1 bg-accent/10 text-accent rounded-full text-xs">
                                {school}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="h-8 w-8 p-0">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Competition</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {comp.name}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive hover:bg-destructive/90"
                                    onClick={() => handleDeleteCompetition(comp.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Messages Tab Component - Students cannot reply
function MessagesTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [messages, setMessages] = useState([]);
  const { toast } = useToast();

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
        sender_id: 'moderator@lumora.com',
        subject: `Re: ${selectedMessage.subject}`,
        allow_reply: false // Students cannot reply to moderator messages
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
        <p className="text-muted-foreground">User communications and support</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Inbox</CardTitle>
              <CardDescription>User messages</CardDescription>
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
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handleSendReply}
                        disabled={sendingReply || !replyContent}
                        className="gradient-hero"
                      >
                        {sendingReply && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Send Reply
                      </Button>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Lock className="w-3 h-3" />
                        <span>Students cannot reply to this message</span>
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

// Leaderboard Tab Component - Moved before Badges
function LeaderboardTab() {
  const [selectedCompetition, setSelectedCompetition] = useState('all');
  const [timeRange, setTimeRange] = useState('all-time');
  const { toast } = useToast();

  // Data will be loaded from API
  const competitions = [
    { id: 'all', name: 'All Competitions' },
    { id: 'math-challenge', name: 'Math Challenge 2024' },
    { id: 'science-olympiad', name: 'Science Olympiad' },
  ];
  const leaderboardData = [];

  const badgeColors = {
    gold: 'bg-gold text-gold-foreground',
    silver: 'bg-silver text-silver-foreground',
    bronze: 'bg-bronze text-bronze-foreground',
    none: 'bg-muted text-muted-foreground'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">Track student performance across competitions</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Select value={selectedCompetition} onValueChange={setSelectedCompetition}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select competition" />
            </SelectTrigger>
            <SelectContent>
              {competitions.map(comp => (
                <SelectItem key={comp.id} value={comp.id}>{comp.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-time">All Time</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="today">Today</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
          <CardDescription>Students with the highest scores in selected competition</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {leaderboardData.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No leaderboard data available</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-3 text-left font-medium">Rank</th>
                    <th className="p-3 text-left font-medium">Name</th>
                    <th className="p-3 text-left font-medium">School</th>
                    <th className="p-3 text-left font-medium">Score</th>
                    <th className="p-3 text-left font-medium">Achievement</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((student) => (
                    <tr key={student.rank} className="border-b border-border/50 last:border-none hover:bg-muted/50 transition-colors">
                      <td className="p-3 font-medium">{student.rank}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span>{student.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">{student.school}</td>
                      <td className="p-3 font-bold">{student.score.toLocaleString()}</td>
                      <td className="p-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${badgeColors[student.badge]}`}>
                          {student.rank}
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

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>School Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-4">No school ranking data available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Competition Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-4">No competition stats available</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Badges Tab Component
function BadgesTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [newBadgeName, setNewBadgeName] = useState('');
  const [newBadgeDescription, setNewBadgeDescription] = useState('');
  const [newBadgeRequirement, setNewBadgeRequirement] = useState('points');
  const [newBadgeValue, setNewBadgeValue] = useState('100');
  const [creatingBadge, setCreatingBadge] = useState(false);
  const { toast } = useToast();

  // Data will be loaded from API
  const badges = [];

  const filteredBadges = badges.filter(badge =>
    badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    badge.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateBadge = async () => {
    if (!newBadgeName) {
      toast({ title: 'Please enter badge name', variant: 'destructive' });
      return;
    }

    setCreatingBadge(true);

    try {
      // API call to create badge
      const { error } = await supabase.from('badges').insert({
        name: newBadgeName,
        description: newBadgeDescription,
        requirement_type: newBadgeRequirement,
        requirement_value: parseInt(newBadgeValue)
      });

      if (error) throw error;

      toast({ title: 'Badge created successfully!' });
      setNewBadgeName('');
      setNewBadgeDescription('');
      setNewBadgeRequirement('points');
      setNewBadgeValue('100');
    } catch (error) {
      toast({ title: 'Error creating badge', description: error.message, variant: 'destructive' });
    }

    setCreatingBadge(false);
  };

  const handleDeleteBadge = async (badgeId: number) => {
    try {
      // API call to delete badge
      const { error } = await supabase.from('badges').delete().eq('id', badgeId);

      if (error) throw error;

      toast({ title: 'Badge deleted successfully!' });
    } catch (error) {
      toast({ title: 'Error deleting badge', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Badge Management</h1>
          <p className="text-muted-foreground">Create and manage achievement badges</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gradient-hero">
              <Plus className="w-4 h-4 mr-2" />
              New Badge
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Badge</DialogTitle>
              <DialogDescription>Design a new achievement badge</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Badge Name</Label>
                <Input
                  value={newBadgeName}
                  onChange={(e) => setNewBadgeName(e.target.value)}
                  placeholder="Enter badge name"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newBadgeDescription}
                  onChange={(e) => setNewBadgeDescription(e.target.value)}
                  placeholder="Describe what this badge represents"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Requirement Type</Label>
                  <Select value={newBadgeRequirement} onValueChange={setNewBadgeRequirement}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="points">Points Earned</SelectItem>
                      <SelectItem value="questions">Questions Answered</SelectItem>
                      <SelectItem value="competitions">Competitions Won</SelectItem>
                      <SelectItem value="streak">Daily Streak</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Requirement Value</Label>
                  <Input
                    type="number"
                    value={newBadgeValue}
                    onChange={(e) => setNewBadgeValue(e.target.value)}
                    placeholder="Enter value"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateBadge} disabled={creatingBadge}>
                {creatingBadge && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Badge
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Badges List</CardTitle>
          <CardDescription>All available achievement badges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search badges..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredBadges.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No badges found</p>
              ) : (
                filteredBadges.map((badge) => (
                  <div key={badge.id} className="p-4 rounded-xl border border-border/50 hover:border-primary/50 transition-all">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <img src={badge.image} alt={badge.name} className="w-12 h-12 object-cover rounded-full" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-medium">{badge.name}</h3>
                        <p className="text-xs text-muted-foreground">{badge.description}</p>
                        <p className="text-xs text-primary mt-1">{badge.requirement}</p>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="h-8 w-8 p-0">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Badge</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {badge.name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={() => handleDeleteBadge(badge.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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

// Other tab components remain the same...
function ProfileTab() {
  const { profile } = useAuth();
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your moderator account</p>
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
              <p className="text-sm text-muted-foreground">Competitions Created</p>
              <p className="text-2xl font-bold">0</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Questions Approved</p>
              <p className="text-2xl font-bold">0</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Users Managed</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SchoolsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolPassword, setNewSchoolPassword] = useState('');
  const [creatingSchool, setCreatingSchool] = useState(false);
  const { toast } = useToast();

  // Data will be loaded from API
  const schools = [];

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateSchool = async () => {
    if (!newSchoolName || !newSchoolPassword) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }

    setCreatingSchool(true);

    try {
      // API call to create school
      const { error } = await supabase.from('schools').insert({
        name: newSchoolName,
        password: newSchoolPassword
      });

      if (error) throw error;

      toast({ title: 'School created successfully!' });
      setNewSchoolName('');
      setNewSchoolPassword('');
    } catch (error) {
      toast({ title: 'Error creating school', description: error.message, variant: 'destructive' });
    }

    setCreatingSchool(false);
  };

  const handleDeleteSchool = async (schoolId: number) => {
    try {
      // API call to delete school
      const { error } = await supabase.from('schools').delete().eq('id', schoolId);

      if (error) throw error;

      toast({ title: 'School deleted successfully!' });
    } catch (error) {
      toast({ title: 'Error deleting school', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">School Management</h1>
          <p className="text-muted-foreground">Manage registered schools</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gradient-hero">
              <Plus className="w-4 h-4 mr-2" />
              Add School
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New School</DialogTitle>
              <DialogDescription>Add a new school to the platform</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>School Name</Label>
                <Input
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                  placeholder="Enter school name"
                />
              </div>
              <div className="space-y-2">
                <Label>Access Password</Label>
                <Input
                  type="password"
                  value={newSchoolPassword}
                  onChange={(e) => setNewSchoolPassword(e.target.value)}
                  placeholder="Set school password"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateSchool} disabled={creatingSchool}>
                {creatingSchool && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create School
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schools List</CardTitle>
          <CardDescription>All registered educational institutions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search schools..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="overflow-x-auto">
              {filteredSchools.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No schools found</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="p-3 text-left font-medium">School Name</th>
                      <th className="p-3 text-left font-medium">Students</th>
                      <th className="p-3 text-left font-medium">Teachers</th>
                      <th className="p-3 text-left font-medium">Created</th>
                      <th className="p-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSchools.map((school) => (
                      <tr key={school.id} className="border-b border-border/50 last:border-none hover:bg-muted/50 transition-colors">
                        <td className="p-3 font-medium">{school.name}</td>
                        <td className="p-3">{school.students}</td>
                        <td className="p-3">{school.teachers}</td>
                        <td className="p-3 text-muted-foreground">{school.created}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="h-8 w-8 p-0">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete School</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {school.name}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive hover:bg-destructive/90"
                                    onClick={() => handleDeleteSchool(school.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UsersTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const { toast } = useToast();

  // Data will be loaded from API
  const users = [];

  const filteredUsers = users.filter(user =>
    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedRole === 'all' || user.role === selectedRole)
  );

  const handleDeleteUser = async (userId: number) => {
    try {
      // API call to delete user
      const { error } = await supabase.from('profiles').delete().eq('id', userId);

      if (error) throw error;

      toast({ title: 'User deleted successfully!' });
    } catch (error) {
      toast({ title: 'Error deleting user', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">User Management</h1>
        <p className="text-muted-foreground">View and manage all platform users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
          <CardDescription>All registered users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="teacher">Teachers</SelectItem>
                  <SelectItem value="moderator">Moderators</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              {filteredUsers.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No users found</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="p-3 text-left font-medium">Name</th>
                      <th className="p-3 text-left font-medium">Email</th>
                      <th className="p-3 text-left font-medium">Role</th>
                      <th className="p-3 text-left font-medium">School</th>
                      <th className="p-3 text-left font-medium">Joined</th>
                      <th className="p-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-border/50 last:border-none hover:bg-muted/50 transition-colors">
                        <td className="p-3 font-medium">{user.name}</td>
                        <td className="p-3 text-muted-foreground">{user.email}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs capitalize ${user.role === 'student' ? 'bg-primary/10 text-primary' : user.role === 'teacher' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground">{user.school}</td>
                        <td className="p-3 text-muted-foreground">{user.joined}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="h-8 w-8 p-0">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {user.name}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive hover:bg-destructive/90"
                                    onClick={() => handleDeleteUser(user.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function QuestionsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const { toast } = useToast();

  // Data will be loaded from API
  const questions = [];

  const filteredQuestions = questions.filter(question =>
    (question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
     question.subject.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedStatus === 'all' || question.status === selectedStatus)
  );

  const handleDeleteQuestion = async (questionId: number) => {
    try {
      // API call to delete question
      const { error } = await supabase.from('questions').delete().eq('id', questionId);

      if (error) throw error;

      toast({ title: 'Question deleted successfully!' });
    } catch (error) {
      toast({ title: 'Error deleting question', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Question Management</h1>
        <p className="text-muted-foreground">Review and manage questions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Questions List</CardTitle>
          <CardDescription>All platform questions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              {filteredQuestions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No questions found</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="p-3 text-left font-medium">Question</th>
                      <th className="p-3 text-left font-medium">Subject</th>
                      <th className="p-3 text-left font-medium">Status</th>
                      <th className="p-3 text-left font-medium">Created By</th>
                      <th className="p-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuestions.map((question) => (
                      <tr key={question.id} className="border-b border-border/50 last:border-none hover:bg-muted/50 transition-colors">
                        <td className="p-3">
                          <div className="font-medium">{question.text}</div>
                        </td>
                        <td className="p-3 text-muted-foreground">{question.subject}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs capitalize ${question.status === 'approved' ? 'bg-success/10 text-success' : question.status === 'pending' ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'}`}>
                            {question.status}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground">{question.createdBy}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Eye className="w-3 h-3" />
                            </Button>
                            {question.status === 'pending' && (
                              <>
                                <Button variant="success" size="sm" className="h-8 w-8 p-0">
                                  <Check className="w-3 h-3" />
                                </Button>
                                <Button variant="destructive" size="sm" className="h-8 w-8 p-0">
                                  <X className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="h-8 w-8 p-0">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Question</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this question? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive hover:bg-destructive/90"
                                    onClick={() => handleDeleteQuestion(question.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AvatarsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [newAvatarName, setNewAvatarName] = useState('');
  const [newAvatarImage, setNewAvatarImage] = useState<File | null>(null);
  const [creatingAvatar, setCreatingAvatar] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  // Data will be loaded from API
  const avatars = [];

  const filteredAvatars = avatars.filter(avatar =>
    avatar.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewAvatarImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCreateAvatar = async () => {
    if (!newAvatarName || !newAvatarImage) {
      toast({ title: 'Please fill all fields and upload an image', variant: 'destructive' });
      return;
    }

    setCreatingAvatar(true);

    try {
      // API call for image upload
      const { error } = await supabase.storage.from('avatars').upload(`avatar-${Date.now()}`, newAvatarImage);

      if (error) throw error;

      toast({ title: 'Avatar created successfully!' });
      setNewAvatarName('');
      setNewAvatarImage(null);
      setImagePreview(null);
    } catch (error) {
      toast({ title: 'Error creating avatar', description: error.message, variant: 'destructive' });
    }

    setCreatingAvatar(false);
  };

  const handleDeleteAvatar = async (avatarId: number) => {
    try {
      // API call to delete avatar
      const { error } = await supabase.from('avatars').delete().eq('id', avatarId);

      if (error) throw error;

      toast({ title: 'Avatar deleted successfully!' });
    } catch (error) {
      toast({ title: 'Error deleting avatar', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Avatar Management</h1>
          <p className="text-muted-foreground">Manage user profile avatars</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gradient-hero">
              <Plus className="w-4 h-4 mr-2" />
              Add Avatar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Avatar</DialogTitle>
              <DialogDescription>Upload a new profile avatar</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Avatar Name</Label>
                <Input
                  value={newAvatarName}
                  onChange={(e) => setNewAvatarName(e.target.value)}
                  placeholder="Enter avatar name"
                />
              </div>
              <div className="space-y-2">
                <Label>Avatar Image</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="cursor-pointer"
                  />
                  {imagePreview && (
                    <div className="w-16 h-16 rounded-full overflow-hidden">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateAvatar} disabled={creatingAvatar}>
                {creatingAvatar && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Upload Avatar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Avatars Gallery</CardTitle>
          <CardDescription>All available profile avatars</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search avatars..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {filteredAvatars.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No avatars found</p>
              ) : (
                filteredAvatars.map((avatar) => (
                  <div key={avatar.id} className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border">
                      <img src={avatar.image} alt={avatar.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs text-center font-medium">{avatar.name}</p>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="h-6 w-6 p-0">
                          <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Avatar</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {avatar.name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={() => handleDeleteAvatar(avatar.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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