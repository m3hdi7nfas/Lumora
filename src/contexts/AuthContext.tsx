import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, db, microsoftProvider } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, query, collection, where, getDocs, updateDoc } from 'firebase/firestore';

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
  setProfile: (profile: Profile | null) => void;
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

  // Fetch user profile from Firestore
  const fetchProfile = async (userId: string, email?: string) => {
    try {
      console.log('🔍 Fetching profile for UID:', userId, 'Email:', email);

      // PRIORITY 1: Try by lowercase email (most common for pre-registered users)
      if (email) {
        const lowerEmail = email.toLowerCase();
        console.log('📧 Trying email-based lookup:', lowerEmail);

        try {
          const emailDocRef = doc(db, 'profiles', lowerEmail);
          const emailDocSnap = await getDoc(emailDocRef);

          if (emailDocSnap.exists()) {
            console.log('✅ Found profile by email ID:', lowerEmail);
            const data = emailDocSnap.data() as Profile;

            // Link UID to this profile if not already linked
            if (data.user_id !== userId) {
              console.log('🔗 Linking UID to email-based profile');
              try {
                await updateDoc(emailDocRef, {
                  user_id: userId,
                  updated_at: serverTimestamp()
                });
              } catch (e) {
                console.warn('⚠️ Could not link UID (permission issue, but login will proceed):', e);
              }
            }

            return { ...data, id: lowerEmail, user_id: userId };
          } else {
            console.log('❌ No profile found with email as document ID');
          }
        } catch (e: any) {
          console.error('❌ Email lookup failed:', e);
        }
      }

      // PRIORITY 2: Try by UID (for users created with email/password)
      console.log('🔑 Trying UID-based lookup:', userId);
      try {
        const docRef = doc(db, 'profiles', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log('✅ Found profile by UID:', userId);
          return docSnap.data() as Profile;
        } else {
          console.log('❌ No profile found with UID as document ID');
        }
      } catch (e: any) {
        console.error('❌ UID lookup failed:', e);
      }

      // PRIORITY 3: Query by email field (fallback for any edge cases)
      if (email) {
        const lowerEmail = email.toLowerCase();
        console.log('🔎 Trying query by email field:', lowerEmail);

        try {
          const q = query(collection(db, 'profiles'), where('email', '==', lowerEmail));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            console.log('✅ Found profile via email field query');
            const profileDoc = querySnapshot.docs[0];
            const data = profileDoc.data() as Profile;

            // Try to link UID
            try {
              await updateDoc(doc(db, 'profiles', profileDoc.id), {
                user_id: userId,
                updated_at: serverTimestamp()
              });
            } catch (e) {
              console.warn('⚠️ Could not link UID via query (permission issue):', e);
            }

            return { ...data, id: profileDoc.id, user_id: userId };
          } else {
            console.log('❌ No profile found via email field query');
          }
        } catch (queryErr: any) {
          console.error('❌ Email field query failed:', queryErr);
        }
      }

      console.log('❌ Profile not found after all strategies');
      return null;
    } catch (error: any) {
      console.error('💥 Critical error in fetchProfile:', error);
      if (error.code === 'permission-denied') {
        throw new Error('Database permission denied. Please check Firestore Rules.');
      }
      return null;
    }
  };

  // Sync auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          // Check if it's the fallback admin
          if (currentUser.email === ADMIN_FALLBACK.email) {
            setUser({
              uid: ADMIN_FALLBACK.profile.user_id,
              email: ADMIN_FALLBACK.email
            } as any);
            setProfile(ADMIN_FALLBACK.profile);
            // Artificial delay to show the nice loading state and ensure DB is ready
            await new Promise(resolve => setTimeout(resolve, 1200));
            setLoading(false);
            return;
          }

          let userProfile = await fetchProfile(currentUser.uid, currentUser.email || undefined);

          // Give a small moment for the user to see the Preparing screen
          await new Promise(resolve => setTimeout(resolve, 800));

          if (!userProfile) {
            console.warn('User not registered in Lumora profiles. Signing out.');
            await firebaseSignOut(auth);
            setUser(null);
            setProfile(null);
          } else {
            setUser(currentUser);
            setProfile(userProfile);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithMicrosoft = async () => {
    try {
      const result = await signInWithPopup(auth, microsoftProvider);
      const currentUser = result.user;

      // Check if it's the fallback admin
      if (currentUser.email === ADMIN_FALLBACK.email) {
        return { error: null };
      }

      // Important: We must verify if this user exists in our profiles collection
      // before allowing them to proceed. fetchProfile handles linking and registration check.
      let userProfile = await fetchProfile(currentUser.uid, currentUser.email || undefined);

      if (!userProfile) {
        // Domain Check for Auto-Registration
        if (currentUser.email) {
          try {
            const domain = currentUser.email.split('@')[1]?.toLowerCase();
            if (domain) {
              const settingsRef = doc(db, 'settings', 'auth_domains');
              const settingsSnap = await getDoc(settingsRef);
              const allowedDomains = settingsSnap.exists() ? (settingsSnap.data().allowed_domains || []) : [];

              if (allowedDomains.includes(domain)) {
                console.log(`✅ Domain '${domain}' is allowed. Auto-registering user.`);
                // Create new profile
                const newProfileData = {
                  email: currentUser.email.toLowerCase(),
                  display_name: currentUser.displayName || currentUser.email.split('@')[0],
                  role: 'student' as UserRole,
                  school_id: null,
                  is_active: true,
                  score: 0,
                  progress: 0,
                  avatar_id: null,
                  user_id: currentUser.uid,
                  created_at: serverTimestamp(),
                  updated_at: serverTimestamp()
                };

                await setDoc(doc(db, 'profiles', currentUser.uid), newProfileData);
                setProfile({ ...newProfileData, id: currentUser.uid } as Profile);
                return { error: null };
              }
            }
          } catch (err) {
            console.error("Error checking allowed domains:", err);
          }
        }

        console.warn('Login attempt with unregistered Microsoft account:', currentUser.email);
        await firebaseSignOut(auth);

        // Detailed error for debugging the specific failure case
        const debugInfo = `Email: ${currentUser.email}, UID: ${currentUser.uid}`;
        const lowerEmail = currentUser.email?.toLowerCase();

        return {
          error: new Error(`Login failed for ${currentUser.email}. Account not found and domain not whitelisted. Please ask admin to 'Grant Access' or add your domain.`)
        };
      }

      setProfile(userProfile);
      return { error: null };
    } catch (error: any) {
      console.error('Microsoft sign in error:', error);
      return { error: new Error(error.message) };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // 1. Try Fallback Admin first specific credentials (hardcoded backdoor for testing)
      if (email === ADMIN_FALLBACK.email && password === ADMIN_FALLBACK.password) {
        setUser({
          uid: ADMIN_FALLBACK.profile.user_id,
          email: ADMIN_FALLBACK.email
        } as any);
        setProfile(ADMIN_FALLBACK.profile);
        return { error: null };
      }

      // 2. Try actual Firebase Auth
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      await signInWithEmailAndPassword(auth, email, password);
      // The onAuthStateChanged listener will handle setting user/profile
      return { error: null };
    } catch (error: any) {
      console.error("Login Error:", error);
      return { error: new Error(error.message) };
    }
  };

  const signUp = async (email: string, password: string, role: UserRole = 'student') => {
    try {
      console.log('📝 Creating new user account:', email);

      // Import Firebase Auth functions
      const { createUserWithEmailAndPassword } = await import('firebase/auth');

      // Create the authentication user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      console.log('✅ Auth user created with UID:', newUser.uid);

      // Create the Firestore profile
      const profileData = {
        email: email.toLowerCase(),
        display_name: email.split('@')[0],
        role: role,
        school_id: null,
        is_active: true,
        score: 0,
        progress: 0,
        avatar_id: null,
        user_id: newUser.uid,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };

      // Use UID as document ID for email/password users
      const profileRef = doc(db, 'profiles', newUser.uid);
      await setDoc(profileRef, profileData);

      console.log('✅ Profile created successfully');

      return { error: null };
    } catch (error: any) {
      console.error('❌ Sign up error:', error);

      // Provide user-friendly error messages
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please sign in instead.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      }

      return { error: new Error(errorMessage) };
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
      user,
      profile,
      loading,
      signInWithMicrosoft,
      signIn,
      signUp,
      signOut,
      currentView,
      setCurrentView,
      isAdminOrModerator,
      isAdmin,
      setProfile
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