import React from 'react';
import { View, Text, StyleSheet, Pressable, Share } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Edit3, Share2, Film, Star, Bookmark, ListFilter } from 'lucide-react-native';
import { UserProfile } from '@/features/account/types';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { radius, spacing, typography } from '@/lib/theme';

interface ProfileHeaderProps {
  profile: UserProfile;
  activeTab: number;
  onSelectTab: (index: number) => void;
  onEditPress: () => void;
}

export function ProfileHeader({
  profile,
  activeTab,
  onSelectTab,
  onEditPress,
}: ProfileHeaderProps) {
  const handleShare = async () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Share.share({
        title: `${profile.display_name} on Takilya`,
        message: `Check out ${profile.display_name}'s (@${profile.username}) Filipino film profile, diary, and reviews on Takilya: https://takilya.app/user/${profile.username}`,
      });
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  const isCritic = profile.role === 'critic';
  const isVerified = profile.role === 'verified_official' || profile.role === 'critic' || profile.role === 'admin';

  return (
    <View style={styles.container}>
      {/* User Identity & Avatar */}
      <View style={styles.identityRow}>
        <Avatar
          url={profile.avatar_url}
          name={profile.display_name}
          size={76}
          isVerified={isVerified}
        />

        <View style={styles.identityInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.displayName} numberOfLines={1}>
              {profile.display_name}
            </Text>
            {isVerified && <VerifiedBadge size={16} />}
          </View>

          <View style={styles.handleRow}>
            <Text style={styles.handle}>@{profile.username}</Text>
            {isCritic && (
              <View style={styles.criticPill}>
                <Text style={styles.criticText}>CRITIC</Text>
              </View>
            )}
          </View>

          {profile.bio ? (
            <Text style={styles.bio} numberOfLines={3}>
              {profile.bio}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Stats Bar (Tappable to jump to tab) */}
      <View style={styles.statsBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`View ${profile.films_logged_count} logged films`}
          onPress={() => {
            void Haptics.selectionAsync();
            onSelectTab(0); // Watched / Diary
          }}
          style={[styles.statItem, activeTab === 0 && styles.statItemActive]}>
          <Film size={16} color={activeTab === 0 ? '#FFFFFF' : '#8A8A8A'} />
          <Text style={[styles.statValue, activeTab === 0 && styles.statValueActive]}>
            {profile.films_logged_count}
          </Text>
          <Text style={styles.statLabel}>Logged</Text>
        </Pressable>

        <View style={styles.statDivider} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`View ${profile.reviews_count} reviews`}
          onPress={() => {
            void Haptics.selectionAsync();
            onSelectTab(3); // Reviews
          }}
          style={[styles.statItem, activeTab === 3 && styles.statItemActive]}>
          <Star size={16} color={activeTab === 3 ? '#FFFFFF' : '#8A8A8A'} />
          <Text style={[styles.statValue, activeTab === 3 && styles.statValueActive]}>
            {profile.reviews_count}
          </Text>
          <Text style={styles.statLabel}>Reviews</Text>
        </Pressable>

        <View style={styles.statDivider} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`View ${profile.watchlist_count} films in watchlist`}
          onPress={() => {
            void Haptics.selectionAsync();
            onSelectTab(1); // Watchlist
          }}
          style={[styles.statItem, activeTab === 1 && styles.statItemActive]}>
          <Bookmark size={16} color={activeTab === 1 ? '#FFFFFF' : '#8A8A8A'} />
          <Text style={[styles.statValue, activeTab === 1 && styles.statValueActive]}>
            {profile.watchlist_count}
          </Text>
          <Text style={styles.statLabel}>Watchlist</Text>
        </Pressable>

        <View style={styles.statDivider} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`View ${profile.lists_count} custom lists`}
          onPress={() => {
            void Haptics.selectionAsync();
            onSelectTab(2); // Lists
          }}
          style={[styles.statItem, activeTab === 2 && styles.statItemActive]}>
          <ListFilter size={16} color={activeTab === 2 ? '#FFFFFF' : '#8A8A8A'} />
          <Text style={[styles.statValue, activeTab === 2 && styles.statValueActive]}>
            {profile.lists_count}
          </Text>
          <Text style={styles.statLabel}>Lists</Text>
        </Pressable>
      </View>

      {/* Quick Action Buttons */}
      <View style={styles.actionsRow}>
        <Button
          label="Edit Profile"
          variant="secondary"
          onPress={onEditPress}
          icon={<Edit3 size={15} color="#FFFFFF" />}
          style={styles.editBtn}
        />

        <Button
          label="Share Profile"
          variant="ghost"
          onPress={handleShare}
          icon={<Share2 size={15} color="#FFFFFF" />}
          style={styles.shareBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: '#000000',
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  identityInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  displayName: {
    ...typography.title,
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  handleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
    marginBottom: 6,
  },
  handle: {
    ...typography.caption,
    color: '#8A8A8A',
    fontWeight: '500',
    fontSize: 13,
  },
  criticPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: '#1F1F1F',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  criticText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  bio: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 18,
    color: '#D4D4D4',
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radius.md,
    marginTop: spacing.md,
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    gap: 2,
    borderRadius: radius.sm,
  },
  statItemActive: {
    backgroundColor: '#141414',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#D4D4D4',
  },
  statValueActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8A8A8A',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  editBtn: {
    flex: 1,
    minHeight: 44,
  },
  shareBtn: {
    flex: 1,
    minHeight: 44,
  },
});

