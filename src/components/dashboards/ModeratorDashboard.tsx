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
  Check
} from 'lucide-react';
import { defaultSiteContent, SiteContent } from '@/lib/siteContent';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

function ModeratorSidebar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const { profile } = useAuth();
  const navItems = [
    { id: 'overview', icon: Settings, label: 'Overview' },
    { id: 'profile', icon: Users, label: 'My Profile' },
    { id: 'schools', icon: School, label: 'Schools' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'competitions', icon: Trophy, label: 'Competitions' },
    { id: 'questions', icon: FileQuestion, label: 'Questions' },
    { id: 'badges', icon: Award, label: 'Badges' },
    { id: 'avatars', icon: UserPlus, label: 'Avatars' },
    { id: 'messages', icon: MessageSquare, label: 'Messages' },
    { id: 'landing', icon: LayoutTemplate, label: 'Landing Page' },
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
      title="Moderator Dashboard"
      sidebar={<ModeratorSidebar activeTab={activeTab} setActiveTab={setActiveTab} />}
    >
      {activeTab === 'overview' && <OverviewTab setActiveTab={setActiveTab} />}
      {activeTab === 'profile' && <ProfileTab />}
      {activeTab === 'schools' && <SchoolsTab />}
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'competitions' && <CompetitionsTab />}
      {activeTab === 'questions' && <QuestionsTab />}
      {activeTab === 'badges' && <BadgesTab />}
      {activeTab === 'avatars' && <AvatarsTab />}
      {activeTab === 'messages' && <MessagesTab />}
      {activeTab === 'landing' && <LandingPageTab />}
    </DashboardLayout>
  );
}

function ProfileTab() {
  const { profile, user } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateProfile = useMutation({
    mutationFn: async (updates: any) => {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({ title: 'Profile updated!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const uploadPFP = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${profile?.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await updateProfile.mutateAsync({ avatar_url: publicUrl });
      toast({ title: 'Profile picture updated!' });
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-display font-bold">My Profile</h2>
      </div>

      <Card className="border-border/40 shadow-glow overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20"></div>
        <CardContent className="relative pt-0 px-8 pb-8">
          <div className="flex flex-col md:flex-row items-end gap-6 -mt-12 mb-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-3xl border-4 border-background overflow-hidden bg-muted shadow-xl">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <div className="w-full h-full gradient-hero flex items-center justify-center text-primary-foreground text-4xl font-bold">
                    {profile?.display_name?.substring(0, 1).toUpperCase() || profile?.email?.substring(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              <label
                htmlFor="pfp-upload"
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl cursor-pointer"
              >
                <div className="p-2 bg-white/20 backdrop-blur-md rounded-full">
                  {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : <ImagePlus className="w-6 h-6 text-white" />}
                </div>
              </label>
              <input type="file" id="pfp-upload" className="hidden" accept="image/*" onChange={uploadPFP} disabled={isUploading} />
            </div>

            <div className="flex-1 pb-2">
              <h3 className="text-2xl font-bold">{profile?.display_name || 'Set your display name'}</h3>
              <p className="text-muted-foreground">{profile?.email}</p>
              <div className="mt-2 flex gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
                  {profile?.role}
                </span>
                <span className="px-3 py-1 bg-muted text-muted-foreground text-xs font-bold rounded-full uppercase tracking-wider">
                  Admin Access
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="space-y-2">
              <Label>Display Name</Label>
              <div className="flex gap-2">
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Moderator Name"
                  className="max-w-sm"
                />
                <Button
                  onClick={() => updateProfile.mutate({ display_name: displayName })}
                  disabled={updateProfile.isPending || displayName === profile?.display_name}
                >
                  Update
                </Button>
              </div>
              <p className="text-xs text-muted-foreground italic">This name will be visible to teachers and students.</p>
            </div>

            <div className="pt-4 border-t border-border/50">
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-widest text-muted-foreground">Account Security</h4>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <ShieldPlus className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Password Management</p>
                    <p className="text-xs text-muted-foreground">Manage your authentication credentials</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast({ title: 'Magic Link sent to email' })}>
                  Reset Password
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OverviewTab({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { data: stats } = useQuery({
    queryKey: ['moderator-stats'],
    queryFn: async () => {
      const [schools, profiles, competitions, questions] = await Promise.all([
        supabase.from('schools').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('competitions').select('id', { count: 'exact', head: true }),
        supabase.from('questions').select('id', { count: 'exact', head: true }),
      ]);
      return {
        schools: schools.count || 0,
        users: profiles.count || 0,
        competitions: competitions.count || 0,
        questions: questions.count || 0,
      };
    },
  });

  const statCards = [
    { label: 'Schools', value: stats?.schools || 0, icon: School, color: 'text-accent' },
    { label: 'Users', value: stats?.users || 0, icon: Users, color: 'text-primary' },
    { label: 'Competitions', value: stats?.competitions || 0, icon: Trophy, color: 'text-gold' },
    { label: 'Questions', value: stats?.questions || 0, icon: FileQuestion, color: 'text-success' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold">Welcome, Moderator!</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-border/50 shadow-card hover:shadow-card-hover transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-muted">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-3xl font-display font-bold">{stat.value}</p>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button className="h-24 flex-col gap-2" variant="outline" onClick={() => setActiveTab('schools')}>
              <School className="w-6 h-6" />
              Add School
            </Button>
            <Button className="h-24 flex-col gap-2" variant="outline" onClick={() => setActiveTab('users')}>
              <UserPlus className="w-6 h-6" />
              Add Users
            </Button>
            <Button className="h-24 flex-col gap-2" variant="outline" onClick={() => setActiveTab('competitions')}>
              <Trophy className="w-6 h-6" />
              New Competition
            </Button>
            <Button className="h-24 flex-col gap-2" variant="outline" onClick={() => setActiveTab('questions')}>
              <FileQuestion className="w-6 h-6" />
              Add Questions
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              Activity feed will appear here
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SchoolsTab() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [viewingSchool, setViewingSchool] = useState<any>(null);
  const [schoolName, setSchoolName] = useState('');
  const [schoolPassword, setSchoolPassword] = useState('');
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: schools, isLoading } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase.from('schools').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: schoolMembers } = useQuery({
    queryKey: ['school-members', viewingSchool?.id],
    queryFn: async () => {
      if (!viewingSchool) return [];

      // First get memberships
      const { data: memberships, error: memError } = await supabase
        .from('school_memberships')
        .select('*')
        .eq('school_id', viewingSchool.id);

      if (memError) throw memError;

      if (!memberships || memberships.length === 0) return [];

      // Get user IDs
      const userIds = memberships.map(m => m.user_id);

      // Fetch profiles manually
      const { data: profiles, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds); // Assuming user_id is the link in profiles, usually it's 'id' if using auth.users

      if (profError) throw profError;

      // Map profiles to memberships
      return memberships.map(member => ({
        ...member,
        profiles: profiles?.find(p => p.id === member.user_id || p.user_id === member.user_id)
      }));
    },
    enabled: !!viewingSchool,
  });

  const addSchool = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('schools').insert({
        name: schoolName,
        password: schoolPassword || `${schoolName.replace(/\s+/g, '').substring(0, 4).toLowerCase()}${Math.floor(Math.random() * 1000)}`,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      queryClient.invalidateQueries({ queryKey: ['moderator-stats'] });
      setIsAddOpen(false);
      setSchoolName('');
      setSchoolPassword('');
      toast({ title: 'School added successfully!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error adding school', description: error.message, variant: 'destructive' });
    },
  });

  const updateSchool = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('schools').update({
        name: schoolName,
        password: schoolPassword,
      }).eq('id', selectedSchool.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      setIsEditOpen(false);
      setSelectedSchool(null);
      setSchoolName('');
      setSchoolPassword('');
      toast({ title: 'School updated successfully!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating school', description: error.message, variant: 'destructive' });
    },
  });

  const deleteSchool = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('schools').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      queryClient.invalidateQueries({ queryKey: ['moderator-stats'] });
      toast({ title: 'School deleted!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting school', description: error.message, variant: 'destructive' });
    },
  });

  const openEdit = (school: any) => {
    setSelectedSchool(school);
    setSchoolName(school.name);
    setSchoolPassword(school.password);
    setIsEditOpen(true);
  };

  const filteredSchools = schools?.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  if (viewingSchool) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setViewingSchool(null)}>â† Back to Schools</Button>
          <h2 className="text-2xl font-display font-bold">{viewingSchool.name}</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>School Info</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Password:</strong> {viewingSchool.password}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Students & Teachers ({schoolMembers?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {schoolMembers?.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No members in this school yet.</p>
            ) : (
              <div className="space-y-2">
                {schoolMembers?.map((member: any) => (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center text-xs text-primary-foreground font-semibold">
                        {member.profiles?.email?.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{member.profiles?.display_name || member.profiles?.email}</p>
                        <p className="text-sm text-muted-foreground">{member.profiles?.email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${member.role === 'teacher' ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'
                      }`}>
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search schools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-hero">
              <Plus className="w-4 h-4 mr-2" />
              Add School
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New School</DialogTitle>
              <DialogDescription>Create a new school. A password will be auto-generated if not provided.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="school-name">School Name</Label>
                <Input
                  id="school-name"
                  placeholder="e.g., Springfield High"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="school-password">Password (Optional)</Label>
                <Input
                  id="school-password"
                  placeholder="Leave empty for auto-generated"
                  value={schoolPassword}
                  onChange={(e) => setSchoolPassword(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => addSchool.mutate()} disabled={!schoolName || addSchool.isPending}>
                {addSchool.isPending ? 'Adding...' : 'Add School'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit School</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>School Name</Label>
                <Input
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  value={schoolPassword}
                  onChange={(e) => setSchoolPassword(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => updateSchool.mutate()} disabled={!schoolName || updateSchool.isPending}>
                {updateSchool.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <p className="text-muted-foreground text-center py-8">Loading schools...</p>
        ) : filteredSchools?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <School className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No schools found. Add your first school!</p>
            </CardContent>
          </Card>
        ) : (
          filteredSchools?.map((school) => (
            <Card key={school.id} className="hover:shadow-card transition-shadow">
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => setViewingSchool(school)}>
                  <div className="p-3 rounded-xl bg-accent/10">
                    <School className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{school.name}</h3>
                    <p className="text-sm text-muted-foreground">Password: {school.password}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => setViewingSchool(school)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => openEdit(school)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost" className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete School?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{school.name}" and all related data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteSchool.mutate(school.id)} className="bg-destructive text-destructive-foreground">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function UsersTab() {
  const [search, setSearch] = useState('');
  const [isAddStudentsOpen, setIsAddStudentsOpen] = useState(false);
  const [isAddTeachersOpen, setIsAddTeachersOpen] = useState(false);
  const [isAddModeratorOpen, setIsAddModeratorOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [studentEmails, setStudentEmails] = useState('');
  const [teacherEmails, setTeacherEmails] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [moderatorEmail, setModeratorEmail] = useState('');
  const [moderatorPassword, setModeratorPassword] = useState('');
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: schools } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase.from('schools').select('*');
      if (error) throw error;
      return data;
    },
  });

  const addStudents = useMutation({
    mutationFn: async () => {
      const school = schools?.find(s => s.id === selectedSchool);
      if (!school) throw new Error('Please select a school');

      const emails = studentEmails.split('\n').map(e => e.trim()).filter(e => e && e.includes('@'));
      if (emails.length === 0) throw new Error('No valid emails found');

      const results = [];
      for (const email of emails) {
        try {
          // Create auth user with school password
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password: school.password,
          });

          if (authError) {
            // User might already exist, try to get their profile
            console.log(`User ${email} may already exist:`, authError.message);
            results.push({ email, status: 'exists or error', message: authError.message });
            continue;
          }

          if (authData.user) {
            // Add school membership
            await supabase.from('school_memberships').insert({
              user_id: authData.user.id,
              school_id: selectedSchool,
              role: 'student',
            });
            results.push({ email, status: 'created' });
          }
        } catch (err: any) {
          results.push({ email, status: 'error', message: err.message });
        }
      }

      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['moderator-stats'] });
      setIsAddStudentsOpen(false);
      setStudentEmails('');
      setSelectedSchool('');
      const created = results.filter(r => r.status === 'created').length;
      toast({ title: `Added ${created} students`, description: `${results.length - created} had issues or already exist` });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const addTeachers = useMutation({
    mutationFn: async () => {
      const school = schools?.find(s => s.id === selectedSchool);
      if (!school) throw new Error('Please select a school');

      const emails = teacherEmails.split('\n').map(e => e.trim()).filter(e => e && e.includes('@'));
      if (emails.length === 0) throw new Error('No valid emails found');

      const finalPassword = teacherPassword || `teach${Math.floor(Math.random() * 10000)}`;

      const results = [];
      for (const email of emails) {
        try {
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password: finalPassword,
          });

          if (authError) {
            results.push({ email, status: 'exists or error', message: authError.message });
            continue;
          }

          if (authData.user) {
            // Update profile to teacher role
            await supabase.from('profiles').update({ role: 'teacher' }).eq('user_id', authData.user.id);

            // Add school membership as teacher
            await supabase.from('school_memberships').insert({
              user_id: authData.user.id,
              school_id: selectedSchool,
              role: 'teacher',
            });
            results.push({ email, status: 'created' });
          }
        } catch (err: any) {
          results.push({ email, status: 'error', message: err.message });
        }
      }

      return { results, finalPassword };
    },
    onSuccess: ({ results, finalPassword }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['moderator-stats'] });
      setIsAddTeachersOpen(false);
      setTeacherEmails('');
      setTeacherPassword('');
      setSelectedSchool('');
      const created = results.filter(r => r.status === 'created').length;
      toast({ title: `Added ${created} teachers`, description: !teacherPassword ? `Auto-generated password: ${finalPassword}` : undefined });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const addModerator = useMutation({
    mutationFn: async () => {
      if (!moderatorEmail || !moderatorPassword) throw new Error('Email and password required');

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: moderatorEmail,
        password: moderatorPassword,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Update profile to moderator role
        await supabase.from('profiles').update({ role: 'moderator' }).eq('user_id', authData.user.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['moderator-stats'] });
      setIsAddModeratorOpen(false);
      setModeratorEmail('');
      setModeratorPassword('');
      toast({ title: 'Moderator account created!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateUser = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('profiles').update({
        display_name: editDisplayName,
        role: editRole,
      }).eq('id', selectedUser.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsEditUserOpen(false);
      setSelectedUser(null);
      toast({ title: 'User updated!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      // Note: We can only delete the profile, not the auth user (requires admin access)
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['moderator-stats'] });
      toast({ title: 'User profile deleted!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMultipleUsers = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('profiles').delete().in('id', selectedUserIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['moderator-stats'] });
      setSelectedUserIds([]);
      toast({ title: 'Selected users deleted!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting users', description: error.message, variant: 'destructive' });
    },
  });

  const openEditUser = (user: any) => {
    setSelectedUser(user);
    setEditDisplayName(user.display_name || '');
    setEditRole(user.role);
    setIsEditUserOpen(true);
  };

  const filteredUsers = users?.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.display_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {selectedUserIds.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected ({selectedUserIds.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Selected Users?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete {selectedUserIds.length} user profiles.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteMultipleUsers.mutate()} className="bg-destructive text-destructive-foreground">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Add Moderator Button */}
          <Dialog open={isAddModeratorOpen} onOpenChange={setIsAddModeratorOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <ShieldPlus className="w-4 h-4 mr-2" />
                Add Moderator
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Moderator</DialogTitle>
                <DialogDescription>Create a new moderator account with full access.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="moderator@school.com"
                    value={moderatorEmail}
                    onChange={(e) => setModeratorEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    placeholder="Strong password"
                    value={moderatorPassword}
                    onChange={(e) => setModeratorPassword(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => addModerator.mutate()} disabled={!moderatorEmail || !moderatorPassword || addModerator.isPending}>
                  {addModerator.isPending ? 'Creating...' : 'Create Moderator'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add Teachers Button */}
          <Dialog open={isAddTeachersOpen} onOpenChange={setIsAddTeachersOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Teachers
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Teachers</DialogTitle>
                <DialogDescription>
                  Paste teacher emails (one per line). They will have a unique password you set.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Select School</Label>
                  <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a school" />
                    </SelectTrigger>
                    <SelectContent>
                      {schools?.map((school) => (
                        <SelectItem key={school.id} value={school.id}>{school.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Teacher Password</Label>
                  <Input
                    type="text"
                    placeholder="Password for all teachers"
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Teacher Emails</Label>
                  <Textarea
                    placeholder="teacher1@school.com&#10;teacher2@school.com"
                    value={teacherEmails}
                    onChange={(e) => setTeacherEmails(e.target.value)}
                    rows={6}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => addTeachers.mutate()} disabled={!selectedSchool || !teacherEmails || addTeachers.isPending}>
                  {addTeachers.isPending ? 'Adding...' : 'Add Teachers'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Bulk Add Students Button */}
          <Dialog open={isAddStudentsOpen} onOpenChange={setIsAddStudentsOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-hero">
                <UserPlus className="w-4 h-4 mr-2" />
                Bulk Add Students
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Bulk Add Students</DialogTitle>
                <DialogDescription>
                  Paste student emails (one per line). They will be assigned the school's password.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Select School</Label>
                  <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a school" />
                    </SelectTrigger>
                    <SelectContent>
                      {schools?.map((school) => (
                        <SelectItem key={school.id} value={school.id}>{school.name} (pwd: {school.password})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Student Emails</Label>
                  <Textarea
                    placeholder="student1@school.com&#10;student2@school.com&#10;student3@school.com"
                    value={studentEmails}
                    onChange={(e) => setStudentEmails(e.target.value)}
                    rows={8}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => addStudents.mutate()} disabled={!selectedSchool || !studentEmails || addStudents.isPending}>
                  {addStudents.isPending ? 'Adding...' : 'Add Students'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input
                value={editDisplayName}
                onChange={(e) => setEditDisplayName(e.target.value)}
                placeholder="Display name"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => updateUser.mutate()} disabled={updateUser.isPending}>
              {updateUser.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        {filteredUsers?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No users found.</p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers?.map((user) => (
            <Card key={user.id} className={`transition-shadow ${selectedUserIds.includes(user.id) ? 'border-primary ring-1 ring-primary' : 'hover:shadow-card'}`}>
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300"
                    checked={selectedUserIds.includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUserIds([...selectedUserIds, user.id]);
                      } else {
                        setSelectedUserIds(selectedUserIds.filter(id => id !== user.id));
                      }
                    }}
                  />
                  <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-semibold">
                    {user.email.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold">{user.display_name || user.email}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'moderator' ? 'bg-primary/10 text-primary' :
                    user.role === 'teacher' ? 'bg-accent/10 text-accent' :
                      'bg-muted text-muted-foreground'
                    }`}>
                    {user.role}
                  </span>
                  <Button size="icon" variant="ghost" onClick={() => openEditUser(user)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost" className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete User?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will delete the profile for "{user.email}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteUser.mutate(user.id)} className="bg-destructive text-destructive-foreground">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function CompetitionsTab() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState<any>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPractice, setIsPractice] = useState(false);
  const [openTime, setOpenTime] = useState('');
  const [closeTime, setCloseTime] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: competitions, isLoading } = useQuery({
    queryKey: ['competitions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('competitions').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addCompetition = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('competitions').insert({
        name,
        description,
        is_practice: isPractice,
        start_date: openTime || null,
        end_date: closeTime || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
      queryClient.invalidateQueries({ queryKey: ['moderator-stats'] });
      setIsAddOpen(false);
      setName('');
      setDescription('');
      setIsPractice(false);
      setOpenTime('');
      setCloseTime('');
      toast({ title: 'Competition created!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateCompetition = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('competitions').update({
        name,
        description,
        is_practice: isPractice,
        start_date: openTime || null,
        end_date: closeTime || null,
      }).eq('id', selectedCompetition.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
      setIsEditOpen(false);
      setSelectedCompetition(null);
      setName('');
      setDescription('');
      setIsPractice(false);
      toast({ title: 'Competition updated!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteCompetition = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('competitions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
      queryClient.invalidateQueries({ queryKey: ['moderator-stats'] });
      toast({ title: 'Competition deleted!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const openEdit = (comp: any) => {
    setSelectedCompetition(comp);
    setName(comp.name);
    setDescription(comp.description || '');
    setIsPractice(comp.is_practice);
    setOpenTime(comp.open_time || '');
    setCloseTime(comp.close_time || '');
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-display font-bold">Competitions</h2>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-hero">
              <Plus className="w-4 h-4 mr-2" />
              New Competition
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Competition</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Winter Competition 2025" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="practice" checked={isPractice} onChange={(e) => setIsPractice(e.target.checked)} />
                <Label htmlFor="practice">Practice Mode (unranked)</Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Open Time (optional)</Label>
                  <Input type="datetime-local" value={openTime} onChange={(e) => setOpenTime(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Close Time (optional)</Label>
                  <Input type="datetime-local" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => addCompetition.mutate()} disabled={!name || addCompetition.isPending}>
                {addCompetition.isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Competition</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="edit-practice" checked={isPractice} onChange={(e) => setIsPractice(e.target.checked)} />
                <Label htmlFor="edit-practice">Practice Mode</Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Open Time (optional)</Label>
                  <Input type="datetime-local" value={openTime} onChange={(e) => setOpenTime(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Close Time (optional)</Label>
                  <Input type="datetime-local" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => updateCompetition.mutate()} disabled={!name || updateCompetition.isPending}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitions?.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No competitions yet. Create your first one!</p>
            </CardContent>
          </Card>
        ) : (
          competitions?.map((comp) => (
            <Card key={comp.id} className="hover:shadow-card-hover transition-all">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {comp.is_practice ? (
                      <BookOpen className="w-5 h-5 text-accent" />
                    ) : (
                      <Trophy className="w-5 h-5 text-gold" />
                    )}
                    <CardTitle className="text-lg">{comp.name}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(comp)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Competition?</AlertDialogTitle>
                          <AlertDialogDescription>This will permanently delete this competition.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteCompetition.mutate(comp.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <CardDescription>{comp.description || 'No description'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${comp.is_practice ? 'bg-accent/10 text-accent' : 'bg-gold/10 text-gold'
                    }`}>
                    {comp.is_practice ? 'Practice' : 'Competition'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function QuestionsTab() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [questionType, setQuestionType] = useState<'multiple_choice' | 'text' | 'number'>('multiple_choice');
  const [questionText, setQuestionText] = useState('');
  const [questionImageUrl, setQuestionImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [points, setPoints] = useState('1');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `question-${Math.random()}.${fileExt}`;
      const filePath = `questions/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setQuestionImageUrl(publicUrl);
      toast({ title: 'Image uploaded!' });
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const { data: competitions } = useQuery({
    queryKey: ['competitions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('competitions').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: sections } = useQuery({
    queryKey: ['sections', selectedCompetition],
    queryFn: async () => {
      if (!selectedCompetition) return [];
      const { data, error } = await supabase.from('sections').select('*').eq('competition_id', selectedCompetition).order('order_index', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCompetition,
  });

  const { data: questions } = useQuery({
    queryKey: ['questions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('questions').select('*, sections(name, competition_id)');
      if (error) throw error;
      return data;
    },
  });

  const addSection = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from('sections').insert({
        name,
        competition_id: selectedCompetition,
        order_index: (sections?.length || 0) + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      toast({ title: 'Section created!' });
    },
  });

  const deleteSection = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('sections').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      setSelectedSection('');
      toast({ title: 'Section deleted!' });
    },
  });

  const addQuestion = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('questions').insert({
        question_text: questionText,
        question_type: questionType,
        image_url: questionImageUrl || null,
        options: questionType === 'multiple_choice' ? options.filter(o => o.trim()) : null,
        correct_answer: correctAnswer,
        points: parseInt(points),
        section_id: selectedSection,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['moderator-stats'] });
      setIsAddOpen(false);
      setQuestionText('');
      setQuestionImageUrl('');
      setOptions(['', '', '', '']);
      setCorrectAnswer('');
      toast({ title: 'Question added!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteQuestion = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('questions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['moderator-stats'] });
      toast({ title: 'Question deleted!' });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-display font-bold">Question Bank</h2>
          <p className="text-muted-foreground">Manage sections and questions for your competitions</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-hero shadow-glow">
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Question</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-4 rounded-xl border p-4 bg-muted/30">
                <div className="space-y-2">
                  <Label>1. Select Competition</Label>
                  <Select value={selectedCompetition} onValueChange={(v) => { setSelectedCompetition(v); setSelectedSection(''); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Which competition?" />
                    </SelectTrigger>
                    <SelectContent>
                      {competitions?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCompetition && (
                  <div className="space-y-2">
                    <Label>2. Select Section</Label>
                    <div className="flex gap-2">
                      <Select value={selectedSection} onValueChange={setSelectedSection}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Choose a section" />
                        </SelectTrigger>
                        <SelectContent>
                          {sections?.map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const name = prompt('New Section name:');
                          if (name) addSection.mutate(name);
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {selectedSection ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <Label>Question Type</Label>
                    <div className="flex gap-2 p-1 bg-muted rounded-lg">
                      <Button
                        variant={questionType === 'multiple_choice' ? 'default' : 'ghost'}
                        className="flex-1 h-8"
                        size="sm"
                        onClick={() => setQuestionType('multiple_choice')}
                      >
                        Multiple Choice
                      </Button>
                      <Button
                        variant={questionType === 'text' ? 'default' : 'ghost'}
                        className="flex-1 h-8"
                        size="sm"
                        onClick={() => setQuestionType('text')}
                      >
                        Typing/Short Answer
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Question Image (optional)</Label>
                    <div className="flex items-center gap-4">
                      {questionImageUrl && (
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                          <img src={questionImageUrl} className="w-full h-full object-cover" alt="Preview" />
                          <button
                            className="absolute top-1 right-1 bg-background/80 p-1 rounded-full text-destructive"
                            onClick={() => setQuestionImageUrl('')}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      <div className="flex-1">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="question-img"
                          disabled={isUploadingImage}
                        />
                        <Label
                          htmlFor="question-img"
                          className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted/50 transition-colors"
                        >
                          {isUploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                          {isUploadingImage ? 'Uploading...' : 'Upload Question Image'}
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Question Text</Label>
                    <Textarea
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder="e.g. What is the capital of France?"
                      className="min-h-[100px]"
                    />
                  </div>

                  {questionType === 'multiple_choice' ? (
                    <div className="space-y-2">
                      <Label>Options</Label>
                      <div className="grid gap-2">
                        {options.map((opt, i) => (
                          <div key={i} className="flex gap-2">
                            <Input
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...options];
                                newOpts[i] = e.target.value;
                                setOptions(newOpts);
                              }}
                              placeholder={`Option ${String.fromCharCode(65 + i)}`}
                            />
                            <Button
                              variant={correctAnswer === opt && opt !== '' ? 'default' : 'outline'}
                              size="icon"
                              className="shrink-0"
                              onClick={() => setCorrectAnswer(opt)}
                              disabled={!opt}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>Correct Answer</Label>
                      <Input
                        value={correctAnswer}
                        onChange={(e) => setCorrectAnswer(e.target.value)}
                        placeholder="Expected answer text"
                      />
                      <p className="text-xs text-muted-foreground italic">Students must type this exactly (case insensitive).</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Points Value</Label>
                    <Input type="number" value={points} onChange={(e) => setPoints(e.target.value)} min="1" />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl">
                  {selectedCompetition ? 'Please select a section to continue' : 'Please select a competition first'}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                onClick={() => addQuestion.mutate()}
                disabled={!selectedSection || !questionText || !correctAnswer || addQuestion.isPending}
                className="w-full gradient-hero"
              >
                {addQuestion.isPending ? 'Adding Question...' : 'Add Question'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sections Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Sections</CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1">
              {competitions?.length === 0 ? (
                <p className="p-4 text-xs text-muted-foreground">Create a competition first</p>
              ) : !selectedCompetition ? (
                <p className="p-4 text-xs text-muted-foreground">Select competition to see sections</p>
              ) : sections?.length === 0 ? (
                <p className="p-4 text-xs text-muted-foreground">No sections in this competition</p>
              ) : (
                sections?.map((s) => (
                  <div key={s.id} className="flex items-center group">
                    <Button
                      variant={selectedSection === s.id ? 'default' : 'ghost'}
                      className="flex-1 justify-start h-9 rounded-lg px-3"
                      onClick={() => setSelectedSection(s.id)}
                    >
                      {s.name}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Section?</AlertDialogTitle>
                          <AlertDialogDescription>
                            All questions in this section will be deleted. This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteSection.mutate(s.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Questions List */}
        <div className="lg:col-span-3 space-y-4">
          {!selectedSection ? (
            <Card>
              <CardContent className="py-24 text-center">
                <FileQuestion className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                <h3 className="text-xl font-bold text-muted-foreground">Select a section to view questions</h3>
              </CardContent>
            </Card>
          ) : (
            <>
              {questions?.filter(q => q.section_id === selectedSection).map((q: any) => (
                <Card key={q.id} className="hover:shadow-card transition-shadow">
                  <CardContent className="py-4 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${q.question_type === 'multiple_choice' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                          {q.question_type || 'multiple_choice'}
                        </span>
                        <span className="text-[10px] uppercase font-bold border px-2 py-0.5 rounded-full text-muted-foreground">
                          {q.points} Points
                        </span>
                      </div>
                      <div className="flex gap-4 items-start">
                        {q.image_url && (
                          <div className="w-20 h-20 rounded-lg overflow-hidden border shrink-0 bg-muted">
                            <img src={q.image_url} className="w-full h-full object-cover" alt="Question" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{q.question_text}</p>

                          {q.question_type === 'multiple_choice' ? (
                            <div className="flex gap-2 mt-3 flex-wrap">
                              {(q.options as string[])?.map((opt, i) => (
                                <span
                                  key={i}
                                  className={`px-2 py-1 text-xs rounded-lg border ${opt === q.correct_answer ? 'bg-success/10 border-success text-success font-bold' : 'bg-muted border-transparent'
                                    }`}
                                >
                                  {opt}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-2 text-sm">
                              <span className="text-muted-foreground">Answer: </span>
                              <span className="font-mono font-bold text-primary">{q.correct_answer}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Question?</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteQuestion.mutate(q.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </Card>
              ))}
              {questions?.filter(q => q.section_id === selectedSection).length === 0 && (
                <div className="py-12 text-center border-2 border-dashed rounded-xl border-muted">
                  <Plus className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-30" />
                  <p className="text-muted-foreground">No questions in this section yet.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function BadgesTab() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [badgeImageUrl, setBadgeImageUrl] = useState('');
  const [isUploadingBadge, setIsUploadingBadge] = useState(false);
  const [requirementType, setRequirementType] = useState('questions_answered');
  const [requirementValue, setRequirementValue] = useState('1');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleBadgeImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBadge(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `badge-${Math.random()}.${fileExt}`;
      const filePath = `badges/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setBadgeImageUrl(publicUrl);
      toast({ title: 'Badge icon uploaded!' });
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsUploadingBadge(false);
    }
  };

  const { data: badges } = useQuery({
    queryKey: ['badges'],
    queryFn: async () => {
      const { data, error } = await supabase.from('badges').select('*');
      if (error) throw error;
      return data;
    },
  });

  const addBadge = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('badges').insert({
        name,
        description,
        image_url: badgeImageUrl || null,
        requirement_type: requirementType,
        requirement_value: parseInt(requirementValue),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] });
      setIsAddOpen(false);
      setName('');
      setDescription('');
      setBadgeImageUrl('');
      toast({ title: 'Badge created!' });
    },
  });

  const deleteBadge = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('badges').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] });
      toast({ title: 'Badge deleted!' });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-display font-bold">Badges & Achievements</h2>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-hero" onClick={() => setIsAddOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Badge
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Badge</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Badge Icon (optional)</Label>
                <div className="flex items-center gap-4">
                  {badgeImageUrl && (
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden border bg-muted p-2">
                      <img src={badgeImageUrl} className="w-full h-full object-contain" alt="Preview" />
                      <button
                        className="absolute top-1 right-1 bg-background/80 p-1 rounded-full text-destructive shadow-sm"
                        onClick={() => setBadgeImageUrl('')}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleBadgeImageUpload}
                      className="hidden"
                      id="badge-img"
                      disabled={isUploadingBadge}
                    />
                    <Label
                      htmlFor="badge-img"
                      className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      {isUploadingBadge ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                      {isUploadingBadge ? 'Uploading Icon...' : 'Upload Badge Icon'}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Badge Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="First Question!" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Answer your first question" />
              </div>
              <div className="space-y-2">
                <Label>Requirement Type</Label>
                <Select value={requirementType} onValueChange={setRequirementType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="questions_answered">Questions Answered</SelectItem>
                    <SelectItem value="correct_answers">Correct Answers</SelectItem>
                    <SelectItem value="points_earned">Points Earned</SelectItem>
                    <SelectItem value="challenges_won">Challenges Won</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Value</Label>
                <Input type="number" value={requirementValue} onChange={(e) => setRequirementValue(e.target.value)} min="1" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => addBadge.mutate()} disabled={!name || addBadge.isPending}>
                Create Badge
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges?.map((badge) => (
          <Card key={badge.id} className="hover:shadow-card-hover transition-all">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center overflow-hidden border">
                    {badge.image_url ? (
                      <img src={badge.image_url} className="w-full h-full object-cover" alt={badge.name} />
                    ) : (
                      <Award className="w-7 h-7 text-gold" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{badge.name}</h3>
                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                    <p className="text-xs text-accent mt-1">
                      {badge.requirement_type.replace(/_/g, ' ')}: {badge.requirement_value}
                    </p>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="icon" variant="ghost" className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Badge?</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteBadge.mutate(badge.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MessagesTab() {
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [targetGroup, setTargetGroup] = useState<string[]>([]);
  const { toast } = useToast();
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: messages } = useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('sender_id', profile?.user_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.user_id,
  });

  const { data: allProfiles } = useQuery({
    queryKey: ['all-profiles-for-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, role, email');
      if (error) throw error;
      return data;
    },
  });

  const sendMessage = useMutation({
    mutationFn: async () => {
      let recipientIds: string[] = [];

      if (targetGroup.includes('teachers')) {
        const teachers = allProfiles?.filter(p => p.role === 'teacher').map(p => p.user_id) || [];
        recipientIds = [...recipientIds, ...teachers];
      }
      if (targetGroup.includes('students')) {
        const students = allProfiles?.filter(p => p.role === 'student').map(p => p.user_id) || [];
        recipientIds = [...recipientIds, ...students];
      }

      // Unique recipients
      recipientIds = [...new Set(recipientIds)];

      if (recipientIds.length === 0) throw new Error('No recipients selected');

      // Correctly map for individual messages as receiver_id is NOT a JSON array in schema
      const messageRecords = recipientIds.map(receiverId => ({
        sender_id: profile?.user_id,
        receiver_id: receiverId,
        subject,
        content,
        is_system: false,
      }));

      const { error } = await supabase.from('messages').insert(messageRecords);
      if (error) throw error;

      return recipientIds.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setIsComposeOpen(false);
      setSubject('');
      setContent('');
      setTargetGroup([]);
      toast({ title: `Message sent to ${count} users!` });
    },
    onError: (error: Error) => {
      toast({ title: 'Error sending message', description: error.message, variant: 'destructive' });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold">Messages</h2>
        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-hero">
              <MessageSquare className="w-4 h-4 mr-2" />
              Compose Message
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Compose Message</DialogTitle>
              <DialogDescription>Send a message to user groups.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Recipients</Label>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="group-teachers"
                      checked={targetGroup.includes('teachers')}
                      onChange={(e) => {
                        if (e.target.checked) setTargetGroup([...targetGroup, 'teachers']);
                        else setTargetGroup(targetGroup.filter(g => g !== 'teachers'));
                      }}
                    />
                    <Label htmlFor="group-teachers">All Teachers</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="group-students"
                      checked={targetGroup.includes('students')}
                      onChange={(e) => {
                        if (e.target.checked) setTargetGroup([...targetGroup, 'students']);
                        else setTargetGroup(targetGroup.filter(g => g !== 'students'));
                      }}
                    />
                    <Label htmlFor="group-students">All Students</Label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Important Update" />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Type your message..." rows={6} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => sendMessage.mutate()} disabled={!subject || !content || targetGroup.length === 0 || sendMessage.isPending}>
                {sendMessage.isPending ? 'Sending...' : 'Send Message'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Sent Messages History</h3>
        {messages?.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No messages sent yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {messages?.map((msg: any) => (
              <Card key={msg.id}>
                <CardContent className="py-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{msg.subject}</h4>
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80">{msg.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AvatarsTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const { data: avatars } = useQuery({
    queryKey: ['avatars'],
    queryFn: async () => {
      const { data, error } = await supabase.from('avatars').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase.from('avatars').insert({
        name: file.name,
        image_url: publicUrl,
      });

      if (dbError) throw dbError;

      queryClient.invalidateQueries({ queryKey: ['avatars'] });
      toast({ title: 'Avatar uploaded successfully' });
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const deleteAvatar = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('avatars').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avatars'] });
      toast({ title: 'Avatar removed' });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-display font-bold">Avatars & Profile Pictures</h2>
          <p className="text-muted-foreground mt-1">Manage avatars available for students to choose from</p>
        </div>
        <div className="relative">
          <Input
            type="file"
            accept="image/*"
            onChange={uploadAvatar}
            className="hidden"
            id="avatar-upload"
            disabled={isUploading}
          />
          <Label
            htmlFor="avatar-upload"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl gradient-hero text-primary-foreground cursor-pointer transition-all hover:scale-105 active:scale-95 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
            {isUploading ? 'Uploading...' : 'Upload New Avatar'}
          </Label>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {avatars?.map((avatar) => (
          <div key={avatar.id} className="group relative aspect-square rounded-2xl border border-border/50 overflow-hidden bg-card hover:shadow-card-hover transition-all">
            <img
              src={avatar.image_url}
              alt={avatar.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon" className="h-8 w-8 rounded-full">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Avatar?</AlertDialogTitle>
                    <AlertDialogDescription>This will remove it from the available options for students.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteAvatar.mutate(avatar.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}

        {(!avatars || avatars.length === 0) && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-3xl">
            <ImagePlus className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground font-medium">No avatars uploaded yet</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Upload pictures for students to use as PFPs</p>
          </div>
        )}
      </div>
    </div>
  );
}

function LandingPageTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);

  const { data: fetchedContent } = useQuery({
    queryKey: ['landing-content-edit'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('site_settings')
        .select('value')
        .eq('key', 'landing_page')
        .single();

      if (error || !data) return defaultSiteContent;
      return data.value as SiteContent;
    },
  });

  // Update local state when fetched
  if (fetchedContent && JSON.stringify(fetchedContent) !== JSON.stringify(content) && content === defaultSiteContent) {
    setContent(fetchedContent);
  }

  const saveContent = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any)
        .from('site_settings')
        .upsert({ key: 'landing_page', value: content });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing-content'] });
      queryClient.invalidateQueries({ queryKey: ['landing-content-edit'] });
      toast({ title: 'Landing page updated successfully!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating content', description: error.message, variant: 'destructive' });
    },
  });

  const updateHero = (field: keyof SiteContent['hero'] | string, value: string) => {
    if (field.startsWith('stats.')) {
      const statKey = field.split('.')[1] as keyof SiteContent['hero']['stats'];
      setContent(prev => ({
        ...prev,
        hero: {
          ...prev.hero,
          stats: {
            ...prev.hero.stats,
            [statKey]: value
          }
        }
      }));
    } else {
      setContent(prev => ({
        ...prev,
        hero: {
          ...prev.hero,
          [field as keyof SiteContent['hero']]: value
        }
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold">Landing Page Content</h2>
        <Button onClick={() => saveContent.mutate()} disabled={saveContent.isPending} className="gradient-hero">
          {saveContent.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="hero" className="space-y-4">
        <TabsList>
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hero Configuration</CardTitle>
              <CardDescription>Customize the main banner of your website.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Badge Text</Label>
                  <Input value={content.hero.badge} onChange={(e) => updateHero('badge', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Title Prefix</Label>
                  <Input value={content.hero.title_prefix} onChange={(e) => updateHero('title_prefix', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Title Highlight</Label>
                  <Input value={content.hero.title_highlight} onChange={(e) => updateHero('title_highlight', e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={content.hero.description} onChange={(e) => updateHero('description', e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary CTA</Label>
                  <Input value={content.hero.cta_primary} onChange={(e) => updateHero('cta_primary', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Secondary CTA</Label>
                  <Input value={content.hero.cta_secondary} onChange={(e) => updateHero('cta_secondary', e.target.value)} />
                </div>
              </div>

              <h3 className="font-semibold pt-4">Statistics</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Students</Label>
                  <Input value={content.hero.stats.students} onChange={(e) => updateHero('stats.students', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Competitions</Label>
                  <Input value={content.hero.stats.competitions} onChange={(e) => updateHero('stats.competitions', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Questions</Label>
                  <Input value={content.hero.stats.questions} onChange={(e) => updateHero('stats.questions', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Answers</Label>
                  <Input value={content.hero.stats.answers} onChange={(e) => updateHero('stats.answers', e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Features Configuration</CardTitle>
              <CardDescription>Edit features list as JSON.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>JSON Data</Label>
                <Textarea
                  value={JSON.stringify(content.features, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setContent(prev => ({ ...prev, features: parsed }));
                    } catch (err) {
                      // ignore parse error while typing
                    }
                  }}
                  className="font-mono text-xs h-[400px]"
                />
                <p className="text-xs text-muted-foreground">Valid icons: Trophy, Users, Target, Award, Swords, BookOpen</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
