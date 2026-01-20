import { useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  User
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function TeacherSidebar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const { profile } = useAuth();
  const navItems = [
    { id: 'overview', icon: BarChart3, label: 'Overview' },
    { id: 'students', icon: Users, label: 'Students' },
    { id: 'leaderboard', icon: Trophy, label: 'Leaderboard' },
    { id: 'messages', icon: MessageSquare, label: 'Inbox' },
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
              {profile?.display_name?.substring(0, 2).toUpperCase() || 'TD'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{profile?.display_name || 'Teacher'}</p>
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

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <DashboardLayout
      title="Lumora Teacher Dashboard"
      sidebar={<TeacherSidebar activeTab={activeTab} setActiveTab={setActiveTab} />}
    >
      {activeTab === 'overview' && <TeacherOverview />}
      {activeTab === 'students' && <StudentsTab />}
      {activeTab === 'leaderboard' && <TeacherLeaderboardTab />}
      {activeTab === 'messages' && <MessagesTab />}
      {activeTab === 'profile' && <ProfileView />}
    </DashboardLayout>
  );
}

// Teacher Leaderboard Tab Component
function TeacherLeaderboardTab() {
  const [selectedCompetition, setSelectedCompetition] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');

  // Mock data - replace with real API calls
  const competitions = [
    { id: 'all', name: 'All Competitions' },
    { id: 'spring-2024', name: 'Spring Challenge 2024' },
    { id: 'math-olympiad', name: 'Math Olympiad 2024' },
  ];

  const classes = [
    { id: 'all', name: 'All Classes' },
    { id: 'class-10a', name: 'Class 10A' },
    { id: 'class-10b', name: 'Class 10B' },
    { id: 'class-11a', name: 'Class 11A' },
  ];

  const leaderboardData = [
    { rank: 1, name: 'Sarah Johnson', score: 4580, progress: 92, badge: 'gold' },
    { rank: 2, name: 'Michael Chen', score: 4230, progress: 88, badge: 'silver' },
    { rank: 3, name: 'Emily Rodriguez', score: 3980, progress: 84, badge: 'bronze' },
    { rank: 4, name: 'David Kim', score: 3750, progress: 80, badge: 'none' },
    { rank: 5, name: 'Jessica Lee', score: 3620, progress: 78, badge: 'none' },
    { rank: 6, name: 'Ryan Wilson', score: 3480, progress: 75, badge: 'none' },
    { rank: 7, name: 'Amanda Taylor', score: 3350, progress: 72, badge: 'none' },
    { rank: 8, name: 'Daniel Brown', score: 3220, progress: 70, badge: 'none' },
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
          <h1 className="text-2xl font-display font-bold">Class Leaderboard</h1>
          <p className="text-muted-foreground">Track your students' performance</p>
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

          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(cls => (
                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Performance</CardTitle>
          <CardDescription>Your students' scores and progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-3 text-left font-medium">Rank</th>
                  <th className="p-3 text-left font-medium">Student</th>
                  <th className="p-3 text-left font-medium">Score</th>
                  <th className="p-3 text-left font-medium">Progress</th>
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
                    <td className="p-3 font-bold">{student.score.toLocaleString()}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-full h-2 bg-muted rounded-full">
                          <div
                            className="h-2 bg-primary rounded-full"
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{student.progress}%</span>
                      </div>
                    </td>
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
            <CardTitle>Class Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground text-sm">Total Students</p>
                <p className="text-2xl font-bold">28</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Active Students</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Avg. Score</p>
                <p className="text-2xl font-bold">3,845</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Completion Rate</p>
                <p className="text-2xl font-bold">82%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-xs font-bold text-gold-foreground">1</div>
                  <span className="font-medium">Sarah Johnson</span>
                </div>
                <span className="font-bold">4,580 pts</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-silver flex items-center justify-center text-xs font-bold text-silver-foreground">2</div>
                  <span className="font-medium">Michael Chen</span>
                </div>
                <span className="font-bold">4,230 pts</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-bronze flex items-center justify-center text-xs font-bold text-bronze-foreground">3</div>
                  <span className="font-medium">Emily Rodriguez</span>
                </div>
                <span className="font-bold">3,980 pts</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ... rest of the component code remains unchanged