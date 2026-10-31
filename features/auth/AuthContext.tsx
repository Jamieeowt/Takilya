import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AuthContextValue, Profile } from './types';
import { UserRole } from '@/features/films/types';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch or refresh the user's profile from the database
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Fallback: construct safe default user profile from auth user metadata
        if (user) {
          const fallbackProfile: Profile = {
            id: userId,
            username: user.user_metadata?.username || `user_${userId.slice(0, 8)}`,
            display_name: user.user_metadata?.display_name || 'Cinephile',
            avatar_url: user.user_metadata?.avatar_url || null,
            bio: user.user_metadata?.bio || null,
            role: 'user',
            verification_status: 'unverified',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setProfile(fallbackProfile);
        }
        return;
      }

      setProfile(data as Profile);
    } catch (err) {
      console.warn('[Takilya Auth] Failed to fetch user profile:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // 1. Get initial session from expo-secure-store via Supabase
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!isMounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        }
      })
      .catch((err) => {
        console.warn('[Takilya Auth] Error getting initial session:', err);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    // 2. Listen to Auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        await fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'An unexpected error occurred during login.' };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    username: string,
    displayName: string
  ) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            username: username.trim().toLowerCase(),
            display_name: displayName.trim(),
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      // If user was created, ensure profile exists (trigger fallback)
      if (data?.user) {
        try {
          await supabase.from('profiles').upsert(
            {
              id: data.user.id,
              username: username.trim().toLowerCase(),
              display_name: displayName.trim(),
              role: 'user',
              verification_status: 'unverified',
            },
            { onConflict: 'id' }
          );
        } catch {
          // If trigger already handled it, ignore conflict
        }
      }

      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'An unexpected error occurred during sign up.' };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Error signing out.' };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'takilya://auth/reset-password',
      });

      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Error sending password reset email.' };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const value: AuthContextValue = useMemo(
    () => ({
      session,
      user,
      profile,
      role: profile?.role ?? 'user',
      isLoading,
      isAuthenticated: Boolean(session),
      signIn,
      signUp,
      signOut,
      resetPassword,
      refreshProfile,
    }),
    [session, user, profile, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Access the core Auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook to access current session, user & authentication state
 */
export function useSession() {
  const { session, user, isLoading, isAuthenticated } = useAuth();
  return {
    session,
    user,
    isLoading,
    isAuthenticated,
  };
}

/**
 * Role-aware helper returning the active user role ('user', 'critic', 'verified_official', 'admin')
 * along with convenient predicate flags.
 */
export function useRole(): {
  role: UserRole;
  isUser: boolean;
  isCritic: boolean;
  isVerifiedOfficial: boolean;
  isAdmin: boolean;
} {
  const { role } = useAuth();
  return {
    role,
    isUser: role === 'user',
    isCritic: role === 'critic',
    isVerifiedOfficial: role === 'verified_official',
    isAdmin: role === 'admin',
  };
}

