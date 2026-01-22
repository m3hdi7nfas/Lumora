import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Eye, EyeOff, Loader2, RefreshCw, User, CheckCircle, XCircle, MessageSquare, AlertTriangle, Trash2, Mail, Users, Trophy, FileQuestion, CheckSquare, Clock, LayoutTemplate, School, TrendingUp, Calendar, ChevronRight, Crown, Medal, Star, Plus, Edit, Upload, ChevronDown, Shield, Unlock, Lock, Mail as MailIcon, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { DashboardLayout } from './DashboardLayout';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { profile, currentView, isAdminOrModerator } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Sidebar navigation items
  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: LayoutTemplate },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'competitions', label: 'Competitions', icon: Trophy },
    { id: 'questions', label: 'Questions', icon: FileQuestion },
    { id: 'messages', label: 'Messages', icon: MailIcon },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Handle navigation item click
  const handleNavItemClick = (itemId) => {
    setActiveTab(itemId);
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverviewTab />;
      case 'leaderboard':
        return <AdminLeaderboardTab />;
      case 'competitions':
        return <AdminCompetitionsTab />;
      case 'questions':
        return <AdminQuestionsTab />;
      case 'messages':
        return <MessagesTab />;
      case 'settings':
        return <AdminSettingsTab />;
      default:
        return <AdminOverviewTab />;
    }
  };

  return (
    <DashboardLayout
      title="Admin Dashboard"
      sidebar={
        <div className="space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavItemClick(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === item.id ? 'bg-primary/10 border border-primary' : 'hover:bg-muted/50'}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      }
      onNavItemClick={handleNavItemClick}
    >
      {renderContent()}
    </DashboardLayout>
  );
}

// ... rest of the file remains the same