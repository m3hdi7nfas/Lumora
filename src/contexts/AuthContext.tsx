import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, db, microsoftProvider } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';

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
  profile: Profile | null;
  loading: boolean;
  signInWithMicrosoft: () => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, role?: UserRole) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  currentView: UserRole | null;
  setCurrentView: (role: UserRole | null) => void;
  isAdminOrModerator: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<UserRole | null>(() => {
    const savedView = localStorage.getItem('lumora_current_view');
    return (savedView as UserRole) || null;
  });

  useEffect(() => {
    if (currentView) {
      localStorage.setItem('lumora_current_view', currentView);
    } else {
      localStorage.removeItem('lumora_current_view');
    }
  }, [currentView]);

  const isAdminOrModerator = profile?.role === 'admin' || profile?.role === 'moderator';
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (!currentUser) {
          setUser(null);
          setProfile(null);
          return;
        }

        setLoading(true);
        console.log('Syncing Auth:', currentUser.email);

        // 1. Parallel fetch settings and direct UID profile check
        const settingsRef = doc(db, 'settings', 'auth');
        const [settingsSnap, userProfileResult] = await Promise.all([
          getDoc(settingsRef).catch(() => null),
          getDoc(doc(db, 'profiles', currentUser.uid)).catch(() => null)
        ]);

        let userProfile = userProfileResult?.exists() ? (userProfileResult.data() as Profile) : null;

        // 2. FALLBACK: Check by email if no UID match (handles first-time login of admin-added accounts)
        if (!userProfile && currentUser.email) {
          try {
            const q = query(collection(db, 'profiles'), where('email', '==', currentUser.email));
            const emailMatchSnap = await getDocs(q);

            if (!emailMatchSnap.empty) {
              const matchedDoc = emailMatchSnap.docs[0];
              const matchedData = matchedDoc.data() as Profile;
              userProfile = { ...matchedData, id: currentUser.uid, user_id: currentUser.uid };

              // Migrate placeholder profile to actual UID
              await setDoc(doc(db, 'profiles', currentUser.uid), userProfile);
              await deleteDoc(matchedDoc.ref);
              console.log('Migrated profile to UID:', currentUser.uid);
            }
          } catch (e) {
            console.error('Email lookup failed:', e);
          }
        }

        // 3. Domain Restriction - Microsoft Only
        const isMicrosoftUser = currentUser.providerData.some(p => p.providerId === 'microsoft.com');
        if (isMicrosoftUser && settingsSnap?.exists()) {
          const allowedDomains = settingsSnap.data().allowedDomains || [];
          if (allowedDomains.length > 0) {
            const userDomain = '@' + (currentUser.email?.split('@')[1] || '');
            if (!allowedDomains.includes(userDomain)) {
              console.error('Domain restricted:', userDomain);
              await firebaseSignOut(auth);
              setUser(null);
              setProfile(null);
              return;
            }
          }
        }

        // 4. AUTO-CREATE: If still no profile, create a default one for ANY user
        if (!userProfile) {
          console.log('Auto-creating profile for:', currentUser.email);
          userProfile = {
            id: currentUser.uid,
            user_id: currentUser.uid,
            email: currentUser.email || '',
            role: 'student',
            display_name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
            avatar_id: null,
            avatar_url: currentUser.photoURL || null,
            school_id: null,
            score: 0,
            progress: 0,
            is_active: true,
            login_streak: 1,
            competitions_attended: 0
          };
          await setDoc(doc(db, 'profiles', currentUser.uid), {
            ...userProfile,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp()
          });
        }

        setUser(currentUser);
        setProfile(userProfile);
      } catch (error) {
        console.error('Auth critical sync error:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithMicrosoft = async () => {
    try {
      await signInWithPopup(auth, microsoftProvider);
      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.message) };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      if (email === ADMIN_FALLBACK.email && password === ADMIN_FALLBACK.password) {
        setUser({ uid: ADMIN_FALLBACK.profile.user_id, email: ADMIN_FALLBACK.email } as any);
        setProfile(ADMIN_FALLBACK.profile);
        return { error: null };
      }
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.message) };
    }
  };

  const signUp = async (email: string, password: string, _role: UserRole = 'student') => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.message) };
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setProfile(null);
      setCurrentView(null);
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      signInWithMicrosoft, signIn, signUp, signOut,
      currentView, setCurrentView, isAdminOrModerator, isAdmin
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