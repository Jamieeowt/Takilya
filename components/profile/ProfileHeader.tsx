import React from 'react';
import { View, Text, StyleSheet, Pressable, Share } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Edit3, Share2, Film, Star, Bookmark, ListFilter, Camera } from 'lucide-react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

import { UserProfile } from '@/features/account/types';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { FollowButton } from '@/components/social/FollowButton';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { radius, spacing, typography } from '@/lib/theme';

export const DEFAULT_COVER_URL =
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80';

interface ProfileHeaderProps {
  profile: UserProfile;
  activeTab: number;
  onSelectTab: (index: number) => void;
  onEditPress?: () => void;
  isOwnProfile?: boolean;
}

export function ProfileHeader({
  profile,
  activeTab,
  onSelectTab,
  onEditPress,
  isOwnProfile = true,
}: ProfileHeaderProps) {
  const router = useRouter();

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
  const isVerified =
    profile.role === 'verified_official' ||
    profile.role === 'critic' ||
    profile.role === 'admin';

  const totalFollowing =
    (profile.following_counts?.festivals || 0) +
    (profile.following_counts?.studios || 0) +
    (profile.following_counts?.people || 0) +
    (profile.following_counts?.users || 0);

  return (
    <View style={styles.container}>
      {/* 1. Cover Photo Banner (Hero Header) */}
      <View style={styles.coverBannerContainer}>
        <Image
          source={{ uri: profile.cover_url || DEFAULT_COVER_URL }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
        {/* Bottom Fade Gradient into background black (#000000) */}
        <Svg width="100%" height={150} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="coverGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#000000" stopOpacity="0" />
              <Stop offset="0.45" stopColor="#000000" stopOpacity="0.25" />
              <Stop offset="0.8" stopColor="#000000" stopOpacity="0.75" />
              <Stop offset="1" stopColor="#000000" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height={150} fill="url(#coverGradient)" />
        </Svg>

        {/* Edit Cover Badge in corner (for own profile) */}
        {isOwnProfile && onEditPress && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit cover photo"
            onPress={onEditPress}
            style={styles.editCoverBadge}
            hitSlop={8}>
            <Camera size={14} color="#FFFFFF" />
            <Text style={styles.editCoverText}>Edit Cover</Text>
          </Pressable>
        )}
      </View>

      {/* 2. Profile Avatar Overlap & Action Row */}
      <View style={styles.contentWrapper}>
        <View style={styles.avatarRow}>
          {/* Overlapping Avatar with 3px solid black border boundary cutout */}
          <View style={styles.avatarBorderWrapper}>
            <Avatar
              url={profile.avatar_url}
              name={profile.display_name}
              size={84}
              isVerified={isVerified}
            />
          </View>

          {/* Action Buttons Row beside Avatar (Right) */}
          <View style={styles.headerRightActions}>
            {isOwnProfile ? (
              <Button
                label="Edit Profile"
                variant="secondary"
                onPress={onEditPress || (() => {})}
                icon={<Edit3 size={15} color="#FFFFFF" />}
                style={styles.editBtn}
              />
            ) : (
              <FollowButton
                targetType="user"
                targetId={profile.id}
                targetName={profile.display_name}
                size="md"
                style={styles.followBtn}
              />
            )}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Share profile"
              onPress={handleShare}
              style={styles.shareIconButton}
              hitSlop={8}>
              <Share2 size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        {/* 3. User Identity & Bio Information */}
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

          {/* Followers & Following Stat Row */}
          <View style={styles.followStatsRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`View ${profile.followers_count} followers`}
              onPress={() => {
                void Haptics.selectionAsync();
                router.push({
                  pathname: '/user/[id]/followers' as any,
                  params: { id: profile.id, name: profile.username },
                });
              }}
              style={styles.followStatButton}>
              <Text style={styles.followStatNumber}>{profile.followers_count}</Text>
              <Text style={styles.followStatLabel}>Followers</Text>
            </Pressable>

            <Text style={styles.followStatDot}>•</Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`View ${totalFollowing} following`}
              onPress={() => {
                void Haptics.selectionAsync();
                router.push({
                  pathname: '/user/[id]/following' as any,
                  params: { id: profile.id, name: profile.username },
                });
              }}
              style={styles.followStatButton}>
              <Text style={styles.followStatNumber}>{totalFollowing}</Text>
              <Text style={styles.followStatLabel}>Following</Text>
            </Pressable>
          </View>

          {profile.bio ? (
            <Text style={styles.bio} numberOfLines={3}>
              {profile.bio}
            </Text>
          ) : null}
        </View>

        {/* 4. Stats Bar (Logged, Reviews, Watchlist, Lists) */}
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    paddingBottom: spacing.sm,
  },
  coverBannerContainer: {
    height: 150,
    width: '100%',
    backgroundColor: '#0A0A0A',
    position: 'relative',
    overflow: 'hidden',
  },
  editCoverBadge: {
    position: 'absolute',
    right: 16,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  editCoverText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  contentWrapper: {
    paddingHorizontal: spacing.md,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  avatarBorderWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#000000',
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -42,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingBottom: 4,
  },
  editBtn: {
    minHeight: 44,
    paddingHorizontal: 16,
  },
  followBtn: {
    minHeight: 44,
    paddingHorizontal: 16,
  },
  shareIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityInfo: {
    marginTop: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  displayName: {
    ...typography.title,
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
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
    fontSize: 14,
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
    marginTop: 4,
  },
  followStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  followStatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  followStatNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  followStatLabel: {
    fontSize: 12,
    color: '#8A8A8A',
    fontWeight: '500',
  },
  followStatDot: {
    fontSize: 12,
    color: '#8A8A8A',
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
});
