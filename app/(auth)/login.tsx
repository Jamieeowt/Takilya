import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/lib/theme';
import { useAuth } from '@/features/auth/AuthContext';
import { loginSchema } from '@/features/auth/validation';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [authError, setAuthError] = useState<string | null>(null);

  const handleLogin = async () => {
    setAuthError(null);
    setFieldErrors({});

    // 1. Zod Form Validation
    const validationResult = loginSchema.safeParse({ email, password });
    if (!validationResult.success) {
      const errors: { email?: string; password?: string } = {};
      for (const issue of validationResult.error.issues) {
        const field = issue.path[0] as 'email' | 'password';
        if (field && !errors[field]) {
          errors[field] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    // 2. Supabase Auth Sign In
    const { error } = await signIn(email, password);
    if (error) {
      setAuthError(error);
      return;
    }

    // Success -> navigate to account or feed
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/account');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <View style={styles.logoBadge}>
            <Ionicons name="film" size={32} color={colors.gold.primary} />
          </View>
          <Text style={styles.title}>Welcome to Takilya</Text>
          <Text style={styles.subtitle}>
            Sign in to rate films, write reviews, and curate your personal canon.
          </Text>
        </View>

        {/* Auth Error Banner */}
        {authError && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color={colors.status.error} />
            <Text style={styles.errorBannerText}>{authError}</Text>
          </View>
        )}

        {/* Form Container */}
        <View style={styles.form}>
          {/* Email Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View
              style={[
                styles.inputWrapper,
                fieldErrors.email && styles.inputWrapperError,
              ]}>
              <Ionicons
                name="mail-outline"
                size={18}
                color={fieldErrors.email ? colors.status.error : colors.text.tertiary}
              />
              <TextInput
                accessibilityLabel="Email address"
                style={styles.input}
                placeholder="name@example.com"
                placeholderTextColor={colors.text.tertiary}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                editable={!isLoading}
              />
            </View>
            {fieldErrors.email && (
              <Text style={styles.fieldErrorText}>{fieldErrors.email}</Text>
            )}
          </View>

          {/* Password Field */}
          <View style={styles.inputGroup}>
            <View style={styles.passwordLabelRow}>
              <Text style={styles.label}>Password</Text>
              <Link href={"/(auth)/forgot-password" as any} asChild>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Forgot your password?"
                  hitSlop={8}>
                  <Text style={styles.forgotPasswordText}>Forgot?</Text>
                </Pressable>
              </Link>
            </View>
            <View
              style={[
                styles.inputWrapper,
                fieldErrors.password && styles.inputWrapperError,
              ]}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={fieldErrors.password ? colors.status.error : colors.text.tertiary}
              />
              <TextInput
                accessibilityLabel="Password"
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.text.tertiary}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!isLoading}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                onPress={() => setShowPassword((prev) => !prev)}
                hitSlop={8}
                style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={colors.text.tertiary}
                />
              </Pressable>
            </View>
            {fieldErrors.password && (
              <Text style={styles.fieldErrorText}>{fieldErrors.password}</Text>
            )}
          </View>

          {/* Sign In Button (min 44px tap target) */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign in with email and password"
            onPress={handleLogin}
            disabled={isLoading}
            style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}>
            {isLoading ? (
              <ActivityIndicator color={colors.text.inverse} size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Sign In</Text>
            )}
          </Pressable>
        </View>

        {/* Footer Navigation */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>New to Takilya?</Text>
          <Link href={"/(auth)/signup" as any} asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Navigate to create account"
              style={styles.linkButton}>
              <Text style={styles.linkButtonText}>Create Account</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    gap: spacing.xl,
  },
  brandHeader: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    backgroundColor: colors.gold.subtle,
    borderColor: colors.gold.subtleBorder,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.titleLarge,
    color: colors.text.primary,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: colors.status.error,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.md,
    gap: spacing.sm,
  },
  errorBannerText: {
    flex: 1,
    color: colors.status.error,
    fontSize: 13,
    fontWeight: '500',
  },
  form: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
    letterSpacing: 0.2,
  },
  forgotPasswordText: {
    fontSize: 12,
    color: colors.gold.primary,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: radius.sm,
    borderColor: colors.border.default,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    gap: spacing.sm,
  },
  inputWrapperError: {
    borderColor: colors.status.error,
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 14,
    paddingVertical: spacing.sm,
  },
  eyeBtn: {
    minWidth: 32,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldErrorText: {
    fontSize: 12,
    color: colors.status.error,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: colors.gold.primary,
    borderRadius: radius.xs,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
    elevation: 2,
    shadowColor: colors.gold.primary,
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: colors.text.inverse,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.md,
  },
  footerText: {
    color: colors.text.secondary,
    fontSize: 13,
  },
  linkButton: {
    minHeight: 44,
    justifyContent: 'center',
  },
  linkButtonText: {
    color: colors.gold.primary,
    fontSize: 13,
    fontWeight: '700',
  },
});
