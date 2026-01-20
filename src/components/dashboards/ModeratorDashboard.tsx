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
  BarChart3
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
    { id: 'leaderboard', icon: BarChart3, label: 'Leaderboard' },
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
      {activeTab === 'badges' && <BadgesTab />}
      {activeTab === 'avatars' && <AvatarsTab />}
      {activeTab === 'messages' && <MessagesTab />}
      {activeTab === 'leaderboard' && <LeaderboardTab />}
    </DashboardLayout>
  );
}

// Leaderboard Tab Component
function LeaderboardTab() {
  const [selectedCompetition, setSelectedCompetition] = useState('all');
  const [timeRange, setTimeRange] = useState('all-time');

  // Mock data - replace with real API calls
  const competitions = [
    { id: 'all', name: 'All Competitions' },
    { id: 'spring-2024', name: 'Spring Challenge 2024' },
    { id: 'math-olympiad', name: 'Math Olympiad 2024' },
    { id: 'science-fair', name: 'Science Fair 2024' },
  ];

  const leaderboardData = [
    { rank: 1, name: 'Sarah Johnson', school: 'Springfield High', score: 4580, badge: 'gold' },
    { rank: 2, name: 'Michael Chen', school: 'Springfield High', score: 4230, badge: 'silver' },
    { rank: 3, name: 'Emily Rodriguez', school: 'Jefferson Academy', score: 3980, badge: 'bronze' },
    { rank: 4, name: 'David Kim', school: 'Lincoln Prep', score: 3750, badge: 'none' },
    { rank: 5, name: 'Jessica Lee', school: 'Springfield High', score: 3620, badge: 'none' },
    { rank: 6, name: 'Ryan Wilson', school: 'Jefferson Academy', score: 3480, badge: 'none' },
    { rank: 7, name: 'Amanda Taylor', school: 'Lincoln Prep', score: 3350, badge: 'none' },
    { rank: 8, name: 'Daniel Brown', school: 'Springfield High', score: 3220, badge: 'none' },
    { rank: 9, name: 'Olivia Martinez', school: 'Jefferson Academy', score: 3100, badge: 'none' },
    { rank: 10, name: 'Matthew Anderson', school: 'Lincoln Prep', score: 2980, badge: 'none' },
  ];

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
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>School Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-xs font-bold text-gold-foreground">1</div>
                  <span className="font-medium">Springfield High</span>
                </div>
                <span className="font-bold">12,450 pts</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-silver flex items-center justify-center text-xs font-bold text-silver-foreground">2</div>
                  <span className="font-medium">Jefferson Academy</span>
                </div>
                <span className="font-bold">10,230 pts</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-bronze flex items-center justify-center text-xs font-bold text-bronze-foreground">3</div>
                  <span className="font-medium">Lincoln Prep</span>
                </div>
                <span className="font-bold">9,870 pts</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Competition Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground text-sm">Total Participants</p>
                <p className="text-2xl font-bold">487</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Questions Answered</p>
                <p className="text-2xl font-bold">12,458</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Avg. Score</p>
                <p className="text-2xl font-bold">2,840</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Completion Rate</p>
                <p className="text-2xl font-bold">87%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ... rest of the component code remains unchanged