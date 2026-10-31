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
import {
  Film,
  Mail,
  Lock,
  User,
  AtSign,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { haptics } from '@/lib/haptics';
import { radius, spacing, typography } from '@/lib/theme';
import { useAuth } from '@/features/auth/AuthContext';
import { signupSchema } from '@/features/auth/validation';

export default function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signUp, isLoading } = useAuth();

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSuccessConfirmation, setIsSuccessConfirmation] = useState(false);

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
      haptics.warning();
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

    haptics.light();

    // 2. Supabase Auth Sign Up
    const { error } = await signUp(email, password, username, displayName);
    if (error) {
      haptics.error();
      setAuthError(error);
      return;
    }

    haptics.success();
    // Show visual confirmation prompt to check inbox
    setIsSuccessConfirmation(true);
  };

  // Confirmation view displayed when user needs to verify their email
  if (isSuccessConfirmation) {
    return (
      <View
        style={[
          styles.confirmationContainer,
          { paddingTop: Math.max(insets.top + 40, 60) },
        ]}>
        <View style={styles.confirmCard}>
          <View style={styles.confirmIconBadge}>
            <CheckCircle2 size={36} color="#FFFFFF" />
          </View>

          <Text style={styles.confirmTitle}>Check Your Inbox</Text>

          <Text style={styles.confirmText}>
            We've sent a verification link to{' '}
            <Text style={styles.emailHighlight}>{email}</Text>.
          </Text>

          <Text style={styles.confirmSubtitle}>
            Tap the link in your email to confirm your account. When the confirmation page opens, tap{' '}
            <Text style={styles.boldText}>"Open Takilya App"</Text> to return here automatically.
          </Text>

          <View style={styles.confirmActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Proceed to Sign In"
              onPress={() => router.replace('/(auth)/login')}
              style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Proceed to Sign In</Text>
              <ArrowRight size={16} color="#000000" />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Change email or edit details"
              onPress={() => setIsSuccessConfirmation(false)}
              style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>Edit Details</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

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
          <Text style={styles.title}>Join Takilya</Text>
          <Text style={styles.subtitle}>
            Connect with Philippine cinema. Track festivals, rate films, and write reviews.
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
          {/* Display Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Display Name</Text>
            <View
              style={[
                styles.inputWrapper,
                fieldErrors.displayName && styles.inputWrapperError,
              ]}>
              <User
                size={18}
                color={fieldErrors.displayName ? '#FFFFFF' : '#8A8A8A'}
              />
              <TextInput
                accessibilityLabel="Display Name"
                style={styles.input}
                placeholder="Jaime Gerolaga"
                placeholderTextColor="#8A8A8A"
                value={displayName}
                onChangeText={(text) => {
                  setDisplayName(text);
                  if (fieldErrors.displayName) {
                    setFieldErrors((prev) => ({ ...prev, displayName: undefined }));
                  }
                }}
                editable={!isLoading}
              />
            </View>
            {fieldErrors.displayName && (
              <Text style={styles.fieldErrorText}>{fieldErrors.displayName}</Text>
            )}
          </View>

          {/* Username */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <View
              style={[
                styles.inputWrapper,
                fieldErrors.username && styles.inputWrapperError,
              ]}>
              <AtSign
                size={18}
                color={fieldErrors.username ? '#FFFFFF' : '#8A8A8A'}
              />
              <TextInput
                accessibilityLabel="Username"
                style={styles.input}
                placeholder="cinephile_ph"
                placeholderTextColor="#8A8A8A"
                value={username}
                onChangeText={(text) => {
                  setUsername(text.toLowerCase());
                  if (fieldErrors.username) {
                    setFieldErrors((prev) => ({ ...prev, username: undefined }));
                  }
                }}
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
            {fieldErrors.username && (
              <Text style={styles.fieldErrorText}>{fieldErrors.username}</Text>
            )}
          </View>

          {/* Email */}
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
                placeholder="name@example.com"
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

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
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
                placeholder="At least 6 characters"
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

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View
              style={[
                styles.inputWrapper,
                fieldErrors.confirmPassword && styles.inputWrapperError,
              ]}>
              <Lock
                size={18}
                color={fieldErrors.confirmPassword ? '#FFFFFF' : '#8A8A8A'}
              />
              <TextInput
                accessibilityLabel="Confirm Password"
                style={styles.input}
                placeholder="Re-enter password"
                placeholderTextColor="#8A8A8A"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (fieldErrors.confirmPassword) {
                    setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
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

          {/* Sign Up Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create Takilya Account"
            onPress={handleSignup}
            disabled={isLoading}
            style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}>
            {isLoading ? (
              <ActivityIndicator color="#000000" size="small" />
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
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D4D4D4',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
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
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.full,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
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
  // Confirmation state styles
  confirmationContainer: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radius.cardLarge,
    padding: spacing.xl,
    alignItems: 'center',
  },
  confirmIconBadge: {
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
  confirmTitle: {
    ...typography.title,
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  confirmText: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 20,
    color: '#D4D4D4',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emailHighlight: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  confirmSubtitle: {
    ...typography.caption,
    fontSize: 12,
    lineHeight: 18,
    color: '#8A8A8A',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  boldText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  confirmActions: {
    width: '100%',
    gap: spacing.sm,
  },
  secondaryBtn: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A8A8A',
  },
});
