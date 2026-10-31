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
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/lib/theme';
import { useAuth } from '@/features/auth/AuthContext';
import { resetPasswordSchema } from '@/features/auth/validation';

export default function ForgotPasswordScreen() {
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
      setEmailError(validationResult.error.issues[0]?.message ?? 'Invalid email');
      return;
    }

    // 2. Supabase Auth reset password
    const { error } = await resetPassword(email);
    if (error) {
      setAuthError(error);
      return;
    }

    setIsSuccess(true);
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
            <Ionicons name="key-outline" size={28} color={colors.gold.primary} />
          </View>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter the email address registered with your Takilya account and we will send you
            instructions to reset your password.
          </Text>
        </View>

        {/* Error Banner */}
        {authError && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color={colors.status.error} />
            <Text style={styles.errorBannerText}>{authError}</Text>
          </View>
        )}

        {/* Success Banner */}
        {isSuccess && (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={18} color={colors.status.success} />
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
              <Ionicons
                name="mail-outline"
                size={18}
                color={emailError ? colors.status.error : colors.text.tertiary}
              />
              <TextInput
                accessibilityLabel="Email Address"
                style={styles.input}
                placeholder="name@example.com"
                placeholderTextColor={colors.text.tertiary}
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
            {emailError && <Text style={styles.fieldErrorText}>{emailError}</Text>}
          </View>

          {/* Submit Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send password reset link"
            onPress={handleReset}
            disabled={isLoading}
            style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}>
            {isLoading ? (
              <ActivityIndicator color={colors.text.inverse} size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Send Reset Link</Text>
            )}
          </Pressable>
        </View>

        {/* Footer Navigation */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Remember your password?</Text>
          <Link href={"/(auth)/login" as any} asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back to sign in"
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
    paddingHorizontal: spacing.sm,
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
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: colors.status.success,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.md,
    gap: spacing.sm,
  },
  successBannerText: {
    flex: 1,
    color: colors.status.success,
    fontSize: 13,
    fontWeight: '500',
  },
  form: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
    letterSpacing: 0.2,
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
