import { useState, useEffect } from 'react';
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
  List,
  AlertTriangle,
  Settings,
  Shield,
  GraduationCap,
  Swords,
  BookOpen
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import { localStorageCRUD } from '@/lib/localStorageCRUD';

// ... rest of the file remains the same, but fix the Badge variants:

// In CompetitionsTab, change:
<Badge variant={competition.is_active ? 'default' : 'destructive'}>
  {competition.is_active ? 'Active' : 'Inactive'}
</Badge>

// In ChallengesTab, change:
<Badge variant={challenge.difficulty === 'Easy' ? 'outline' : challenge.difficulty === 'Medium' ? 'outline' : 'destructive'}>
  {challenge.difficulty}
</Badge>

<Badge variant={challenge.status === 'active' ? 'default' : 'outline'}>
  {challenge.status}
</Badge>

// In MessagesTab, change:
<Badge variant={message.read ? 'outline' : 'default'}>
  {message.read ? 'Read' : 'Unread'}
</Badge>