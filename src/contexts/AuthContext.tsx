import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

type UserRole = 'moderator' | 'teacher' | 'student' | 'admin';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  role: UserRole;
  display_name: string | null;
  avatar_url?: string | null;
  avatar_id: string | null;
  school_id?: string | null;
  score?: number | null;
  class?: string | null;
  is_active?: boolean;
  progress?: number | null;
  login_streak?: number | null;
  competitions_attended?: number | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, role?: UserRole) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  currentView: UserRole | null;
  setCurrentView: (role: UserRole | null) => void;
  isAdminOrModerator: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin fallback account (for initial setup)
const ADMIN_FALLBACK = {
  email: 'admin@lumora.com',
  password: 'AdminPassword123!',
  profile: {
    id: 'admin-fallback-id',
    user_id: 'admin-fallback-user-id',
    email: 'admin@lumora.com',
    role: 'admin' as UserRole,
    display_name: 'Platform Admin',
    avatar_url: null,
    avatar_id: null,
    school_id: null,
    score: 0,
    class: null,
    is_active: true,
    progress: 0,
    login_streak: 0,
    competitions_attended: 0
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<UserRole | null>(() => {
    const savedView = localStorage.getItem('lumora_current_view');
    return (savedView as UserRole) || null;
  });

  // Persist currentView when it changes
  useEffect(() => {
    if (currentView) {
      localStorage.setItem('lumora_current_view', currentView);
    } else {
      localStorage.removeItem('lumora_current_view');
    }
  }, [currentView]);

  const isAdminOrModerator = profile?.role === 'admin' || profile?.role === 'moderator';
  const isAdmin = profile?.role === 'admin';

  // Fetch user profile from Supabase
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data as Profile;
    } catch (error) {
      console.error('Exception fetching profile:', error);
      return null;
    }
  };

  // Initialize auth state and listen for changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user.id).then(profile => {
          setProfile(profile);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setProfile(profile);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Check if this is the admin fallback account
      if (email === ADMIN_FALLBACK.email && password === ADMIN_FALLBACK.password) {
        // Use fallback admin (for when Supabase is not set up)
        setUser({ id: ADMIN_FALLBACK.profile.user_id, email: ADMIN_FALLBACK.email } as User);
        setProfile(ADMIN_FALLBACK.profile);
        console.log('Logged in with admin fallback account');
        return { error: null };
      }

      // Try Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase sign in error:', error);
        return { error: new Error(error.message) };
      }

      // Profile will be fetched by the auth state change listener
      return { error: null };
    } catch (error: any) {
      console.error('Sign in exception:', error);
      return { error: new Error(error.message || 'Sign in failed') };
    }
  };

  const signUp = async (email: string, password: string, role: UserRole = 'student') => {
    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role,
            display_name: email.split('@')[0]
          }
        }
      });

      if (authError) {
        console.error('Supabase sign up error:', authError);
        return { error: new Error(authError.message) };
      }

      if (!authData.user) {
        return { error: new Error('User creation failed') };
      }

      // Create profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          user_id: authData.user.id,
          email: email,
          role: role,
          display_name: email.split('@')[0],
          avatar_id: null,
          school_id: null,
          score: 0,
          class: null,
          is_active: true,
          progress: 0,
          login_streak: 1,
          competitions_attended: 0
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // User was created in auth but profile failed - this is okay, profile can be created later
      }

      return { error: null };
    } catch (error: any) {
      console.error('Sign up exception:', error);
      return { error: new Error(error.message || 'Sign up failed') };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setProfile(null);
      setCurrentView(null);
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signIn, signUp, signOut, currentView, setCurrentView, isAdminOrModerator, isAdmin }}>
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