import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

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
  user: any | null;
  session: any | null;
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

// Local storage utilities for users
const LOCAL_STORAGE_KEYS = {
  USERS: 'lumora_users',
  CURRENT_USER: 'lumora_current_user',
  SESSIONS: 'lumora_sessions'
};

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<UserRole | null>(null);

  const isAdminOrModerator = profile?.role === 'admin' || profile?.role === 'moderator';
  const isAdmin = profile?.role === 'admin';

  // Check if we're using demo accounts
  const isDemoAccount = (email: string) => {
    return DEMO_ACCOUNTS[email as keyof typeof DEMO_ACCOUNTS] !== undefined;
  };

  // Initialize users in local storage if not present
  useEffect(() => {
    const users = localStorageCRUD.get(LOCAL_STORAGE_KEYS.USERS);
    if (users.length === 0) {
      // Add demo accounts to local storage
      Object.values(DEMO_ACCOUNTS).forEach(demoAccount => {
        localStorageCRUD.add(LOCAL_STORAGE_KEYS.USERS, demoAccount.profile);
      });
    }
  }, []);

  // Load current user from local storage
  useEffect(() => {
    const currentUser = localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
    if (currentUser) {
      try {
        const userData = JSON.parse(currentUser);
        setUser(userData.user);
        setSession(userData.session);
        setProfile(userData.profile);
      } catch (error) {
        console.error('Error parsing current user:', error);
      }
    }
    setLoading(false);
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
        };

        const mockSession = {
          access_token: 'demo-access-token',
          token_type: 'bearer',
          user: mockUser,
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          refresh_token: 'demo-refresh-token'
        };

        setUser(mockUser);
        setSession(mockSession);
        setProfile(demoAccount.profile);

        // Save to local storage
        localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify({
          user: mockUser,
          session: mockSession,
          profile: demoAccount.profile
        }));

        return { error: null };
      } else {
        return { error: new Error('Invalid login credentials') };
      }
    }

    // Check regular users in local storage
    try {
      const users = localStorageCRUD.get(LOCAL_STORAGE_KEYS.USERS);
      const user = users.find(u => u.email === email);

      if (!user) {
        return { error: new Error('User not found') };
      }

      // For demo purposes, we'll accept any password for non-demo accounts
      // In a real app, you would store hashed passwords and compare them
      const mockUser = {
        id: user.user_id,
        email: user.email,
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const mockSession = {
        access_token: 'local-access-token',
        token_type: 'bearer',
        user: mockUser,
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: 'local-refresh-token'
      };

      setUser(mockUser);
      setSession(mockSession);
      setProfile(user);

      // Save to local storage
      localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify({
        user: mockUser,
        session: mockSession,
        profile: user
      }));

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
      // Check if user already exists
      const users = localStorageCRUD.get(LOCAL_STORAGE_KEYS.USERS);
      const existingUser = users.find(u => u.email === email);

      if (existingUser) {
        return { error: new Error('User already exists') };
      }

      // Create new user
      const newUser = {
        id: `user-${Date.now()}`,
        user_id: `user-${Date.now()}`,
        email: email,
        role: role,
        display_name: email.split('@')[0],
        avatar_url: null,
        avatar_id: null,
        school_id: null,
        score: 0,
        class: null,
        is_active: true,
        progress: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add to local storage
      localStorageCRUD.add(LOCAL_STORAGE_KEYS.USERS, newUser);

      console.log('Sign up successful');
      return { error: null };
    } catch (error) {
      console.error('Sign up exception:', error);
      return { error: new Error(error.message) };
    }
  };

  const signOut = async () => {
    // Clear current user from local storage
    localStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
    setProfile(null);
    setCurrentView(null);
    setUser(null);
    setSession(null);
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