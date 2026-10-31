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
import { KeyRound, Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { haptics } from '@/lib/haptics';
import { radius, spacing, typography } from '@/lib/theme';
import { useAuth } from '@/features/auth/AuthContext';
import { resetPasswordSchema } from '@/features/auth/validation';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { resetPassword, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleReset = async () => {
    setAuthError(null);
    setEmailError(null);
    setIsSuccess(false);

    // 1. Zod Validation
    const validationResult = resetPasswordSchema.safeParse({ email });
    if (!validationResult.success) {
      haptics.warning();
      setEmailError(validationResult.error.issues[0]?.message ?? 'Invalid email address');
      return;
    }

    haptics.light();

    // 2. Supabase Auth reset password
    const { error } = await resetPassword(email);
    if (error) {
      haptics.error();
      setAuthError(error);
      return;
    }

    haptics.success();
    setIsSuccess(true);
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
            <KeyRound size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter the email registered with your Takilya account and we will send you a reset link.
          </Text>
        </View>

        {/* Error Banner */}
        {authError && (
          <View style={styles.errorBanner}>
            <AlertCircle size={16} color="#FFFFFF" />
            <Text style={styles.errorBannerText}>{authError}</Text>
          </View>
        )}

        {/* Success Banner */}
        {isSuccess && (
          <View style={styles.successBanner}>
            <CheckCircle2 size={16} color="#FFFFFF" />
            <Text style={styles.successBannerText}>
              Password reset link sent! Check your inbox to set a new password.
            </Text>
          </View>
        )}

        {/* Form Container */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View
              style={[
                styles.inputWrapper,
                Boolean(emailError) && styles.inputWrapperError,
              ]}>
              <Mail
                size={18}
                color={emailError ? '#FFFFFF' : '#8A8A8A'}
              />
              <TextInput
                accessibilityLabel="Email Address"
                style={styles.input}
                placeholder="name@example.com"
                placeholderTextColor="#8A8A8A"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError(null);
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                editable={!isLoading}
              />
            </View>
            {emailError && (
              <Text style={styles.fieldErrorText}>{emailError}</Text>
            )}
          </View>

          {/* Submit Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send password reset link"
            onPress={handleReset}
            disabled={isLoading}
            style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}>
            {isLoading ? (
              <ActivityIndicator color="#000000" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Send Reset Link</Text>
            )}
          </Pressable>
        </View>

        {/* Back to Login Link */}
        <View style={styles.footerRow}>
          <Link href={"/(auth)/login" as any} asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back to sign in"
              style={styles.backButton}>
              <ArrowLeft size={16} color="#8A8A8A" />
              <Text style={styles.backButtonText}>Back to Sign In</Text>
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
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.md,
    gap: spacing.sm,
  },
  successBannerText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
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
    paddingVertical: spacing.sm,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#8A8A8A',
    fontSize: 13,
    fontWeight: '600',
  },
});
