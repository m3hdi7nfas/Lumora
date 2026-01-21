import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

// Define the AuthContext type
interface AuthContextType {
  user: any;
  profile: any;
  loading: boolean;
  currentView: string | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  setCurrentView: (view: string) => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define demo accounts
const DEMO_ACCOUNTS = {
  'admin@lumora.com': { password: 'admin123', role: 'admin' },
  'moderator@lumora.com': { password: 'moderator123', role: 'moderator' },
  'teacher@lumora.com': { password: 'teacher123', role: 'teacher' },
  'student@lumora.com': { password: 'student123', role: 'student' },
};

function isDemoAccount(email: string): email is keyof typeof DEMO_ACCOUNTS {
  return email in DEMO_ACCOUNTS;
}

// AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check local storage for user data
        const userData = localStorage.getItem('lumora_current_user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser.user);
          setProfile(parsedUser.profile);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      // Check if this is a demo account
      if (isDemoAccount(email)) {
        const demoAccount = DEMO_ACCOUNTS[email];

        if (demoAccount.password === password) {
          // Create mock user and profile
          const mockUser = {
            id: `demo-${email}`,
            email,
            role: demoAccount.role,
            created_at: new Date().toISOString(),
          };

          const mockProfile = {
            id: `profile-${email}`,
            user_id: mockUser.id,
            display_name: email.split('@')[0],
            role: demoAccount.role,
            school_id: 'demo-school',
            avatar_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Store in local storage
          localStorage.setItem('lumora_current_user', JSON.stringify({
            user: mockUser,
            profile: mockProfile,
          }));

          // Update state
          setUser(mockUser);
          setProfile(mockProfile);
          setCurrentView(null); // Reset to default view

          return { error: null };
        } else {
          return { error: new Error('Invalid login credentials') };
        }
      }

      // For non-demo accounts, you would typically call your auth API here
      // This is a placeholder for real authentication
      return { error: new Error('Only demo accounts are supported in this version') };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: new Error('An unexpected error occurred during sign in') };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('lumora_current_user');
      localStorage.removeItem('lumora_current_view');

      // Reset state
      setUser(null);
      setProfile(null);
      setCurrentView(null);

      // Note: Navigation should be handled by the component that calls signOut
      // since useNavigate can only be used within Router context
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive',
      });
    }
  };

  // Set current view function
  const handleSetCurrentView = (view: string) => {
    try {
      setCurrentView(view);
      localStorage.setItem('lumora_current_view', view);
    } catch (error) {
      console.error('Error setting current view:', error);
      toast({
        title: 'Error',
        description: 'Failed to change view',
        variant: 'destructive',
      });
    }
  };

  // Context value
  const contextValue = {
    user,
    profile,
    loading,
    currentView,
    signIn,
    signOut,
    setCurrentView: handleSetCurrentView,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Create the useAuth hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}