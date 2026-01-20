import { useState, useEffect } from 'react';
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
  Square,
  RefreshCw,
  User,
  LogOut,
  Calendar,
  Upload,
  FileText,
  List,
  Mail,
  Send,
  UserCheck,
  Users as UsersIcon,
  FileUp,
  Image as ImageIcon,
  Crown,
  CheckCircle,
  Clock,
  AlertTriangle,
  FilePlus,
  FolderPlus,
  BadgePlus,
  MailPlus,
  UserCog
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

function AdminSidebar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
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
    { id: 'approvals', icon: CheckCircle, label: 'Approvals' },
  ];

  return (
    <div className="flex flex-col h-full">
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              // Close sidebar on mobile
              if (window.innerWidth < 1024) {
                const sidebar = document.querySelector('aside');
                if (sidebar) {
                  sidebar.classList.add('-translate-x-full');
                  sidebar.classList.remove('translate-x-0');
                }
                const overlay = document.querySelector('.fixed.inset-0.bg-foreground\\/20');
                if (overlay) {
                  (overlay as HTMLElement).style.display = 'none';
                }
              }
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
              ? 'bg-primary text-primary-foreground shadow-card'
              : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
            {item.id === 'approvals' && (
              <Badge className="ml-auto bg-warning text-warning-foreground">3</Badge>
            )}
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
                {profile?.display_name?.substring(0, 2).toUpperCase() || profile?.email?.substring(0, 2).toUpperCase() || 'AD'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{profile?.display_name || 'Admin'}</p>
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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <DashboardLayout
      title="Lumora Admin Dashboard"
      sidebar={<AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />}
    >
      {activeTab === 'overview' && <AdminOverviewTab setActiveTab={setActiveTab} />}
      {activeTab === 'profile' && <AdminProfileTab />}
      {activeTab === 'schools' && <AdminSchoolsTab />}
      {activeTab === 'users' && <AdminUsersTab />}
      {activeTab === 'competitions' && <AdminCompetitionsTab />}
      {activeTab === 'questions' && <AdminQuestionsTab />}
      {activeTab === 'leaderboard' && <AdminLeaderboardTab />}
      {activeTab === 'badges' && <AdminBadgesTab />}
      {activeTab === 'avatars' && <AdminAvatarsTab />}
      {activeTab === 'messages' && <AdminMessagesTab />}
      {activeTab === 'approvals' && <AdminApprovalsTab />}
    </DashboardLayout>
  );
}

// Admin Overview Tab Component
function AdminOverviewTab({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { toast } = useToast();
  const [showAds, setShowAds] = useState(true);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedShowAds = localStorage.getItem('showAds');
    if (savedShowAds !== null) {
      setShowAds(savedShowAds === 'true');
    }
  }, []);

  const handleAdsToggle = async (checked: boolean) => {
    setLoading(true);
    try {
      setShowAds(checked);
      // Save to localStorage
      localStorage.setItem('showAds', checked.toString());

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('adsSettingChanged', { detail: { showAds: checked } }));

      toast({
        title: 'Ad settings updated',
        description: `Advertisements are now ${checked ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      toast({
        title: 'Error updating ad settings',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats from database
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      try {
        // Get total users
        const { data: users, error: usersError } = await supabase.from('profiles').select('*');
        if (usersError) throw usersError;

        // Get active competitions
        const { data: competitions, error: compError } = await supabase.from('competitions').select('*');
        if (compError) throw compError;

        // Get total questions
        const { data: questions, error: questionsError } = await supabase.from('questions').select('*');
        if (questionsError) throw questionsError;

        // Get pending approvals
        const { data: pending, error: pendingError } = await supabase.from('pending_approvals').select('*');
        if (pendingError) throw pendingError;

        return {
          totalUsers: users.length,
          activeCompetitions: competitions.length,
          totalQuestions: questions.length,
          pendingReviews: pending?.length || 0
        };
      } catch (error) {
        console.error('Error fetching stats:', error);
        return {
          totalUsers: 0,
          activeCompetitions: 0,
          totalQuestions: 0,
          pendingReviews: 0
        };
      }
    }
  });

  const quickActions = [
    { id: 'competitions', icon: Trophy, title: 'Manage Competitions', description: 'Create and edit competitions' },
    { id: 'questions', icon: FileQuestion, title: 'Review Questions', description: 'Approve pending questions' },
    { id: 'users', icon: Users, label: 'User Management', description: 'Manage user accounts' },
    { id: 'schools', icon: School, title: 'School Settings', description: 'Configure school access' },
    { id: 'approvals', icon: CheckCircle, title: 'Pending Approvals', description: 'Review moderator submissions' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Full control over platform activity and settings</p>
        </div>
      </div>

      {/* Settings Cards */}
      <div className="grid md:grid-cols-2 gap-6">
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
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers?.toLocaleString() || '0'}
          icon={Users}
          className="bg-primary/10 border-primary/20"
          loading={statsLoading}
        />
        <StatCard
          title="Active Competitions"
          value={stats?.activeCompetitions?.toString() || '0'}
          icon={Trophy}
          className="bg-accent/10 border-accent/20"
          loading={statsLoading}
        />
        <StatCard
          title="Total Questions"
          value={stats?.totalQuestions?.toLocaleString() || '0'}
          icon={FileQuestion}
          className="bg-success/10 border-success/20"
          loading={statsLoading}
        />
        <StatCard
          title="Pending Approvals"
          value={stats?.pendingReviews?.toString() || '0'}
          icon={Clock}
          className="bg-warning/10 border-warning/20"
          loading={statsLoading}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common admin tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

// Admin Profile Tab Component
function AdminProfileTab() {
  const { profile } = useAuth();
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your admin account</p>
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
              <p className="text-xs text-muted-foreground">Admin role cannot be changed</p>
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
              <p className="text-sm text-muted-foreground">Users Managed</p>
              <p className="text-2xl font-bold">0</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Competitions Created</p>
              <p className="text-2xl font-bold">0</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Questions Approved</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Admin Schools Tab Component
function AdminSchoolsTab() {
  const [schools, setSchools] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newSchool, setNewSchool] = useState({ name: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [students, setStudents] = useState([]);
  const [bulkStudents, setBulkStudents] = useState('');
  const { toast } = useToast();
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('schools').select('*');
      if (error) throw error;
      setSchools(data || []);
    } catch (error) {
      toast({ title: 'Error fetching schools', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const fetchStudentsForSchool = async (schoolId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('school_id', schoolId);
      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      toast({ title: 'Error fetching students', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleCreateSchool = async () => {
    if (!newSchool.name || !newSchool.password) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('schools').insert({
        name: newSchool.name,
        password: newSchool.password,
        created_by: profile?.id
      });

      if (error) throw error;

      toast({ title: 'School created successfully!' });
      setNewSchool({ name: '', password: '' });
      fetchSchools();
    } catch (error) {
      toast({ title: 'Error creating school', description: error.message, variant: 'destructive' });
    }

    setLoading(false);
  };

  const handleUpdateSchool = async () => {
    if (!editingSchool.name) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('schools').update({
        name: editingSchool.name,
        password: editingSchool.password || null
      }).eq('id', editingSchool.id);

      if (error) throw error;

      toast({ title: 'School updated successfully!' });
      setEditingSchool(null);
      fetchSchools();
    } catch (error) {
      toast({ title: 'Error updating school', description: error.message, variant: 'destructive' });
    }

    setLoading(false);
  };

  const handleDeleteSchool = async (schoolId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('schools').delete().eq('id', schoolId);
      if (error) throw error;

      toast({ title: 'School deleted successfully!' });
      fetchSchools();
    } catch (error) {
      toast({ title: 'Error deleting school', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleBulkAddStudents = async () => {
    if (!bulkStudents.trim() || !selectedSchool) {
      toast({ title: 'Please provide student emails and select a school', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const emails = bulkStudents.split('\n').filter(email => email.trim());
      const studentData = emails.map(email => ({
        email: email.trim(),
        role: 'student',
        school_id: selectedSchool.id,
        is_active: true,
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase.from('profiles').insert(studentData);

      if (error) throw error;

      toast({ title: `Successfully added ${emails.length} students!` });
      setBulkStudents('');
      fetchStudentsForSchool(selectedSchool.id);
    } catch (error) {
      toast({ title: 'Error adding students', description: error.message, variant: 'destructive' });
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">School Management</h1>
        <p className="text-muted-foreground">Create and manage schools</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New School</CardTitle>
          <CardDescription>Add a new school to the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>School Name</Label>
              <Input
                value={newSchool.name}
                onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                placeholder="Enter school name"
              />
            </div>

            <div className="space-y-2">
              <Label>Access Password</Label>
              <Input
                type="password"
                value={newSchool.password}
                onChange={(e) => setNewSchool({ ...newSchool, password: e.target.value })}
                placeholder="Enter access password"
              />
            </div>

            <Button
              onClick={handleCreateSchool}
              disabled={loading}
              className="gradient-hero"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create School'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schools List</CardTitle>
          <CardDescription>All registered schools</CardDescription>
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

            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </div>
              ) : filteredSchools.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No schools found</p>
              ) : (
                filteredSchools.map((school) => (
                  <div key={school.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{school.name}</h3>
                        <p className="text-xs text-muted-foreground">Created: {new Date(school.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setSelectedSchool(school);
                            fetchStudentsForSchool(school.id);
                          }}
                        >
                          <UsersIcon className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setEditingSchool(school)}
                        >
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
                                Are you sure you want to delete this school? This action cannot be undone.
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
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* School Students View */}
      {selectedSchool && (
        <Card>
          <CardHeader>
            <CardTitle>Students in {selectedSchool.name}</CardTitle>
            <CardDescription>View and manage students for this school</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Bulk Add Students (one email per line)</Label>
                <Textarea
                  value={bulkStudents}
                  onChange={(e) => setBulkStudents(e.target.value)}
                  placeholder="student1@school.com&#10;student2@school.com&#10;student3@school.com"
                  rows={5}
                />
                <Button
                  onClick={handleBulkAddStudents}
                  disabled={loading}
                  className="gradient-hero"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Bulk Add Students'
                  )}
                </Button>
              </div>

              <div className="overflow-x-auto">
                {students.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No students in this school yet</p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="p-3 text-left font-medium">Name</th>
                        <th className="p-3 text-left font-medium">Email</th>
                        <th className="p-3 text-left font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id} className="border-b border-border/50 last:border-none hover:bg-muted/50 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                                {student.display_name?.split(' ').map(n => n[0]).join('') || student.email?.substring(0, 2).toUpperCase()}
                              </div>
                              <span>{student.display_name || 'No name'}</span>
                            </div>
                          </td>
                          <td className="p-3 text-muted-foreground">{student.email}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs capitalize ${student.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                              {student.is_active ? 'active' : 'inactive'}
                            </span>
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
      )}

      {/* Edit School Dialog */}
      {editingSchool && (
        <Dialog open={!!editingSchool} onOpenChange={() => setEditingSchool(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit School</DialogTitle>
              <DialogDescription>Update school information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>School Name</Label>
                <Input
                  value={editingSchool.name}
                  onChange={(e) => setEditingSchool({ ...editingSchool, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Access Password (leave blank to keep current)</Label>
                <Input
                  type="password"
                  value={editingSchool.password || ''}
                  onChange={(e) => setEditingSchool({ ...editingSchool, password: e.target.value })}
                  placeholder="Enter new password"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingSchool(null)}>Cancel</Button>
              <Button onClick={handleUpdateSchool} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update School'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Admin Users Tab Component
function AdminUsersTab() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const roles = ['all', 'moderator', 'teacher', 'student', 'admin'];

  const filteredUsers = users.filter(user =>
    (user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedRole === 'all' || user.role === selectedRole)
  );

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      toast({ title: 'Error fetching users', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleUpdateUser = async () => {
    if (!editingUser.email || !editingUser.role) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    // Prevent changing admin role
    if (editingUser.role === 'admin' && editingUser.originalRole !== 'admin') {
      toast({ title: 'Cannot change to admin role', description: 'Admin role can only be assigned by system', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('profiles').update({
        role: editingUser.role,
        display_name: editingUser.display_name
      }).eq('id', editingUser.id);

      if (error) throw error;

      toast({ title: 'User updated successfully!' });
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast({ title: 'Error updating user', description: error.message, variant: 'destructive' });
    }

    setLoading(false);
  };

  const handleDeleteUser = async (userId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) throw error;

      toast({ title: 'User deleted successfully!' });
      fetchUsers();
    } catch (error) {
      toast({ title: 'Error deleting user', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleAddModerator = async () => {
    setLoading(true);
    try {
      // This would be a more complex process in a real app
      // For demo purposes, we'll just show a success message
      toast({ title: 'Moderator creation', description: 'Moderator creation would be implemented with proper user invitation flow', variant: 'info' });
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">User Management</h1>
        <p className="text-muted-foreground">View and manage all users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Moderator</CardTitle>
          <CardDescription>Invite a new moderator to the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              onClick={handleAddModerator}
              disabled={loading}
              className="gradient-hero"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Add Moderator'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
          <CardDescription>All platform users</CardDescription>
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
                  {roles.map(role => (
                    <SelectItem key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No users found</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="p-3 text-left font-medium">Name</th>
                      <th className="p-3 text-left font-medium">Email</th>
                      <th className="p-3 text-left font-medium">Role</th>
                      <th className="p-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-border/50 last:border-none hover:bg-muted/50 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                              {user.display_name?.split(' ').map(n => n[0]).join('') || user.email?.substring(0, 2).toUpperCase()}
                            </div>
                            <span>{user.display_name || 'No name'}</span>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">{user.email}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs capitalize ${user.role === 'moderator' || user.role === 'admin' ? 'bg-primary/10 text-primary' : user.role === 'teacher' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setEditingUser({ ...user, originalRole: user.role })}
                            >
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
                                    Are you sure you want to delete this user? This action cannot be undone.
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

      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input
                  value={editingUser.display_name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, display_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                  disabled={editingUser.originalRole === 'admin'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin" disabled={editingUser.originalRole !== 'admin'}>Admin</SelectItem>
                  </SelectContent>
                </Select>
                {editingUser.originalRole === 'admin' && (
                  <p className="text-xs text-muted-foreground">Admin role cannot be changed</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
              <Button onClick={handleUpdateUser} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update User'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Admin Competitions Tab Component
function AdminCompetitionsTab() {
  const [competitions, setCompetitions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState(null);
  const [newCompetition, setNewCompetition] = useState({
    name: '',
    description: '',
    is_active: true,
    start_date: '',
    end_date: ''
  });
  const [sections, setSections] = useState([]);
  const [newSection, setNewSection] = useState({ name: '', description: '', competition_id: '' });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const filteredCompetitions = competitions.filter(comp =>
    comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const fetchSections = async (competitionId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('sections').select('*').eq('competition_id', competitionId);
      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      toast({ title: 'Error fetching sections', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleCreateCompetition = async () => {
    if (!newCompetition.name) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('competitions').insert({
        name: newCompetition.name,
        description: newCompetition.description,
        is_active: newCompetition.is_active,
        start_date: newCompetition.start_date,
        end_date: newCompetition.end_date
      });

      if (error) throw error;

      toast({ title: 'Competition created successfully!' });
      setNewCompetition({
        name: '',
        description: '',
        is_active: true,
        start_date: '',
        end_date: ''
      });
      fetchCompetitions();
    } catch (error) {
      toast({ title: 'Error creating competition', description: error.message, variant: 'destructive' });
    }

    setLoading(false);
  };

  const handleUpdateCompetition = async () => {
    if (!editingCompetition.name) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('competitions').update({
        name: editingCompetition.name,
        description: editingCompetition.description,
        is_active: editingCompetition.is_active,
        start_date: editingCompetition.start_date,
        end_date: editingCompetition.end_date
      }).eq('id', editingCompetition.id);

      if (error) throw error;

      toast({ title: 'Competition updated successfully!' });
      setEditingCompetition(null);
      fetchCompetitions();
    } catch (error) {
      toast({ title: 'Error updating competition', description: error.message, variant: 'destructive' });
    }

    setLoading(false);
  };

  const handleDeleteCompetition = async (competitionId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('competitions').delete().eq('id', competitionId);
      if (error) throw error;

      toast({ title: 'Competition deleted successfully!' });
      fetchCompetitions();
    } catch (error) {
      toast({ title: 'Error deleting competition', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleCreateSection = async () => {
    if (!newSection.name || !newSection.competition_id) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('sections').insert({
        name: newSection.name,
        description: newSection.description,
        competition_id: newSection.competition_id
      });

      if (error) throw error;

      toast({ title: 'Section created successfully!' });
      setNewSection({ name: '', description: '', competition_id: '' });
      fetchSections(newSection.competition_id);
    } catch (error) {
      toast({ title: 'Error creating section', description: error.message, variant: 'destructive' });
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
        <p className="text-muted-foreground">Manage all competitions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Competition</CardTitle>
          <CardDescription>Add a new competition to the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Competition Name</Label>
              <Input
                value={newCompetition.name}
                onChange={(e) => setNewCompetition({ ...newCompetition, name: e.target.value })}
                placeholder="Enter competition name"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newCompetition.description}
                onChange={(e) => setNewCompetition({ ...newCompetition, description: e.target.value })}
                placeholder="Enter competition description"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={newCompetition.start_date}
                  onChange={(e) => setNewCompetition({ ...newCompetition, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={newCompetition.end_date}
                  onChange={(e) => setNewCompetition({ ...newCompetition, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="is-active"
                checked={newCompetition.is_active}
                onCheckedChange={(checked) => setNewCompetition({ ...newCompetition, is_active: checked })}
              />
              <Label htmlFor="is-active">Active Competition</Label>
            </div>

            <Button
              onClick={handleCreateCompetition}
              disabled={loading}
              className="gradient-hero"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Competition'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

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

            <div className="grid md:grid-cols-2 gap-6">
              {loading ? (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </div>
              ) : filteredCompetitions.length === 0 ? (
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
                          <span>{competition.start_date ? new Date(competition.start_date).toLocaleDateString() : 'No start date'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{competition.end_date ? new Date(competition.end_date).toLocaleDateString() : 'No end date'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setEditingCompetition(competition);
                              fetchSections(competition.id);
                            }}
                          >
                            <Edit className="w-3 h-3 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setNewSection({ ...newSection, competition_id: competition.id });
                              fetchSections(competition.id);
                            }}
                          >
                            <FolderPlus className="w-3 h-3 mr-2" />
                            Add Section
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" className="flex-1">
                                <Trash2 className="w-3 h-3 mr-2" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Competition</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this competition? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive hover:bg-destructive/90"
                                  onClick={() => handleDeleteCompetition(competition.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Section Dialog */}
      {newSection.competition_id && (
        <Dialog open={!!newSection.competition_id} onOpenChange={() => setNewSection({ name: '', description: '', competition_id: '' })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Section</DialogTitle>
              <DialogDescription>Create a new section for this competition</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Section Name</Label>
                <Input
                  value={newSection.name}
                  onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                  placeholder="Enter section name"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newSection.description}
                  onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
                  placeholder="Enter section description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewSection({ name: '', description: '', competition_id: '' })}>Cancel</Button>
              <Button onClick={handleCreateSection} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Section'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Competition Dialog */}
      {editingCompetition && (
        <Dialog open={!!editingCompetition} onOpenChange={() => setEditingCompetition(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Competition</DialogTitle>
              <DialogDescription>Update competition information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={editingCompetition.name}
                  onChange={(e) => setEditingCompetition({ ...editingCompetition, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingCompetition.description || ''}
                  onChange={(e) => setEditingCompetition({ ...editingCompetition, description: e.target.value })}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={editingCompetition.start_date || ''}
                    onChange={(e) => setEditingCompetition({ ...editingCompetition, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={editingCompetition.end_date || ''}
                    onChange={(e) => setEditingCompetition({ ...editingCompetition, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="is-active"
                  checked={editingCompetition.is_active}
                  onCheckedChange={(checked) => setEditingCompetition({ ...editingCompetition, is_active: checked })}
                />
                <Label htmlFor="is-active">Active Competition</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingCompetition(null)}>Cancel</Button>
              <Button onClick={handleUpdateCompetition} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Competition'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Admin Questions Tab Component
function AdminQuestionsTab() {
  const [questions, setQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    correct_answer: '',
    points: 10,
    options: [],
    question_type: 'multiple_choice',
    section_id: '',
    image_url: '',
    allow_repetition: true
  });
  const [sections, setSections] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [fileUploading, setFileUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const filteredQuestions = questions.filter(q =>
    q.question_text.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase.from('sections').select('*');
      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const fetchCompetitions = async () => {
    try {
      const { data, error } = await supabase.from('competitions').select('*');
      if (error) throw error;
      setCompetitions(data || []);
    } catch (error) {
      console.error('Error fetching competitions:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setFileUploading(true);

    try {
      // Generate a unique filename
      const fileName = `questions/${Date.now()}_${file.name}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('question_images')
        .upload(fileName, file);

      if (error) throw error;

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('question_images')
        .getPublicUrl(fileName);

      if (urlData.publicUrl) {
        setNewQuestion({ ...newQuestion, image_url: urlData.publicUrl });
        toast({ title: 'Image uploaded successfully!' });
      }
    } catch (error) {
      toast({ title: 'Error uploading image', description: error.message, variant: 'destructive' });
    }

    setFileUploading(false);
  };

  const handleCreateQuestion = async () => {
    if (!newQuestion.question_text || !newQuestion.correct_answer) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('questions').insert({
        question_text: newQuestion.question_text,
        correct_answer: newQuestion.correct_answer,
        points: newQuestion.points,
        options: newQuestion.options,
        question_type: newQuestion.question_type,
        section_id: newQuestion.section_id,
        image_url: newQuestion.image_url,
        allow_repetition: newQuestion.allow_repetition
      });

      if (error) throw error;

      toast({ title: 'Question created successfully!' });
      setNewQuestion({
        question_text: '',
        correct_answer: '',
        points: 10,
        options: [],
        question_type: 'multiple_choice',
        section_id: '',
        image_url: '',
        allow_repetition: true
      });
      fetchQuestions();
    } catch (error) {
      toast({ title: 'Error creating question', description: error.message, variant: 'destructive' });
    }

    setLoading(false);
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion.question_text || !editingQuestion.correct_answer) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('questions').update({
        question_text: editingQuestion.question_text,
        correct_answer: editingQuestion.correct_answer,
        points: editingQuestion.points,
        options: editingQuestion.options,
        question_type: editingQuestion.question_type,
        section_id: editingQuestion.section_id,
        image_url: editingQuestion.image_url,
        allow_repetition: editingQuestion.allow_repetition
      }).eq('id', editingQuestion.id);

      if (error) throw error;

      toast({ title: 'Question updated successfully!' });
      setEditingQuestion(null);
      fetchQuestions();
    } catch (error) {
      toast({ title: 'Error updating question', description: error.message, variant: 'destructive' });
    }

    setLoading(false);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('questions').delete().eq('id', questionId);
      if (error) throw error;

      toast({ title: 'Question deleted successfully!' });
      fetchQuestions();
    } catch (error) {
      toast({ title: 'Error deleting question', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestions();
    fetchSections();
    fetchCompetitions();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Questions</h1>
        <p className="text-muted-foreground">Manage all questions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Question</CardTitle>
          <CardDescription>Add a new question to the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Question Text</Label>
              <Textarea
                value={newQuestion.question_text}
                onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                placeholder="Enter the question text"
              />
            </div>

            <div className="space-y-2">
              <Label>Correct Answer</Label>
              <Input
                value={newQuestion.correct_answer}
                onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
                placeholder="Enter the correct answer"
              />
            </div>

            <div className="space-y-2">
              <Label>Points</Label>
              <Input
                type="number"
                value={newQuestion.points}
                onChange={(e) => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) })}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label>Options (comma separated for multiple choice)</Label>
              <Input
                value={Array.isArray(newQuestion.options) ? newQuestion.options.join(', ') : ''}
                onChange={(e) => setNewQuestion({ ...newQuestion, options: e.target.value.split(',').map(o => o.trim()) })}
                placeholder="Option 1, Option 2, Option 3"
              />
            </div>

            <div className="space-y-2">
              <Label>Question Type</Label>
              <Select
                value={newQuestion.question_type}
                onValueChange={(value) => setNewQuestion({ ...newQuestion, question_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select question type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="true_false">True/False</SelectItem>
                  <SelectItem value="short_answer">Short Answer</SelectItem>
                  <SelectItem value="essay">Essay</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Section</Label>
              <Select
                value={newQuestion.section_id}
                onValueChange={(value) => setNewQuestion({ ...newQuestion, section_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map(section => (
                    <SelectItem key={section.id} value={section.id}>{section.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Question Image</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={fileUploading}
                  className="cursor-pointer"
                />
                {fileUploading && <Loader2 className="w-4 h-4 animate-spin" />}
              </div>
              {newQuestion.image_url && (
                <div className="mt-2">
                  <img src={newQuestion.image_url} alt="Question preview" className="max-w-xs max-h-32 object-contain rounded-lg" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="allow-repetition"
                checked={newQuestion.allow_repetition}
                onCheckedChange={(checked) => setNewQuestion({ ...newQuestion, allow_repetition: checked })}
              />
              <Label htmlFor="allow-repetition">Allow Question Repetition</Label>
            </div>

            <Button
              onClick={handleCreateQuestion}
              disabled={loading}
              className="gradient-hero"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Question'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Questions List</CardTitle>
          <CardDescription>All platform questions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </div>
              ) : filteredQuestions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No questions found</p>
              ) : (
                filteredQuestions.map((question) => (
                  <div key={question.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-medium mb-2">{question.question_text}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Points: {question.points}</span>
                          <span>Type: {question.question_type}</span>
                          <span>Section: {question.section_id}</span>
                        </div>
                        {question.image_url && (
                          <img src={question.image_url} alt="Question" className="mt-2 max-w-xs max-h-20 object-contain rounded-lg" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setEditingQuestion(question)}
                        >
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
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Question Dialog */}
      {editingQuestion && (
        <Dialog open={!!editingQuestion} onOpenChange={() => setEditingQuestion(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Question</DialogTitle>
              <DialogDescription>Update question information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Question Text</Label>
                <Textarea
                  value={editingQuestion.question_text}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, question_text: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Correct Answer</Label>
                <Input
                  value={editingQuestion.correct_answer}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, correct_answer: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Points</Label>
                <Input
                  type="number"
                  value={editingQuestion.points}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, points: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Options (comma separated)</Label>
                <Input
                  value={Array.isArray(editingQuestion.options) ? editingQuestion.options.join(', ') : ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, options: e.target.value.split(',').map(o => o.trim()) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Question Type</Label>
                <Select
                  value={editingQuestion.question_type}
                  onValueChange={(value) => setEditingQuestion({ ...editingQuestion, question_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select question type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="true_false">True/False</SelectItem>
                    <SelectItem value="short_answer">Short Answer</SelectItem>
                    <SelectItem value="essay">Essay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Section</Label>
                <Select
                  value={editingQuestion.section_id}
                  onValueChange={(value) => setEditingQuestion({ ...editingQuestion, section_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map(section => (
                      <SelectItem key={section.id} value={section.id}>{section.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Question Image</Label>
                {editingQuestion.image_url && (
                  <img src={editingQuestion.image_url} alt="Question preview" className="max-w-xs max-h-32 object-contain rounded-lg" />
                )}
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="allow-repetition-edit"
                  checked={editingQuestion.allow_repetition}
                  onCheckedChange={(checked) => setEditingQuestion({ ...editingQuestion, allow_repetition: checked })}
                />
                <Label htmlFor="allow-repetition-edit">Allow Question Repetition</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingQuestion(null)}>Cancel</Button>
              <Button onClick={handleUpdateQuestion} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Question'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Admin Leaderboard Tab Component
function AdminLeaderboardTab() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [leaderboardType, setLeaderboardType] = useState('schools');
  const { toast } = useToast();

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // This would be a more complex query in a real app
      const { data, error } = await supabase.from('profiles').select('*').order('score', { ascending: false }).limit(50);
      if (error) throw error;
      setLeaderboard(data || []);
    } catch (error) {
      toast({ title: 'Error fetching leaderboard', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Leaderboard</h1>
        <p className="text-muted-foreground">View top performers</p>
      </div>

      {/* Leaderboard Type Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard Type</CardTitle>
          <CardDescription>Select which leaderboard to view</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={leaderboardType} onValueChange={setLeaderboardType}>
            <SelectTrigger className="w-full max-w-sm">
              <SelectValue placeholder="Select leaderboard type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="schools">School Rankings (Total Points)</SelectItem>
              <SelectItem value="students">Top Students (Points)</SelectItem>
              <SelectItem value="classes">Top Students by Class</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* School Rankings Leaderboard */}
      {leaderboardType === 'schools' && (
        <Card>
          <CardHeader>
            <CardTitle>School Rankings</CardTitle>
            <CardDescription>Top schools by total points</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </div>
              ) : leaderboard.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No school ranking data</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="p-3 text-left font-medium">Rank</th>
                      <th className="p-3 text-left font-medium">School</th>
                      <th className="p-3 text-left font-medium">Total Points</th>
                      <th className="p-3 text-left font-medium">Students</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((school, index) => (
                      <tr key={school.id} className="border-b border-border/50 last:border-none hover:bg-muted/50 transition-colors">
                        <td className="p-3 font-medium">{index + 1}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                              {school.name?.substring(0, 2).toUpperCase() || 'S'}
                            </div>
                            <span>{school.name || 'Unknown School'}</span>
                          </div>
                        </td>
                        <td className="p-3 font-bold">{school.total_points || 0}</td>
                        <td className="p-3 text-muted-foreground">{school.student_count || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Students Leaderboard */}
      {leaderboardType === 'students' && (
        <Card>
          <CardHeader>
            <CardTitle>Top Students</CardTitle>
            <CardDescription>Highest scoring students across all schools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </div>
              ) : leaderboard.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No student leaderboard data</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="p-3 text-left font-medium">Rank</th>
                      <th className="p-3 text-left font-medium">Student</th>
                      <th className="p-3 text-left font-medium">School</th>
                      <th className="p-3 text-left font-medium">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((student, index) => (
                      <tr key={student.id} className="border-b border-border/50 last:border-none hover:bg-muted/50 transition-colors">
                        <td className="p-3 font-medium">{index + 1}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                              {student.display_name?.split(' ').map(n => n[0]).join('') || student.email?.substring(0, 2).toUpperCase()}
                            </div>
                            <span>{student.display_name || 'No name'}</span>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">{student.school || 'N/A'}</td>
                        <td className="p-3 font-bold">{student.score?.toLocaleString() || '0'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Students by Class Leaderboard */}
      {leaderboardType === 'classes' && (
        <Card>
          <CardHeader>
            <CardTitle>Top Students by Class</CardTitle>
            <CardDescription>Highest scoring students within their classes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </div>
              ) : leaderboard.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No class leaderboard data</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="p-3 text-left font-medium">Rank</th>
                      <th className="p-3 text-left font-medium">Student</th>
                      <th className="p-3 text-left font-medium">Class</th>
                      <th className="p-3 text-left font-medium">School</th>
                      <th className="p-3 text-left font-medium">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((student, index) => (
                      <tr key={student.id} className="border-b border-border/50 last:border-none hover:bg-muted/50 transition-colors">
                        <td className="p-3 font-medium">{index + 1}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                              {student.display_name?.split(' ').map(n => n[0]).join('') || student.email?.substring(0, 2).toUpperCase()}
                            </div>
                            <span>{student.display_name || 'No name'}</span>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">{student.class || 'N/A'}</td>
                        <td className="p-3 text-muted-foreground">{student.school || 'N/A'}</td>
                        <td className="p-3 font-bold">{student.score?.toLocaleString() || '0'}</td>
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

// Admin Badges Tab Component
function AdminBadgesTab() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [newBadge, setNewBadge] = useState({
    name: '',
    description: '',
    requirement_type: 'score',
    requirement_value: 100,
    image_url: ''
  });
  const [fileUploading, setFileUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchBadges = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('badges').select('*');
      if (error) throw error;
      setBadges(data || []);
    } catch (error) {
      toast({ title: 'Error fetching badges', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setFileUploading(true);

    try {
      // Generate a unique filename
      const fileName = `badges/${Date.now()}_${file.name}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('badge_images')
        .upload(fileName, file);

      if (error) throw error;

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('badge_images')
        .getPublicUrl(fileName);

      if (urlData.publicUrl) {
        setNewBadge({ ...newBadge, image_url: urlData.publicUrl });
        toast({ title: 'Badge image uploaded successfully!' });
      }
    } catch (error) {
      toast({ title: 'Error uploading badge image', description: error.message, variant: 'destructive' });
    }

    setFileUploading(false);
  };

  const handleCreateBadge = async () => {
    if (!newBadge.name || !newBadge.description) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('badges').insert({
        name: newBadge.name,
        description: newBadge.description,
        requirement_type: newBadge.requirement_type,
        requirement_value: newBadge.requirement_value,
        image_url: newBadge.image_url
      });

      if (error) throw error;

      toast({ title: 'Badge created successfully!' });
      setNewBadge({
        name: '',
        description: '',
        requirement_type: 'score',
        requirement_value: 100,
        image_url: ''
      });
      fetchBadges();
    } catch (error) {
      toast({ title: 'Error creating badge', description: error.message, variant: 'destructive' });
    }

    setLoading(false);
  };

  const handleUpdateBadge = async () => {
    if (!editingBadge.name || !editingBadge.description) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('badges').update({
        name: editingBadge.name,
        description: editingBadge.description,
        requirement_type: editingBadge.requirement_type,
        requirement_value: editingBadge.requirement_value,
        image_url: editingBadge.image_url
      }).eq('id', editingBadge.id);

      if (error) throw error;

      toast({ title: 'Badge updated successfully!' });
      setEditingBadge(null);
      fetchBadges();
    } catch (error) {
      toast({ title: 'Error updating badge', description: error.message, variant: 'destructive' });
    }

    setLoading(false);
  };

  const handleDeleteBadge = async (badgeId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('badges').delete().eq('id', badgeId);
      if (error) throw error;

      toast({ title: 'Badge deleted successfully!' });
      fetchBadges();
    } catch (error) {
      toast({ title: 'Error deleting badge', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Badges</h1>
        <p className="text-muted-foreground">Manage achievement badges</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Badge</CardTitle>
          <CardDescription>Add a new badge to the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Badge Name</Label>
              <Input
                value={newBadge.name}
                onChange={(e) => setNewBadge({ ...newBadge, name: e.target.value })}
                placeholder="Enter badge name"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newBadge.description}
                onChange={(e) => setNewBadge({ ...newBadge, description: e.target.value })}
                placeholder="Enter badge description"
              />
            </div>

            <div className="space-y-2">
              <Label>Requirement Type</Label>
              <Select
                value={newBadge.requirement_type}
                onValueChange={(value) => setNewBadge({ ...newBadge, requirement_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select requirement type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Score</SelectItem>
                  <SelectItem value="questions_answered">Questions Answered</SelectItem>
                  <SelectItem value="competitions_won">Competitions Won</SelectItem>
                  <SelectItem value="badges_earned">Badges Earned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Requirement Value</Label>
              <Input
                type="number"
                value={newBadge.requirement_value}
                onChange={(e) => setNewBadge({ ...newBadge, requirement_value: parseInt(e.target.value) })}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label>Badge Image</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={fileUploading}
                  className="cursor-pointer"
                />
                {fileUploading && <Loader2 className="w-4 h-4 animate-spin" />}
              </div>
              {newBadge.image_url && (
                <div className="mt-2">
                  <img src={newBadge.image_url} alt="Badge preview" className="w-16 h-16 object-contain rounded-lg" />
                </div>
              )}
            </div>

            <Button
              onClick={handleCreateBadge}
              disabled={loading}
              className="gradient-hero"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Badge'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Badges List</CardTitle>
          <CardDescription>All platform badges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </div>
            ) : badges.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No badges found</p>
            ) : (
              badges.map((badge) => (
                <div key={badge.id} className="p-4 rounded-xl bg-muted/50 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm">{badge.name}</h3>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setEditingBadge(badge)}
                      >
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
                              Are you sure you want to delete this badge? This action cannot be undone.
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
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    {badge.image_url ? (
                      <img src={badge.image_url} alt={badge.name} className="w-12 h-12 object-contain" />
                    ) : (
                      <Award className="w-8 h-8 text-gold" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground text-center">{badge.description}</p>
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    {badge.requirement_type}: {badge.requirement_value}
                  </p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Badge Dialog */}
      {editingBadge && (
        <Dialog open={!!editingBadge} onOpenChange={() => setEditingBadge(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Badge</DialogTitle>
              <DialogDescription>Update badge information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={editingBadge.name}
                  onChange={(e) => setEditingBadge({ ...editingBadge, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingBadge.description || ''}
                  onChange={(e) => setEditingBadge({ ...editingBadge, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Requirement Type</Label>
                <Select
                  value={editingBadge.requirement_type}
                  onValueChange={(value) => setEditingBadge({ ...editingBadge, requirement_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select requirement type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="score">Score</SelectItem>
                    <SelectItem value="questions_answered">Questions Answered</SelectItem>
                    <SelectItem value="competitions_won">Competitions Won</SelectItem>
                    <SelectItem value="badges_earned">Badges Earned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Requirement Value</Label>
                <Input
                  type="number"
                  value={editingBadge.requirement_value || ''}
                  onChange={(e) => setEditingBadge({ ...editingBadge, requirement_value: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Badge Image</Label>
                {editingBadge.image_url && (
                  <img src={editingBadge.image_url} alt="Badge preview" className="w-16 h-16 object-contain rounded-lg" />
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingBadge(null)}>Cancel</Button>
              <Button onClick={handleUpdateBadge} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Badge'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Admin Avatars Tab Component
function AdminAvatarsTab() {
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newAvatar, setNewAvatar] = useState({
    name: '',
    image_url: ''
  });
  const [fileUploading, setFileUploading] = useState(false);
  const { toast } = useToast();

  const fetchAvatars = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('avatars').select('*');
      if (error) throw error;
      setAvatars(data || []);
    } catch (error) {
      toast({ title: 'Error fetching avatars', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setFileUploading(true);

    try {
      // Generate a unique filename
      const fileName = `avatars/${Date.now()}_${file.name}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('avatar_images')
        .upload(fileName, file);

      if (error) throw error;

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('avatar_images')
        .getPublicUrl(fileName);

      if (urlData.publicUrl) {
        setNewAvatar({ ...newAvatar, image_url: urlData.publicUrl });
        toast({ title: 'Avatar image uploaded successfully!' });
      }
    } catch (error) {
      toast({ title: 'Error uploading avatar image', description: error.message, variant: 'destructive' });
    }

    setFileUploading(false);
  };

  const handleCreateAvatar = async () => {
    if (!newAvatar.name || !newAvatar.image_url) {
      toast({ title: 'Please fill all fields and upload an image', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('avatars').insert({
        name: newAvatar.name,
        image_url: newAvatar.image_url
      });

      if (error) throw error;

      toast({ title: 'Avatar created successfully!' });
      setNewAvatar({
        name: '',
        image_url: ''
      });
      fetchAvatars();
    } catch (error) {
      toast({ title: 'Error creating avatar', description: error.message, variant: 'destructive' });
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAvatars();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Avatars</h1>
        <p className="text-muted-foreground">Manage user avatars</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload New Avatar</CardTitle>
          <CardDescription>Add a new avatar for users to choose</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Avatar Name</Label>
              <Input
                value={newAvatar.name}
                onChange={(e) => setNewAvatar({ ...newAvatar, name: e.target.value })}
                placeholder="Enter avatar name"
              />
            </div>

            <div className="space-y-2">
              <Label>Avatar Image</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={fileUploading}
                  className="cursor-pointer"
                />
                {fileUploading && <Loader2 className="w-4 h-4 animate-spin" />}
              </div>
              {newAvatar.image_url && (
                <div className="mt-2">
                  <img src={newAvatar.image_url} alt="Avatar preview" className="w-16 h-16 object-contain rounded-lg" />
                </div>
              )}
            </div>

            <Button
              onClick={handleCreateAvatar}
              disabled={loading}
              className="gradient-hero"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload Avatar'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Avatars List</CardTitle>
          <CardDescription>All platform avatars</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </div>
            ) : avatars.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No avatars found</p>
            ) : (
              avatars.map((avatar) => (
                <div key={avatar.id} className="p-2 rounded-lg bg-muted/50 border border-border/50 hover:bg-muted transition-colors">
                  <img
                    src={avatar.image_url}
                    alt={avatar.name}
                    className="w-full h-16 object-cover rounded-lg mb-2"
                  />
                  <p className="text-xs text-center truncate">{avatar.name}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Admin Messages Tab Component
function AdminMessagesTab() {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState({
    subject: '',
    content: '',
    receiver_email: '',
    receiver_role: 'all'
  });
  const { toast } = useToast();
  const { profile } = useAuth();
  const queryClient = useQueryClient();

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

  const handleSendNewMessage = async () => {
    if (!newMessage.subject || !newMessage.content || !newMessage.receiver_email) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      let receiverIds = [];

      if (newMessage.receiver_role === 'all') {
        // Send to all users
        const { data: users, error: usersError } = await supabase.from('profiles').select('id');
        if (usersError) throw usersError;
        receiverIds = users.map(user => user.id);
      } else {
        // Send to specific role
        const { data: users, error: usersError } = await supabase.from('profiles').select('id').eq('role', newMessage.receiver_role);
        if (usersError) throw usersError;
        receiverIds = users.map(user => user.id);
      }

      // If specific email provided, use that instead
      if (newMessage.receiver_email.includes('@')) {
        const { data: user, error: userError } = await supabase.from('profiles').select('id').eq('email', newMessage.receiver_email).single();
        if (userError) throw userError;
        receiverIds = [user.id];
      }

      // Send message to all receivers
      const messageData = receiverIds.map(receiverId => ({
        subject: newMessage.subject,
        content: newMessage.content,
        receiver_id: receiverId,
        sender_id: profile?.id,
        sender_email: profile?.email,
        is_system: false
      }));

      const { error } = await supabase.from('messages').insert(messageData);

      if (error) throw error;

      toast({ title: `Message sent to ${receiverIds.length} recipient(s)!` });
      setNewMessage({
        subject: '',
        content: '',
        receiver_email: '',
        receiver_role: 'all'
      });
    } catch (error) {
      toast({ title: 'Error sending message', description: error.message, variant: 'destructive' });
    }

    setLoading(false);
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

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Messages</h1>
        <p className="text-muted-foreground">Your communications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Send New Message</CardTitle>
          <CardDescription>Send messages to users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={newMessage.subject}
                onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                placeholder="Enter message subject"
              />
            </div>

            <div className="space-y-2">
              <Label>Message Content</Label>
              <Textarea
                value={newMessage.content}
                onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                placeholder="Enter your message"
                rows={6}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Send To</Label>
                <Select
                  value={newMessage.receiver_role}
                  onValueChange={(value) => setNewMessage({ ...newMessage, receiver_role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="student">All Students</SelectItem>
                    <SelectItem value="teacher">All Teachers</SelectItem>
                    <SelectItem value="moderator">All Moderators</SelectItem>
                    <SelectItem value="specific">Specific Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newMessage.receiver_role === 'specific' && (
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    value={newMessage.receiver_email}
                    onChange={(e) => setNewMessage({ ...newMessage, receiver_email: e.target.value })}
                    placeholder="user@school.com"
                  />
                </div>
              )}
            </div>

            <Button
              onClick={handleSendNewMessage}
              disabled={loading}
              className="gradient-hero"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Message'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

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

// Admin Approvals Tab Component
function AdminApprovalsTab() {
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [approvalAction, setApprovalAction] = useState('');
  const { toast } = useToast();

  // Mock data for pending approvals
  useEffect(() => {
    // In a real app, this would fetch from a pending_approvals table
    const mockPendingItems = [
      {
        id: '1',
        type: 'competition',
        title: 'Spring Math Challenge',
        submitted_by: 'Demo Moderator',
        submitted_at: '2024-03-15',
        status: 'pending',
        details: {
          name: 'Spring Math Challenge',
          description: 'Annual math competition for high school students',
          start_date: '2024-04-01',
          end_date: '2024-04-30'
        }
      },
      {
        id: '2',
        type: 'question',
        title: 'Advanced Algebra Question',
        submitted_by: 'Demo Teacher',
        submitted_at: '2024-03-14',
        status: 'pending',
        details: {
          question_text: 'Solve for x: 3x² + 5x - 2 = 0',
          correct_answer: 'x = [-5 ± √(25 + 24)] / 6',
          points: 15,
          question_type: 'short_answer'
        }
      },
      {
        id: '3',
        type: 'badge',
        title: 'Math Master Badge',
        submitted_by: 'Demo Moderator',
        submitted_at: '2024-03-13',
        status: 'pending',
        details: {
          name: 'Math Master',
          description: 'Awarded for solving 100 advanced math problems',
          requirement_type: 'questions_answered',
          requirement_value: 100
        }
      }
    ];
    setPendingItems(mockPendingItems);
  }, []);

  const handleApprove = async (itemId: string) => {
    setLoading(true);
    try {
      // In a real app, this would update the database
      await new Promise(resolve => setTimeout(resolve, 1000));

      setPendingItems(pendingItems.filter(item => item.id !== itemId));
      toast({ title: 'Item approved successfully!' });
    } catch (error) {
      toast({ title: 'Error approving item', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleReject = async (itemId: string) => {
    setLoading(true);
    try {
      // In a real app, this would update the database
      await new Promise(resolve => setTimeout(resolve, 1000));

      setPendingItems(pendingItems.filter(item => item.id !== itemId));
      toast({ title: 'Item rejected successfully!' });
    } catch (error) {
      toast({ title: 'Error rejecting item', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const getTypeInfo = (type: string) => {
    const types = {
      competition: { icon: Trophy, color: 'text-accent' },
      question: { icon: FileQuestion, color: 'text-success' },
      badge: { icon: Award, color: 'text-warning' },
      school: { icon: School, color: 'text-primary' },
      user: { icon: Users, color: 'text-muted-foreground' }
    };
    return types[type] || { icon: FileText, color: 'text-muted-foreground' };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Pending Approvals</h1>
        <p className="text-muted-foreground">Review and approve moderator submissions</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Pending Items</CardTitle>
              <CardDescription>{pendingItems.length} items waiting for approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {pendingItems.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No pending items</p>
                ) : (
                  pendingItems.map((item) => {
                    const { icon: Icon, color } = getTypeInfo(item.type);
                    return (
                      <button
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`w-full text-left p-3 rounded-lg transition-colors border border-border/50 hover:bg-muted/50 ${selectedItem?.id === item.id ? 'bg-primary/10 border-primary' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${item.status === 'pending' ? 'bg-warning/10' : 'bg-success/10'}`}>
                            <Icon className={`w-5 h-5 ${color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium">{item.title}</p>
                              <span className={`text-xs px-2 py-1 rounded-full ${item.status === 'pending' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'}`}>
                                {item.status}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">Submitted by: {item.submitted_by}</p>
                            <p className="text-xs text-muted-foreground">{item.submitted_at}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          {selectedItem ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedItem.title}</CardTitle>
                <CardDescription>
                  Submitted by {selectedItem.submitted_by} • {selectedItem.submitted_at}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <div className="flex items-center gap-2">
                      {getTypeInfo(selectedItem.type).icon({ className: 'w-4 h-4' })}
                      <span className="capitalize">{selectedItem.type}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Details</Label>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                      {Object.entries(selectedItem.details).map(([key, value]) => (
                        <div key={key} className="flex items-start gap-3">
                          <span className="text-sm font-medium capitalize w-24">{key.replace('_', ' ')}</span>
                          <span className="text-sm flex-1">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <Label>Action</Label>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleApprove(selectedItem.id)}
                        disabled={loading}
                        className="flex-1 gradient-success"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Approving...
                          </>
                        ) : (
                          'Approve'
                        )}
                      </Button>
                      <Button
                        onClick={() => handleReject(selectedItem.id)}
                        disabled={loading}
                        variant="destructive"
                        className="flex-1"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Rejecting...
                          </>
                        ) : (
                          'Reject'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4" />
                  <p>Select an item to review</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}