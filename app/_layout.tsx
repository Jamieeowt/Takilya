import React, { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator } from 'react-native';
import 'react-native-reanimated';

import { queryClient } from '@/lib/queryClient';
import {
  TakilyaNavigationTheme,
  ThemeProvider as TakilyaThemeProvider,
  useTheme,
} from '@/lib/theme';
import { AuthProvider, useAuth } from '@/features/auth/AuthContext';
import { ErrorBoundary as TakilyaErrorBoundary } from '@/components/ErrorBoundary';
import { OfflineBanner } from '@/components/ui/OfflineBanner';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const NavDarkTheme = {
  dark: true,
  colors: {
    primary: '#FFFFFF',
    background: '#000000',
    card: '#0A0A0A',
    text: '#FFFFFF',
    border: 'rgba(255, 255, 255, 0.12)',
    notification: '#FFFFFF',
  },
  fonts: TakilyaNavigationTheme.fonts,
};

const NavLightTheme = {
  dark: false,
  colors: {
    primary: '#000000',
    background: '#FFFFFF',
    card: '#F5F5F5',
    text: '#000000',
    border: 'rgba(0, 0, 0, 0.12)',
    notification: '#000000',
  },
  fonts: TakilyaNavigationTheme.fonts,
};

function RootNavigationLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isDark } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const group = segments[0] as string | undefined;
    const subRoute = segments[1] as string | undefined;

    const inAuthGroup = group === '(auth)';
    const isProtectedScreen =
      (group === '(tabs)' && (subRoute === 'account' || subRoute === 'profile')) ||
      (group === 'film' && subRoute === 'log-modal');

    if (!isAuthenticated && isProtectedScreen) {
      // Prompt 1.4: Guard Account and logging/reviewing so guests are routed cleanly to login,
      // while Feed, Search, and Explore remain publicly viewable without requiring authentication.
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // User is authenticated but currently on auth screens -> redirect cleanly to main tabs
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#000000' : '#FFFFFF' }}>
        <ActivityIndicator size="large" color={isDark ? '#ffffff' : '#000000'} />
      </View>
    );
  }

  const activeNavTheme = isDark ? NavDarkTheme : NavLightTheme;

  return (
    <ThemeProvider value={activeNavTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <OfflineBanner />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: activeNavTheme.colors.card,
          },
          headerTintColor: activeNavTheme.colors.primary,
          headerTitleStyle: {
            color: activeNavTheme.colors.text,
          },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen
          name="film/[id]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="user/[id]/index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="user/[id]/followers"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="user/[id]/following"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="festivals/index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="festival/[id]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="people/index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="person/[id]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="studios/index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="studio/[id]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="awards/index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="heritage/index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="watch/index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
            title: 'Takilya Info',
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TakilyaErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <TakilyaThemeProvider>
            <AuthProvider>
              <RootNavigationLayout />
            </AuthProvider>
          </TakilyaThemeProvider>
        </QueryClientProvider>
      </TakilyaErrorBoundary>
    </GestureHandlerRootView>
  );
}