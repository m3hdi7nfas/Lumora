import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

type UserRole = 'moderator' | 'teacher' | 'student' | 'admin';

interface Profile {
  id: string; // Auth User ID
  email: string;
  role: UserRole;
  display_name: string | null;
  avatar_url?: string | null;
  avatar_id: string | null;
  last_reroll_at?: string | null;
  school_id?: string | null;
  score?: number | null;
  class?: string | null;
  is_active?: boolean;
  progress?: number | null;
  login_streak?: number | null;
  competitions_attended?: number | null;
  password_text?: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  // signInWithMicrosoft removed per user request
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, role?: UserRole) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  currentView: UserRole | null;
  setCurrentView: (role: UserRole | null) => void;
  isAdminOrModerator: boolean;
  isAdmin: boolean;
  setProfile: (profile: Profile | null) => void;
  isProfileDialogOpen: boolean;
  setIsProfileDialogOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState<UserRole | null>(() => {
    const savedView = localStorage.getItem('lumora_current_view');
    return (savedView as UserRole) || null;
  });

  const isAdminOrModerator = profile?.role === 'admin' || profile?.role === 'moderator';
  const isAdmin = profile?.role === 'admin';

  // Persist currentView when it changes
  useEffect(() => {
    if (currentView) {
      localStorage.setItem('lumora_current_view', currentView);
    } else {
      localStorage.removeItem('lumora_current_view');
    }
  }, [currentView]);

  const fetchProfile = async (userId: string, authUser?: User | null): Promise<Profile | null> => {
    try {
      console.log('Fetching profile for:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*, avatars(url)')
        .eq('id', userId)
        .single();

      if (data) {
        const profileData = {
          ...data,
          avatar_url: (data as any).avatars?.url || data.avatar_url || null
        };
        return profileData as Profile;
      }

      if (error) console.log('Profile fetch error:', error.message);

      // Fallback: Use authUser metadata if provided, otherwise check session
      const userToUse = authUser || (await supabase.auth.getUser()).data.user;

      if (userToUse && userToUse.id === userId) {
        console.log('Using fallback profile from metadata');
        return {
          id: userToUse.id,
          email: userToUse.email || '',
          role: (userToUse.user_metadata?.role as UserRole) || 'student',
          display_name: userToUse.user_metadata?.display_name || userToUse.email?.split('@')[0] || 'User',
          avatar_id: null
        };
      }

      return null;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    // 1. Initial check is handled by onAuthStateChange's 'INITIAL_SESSION' event or immediate trigger
    // But we'll keep a simple check as well just in case
    const initialize = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          const p = await fetchProfile(session.user.id, session.user);
          setProfile(p);
        }
      } finally {
        setLoading(false);
      }
    };

    initialize();

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event);

      if (session?.user) {
        setUser(session.user);

        // Fetch profile without blocking the listener
        const updateProfile = async () => {
          // If we don't have a profile yet, or it's for a different user
          if (!profile || profile.id !== session?.user?.id) {
            const userProfile = await fetchProfile(session!.user.id, session!.user);
            if (userProfile) setProfile(userProfile);
          }
          setLoading(false);
        };
        updateProfile();
      } else {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Don't set global loading true here, as it triggers the dashboard spinner before the user is actually authed
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (error: any) {
      return { error: error };
    }
  };

  const signUp = async (email: string, password: string, role: UserRole = 'student') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role,
            display_name: email.split('@')[0],
          },
        },
      });
      return { data, error };
    } catch (error: any) {
      return { error: error };
    }
  };

  // signInWithMicrosoft removed per user request

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setCurrentView(null);
    } catch (error) {
      console.error('Supabase Sign Out Error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      // signInWithMicrosoft removed per user request
      signIn,
      signUp,
      signOut,
      currentView,
      setCurrentView,
      isAdminOrModerator,
      isAdmin,
      setProfile,
      isProfileDialogOpen,
      setIsProfileDialogOpen
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
