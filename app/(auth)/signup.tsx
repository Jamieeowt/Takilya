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
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Check,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { haptics } from '@/lib/haptics';
import { useAuth } from '@/features/auth/AuthContext';
import { signupSchema } from '@/features/auth/validation';

export default function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signUp, isLoading } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSuccessConfirmation, setIsSuccessConfirmation] = useState(false);

  const handleBack = () => {
    haptics.light();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/welcome' as any);
    }
  };

  const handleSignup = async () => {
    setAuthError(null);
    setFieldErrors({});

    if (!agreedToTerms) {
      haptics.warning();
      setFieldErrors({ terms: 'Please agree to the Terms and Content Policy to continue.' });
      return;
    }

    // 1. Zod Form Validation
    const validationResult = signupSchema.safeParse({
      username,
      displayName,
      email,
      password,
      confirmPassword: password, // auto-matches password
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
          {
            paddingTop: Math.max(insets.top + 40, 60),
            paddingBottom: Math.max(insets.bottom + 24, 40),
          },
        ]}>
        <StatusBar style="light" />
        <View style={styles.confirmCard}>
          <View style={styles.confirmIconBadge}>
            <CheckCircle2 size={36} color="#FFFFFF" />
          </View>

          <Text style={styles.confirmTitle}>Check your inbox</Text>

          <Text style={styles.confirmText}>
            We've sent a verification link to{' '}
            <Text style={styles.emailHighlight}>{email}</Text>.
          </Text>

          <Text style={styles.confirmSubtitle}>
            Tap the link in your email to confirm your account and start discovering Philippine cinema.
          </Text>

          <View style={styles.confirmActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Proceed to Sign In"
              onPress={() => router.replace('/(auth)/login' as any)}
              style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Proceed to sign in</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Change email or edit details"
              onPress={() => setIsSuccessConfirmation(false)}
              style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>Edit details</Text>
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
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top + 16, 50),
            paddingBottom: Math.max(insets.bottom + 24, 40),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* 44px Back Chevron Button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to welcome"
          onPress={handleBack}
          hitSlop={8}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.buttonPressed,
          ]}>
          <ChevronLeft size={24} color="#FFFFFF" strokeWidth={2} />
        </Pressable>

        {/* Heading */}
        <View style={styles.headingBlock}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Free to join. Takes under a minute.</Text>
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
            <Text style={styles.label}>Display name</Text>
            <View
              style={[
                styles.inputWrapper,
                fieldErrors.displayName && styles.inputWrapperError,
              ]}>
              <TextInput
                accessibilityLabel="Display Name"
                style={styles.input}
                placeholder="Juan dela Cruz"
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
              <TextInput
                accessibilityLabel="Username"
                style={styles.input}
                placeholder="juandelacruz"
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
            <Text style={styles.label}>Email</Text>
            <View
              style={[
                styles.inputWrapper,
                fieldErrors.email && styles.inputWrapperError,
              ]}>
              <TextInput
                accessibilityLabel="Email address"
                style={styles.input}
                placeholder="you@example.com"
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
              <TextInput
                accessibilityLabel="Password"
                style={styles.input}
                placeholder="At least 8 characters"
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

          {/* Terms Agreement Checkbox (Min 44px tap target) */}
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: agreedToTerms }}
            accessibilityLabel="I agree to the Terms and Content Policy"
            onPress={() => {
              haptics.selection();
              setAgreedToTerms((prev) => !prev);
              if (fieldErrors.terms) {
                setFieldErrors((prev) => ({ ...prev, terms: undefined }));
              }
            }}
            style={styles.termsRow}>
            <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
              {agreedToTerms && <Check size={14} color="#000000" strokeWidth={3} />}
            </View>
            <Text style={styles.termsLabel}>
              I agree to the{' '}
              <Text
                style={styles.termsLink}
                onPress={() => router.push('/legal/terms' as any)}>
                Terms and Content Policy
              </Text>.
            </Text>
          </Pressable>
          {fieldErrors.terms && (
            <Text style={styles.fieldErrorText}>{fieldErrors.terms}</Text>
          )}

          {/* Create Account Primary Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create account"
            onPress={handleSignup}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.primaryButton,
              isLoading && styles.primaryButtonDisabled,
              pressed && !isLoading && styles.buttonPressed,
            ]}>
            {isLoading ? (
              <ActivityIndicator color="#000000" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Create account</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.spacer} />

        {/* Footer Navigation */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Navigate to sign in"
            hitSlop={8}
            onPress={() => router.push('/(auth)/login' as any)}
            style={styles.linkButton}>
            <Text style={styles.linkButtonText}>Sign in</Text>
          </Pressable>
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
    flexGrow: 1,
    paddingHorizontal: 28,
    gap: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginLeft: -10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingBlock: {
    gap: 10,
  },
  title: {
    fontFamily: Platform.select({
      ios: 'Inter-ExtraBold',
      android: 'Inter_800ExtraBold',
      default: 'System',
    }),
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 38,
    color: '#FFFFFF',
  },
  subtitle: {
    fontFamily: Platform.select({
      ios: 'Inter-Regular',
      android: 'Inter_400Regular',
      default: 'System',
    }),
    fontSize: 15,
    lineHeight: 22,
    color: '#A3A3A3',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  errorBannerText: {
    flex: 1,
    color: '#D4D4D4',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  form: {
    gap: 12,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontFamily: Platform.select({
      ios: 'Inter-SemiBold',
      android: 'Inter_600SemiBold',
      default: 'System',
    }),
    fontSize: 13,
    fontWeight: '600',
    color: '#A3A3A3',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderRadius: 14,
    borderColor: '#2E2E2E',
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 50,
  },
  inputWrapperError: {
    borderColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: Platform.select({
      ios: 'Inter-Regular',
      android: 'Inter_400Regular',
      default: 'System',
    }),
    fontSize: 16,
    paddingVertical: 0,
  },
  eyeBtn: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 44,
    paddingVertical: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#5C5C5C',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  termsLabel: {
    flex: 1,
    fontFamily: Platform.select({
      ios: 'Inter-Regular',
      android: 'Inter_400Regular',
      default: 'System',
    }),
    fontSize: 13,
    lineHeight: 18,
    color: '#A3A3A3',
  },
  termsLink: {
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
  fieldErrorText: {
    fontSize: 12,
    color: '#D4D4D4',
    fontWeight: '500',
    marginTop: 2,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 27,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontFamily: Platform.select({
      ios: 'Inter-Bold',
      android: 'Inter_700Bold',
      default: 'System',
    }),
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  spacer: {
    flexGrow: 1,
    minHeight: 16,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  footerText: {
    fontFamily: Platform.select({
      ios: 'Inter-Regular',
      android: 'Inter_400Regular',
      default: 'System',
    }),
    color: '#A3A3A3',
    fontSize: 14,
  },
  linkButton: {
    minHeight: 44,
    justifyContent: 'center',
  },
  linkButtonText: {
    fontFamily: Platform.select({
      ios: 'Inter-Bold',
      android: 'Inter_700Bold',
      default: 'System',
    }),
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  confirmationContainer: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 28,
    justifyContent: 'center',
  },
  confirmCard: {
    backgroundColor: '#141414',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2E2E2E',
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  confirmIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1F1F1F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmTitle: {
    fontFamily: Platform.select({
      ios: 'Inter-Bold',
      android: 'Inter_700Bold',
      default: 'System',
    }),
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  confirmText: {
    fontFamily: Platform.select({
      ios: 'Inter-Regular',
      android: 'Inter_400Regular',
      default: 'System',
    }),
    fontSize: 15,
    lineHeight: 22,
    color: '#D4D4D4',
    textAlign: 'center',
  },
  emailHighlight: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  confirmSubtitle: {
    fontFamily: Platform.select({
      ios: 'Inter-Regular',
      android: 'Inter_400Regular',
      default: 'System',
    }),
    fontSize: 13,
    lineHeight: 18,
    color: '#8A8A8A',
    textAlign: 'center',
  },
  confirmActions: {
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  secondaryBtn: {
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#5C5C5C',
  },
  secondaryBtnText: {
    fontFamily: Platform.select({
      ios: 'Inter-SemiBold',
      android: 'Inter_600SemiBold',
      default: 'System',
    }),
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
