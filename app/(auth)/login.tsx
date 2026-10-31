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
import { ChevronLeft, Eye, EyeOff, AlertCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { haptics } from '@/lib/haptics';
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

  const handleBack = () => {
    haptics.light();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/welcome' as any);
    }
  };

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
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top + 16, 54),
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
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Sign in to keep watching, rating and discussing.
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

          {/* Password Field */}
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
                placeholder="Your password"
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

            {/* Forgot Password Link */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Forgot your password?"
              onPress={() => router.push('/(auth)/forgot-password' as any)}
              hitSlop={8}
              style={styles.forgotBtn}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </Pressable>
          </View>

          {/* Sign In Primary Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign in"
            onPress={handleLogin}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.primaryButton,
              isLoading && styles.primaryButtonDisabled,
              pressed && !isLoading && styles.buttonPressed,
            ]}>
            {isLoading ? (
              <ActivityIndicator color="#000000" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Sign in</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.spacer} />

        {/* Footer Navigation */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>New to takilya? </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Navigate to create account"
            hitSlop={8}
            onPress={() => router.push('/(auth)/signup' as any)}
            style={styles.linkButton}>
            <Text style={styles.linkButtonText}>Create account</Text>
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
    gap: 28,
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
    gap: 18,
  },
  inputGroup: {
    gap: 8,
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
    height: 54,
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
  forgotBtn: {
    alignSelf: 'flex-end',
    minHeight: 32,
    justifyContent: 'center',
    marginTop: 2,
  },
  forgotPasswordText: {
    fontFamily: Platform.select({
      ios: 'Inter-SemiBold',
      android: 'Inter_600SemiBold',
      default: 'System',
    }),
    fontSize: 14,
    fontWeight: '600',
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
    minHeight: 20,
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
});
