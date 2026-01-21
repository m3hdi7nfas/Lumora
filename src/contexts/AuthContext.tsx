// ... existing imports

export function AuthProvider({ children }: { children: ReactNode }) {
  // ... existing state

  // Add more robust error handling
  const signIn = async (email: string, password: string) => {
    try {
      // Check if this is a demo account
      if (isDemoAccount(email)) {
        const demoAccount = DEMO_ACCOUNTS[email as keyof typeof DEMO_ACCOUNTS];

        if (demoAccount.password === password) {
          // ... existing demo account logic
          return { error: null };
        } else {
          return { error: new Error('Invalid login credentials') };
        }
      }

      // ... existing sign in logic
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: new Error('An unexpected error occurred during sign in') };
    }
  };

  // ... rest of the AuthProvider with enhanced error handling
}