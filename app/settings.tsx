import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  Moon,
  Sun,
  ShieldCheck,
  Database,
  Info,
  LogOut,
  LogIn,
  Check,
  ChevronRight,
  Video,
  FileCheck,
  BarChart3,
  FileText,
  Lock,
  Sparkles,
} from 'lucide-react-native';

import { useAuth, useRole } from '@/features/auth';
import { useTheme } from '@/lib/theme';
import { GlassHeader } from '@/components/ui/GlassHeader';
import { Avatar } from '@/components/ui/Avatar';
import { OnboardingModal } from '@/components/onboarding';
import { radius, spacing, typography } from '@/lib/theme';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, profile, isAuthenticated, signOut } = useAuth();
  const { isVerifiedOfficial, isAdmin } = useRole();
  const { theme, isDark, setTheme, tokens } = useTheme();
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  const handleToggleTheme = (newMode: 'dark' | 'light') => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    setTheme(newMode);
  };

  const handleSignOut = () => {
    try {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}

    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your Takilya account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(tabs)');
            } catch (err: any) {
              Alert.alert('Sign Out Error', err?.message || 'Could not sign out.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: tokens.background.primary }]}>
      <GlassHeader
        title="Settings"
        left={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close settings"
            onPress={() => router.back()}
            style={styles.headerBtn}>
            <ArrowLeft size={20} color={tokens.text.primary} />
          </Pressable>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 48 }]}
        showsVerticalScrollIndicator={false}>
        {/* Account Info Section */}
        {isAuthenticated && profile ? (
          <View style={[styles.section, { backgroundColor: tokens.background.secondary, borderColor: tokens.border.hairline }]}>
            <View style={styles.accountRow}>
              <Avatar
                url={profile.avatar_url}
                name={profile.display_name}
                size={54}
                isVerified={profile.role === 'critic' || profile.role === 'verified_official' || profile.role === 'admin'}
              />
              <View style={styles.accountDetails}>
                <Text style={[styles.displayName, { color: tokens.text.primary }]}>
                  {profile.display_name}
                </Text>
                <Text style={[styles.handle, { color: tokens.text.tertiary }]}>
                  @{profile.username}
                </Text>
                {user?.email && (
                  <Text style={[styles.email, { color: tokens.text.tertiary }]}>
                    {user.email}
                  </Text>
                )}
              </View>
              <View style={styles.rolePill}>
                <ShieldCheck size={12} color="#FFFFFF" />
                <Text style={styles.roleText}>{profile.role.toUpperCase()}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={[styles.section, { backgroundColor: tokens.background.secondary, borderColor: tokens.border.hairline }]}>
            <Text style={[styles.guestHeading, { color: tokens.text.primary }]}>
              Guest Mode
            </Text>
            <Text style={[styles.guestDesc, { color: tokens.text.secondary }]}>
              Sign in to sync your film diary, watchlist, ratings, and polymorphic follows across devices.
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sign in to Takilya"
              onPress={() => router.push('/(auth)/login' as any)}
              style={styles.signInActionBtn}>
              <LogIn size={16} color="#000000" />
              <Text style={styles.signInActionText}>Sign In / Register</Text>
            </Pressable>
          </View>
        )}

        {/* Official & Verification Section */}
        {isAuthenticated && (
          <>
            <Text style={[styles.sectionHeaderTitle, { color: tokens.text.tertiary }]}>
              OFFICIAL & VERIFICATION
            </Text>

            <View
              style={[
                styles.section,
                { backgroundColor: tokens.background.secondary, borderColor: tokens.border.hairline },
              ]}>
              {/* Request Verification */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Official verification request"
                onPress={() => router.push('/verification/request' as any)}
                style={styles.menuRow}>
                <View style={styles.menuRowLeft}>
                  <ShieldCheck size={20} color={tokens.text.primary} />
                  <View style={styles.menuRowText}>
                    <Text style={[styles.settingTitle, { color: tokens.text.primary }]}>
                      Official Verification
                    </Text>
                    <Text style={[styles.settingSubtitle, { color: tokens.text.secondary }]}>
                      Request verified badges for Studios, Festivals, or Filmmakers.
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color={tokens.text.tertiary} />
              </Pressable>

              {/* Post Official Clip (if verified official or admin) */}
              {(isVerifiedOfficial || isAdmin) && (
                <>
                  <View style={[styles.divider, { backgroundColor: tokens.border.hairline }]} />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Post official clip"
                    onPress={() => router.push('/trailers/post' as any)}
                    style={styles.menuRow}>
                    <View style={styles.menuRowLeft}>
                      <Video size={20} color={tokens.text.primary} />
                      <View style={styles.menuRowText}>
                        <Text style={[styles.settingTitle, { color: tokens.text.primary }]}>
                          Post Official Clip
                        </Text>
                        <Text style={[styles.settingSubtitle, { color: tokens.text.secondary }]}>
                          Publish verified trailers, teasers, and official clips to the feed.
                        </Text>
                      </View>
                    </View>
                    <ChevronRight size={18} color={tokens.text.tertiary} />
                  </Pressable>
                </>
              )}

              {/* Admin Portal (if admin) */}
              {isAdmin && (
                <>
                  <View style={[styles.divider, { backgroundColor: tokens.border.hairline }]} />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Admin verification portal"
                    onPress={() => router.push('/admin/verification' as any)}
                    style={styles.menuRow}>
                    <View style={styles.menuRowLeft}>
                      <FileCheck size={20} color={tokens.text.primary} />
                      <View style={styles.menuRowText}>
                        <Text style={[styles.settingTitle, { color: tokens.text.primary }]}>
                          Admin Verification Portal
                        </Text>
                        <Text style={[styles.settingSubtitle, { color: tokens.text.secondary }]}>
                          Review and approve pending verification requests.
                        </Text>
                      </View>
                    </View>
                    <ChevronRight size={18} color={tokens.text.tertiary} />
                  </Pressable>

                  <View style={[styles.divider, { backgroundColor: tokens.border.hairline }]} />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Promoted trailer slots management"
                    onPress={() => router.push('/admin/promoted' as any)}
                    style={styles.menuRow}>
                    <View style={styles.menuRowLeft}>
                      <BarChart3 size={20} color={tokens.text.primary} />
                      <View style={styles.menuRowText}>
                        <Text style={[styles.settingTitle, { color: tokens.text.primary }]}>
                          Promoted Trailer Slots
                        </Text>
                        <Text style={[styles.settingSubtitle, { color: tokens.text.secondary }]}>
                          Campaign management & 1-per-10 feed analytics.
                        </Text>
                      </View>
                    </View>
                    <ChevronRight size={18} color={tokens.text.tertiary} />
                  </Pressable>
                </>
              )}
            </View>
          </>
        )}

        {/* Appearance Section */}
        <Text style={[styles.sectionHeaderTitle, { color: tokens.text.tertiary }]}>
          APPEARANCE
        </Text>

        <View style={[styles.section, { backgroundColor: tokens.background.secondary, borderColor: tokens.border.hairline }]}>
          <Text style={[styles.settingTitle, { color: tokens.text.primary }]}>
            Monochrome Theme
          </Text>
          <Text style={[styles.settingSubtitle, { color: tokens.text.secondary }]}>
            Strict black and white system. No color hues anywhere.
          </Text>

          <View style={styles.themeSelectorRow}>
            {/* Dark Theme Option */}
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: isDark }}
              accessibilityLabel="Select Dark Mode (Default)"
              onPress={() => handleToggleTheme('dark')}
              style={[
                styles.themeOptionCard,
                isDark ? styles.themeOptionActive : styles.themeOptionInactive,
              ]}>
              <View style={styles.themeCardHeader}>
                <Moon size={18} color={isDark ? '#000000' : '#8A8A8A'} />
                {isDark && <Check size={16} color="#000000" strokeWidth={2.5} />}
              </View>
              <Text
                style={[
                  styles.themeOptionTitle,
                  { color: isDark ? '#000000' : '#8A8A8A' },
                ]}>
                Dark Mode
              </Text>
              <Text
                style={[
                  styles.themeOptionDesc,
                  { color: isDark ? '#2E2E2E' : '#8A8A8A' },
                ]}>
                #000000 default
              </Text>
            </Pressable>

            {/* Light Theme Option */}
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: !isDark }}
              accessibilityLabel="Select Light Mode (Inverted)"
              onPress={() => handleToggleTheme('light')}
              style={[
                styles.themeOptionCard,
                !isDark ? styles.themeOptionActive : styles.themeOptionInactive,
              ]}>
              <View style={styles.themeCardHeader}>
                <Sun size={18} color={!isDark ? '#000000' : '#8A8A8A'} />
                {!isDark && <Check size={16} color="#000000" strokeWidth={2.5} />}
              </View>
              <Text
                style={[
                  styles.themeOptionTitle,
                  { color: !isDark ? '#000000' : '#8A8A8A' },
                ]}>
                Light Mode
              </Text>
              <Text
                style={[
                  styles.themeOptionDesc,
                  { color: !isDark ? '#2E2E2E' : '#8A8A8A' },
                ]}>
                #FFFFFF inverted
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Cache & Data Section */}
        <Text style={[styles.sectionHeaderTitle, { color: tokens.text.tertiary }]}>
          STORAGE & OFFLINE
        </Text>

        <View style={[styles.section, { backgroundColor: tokens.background.secondary, borderColor: tokens.border.hairline }]}>
          <View style={styles.infoRow}>
            <Database size={18} color={tokens.text.primary} />
            <View style={styles.infoRowText}>
              <Text style={[styles.settingTitle, { color: tokens.text.primary }]}>
                Offline Resilience Active
              </Text>
              <Text style={[styles.settingSubtitle, { color: tokens.text.secondary }]}>
                Your watchlist, film diary, and local metadata are automatically cached for offline viewing.
              </Text>
            </View>
          </View>
        </View>

        {/* Legal & Policies */}
        <Text style={[styles.sectionHeaderTitle, { color: tokens.text.tertiary }]}>
          LEGAL & COMMUNITY GUIDELINES
        </Text>

        <View style={[styles.section, { backgroundColor: tokens.background.secondary, borderColor: tokens.border.hairline }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View Terms of Service and Community Rules"
            onPress={() => router.push('/legal/terms' as any)}
            style={styles.menuRow}>
            <View style={styles.menuRowLeft}>
              <FileText size={18} color={tokens.text.primary} />
              <View style={styles.menuRowText}>
                <Text style={[styles.settingTitle, { color: tokens.text.primary }]}>
                  Terms & Community Rules
                </Text>
                <Text style={[styles.settingSubtitle, { color: tokens.text.secondary }]}>
                  Strict anti-piracy, spoiler policies, and community conduct
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={tokens.text.tertiary} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: tokens.border.hairline }]} />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View Privacy Policy"
            onPress={() => router.push('/legal/privacy' as any)}
            style={styles.menuRow}>
            <View style={styles.menuRowLeft}>
              <Lock size={18} color={tokens.text.primary} />
              <View style={styles.menuRowText}>
                <Text style={[styles.settingTitle, { color: tokens.text.primary }]}>
                  Privacy Policy
                </Text>
                <Text style={[styles.settingSubtitle, { color: tokens.text.secondary }]}>
                  Zero data selling, Row Level Security, and data protection
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={tokens.text.tertiary} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: tokens.border.hairline }]} />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Replay First-Time Onboarding Tour"
            onPress={() => setShowOnboarding(true)}
            style={styles.menuRow}>
            <View style={styles.menuRowLeft}>
              <Sparkles size={18} color={tokens.text.primary} />
              <View style={styles.menuRowText}>
                <Text style={[styles.settingTitle, { color: tokens.text.primary }]}>
                  Welcome Tour
                </Text>
                <Text style={[styles.settingSubtitle, { color: tokens.text.secondary }]}>
                  Re-explore discover, dual ratings, and creator features
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={tokens.text.tertiary} />
          </Pressable>
        </View>

        {/* About Takilya */}
        <Text style={[styles.sectionHeaderTitle, { color: tokens.text.tertiary }]}>
          ABOUT
        </Text>

        <View style={[styles.section, { backgroundColor: tokens.background.secondary, borderColor: tokens.border.hairline }]}>
          <View style={styles.infoRow}>
            <Info size={18} color={tokens.text.primary} />
            <View style={styles.infoRowText}>
              <Text style={[styles.settingTitle, { color: tokens.text.primary }]}>
                Takilya Mobile v1.0.0
              </Text>
              <Text style={[styles.settingSubtitle, { color: tokens.text.secondary }]}>
                A dedicated platform for discovering, rating, and discussing Philippine cinema. Indie, regional, and mainstream Filipino films get equal organic visibility.
              </Text>
            </View>
          </View>
        </View>

        {/* Sign Out Action */}
        {isAuthenticated && (
          <View style={styles.signOutWrap}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sign out of Takilya"
              onPress={handleSignOut}
              style={[styles.signOutBtn, { borderColor: tokens.border.default }]}>
              <LogOut size={16} color="#FFFFFF" />
              <Text style={styles.signOutBtnText}>Sign Out</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Onboarding Tour Modal */}
      <OnboardingModal
        forceVisible={showOnboarding}
        onDismiss={() => setShowOnboarding(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl * 2,
    gap: spacing.md,
  },
  sectionHeaderTitle: {
    ...typography.label,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: spacing.sm,
    marginBottom: -spacing.xs,
    paddingHorizontal: 4,
  },
  section: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  accountDetails: {
    flex: 1,
  },
  displayName: {
    ...typography.title,
    fontSize: 16,
    fontWeight: '700',
  },
  handle: {
    ...typography.caption,
    fontSize: 12,
    marginTop: 2,
  },
  email: {
    ...typography.caption,
    fontSize: 11,
    marginTop: 2,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1F1F1F',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  guestHeading: {
    ...typography.title,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  guestDesc: {
    ...typography.bodySmall,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: spacing.md,
  },
  signInActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: radius.full,
    minHeight: 44,
  },
  signInActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
  },
  settingTitle: {
    ...typography.title,
    fontSize: 14,
    fontWeight: '700',
  },
  settingSubtitle: {
    ...typography.bodySmall,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  themeSelectorRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  themeOptionCard: {
    flex: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 90,
    justifyContent: 'space-between',
  },
  themeOptionActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  themeOptionInactive: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  themeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  themeOptionTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  themeOptionDesc: {
    fontSize: 10,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  infoRowText: {
    flex: 1,
  },
  signOutWrap: {
    marginTop: spacing.sm,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderRadius: radius.full,
    paddingVertical: 14,
    minHeight: 48,
  },
  signOutBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
    paddingRight: spacing.sm,
  },
  menuRowText: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: spacing.xs,
  },
});

