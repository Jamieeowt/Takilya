import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';
import { AuthContextValue, Profile } from './types';
import { UserRole } from '@/features/films/types';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch or refresh user's profile from profiles table
  const fetchProfile = async (userId: string, currentUser?: User | null) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) {
        // Fallback: construct safe default user profile from auth user metadata
        const activeUser = currentUser || user;
        if (activeUser) {
          const fallbackProfile: Profile = {
            id: userId,
            username: activeUser.user_metadata?.username || `user_${userId.slice(0, 8)}`,
            display_name: activeUser.user_metadata?.display_name || activeUser.user_metadata?.full_name || 'Cinephile',
            avatar_url: activeUser.user_metadata?.avatar_url || null,
            bio: activeUser.user_metadata?.bio || null,
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

  // Helper to handle incoming deep links (e.g. from GitHub email confirmation: takilya://)
  const handleDeepLinkUrl = async (url: string | null) => {
    if (!url) return;

    try {
      // 1. Check for token in hash fragment (#access_token=...&refresh_token=...)
      if (url.includes('#')) {
        const hash = url.split('#')[1];
        const params = new URLSearchParams(hash);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        if (access_token && refresh_token) {
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (!error && data.session) {
            setSession(data.session);
            setUser(data.session.user);
            await fetchProfile(data.session.user.id, data.session.user);
            return;
          }
        }
      }

      // 2. Check for PKCE code in query (?code=...)
      if (url.includes('code=')) {
        const query = url.split('?')[1] || '';
        const params = new URLSearchParams(query);
        const code = params.get('code');

        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error && data.session) {
            setSession(data.session);
            setUser(data.session.user);
            await fetchProfile(data.session.user.id, data.session.user);
            return;
          }
        }
      }

      // 3. User returned from GitHub confirmation page (takilya://) -> re-verify active session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        await fetchProfile(currentSession.user.id, currentSession.user);
      }
    } catch (err) {
      console.warn('[Takilya Auth] Deep link session exchange error:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // 1. Get initial session from secure store
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!isMounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          void fetchProfile(session.user.id, session.user);
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
        await fetchProfile(newSession.user.id, newSession.user);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    // 3. Listen to incoming deep links (takilya://)
    Linking.getInitialURL()
      .then((initialUrl) => {
        if (initialUrl && isMounted) {
          void handleDeepLinkUrl(initialUrl);
        }
      })
      .catch(() => {});

    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      if (isMounted) {
        void handleDeepLinkUrl(url);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      linkingSubscription.remove();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data?.session) {
        setSession(data.session);
        setUser(data.session.user);
        await fetchProfile(data.session.user.id, data.session.user);
      }

      return { error: null };
    } catch (err: any) {
      return { error: err?.message || 'An unexpected error occurred during login. Please try again.' };
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
          emailRedirectTo: 'https://jamieeowt.github.io/takilya-confirmed/',
          data: {
            username: username.trim().toLowerCase(),
            display_name: displayName.trim(),
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      // If user was created, insert fallback profile in case trigger hasn't fired yet
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
          // Ignore if handled by database trigger
        }
      }

      return { error: null };
    } catch (err: any) {
      return { error: err?.message || 'An unexpected error occurred during sign up. Please try again.' };
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
      return { error: err?.message || 'Error signing out. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'https://jamieeowt.github.io/takilya-confirmed/',
      });

      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } catch (err: any) {
      return { error: err?.message || 'Error sending password reset email. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user);
    }
  };

  const refreshSession = async () => {
    try {
      const { data: { session: refreshedSession } } = await supabase.auth.getSession();
      if (refreshedSession) {
        setSession(refreshedSession);
        setUser(refreshedSession.user);
        await fetchProfile(refreshedSession.user.id, refreshedSession.user);
      }
    } catch (err) {
      console.warn('[Takilya Auth] refreshSession error:', err);
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
      refreshSession,
    }),
    [session, user, profile, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useSession() {
  const { session, user, isLoading, isAuthenticated } = useAuth();
  return {
    session,
    user,
    isLoading,
    isAuthenticated,
  };
}

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
