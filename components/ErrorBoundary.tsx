import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import { haptics } from '@/lib/haptics';
import { radius, spacing, typography } from '@/lib/theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Takilya ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleReset = () => {
    haptics.medium();
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.iconCircle}>
              <AlertTriangle size={32} color="#FFFFFF" />
            </View>

            <Text style={styles.title}>Something Went Wrong</Text>
            <Text style={styles.description}>
              An unexpected glitch occurred while rendering. Your offline diary, watchlist, and queued logs are preserved.
            </Text>

            {this.state.error?.message ? (
              <View style={styles.errorDetailsBox}>
                <Text style={styles.errorMessage} numberOfLines={3}>
                  {this.state.error.message}
                </Text>
              </View>
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Reload application screen"
              onPress={this.handleReset}
              style={styles.retryBtn}>
              <RefreshCw size={16} color="#000000" />
              <Text style={styles.retryText}>Reload Screen</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  content: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radius.cardLarge,
    padding: spacing.xl,
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.title,
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 18,
    color: '#8A8A8A',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  errorDetailsBox: {
    width: '100%',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.lg,
  },
  errorMessage: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#D4D4D4',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.full,
    paddingHorizontal: spacing.xl,
    minHeight: 46,
    justifyContent: 'center',
  },
  retryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
  },
});

