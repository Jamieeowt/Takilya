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
import { Film, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { haptics } from '@/lib/haptics';
import { radius, spacing, typography } from '@/lib/theme';
import { useAuth } from '@/features/auth/AuthContext';
import { loginSchema } from '@/features/auth/validation';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
      haptics.warning();
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

    haptics.light();

    // 2. Supabase Auth Sign In
    const { error } = await signIn(email, password);
    if (error) {
      haptics.error();
      setAuthError(error);
      return;
    }

    haptics.success();
    // Router navigation guard in app/_layout.tsx will automatically route to /(tabs)
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top + 24, 48) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <View style={styles.logoBadge}>
            <Film size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Takilya</Text>
          <Text style={styles.subtitle}>
            Sign in to discover Philippine cinema, rate films, and curate your personal canon.
          </Text>
        </View>

        {/* Auth Error Banner */}
        {authError && (
          <View style={styles.errorBanner}>
            <AlertCircle size={16} color="#FFFFFF" />
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
              <Mail
                size={18}
                color={fieldErrors.email ? '#FFFFFF' : '#8A8A8A'}
              />
              <TextInput
                accessibilityLabel="Email address"
                style={styles.input}
                placeholder="cinephile@example.ph"
                placeholderTextColor="#8A8A8A"
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
              <Lock
                size={18}
                color={fieldErrors.password ? '#FFFFFF' : '#8A8A8A'}
              />
              <TextInput
                accessibilityLabel="Password"
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#8A8A8A"
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
                {showPassword ? (
                  <EyeOff size={18} color="#8A8A8A" />
                ) : (
                  <Eye size={18} color="#8A8A8A" />
                )}
              </Pressable>
            </View>
            {fieldErrors.password && (
              <Text style={styles.fieldErrorText}>{fieldErrors.password}</Text>
            )}
          </View>

          {/* Sign In Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign in with email and password"
            onPress={handleLogin}
            disabled={isLoading}
            style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}>
            {isLoading ? (
              <ActivityIndicator color="#000000" size="small" />
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
    backgroundColor: '#000000',
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  brandHeader: {
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: '#141414',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.title,
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  subtitle: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 18,
    color: '#8A8A8A',
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.md,
    gap: spacing.sm,
  },
  errorBannerText: {
    flex: 1,
    color: '#D4D4D4',
    fontSize: 13,
    fontWeight: '500',
  },
  form: {
    gap: spacing.md,
  },
  inputGroup: {
    gap: 6,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D4D4D4',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  forgotPasswordText: {
    fontSize: 12,
    color: '#8A8A8A',
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
    borderRadius: radius.sm,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    gap: spacing.sm,
  },
  inputWrapperError: {
    borderColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    paddingVertical: spacing.sm,
  },
  eyeBtn: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldErrorText: {
    fontSize: 11,
    color: '#D4D4D4',
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.full,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
  },
  footerText: {
    color: '#8A8A8A',
    fontSize: 13,
  },
  linkButton: {
    minHeight: 44,
    justifyContent: 'center',
  },
  linkButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
