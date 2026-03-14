import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
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
    GraduationCap,
    Check,
    X,
    CheckCircle2,
    AlertCircle,
    Copy
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
import { AdToggle } from '@/components/ads/AdToggle';


// Local storage utilities
const LOCAL_STORAGE_KEYS = {
    USERS: 'lumora_users',
    COMPETITIONS: 'lumora_competitions',
    QUESTIONS: 'lumora_questions',
    SCHOOLS: 'lumora_schools',
    APPROVALS: 'lumora_approvals',
    MESSAGES: 'lumora_messages',
    AVATARS: 'lumora_avatars',
    BADGES: 'lumora_badges',
    QUESTION_SETS: 'lumora_question_sets',
    GRADING_QUEUE: 'lumora_grading_queue'
};

/* 
// Moved inside functions to avoid Multiple GoTrueClient warnings
const secondarySupabase = createClient(...);
*/

const RANDOM_ADJECTIVES = [
    'Solar', 'Quantum', 'Nebula', 'Infinite', 'Galactic', 'Cosmic', 'Astro', 'Prism', 'Vertex', 'Omega',
    'Nova', 'Flux', 'Zesty', 'Vibrant', 'Serene', 'Luminous', 'Spectral', 'Radiant', 'Kinetic', 'Ethereal',
    'Atomic', 'Crested', 'Daring', 'Frozen', 'Golden', 'Hidden', 'Iron', 'Jade', 'Key', 'Lost'
];
const RANDOM_NOUNS = [
    'Seeker', 'Voyager', 'Pioneer', 'Zenith', 'Origin', 'Element', 'Matrix', 'Vector', 'Spark', 'Flow',
    'Echo', 'Sync', 'Apex', 'Core', 'Link', 'Orbit', 'Pulse', 'Ridge', 'Saga', 'Titan',
    'Unity', 'Valve', 'Warp', 'Xenon', 'Yield', 'Zone', 'Alpha', 'Beta', 'Gamma', 'Delta'
];

// --- HELPERS FOR SPEED AND RELIABILITY ---

/**
 * Compresses an image file before upload to significantly speed up the process
 * and reduce bandwidth usage.
 */
const compressImage = (file: File): Promise<Blob | File> => {
    return new Promise((resolve) => {
        // Skip for non-images or SVGs (SVG doesn't need compression)
        if (!file.type.startsWith('image/') || file.type.includes('svg')) {
            return resolve(file);
        }

        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(img.src);
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 1200;
            let width = img.width;
            let height = img.height;

            if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                if (width > height) {
                    height = Math.round((height * MAX_WIDTH) / width);
                    width = MAX_WIDTH;
                } else {
                    width = Math.round((width * MAX_HEIGHT) / height);
                    height = MAX_HEIGHT;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                } else {
                    resolve(file);
                }
            }, 'image/jpeg', 0.82); // 0.82 is a good balance of quality vs size
        };
        img.onerror = () => resolve(file); // Fallback to original on error
    });
};

/**
 * Wraps a promise with a timeout to prevent the UI from hanging indefinitely
 */
const withTimeout = <T,>(promise: PromiseLike<T>, timeoutMs: number = 25000): Promise<T> => {
    const p = Promise.resolve(promise as any) as Promise<T>;
    return Promise.race([
        p,
        new Promise<T>((_, reject) =>
            setTimeout(() => {
                console.warn(`Operation timed out after ${timeoutMs}ms`);
                reject(new Error('Operation timed out. Please check your connection.'));
            }, timeoutMs)
        )
    ]) as Promise<T>;
};

// Generate "blue-horse89" style password
function generateLumoraPassword() {
    const prefixes = ['Lumox', 'Aura', 'Stellar', 'Nexos', 'Vora', 'Xylo', 'Cyber', 'Neon', 'Techno', 'Flow'];
    const suffixes = ['Spark', 'Shift', 'Core', 'Vibe', 'Node', 'Pulse', 'Grid', 'Link', 'Code', 'Sync'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const randomNum = Math.floor(Math.random() * 900) + 100;
    return `${randomPrefix}${randomSuffix}${randomNum}!`;
}

// Local storage CRUD operations (Legacy - but kept for compatibility where still used)
const localStorageCRUD = {
    get: (key) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error(`Error reading ${key} from localStorage:`, error);
            return [];
        }
    },

    set: (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error writing ${key} to localStorage:`, error);
            return false;
        }
    },

    add: (key, item) => {
        const items = localStorageCRUD.get(key);
        items.push(item);
        return localStorageCRUD.set(key, items);
    },

    update: (key, id, updates) => {
        const items = localStorageCRUD.get(key);
        const updatedItems = items.map(item => item.id === id ? { ...item, ...updates } : item);
        return localStorageCRUD.set(key, updatedItems);
    },

    remove: (key, id) => {
        const items = localStorageCRUD.get(key);
        const filteredItems = items.filter(item => item.id !== id);
        return localStorageCRUD.set(key, filteredItems);
    }
};

function AdminSidebar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
    const { profile, setIsProfileDialogOpen, isAdmin, currentView } = useAuth();
    const navItems = [
        { id: 'overview', icon: Users, label: 'Overview' },
        { id: 'schools', icon: School, label: 'Schools' },
        { id: 'competitions', icon: Trophy, label: 'Competitions' },
        { id: 'question-sets', icon: LayoutTemplate, label: 'Question Sets' },
        { id: 'questions', icon: FileQuestion, label: 'Questions' },
        { id: 'leaderboard', icon: Trophy, label: 'Leaderboard' },
        { id: 'users', icon: Users, label: 'Users' },
        { id: 'avatars', icon: User, label: 'Avatars' },
        ...(isAdmin && (!currentView || currentView === 'admin')
            ? [{ id: 'approvals', icon: CheckSquare, label: 'Pending Approvals' }]
            : []),
        { id: 'practice-manager', icon: LayoutTemplate, label: 'Practice Manager' },
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
                        <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-bold text-sm overflow-hidden border border-border">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                profile?.display_name?.substring(0, 2).toUpperCase() || 'AD'
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{profile?.display_name || 'Admin'}</p>
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

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [schools, setSchools] = useState<any[]>([]);
    const [competitions, setCompetitions] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [questionSets, setQuestionSets] = useState<any[]>([]);
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { isAdmin } = useAuth();

    // Supabase Data Fetchers
    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Schools
            const { data: schoolData, error: schoolError } = await supabase
                .from('profiles') // Wait, schools is likely a separate table we need to create
                // If schools table doesn't exist yet, we'll fallback to an empty array
                .select('*')
                .limit(100);
            // setSchools(schoolData || []); // Skipping schools for now until table is confirmed

            // Fetch Users (Profiles)
            const { data: userData } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (userData) setUsers(userData);

            // Fetch Competitions
            const { data: compData } = await supabase.from('competitions').select('*');
            if (compData) setCompetitions(compData);

            // Fetch Questions
            const { data: questionsData } = await supabase.from('questions').select('*');
            if (questionsData) setQuestions(questionsData);

            // Fetch Question Sets
            const { data: setsData } = await supabase.from('question_sets').select('*');
            if (setsData) setQuestionSets(setsData);

            // Fetch Schools
            const { data: schoolsData } = await supabase.from('schools').select('*');
            if (schoolsData) setSchools(schoolsData);

        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <DashboardLayout
            title="Lumora Admin Dashboard"
            sidebar={<AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />}
            onNavItemClick={setActiveTab}
        >
            {activeTab === 'overview' && (
                <div className="space-y-6">


                    <AdminOverviewTab
                        setActiveTab={setActiveTab}
                        loading={loading}
                        usersCount={users.length}
                        compsCount={competitions.length}
                        questionsCount={questions.length}
                        setsCount={questionSets.length}
                    />
                </div>
            )}
            {activeTab === 'schools' && <SchoolsTab schools={schools} onRefresh={fetchData} />}
            {activeTab === 'competitions' && <CompetitionsTab competitions={competitions} schools={schools} />}
            {activeTab === 'questions' && <QuestionsTab questions={questions} questionSets={questionSets} />}
            {activeTab === 'question-sets' && <QuestionSetsTab questionSets={questionSets} competitions={competitions} />}
            {activeTab === 'users' && <UsersTab users={users} schools={schools} />}
            {activeTab === 'avatars' && <AvatarsTab />}
            {activeTab === 'approvals' && isAdmin && <ApprovalsTab />}
            {activeTab === 'grading' && <GradingTab />}
            {activeTab === 'leaderboard' && <AdminLeaderboardTab />}
            {activeTab === 'practice-manager' && <PracticeManagerTab />}
            {activeTab === 'messages' && <MessagesTab />}
            {activeTab === 'profile' && <ProfileView />}
        </DashboardLayout>
    );
}

// Admin Overview Component
function AdminOverviewTab({
    setActiveTab,
    loading: parentLoading,
    usersCount,
    compsCount,
    questionsCount,
    setsCount
}: {
    setActiveTab: (tab: string) => void,
    loading: boolean,
    usersCount: number,
    compsCount: number,
    questionsCount: number,
    setsCount: number
}) {
    const { profile, currentView } = useAuth();
    const { toast } = useToast();
    const [pendingApprovals, setPendingApprovals] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchApprovalsCount = async () => {
            try {
                const { count, error } = await supabase
                    .from('approvals')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'pending');
                if (!error) setPendingApprovals(count || 0);
            } catch (e) {
                console.error('Error fetching approvals count:', e);
            }
        };
        fetchApprovalsCount();
    }, []);

    const quickActions = [
        { id: 'schools', icon: School, title: 'Manage Schools', description: 'Configure school access' },
        { id: 'competitions', icon: Trophy, title: 'Manage Competitions', description: 'Create and edit competitions' },
        { id: 'questions', icon: FileQuestion, title: 'Review Questions', description: 'Approve pending questions' },
        { id: 'grading', icon: GraduationCap, title: 'Grade Answers', description: 'Review student writing answers' },
        { id: 'question-sets', icon: LayoutTemplate, title: 'Question Sets', description: 'Organize questions into sets' },
        { id: 'users', icon: Users, title: 'User Management', description: 'Manage user accounts' },
        { id: 'avatars', icon: User, title: 'Manage Avatars', description: 'Upload and manage avatars' },
        ...(profile?.role === 'admin' && (!currentView || currentView === 'admin')
            ? [{ id: 'approvals', icon: CheckSquare, title: 'Pending Approvals', description: 'Review moderator actions' }]
            : []),
    ];

    const handleResetDemo = async () => {
        setLoading(true);
        try {
            const DEMO_EMAILS = [
                'demo.admin@lumora.com',
                'demo.moderator@lumora.com',
                'demo.teacher@lumora.com',
                'demo.student@lumora.com'
            ];

            // 1. Reset profile stats for demo accounts
            const { error: profileErr } = await supabase
                .from('profiles')
                .update({
                    score: 0,
                    progress: 0,
                    competitions_attended: 0,
                    login_streak: 0,
                    last_reroll_at: '1970-01-01T00:00:00Z',
                    updated_at: new Date().toISOString()
                })
                .in('email', DEMO_EMAILS);

            if (profileErr) throw profileErr;

            // 2. Clear Demo-related results/messages (simulated)
            const { data: demoUsers } = await supabase.from('profiles').select('id').in('email', DEMO_EMAILS);
            const demoIds = (demoUsers || []).map(u => u.id);
            if (demoIds.length > 0) {
                const { error: resultsErr } = await supabase.from('results').delete().in('student_id', demoIds);
                if (resultsErr) throw resultsErr;

                // 3. Delete messages involving demo accounts
                const { error: msgErr } = await supabase.from('messages').delete().or(`sender_id.in.(${demoIds.join(',')}),recipient_id.in.(${demoIds.join(',')})`);
                if (msgErr) throw msgErr;
            }

            toast({ title: 'Demo data has been reset successfully' });
        } catch (error: any) {
            toast({ title: 'Error resetting data', description: error.message, variant: 'destructive' });
        }
        setLoading(false);
    };

    const handleNormalizeEmails = async () => {
        setLoading(true);
        try {
            const { data: allProfiles, error } = await supabase.from('profiles').select('id, email');
            if (error) throw error;

            let count = 0;
            const updates = (allProfiles || [])
                .filter(p => p.email !== p.email.toLowerCase())
                .map(p => ({
                    id: p.id,
                    email: p.email.toLowerCase()
                }));

            for (const update of updates) {
                const { error: upErr } = await supabase.from('profiles').update({
                    email: update.email,
                    updated_at: new Date().toISOString()
                }).eq('id', update.id);
                if (!upErr) count++;
            }

            toast({
                title: 'Normalization Complete',
                description: `Fixed ${count} email fields to lowercase.`
            });
        } catch (error: any) {
            toast({ title: 'Error normalizing emails', description: error.message, variant: 'destructive' });
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Full control over platform activity and settings</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    title="Total Users"
                    value={usersCount.toString()}
                    icon={Users}
                    className="bg-primary/10 border-primary/20"
                />
                <StatCard
                    title="Active Competitions"
                    value={compsCount.toString()}
                    icon={Trophy}
                    className="bg-accent/10 border-accent/20"
                />
                <StatCard
                    title="Total Questions"
                    value={questionsCount.toString()}
                    icon={FileQuestion}
                    className="bg-success/10 border-success/20"
                />
                <StatCard
                    title="Question Sets"
                    value={setsCount.toString()}
                    icon={LayoutTemplate}
                    className="bg-warning/10 border-warning/20"
                />
            </div>

            {/* Ad Toggle for Admin - restricted to admins */}
            {profile?.role === 'admin' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Advertisement Settings</CardTitle>
                        <CardDescription>Control ad visibility for users</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AdToggle />
                    </CardContent>
                </Card>
            )}

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
                        <CardDescription>Latest platform events</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p className="text-center text-muted-foreground py-4">No recent activity</p>
                        </div>
                    </CardContent>
                </Card >
            </div >
        </div >
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
// Schools Tab Component
function SchoolsTab({ schools: _ignored, onRefresh }: { schools: any[], onRefresh: () => void }) {
    const [schools, setSchools] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedSchool, setSelectedSchool] = useState<any | null>(null);
    const [schoolMembers, setSchoolMembers] = useState<any[]>([]);
    const [membersLoading, setMembersLoading] = useState(false);
    const [selectedSchoolIds, setSelectedSchoolIds] = useState<string[]>([]);
    const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
    const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [newSchool, setNewSchool] = useState({
        id: '', name: '', address: '', city: '', state: '', country: '', postal_code: '',
        contact_email: '', contact_phone: '', is_active: true
    });
    const { toast } = useToast();
    const { profile, currentView } = useAuth();
    const isAdmin = (currentView || profile?.role) === 'admin';

    const fetchSchools = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('schools').select('*').order('name');
        if (!error && data) {
            setSchools(data);
            if (onRefresh) onRefresh();
        }
        setLoading(false);
    };

    const viewSchoolMembers = async (school: any) => {
        setSelectedSchool(school);
        setIsMembersDialogOpen(true);
        setMembersLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, email, display_name, role, password_text, score, is_active, created_at')
                .eq('school_id', school.id)
                .order('role');
            if (error) throw error;
            setSchoolMembers(data || []);
            setSelectedMemberIds([]); // Reset selection
        } catch (e: any) {
            toast({ title: 'Error fetching members', description: e.message, variant: 'destructive' });
        }
        setMembersLoading(false);
    };

    const handleBulkDeleteMembers = async () => {
        if (selectedMemberIds.length === 0) return;
        if (!confirm(`Are you sure you want to PERMANENTLY delete ${selectedMemberIds.length} users?`)) return;

        setIsBulkDeleting(true);
        try {
            const { error } = await supabase.from('profiles').delete().in('id', selectedMemberIds);
            if (error) throw error;
            toast({ title: `${selectedMemberIds.length} users deleted successfully` });
            setSchoolMembers(prev => prev.filter(m => !selectedMemberIds.includes(m.id)));
            setSelectedMemberIds([]);
        } catch (e: any) {
            toast({ title: 'Error deleting users', description: e.message, variant: 'destructive' });
        }
        setIsBulkDeleting(false);
    };

    const handleCopyCredentials = (member: any) => {
        const text = `Email: ${member.email} | Password: ${member.password_text || 'N/A'}`;
        navigator.clipboard.writeText(text);
        toast({ title: 'Credentials copied!' });
    };

    const handleCopyAllCredentials = () => {
        const membersToCopy = selectedMemberIds.length > 0
            ? schoolMembers.filter(m => selectedMemberIds.includes(m.id))
            : schoolMembers;

        if (membersToCopy.length === 0) return;

        const text = membersToCopy.map(m => `Email: ${m.email} | Password: ${m.password_text || 'N/A'}`).join('\n');
        navigator.clipboard.writeText(text);
        toast({
            title: 'Credentials copied!',
            description: `Copied ${membersToCopy.length} user${membersToCopy.length !== 1 ? 's' : ''} credentials to clipboard.`
        });
    };

    const handleDeleteMember = async (memberId: string, memberEmail: string) => {
        if (!confirm(`Are you sure you want to PERMANENTLY delete user ${memberEmail}?`)) return;
        setDeletingMemberId(memberId);
        try {
            const { error } = await supabase.from('profiles').delete().eq('id', memberId);
            if (error) throw error;
            toast({ title: 'User deleted successfully' });
            setSchoolMembers(prev => prev.filter(m => m.id !== memberId));
        } catch (e: any) {
            toast({ title: 'Error deleting user', description: e.message, variant: 'destructive' });
        }
        setDeletingMemberId(null);
    };

    useEffect(() => { fetchSchools(); }, []);

    const filteredSchools = schools.filter(s =>
        (s?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s?.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s?.country || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const resetForm = () => {
        setIsAddDialogOpen(false);
        setIsEditing(false);
        setNewSchool({ id: '', name: '', address: '', city: '', state: '', country: '', postal_code: '', contact_email: '', contact_phone: '', is_active: true });
    };

    const handleSave = async () => {
        if (!newSchool.name) { toast({ title: 'School name is required', variant: 'destructive' }); return; }
        setLoading(true);
        try {
            const { id, ...data } = newSchool;
            if (isAdmin) {
                if (isEditing) {
                    const { error } = await supabase.from('schools').update(data).eq('id', id);
                    if (error) throw error;
                    toast({ title: 'School updated!' });
                } else {
                    const { error } = await supabase.from('schools').insert(data);
                    if (error) throw error;
                    toast({ title: 'School added!' });
                }
                await fetchSchools();
            } else {
                // Moderator: submit for approval
                const { error } = await supabase.from('approvals').insert({
                    type: isEditing ? 'update' : 'create',
                    table_name: 'schools',
                    record_id: isEditing ? id : null,
                    data: data,
                    requested_by: profile?.id,
                    summary: `${isEditing ? 'Update' : 'Add'} school: ${newSchool.name}`,
                    status: 'pending'
                });
                if (error) throw error;
                toast({ title: 'Submitted for admin approval', description: 'Your action is pending review.' });
            }
            resetForm();
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        }
        setLoading(false);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete school "${name}"?`)) return;
        setLoading(true);
        try {
            if (isAdmin) {
                const { error } = await supabase.from('schools').delete().eq('id', id);
                if (error) throw error;
                toast({ title: 'School deleted!' });
                await fetchSchools();
            } else {
                const { error } = await supabase.from('approvals').insert({
                    type: 'delete', table_name: 'schools', record_id: id,
                    data: {}, requested_by: profile?.id,
                    summary: `Delete school: ${name}`, status: 'pending'
                });
                if (error) throw error;
                toast({ title: 'Deletion submitted for admin approval' });
            }
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        }
        setLoading(false);
    };

    const handleToggleSelectSchool = (id: string) => {
        setSelectedSchoolIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleToggleSelectAllSchools = () => {
        if (selectedSchoolIds.length > 0 && selectedSchoolIds.length === filteredSchools.length) {
            setSelectedSchoolIds([]);
        } else {
            setSelectedSchoolIds(filteredSchools.map(s => s.id));
        }
    };

    const handleBulkDeleteSchools = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedSchoolIds.length} schools?`)) return;
        setLoading(true);
        try {
            if (isAdmin) {
                const { error } = await supabase.from('schools').delete().in('id', selectedSchoolIds);
                if (error) throw error;
                toast({ title: `${selectedSchoolIds.length} schools deleted!` });
                setSelectedSchoolIds([]);
                await fetchSchools();
            } else {
                const { error } = await supabase.from('approvals').insert({
                    type: 'delete', table_name: 'schools', record_id: null,
                    data: { ids: selectedSchoolIds }, requested_by: profile?.id,
                    summary: `Bulk delete ${selectedSchoolIds.length} schools`, status: 'pending'
                });
                if (error) throw error;
                toast({ title: 'Deletion submitted for admin approval' });
                setSelectedSchoolIds([]);
            }
        } catch (err: any) {
            toast({ title: 'Error deleting schools', description: err.message, variant: 'destructive' });
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold">Schools</h1>
                    <p className="text-muted-foreground">Manage educational institutions</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchSchools}><RefreshCw className="w-4 h-4" /></Button>
                    <Button onClick={() => setIsAddDialogOpen(true)} className="gradient-hero">
                        <Plus className="w-4 h-4 mr-2" />{isAdmin ? 'Add School' : 'Request New School'}
                    </Button>
                </div>
            </div>
            <Card>
                <CardHeader><CardTitle>Schools List</CardTitle><CardDescription>All registered educational institutions</CardDescription></CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="relative flex-1 mr-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input placeholder="Search schools..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                            <div className="flex items-center gap-2">
                                {selectedSchoolIds.length > 0 && (
                                    <Button variant="destructive" size="sm" onClick={handleBulkDeleteSchools} disabled={loading} className="h-9 px-3 text-xs">
                                        <Trash2 className="w-3 h-3 mr-2" />
                                        Delete Selected ({selectedSchoolIds.length})
                                    </Button>
                                )}
                                <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border">
                                    <Checkbox id="select-all-schools" checked={selectedSchoolIds.length > 0 && selectedSchoolIds.length === filteredSchools.length} onCheckedChange={handleToggleSelectAllSchools} />
                                    <Label htmlFor="select-all-schools" className="text-xs font-medium cursor-pointer">Select All Visible</Label>
                                </div>
                            </div>
                        </div>
                        {loading ? (
                            <div className="text-center py-4"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
                        ) : filteredSchools.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">No schools found</p>
                        ) : (
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {filteredSchools.map((school) => (
                                    <div key={school.id} className={`p-4 rounded-lg border transition-all ${selectedSchoolIds.includes(school.id) ? 'border-primary bg-primary/5 shadow-sm' : 'border-border/50 hover:bg-muted/50'}`}>
                                        <div className="flex items-center gap-4">
                                            <Checkbox
                                                checked={selectedSchoolIds.includes(school.id)}
                                                onCheckedChange={() => handleToggleSelectSchool(school.id)}
                                                className="mt-1"
                                            />
                                            <div className="flex-1 flex items-center justify-between">
                                                <div className="flex-1 cursor-pointer" onClick={() => viewSchoolMembers(school)}>
                                                    <h3 className="font-medium hover:text-primary transition-colors">{school.name}</h3>
                                                    <p className="text-xs text-muted-foreground">{school.city}, {school.country}</p>
                                                </div>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <span className="text-xs text-muted-foreground">Contact: {school.contact_email || 'N/A'}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs ${school.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{school.is_active ? 'Active' : 'Inactive'}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <Button size="sm" variant="secondary" className="h-8 px-2 text-xs" onClick={() => viewSchoolMembers(school)}>
                                                    <Users className="w-3 h-3 mr-1" /> Members
                                                </Button>
                                                <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => { setNewSchool({ ...school }); setIsEditing(true); setIsAddDialogOpen(true); }}>
                                                    <Edit className="w-3 h-3" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" size="sm" className="h-8 w-8 p-0"><Trash2 className="w-3 h-3" /></Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete School</AlertDialogTitle>
                                                            <AlertDialogDescription>Are you sure? This cannot be undone.</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDelete(school.id, school.name)}>Delete</AlertDialogAction>
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

            <Dialog open={isAddDialogOpen} onOpenChange={(o) => { if (!o) resetForm(); else setIsAddDialogOpen(true); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit School' : (isAdmin ? 'Add New School' : 'Request New School')}</DialogTitle>
                        <DialogDescription>{isAdmin ? '' : '⏳ This action will be submitted for admin approval.'}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2"><Label>School Name *</Label><Input value={newSchool.name} onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })} placeholder="e.g., Springfield High School" /></div>
                        <div className="space-y-2"><Label>Address</Label><Input value={newSchool.address} onChange={(e) => setNewSchool({ ...newSchool, address: e.target.value })} /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>City</Label><Input value={newSchool.city} onChange={(e) => setNewSchool({ ...newSchool, city: e.target.value })} /></div>
                            <div className="space-y-2"><Label>Country</Label><Input value={newSchool.country} onChange={(e) => setNewSchool({ ...newSchool, country: e.target.value })} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Contact Email</Label><Input type="email" value={newSchool.contact_email} onChange={(e) => setNewSchool({ ...newSchool, contact_email: e.target.value })} /></div>
                            <div className="space-y-2"><Label>Contact Phone</Label><Input value={newSchool.contact_phone} onChange={(e) => setNewSchool({ ...newSchool, contact_phone: e.target.value })} /></div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Checkbox id="school-active" checked={!!newSchool.is_active} onCheckedChange={(c) => setNewSchool({ ...newSchool, is_active: !!c })} />
                            <Label htmlFor="school-active">Active School</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={resetForm}>Cancel</Button>
                        <Button onClick={handleSave} disabled={loading}>
                            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : (isAdmin ? (isEditing ? 'Save Changes' : 'Add School') : 'Submit for Approval')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* School Members Dialog */}
            <Dialog open={isMembersDialogOpen} onOpenChange={setIsMembersDialogOpen}>
                <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" />
                            {selectedSchool?.name} — Members
                        </DialogTitle>
                        <DialogDescription>
                            All users registered under this school. Passwords shown are for admin reference.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-hidden mt-4 border rounded-lg flex flex-col min-h-0">
                        <ScrollArea className="flex-1">
                            {membersLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : schoolMembers.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No members found for this school.</p>
                                </div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="bg-muted sticky top-0">
                                        <tr>
                                            <th className="p-3 text-left w-10">
                                                <Checkbox
                                                    checked={selectedMemberIds.length === schoolMembers.length && schoolMembers.length > 0}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) setSelectedMemberIds(schoolMembers.map(m => m.id));
                                                        else setSelectedMemberIds([]);
                                                    }}
                                                />
                                            </th>
                                            <th className="p-3 text-left font-semibold text-xs uppercase tracking-wider">Role</th>
                                            <th className="p-3 text-left font-semibold text-xs uppercase tracking-wider">Display Name</th>
                                            <th className="p-3 text-left font-semibold text-xs uppercase tracking-wider">Email</th>
                                            <th className="p-3 text-left font-semibold text-xs uppercase tracking-wider">Password</th>
                                            <th className="p-3 text-right font-semibold text-xs uppercase tracking-wider">Score</th>
                                            <th className="p-3 text-right font-semibold text-xs uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {schoolMembers.map((member) => (
                                            <tr key={member.id} className={`hover:bg-muted/50 transition-colors ${selectedMemberIds.includes(member.id) ? 'bg-primary/5' : ''}`}>
                                                <td className="p-3">
                                                    <Checkbox
                                                        checked={selectedMemberIds.includes(member.id)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) setSelectedMemberIds(prev => [...prev, member.id]);
                                                            else setSelectedMemberIds(prev => prev.filter(id => id !== member.id));
                                                        }}
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${member.role === 'admin' ? 'bg-red-100 text-red-700' :
                                                        member.role === 'moderator' ? 'bg-orange-100 text-orange-700' :
                                                            member.role === 'teacher' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-green-100 text-green-700'
                                                        }`}>{member.role}</span>
                                                </td>
                                                <td className="p-3 font-medium">{member.display_name || <span className="text-muted-foreground italic text-xs">No username</span>}</td>
                                                <td className="p-3 font-mono text-xs text-muted-foreground">{member.email}</td>
                                                <td className="p-3">
                                                    <span className="font-mono text-xs text-primary font-bold bg-primary/5 px-2 py-0.5 rounded">
                                                        {member.password_text || <span className="text-muted-foreground italic">Hidden</span>}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-right font-mono font-bold">{(member.score || 0).toLocaleString()}</td>
                                                <td className="p-3 text-right flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 w-7 p-0"
                                                        title="Copy credentials"
                                                        onClick={() => handleCopyCredentials(member)}
                                                    >
                                                        <Copy className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="h-7 w-7 p-0"
                                                        disabled={deletingMemberId === member.id || member.id === profile?.id}
                                                        onClick={() => handleDeleteMember(member.id, member.email)}
                                                    >
                                                        {deletingMemberId === member.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </ScrollArea>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t shrink-0">
                        <div className="flex items-center gap-4">
                            <p className="text-xs text-muted-foreground">{schoolMembers.length} member{schoolMembers.length !== 1 ? 's' : ''} found</p>
                            {selectedMemberIds.length > 0 && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="h-8 py-0 px-3 text-xs"
                                    onClick={handleBulkDeleteMembers}
                                    disabled={isBulkDeleting}
                                >
                                    {isBulkDeleting ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Trash2 className="w-3 h-3 mr-2" />}
                                    Delete Selected ({selectedMemberIds.length})
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 py-0 px-3 text-xs"
                                onClick={handleCopyAllCredentials}
                            >
                                <Copy className="w-3 h-3 mr-2" />
                                {selectedMemberIds.length > 0 ? `Copy Selected (${selectedMemberIds.length})` : 'Copy All'}
                            </Button>
                        </div>
                        <Button variant="outline" onClick={() => setIsMembersDialogOpen(false)}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Competitions Tab Component
function CompetitionsTab({ competitions: _ignored, schools: _ignoredSchools }: { competitions: any[], schools: any[] }) {
    const [competitions, setCompetitions] = useState<any[]>([]);
    const [schools, setSchools] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedCompIds, setSelectedCompIds] = useState<string[]>([]);
    const emptyComp = { id: '', name: '', description: '', start_date: '', start_time: '09:00', end_date: '', end_time: '17:00', is_active: true, current_participants: 0, category: '', difficulty: 'medium', can_leave: true, participating_schools: [] as string[], access_code: '', banner_url: '' };
    const [newCompetition, setNewCompetition] = useState(emptyComp);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [selectAllSchools, setSelectAllSchools] = useState(false);
    const { toast } = useToast();
    const { profile, currentView } = useAuth();
    const isAdmin = (currentView || profile?.role) === 'admin';

    const fetchData = async () => {
        setLoading(true);
        const [{ data: comps }, { data: schs }] = await Promise.all([
            supabase.from('competitions').select('*').order('created_at', { ascending: false }),
            supabase.from('schools').select('id, name, country')
        ]);
        if (comps) setCompetitions(comps);
        if (schs) setSchools(schs);
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const filteredCompetitions = competitions.filter(c =>
        (c?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c?.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const resetForm = () => {
        setIsAddDialogOpen(false);
        setIsEditing(false);
        setNewCompetition(emptyComp);
        setBannerFile(null);
    };

    const handleBannerUpload = async (file: File) => {
        const compressedFile = await compressImage(file);
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await withTimeout<{ data: any; error: any }>(
            supabase.storage.from('competition-banners').upload(filePath, compressedFile)
        );

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('competition-banners')
            .getPublicUrl(filePath);

        return publicUrl;
    };

    const handleSave = async () => {
        if (!newCompetition.name) { toast({ title: 'Competition name is required', variant: 'destructive' }); return; }
        setLoading(true);
        try {
            let finalBannerUrl = newCompetition.banner_url;

            if (bannerFile) {
                setUploading(true);
                try {
                    finalBannerUrl = await handleBannerUpload(bannerFile);
                } catch (uploadErr: any) {
                    toast({ title: 'Banner Upload Failed', description: uploadErr.message, variant: 'destructive' });
                    setLoading(false);
                    setUploading(false);
                    return;
                }
                setUploading(false);
            }

            const { id, ...data } = { ...newCompetition, banner_url: finalBannerUrl };
            if (isAdmin) {
                if (isEditing) {
                    const { error } = await supabase.from('competitions').update(data).eq('id', id);
                    if (error) throw error;
                    toast({ title: 'Competition updated!' });
                } else {
                    const { error } = await supabase.from('competitions').insert(data);
                    if (error) throw error;
                    toast({ title: 'Competition added!' });
                }
                await fetchData();
            } else {
                const { error } = await supabase.from('approvals').insert({
                    type: isEditing ? 'update' : 'create',
                    table_name: 'competitions',
                    record_id: isEditing ? id : null,
                    data, requested_by: profile?.id,
                    summary: `${isEditing ? 'Update' : 'Add'} competition: ${newCompetition.name}`,
                    status: 'pending'
                });
                if (error) throw error;
                toast({ title: 'Submitted for admin approval' });
            }
            resetForm();
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        }
        setLoading(false);
    };

    const handleDeleteCompetition = async (id: string, name: string) => {
        if (!confirm(`Delete competition "${name}"?`)) return;
        setLoading(true);
        try {
            if (isAdmin) {
                const { error } = await supabase.from('competitions').delete().eq('id', id);
                if (error) throw error;
                toast({ title: 'Competition deleted!' });
                await fetchData();
            } else {
                const { error } = await supabase.from('approvals').insert({
                    type: 'delete', table_name: 'competitions', record_id: id,
                    data: {}, requested_by: profile?.id,
                    summary: `Delete competition: ${name}`, status: 'pending'
                });
                if (error) throw error;
                toast({ title: 'Deletion submitted for admin approval' });
            }
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        }
        setLoading(false);
    };

    const handleToggleSelectComp = (id: string) => {
        setSelectedCompIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleToggleSelectAllComps = () => {
        if (selectedCompIds.length > 0 && selectedCompIds.length === filteredCompetitions.length) {
            setSelectedCompIds([]);
        } else {
            setSelectedCompIds(filteredCompetitions.map(c => c.id));
        }
    };

    const handleBulkDeleteComps = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedCompIds.length} competitions?`)) return;
        setLoading(true);
        try {
            if (isAdmin) {
                const { error } = await supabase.from('competitions').delete().in('id', selectedCompIds);
                if (error) throw error;
                toast({ title: `${selectedCompIds.length} competitions deleted!` });
                setSelectedCompIds([]);
                await fetchData();
            } else {
                const { error } = await supabase.from('approvals').insert({
                    type: 'delete', table_name: 'competitions', record_id: null,
                    data: { ids: selectedCompIds }, requested_by: profile?.id,
                    summary: `Bulk delete ${selectedCompIds.length} competitions`, status: 'pending'
                });
                if (error) throw error;
                toast({ title: 'Deletion submitted for admin approval' });
                setSelectedCompIds([]);
            }
        } catch (err: any) {
            toast({ title: 'Error deleting competitions', description: err.message, variant: 'destructive' });
        }
        setLoading(false);
    };

    const [isStatsOpen, setIsStatsOpen] = useState(false);

    const handleSchoolSelection = (schoolId: string) => {
        setNewCompetition(prev => {
            const newSchools = prev.participating_schools.includes(schoolId)
                ? prev.participating_schools.filter(id => id !== schoolId)
                : [...prev.participating_schools, schoolId];
            return { ...prev, participating_schools: newSchools };
        });
    };

    const handleSelectAllSchools = () => {
        if (selectAllSchools) {
            setNewCompetition(prev => ({ ...prev, participating_schools: [] }));
        } else {
            setNewCompetition(prev => ({ ...prev, participating_schools: schools.map(school => school.id) }));
        }
        setSelectAllSchools(!selectAllSchools);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold">Competitions</h1>
                    <p className="text-muted-foreground">Manage learning competitions</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsStatsOpen(true)} className="border-primary/50 text-primary hover:bg-primary/5">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Site Stats
                    </Button>
                    <Button onClick={() => setIsAddDialogOpen(true)} className="gradient-hero">
                        <Plus className="w-4 h-4 mr-2" />
                        {isAdmin ? 'Add Competition' : 'Request New Competition'}
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Competitions List</CardTitle>
                    <CardDescription>All available competitions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="relative flex-1 mr-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search competitions..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                {selectedCompIds.length > 0 && (
                                    <Button variant="destructive" size="sm" onClick={handleBulkDeleteComps} disabled={loading} className="h-9 px-3 text-xs">
                                        <Trash2 className="w-3 h-3 mr-2" />
                                        Delete Selected ({selectedCompIds.length})
                                    </Button>
                                )}
                                <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border">
                                    <Checkbox id="select-all-comps" checked={selectedCompIds.length > 0 && selectedCompIds.length === filteredCompetitions.length} onCheckedChange={handleToggleSelectAllComps} />
                                    <Label htmlFor="select-all-comps" className="text-xs font-medium cursor-pointer">Select All Visible</Label>
                                </div>
                            </div>
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
                                    <div key={competition.id} className={`p-4 rounded-lg border transition-all ${selectedCompIds.includes(competition.id) ? 'border-primary bg-primary/5 shadow-sm' : 'border-border/50 hover:bg-muted/50'}`}>
                                        <div className="flex items-center gap-4">
                                            <Checkbox
                                                checked={selectedCompIds.includes(competition.id)}
                                                onCheckedChange={() => handleToggleSelectComp(competition.id)}
                                                className="mt-1"
                                            />
                                            <div className="flex-1 flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-medium">{competition.name}</h3>
                                                    <p className="text-xs text-muted-foreground">{competition.description}</p>
                                                </div>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${competition.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                                                        {competition.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => {
                                                        setNewCompetition(competition);
                                                        setIsEditing(true);
                                                        setIsAddDialogOpen(true);
                                                    }}
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
                                                            <AlertDialogTitle>Delete Competition</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete this competition? This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                className="bg-destructive hover:bg-destructive/90"
                                                                onClick={() => handleDeleteCompetition(competition.id, competition.name)}
                                                            >
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Competition' : 'Add New Competition'}</DialogTitle>
                        <DialogDescription>{isEditing ? 'Update competition settings' : 'Create a new learning competition'}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Competition Name *</Label>
                            <Input
                                value={newCompetition.name}
                                onChange={(e) => setNewCompetition({ ...newCompetition, name: e.target.value })}
                                placeholder="e.g., Math Olympiad 2025"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Access Code (Optional)</Label>
                            <Input
                                value={newCompetition.access_code || ''}
                                onChange={(e) => setNewCompetition({ ...newCompetition, access_code: e.target.value })}
                                placeholder="e.g. SECRET123 (Leave empty for public)"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={newCompetition.description}
                                onChange={(e) => setNewCompetition({ ...newCompetition, description: e.target.value })}
                                placeholder="Describe the competition..."
                                rows={3}
                            />
                        </div>

                        {/* Banner Image Upload */}
                        <div className="space-y-2">
                            <Label>Competition Banner (Appearing on cover)</Label>
                            <div className="flex flex-col gap-3">
                                {newCompetition.banner_url && !bannerFile && (
                                    <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-border">
                                        <img src={newCompetition.banner_url} alt="Banner Preview" className="w-full h-full object-cover" />
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="absolute top-2 right-2 h-7 w-7 p-0"
                                            onClick={() => setNewCompetition({ ...newCompetition, banner_url: '' })}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                )}
                                {bannerFile && (
                                    <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-border ring-2 ring-primary">
                                        <img src={URL.createObjectURL(bannerFile)} alt="New Banner Preview" className="w-full h-full object-cover" />
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="absolute top-2 right-2 h-7 w-7 p-0"
                                            onClick={() => setBannerFile(null)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) setBannerFile(file);
                                        }}
                                        className="cursor-pointer"
                                    />
                                    {uploading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                                </div>
                                <p className="text-[10px] text-muted-foreground italic">Recommended: 1200x400 or similar landscape ratio.</p>
                            </div>
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
                                <Label>Start Time</Label>
                                <Input
                                    type="time"
                                    value={(newCompetition as any).start_time}
                                    onChange={(e) => setNewCompetition({ ...newCompetition, start_time: e.target.value } as any)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>End Date</Label>
                                <Input
                                    type="date"
                                    value={newCompetition.end_date}
                                    onChange={(e) => setNewCompetition({ ...newCompetition, end_date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>End Time</Label>
                                <Input
                                    type="time"
                                    value={(newCompetition as any).end_time}
                                    onChange={(e) => setNewCompetition({ ...newCompetition, end_time: e.target.value } as any)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Input
                                    value={newCompetition.category}
                                    onChange={(e) => setNewCompetition({ ...newCompetition, category: e.target.value })}
                                    placeholder="e.g., Math, Science, etc."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Difficulty</Label>
                                <Select
                                    value={newCompetition.difficulty}
                                    onValueChange={(value) => setNewCompetition({ ...newCompetition, difficulty: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select difficulty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="easy">Easy</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="hard">Hard</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Participating Schools</Label>
                            <div className="flex items-center gap-2 mb-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSelectAllSchools}
                                    className="h-8"
                                >
                                    {selectAllSchools ? 'Deselect All' : 'Select All'}
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                                {schools.map((school) => (
                                    <div key={school.id} className="flex items-center gap-2">
                                        <Checkbox
                                            id={`school-${school.id}`}
                                            checked={newCompetition.participating_schools.includes(school.id)}
                                            onCheckedChange={() => handleSchoolSelection(school.id)}
                                        />
                                        <Label htmlFor={`school-${school.id}`} className="text-sm font-normal cursor-pointer">
                                            {school.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                            <Checkbox
                                id="can-leave"
                                checked={newCompetition.can_leave}
                                onCheckedChange={(checked) => setNewCompetition({ ...newCompetition, can_leave: !!checked })}
                            />
                            <div className="space-y-1 leading-none">
                                <Label htmlFor="can-leave" className="text-sm font-medium cursor-pointer">Allow Students to Leave</Label>
                                <p className="text-[10px] text-muted-foreground italic">If unchecked, students cannot leave this competition once joined.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Checkbox
                                id="is-active"
                                checked={!!newCompetition.is_active}
                                onCheckedChange={(checked) => setNewCompetition({ ...newCompetition, is_active: !!checked })}
                            />
                            <Label htmlFor="is-active">Active Competition</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {isEditing ? 'Saving...' : 'Adding...'}
                                </>
                            ) : (
                                isEditing ? 'Save Changes' : 'Add Competition'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <SiteStatsDialog open={isStatsOpen} onOpenChange={setIsStatsOpen} competitions={competitions} schools={schools} />
        </div>
    );
}

// Questions Tab Component
function QuestionsTab({ questions: _ignored, questionSets: _ignoredSets }: { questions: any[], questionSets: any[] }) {
    const [questions, setQuestions] = useState<any[]>([]);
    const [questionSets, setQuestionSets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isBulkAddDialogOpen, setIsBulkAddDialogOpen] = useState(false);
    const [bulkQuestions, setBulkQuestions] = useState('');
    const [bulkQuestionSetId, setBulkQuestionSetId] = useState('');
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
    const emptyQ = { id: '', text: '', options: ['', '', '', ''] as string[], correct_answer: '', question_set_id: '', type: 'mcq' as 'mcq' | 'text' | 'slide', difficulty: 'medium', points: 10, explanation: '', exact_match_required: false, image_url: '', is_required: true, category: 'General', timer: 0 };
    const [newQuestion, setNewQuestion] = useState(emptyQ);
    const { profile, currentView } = useAuth();
    const isAdmin = (currentView || profile?.role) === 'admin';
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    const handleImageUpload = async (file: File) => {
        // Optimize image size to fix 'loading non-stop' issue
        const compressedFile = await compressImage(file);
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        // Timeout prevents indefinite hangs
        const { error: uploadError } = await withTimeout<{ data: any; error: any }>(
            supabase.storage.from('question-images').upload(filePath, compressedFile)
        );

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('question-images')
            .getPublicUrl(filePath);

        return publicUrl;
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            console.log("Fetching questions and sets...");
            const [resQ, resSets] = await Promise.all([
                supabase.from('questions').select('*').order('created_at', { ascending: false }),
                supabase.from('question_sets').select('id, name')
            ]);

            if (resQ.error) throw resQ.error;
            if (resSets.error) throw resSets.error;

            if (resQ.data) setQuestions(resQ.data);
            if (resSets.data) setQuestionSets(resSets.data);
            console.log("Fetch successful:", { questions: resQ.data?.length, sets: resSets.data?.length });
        } catch (error: any) {
            console.error('Error in QuestionsTab fetchData:', error);
            toast({ title: 'Error Loading Questions', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const questionSetMap = useMemo(() => {
        const map = new Map();
        questionSets.forEach(qs => map.set(qs.id, qs.name));
        return map;
    }, [questionSets]);

    const filteredQuestions = questions.filter(q => {
        const setName = questionSetMap.get(q?.question_set_id) || '';
        return (q?.text || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            setName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const resetForm = () => {
        setIsAddDialogOpen(false);
        setIsEditing(false);
        setNewQuestion(emptyQ);
        setImageFile(null);
    };

    const handleAddQuestion = async () => {
        if (!newQuestion.text || (!newQuestion.correct_answer && newQuestion.type !== 'slide')) {
            toast({ title: 'Question text and correct answer are required', variant: 'destructive' });
            return;
        }
        // question_set_id is optional - the DB allows null
        console.log("handleAddQuestion called with:", JSON.stringify(newQuestion, null, 2));
        setSaving(true);
        try {
            let finalImageUrl = newQuestion.image_url;

            if (imageFile) {
                setUploading(true);
                toast({ title: 'Uploading image...', description: 'Optimizing for speed' });
                try {
                    finalImageUrl = await handleImageUpload(imageFile);
                } catch (uploadErr: any) {
                    toast({ title: 'Image Upload Failed', description: uploadErr.message, variant: 'destructive' });
                    setSaving(false);
                    setUploading(false);
                    return;
                }
                setUploading(false);
            }

            toast({ title: 'Saving question data...' });
            const { id: qId, created_at: ca, updated_at: ua, ...rest } = newQuestion as any;

            // Only send columns guaranteed to exist in the DB
            const data: Record<string, any> = {
                text: rest.text,
                type: rest.type || 'mcq',
                options: Array.isArray(rest.options) ? rest.options : [],
                correct_answer: rest.type === 'slide' ? 'slide_viewed' : (rest.correct_answer || ''),
                points: rest.type === 'slide' ? 0 : (rest.points || 10),
                question_set_id: (rest.question_set_id && rest.question_set_id !== '') ? rest.question_set_id : null,
                image_url: finalImageUrl || null,
                slide_url: rest.type === 'slide' ? rest.slide_url : null,
                timer: parseInt(rest.timer) || 0,
            };
            console.log("Cleaned question data to save:", JSON.stringify(data, null, 2));

            if (isAdmin) {
                if (isEditing) {
                    const { error } = await withTimeout<{ data: any; error: any }>(
                        (supabase.from('questions').update(data).eq('id', qId) as any)
                    );
                    if (error) throw error;
                    toast({ title: 'Question updated!' });
                } else {
                    const { error } = await withTimeout<{ data: any; error: any }>(
                        (supabase.from('questions').insert(data) as any)
                    );
                    if (error) throw error;
                    toast({ title: 'Question added!' });
                }
                await fetchData();
            } else {
                // Fix: ensure record_id is null if not editing, not a blank string
                const approvalRecordId = (isEditing && qId && qId !== '') ? qId : null;

                const { error } = await withTimeout<{ data: any; error: any }>(
                    (supabase.from('approvals').insert({
                        type: isEditing ? 'update' : 'create',
                        table_name: 'questions',
                        record_id: approvalRecordId,
                        data,
                        requested_by: profile?.id,
                        summary: `${isEditing ? 'Update' : 'Add'} question: ${newQuestion.text.slice(0, 50)}`,
                        status: 'pending'
                    }) as any)
                );
                if (error) throw error;
                toast({ title: 'Submitted for admin approval' });
            }
            resetForm();
        } catch (err: any) {
            console.error("QuestionsTab handleAddQuestion error:", err);
            toast({
                title: 'Save Failed',
                description: err.message || 'Network error or timeout. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setSaving(false);
            setUploading(false);
        }
    };

    const handleBulkAddQuestions = async () => {
        if (!bulkQuestions.trim() || !bulkQuestionSetId) {
            toast({ title: 'Questions and Question Set are required', variant: 'destructive' });
            return;
        }
        setLoading(true);
        try {
            const lines = bulkQuestions.split('\n').filter(l => l.trim());
            const questionsToInsert = lines.map(line => {
                const parts = line.split('|').map(s => s.trim());
                const [text, optionsStr, correctAnswer, pts] = parts;
                const options = optionsStr ? optionsStr.split(',').map(o => o.trim()) : [];
                return {
                    text: text || '',
                    options,
                    correct_answer: correctAnswer || '',
                    question_set_id: bulkQuestionSetId,
                    type: options.length >= 2 ? 'mcq' : 'text',
                    points: parseInt(pts) || 10
                };
            }).filter(q => q.text);

            if (questionsToInsert.length > 0) {
                if (isAdmin) {
                    const { error } = await supabase.from('questions').insert(questionsToInsert);
                    if (error) throw error;
                    toast({ title: `Added ${questionsToInsert.length} questions!` });
                } else {
                    const { error } = await supabase.from('approvals').insert({
                        type: 'create',
                        table_name: 'questions',
                        record_id: null,
                        data: questionsToInsert,
                        requested_by: profile?.id,
                        summary: `Bulk add ${questionsToInsert.length} questions to set`,
                        status: 'pending'
                    });
                    if (error) throw error;
                    toast({ title: 'Bulk addition submitted for admin approval' });
                }
                setBulkQuestions('');
                setIsBulkAddDialogOpen(false);
                await fetchData();
            }
        } catch (err: any) {
            toast({ title: 'Error bulk adding questions', description: err.message, variant: 'destructive' });
        }
        setLoading(false);
    };

    const handleDeleteQuestion = async (id: string) => {
        if (!confirm('Delete this question?')) return;
        setLoading(true);
        try {
            if (isAdmin) {
                const { error } = await supabase.from('questions').delete().eq('id', id);
                if (error) throw error;
                toast({ title: 'Question deleted!' });
                await fetchData();
            } else {
                const { error } = await supabase.from('approvals').insert({
                    type: 'delete', table_name: 'questions', record_id: id,
                    data: {}, requested_by: profile?.id,
                    summary: 'Delete question', status: 'pending'
                });
                if (error) throw error;
                toast({ title: 'Deletion submitted for admin approval' });
            }
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        }
        setLoading(false);
    };

    const handleToggleSelectQuestion = (id: string) => {
        setSelectedQuestionIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleToggleSelectAll = () => {
        if (selectedQuestionIds.length > 0 && selectedQuestionIds.length === filteredQuestions.length) {
            setSelectedQuestionIds([]);
        } else {
            setSelectedQuestionIds(filteredQuestions.map(q => q.id));
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Delete ${selectedQuestionIds.length} questions?`)) return;
        setLoading(true);
        try {
            if (isAdmin) {
                const { error } = await supabase.from('questions').delete().in('id', selectedQuestionIds);
                if (error) throw error;
                toast({ title: `${selectedQuestionIds.length} questions deleted!` });
                setSelectedQuestionIds([]);
                await fetchData();
            } else {
                const { error } = await supabase.from('approvals').insert({
                    type: 'delete',
                    table_name: 'questions',
                    record_id: null,
                    data: { ids: selectedQuestionIds },
                    requested_by: profile?.id,
                    summary: `Bulk delete ${selectedQuestionIds.length} questions`,
                    status: 'pending'
                });
                if (error) throw error;
                toast({ title: 'Bulk deletion submitted for admin approval' });
                setSelectedQuestionIds([]);
            }
        } catch (err: any) {
            toast({ title: 'Error deleting questions', description: err.message, variant: 'destructive' });
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold">Questions</h1>
                    <p className="text-muted-foreground">Manage competition questions</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => {
                        setIsEditing(false);
                        setNewQuestion({
                            id: '', text: '', type: 'mcq', options: ['', '', '', ''],
                            correct_answer: '', question_set_id: '', difficulty: 'medium',
                            points: 10, explanation: '', exact_match_required: false,
                            image_url: '', is_required: true, category: 'General',
                            timer: 0
                        });
                        setIsAddDialogOpen(true);
                    }} className="gradient-hero">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Question
                    </Button>
                    <Button onClick={() => setIsBulkAddDialogOpen(true)} variant="outline">
                        <Upload className="w-4 h-4 mr-2" />
                        Bulk Add
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Questions List</CardTitle>
                    <CardDescription>All available questions for competitions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="relative flex-1 mr-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search questions..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border">
                                <Checkbox
                                    id="select-all-questions"
                                    checked={selectedQuestionIds.length > 0 && selectedQuestionIds.length === filteredQuestions.length}
                                    onCheckedChange={handleToggleSelectAll}
                                />
                                <Label htmlFor="select-all-questions" className="text-xs font-medium cursor-pointer">Select All Visible</Label>
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-4">
                                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                            </div>
                        ) : filteredQuestions.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">No questions found</p>
                        ) : (
                            <div className="space-y-4">
                                {filteredQuestions.map((question) => (
                                    <div key={question.id} className={`p-4 rounded-lg border transition-all ${selectedQuestionIds.includes(question.id) ? 'border-primary bg-primary/5 shadow-sm' : 'border-border/50 hover:bg-muted/50'}`}>
                                        <div className="flex items-center gap-4">
                                            <Checkbox
                                                checked={selectedQuestionIds.includes(question.id)}
                                                onCheckedChange={() => handleToggleSelectQuestion(question.id)}
                                                className="mt-1"
                                            />
                                            <div className="flex-1 flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-medium">{question.text}</h3>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Set: {(questionSets || []).find(qs => qs.id === question.question_set_id)?.name || 'Unassigned'} • Difficulty: {question.difficulty} • Type: {question.type === 'text' ? 'Writing' : (question.type === 'slide' ? 'Slide' : 'MCQ')}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <div className="flex items-center gap-4 mt-2">
                                                            <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">{question.points} pts</span>
                                                            {(question.timer || 0) > 0 && (
                                                                <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                                                                    <Clock className="w-3 h-3" /> {question.timer}s Limit
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 ml-4">
                                                    <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => {
                                                        setNewQuestion(question);
                                                        setIsEditing(true);
                                                        setIsAddDialogOpen(true);
                                                    }}>
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
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {selectedQuestionIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-primary text-primary-foreground px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 border border-primary-foreground/20">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary-foreground/20 px-2 py-0.5 rounded text-xs font-bold">
                                {selectedQuestionIds.length}
                            </div>
                            <span className="text-sm font-medium">Questions Selected</span>
                        </div>
                        <div className="h-6 w-px bg-primary-foreground/20" />
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedQuestionIds([])}
                                className="text-primary-foreground hover:bg-primary-foreground/10 h-8"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleBulkDelete}
                                className="bg-red-500 hover:bg-red-600 border-none h-8 shadow-lg"
                            >
                                <Trash2 className="w-3.5 h-3.5 mr-2" />
                                Delete Selected
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            {/* Add Question Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Question' : 'Add New Question'}</DialogTitle>
                        <DialogDescription>{isEditing ? 'Update question content and points' : 'Create a new competition question'}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Question Type</Label>
                            <Select
                                value={newQuestion.type}
                                onValueChange={(value: 'mcq' | 'text' | 'slide') => setNewQuestion({ ...newQuestion, type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="mcq">Multiple Choice (MCQ)</SelectItem>
                                    <SelectItem value="text">Writing Answer</SelectItem>
                                    <SelectItem value="slide">Slideshow / Learning Slide</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Timer (Seconds)</Label>
                            <Input
                                type="number"
                                value={newQuestion.timer || 0}
                                onChange={(e) => setNewQuestion({ ...newQuestion, timer: parseInt(e.target.value) || 0 })}
                                placeholder="0 for unlimited"
                            />
                            <p className="text-[10px] text-muted-foreground italic">If {'\u003e'} 0, question will auto-advance when time ends.</p>
                        </div>

                        <div className="space-y-2">
                            <Label>{newQuestion.type === 'slide' ? 'Slide Title / Description' : 'Question Text *'}</Label>
                            <Textarea
                                value={newQuestion.text}
                                onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                                placeholder={newQuestion.type === 'slide' ? "Enter a title or description for this slide..." : (newQuestion.type === 'mcq' ? "What is the capital of France?" : "Explain the theory of relativity...")}
                                rows={2}
                            />
                        </div>

                        {newQuestion.type === 'slide' && (
                            <div className="space-y-2">
                                <Label>Google Slides / Embed URL</Label>
                                <Input
                                    value={(newQuestion as any).slide_url || ''}
                                    onChange={(e) => setNewQuestion({ ...newQuestion, slide_url: e.target.value } as any)}
                                    placeholder="https://docs.google.com/presentation/d/.../embed"
                                />
                                <p className="text-[10px] text-muted-foreground italic">
                                    Paste the <strong>Embed</strong> link from Google Slides (File {"->"} Share {"->"} Publish to web {"->"} Embed).
                                </p>
                            </div>
                        )}

                        {newQuestion.type === 'mcq' && (
                            <div className="space-y-2">
                                <Label>Options</Label>
                                {newQuestion.options.map((option, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <Input
                                            value={option}
                                            onChange={(e) => {
                                                const newOptions = [...newQuestion.options];
                                                newOptions[index] = e.target.value;
                                                setNewQuestion({ ...newQuestion, options: newOptions });
                                            }}
                                            placeholder={`Option ${index + 1}`}
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setNewQuestion({ ...newQuestion, correct_answer: option })}
                                            className={newQuestion.correct_answer === option && option !== '' ? 'bg-success/10 border-success' : ''}
                                        >
                                            {newQuestion.correct_answer === option && option !== '' ? '✓ Correct' : 'Mark Correct'}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {newQuestion.type === 'text' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Ideal Answer / Keywords (Optional)</Label>
                                    <Textarea
                                        value={newQuestion.correct_answer}
                                        onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
                                        placeholder="Enter keywords or a model answer for grading reference..."
                                        rows={2}
                                    />
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                                    <Checkbox
                                        id="exact-match-admin"
                                        checked={newQuestion.exact_match_required}
                                        onCheckedChange={(checked) => setNewQuestion({ ...newQuestion, exact_match_required: !!checked })}
                                    />
                                    <div className="space-y-1 leading-none">
                                        <Label htmlFor="exact-match-admin" className="text-sm font-medium cursor-pointer">Exact Match Required</Label>
                                        <p className="text-[10px] text-muted-foreground italic">Case-sensitive & exact spacing required if checked.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Input
                                    value={newQuestion.category}
                                    onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                                    placeholder="e.g. Math, Science"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Question Set</Label>
                                <Select
                                    value={newQuestion.question_set_id}
                                    onValueChange={(value) => setNewQuestion({ ...newQuestion, question_set_id: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Question Set" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(questionSets || []).map((qs) => (
                                            <SelectItem key={qs.id} value={qs.id}>
                                                {qs.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Difficulty</Label>
                                <Select
                                    value={newQuestion.difficulty}
                                    onValueChange={(value) => setNewQuestion({ ...newQuestion, difficulty: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select difficulty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="easy">Easy</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="hard">Hard</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Points</Label>
                                <Input
                                    type="number"
                                    value={newQuestion.points}
                                    onChange={(e) => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) || 0 })}
                                    placeholder="10"
                                />
                            </div>
                        </div>

                        {newQuestion.type !== 'slide' && (
                            <div className="space-y-4">
                                <Label>Question Image</Label>
                                <div className="flex gap-4">
                                    <div className="flex-1 space-y-2">
                                        <Label className="text-xs text-muted-foreground">Upload Local Image</Label>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                            className="cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Label className="text-xs text-muted-foreground">Or Paste Image URL</Label>
                                        <Input
                                            value={newQuestion.image_url}
                                            onChange={(e) => {
                                                setNewQuestion({ ...newQuestion, image_url: e.target.value });
                                                if (e.target.value) setImageFile(null);
                                            }}
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>
                                </div>
                                {(imageFile || newQuestion.image_url) && (
                                    <div className="relative aspect-video rounded-lg border overflow-hidden bg-muted">
                                        <img
                                            src={imageFile ? URL.createObjectURL(imageFile) : newQuestion.image_url}
                                            alt="Preview"
                                            className="w-full h-full object-contain"
                                        />
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="absolute top-2 right-2 h-7 w-7 p-0 rounded-full"
                                            onClick={() => {
                                                setImageFile(null);
                                                setNewQuestion({ ...newQuestion, image_url: '' });
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="flex items-center justify-between border p-3 rounded-md mt-4">
                            <div className="space-y-0.5">
                                <Label>Required Question</Label>
                                <p className="text-xs text-muted-foreground">Students must answer this to proceed</p>
                            </div>
                            <Switch
                                checked={newQuestion.is_required}
                                onCheckedChange={(checked) => setNewQuestion({ ...newQuestion, is_required: checked })}
                            />
                        </div>
                    </div>
                    <DialogFooter className="mt-6">
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddQuestion} disabled={saving}>
                            {saving ? (<><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</>) : (isEditing ? 'Update Question' : 'Save Question')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Add Questions Dialog */}
            <Dialog open={isBulkAddDialogOpen} onOpenChange={setIsBulkAddDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Bulk Add Questions</DialogTitle>
                        <DialogDescription>
                            Format: Question | Opt1, Opt2, Opt3, Opt4 | CorrectIndex (0-3) | Points
                            <br />One question per line.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Question Set</Label>
                            <Select value={bulkQuestionSetId} onValueChange={setBulkQuestionSetId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Question Set" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(questionSets || []).map((qs) => (
                                        <SelectItem key={qs.id} value={qs.id}>{qs.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Questions Data</Label>
                            <Textarea
                                value={bulkQuestions}
                                onChange={(e) => setBulkQuestions(e.target.value)}
                                placeholder="What is 2+2? | 3, 4, 5, 6 | 1 | 10"
                                rows={10}
                                className="font-mono text-sm"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBulkAddDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleBulkAddQuestions} disabled={loading} className="gradient-hero">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Add Questions'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}

function QuestionSetsTab({ questionSets: initialQuestionSets, competitions: initialCompetitions }: { questionSets: any[], competitions: any[] }) {
    const [questionSets, setQuestionSets] = useState<any[]>([]);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [competitions, setCompetitions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedSetIds, setSelectedSetIds] = useState<string[]>([]);

    const { toast } = useToast();
    const { profile, currentView } = useAuth();
    const isAdmin = (currentView || profile?.role) === 'admin';

    const fetchData = async () => {
        setLoading(true);
        const [{ data: qs }, { data: comps }, { data: qCountData }] = await Promise.all([
            supabase.from('question_sets').select('*').order('created_at', { ascending: false }),
            supabase.from('competitions').select('id, name'),
            supabase.from('questions').select('question_set_id')
        ]);

        if (qs) {
            setQuestionSets(qs);
            // Calculate counts
            const countsMap: Record<string, number> = {};
            (qCountData || []).forEach(q => {
                if (q.question_set_id) {
                    countsMap[q.question_set_id] = (countsMap[q.question_set_id] || 0) + 1;
                }
            });
            setCounts(countsMap);
        }
        if (comps) setCompetitions(comps);
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const emptyQS = {
        name: '', description: '', category: 'General', time_limit: 0,
        allow_retries: true, scoring_type: 'highest', competition_ids: [] as string[],
        question_ids: [] as string[], difficulty: 'medium'
    };
    const [newQuestionSet, setNewQuestionSet] = useState(emptyQS);

    const filteredQuestionSets = questionSets.filter(qs =>
        (qs?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (qs?.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (qs?.difficulty || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddQuestionSet = async () => {
        if (!newQuestionSet.name) {
            toast({ title: 'Question set name is required', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            const { id, questions, created_at, updated_at, ...data } = newQuestionSet as any;

            if (isAdmin) {
                if (isEditing) {
                    const { error } = await supabase.from('question_sets').update(data).eq('id', id);
                    if (error) throw error;
                    toast({ title: 'Question set updated!' });
                } else {
                    const { error } = await supabase.from('question_sets').insert(data);
                    if (error) throw error;
                    toast({ title: 'Question set added!' });
                }
                await fetchData();
            } else {
                const { error } = await supabase.from('approvals').insert({
                    type: isEditing ? 'update' : 'create',
                    table_name: 'question_sets',
                    record_id: isEditing ? id : null,
                    data,
                    requested_by: profile?.id,
                    summary: `${isEditing ? 'Update' : 'Add'} question set: ${newQuestionSet.name}`,
                    status: 'pending'
                });
                if (error) throw error;
                toast({ title: 'Submitted for admin approval' });
            }

            setIsAddDialogOpen(false);
            setIsEditing(false);
            setNewQuestionSet(emptyQS);
        } catch (error: any) {
            toast({ title: 'Error saving question set', description: error.message, variant: 'destructive' });
        }
        setLoading(false);
    };

    const handleDeleteQuestionSet = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        setLoading(true);
        try {
            if (isAdmin) {
                const { error } = await supabase.from('question_sets').delete().eq('id', id);
                if (error) throw error;
                toast({ title: 'Question set deleted successfully!' });
                await fetchData();
            } else {
                const { error } = await supabase.from('approvals').insert({
                    type: 'delete', table_name: 'question_sets', record_id: id,
                    data: {}, requested_by: profile?.id,
                    summary: 'Delete question set', status: 'pending'
                });
                if (error) throw error;
                toast({ title: 'Deletion submitted for admin approval' });
            }
        } catch (error: any) {
            toast({ title: 'Error deleting question set', description: error.message, variant: 'destructive' });
        }
        setLoading(false);
    };

    const handleToggleSelectSet = (id: string) => {
        setSelectedSetIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleToggleSelectAll = () => {
        if (selectedSetIds.length > 0 && selectedSetIds.length === filteredQuestionSets.length) {
            setSelectedSetIds([]);
        } else {
            setSelectedSetIds(filteredQuestionSets.map(qs => qs.id));
        }
    };

    const handleBulkDeleteQuestionSets = async () => {
        if (!confirm(`Delete ${selectedSetIds.length} question sets?`)) return;
        setLoading(true);
        try {
            if (isAdmin) {
                const { error } = await supabase.from('question_sets').delete().in('id', selectedSetIds);
                if (error) throw error;
                toast({ title: `${selectedSetIds.length} question sets deleted!` });
                setSelectedSetIds([]);
                await fetchData();
            } else {
                const { error } = await supabase.from('approvals').insert({
                    type: 'delete',
                    table_name: 'question_sets',
                    record_id: null,
                    data: { ids: selectedSetIds },
                    requested_by: profile?.id,
                    summary: `Bulk delete ${selectedSetIds.length} question sets`,
                    status: 'pending'
                });
                if (error) throw error;
                toast({ title: 'Bulk deletion submitted for admin approval' });
                setSelectedSetIds([]);
            }
        } catch (err: any) {
            toast({ title: 'Error deleting sets', description: err.message, variant: 'destructive' });
        }
        setLoading(false);
    };


    const handleCompSelection = (compId: string) => {
        setNewQuestionSet(prev => {
            const currentComps = prev.competition_ids || [];
            const newComps = currentComps.includes(compId)
                ? currentComps.filter(id => id !== compId)
                : [...currentComps, compId];
            return { ...prev, competition_ids: newComps };
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold">Question Sets</h1>
                    <p className="text-muted-foreground">Organize questions into sets for competitions</p>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)} className="gradient-hero">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question Set
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Question Sets List</CardTitle>
                    <CardDescription>All question sets for organizing competition questions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="relative flex-1 mr-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search question sets..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                {selectedSetIds.length > 0 && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleBulkDeleteQuestionSets}
                                        disabled={loading}
                                        className="h-9 px-3 text-xs"
                                    >
                                        <Trash2 className="w-3 h-3 mr-2" />
                                        Delete Selected ({selectedSetIds.length})
                                    </Button>
                                )}
                                <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border">
                                    <Checkbox
                                        id="select-all-sets"
                                        checked={selectedSetIds.length > 0 && selectedSetIds.length === filteredQuestionSets.length}
                                        onCheckedChange={handleToggleSelectAll}
                                    />
                                    <Label htmlFor="select-all-sets" className="text-xs font-medium cursor-pointer">Select All Visible</Label>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-4">
                                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                            </div>
                        ) : filteredQuestionSets.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">No question sets found</p>
                        ) : (
                            <div className="space-y-4">
                                {filteredQuestionSets.map((questionSet) => (
                                    <div key={questionSet.id} className={`p-4 rounded-lg border transition-all ${selectedSetIds.includes(questionSet.id) ? 'border-primary bg-primary/5 shadow-sm' : 'border-border/50 hover:bg-muted/50'}`}>
                                        <div className="flex items-center gap-4">
                                            <Checkbox
                                                checked={selectedSetIds.includes(questionSet.id)}
                                                onCheckedChange={() => handleToggleSelectSet(questionSet.id)}
                                                className="mt-1"
                                            />
                                            <div className="flex-1 flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-medium">{questionSet.name}</h3>
                                                    <p className="text-xs text-muted-foreground">{questionSet.description}</p>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${questionSet.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                                                            questionSet.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {questionSet.difficulty || 'Medium'}
                                                        </span>
                                                        <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">{questionSet.category}</span>
                                                        <span className="text-xs text-muted-foreground">Comps: {questionSet.competition_ids?.length || 0}</span>
                                                        <span className="text-xs text-muted-foreground italic">Questions: {counts[questionSet.id] || 0}</span>
                                                        <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                                                            <Clock className="w-3 h-3" />
                                                            {(() => {
                                                                if (!counts[questionSet.id]) return 'Unlimited';
                                                                const totalSeconds = Math.round((counts[questionSet.id] * 30) / 30) * 30;
                                                                const mins = Math.floor(totalSeconds / 60);
                                                                const secs = totalSeconds % 60;
                                                                return `${mins}:${secs.toString().padStart(2, '0')}s avg`;
                                                            })()}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground border px-2 py-0.5 rounded">
                                                            {questionSet.allow_retries ? 'Retries Allowed' : 'No Retries'}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground border px-2 py-0.5 rounded capitalize">
                                                            Score: {questionSet.scoring_type?.replace(/_/g, ' ') || 'Highest'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 ml-4">
                                                    <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => {
                                                        const { questions, ...restQs } = questionSet;
                                                        setNewQuestionSet({
                                                            ...restQs,
                                                            competition_ids: questionSet.competition_ids || [],
                                                            question_ids: questionSet.question_ids || questionSet.questions || []
                                                        });
                                                        setIsEditing(true);
                                                        setIsAddDialogOpen(true);
                                                    }}>
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
                                                                <AlertDialogTitle>Delete Question Set</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete this question set? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    className="bg-destructive hover:bg-destructive/90"
                                                                    onClick={() => handleDeleteQuestionSet(questionSet.id)}
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Add Question Set Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Question Set' : 'Add New Question Set'}</DialogTitle>
                        <DialogDescription>{isEditing ? 'Update question set details' : 'Create a new question set for organizing competition questions'}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Question Set Name *</Label>
                            <Input
                                value={newQuestionSet.name}
                                onChange={(e) => setNewQuestionSet({ ...newQuestionSet, name: e.target.value })}
                                placeholder="e.g., Math Addition"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={newQuestionSet.description}
                                onChange={(e) => setNewQuestionSet({ ...newQuestionSet, description: e.target.value })}
                                placeholder="Describe the question set..."
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Input
                                value={newQuestionSet.category}
                                onChange={(e) => setNewQuestionSet({ ...newQuestionSet, category: e.target.value })}
                                placeholder="e.g., Math, Science, etc."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Difficulty Level</Label>
                            <Select
                                value={newQuestionSet.difficulty || 'medium'}
                                onValueChange={(val) => setNewQuestionSet({ ...newQuestionSet, difficulty: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="easy">Easy (Green)</SelectItem>
                                    <SelectItem value="medium">Medium (Yellow)</SelectItem>
                                    <SelectItem value="hard">Hard (Red)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Time Limit (minutes)</Label>
                            <Input
                                type="number"
                                value={newQuestionSet.time_limit}
                                onChange={(e) => setNewQuestionSet({ ...newQuestionSet, time_limit: parseInt(e.target.value) || 0 })}
                                placeholder="0 for no limit"
                            />
                            <p className="text-xs text-muted-foreground">Set to 0 for no time limit</p>
                        </div>

                        <div className="flex items-center justify-between border p-3 rounded-md">
                            <div className="space-y-0.5">
                                <Label>Allow Retries</Label>
                                <p className="text-xs text-muted-foreground">Students can redo this set</p>
                            </div>
                            <Switch
                                checked={newQuestionSet.allow_retries}
                                onCheckedChange={(checked) => setNewQuestionSet({ ...newQuestionSet, allow_retries: checked })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Scoring Strategy</Label>
                            <Select
                                value={newQuestionSet.scoring_type}
                                onValueChange={(value) => setNewQuestionSet({ ...newQuestionSet, scoring_type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select scoring type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="highest">Highest Score Achieved</SelectItem>
                                    <SelectItem value="best_of_3">Best of 3 Attempts</SelectItem>
                                    <SelectItem value="first_attempt">First Attempt Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Assign to Competitions</Label>
                            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                                {competitions.map((comp) => (
                                    <div key={comp.id} className="flex items-center gap-2">
                                        <Checkbox
                                            id={`qs-comp-${comp.id}`}
                                            checked={newQuestionSet.competition_ids.includes(comp.id)}
                                            onCheckedChange={() => handleCompSelection(comp.id)}
                                        />
                                        <Label htmlFor={`qs-comp-${comp.id}`} className="text-sm font-normal cursor-pointer">
                                            {comp.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddQuestionSet} disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                isEditing ? 'Save Changes' : 'Add Question Set'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Avatars Tab Component
function AvatarsTab() {
    const [avatars, setAvatars] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [newAvatar, setNewAvatar] = useState({
        id: '',
        name: '',
        image_url: '',
        category: 'default',
        unlock_condition: { type: 'none', value: 0 },
        created_at: '',
        updated_at: ''
    });
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const { toast } = useToast();

    const { profile, currentView } = useAuth();
    const isAdmin = (currentView || profile?.role) === 'admin';

    // Load avatars from Supabase
    const fetchAvatars = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('avatars').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setAvatars((data || []) as any);
        } catch (error: any) {
            toast({ title: 'Error fetching avatars', description: error.message, variant: 'destructive' });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAvatars();
    }, []);

    const filteredAvatars = (avatars || []).filter((avatar: any) =>
        (avatar?.name || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
        (avatar?.category || "").toLowerCase().includes((searchTerm || "").toLowerCase())
    );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 500 * 1024) {
                toast({ title: 'File too large', description: 'Please keep under 500KB', variant: 'destructive' });
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                setFilePreview(event.target?.result as string);
                setNewAvatar({ ...newAvatar, image_url: event.target?.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddAvatar = async () => {
        if (!newAvatar.name || !newAvatar.image_url) {
            toast({ title: 'Name and image are required', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            const avatarData = {
                name: newAvatar.name,
                url: newAvatar.image_url,
                category: newAvatar.category,
                unlock_condition: newAvatar.unlock_condition,
                is_active: true
            };

            if (isAdmin) {
                if (isEditing) {
                    const { error } = await supabase.from('avatars').update(avatarData).eq('id', newAvatar.id);
                    if (error) throw error;
                    toast({ title: 'Avatar updated!' });
                } else {
                    const { error } = await supabase.from('avatars').insert(avatarData);
                    if (error) throw error;
                    toast({ title: 'Avatar added!' });
                }
                await fetchAvatars();
            } else {
                const { error } = await supabase.from('approvals').insert({
                    type: isEditing ? 'update' : 'create',
                    table_name: 'avatars',
                    record_id: isEditing ? newAvatar.id : null,
                    data: avatarData,
                    requested_by: profile?.id,
                    summary: `${isEditing ? 'Update' : 'Add'} avatar: ${newAvatar.name}`,
                    status: 'pending'
                });
                if (error) throw error;
                toast({ title: 'Submitted for admin approval' });
            }

            setIsAddDialogOpen(false);
            setIsEditing(false);
            setNewAvatar({
                id: '', name: '', image_url: '', category: 'default',
                unlock_condition: { type: 'none', value: 0 },
                created_at: '', updated_at: ''
            });
            setFilePreview(null);
        } catch (error: any) {
            toast({ title: 'Error saving avatar', description: error.message, variant: 'destructive' });
        }
        setLoading(false);
    };

    const handleDeleteAvatar = async (id: string) => {
        setLoading(true);
        try {
            if (isAdmin) {
                const { error } = await supabase.from('avatars').delete().eq('id', id);
                if (error) throw error;
                await fetchAvatars();
                toast({ title: 'Avatar deleted successfully!' });
            } else {
                const { error } = await supabase.from('approvals').insert({
                    type: 'delete', table_name: 'avatars', record_id: id,
                    data: {}, requested_by: profile?.id,
                    summary: 'Delete avatar', status: 'pending'
                });
                if (error) throw error;
                toast({ title: 'Deletion submitted for admin approval' });
            }
        } catch (error: any) {
            toast({ title: 'Error deleting avatar', description: error.message, variant: 'destructive' });
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold">Avatars</h1>
                    <p className="text-muted-foreground">Manage user avatars</p>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)} className="gradient-hero">
                    <Plus className="w-4 h-4 mr-2" />
                    {isAdmin ? 'Add Avatar' : 'Request New Avatar'}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Avatars List</CardTitle>
                    <CardDescription>All available avatars for users</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search avatars..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {loading ? (
                            <div className="text-center py-4">
                                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                            </div>
                        ) : filteredAvatars.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">No avatars found</p>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {filteredAvatars.map((avatar) => (
                                    <div key={avatar.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                                        <div className="flex flex-col items-center gap-3">
                                            <img src={avatar.url || avatar.image_url} alt={avatar.name} className="w-16 h-16 rounded-full object-cover" />
                                            <div className="text-center">
                                                <h3 className="font-medium text-sm">{avatar.name}</h3>
                                                <p className="text-xs text-muted-foreground">{avatar.category}</p>
                                                {avatar.unlock_condition && avatar.unlock_condition.type && avatar.unlock_condition.type !== 'none' && (
                                                    <div className="mt-1 text-[10px] px-2 py-0.5 bg-accent/10 border border-accent/20 rounded-full text-accent-foreground flex items-center justify-center gap-1">
                                                        <Lock className="w-3 h-3" />
                                                        <span>
                                                            {avatar.unlock_condition?.type === 'streak'
                                                                ? `${avatar.unlock_condition.value} Day Streak`
                                                                : avatar.unlock_condition?.type === 'competitions'
                                                                    ? `${avatar.unlock_condition.value} Competitions`
                                                                    : `${avatar.unlock_condition.value} Questions`}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                                <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => {
                                                    setNewAvatar({
                                                        id: avatar.id,
                                                        name: avatar.name,
                                                        image_url: avatar.url || avatar.image_url,
                                                        category: avatar.category,
                                                        unlock_condition: { type: 'none', value: 0 },
                                                        created_at: avatar.created_at,
                                                        updated_at: avatar.updated_at
                                                    });
                                                    setFilePreview(avatar.url || avatar.image_url);
                                                    setIsEditing(true);
                                                    setIsAddDialogOpen(true);
                                                }}>
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
                                                            <AlertDialogTitle>Delete Avatar</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete this avatar? This action cannot be undone.
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
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Add Avatar Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Avatar' : 'Add New Avatar'}</DialogTitle>
                        <DialogDescription>{isEditing ? 'Update avatar image and settings' : 'Upload a new avatar image'}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Avatar Name *</Label>
                            <Input
                                value={newAvatar.name}
                                onChange={(e) => setNewAvatar({ ...newAvatar, name: e.target.value })}
                                placeholder="e.g., Student Avatar"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Input
                                value={newAvatar.category}
                                onChange={(e) => setNewAvatar({ ...newAvatar, category: e.target.value })}
                                placeholder="e.g., default, student, teacher"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Unlock Type</Label>
                                <Select
                                    value={newAvatar.unlock_condition?.type || 'none'}
                                    onValueChange={(value) => setNewAvatar({
                                        ...newAvatar,
                                        unlock_condition: { ...newAvatar.unlock_condition, type: value, value: newAvatar.unlock_condition?.value || 0 }
                                    })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select condition" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No Restriction</SelectItem>
                                        <SelectItem value="questions">Questions Answered</SelectItem>
                                        <SelectItem value="streak">Login Streak</SelectItem>
                                        <SelectItem value="competitions">Competitions Attended</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Threshold Value</Label>
                                <Input
                                    type="number"
                                    disabled={!newAvatar.unlock_condition?.type || newAvatar.unlock_condition.type === 'none'}
                                    value={newAvatar.unlock_condition?.value || 0}
                                    onChange={(e) => setNewAvatar({
                                        ...newAvatar,
                                        unlock_condition: { ...newAvatar.unlock_condition, value: parseInt(e.target.value) || 0 }
                                    })}
                                    placeholder="e.g. 50"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Avatar Image *</Label>
                            <div className="flex items-center gap-4">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="cursor-pointer"
                                />
                                {filePreview && (
                                    <div className="w-16 h-16 rounded-full overflow-hidden">
                                        <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddAvatar} disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                isEditing ? 'Save Changes' : 'Add Avatar'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Users Tab Component
function UsersTab({ users, schools }: { users: any[], schools: any[] }) {
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [schoolFilter, setSchoolFilter] = useState('all');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isBulkAddDialogOpen, setIsBulkAddDialogOpen] = useState(false);
    const [showAddUserPassword, setShowAddUserPassword] = useState(true);
    const [showBulkStudentPassword, setShowBulkStudentPassword] = useState(false);
    const [showBulkTeacherPassword, setShowBulkTeacherPassword] = useState(false);
    const [newUser, setNewUser] = useState({
        id: '',
        email: '',
        display_name: '',
        role: 'student',
        school_id: '',
        password: '',
        password_text: '',
        is_active: true,
        score: 0,
        progress: 0,
        avatar_id: null,
        created_at: '',
        updated_at: ''
    });

    // Bulk states
    const [bulkStudents, setBulkStudents] = useState('');
    const [bulkTeachers, setBulkTeachers] = useState('');
    const [bulkStudentSchoolId, setBulkStudentSchoolId] = useState('');
    const [bulkTeacherSchoolId, setBulkTeacherSchoolId] = useState('');
    const [bulkStudentPassword, setBulkStudentPassword] = useState('');
    const [bulkTeacherPassword, setBulkTeacherPassword] = useState('');
    const [bulkResults, setBulkResults] = useState<{ email: string, password: string, status: string }[]>([]);
    const [isBulkResultOpen, setIsBulkResultOpen] = useState(false);

    // Internal user list management for the tab
    const [tabUsers, setTabUsers] = useState<any[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

    const togglePasswordVisibility = (id: string) => {
        setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            console.log("Fetching users from Supabase...");
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(200);
            if (error) {
                console.error("Supabase profiles fetch error:", error);
                throw error;
            }
            console.log(`Fetched ${data?.length || 0} users`);
            setTabUsers(data || []);
        } catch (err: any) {
            console.error("Failed to fetch users", err);
            toast({ title: 'Fetch Error', description: err.message, variant: 'destructive' });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const { toast } = useToast();
    const { profile, isAdmin } = useAuth();

    // Use tabUsers (local state) instead of users prop for better performance and to fix the empty list issue
    const filteredUsers = (tabUsers || []).filter(user =>
        (user?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user?.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (roleFilter === 'all' || user?.role === roleFilter) &&
        (schoolFilter === 'all' || user?.school_id === schoolFilter)
    );

    const handleAddUser = async () => {
        if (!newUser.email) {
            toast({ title: 'Email is required', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            if (isAdmin) {
                if (isEditing) {
                    const { error } = await supabase
                        .from('profiles')
                        .update({
                            email: newUser.email,
                            display_name: newUser.display_name,
                            role: newUser.role,
                            school_id: newUser.school_id,
                            is_active: newUser.is_active,
                            password_text: newUser.password_text || newUser.password
                        })
                        .eq('id', newUser.id);

                    if (error) throw error;
                    toast({ title: 'User updated successfully!' });
                } else {
                    // Creating user requires auth.signUp which is handled by createClient
                    const passwordToUse = newUser.password || generateLumoraPassword();
                    const email = newUser.email.toLowerCase();

                    const secondary = createClient(
                        import.meta.env.VITE_SUPABASE_URL,
                        import.meta.env.VITE_SUPABASE_ANON_KEY,
                        { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
                    );

                    const { data: authData, error: authError } = await secondary.auth.signUp({
                        email: email,
                        password: passwordToUse,
                        options: {
                            data: {
                                role: newUser.role,
                                display_name: newUser.display_name || email.split('@')[0],
                            }
                        }
                    });

                    if (authError) throw authError;

                    const userId = authData.user?.id;
                    await supabase.from('profiles').upsert({
                        id: userId,
                        email: email,
                        display_name: newUser.display_name || email.split('@')[0],
                        role: newUser.role,
                        school_id: newUser.school_id || null,
                        is_active: true,
                        password_text: passwordToUse
                    }, { onConflict: 'email' });

                    toast({
                        title: 'User Registered!',
                        description: `User created. Password: ${passwordToUse}`,
                    });
                }
                await fetchUsers();
            } else {
                const { error } = await supabase.from('approvals').insert({
                    type: isEditing ? 'update' : 'create',
                    table_name: 'profiles',
                    record_id: isEditing ? newUser.id : null,
                    data: {
                        display_name: newUser.display_name,
                        role: newUser.role,
                        school_id: newUser.school_id,
                        is_active: newUser.is_active,
                        email: newUser.email,
                        password: newUser.password || generateLumoraPassword()
                    },
                    requested_by: profile?.id,
                    summary: `${isEditing ? 'Update' : 'Add'} user: ${newUser.display_name || newUser.email}`,
                    status: 'pending'
                });
                if (error) throw error;
                toast({ title: 'Submitted for admin approval' });
            }

            // UI Reset
            setIsAddDialogOpen(false);
            setIsEditing(false);
            setNewUser({
                id: '', email: '', display_name: '', role: 'student', school_id: '',
                password: '', password_text: '', is_active: true, score: 0, progress: 0, avatar_id: null,
                created_at: '', updated_at: ''
            });

        } catch (error: any) {
            console.error('Error saving user:', error);
            toast({
                title: 'Error saving user',
                description: error.message || 'Unknown error',
                variant: 'destructive'
            });
        }
        setLoading(false);
    };

    const handleBulkAdd = async (role: 'student' | 'teacher') => {
        if (!isAdmin) {
            toast({ title: 'Moderators cannot perform bulk user creation directly', variant: 'destructive' });
            return;
        }
        const data = role === 'student' ? bulkStudents : bulkTeachers;
        const schoolId = role === 'student' ? bulkStudentSchoolId : bulkTeacherSchoolId;
        const fixedPassword = role === 'student' ? bulkStudentPassword : bulkTeacherPassword;

        if (!data.trim()) {
            toast({ title: `Please enter ${role} emails`, variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            const lines = data.split('\n').filter(line => line.trim());
            let addedCount = 0;
            const results: any[] = [];

            const secondary = createClient(
                import.meta.env.VITE_SUPABASE_URL,
                import.meta.env.VITE_SUPABASE_ANON_KEY,
                { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
            );

            const creationPromises = lines.map(async (line) => {
                const parts = line.split(/[,\s]+/).filter(Boolean);
                const email = parts[0]?.trim().toLowerCase();
                const customPass = parts[1]?.trim();

                // Logic: If admin specified a password (fixedPassword), use it for all.
                // If not, use customPass from the line if it exists.
                // Otherwise, generate a random one.
                const password = fixedPassword || customPass || generateLumoraPassword();

                if (!email) return;

                let status = 'Success';
                let userId = null;

                try {
                    const { data: authData, error: authError } = await secondary.auth.signUp({
                        email: email,
                        password: password,
                        options: {
                            data: {
                                role: role,
                                display_name: email.split('@')[0],
                            }
                        }
                    });

                    if (authError) {
                        if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
                            status = 'Linked (Existing Auth)';
                            // Try to get existing ID
                            const { data: existing } = await supabase.from('profiles').select('id').eq('email', email).single();
                            if (existing) userId = existing.id;
                        } else {
                            throw authError;
                        }
                    } else {
                        userId = authData.user?.id;
                    }

                    await supabase.from('profiles').upsert({
                        id: userId, // Will be null if registration failed/already exists
                        email: email,
                        role: role,
                        school_id: schoolId || null,
                        is_active: true,
                        display_name: email.split('@')[0],
                        password_text: password
                    }, { onConflict: 'email' });

                    addedCount++;
                    results.push({ email, password, status });
                } catch (authError: any) {
                    results.push({ email, password: 'FAILED', status: `Error: ${authError.message}` });
                }
            });

            await Promise.all(creationPromises);

            if (addedCount > 0) {
                setBulkResults(results);
                setIsBulkResultOpen(true);
                toast({
                    title: 'Batch Processing Complete',
                    description: `Processed ${addedCount} new users. See the results below.`
                });

                if (role === 'student') setBulkStudents('');
                else setBulkTeachers('');
                setIsBulkAddDialogOpen(false);
                // Refresh list
                await fetchUsers();
            } else {
                toast({
                    title: 'No changes needed',
                    description: 'All users are already registered correctly.',
                    variant: 'default'
                });
            }

        } catch (error: any) {
            console.error('Bulk add error:', error);
            toast({ title: 'Error adding users', description: error.message, variant: 'destructive' });
        }
        setLoading(false);
    };

    const handleDeleteUser = async (id: string, email: string) => {
        if (id === profile?.id) { toast({ title: 'You cannot delete yourself!', variant: 'destructive' }); return; }
        if (!confirm(`Are you sure you want to delete user ${email}?`)) return;

        setLoading(true);
        try {
            if (isAdmin) {
                const { error } = await supabase.from('profiles').delete().eq('id', id);
                if (error) throw error;
                toast({ title: 'User deleted successfully!' });
                await fetchUsers();
            } else {
                const { error } = await supabase.from('approvals').insert({
                    type: 'delete', table_name: 'profiles', record_id: id,
                    data: {}, requested_by: profile?.id,
                    summary: `Delete user: ${email}`, status: 'pending'
                });
                if (error) throw error;
                toast({ title: 'Deletion submitted for admin approval' });
            }
        } catch (error: any) {
            toast({ title: 'Error deleting user', description: error.message, variant: 'destructive' });
        }
        setLoading(false);
    };

    const handleBulkDelete = async () => {
        if (!selectedUserIds.length) return;
        if (!confirm(`Delete ${selectedUserIds.length} users?`)) return;
        setLoading(true);
        try {
            if (isAdmin) {
                const { error } = await supabase.from('profiles').delete().in('id', selectedUserIds);
                if (error) throw error;
                toast({ title: `${selectedUserIds.length} users deleted successfully!` });
                setSelectedUserIds([]);
                await fetchUsers();
            } else {
                const { error } = await supabase.from('approvals').insert({
                    type: 'delete', table_name: 'profiles_bulk', record_id: profile?.id,
                    data: { ids: selectedUserIds }, requested_by: profile?.id,
                    summary: `Bulk delete ${selectedUserIds.length} users`, status: 'pending'
                });
                if (error) throw error;
                toast({ title: 'Bulk deletion submitted for admin approval' });
            }
        } catch (error: any) {
            toast({ title: 'Error deleting users', description: error.message, variant: 'destructive' });
        }
        setLoading(false);
    };

    const handleToggleSelectUser = (id: string) => {
        setSelectedUserIds(prev =>
            prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
        );
    };

    const handleToggleSelectAll = () => {
        const selectableUsers = filteredUsers.filter(u => u.id !== profile?.id);
        if (selectedUserIds.length === selectableUsers.length) {
            setSelectedUserIds([]);
        } else {
            setSelectedUserIds(selectableUsers.map(u => u.id));
        }
    };

    const handleRoleChange = async (userId: string, targetEmail: string, newRole: string) => {
        try {
            if (isAdmin) {
                const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
                if (error) throw error;
                toast({ title: 'User role updated!' });
                await fetchUsers();
            } else {
                const { error } = await supabase.from('approvals').insert({
                    type: 'update', table_name: 'profiles', record_id: userId,
                    data: { role: newRole }, requested_by: profile?.id,
                    summary: `Change role of ${targetEmail} to ${newRole}`, status: 'pending'
                });
                if (error) throw error;
                toast({ title: 'Role change submitted for admin approval' });
            }
        } catch (error: any) {
            toast({ title: 'Error updating user role', description: error.message, variant: 'destructive' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold">Users</h1>
                    <p className="text-muted-foreground">Manage all users</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setIsAddDialogOpen(true)} className="gradient-hero">
                        <Plus className="w-4 h-4 mr-2" />
                        Add User
                    </Button>

                    <Button onClick={() => setIsBulkAddDialogOpen(true)} variant="outline">
                        <Upload className="w-4 h-4 mr-2" />
                        Bulk Add
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Users List</CardTitle>
                    <CardDescription>All platform users</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search users..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Filter by role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="admin">Admins</SelectItem>
                                    <SelectItem value="moderator">Moderators</SelectItem>
                                    <SelectItem value="teacher">Teachers</SelectItem>
                                    <SelectItem value="student">Students</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={schoolFilter} onValueChange={setSchoolFilter}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Filter by school" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Schools</SelectItem>
                                    {schools.map(school => (
                                        <SelectItem key={school.id} value={school.id}>{school.name}</SelectItem>
                                    ))}
                                    <SelectItem value="none">No School Assigned</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {loading ? (
                            <div className="text-center py-4">
                                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">No users found</p>
                        ) : (
                            <div className="overflow-x-auto max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="p-3 text-left w-10">
                                                <Checkbox
                                                    checked={selectedUserIds.length > 0 && selectedUserIds.length === filteredUsers.length}
                                                    onCheckedChange={handleToggleSelectAll}
                                                />
                                            </th>
                                            <th className="p-3 text-left font-medium">Name</th>
                                            <th className="p-3 text-left font-medium">Email</th>
                                            <th className="p-3 text-left font-medium">Role</th>
                                            <th className="p-3 text-left font-medium">School</th>
                                            <th className="p-3 text-left font-medium">Status</th>
                                            <th className="p-3 text-left font-medium">Password</th>
                                            <th className="p-3 text-left font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((user) => (
                                            <tr key={user.id} className={`border-b border-border/50 last:border-none hover:bg-muted/50 transition-colors ${selectedUserIds.includes(user.id) ? 'bg-primary/5' : ''}`}>
                                                <td className="p-3">
                                                    <Checkbox
                                                        checked={selectedUserIds.includes(user.id)}
                                                        onCheckedChange={() => handleToggleSelectUser(user.id)}
                                                        disabled={user.id === profile?.id}
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                                                            {(user?.display_name || user?.email || '??').split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <span>{user.display_name || 'No name'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-muted-foreground">{user.email}</td>
                                                <td className="p-3">
                                                    <Select
                                                        value={user.role}
                                                        onValueChange={(selectedValue) => handleRoleChange(user.id, user.email, selectedValue)}
                                                        disabled={user.id === profile?.id}
                                                    >
                                                        <SelectTrigger className="w-[120px] h-8">
                                                            <SelectValue placeholder={user.role} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="student">Student</SelectItem>
                                                            <SelectItem value="teacher">Teacher</SelectItem>
                                                            <SelectItem value="moderator">Moderator</SelectItem>
                                                            {profile?.role === 'admin' && <SelectItem value="admin">Admin</SelectItem>}
                                                        </SelectContent>
                                                    </Select>
                                                </td>
                                                <td className="p-3 text-muted-foreground">
                                                    {user.school_id ? (schools.find(s => s.id === user.school_id)?.name || 'Unknown School') : <span className="italic opacity-50">Not Assigned</span>}
                                                </td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs capitalize ${user.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                                                        {user.is_active ? 'active' : 'inactive'}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-muted-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-sm">
                                                            {visiblePasswords[user.id] ? (user.password_text || 'Encrypted') : '••••••••'}
                                                        </span>
                                                        {user.password_text && (
                                                            <button onClick={() => togglePasswordVisibility(user.id)} className="text-muted-foreground hover:text-foreground">
                                                                {visiblePasswords[user.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => {
                                                                setNewUser(user);
                                                                setIsEditing(true);
                                                                setIsAddDialogOpen(true);
                                                            }}
                                                        >
                                                            <Edit className="w-3 h-3" />
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="destructive" size="sm" className="h-8 w-8 p-0" disabled={user.id === profile?.id}>
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
                                                                        onClick={() => handleDeleteUser(user.id, user.email)}
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
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Bulk Actions Toolbar */}
            {selectedUserIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-popover border border-border shadow-xl rounded-full px-6 py-3 flex items-center gap-6 z-50 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">
                            {selectedUserIds.length}
                        </span>
                        <span className="text-sm text-muted-foreground">Users selected</span>
                    </div>
                    <div className="h-4 w-px bg-border" />
                    <div className="flex items-center gap-2">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="h-8">
                                    <Trash2 className="w-3 h-3 mr-2" />
                                    Delete Selected
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Bulk Delete Users</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete {selectedUserIds.length} users? This action is permanent and cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleBulkDelete}>
                                        Delete Forever
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <Button variant="outline" size="sm" className="h-8" onClick={() => setSelectedUserIds([])}>
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            {/* Add User Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit User' : 'Add New User'}</DialogTitle>
                        <DialogDescription>{isEditing ? 'Update account information' : 'Create a new user account'}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Email *</Label>
                            <Input
                                type="email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                placeholder="user@school.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Display Name (optional)</Label>
                            <Input
                                value={newUser.display_name}
                                onChange={(e) => setNewUser({ ...newUser, display_name: e.target.value })}
                                placeholder="John Doe"
                            />
                            <p className="text-xs text-muted-foreground">If left empty, will use the email prefix</p>
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
                                    {profile?.role === 'admin' && <SelectItem value="admin">Admin</SelectItem>}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>School Assignment (optional)</Label>
                            <Select
                                value={newUser.school_id || "none"}
                                onValueChange={(value) => setNewUser({ ...newUser, school_id: value === "none" ? "" : value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Assign to a school" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No School - Independent User</SelectItem>
                                    {schools.map(school => (
                                        <SelectItem key={school.id} value={school.id}>{school.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Password {isEditing && "(Enter to change)"}</Label>
                            <div className="relative">
                                <Input
                                    type={showAddUserPassword ? "text" : "password"}
                                    value={isEditing ? (newUser.password_text || '') : newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, [isEditing ? 'password_text' : 'password']: e.target.value })}
                                    placeholder={isEditing ? "Enter new password to change" : "Leave empty for auto-generation"}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowAddUserPassword(!showAddUserPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showAddUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {!isEditing ? (
                                <p className="text-xs text-muted-foreground">If left empty, a secure password will be auto-generated</p>
                            ) : (
                                <p className="text-xs text-muted-foreground">Passwords are securely encrypted. Only passwords created recently via this dashboard are visible.</p>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <Checkbox
                                id="is-active"
                                checked={!!newUser.is_active}
                                onCheckedChange={(checked) => setNewUser({ ...newUser, is_active: !!checked })}
                            />
                            <Label htmlFor="is-active">Active User</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddUser} disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                'Add User'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Add Users Dialog */}
            <Dialog open={isBulkAddDialogOpen} onOpenChange={setIsBulkAddDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Bulk Import Management</DialogTitle>
                        <DialogDescription>Quickly onboard groups of students or teachers</DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="students" className="mt-4">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="students" className="flex items-center gap-2">
                                <GraduationCap className="w-4 h-4" /> Students
                            </TabsTrigger>
                            <TabsTrigger value="teachers" className="flex items-center gap-2">
                                <Users className="w-4 h-4" /> Teachers
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="students" className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Student Emails (One per line)</Label>
                                <Textarea
                                    value={bulkStudents}
                                    onChange={(e) => setBulkStudents(e.target.value)}
                                    placeholder="student1@school.com,Password123\nstudent2@school.com"
                                    rows={8}
                                    className="font-mono"
                                />
                                <p className="text-[10px] text-muted-foreground mt-1">
                                    Support format: <b>email</b> OR <b>email,password</b> (comma separated).
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Assign to School</Label>
                                    <Select value={bulkStudentSchoolId} onValueChange={setBulkStudentSchoolId}>
                                        <SelectTrigger><SelectValue placeholder="Select school" /></SelectTrigger>
                                        <SelectContent>
                                            {schools.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Common Password</Label>
                                    <div className="relative">
                                        <Input
                                            type={showBulkStudentPassword ? "text" : "password"}
                                            value={bulkStudentPassword}
                                            onChange={(e) => setBulkStudentPassword(e.target.value)}
                                            placeholder="Leave empty for individual random"
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowBulkStudentPassword(!showBulkStudentPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showBulkStudentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <Button onClick={() => handleBulkAdd('student')} className="w-full gradient-hero" disabled={loading}>
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                Import All Students
                            </Button>
                        </TabsContent>

                        <TabsContent value="teachers" className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Teacher Emails (One per line)</Label>
                                <Textarea
                                    value={bulkTeachers}
                                    onChange={(e) => setBulkTeachers(e.target.value)}
                                    placeholder="teacher1@school.com,SecretPass\nteacher2@school.com"
                                    rows={8}
                                    className="font-mono"
                                />
                                <p className="text-[10px] text-muted-foreground mt-1">
                                    Support format: <b>email</b> OR <b>email,password</b> (comma separated).
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Assign to School</Label>
                                    <Select value={bulkTeacherSchoolId} onValueChange={setBulkTeacherSchoolId}>
                                        <SelectTrigger><SelectValue placeholder="Select school" /></SelectTrigger>
                                        <SelectContent>
                                            {schools.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Common Password</Label>
                                    <div className="relative">
                                        <Input
                                            type={showBulkTeacherPassword ? "text" : "password"}
                                            value={bulkTeacherPassword}
                                            onChange={(e) => setBulkTeacherPassword(e.target.value)}
                                            placeholder="Leave empty for individual random"
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowBulkTeacherPassword(!showBulkTeacherPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showBulkTeacherPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <Button onClick={() => handleBulkAdd('teacher')} className="w-full gradient-hero" disabled={loading}>
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                Import All Teachers
                            </Button>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>

            {/* Bulk Results Dialog */}
            <Dialog open={isBulkResultOpen} onOpenChange={setIsBulkResultOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Import Results & Passwords</DialogTitle>
                        <DialogDescription>Please copy these passwords now. For security, they won't be shown again.</DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="flex-1 mt-4 border rounded-md">
                        <table className="w-full text-sm">
                            <thead className="bg-muted sticky top-0">
                                <tr>
                                    <th className="p-2 text-left">Email</th>
                                    <th className="p-2 text-left">Password</th>
                                    <th className="p-2 text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {bulkResults.map((res, i) => (
                                    <tr key={i} className="hover:bg-muted/50">
                                        <td className="p-2 font-mono text-xs">{res.email}</td>
                                        <td className="p-2 font-mono text-xs font-bold text-primary">{res.password}</td>
                                        <td className={`p-2 text-[10px] ${res.status.includes('Error') ? 'text-destructive' : 'text-green-500'}`}>{res.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </ScrollArea>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => {
                            const text = bulkResults.map(r => `${r.email}\t${r.password}`).join('\n');
                            navigator.clipboard.writeText(text);
                            toast({ title: 'Copied to clipboard' });
                        }}>
                            Copy All to Clipboard
                        </Button>
                        <Button onClick={() => setIsBulkResultOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


        </div>
    );
}

// Approvals Tab Component
function ApprovalsTab() {
    const [approvals, setApprovals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
    const { toast } = useToast();
    const { profile } = useAuth();

    const fetchApprovals = async () => {
        setLoading(true);
        try {
            // Keep query simple to avoid relationship alias issues
            let q = supabase
                .from('approvals')
                .select('*')
                .order('created_at', { ascending: false });
            if (filter !== 'all') q = q.eq('status', filter);
            const { data, error } = await q;
            if (error) throw error;
            setApprovals(data || []);
        } catch (error: any) {
            console.error('Error fetching approvals:', error);
        }
        setLoading(false);
    };

    useEffect(() => { fetchApprovals(); }, [filter]);

    const handleApprove = async (approval: any) => {
        if (profile?.role !== 'admin') {
            toast({ title: 'Access Denied', description: 'Only admins can approve requests.', variant: 'destructive' });
            return;
        }

        // Prevent self-approval - move to start of function
        if (approval.requested_by === profile?.id) {
            toast({ title: 'Self-Approval Forbidden', description: 'You cannot approve your own requests. Please wait for another admin.', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            // Clean up potentially malformed data from older unapproved requests
            let cleanData = { ...approval.data };
            if (cleanData.created_at === '') delete cleanData.created_at;
            if (cleanData.updated_at === '') delete cleanData.updated_at;

            // question_sets specific cleanup
            if (approval.table_name === 'question_sets') {
                delete cleanData.questions;
                delete cleanData.difficulty;
                delete cleanData.questionCount;
            } else if (cleanData.questions !== undefined) {
                // some other tables might organically have 'questions' but unlikely needed for insert except as relational
                delete cleanData.questions;
            }

            // Critical fix: Nullify empty UUID strings to prevent Postgres 400 errors
            if (cleanData.question_set_id === '') cleanData.question_set_id = null;
            if (cleanData.competition_id === '') cleanData.competition_id = null;
            if (cleanData.school_id === '') cleanData.school_id = null;
            if (cleanData.user_id === '') cleanData.user_id = null;
            if (cleanData.record_id === '') cleanData.record_id = null;

            // Execute the action on the target table
            if (approval.type === 'create') {
                const { error } = await supabase.from(approval.table_name).insert(cleanData);
                if (error) throw error;
            } else if (approval.type === 'update' && approval.record_id) {
                const { error } = await supabase.from(approval.table_name).update(cleanData).eq('id', approval.record_id);
                if (error) throw error;
            } else if (approval.type === 'delete') {
                if (approval.record_id) {
                    const { error } = await supabase.from(approval.table_name).delete().eq('id', approval.record_id);
                    if (error) throw error;
                } else if (cleanData.ids && Array.isArray(cleanData.ids)) {
                    const { error } = await supabase.from(approval.table_name).delete().in('id', cleanData.ids);
                    if (error) throw error;
                }
            }

            // Mark approval as approved
            await supabase.from('approvals').update({
                status: 'approved',
                reviewed_by: profile?.id,
                reviewed_at: new Date().toISOString()
            }).eq('id', approval.id);

            await fetchApprovals();
            toast({ title: 'Request approved!', description: 'The action has been executed.' });
        } catch (error: any) {
            toast({ title: 'Error approving request', description: error.message, variant: 'destructive' });
        }
        setLoading(false);
    };

    const handleReject = async (id: string) => {
        if (profile?.role !== 'admin') {
            toast({ title: 'Access Denied', description: 'Only admins can review requests.', variant: 'destructive' });
            return;
        }
        setLoading(true);
        try {
            await supabase.from('approvals').update({
                status: 'rejected',
                reviewed_by: profile?.id,
                reviewed_at: new Date().toISOString()
            }).eq('id', id);
            await fetchApprovals();
            toast({ title: 'Request rejected.' });
        } catch (error: any) {
            toast({ title: 'Error rejecting request', description: error.message, variant: 'destructive' });
        }
        setLoading(false);
    };

    const statusBadge = (status: string) => {
        const map: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        };
        return map[status] || 'bg-muted text-muted-foreground';
    };

    const typeBadge = (type: string) => {
        const map: Record<string, string> = {
            create: 'bg-blue-100 text-blue-800',
            update: 'bg-purple-100 text-purple-800',
            delete: 'bg-red-100 text-red-800'
        };
        return map[type] || 'bg-muted text-muted-foreground';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold">Pending Approvals</h1>
                    <p className="text-muted-foreground">Review and approve moderator actions before they take effect</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchApprovals}>
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                    {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
                        <Button key={f} size="sm"
                            variant={filter === f ? 'default' : 'outline'}
                            onClick={() => setFilter(f)}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </Button>
                    ))}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Approval Queue</CardTitle>
                    <CardDescription>
                        {filter === 'pending' ? 'Actions submitted by moderators awaiting your review' : `Showing ${filter} requests`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin" /></div>
                    ) : approvals.length === 0 ? (
                        <div className="text-center py-12 space-y-3">
                            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <p className="text-lg font-medium">All clear!</p>
                            <p className="text-muted-foreground text-sm">No {filter === 'all' ? '' : filter} approval requests at this time.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {approvals.map((approval) => {
                                try {
                                    return (
                                        <div key={approval.id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center flex-wrap gap-2 mb-1">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeBadge(approval.type)}`}>{approval.type?.toUpperCase()}</span>
                                                        <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">{approval.table_name}</span>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(approval.status)}`}>{approval.status}</span>
                                                    </div>
                                                    <p className="font-medium text-sm mt-1">{approval.summary || 'No description provided'}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Requested by:{' '}
                                                        <span className="font-medium">
                                                            {approval.requester?.display_name
                                                                || approval.requester?.email
                                                                || approval.requested_by
                                                                || 'Unknown'}
                                                        </span>
                                                        {approval.created_at && (
                                                            <>
                                                                {' • '}
                                                                {new Date(approval.created_at).toLocaleString()}
                                                            </>
                                                        )}
                                                    </p>
                                                    {approval.status !== 'pending' && (approval.reviewer || approval.reviewed_by) && (
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            {approval.status === 'approved' ? 'Approved' : 'Rejected'} by:{' '}
                                                            <span className="font-medium">
                                                                {approval.reviewer?.display_name
                                                                    || approval.reviewer?.email
                                                                    || approval.reviewed_by
                                                                    || 'Unknown'}
                                                            </span>
                                                        </p>
                                                    )}
                                                    {approval.data && typeof approval.data === 'object' && Object.keys(approval.data || {}).length > 0 && (
                                                        <details className="mt-2">
                                                            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">View data payload</summary>
                                                            <pre className="mt-1 text-xs bg-muted/50 p-2 rounded overflow-auto max-h-32">{JSON.stringify(approval.data, null, 2)}</pre>
                                                        </details>
                                                    )}
                                                </div>
                                                {approval.status === 'pending' && profile?.role === 'admin' && (
                                                    <div className="flex gap-2 shrink-0">
                                                        <Button size="sm" variant="outline"
                                                            className="border-destructive text-destructive hover:bg-destructive hover:text-white"
                                                            onClick={() => handleReject(approval.id)} disabled={loading}>
                                                            <X className="w-3 h-3 mr-1" />Reject
                                                        </Button>
                                                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white"
                                                            onClick={() => handleApprove(approval)} disabled={loading}>
                                                            <Check className="w-3 h-3 mr-1" />Approve
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                } catch (e) {
                                    console.error('Error rendering approval item:', e, approval);
                                    return (
                                        <div key={approval.id || Math.random()} className="p-4 rounded-lg border border-destructive/50 bg-destructive/5">
                                            <p className="text-xs text-destructive">
                                                Failed to render this approval item. Check console for details.
                                            </p>
                                        </div>
                                    );
                                }
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}


// Grading Tab Component
function GradingTab() {
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [gradeInput, setGradeInput] = useState({ score: 0, feedback: '' });
    const { toast } = useToast();

    const fetchQueue = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('grading_queue')
                .select('*')
                .order('submitted_at', { ascending: false });
            if (error) throw error;
            setQueue(data || []);
        } catch (error: any) {
            console.error('Error fetching grading queue:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchQueue();
    }, []);

    const handleGrade = async () => {
        if (!selectedItem) return;

        // Validate Score
        const maxPoints = selectedItem.max_points || 0;
        if (gradeInput.score < 0 || gradeInput.score > maxPoints) {
            toast({ title: `Score must be between 0 and ${maxPoints}`, variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            // 1. Update status in Queue
            const { error: queueErr } = await supabase
                .from('grading_queue')
                .update({
                    status: 'graded',
                    assigned_score: gradeInput.score,
                    feedback: gradeInput.feedback,
                    graded_at: new Date().toISOString()
                })
                .eq('id', selectedItem.id);
            if (queueErr) throw queueErr;

            // 2. Update Result score
            const { data: currentResult, error: resFetchErr } = await supabase
                .from('results')
                .select('score, answers')
                .eq('id', selectedItem.result_id)
                .single();
            if (resFetchErr) throw resFetchErr;

            const oldScore = (currentResult as any).score || 0;
            const newScore = oldScore + gradeInput.score;
            const updatedAnswers = { ...(currentResult as any).answers || {} };
            updatedAnswers[`${selectedItem.question_id}_graded`] = true;
            updatedAnswers[`${selectedItem.question_id}_feedback`] = gradeInput.feedback;

            const { error: resUpErr } = await supabase
                .from('results')
                .update({
                    score: newScore,
                    answers: updatedAnswers
                })
                .eq('id', selectedItem.result_id);
            if (resUpErr) throw resUpErr;

            // 3. Update User Profile Total Score
            if (selectedItem.student_id) {
                const { data: currentProf, error: profFetchErr } = await supabase
                    .from('profiles')
                    .select('score')
                    .eq('id', selectedItem.student_id)
                    .single();
                if (!profFetchErr && currentProf) {
                    const { error: profUpErr } = await supabase
                        .from('profiles')
                        .update({
                            score: (currentProf.score || 0) + gradeInput.score,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', selectedItem.student_id);
                    if (profUpErr) console.error('Error updating user score:', profUpErr);
                }
            }

            await fetchQueue();
            setSelectedItem(null);
            toast({ title: 'Grade submitted successfully' });

        } catch (error: any) {
            toast({ title: 'Error submitting grade', description: error.message, variant: 'destructive' });
        }
        setLoading(false);
    };

    const pendingItems = queue.filter(item => item.status === 'pending');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-display font-bold">Grading Queue</h1>
                <p className="text-muted-foreground">Review and grade student writing answers</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Pending Reviews ({pendingItems.length})</CardTitle>
                    <CardDescription>Items waiting for manual grading</CardDescription>
                </CardHeader>
                <CardContent>
                    {pendingItems.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No items pending grading.</p>
                    ) : (
                        <div className="space-y-4">
                            {pendingItems.map(item => (
                                <div key={item.id} className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition opacity">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-full mb-2 inline-block">
                                                {item.question_set_name || 'Question Set'}
                                            </span>
                                            <h3 className="font-semibold">{item.question_text}</h3>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs text-muted-foreground">Max Points: {item.max_points}</span>
                                            <p className="text-xs text-muted-foreground">{new Date(item.submitted_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="bg-muted p-3 rounded-md mb-3">
                                        <p className="text-sm font-medium mb-1 text-muted-foreground">Student Answer:</p>
                                        <p className="text-sm">{item.answer}</p>
                                    </div>

                                    {item.model_answer && (
                                        <div className="bg-muted/50 p-2 rounded-md mb-3 border-l-2 border-primary/50">
                                            <p className="text-xs font-medium text-muted-foreground">Model Answer:</p>
                                            <p className="text-xs italic">{item.model_answer}</p>
                                        </div>
                                    )}

                                    <div className="flex justify-end">
                                        <Button size="sm" onClick={() => {
                                            setSelectedItem(item);
                                            setGradeInput({ score: 0, feedback: '' });
                                        }}>
                                            <GraduationCap className="w-4 h-4 mr-2" />
                                            Grade
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Grade Answer</DialogTitle>
                        <DialogDescription>Assign points and provide feedback</DialogDescription>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Score (Max: {selectedItem.max_points})</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max={selectedItem.max_points}
                                    value={gradeInput.score}
                                    onChange={(e) => setGradeInput({ ...gradeInput, score: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Feedback (Optional)</Label>
                                <Textarea
                                    placeholder="Great job, but..."
                                    value={gradeInput.feedback}
                                    onChange={(e) => setGradeInput({ ...gradeInput, feedback: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedItem(null)}>Cancel</Button>
                        <Button onClick={handleGrade} disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Grade'}
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
    const { profile, currentView } = useAuth();
    const isAdmin = (currentView || profile?.role) === 'admin';

    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [newMessage, setNewMessage] = useState({
        recipientRole: 'specific', // Default to 'specific' as requested
        recipientId: '', // Optional, for specific user
        subject: '',
        content: ''
    });

    const filteredMessages = messages.filter(message =>
        (message.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (message.sender_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (message.body || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*, sender:sender_id(display_name, email)')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setMessages((data || []) as any);
        } catch (error: any) {
            console.error('Error fetching messages:', error);
        }
        setLoading(false);
    };

    const handleMarkRead = async (id: string) => {
        try {
            const { error } = await supabase.from('messages').update({ is_read: true }).eq('id', id);
            if (error) throw error;
            setMessages((prev: any) => prev.map((m: any) => m.id === id ? { ...m, is_read: true } : m));
            if (selectedMessage?.id === id) {
                setSelectedMessage((prev: any) => prev ? { ...prev, is_read: true } : null);
            }
        } catch (e) {
            console.error('Error marking as read:', e);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.subject || !newMessage.content) {
            toast({ title: 'Subject and Content are required', variant: 'destructive' });
            return;
        }
        setLoading(true);
        try {
            let finalRecipientId = null;
            if (newMessage.recipientId && newMessage.recipientId.trim()) {
                const { data: userData } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('email', newMessage.recipientId.trim().toLowerCase())
                    .single();

                if (userData) {
                    finalRecipientId = userData.id;
                } else if (newMessage.recipientId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
                    finalRecipientId = newMessage.recipientId.trim();
                } else {
                    toast({ title: 'Recipient not found', description: `No user with email ${newMessage.recipientId} exists.`, variant: 'destructive' });
                    setLoading(false);
                    return;
                }
            }

            if (isAdmin) {
                const { error } = await supabase.from('messages').insert({
                    subject: newMessage.subject,
                    body: newMessage.content,
                    sender_id: profile?.id,
                    // These columns might be missing in some DB versions, handled if they exist
                    sender_name: profile?.display_name || profile?.email || 'User',
                    sender_role: profile?.role || 'admin',
                    recipient_role: newMessage.recipientRole,
                    recipient_id: finalRecipientId,
                });
                if (error) throw error;
                await fetchMessages();
                toast({ title: 'Message sent!' });
            } else {
                const { error } = await supabase.from('approvals').insert({
                    type: 'create',
                    table_name: 'messages',
                    record_id: null,
                    data: {
                        subject: newMessage.subject,
                        body: newMessage.content,
                        sender_id: profile?.id,
                        sender_name: profile?.display_name || profile?.email || 'User',
                        sender_role: profile?.role || 'moderator',
                        recipient_role: newMessage.recipientRole,
                        recipient_id: finalRecipientId,
                        is_read: false
                    },
                    requested_by: profile?.id,
                    summary: `Send message: ${newMessage.subject}`,
                    status: 'pending'
                });
                if (error) throw error;
                toast({ title: 'Submitted for admin approval', description: 'Message will be sent after approval.' });
            }
            setIsComposeOpen(false);
            setNewMessage({ recipientRole: 'student', recipientId: '', subject: '', content: '' });
        } catch (error: any) {
            toast({ title: 'Error sending message', description: error.message, variant: 'destructive' });
        }
        setLoading(false);
    };

    const handleReply = async () => {
        if (!selectedMessage || !replyContent.trim()) return;
        setSendingReply(true);
        try {
            const subject = `Re: ${(selectedMessage as any).subject}`;
            const data = {
                subject,
                body: replyContent,
                sender_id: profile?.id,
                sender_name: profile?.display_name || profile?.email || 'User',
                sender_role: profile?.role || 'admin',
                recipient_id: (selectedMessage as any).sender_id,
                recipient_role: 'specific',
            };

            if (isAdmin) {
                const { error } = await supabase.from('messages').insert(data);
                if (error) throw error;
                await fetchMessages();
                toast({ title: 'Reply sent!' });
            } else {
                const { error } = await supabase.from('approvals').insert({
                    type: 'create',
                    table_name: 'messages',
                    record_id: null,
                    data: { ...data, is_read: false },
                    requested_by: profile?.id,
                    summary: `Reply message: ${subject}`,
                    status: 'pending'
                });
                if (error) throw error;
                toast({ title: 'Submitted for admin approval', description: 'Reply will be sent after approval.' });
            }

            setReplyContent('');
        } catch (error: any) {
            toast({ title: 'Error sending reply', description: error.message, variant: 'destructive' });
        }
        setSendingReply(false);
    };

    const handleDeleteMessage = async (id: string) => {
        setLoading(true);
        try {
            if (isAdmin) {
                const { error } = await supabase.from('messages').delete().eq('id', id);
                if (error) throw error;
                toast({ title: 'Message deleted successfully!' });
                await fetchMessages();
                if (selectedMessage?.id === id) setSelectedMessage(null);
            } else {
                const { error } = await supabase.from('approvals').insert({
                    type: 'delete',
                    table_name: 'messages',
                    record_id: id,
                    data: {},
                    requested_by: profile?.id,
                    summary: 'Delete message',
                    status: 'pending'
                });
                if (error) throw error;
                toast({ title: 'Deletion submitted for admin approval' });
            }
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold">Messages</h1>
                    <p className="text-muted-foreground">User communications</p>
                </div>
                <Button onClick={() => setIsComposeOpen(true)} className="gradient-hero">
                    <Plus className="w-4 h-4 mr-2" />
                    Compose
                </Button>
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
                                                className={`w-full text-left p-3 rounded-lg transition-colors ${selectedMessage?.id === message.id
                                                    ? 'bg-primary/10 border border-primary'
                                                    : 'hover:bg-muted/50'
                                                    } ${!message.is_read && 'border-l-2 border-primary'}`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                        {(message.sender_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className="text-sm font-medium truncate">{message.sender_name || 'Unknown'}</p>
                                                            <p className="text-xs text-muted-foreground whitespace-nowrap">
                                                                {message.created_at ? new Date(message.created_at).toLocaleDateString() : 'No date'}
                                                            </p>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground truncate">{message.subject}</p>
                                                        <p className="text-xs text-muted-foreground/60 truncate mt-1">{message.body}</p>
                                                        {!message.is_read && (
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
                                    From: {selectedMessage.sender_name || 'Unknown'} • {new Date(selectedMessage.created_at).toLocaleString()}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="p-4 bg-muted/50 rounded-lg">
                                        <p className="text-sm">{selectedMessage.body}</p>
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
                                            onClick={handleReply}
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

            {/* Compose Message Dialog */}
            <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Compose Message</DialogTitle>
                        <DialogDescription>Send a message to a student, teacher, or moderator.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Recipient Type</Label>
                                <Select
                                    value={newMessage.recipientRole}
                                    onValueChange={(val: any) => setNewMessage({ ...newMessage, recipientRole: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select recipient type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="specific">Specific User (Email required)</SelectItem>
                                        <SelectItem value="student">Broadcast to all Students</SelectItem>
                                        <SelectItem value="teacher">Broadcast to all Teachers</SelectItem>
                                        <SelectItem value="moderator">Broadcast to all Moderators</SelectItem>
                                        <SelectItem value="all">Broadcast to All Users</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className={newMessage.recipientRole === 'specific' ? 'text-primary' : 'text-muted-foreground'}>
                                    {newMessage.recipientRole === 'specific' ? 'Recipient Email (Required) *' : 'Specific Email (Optional)'}
                                </Label>
                                <Input
                                    placeholder="user@example.com"
                                    value={newMessage.recipientId}
                                    onChange={(e) => setNewMessage({ ...newMessage, recipientId: e.target.value })}
                                    required={newMessage.recipientRole === 'specific'}
                                    className={newMessage.recipientRole === 'specific' ? 'border-primary ring-1 ring-primary/20' : ''}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Subject</Label>
                            <Input
                                placeholder="Message subject"
                                value={newMessage.subject}
                                onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Content</Label>
                            <Textarea
                                placeholder="Type your message here..."
                                rows={10}
                                value={newMessage.content}
                                onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsComposeOpen(false)}>Cancel</Button>
                        <Button onClick={handleSendMessage} disabled={loading || !newMessage.subject || !newMessage.content} className="gradient-hero">
                            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MessageSquare className="w-4 h-4 mr-2" />}
                            Send Message
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Admin Leaderboard Tab Component
function AdminLeaderboardTab() {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [schools, setSchools] = useState([]);
    const [competitions, setCompetitions] = useState([]);
    const [selectedCompId, setSelectedCompId] = useState('all');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [
                { data: comps },
                { data: students },
                { data: schs }
            ] = await Promise.all([
                supabase.from('competitions').select('*'),
                supabase.from('profiles').select('*').eq('role', 'student'),
                supabase.from('schools').select('*')
            ]);

            setCompetitions(comps || []);
            setUsers(students || []);
            setSchools(schs || []);

            let filteredData = [...(students || [])];

            if (selectedCompId !== 'all') {
                // Filter leaderboard by competition via question_sets.competition_ids → results.question_set_id
                const { data: sets, error: setsErr } = await supabase
                    .from('question_sets')
                    .select('id')
                    .contains('competition_ids', [selectedCompId]);
                if (setsErr) throw setsErr;

                const setIds = (sets || []).map((s: any) => s.id);
                if (setIds.length === 0) {
                    setLeaderboardData([]);
                    return;
                }

                const { data: results, error: resultsError } = await supabase
                    .from('results')
                    .select('student_id, score, question_set_id, practice_set_id')
                    .in('question_set_id', setIds)
                    .is('practice_set_id', null);
                if (resultsError) throw resultsError;

                const userScores: Record<string, number> = {};
                (results || []).forEach((r: any) => {
                    if (!userScores[r.student_id] || (r.score || 0) > userScores[r.student_id]) {
                        userScores[r.student_id] = r.score || 0;
                    }
                });

                filteredData = filteredData
                    .filter((u: any) => userScores[u.id] !== undefined)
                    .map((u: any) => ({ ...u, score: userScores[u.id] }));
            }

            const sortedUsers = filteredData.sort((a: any, b: any) => (b.score || 0) - (a.score || 0));
            setLeaderboardData(sortedUsers as any);
        } catch (error: any) {
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
                    <h1 className="text-2xl font-display font-bold">Global Leaderboard</h1>
                    <p className="text-muted-foreground">Master view of platform-wide performance</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium whitespace-nowrap text-muted-foreground">Filter by Competition:</span>
                    <div className="w-[250px]">
                        <Select value={selectedCompId} onValueChange={setSelectedCompId}>
                            <SelectTrigger>
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
                    <div className="w-[200px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Student Rankings</CardTitle>
                            <CardDescription>Top participants across the platform</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                {loading ? (
                                    <div className="text-center py-4"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>
                                ) : leaderboardData.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-4">No data available.</p>
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
                                            {leaderboardData
                                                .filter((s: any) =>
                                                    (s.display_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                    (s.email || '').toLowerCase().includes(searchTerm.toLowerCase())
                                                )
                                                .map((student, index) => (
                                                    <tr key={student.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                                                        <td className="p-3 font-semibold text-lg">{index + 1}</td>
                                                        <td className="p-3 text-sm">{student.email}</td>
                                                        <td className="p-3 text-sm italic">{student.display_name || 'No username'}</td>
                                                        <td className="p-3 text-right font-mono font-bold text-primary">{student.score?.toLocaleString() || '0'}</td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>School Leaderboard</CardTitle>
                            <CardDescription>Aggregate institution performance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AdminSchoolLeaderboard selectedCompId={selectedCompId} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function AdminSchoolLeaderboard({ selectedCompId }: { selectedCompId: string }) {
    const [schoolData, setSchoolData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSchoolsAndResults = async () => {
            setLoading(true);
            try {
                const [{ data: schools }, { data: users }] = await Promise.all([
                    supabase.from('schools').select('*'),
                    supabase.from('profiles').select('*').eq('role', 'student')
                ]);

                if (!schools || !users) {
                    setSchoolData([]);
                    setLoading(false);
                    return;
                }

                let results: any[] = [];
                if (selectedCompId !== 'all') {
                    const { data: sets, error: setsErr } = await supabase
                        .from('question_sets')
                        .select('id')
                        .contains('competition_ids', [selectedCompId]);
                    if (setsErr) throw setsErr;

                    const setIds = (sets || []).map((s: any) => s.id);
                    if (setIds.length > 0) {
                        const { data } = await supabase
                            .from('results')
                            .select('student_id, score, question_set_id, practice_set_id')
                            .in('question_set_id', setIds)
                            .is('practice_set_id', null);
                        results = data || [];
                    }
                }

                const aggregatedSchools = schools.map((school: any) => {
                    const schoolStudents = users.filter((u: any) => u.school_id === school.id);
                    let totalPoints = 0;

                    if (selectedCompId === 'all') {
                        totalPoints = schoolStudents.reduce((sum, u: any) => sum + (u.score || 0), 0);
                    } else {
                        schoolStudents.forEach((student: any) => {
                            const studentResults = results.filter(r => r.student_id === student.id);
                            if (studentResults.length > 0) {
                                totalPoints += Math.max(...studentResults.map(r => r.score || 0));
                            }
                        });
                    }

                    return { ...school, totalPoints };
                });

                const sortedSchools = aggregatedSchools.sort((a, b) => b.totalPoints - a.totalPoints);
                setSchoolData(sortedSchools as any);
            } catch (e: any) {
                console.error('Error fetching school leaderboard:', e);
            }
            setLoading(false);
        };
        fetchSchoolsAndResults();
    }, [selectedCompId]);

    return (
        <div className="space-y-4">
            {loading ? (
                <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>
            ) : schoolData.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No data found.</p>
            ) : (
                <div className="space-y-4">
                    {schoolData.map((school, index) => (
                        <div key={school.id} className="p-3 rounded-lg border border-border/50 bg-muted/20 flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-sm">{school.name}</p>
                                <p className="text-xs text-muted-foreground">{school.country || 'Global'}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-mono text-primary font-bold">{school.totalPoints.toLocaleString()}</p>
                                <p className="text-[10px] uppercase text-muted-foreground">Total Pts</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
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
                            <p className="text-sm text-muted-foreground">Users Managed</p>
                            <p className="text-2xl font-bold">0</p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Competitions Organized</p>
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

// Practice Manager Tab Component
function PracticeManagerTab() {
    const [practiceSets, setPracticeSets] = useState([]);
    const [globalQuestions, setGlobalQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
    const [isCreateQuestionDialogOpen, setIsCreateQuestionDialogOpen] = useState(false);
    const [isEditingQuestion, setIsEditingQuestion] = useState(false);
    const [selectedSet, setSelectedSet] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const { profile, currentView } = useAuth();
    const isAdmin = (currentView || profile?.role) === 'admin';

    const handleImageUpload = async (file: File) => {
        // Optimize image size to fix 'loading non-stop' issue
        const compressedFile = await compressImage(file);
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        // Timeout prevents indefinite hangs
        const { error: uploadError } = await withTimeout<{ data: any; error: any }>(
            supabase.storage.from('question-images').upload(filePath, compressedFile)
        );

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('question-images')
            .getPublicUrl(filePath);

        return publicUrl;
    };

    const [newSet, setNewSet] = useState({
        id: '',
        name: '',
        description: '',
        category: 'General',
        difficulty: 'medium',
        questions: [] as string[],
        created_at: '',
    });

    const [newQuestion, setNewQuestion] = useState<any>({
        id: '',
        text: '',
        type: 'mcq' as 'mcq' | 'text',
        options: ['', '', '', ''],
        correct_answer: '',
        category: 'General',
        difficulty: 'medium',
        points: 10,
        timer: 0,
        explanation: '',
        exact_match_required: false,
        image_url: '',
        is_required: true,
        created_at: '',
        updated_at: ''
    });

    const { toast } = useToast();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [{ data: sets }, { data: questions }] = await withTimeout<[{ data: any; error: any }, { data: any; error: any }]>(
                Promise.all([
                    supabase.from('practice_sets').select('*').order('created_at', { ascending: false }),
                    supabase.from('questions').select('*').order('created_at', { ascending: false })
                ])
            );
            setPracticeSets(sets || []);
            setGlobalQuestions(questions || []);
        } catch (error: any) {
            console.error('Error fetching practice data:', error);
            toast({ title: 'Fetch Failed', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateSet = async () => {
        if (!newSet.name) {
            toast({ title: 'Name is required', variant: 'destructive' });
            return;
        }
        setLoading(true);
        try {
            const { id, created_at, ...data } = newSet;

            if (isAdmin) {
                const { error } = await supabase.from('practice_sets').insert(data);
                if (error) throw error;
                await fetchData();
                toast({ title: 'Practice Set Created!' });
            } else {
                const { error } = await supabase.from('approvals').insert({
                    type: 'create',
                    table_name: 'practice_sets',
                    data: data,
                    requested_by: profile?.id,
                    summary: `Create Practice Set: ${newSet.name}`,
                    status: 'pending'
                });
                if (error) throw error;
                toast({ title: 'Submitted for admin approval' });
            }

            setIsAddDialogOpen(false);
            setNewSet({ id: '', name: '', description: '', category: 'General', difficulty: 'medium', questions: [], created_at: '' });
        } catch (error: any) {
            toast({ title: 'Error creating set', description: error.message, variant: 'destructive' });
        }
        setLoading(false);
    };

    const toggleQuestionInSet = (questionId: string) => {
        if (!selectedSet) return;
        const currentQuestions = [...(selectedSet.questions || [])];
        const index = currentQuestions.indexOf(questionId);

        if (index > -1) {
            currentQuestions.splice(index, 1);
        } else {
            currentQuestions.push(questionId);
        }

        const updatedSet = { ...selectedSet, questions: currentQuestions };
        setSelectedSet(updatedSet);
    };

    const handleSaveQuestions = async () => {
        if (!selectedSet) return;
        setLoading(true);
        try {
            if (isAdmin) {
                const { error } = await supabase
                    .from('practice_sets')
                    .update({ questions: selectedSet.questions })
                    .eq('id', selectedSet.id);
                if (error) throw error;
                await fetchData();
                setIsManageDialogOpen(false);
                toast({ title: 'Questions updated for set!' });
            } else {
                const { error } = await supabase.from('approvals').insert({
                    type: 'update',
                    table_name: 'practice_sets',
                    record_id: selectedSet.id,
                    data: { questions: selectedSet.questions },
                    requested_by: profile?.id,
                    summary: `Update Practice Set questions: ${selectedSet.name}`,
                    status: 'pending'
                });
                if (error) throw error;
                setIsManageDialogOpen(false);
                toast({ title: 'Submitted for admin approval' });
            }
        } catch (error: any) {
            toast({ title: 'Error saving assignments', description: error.message, variant: 'destructive' });
        }
        setLoading(false);
    };

    const addOption = () => {
        setNewQuestion({ ...newQuestion, options: [...newQuestion.options, ''] });
    };

    const removeOption = (index: number) => {
        if (newQuestion.options.length <= 2) return;
        const next = newQuestion.options.filter((_, i) => i !== index);
        setNewQuestion({ ...newQuestion, options: next });
    };

    const handleEditQuestionClick = (q: any) => {
        setNewQuestion({
            ...q,
            options: q.options || ['', '', '', '']
        });
        setIsEditingQuestion(true);
        setIsCreateQuestionDialogOpen(true);
    };

    const handleCreateAndAddQuestion = async (keepOpen: boolean = false) => {
        if (!newQuestion.text || !newQuestion.correct_answer) {
            toast({ title: 'Question text and correct answer are required', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            let finalImageUrl = newQuestion.image_url;

            if (imageFile) {
                setUploading(true);
                toast({ title: 'Uploading image...', description: 'Optimizing for speed' });
                try {
                    finalImageUrl = await handleImageUpload(imageFile);
                } catch (uploadErr: any) {
                    toast({ title: 'Image Upload Failed', description: uploadErr.message, variant: 'destructive' });
                    setLoading(false);
                    setUploading(false);
                    return;
                }
                setUploading(false);
            }

            toast({ title: 'Validating and saving...' });
            const { id: qId, created_at: ca, updated_at: ua, ...rest } = newQuestion;

            // Clean data: ensure question_set_id is handled if it exists in rest
            const qData = {
                ...rest,
                image_url: finalImageUrl,
                options: Array.isArray(rest.options) ? rest.options : []
            };

            // If question_set_id is present but empty, nullify it
            if ((qData as any).question_set_id === '') {
                (qData as any).question_set_id = null;
            }

            if (isAdmin) {
                if (isEditingQuestion) {
                    const { error } = await withTimeout<{ data: any; error: any }>(
                        (supabase.from('questions').update(qData).eq('id', qId) as any)
                    );
                    if (error) throw error;
                } else {
                    const { data, error } = await withTimeout<{ data: any; error: any }>(
                        (supabase.from('questions').insert(qData).select().single() as any)
                    );
                    if (error) throw error;
                    const finalQId = data.id;

                    if (selectedSet) {
                        const updatedQs = [...(selectedSet.questions || []), finalQId];
                        await withTimeout<{ data: any; error: any }>(
                            (supabase.from('practice_sets').update({ questions: updatedQs }).eq('id', selectedSet.id) as any)
                        );
                    }
                }
                toast({ title: 'Double checking data sync...' });
                await fetchData();
                toast({ title: isEditingQuestion ? 'Question updated!' : (keepOpen ? 'Question added! Ready for next.' : 'Question created and added to set!') });
            } else {
                // Submit for approval
                const approvalRecordId = (isEditingQuestion && qId && qId !== '') ? qId : null;
                const { error } = await supabase.from('approvals').insert({
                    type: isEditingQuestion ? 'update' : 'create',
                    table_name: 'questions',
                    record_id: approvalRecordId,
                    data: qData,
                    requested_by: profile?.id,
                    summary: `${isEditingQuestion ? 'Update' : 'Add'} practice question: ${newQuestion.text.slice(0, 50)}`,
                    status: 'pending'
                });
                if (error) throw error;
                toast({ title: 'Submitted for admin approval' });
            }

            if (!keepOpen) {
                setIsCreateQuestionDialogOpen(false);
            }

            setIsEditingQuestion(false);
            setImageFile(null);
            setNewQuestion({
                id: '', text: '', type: 'mcq' as any, options: ['', '', '', ''],
                correct_answer: '', category: 'General', difficulty: 'medium', points: 10,
                timer: 0,
                explanation: '', exact_match_required: false, image_url: '', is_required: true,
                created_at: '', updated_at: ''
            });

        } catch (error: any) {
            console.error("Practice Manager save error:", error);
            toast({ title: 'Error saving question', description: error.message || 'Operation failed', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSet = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        setLoading(true);
        try {
            if (isAdmin) {
                const { error } = await supabase.from('practice_sets').delete().eq('id', id);
                if (error) throw error;
                await fetchData();
                toast({ title: 'Practice set deleted' });
            } else {
                // Find name for summary
                const set = practiceSets.find((s: any) => s.id === id);
                const { error } = await supabase.from('approvals').insert({
                    type: 'delete',
                    table_name: 'practice_sets',
                    record_id: id,
                    data: {},
                    requested_by: profile?.id,
                    summary: `Delete Practice Set: ${set?.name || 'Unknown'}`,
                    status: 'pending'
                });
                if (error) throw error;
                toast({ title: 'Deletion submitted for admin approval' });
            }
        } catch (error: any) {
            toast({ title: 'Error deleting set', description: error.message, variant: 'destructive' });
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-display font-bold">Practice Manager</h1>
                    <p className="text-muted-foreground">Manage self-paced practice sets for students</p>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)} className="gradient-hero">
                    <Plus className="w-4 h-4 mr-2" /> Create New Practice Set
                </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {practiceSets.map((set: any) => (
                    <Card key={set.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle>{set.name}</CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteSet(set.id)} className="text-destructive h-8 w-8 p-0">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                            <CardDescription className="line-clamp-2">{set.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Difficulty:</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${set.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                                            set.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                                'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {set.difficulty || 'Medium'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Questions:</span>
                                    <span className="font-bold">{set.questions?.length || 0}</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Button variant="outline" size="sm" className="w-full flex items-center gap-2" onClick={() => { setSelectedSet(set); setIsManageDialogOpen(true); }}>
                                        <Plus className="w-3 h-3" /> Manage Existing
                                    </Button>
                                    <Button variant="outline" size="sm" className="w-full flex items-center gap-2 border-primary/30 text-primary hover:bg-primary/5" onClick={() => { setSelectedSet(set); setIsCreateQuestionDialogOpen(true); }}>
                                        <Plus className="w-3 h-3" /> Create & Add New
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {practiceSets.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground border-dashed border-2 rounded-xl">
                        No practice sets created yet. Start by creating one!
                    </div>
                )}
            </div>

            {/* Create Set Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>New Practice Set</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Set Name</Label>
                            <Input value={newSet.name} onChange={e => setNewSet({ ...newSet, name: e.target.value })} placeholder="e.g. Vocabulary Booster" />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea value={newSet.description} onChange={e => setNewSet({ ...newSet, description: e.target.value })} placeholder="What will students learn?" />
                        </div>
                        <div className="space-y-2">
                            <Label>Difficulty Level</Label>
                            <Select
                                value={newSet.difficulty || 'medium'}
                                onValueChange={(val) => setNewSet({ ...newSet, difficulty: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="easy">Easy (Green)</SelectItem>
                                    <SelectItem value="medium">Medium (Yellow)</SelectItem>
                                    <SelectItem value="hard">Hard (Red)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreateSet} className="gradient-hero">Create Set</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col overflow-hidden p-0">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle>Assign Questions: {selectedSet?.name}</DialogTitle>
                        <DialogDescription>Select questions from the global question bank to add to this practice set.</DialogDescription>
                    </DialogHeader>

                    <div className="px-6 py-2 border-b border-border/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search all questions..."
                                className="pl-10 h-9"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <ScrollArea className="flex-1 px-6 mt-4">
                        <div className="space-y-4">
                            {globalQuestions.filter(q => (q.text || q.prompt || '').toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No questions found matching your search.</p>
                            ) : (
                                globalQuestions.filter(q => (q.text || q.prompt || '').toLowerCase().includes(searchTerm.toLowerCase())).map((q: any) => (
                                    <div key={q.id} className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                                        <Checkbox
                                            id={`q-${q.id}`}
                                            checked={selectedSet?.questions?.includes(q.id)}
                                            onCheckedChange={() => toggleQuestionInSet(q.id)}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <Label htmlFor={`q-${q.id}`} className="font-medium cursor-pointer block truncate">{q.prompt || q.text}</Label>
                                            <div className="flex gap-2 mt-1">
                                                <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">{q.type}</span>
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{q.category}</span>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => handleEditQuestionClick(q)} className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
                                            <Edit className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>

                    <DialogFooter className="p-6 pt-2">
                        <Button variant="outline" onClick={() => setIsManageDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveQuestions} className="gradient-hero">Save Assignments</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isCreateQuestionDialogOpen} onOpenChange={(open) => { setIsCreateQuestionDialogOpen(open); if (!open) setIsEditingQuestion(false); }}>
                <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden p-0">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle>{isEditingQuestion ? 'Edit Question' : `New Question for ${selectedSet?.name}`}</DialogTitle>
                        <DialogDescription>
                            {isEditingQuestion ? 'Update question details globally.' : 'Create a question that will be saved globally and added to this set.'}
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="flex-1 px-6 mt-4">
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label>Question Type</Label>
                                <div className="flex gap-4 p-2 bg-muted/50 rounded-lg">
                                    <Button variant={newQuestion.type === 'mcq' ? 'default' : 'ghost'} size="sm" onClick={() => setNewQuestion({ ...newQuestion, type: 'mcq' })} className="flex-1 h-8">MCQ</Button>
                                    <Button variant={newQuestion.type === 'text' ? 'default' : 'ghost'} size="sm" onClick={() => setNewQuestion({ ...newQuestion, type: 'text' })} className="flex-1 h-8">Writing</Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Question Text</Label>
                                <Textarea value={newQuestion.text} onChange={e => setNewQuestion({ ...newQuestion, text: e.target.value })} placeholder="What is..." />
                            </div>

                            {newQuestion.type === 'mcq' ? (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center bg-muted/30 p-2 rounded-lg border border-dashed">
                                        <Label className="font-bold">Options (Mark correct one)</Label>
                                        <Button variant="secondary" size="sm" onClick={addOption} className="h-8 font-bold text-xs shadow-sm border border-primary/20">
                                            <Plus className="w-4 h-4 mr-1.5" /> Add Options
                                        </Button>
                                    </div>
                                    {newQuestion.options.map((opt, i) => (
                                        <div key={i} className="flex gap-2 items-center">
                                            <Input value={opt} onChange={e => {
                                                const next = [...newQuestion.options];
                                                next[i] = e.target.value;
                                                setNewQuestion({ ...newQuestion, options: next });
                                            }} placeholder={`Option ${i + 1}`} className="h-9" />
                                            <Button
                                                size="sm"
                                                variant={newQuestion.correct_answer === opt && opt !== '' ? 'default' : 'outline'}
                                                onClick={() => setNewQuestion({ ...newQuestion, correct_answer: opt })}
                                                className="shrink-0 h-9"
                                            >
                                                {newQuestion.correct_answer === opt && opt !== '' ? '✓' : 'Set'}
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => removeOption(i)} disabled={newQuestion.options.length <= 2} className="h-9 w-9 p-0 text-destructive/40 hover:text-destructive hover:bg-destructive/10">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label>Expected Keywords / Correct Answer</Label>
                                    <Textarea value={newQuestion.correct_answer} onChange={e => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })} placeholder="Expected answer..." />
                                    <div className="flex items-center gap-2 py-1">
                                        <Checkbox id="exact" checked={newQuestion.exact_match_required} onCheckedChange={v => setNewQuestion({ ...newQuestion, exact_match_required: !!v })} />
                                        <Label htmlFor="exact" className="text-xs">Exact match required</Label>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Difficulty</Label>
                                    <Select value={newQuestion.difficulty} onValueChange={v => setNewQuestion({ ...newQuestion, difficulty: v })}>
                                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                        <SelectContent><SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem></SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Points</Label>
                                    <Input type="number" value={newQuestion.points} onChange={e => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) || 10 })} className="h-9" />
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                <Label>Question Image</Label>
                                <div className="flex gap-4">
                                    <div className="flex-1 space-y-2">
                                        <Label className="text-[10px] text-muted-foreground uppercase font-bold">Upload Local Image</Label>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                            className="cursor-pointer h-9 text-xs"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Label className="text-[10px] text-muted-foreground uppercase font-bold">Or Paste Image URL</Label>
                                        <Input
                                            value={newQuestion.image_url}
                                            onChange={(e) => {
                                                setNewQuestion({ ...newQuestion, image_url: e.target.value });
                                                if (e.target.value) setImageFile(null);
                                            }}
                                            placeholder="https://example.com/image.jpg"
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                </div>
                                {(imageFile || newQuestion.image_url) && (
                                    <div className="relative aspect-video rounded-lg border overflow-hidden bg-muted/50">
                                        <img
                                            src={imageFile ? URL.createObjectURL(imageFile) : newQuestion.image_url}
                                            alt="Preview"
                                            className="w-full h-full object-contain"
                                        />
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="absolute top-2 right-2 h-7 w-7 p-0 rounded-full shadow-lg"
                                            onClick={() => {
                                                setImageFile(null);
                                                setNewQuestion({ ...newQuestion, image_url: '' });
                                            }}
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between border p-3 rounded-lg bg-muted/20">
                                <div className="space-y-0.5">
                                    <Label className="text-sm">Required Question</Label>
                                    <p className="text-[10px] text-muted-foreground">Students must answer this to proceed</p>
                                </div>
                                <Switch
                                    checked={newQuestion.is_required}
                                    onCheckedChange={(checked) => setNewQuestion({ ...newQuestion, is_required: checked })}
                                />
                            </div>
                        </div>
                    </ScrollArea>

                    <DialogFooter className="p-6 pt-4 border-t gap-2">
                        <Button variant="ghost" onClick={() => setIsCreateQuestionDialogOpen(false)}>Cancel</Button>
                        {!isEditingQuestion && (
                            <Button variant="outline" onClick={() => handleCreateAndAddQuestion(true)} disabled={loading}>
                                Save & Add Another
                            </Button>
                        )}
                        <Button onClick={() => handleCreateAndAddQuestion(false)} className="gradient-hero" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditingQuestion ? 'Save Changes' : 'Save & Close'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function SiteStatsDialog({ open, onOpenChange, competitions, schools }: any) {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [filters, setFilters] = useState({
        competitionId: 'all',
        schoolId: 'all',
        country: 'all'
    });
    const { toast } = useToast();

    const fetchStats = async () => {
        setLoading(true);
        try {
            let queryBuilder = supabase.from('results').select('*, profiles(school_id)');

            if (filters.competitionId !== 'all') queryBuilder = queryBuilder.eq('competition_id', filters.competitionId);

            const { data: results, error } = await queryBuilder;
            if (error) throw error;

            let filteredResults = results || [];

            if (filters.schoolId !== 'all') {
                filteredResults = filteredResults.filter((r: any) => r.profiles?.school_id === filters.schoolId);
            }
            if (filters.country !== 'all') {
                filteredResults = filteredResults.filter((r: any) => {
                    const school = schools.find((s: any) => s.id === r.profiles?.school_id);
                    return school?.country === filters.country;
                });
            }

            // Calculations
            const totalAttempted = filteredResults.length;
            const totalCorrect = filteredResults.reduce((sum, r) => sum + (r.correct_count || 0), 0);
            const totalScore = filteredResults.reduce((sum, r) => sum + (r.score || 0), 0);
            const totalQs = filteredResults.reduce((sum, r) => sum + (r.total_questions || 0), 0);
            const participants = new Set(filteredResults.map(r => r.student_id)).size;

            // Avg questions per hour (simulated grouped by hour of submission)
            const hours: any = {};
            filteredResults.forEach(r => {
                const hour = new Date(r.submitted_at).getHours();
                hours[hour] = (hours[hour] || 0) + (r.total_questions || 0);
            });
            const avgQH = Object.values(hours).length > 0
                ? (Object.values(hours).reduce((a: any, b: any) => a + b, 0) as number / 24).toFixed(1)
                : 0;

            setStats({
                totalAttempted,
                totalCorrect,
                totalScore,
                totalQs,
                participants,
                avgQH,
                accuracy: totalQs > 0 ? ((totalCorrect / totalQs) * 100).toFixed(1) : 0
            });
        } catch (e: any) {
            toast({ title: 'Error fetching stats', description: e.message, variant: 'destructive' });
        }
        setLoading(false);
    };

    useEffect(() => {
        if (open) fetchStats();
    }, [open, filters]);

    const countries = Array.from(new Set(schools.map((s: any) => s.country).filter(Boolean)));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Site-wide Statistics
                    </DialogTitle>
                    <DialogDescription>View performance metrics across the platform.</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Competition</Label>
                        <Select value={filters.competitionId} onValueChange={(v) => setFilters(f => ({ ...f, competitionId: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Competitions</SelectItem>
                                {competitions.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Country</Label>
                        <Select value={filters.country} onValueChange={(v) => setFilters(f => ({ ...f, country: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Countries</SelectItem>
                                {countries.map((c: any) => <SelectItem key={c as string} value={c as string}>{c as string}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>School</Label>
                        <Select value={filters.schoolId} onValueChange={(v) => setFilters(f => ({ ...f, schoolId: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Schools</SelectItem>
                                {schools.filter((s: any) => filters.country === 'all' || s.country === filters.country).map((s: any) => (
                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                ) : stats ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-6">
                        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Attempted</p>
                            <p className="text-3xl font-display font-bold mt-1 text-primary">{stats.totalAttempted}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-success/5 border border-success/10">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Correct Answers</p>
                            <p className="text-3xl font-display font-bold mt-1 text-success">{stats.totalCorrect}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Points Earned</p>
                            <p className="text-3xl font-display font-bold mt-1 text-orange-600">{stats.totalScore}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-accent/5 border border-accent/10">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Participants</p>
                            <p className="text-3xl font-display font-bold mt-1 text-accent">{stats.participants}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-warning/5 border border-warning/10">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Avg Qs / Hour</p>
                            <p className="text-3xl font-display font-bold mt-1 text-warning">{stats.avgQH}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Accuracy Rate</p>
                            <p className="text-3xl font-display font-bold mt-1 text-blue-600">{stats.accuracy}%</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Qs Served</p>
                            <p className="text-3xl font-display font-bold mt-1 text-purple-600">{stats.totalQs}</p>
                        </div>
                    </div>
                ) : (
                    <div className="py-20 text-center text-muted-foreground">No data available for these filters.</div>
                )}

                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


