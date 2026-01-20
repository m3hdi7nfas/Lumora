import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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

// Demo accounts for local development
const DEMO_ACCOUNTS = {
  'demo.admin@lumora.com': {
    password: 'Demo123!',
    profile: {
      id: 'demo-admin-id',
      user_id: 'demo-admin-user-id',
      email: 'demo.admin@lumora.com',
      role: 'admin' as UserRole,
      display_name: 'Demo Admin',
      avatar_url: null,
      avatar_id: null,
      school_id: null,
      score: 1000,
      class: null,
      is_active: true,
      progress: 100
    }
  },
  'demo.moderator@lumora.com': {
    password: 'Demo123!',
    profile: {
      id: 'demo-moderator-id',
      user_id: 'demo-moderator-user-id',
      email: 'demo.moderator@lumora.com',
      role: 'moderator' as UserRole,
      display_name: 'Demo Moderator',
      avatar_url: null,
      avatar_id: null,
      school_id: null,
      score: 800,
      class: null,
      is_active: true,
      progress: 80
    }
  },
  'demo.teacher@lumora.com': {
    password: 'Demo123!',
    profile: {
      id: 'demo-teacher-id',
      user_id: 'demo-teacher-user-id',
      email: 'demo.teacher@lumora.com',
      role: 'teacher' as UserRole,
      display_name: 'Demo Teacher',
      avatar_url: null,
      avatar_id: null,
      school_id: null,
      score: 600,
      class: null,
      is_active: true,
      progress: 60
    }
  },
  'demo.student@lumora.com': {
    password: 'Demo123!',
    profile: {
      id: 'demo-student-id',
      user_id: 'demo-student-user-id',
      email: 'demo.student@lumora.com',
      role: 'student' as UserRole,
      display_name: 'Demo Student',
      avatar_url: null,
      avatar_id: null,
      school_id: null,
      score: 400,
      class: null,
      is_active: true,
      progress: 40
    }
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<UserRole | null>(null);

  const isAdminOrModerator = profile?.role === 'admin' || profile?.role === 'moderator';
  const isAdmin = profile?.role === 'admin';

  // Check if we're using demo accounts
  const isDemoAccount = (email: string) => {
    return DEMO_ACCOUNTS[email as keyof typeof DEMO_ACCOUNTS] !== undefined;
  };

  const fetchProfile = async (userId: string, retries = 3): Promise<void> => {
    for (let i = 0; i < retries; i++) {
      // Delay between retries (longer for first attempt after signup)
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 500 * i));
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          console.log(`Profile fetch attempt ${i + 1} failed:`, error.message);
          continue;
        }

        if (data) {
          setProfile(data as Profile);
          return;
        }
      } catch (error) {
        console.log(`Profile fetch attempt ${i + 1} failed:`, error.message);
      }
    }

    console.log('Failed to fetch profile after retries');
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Use a small delay to let the trigger create the profile
          setTimeout(() => fetchProfile(session.user.id), 200);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('Attempting sign in with:', email);

    // Check if this is a demo account
    if (isDemoAccount(email)) {
      const demoAccount = DEMO_ACCOUNTS[email as keyof typeof DEMO_ACCOUNTS];

      if (demoAccount.password === password) {
        // Set up a mock session for demo accounts
        const mockUser = {
          id: demoAccount.profile.user_id,
          email: demoAccount.profile.email,
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as User;

        const mockSession = {
          access_token: 'demo-access-token',
          token_type: 'bearer',
          user: mockUser,
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          refresh_token: 'demo-refresh-token'
        } as Session;

        setUser(mockUser);
        setSession(mockSession);
        setProfile(demoAccount.profile);
        setLoading(false);

        return { error: null };
      } else {
        return { error: new Error('Invalid login credentials') };
      }
    }

    // Regular Supabase sign in for non-demo accounts
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('Sign in error:', error.message);
        return { error: new Error(error.message) };
      }
      return { error: null };
    } catch (error) {
      console.error('Sign in exception:', error);
      return { error: new Error(error.message) };
    }
  };

  const signUp = async (email: string, password: string, role: UserRole = 'student') => {
    console.log('Attempting sign up with:', email, 'role:', role);

    // For demo accounts, we don't need to actually create them
    if (isDemoAccount(email)) {
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { role }
        }
      });

      if (error) {
        console.error('Sign up error:', error.message);
        return { error: new Error(error.message) };
      }

      console.log('Sign up successful, waiting for profile creation...');
      return { error: null };
    } catch (error) {
      console.error('Sign up exception:', error);
      return { error: new Error(error.message) };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setCurrentView(null);
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