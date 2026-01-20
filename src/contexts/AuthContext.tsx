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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<UserRole | null>(null);

  const isAdminOrModerator = profile?.role === 'admin' || profile?.role === 'moderator';
  const isAdmin = profile?.role === 'admin';

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