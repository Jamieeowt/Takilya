import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/lib/theme';
import { Badge } from '@/components/Badge';
import { useUserProfile } from '@/features/account/useAccount';
import { useAppStore } from '@/lib/store';
import { UserRole } from '@/features/films/types';

export default function AccountScreen() {
  const { data: profile, isLoading, isError, refetch, isRefetching } = useUserProfile();
  const currentRole = useAppStore((state) => state.userRole);
  const setUserRole = useAppStore((state) => state.setUserRole);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.gold.primary} />
        <Text style={styles.loadingText}>Loading cinephile profile...</Text>
      </View>
    );
  }

  if (isError || !profile) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.status.error} />
        <Text style={styles.errorTitle}>Failed to load profile</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retry loading profile"
          onPress={() => refetch()}
          style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

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
              <Badge
                label={currentRole === 'critic' ? 'Verified Film Critic' : currentRole.toUpperCase()}
                variant={currentRole === 'critic' ? 'critic' : 'neutral'}
              />
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

      {/* Top 4 Philippine Films */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>Top 4 Philippine Films</Text>
          <Badge label="Personal Canon" variant="critic" />
        </View>

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
      </View>

      {/* Interactive Role Switcher (for development testing of permissions) */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Preview User Role (AGENTS.md)</Text>
        <Text style={styles.helperText}>
          Dual ratings and clip publishing capabilities vary depending on your active role:
        </Text>
        <View style={styles.rolesRow}>
          {roleOptions.map((role) => (
            <Pressable
              key={role}
              accessibilityRole="button"
              accessibilityLabel={`Switch role to ${role}`}
              onPress={() => setUserRole(role)}
              style={[
                styles.roleOptionBtn,
                currentRole === role && styles.roleOptionBtnActive,
              ]}>
              <Text
                style={[
                  styles.roleOptionText,
                  currentRole === role && styles.roleOptionTextActive,
                ]}>
                {role}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Supabase & SecureStore Status */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.status.success} />
          <Text style={styles.infoTitle}>Session Storage</Text>
        </View>
        <Text style={styles.infoBody}>
          Auth sessions securely persisted with <Text style={styles.goldHighlight}>expo-secure-store</Text>.
          All queries managed with <Text style={styles.goldHighlight}>@tanstack/react-query</Text>.
        </Text>
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
  retryButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.gold.primary,
    paddingHorizontal: spacing.xl,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.xs,
  },
  retryButtonText: {
    color: colors.text.inverse,
    fontWeight: '700',
    fontSize: 14,
  },
});
