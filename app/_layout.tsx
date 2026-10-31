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
import { TakilyaNavigationTheme } from '@/lib/theme';
import { AuthProvider, useAuth } from '@/features/auth/AuthContext';
import { ErrorBoundary as TakilyaErrorBoundary } from '@/components/ErrorBoundary';
import { OfflineBanner } from '@/components/ui/OfflineBanner';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

function RootNavigationLayout() {
  const { isAuthenticated, isLoading } = useAuth();
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <ThemeProvider value={TakilyaNavigationTheme}>
      <StatusBar style="light" />
      <OfflineBanner />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: TakilyaNavigationTheme.colors.card,
          },
          headerTintColor: TakilyaNavigationTheme.colors.primary,
          headerTitleStyle: {
            color: TakilyaNavigationTheme.colors.text,
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
          <AuthProvider>
            <RootNavigationLayout />
          </AuthProvider>
        </QueryClientProvider>
      </TakilyaErrorBoundary>
    </GestureHandlerRootView>
  );
}