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
import { signupSchema } from '@/features/auth/validation';

export default function SignupScreen() {
  const router = useRouter();
  const { signUp, isLoading } = useAuth();

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSignup = async () => {
    setAuthError(null);
    setFieldErrors({});

    // 1. Zod Form Validation
    const validationResult = signupSchema.safeParse({
      username,
      displayName,
      email,
      password,
      confirmPassword,
    });

    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      for (const issue of validationResult.error.issues) {
        const fieldName = String(issue.path[0]);
        if (fieldName && !errors[fieldName]) {
          errors[fieldName] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    // 2. Supabase Auth Sign Up
    // Automatically creates profiles row with role='user' via DB trigger on auth.users
    const { error } = await signUp(email, password, username, displayName);
    if (error) {
      setAuthError(error);
      return;
    }

    // Success -> Navigate to account
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
            <Ionicons name="film" size={28} color={colors.gold.primary} />
          </View>
          <Text style={styles.title}>Join Takilya</Text>
          <Text style={styles.subtitle}>
            Connect with Philippine cinema. Follow festivals, track regional films, and share reviews.
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
          {/* Username Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <View
              style={[
                styles.inputWrapper,
                fieldErrors.username && styles.inputWrapperError,
              ]}>
              <Ionicons
                name="at-outline"
                size={18}
                color={fieldErrors.username ? colors.status.error : colors.text.tertiary}
              />
              <TextInput
                accessibilityLabel="Username"
                style={styles.input}
                placeholder="sinephile_ph"
                placeholderTextColor={colors.text.tertiary}
                value={username}
                onChangeText={(text) => {
                  setUsername(text.toLowerCase());
                  if (fieldErrors.username) {
                    setFieldErrors((prev) => ({ ...prev, username: '' }));
                  }
                }}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
            {fieldErrors.username ? (
              <Text style={styles.fieldErrorText}>{fieldErrors.username}</Text>
            ) : (
              <Text style={styles.helperText}>
                Letters, numbers, and underscores only. Min 3 characters.
              </Text>
            )}
          </View>

          {/* Display Name Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Display Name</Text>
            <View
              style={[
                styles.inputWrapper,
                fieldErrors.displayName && styles.inputWrapperError,
              ]}>
              <Ionicons
                name="person-outline"
                size={18}
                color={fieldErrors.displayName ? colors.status.error : colors.text.tertiary}
              />
              <TextInput
                accessibilityLabel="Display Name"
                style={styles.input}
                placeholder="Jaime Gerolaga"
                placeholderTextColor={colors.text.tertiary}
                value={displayName}
                onChangeText={(text) => {
                  setDisplayName(text);
                  if (fieldErrors.displayName) {
                    setFieldErrors((prev) => ({ ...prev, displayName: '' }));
                  }
                }}
                editable={!isLoading}
              />
            </View>
            {fieldErrors.displayName && (
              <Text style={styles.fieldErrorText}>{fieldErrors.displayName}</Text>
            )}
          </View>

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
                accessibilityLabel="Email Address"
                style={styles.input}
                placeholder="name@example.com"
                placeholderTextColor={colors.text.tertiary}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: '' }));
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
            <Text style={styles.label}>Password</Text>
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
                placeholder="At least 6 characters"
                placeholderTextColor={colors.text.tertiary}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: '' }));
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

          {/* Confirm Password Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View
              style={[
                styles.inputWrapper,
                fieldErrors.confirmPassword && styles.inputWrapperError,
              ]}>
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color={fieldErrors.confirmPassword ? colors.status.error : colors.text.tertiary}
              />
              <TextInput
                accessibilityLabel="Confirm Password"
                style={styles.input}
                placeholder="Re-enter password"
                placeholderTextColor={colors.text.tertiary}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (fieldErrors.confirmPassword) {
                    setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
            {fieldErrors.confirmPassword && (
              <Text style={styles.fieldErrorText}>{fieldErrors.confirmPassword}</Text>
            )}
          </View>

          {/* Sign Up Button (min 44px tap target) */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create your Takilya account"
            onPress={handleSignup}
            disabled={isLoading}
            style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}>
            {isLoading ? (
              <ActivityIndicator color={colors.text.inverse} size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Create Account</Text>
            )}
          </Pressable>
        </View>

        {/* Footer Navigation */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Link href={"/(auth)/login" as any} asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Navigate to sign in"
              style={styles.linkButton}>
              <Text style={styles.linkButtonText}>Sign In</Text>
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
    paddingTop: spacing.lg,
    gap: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  brandHeader: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  logoBadge: {
    width: 56,
    height: 56,
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
    paddingHorizontal: spacing.sm,
    fontSize: 13,
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
    gap: spacing.md,
  },
  inputGroup: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
    letterSpacing: 0.2,
  },
  helperText: {
    fontSize: 11,
    color: colors.text.tertiary,
    marginTop: 2,
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
    marginTop: 2,
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
