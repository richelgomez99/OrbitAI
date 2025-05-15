import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient'; // Correct path to your Supabase client
import { Session, User, AuthChangeEvent, AuthError } from '@supabase/supabase-js';

interface AuthCredentials {
  email: string;
  password?: string; // Password is required for email/password auth
  name?: string; // Name for signup
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  onboardingCompleted: boolean;
  loading: boolean; // To handle loading states during async operations
  login: (credentials: AuthCredentials) => Promise<{ error: AuthError | null }>;
  signup: (credentials: AuthCredentials) => Promise<{ error: AuthError | null }>;
  logout: () => Promise<{ error: AuthError | null }>;
  completeOnboarding: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null); // Internal session state
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true); // True initially until first auth check completes

  useEffect(() => {
    setLoading(true);
    // Check current session on initial load
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      if (initialSession?.user) {
        const initialOnboardingStatus = initialSession.user.user_metadata?.onboarding_completed === true;
        setOnboardingCompleted(initialOnboardingStatus);
        localStorage.setItem('orbitOnboardingCompleted', initialOnboardingStatus.toString());
      } else {
        setOnboardingCompleted(false);
        localStorage.removeItem('orbitOnboardingCompleted');
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession: Session | null) => {
        console.log('[AuthContext] onAuthStateChange event:', event, 'User ID:', currentSession?.user?.id, 'Metadata:', JSON.stringify(currentSession?.user?.user_metadata));
        setLoading(true);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          let currentOnboardingStatus = currentSession.user.user_metadata?.onboarding_completed === true;
          
          // If onboarding_completed is explicitly set during signup via options.data,
          // this explicit update might become redundant or serve as a fallback.
          // We'll keep it for now to ensure robustness in case signup options.data isn't picked up as expected
          // or for users created through other means (e.g. directly in Supabase dashboard).
          if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && typeof currentSession.user.user_metadata?.onboarding_completed !== 'boolean') {
            console.log('onAuthStateChange: onboarding_completed is undefined or not boolean, attempting to set to false.');
            try {
              const { data: updatedUserData, error: updateError } = await supabase.auth.updateUser({
                data: { onboarding_completed: false } // Ensure it's set to a boolean
              });
              if (updateError) {
                console.error('Error setting default onboarding status via updateUser:', updateError);
                // Potentially throw updateError or handle it based on severity
              } else if (updatedUserData.user) {
                setUser(updatedUserData.user); // Refresh user state with new metadata
                currentOnboardingStatus = false;
                console.log('onAuthStateChange: onboarding_completed successfully set to false via updateUser.');
              }
            } catch (error) {
              console.error('Exception setting default onboarding status via updateUser:', error);
            }
          }
          setOnboardingCompleted(currentOnboardingStatus);
          localStorage.setItem('orbitOnboardingCompleted', currentOnboardingStatus.toString());
        } else {
          setOnboardingCompleted(false);
          localStorage.removeItem('orbitOnboardingCompleted');
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (credentials: AuthCredentials) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password!,
    });
    setLoading(false);
    // onAuthStateChange will handle updating user, session, and onboarding status
    return { error };
  };

  const signup = async (credentials: AuthCredentials) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password!,
      options: {
        data: {
          full_name: credentials.name, // Store name in user_metadata
          onboarding_completed: false, // Initialize onboarding status
        },
      },
    });
    // If signup is successful and auto-confirmation is off, user needs to confirm email.
    // If auto-confirmation is on, 'SIGNED_IN' event will fire in onAuthStateChange.
    // We set onboarding_completed in onAuthStateChange after user is confirmed/active.
    setLoading(false);
    return { error };
  };

  const logout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    // onAuthStateChange will handle clearing user, session
    return { error };
  };

  const completeOnboarding = async () => {
    console.log('[AuthContext] completeOnboarding called. Current user:', user?.id);
    if (!user) {
      console.error('[AuthContext] completeOnboarding: User not authenticated.');
      return { error: { name: 'AuthError', message: 'User not authenticated' } as AuthError };
    }
    setLoading(true);
    console.log('[AuthContext] completeOnboarding: Attempting to update user metadata...');
    const { data: updatedUserData, error } = await supabase.auth.updateUser({
      data: { onboarding_completed: true }
    });
    console.log('[AuthContext] completeOnboarding: supabase.auth.updateUser response. Error:', error, 'Updated User Data:', updatedUserData);
    if (error) {
      setLoading(false);
      return { error };
    }
    if (updatedUserData.user) {
      console.log('[AuthContext] completeOnboarding: User metadata updated successfully. New user object:', updatedUserData.user);
      setUser(updatedUserData.user); // Update user with new metadata
      setOnboardingCompleted(true);
      localStorage.setItem('orbitOnboardingCompleted', 'true');
      console.log('[AuthContext] completeOnboarding: Local state updated. onboardingCompleted:', true);
    } else if (error) {
      console.error('[AuthContext] completeOnboarding: Failed to update user metadata. Error:', error);
    } else {
      console.warn('[AuthContext] completeOnboarding: supabase.auth.updateUser returned no error but also no user data.');
    }
    setLoading(false);
    return { error: null };
  };

  const isAuthenticated = !!user && !!session; // User and session must exist

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      onboardingCompleted,
      loading,
      login,
      signup,
      logout,
      completeOnboarding
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
