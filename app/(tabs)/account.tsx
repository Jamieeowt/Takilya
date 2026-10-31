import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/lib/theme';
import { Badge } from '@/components/Badge';
import { useUserProfile } from '@/features/account/useAccount';
import { useAuth, useSession, useRole } from '@/features/auth';
import { useAppStore } from '@/lib/store';
import { UserRole } from '@/features/films/types';

export default function AccountScreen() {
  const { session, user, isLoading: isAuthLoading, isAuthenticated } = useSession();
  const { signOut, profile: authProfile } = useAuth();
  const { role, isCritic, isAdmin, isVerifiedOfficial } = useRole();

  const {
    data: profileData,
    isLoading: isProfileLoading,
    isError,
    refetch,
    isRefetching,
  } = useUserProfile(user?.id);

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  // Store role preview switch for testing permission features
  const previewRole = useAppStore((state) => state.userRole);
  const setPreviewRole = useAppStore((state) => state.setUserRole);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      setSignOutError(null);
      const { error } = await signOut();
      if (error) {
        setSignOutError(error);
      }
    } catch (err: any) {
      setSignOutError(err?.message || 'Failed to sign out. Please try again.');
    } finally {
      setIsSigningOut(false);
    }
  };

  // 1. Initial Auth Loading State
  if (isAuthLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.gold.primary} />
        <Text style={styles.loadingText}>Checking cinephile session...</Text>
      </View>
    );
  }

  // 2. Guest Guard: Unauthenticated prompt
  if (!isAuthenticated) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.guestContentContainer}>
        {/* Guest Hero Card */}
        <View style={styles.guestCard}>
          <View style={styles.guestIconBadge}>
            <Ionicons name="film" size={38} color={colors.gold.primary} />
          </View>
          <Text style={styles.guestTitle}>Mabuhay, Cinephile!</Text>
          <Text style={styles.guestSubtitle}>
            Takilya is the home for discovering, rating, and discussing Philippine cinema. Sign in to
            unlock your personal cinephile passport.
          </Text>

          {/* Perks list */}
          <View style={styles.perksContainer}>
            <View style={styles.perkItem}>
              <View style={styles.perkIcon}>
                <Ionicons name="star" size={18} color={colors.gold.primary} />
              </View>
              <View style={styles.perkTextWrap}>
                <Text style={styles.perkHeading}>Dual Ratings & Reviews</Text>
                <Text style={styles.perkBody}>
                  Separate audience scores and verified critic scores for every Filipino film.
                </Text>
              </View>
            </View>

            <View style={styles.perkItem}>
              <View style={styles.perkIcon}>
                <Ionicons name="trophy" size={18} color={colors.gold.primary} />
              </View>
              <View style={styles.perkTextWrap}>
                <Text style={styles.perkHeading}>Personal Canon Top 4</Text>
                <Text style={styles.perkBody}>
                  Curate your 4 defining Philippine masterpieces on your public profile.
                </Text>
              </View>
            </View>

            <View style={styles.perkItem}>
              <View style={styles.perkIcon}>
                <Ionicons name="bookmark" size={18} color={colors.gold.primary} />
              </View>
              <View style={styles.perkTextWrap}>
                <Text style={styles.perkHeading}>Filipino Film Watchlist</Text>
                <Text style={styles.perkBody}>
                  Track indie premieres, festival entries, and restored classics you want to see.
                </Text>
              </View>
            </View>

            <View style={styles.perkItem}>
              <View style={styles.perkIcon}>
                <Ionicons name="people" size={18} color={colors.gold.primary} />
              </View>
              <View style={styles.perkTextWrap}>
                <Text style={styles.perkHeading}>Follow Festivals & Studios</Text>
                <Text style={styles.perkBody}>
                  Direct updates from Cinemalaya, QCinema, FDCP, and independent filmmakers.
                </Text>
              </View>
            </View>
          </View>

          {/* CTA Buttons */}
          <View style={styles.guestActionButtons}>
            <Link href={"/(auth)/login" as any} asChild>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Sign in with existing Takilya account"
                style={styles.signInButton}>
                <Text style={styles.signInButtonText}>Sign In</Text>
              </Pressable>
            </Link>

            <Link href={"/(auth)/signup" as any} asChild>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Create a new Takilya account"
                style={styles.signUpButton}>
                <Text style={styles.signUpButtonText}>Create Account</Text>
              </Pressable>
            </Link>
          </View>
        </View>

        {/* Free-to-browse notice */}
        <View style={styles.browseNotice}>
          <Ionicons name="information-circle-outline" size={16} color={colors.text.tertiary} />
          <Text style={styles.browseNoticeText}>
            You can still browse trailers in Feed and discover films in Explore without signing in.
          </Text>
        </View>
      </ScrollView>
    );
  }

  // 3. Authenticated Profile State
  if (isProfileLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.gold.primary} />
        <Text style={styles.loadingText}>Loading cinephile profile...</Text>
      </View>
    );
  }

  // Profile data fallback
  const profile = profileData || {
    id: user?.id || 'usr-1',
    username: authProfile?.username || user?.user_metadata?.username || 'cinephile',
    display_name: authProfile?.display_name || user?.user_metadata?.display_name || 'Cinephile',
    role: (authProfile?.role as UserRole) || 'user',
    bio: authProfile?.bio || 'Advocate for regional Filipino cinema and restored classics.',
    followers_count: 0,
    following_counts: { festivals: 0, studios: 0, users: 0, people: 0 },
    top_films: [],
    watchlist_count: 0,
  };

  const getRoleLabel = () => {
    if (isAdmin) return 'Takilya Admin';
    if (isCritic) return 'Verified Film Critic';
    if (isVerifiedOfficial) return 'Verified Official';
    return 'Cinephile';
  };

  const getRoleVariant = (): 'critic' | 'verified' | 'neutral' => {
    if (isCritic || isAdmin) return 'critic';
    if (isVerifiedOfficial) return 'verified';
    return 'neutral';
  };

  const roleOptions: UserRole[] = ['user', 'critic', 'verified_official', 'admin'];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => {
            void refetch();
          }}
          tintColor={colors.gold.primary}
        />
      }>
      {/* Sign Out Error Banner if any */}
      {signOutError && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={18} color={colors.status.error} />
          <Text style={styles.errorBannerText}>{signOutError}</Text>
        </View>
      )}

      {/* Profile Header Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Ionicons name="film" size={28} color={colors.gold.primary} />
          </View>
          <View style={styles.profileNames}>
            <Text style={styles.displayName}>{profile.display_name}</Text>
            <Text style={styles.handle}>@{profile.username}</Text>
            <View style={styles.roleBadgeContainer}>
              <Badge label={getRoleLabel()} variant={getRoleVariant()} />
            </View>
          </View>
        </View>

        <Text style={styles.bioText}>{profile.bio}</Text>

        {/* Polymorphic Follows Breakdown */}
        <View style={styles.followCountersContainer}>
          <View style={styles.followStatItem}>
            <Text style={styles.followNumber}>{profile.following_counts.festivals}</Text>
            <Text style={styles.followLabel}>Festivals</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.followStatItem}>
            <Text style={styles.followNumber}>{profile.following_counts.studios}</Text>
            <Text style={styles.followLabel}>Studios</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.followStatItem}>
            <Text style={styles.followNumber}>{profile.following_counts.people}</Text>
            <Text style={styles.followLabel}>People</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.followStatItem}>
            <Text style={styles.followNumber}>{profile.following_counts.users}</Text>
            <Text style={styles.followLabel}>Users</Text>
          </View>
        </View>
      </View>

      {/* Watchlist Banner */}
      <View style={styles.watchlistBanner}>
        <View style={styles.watchlistLeft}>
          <Ionicons name="bookmark" size={24} color={colors.gold.primary} />
          <View>
            <Text style={styles.watchlistTitle}>Filipino Film Watchlist</Text>
            <Text style={styles.watchlistSub}>{profile.watchlist_count} films saved to watch</Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View entire film watchlist"
          style={styles.viewWatchlistBtn}>
          <Text style={styles.viewWatchlistText}>View</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.gold.primary} />
        </Pressable>
      </View>

      {/* Top 4 Philippine Films (Personal Canon) */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>Top 4 Philippine Films</Text>
          <Badge label="Personal Canon" variant="critic" />
        </View>

        {profile.top_films.length > 0 ? (
          <View style={styles.topFilmsGrid}>
            {profile.top_films.map((film, index) => (
              <View key={film.id} style={styles.topFilmCard}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </View>
                <Text style={styles.topFilmTitle}>{film.title}</Text>
                <Text style={styles.topFilmYear}>{film.year}</Text>
                <Text style={styles.topFilmDirector}>Dir. {film.director}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyCanonBox}>
            <Text style={styles.emptyCanonText}>
              Select your 4 defining Philippine films to feature on your canon.
            </Text>
          </View>
        )}
      </View>

      {/* Interactive Role Switcher for dev testing */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Role & Permission Engine (AGENTS.md)</Text>
        <Text style={styles.helperText}>
          Dual ratings and official clip publishing permissions vary depending on your verified role:
        </Text>
        <View style={styles.rolesRow}>
          {roleOptions.map((r) => (
            <Pressable
              key={r}
              accessibilityRole="button"
              accessibilityLabel={`Switch role preview to ${r}`}
              onPress={() => setPreviewRole(r)}
              style={[
                styles.roleOptionBtn,
                previewRole === r && styles.roleOptionBtnActive,
              ]}>
              <Text
                style={[
                  styles.roleOptionText,
                  previewRole === r && styles.roleOptionTextActive,
                ]}>
                {r}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* User Session & Account Actions */}
      <View style={styles.sessionSection}>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.status.success} />
            <Text style={styles.infoTitle}>Session Storage</Text>
          </View>
          <Text style={styles.infoBody}>
            Logged in as <Text style={styles.goldHighlight}>{user?.email}</Text>. Authenticated session
            persisted in <Text style={styles.goldHighlight}>expo-secure-store</Text>.
          </Text>
        </View>

        {/* Sign Out Button (min 44px tap target) */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sign out of Takilya"
          onPress={handleSignOut}
          disabled={isSigningOut}
          style={[styles.signOutButton, isSigningOut && styles.signOutButtonDisabled]}>
          {isSigningOut ? (
            <ActivityIndicator size="small" color={colors.status.error} />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={18} color={colors.status.error} />
              <Text style={styles.signOutButtonText}>Log Out</Text>
            </>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  contentContainer: {
    padding: spacing.lg,
    gap: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  guestContentContainer: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.lg,
    alignItems: 'center',
  },
  guestCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    borderColor: colors.gold.subtleBorder,
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    gap: spacing.md,
  },
  guestIconBadge: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.gold.subtle,
    borderColor: colors.gold.subtleBorder,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  guestTitle: {
    ...typography.titleLarge,
    color: colors.text.primary,
    fontWeight: '800',
    textAlign: 'center',
  },
  guestSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  perksContainer: {
    width: '100%',
    gap: spacing.md,
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  perkIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.xs,
    backgroundColor: colors.gold.subtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  perkTextWrap: {
    flex: 1,
    gap: 2,
  },
  perkHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  perkBody: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  guestActionButtons: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  signInButton: {
    backgroundColor: colors.gold.primary,
    borderRadius: radius.xs,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    elevation: 2,
  },
  signInButtonText: {
    color: colors.text.inverse,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  signUpButton: {
    backgroundColor: 'transparent',
    borderColor: colors.border.default,
    borderWidth: 1,
    borderRadius: radius.xs,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  signUpButtonText: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  browseNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  browseNoticeText: {
    fontSize: 12,
    color: colors.text.tertiary,
    flex: 1,
    textAlign: 'center',
  },
  profileCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    backgroundColor: colors.gold.subtle,
    borderColor: colors.gold.subtleBorder,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileNames: {
    flex: 1,
    gap: 2,
  },
  displayName: {
    ...typography.titleMedium,
    color: colors.text.primary,
  },
  handle: {
    fontSize: 13,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  roleBadgeContainer: {
    marginTop: 4,
  },
  bioText: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  followCountersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  followStatItem: {
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border.default,
  },
  followNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  followLabel: {
    fontSize: 11,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  watchlistBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    borderColor: colors.gold.subtleBorder,
    borderWidth: 1,
    padding: spacing.lg,
  },
  watchlistLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  watchlistTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  watchlistSub: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  viewWatchlistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    minWidth: 44,
    gap: 4,
  },
  viewWatchlistText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gold.primary,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeader: {
    ...typography.titleSmall,
    color: colors.text.primary,
  },
  helperText: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
  },
  topFilmsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  topFilmCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.sm,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    padding: spacing.md,
    flex: 1,
    minWidth: '45%',
    gap: 2,
  },
  rankBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gold.subtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
    marginBottom: 4,
  },
  rankText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.gold.primary,
  },
  topFilmTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  topFilmYear: {
    fontSize: 12,
    color: colors.gold.primary,
  },
  topFilmDirector: {
    fontSize: 11,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  emptyCanonBox: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.sm,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyCanonText: {
    fontSize: 13,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  rolesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  roleOptionBtn: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.xs,
    borderColor: colors.border.default,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleOptionBtnActive: {
    borderColor: colors.gold.primary,
    backgroundColor: colors.gold.subtle,
  },
  roleOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  roleOptionTextActive: {
    color: colors.gold.primary,
  },
  sessionSection: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  infoCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  infoBody: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  goldHighlight: {
    color: colors.gold.primary,
    fontWeight: '600',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderRadius: radius.xs,
    minHeight: 48,
    paddingHorizontal: spacing.xl,
  },
  signOutButtonDisabled: {
    opacity: 0.6,
  },
  signOutButtonText: {
    color: colors.status.error,
    fontWeight: '700',
    fontSize: 14,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    color: colors.text.secondary,
    marginTop: spacing.md,
    fontSize: 14,
  },
  errorTitle: {
    ...typography.titleSmall,
    color: colors.text.primary,
    marginTop: spacing.md,
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
});
