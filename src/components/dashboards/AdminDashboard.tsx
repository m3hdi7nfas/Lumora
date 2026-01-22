import { useState, useEffect } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  BarChart3,
  Trophy,
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

// Local storage utilities
const LOCAL_STORAGE_KEYS = {
  USERS: 'lumora_users',
  SCHOOLS: 'lumora_schools',
  COMPETITIONS: 'lumora_competitions',
  APPROVALS: 'lumora_approvals',
  MESSAGES: 'lumora_messages'
};

const localStorageCRUD = {
  get: (key: string) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return [];
    }
  },

  set: (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error);
      return false;
    }
  },

  add: (key: string, item: any) => {
    const items = localStorageCRUD.get(key);
    items.push(item);
    return localStorageCRUD.set(key, items);
  },

  update: (key: string, id: string, updates: any) => {
    const items = localStorageCRUD.get(key);
    const updatedItems = items.map((item: any) => item.id === id ? { ...item, ...updates } : item);
    return localStorageCRUD.set(key, updatedItems);
  },

  remove: (key: string, id: string) => {
    const items = localStorageCRUD.get(key);
    const filteredItems = items.filter((item: any) => item.id !== id);
    return localStorageCRUD.set(key, filteredItems);
  }
};

// Admin Sidebar Component
function AdminSidebar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const { profile } = useAuth();
  const navItems = [
    { id: 'overview', icon: Users, label: 'Overview' },
    { id: 'schools', icon: BarChart3, label: 'Schools' },
    { id: 'competitions', icon: Trophy, label: 'Competitions' },
    { id: 'users', icon: User, label: 'Users' },
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
              {profile?.display_name?.substring(0, 2).toUpperCase() || 'AD'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{profile?.display_name || 'Admin'}</p>
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

// Admin Overview Component
function AdminOverviewTab({ setActiveTab, loading }: { setActiveTab: (tab: string) => void, loading: boolean }) {
  const { toast } = useToast();
  const { profile } = useAuth();

  // Get stats from local storage
  const schools = localStorage.getItem('lumora_schools') ? JSON.parse(localStorage.getItem('lumora_schools')) : [];
  const competitions = localStorage.getItem('lumora_competitions') ? JSON.parse(localStorage.getItem('lumora_competitions')) : [];
  const users = localStorage.getItem('lumora_users') ? JSON.parse(localStorage.getItem('lumora_users')) : [];
  const approvals = localStorage.getItem('lumora_approvals') ? JSON.parse(localStorage.getItem('lumora_approvals')) : [];

  const stats = {
    totalSchools: schools.length,
    totalCompetitions: competitions.length,
    totalUsers: users.length,
    pendingApprovals: approvals.filter((a: any) => a.status === 'pending').length
  };

  const quickActions = [
    { id: 'schools', icon: BarChart3, title: 'Manage Schools', description: 'View and manage registered schools' },
    { id: 'competitions', icon: Trophy, title: 'Manage Competitions', description: 'Create and manage competitions' },
    { id: 'users', icon: User, title: 'Manage Users', description: 'View and manage user accounts' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage the entire platform</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Schools"
          value={stats.totalSchools.toString()}
          icon={BarChart3}
          className="bg-primary/10 border-primary/20"
        />
        <StatCard
          title="Total Competitions"
          value={stats.totalCompetitions.toString()}
          icon={Trophy}
          className="bg-accent/10 border-accent/20"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toString()}
          icon={Users}
          className="bg-success/10 border-success/20"
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovals.toString()}
          icon={CheckCircle}
          className="bg-warning/10 border-warning/20"
        />
      </div>

      {/* Quick Actions and Recent Activity in 2 columns */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common admin tasks</CardDescription>
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
            <CardDescription>Latest admin events</CardDescription>
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

// Schools Tab Component
function SchoolsTab() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const [newSchool, setNewSchool] = useState({
    id: '',
    name: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    contact_email: '',
    contact_phone: '',
    is_active: true,
    created_at: '',
    updated_at: ''
  });

  const fetchSchools = async () => {
    setLoading(true);
    try {
      // Fetch schools from local storage
      const schoolsData = localStorage.getItem('lumora_schools') ? JSON.parse(localStorage.getItem('lumora_schools')) : [];
      setSchools(schoolsData);
    } catch (error) {
      toast({ title: 'Error fetching schools', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSchool = async () => {
    // Validate required fields
    if (!newSchool.name) {
      toast({ title: 'School name is required', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Generate ID
      const newId = `school-${Date.now()}`;
      const schoolToAdd = {
        ...newSchool,
        id: newId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add to local storage
      localStorageCRUD.add(LOCAL_STORAGE_KEYS.SCHOOLS, schoolToAdd);
      setSchools(localStorageCRUD.get(LOCAL_STORAGE_KEYS.SCHOOLS));

      toast({ title: 'School added successfully!' });
      setIsAddDialogOpen(false);
      setNewSchool({
        id: '',
        name: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        contact_email: '',
        contact_phone: '',
        is_active: true,
        created_at: '',
        updated_at: ''
      });
    } catch (error) {
      toast({ title: 'Error adding school', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Schools</h1>
          <p className="text-muted-foreground">Manage registered schools</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gradient-hero">
          <Plus className="w-4 h-4 mr-2" />
          Add School
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schools List</CardTitle>
          <CardDescription>All registered schools in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search schools..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </div>
            ) : filteredSchools.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No schools found</p>
            ) : (
              <div className="space-y-4">
                {filteredSchools.map((school) => (
                  <div key={school.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{school.name}</h3>
                        <p className="text-xs text-muted-foreground">{school.city}, {school.country}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${school.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                            {school.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-xs text-muted-foreground">Students: {school.current_students || 0}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
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
                                Are you sure you want to delete this school? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-destructive hover:bg-destructive/90">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add School Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New School</DialogTitle>
            <DialogDescription>Create a new school</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>School Name</Label>
              <Input
                value={newSchool.name}
                onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                placeholder="School name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={newSchool.city}
                  onChange={(e) => setNewSchool({ ...newSchool, city: e.target.value })}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input
                  value={newSchool.country}
                  onChange={(e) => setNewSchool({ ...newSchool, country: e.target.value })}
                  placeholder="Country"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Contact Email</Label>
              <Input
                value={newSchool.contact_email}
                onChange={(e) => setNewSchool({ ...newSchool, contact_email: e.target.value })}
                placeholder="contact@school.com"
                type="email"
              />
            </div>

            <div className="space-y-2">
              <Label>Contact Phone</Label>
              <Input
                value={newSchool.contact_phone}
                onChange={(e) => setNewSchool({ ...newSchool, contact_phone: e.target.value })}
                placeholder="+1234567890"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="school-active"
                checked={newSchool.is_active}
                onCheckedChange={(checked) => setNewSchool({ ...newSchool, is_active: checked })}
              />
              <Label htmlFor="school-active">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSchool} disabled={loading} className="gradient-hero">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add School
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Competitions Tab Component
function CompetitionsTab() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const [newCompetition, setNewCompetition] = useState({
    id: '',
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    max_participants: 100,
    is_active: true,
    created_at: '',
    updated_at: ''
  });

  const fetchCompetitions = async () => {
    setLoading(true);
    try {
      // Fetch competitions from local storage
      const competitionsData = localStorage.getItem('lumora_competitions') ? JSON.parse(localStorage.getItem('lumora_competitions')) : [];
      setCompetitions(competitionsData);
    } catch (error) {
      toast({ title: 'Error fetching competitions', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const filteredCompetitions = competitions.filter(competition =>
    competition.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    competition.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCompetition = async () => {
    // Validate required fields
    if (!newCompetition.name) {
      toast({ title: 'Competition name is required', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Generate ID
      const newId = `competition-${Date.now()}`;
      const competitionToAdd = {
        ...newCompetition,
        id: newId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add to local storage
      localStorageCRUD.add(LOCAL_STORAGE_KEYS.COMPETITIONS, competitionToAdd);
      setCompetitions(localStorageCRUD.get(LOCAL_STORAGE_KEYS.COMPETITIONS));

      toast({ title: 'Competition added successfully!' });
      setIsAddDialogOpen(false);
      setNewCompetition({
        id: '',
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        max_participants: 100,
        is_active: true,
        created_at: '',
        updated_at: ''
      });
    } catch (error) {
      toast({ title: 'Error adding competition', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Competitions</h1>
          <p className="text-muted-foreground">Manage learning competitions</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gradient-hero">
          <Plus className="w-4 h-4 mr-2" />
          Add Competition
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Competitions List</CardTitle>
          <CardDescription>All available competitions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search competitions..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </div>
            ) : filteredCompetitions.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No competitions found</p>
            ) : (
              <div className="space-y-4">
                {filteredCompetitions.map((competition) => (
                  <div key={competition.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{competition.name}</h3>
                        <p className="text-xs text-muted-foreground">{competition.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${competition.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                            {competition.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-xs text-muted-foreground">Participants: {competition.current_participants || 0}/{competition.max_participants}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
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
                                Are you sure you want to delete this competition? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-destructive hover:bg-destructive/90">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Competition Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Competition</DialogTitle>
            <DialogDescription>Create a new learning competition</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Competition Name</Label>
              <Input
                value={newCompetition.name}
                onChange={(e) => setNewCompetition({ ...newCompetition, name: e.target.value })}
                placeholder="Competition name"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newCompetition.description}
                onChange={(e) => setNewCompetition({ ...newCompetition, description: e.target.value })}
                placeholder="Describe the competition..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label>Max Participants</Label>
              <Input
                type="number"
                value={newCompetition.max_participants}
                onChange={(e) => setNewCompetition({ ...newCompetition, max_participants: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="competition-active"
                checked={newCompetition.is_active}
                onCheckedChange={(checked) => setNewCompetition({ ...newCompetition, is_active: checked })}
              />
              <Label htmlFor="competition-active">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCompetition} disabled={loading} className="gradient-hero">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Competition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Users Tab Component
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();

  const [newUser, setNewUser] = useState({
    id: '',
    email: '',
    display_name: '',
    role: 'student',
    school_id: '',
    password: '',
    is_active: true,
    score: 0,
    progress: 0,
    avatar_id: null,
    created_at: '',
    updated_at: ''
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch users from local storage
      const usersData = localStorage.getItem('lumora_users') ? JSON.parse(localStorage.getItem('lumora_users')) : [];
      setUsers(usersData);
    } catch (error) {
      toast({ title: 'Error fetching users', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoleChange = async (userId: string, newRole: string) => {
    setLoading(true);
    try {
      // Find the user and update their role
      const userToUpdate = users.find(user => user.id === userId);
      if (!userToUpdate) return;

      const updatedUser = {
        ...userToUpdate,
        role: newRole,
        updated_at: new Date().toISOString()
      };

      // Update in local storage
      localStorageCRUD.update(LOCAL_STORAGE_KEYS.USERS, userId, updatedUser);
      setUsers(localStorageCRUD.get(LOCAL_STORAGE_KEYS.USERS));

      toast({ title: 'User role updated successfully!' });
    } catch (error) {
      toast({ title: 'Error updating user role', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleAddUser = async () => {
    // Validate required fields
    if (!newUser.email) {
      toast({ title: 'Email is required', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Generate ID
      const newId = `user-${Date.now()}`;
      const userToAdd = {
        ...newUser,
        id: newId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add to local storage
      localStorageCRUD.add(LOCAL_STORAGE_KEYS.USERS, userToAdd);
      setUsers(localStorageCRUD.get(LOCAL_STORAGE_KEYS.USERS));

      toast({ title: 'User added successfully!' });
      setIsAddDialogOpen(false);
      setNewUser({
        id: '',
        email: '',
        display_name: '',
        role: 'student',
        school_id: '',
        password: '',
        is_active: true,
        score: 0,
        progress: 0,
        avatar_id: null,
        created_at: '',
        updated_at: ''
      });
    } catch (error) {
      toast({ title: 'Error adding user', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Users</h1>
          <p className="text-muted-foreground">Manage user accounts</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gradient-hero">
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
          <CardDescription>All registered users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No users found</p>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                            {user.display_name?.split(' ').map(n => n[0]).join('') || user.email?.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-medium">{user.display_name || 'No name'}</h3>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">{user.role}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${user.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Select
                          value={user.role}
                          onValueChange={(value) => handleRoleChange(user.id, value)}
                          disabled={user.id === profile?.id || (value === 'admin' && profile?.role !== 'admin')}
                        >
                          <SelectTrigger className="w-[120px] h-8">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            {profile?.role === 'admin' && <SelectItem value="admin">Admin</SelectItem>}
                          </SelectContent>
                        </Select>
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
                                Are you sure you want to delete this user? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-destructive hover:bg-destructive/90">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="user@school.com"
                type="email"
              />
            </div>

            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input
                value={newUser.display_name}
                onChange={(e) => setNewUser({ ...newUser, display_name: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="••••••••"
                type="password"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="user-active"
                checked={newUser.is_active}
                onCheckedChange={(checked) => setNewUser({ ...newUser, is_active: checked })}
              />
              <Label htmlFor="user-active">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddUser} disabled={loading} className="gradient-hero">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
      const { error } = await supabase.from('messages').insert({
        content: replyContent,
        receiver_id: selectedMessage.senderEmail,
        sender_id: profile?.email,
        subject: `Re: ${selectedMessage.subject}`
      } as any);

      if (error) throw error;

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

// Profile View Component
function ProfileView() {
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
              <p className="text-sm text-muted-foreground">Schools Managed</p>
              <p className="text-2xl font-bold">0</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Competitions Created</p>
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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  return (
    <DashboardLayout
      title="Lumora Admin Dashboard"
      sidebar={<AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />}
    >
      {activeTab === 'overview' && <AdminOverviewTab setActiveTab={setActiveTab} loading={loading} />}
      {activeTab === 'schools' && <SchoolsTab />}
      {activeTab === 'competitions' && <CompetitionsTab />}
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'messages' && <MessagesTab />}
      {activeTab === 'profile' && <ProfileView />}
    </DashboardLayout>
  );
}