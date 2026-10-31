import React, { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { queryClient } from '@/lib/queryClient';
import { TakilyaNavigationTheme } from '@/lib/theme';
import { AuthProvider } from '@/features/auth/AuthContext';
import { ErrorBoundary as TakilyaErrorBoundary } from '@/components/ErrorBoundary';
import { OfflineBanner } from '@/components/ui/OfflineBanner';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

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
                  name="modal"
                  options={{
                    presentation: 'modal',
                    title: 'Takilya Info',
                  }}
                />
              </Stack>
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </TakilyaErrorBoundary>
    </GestureHandlerRootView>
  );
}
