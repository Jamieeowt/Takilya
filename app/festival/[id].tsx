import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Share,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  Share2,
  MapPin,
  Calendar,
  Users,
  Video,
  Film,
  Sparkles,
} from 'lucide-react-native';

import {
  useFestival,
  useFestivalEditions,
  useFestivalSelections,
  useFestivalClips,
} from '@/features/festivals/useFestivals';
import {
  FestivalEditionPicker,
  FestivalSelectionCard,
  FestivalClipsRail,
  PostFestivalClipModal,
} from '@/components/festivals';
import { FollowButton } from '@/components/social/FollowButton';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { GlassHeader } from '@/components/ui/GlassHeader';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { radius, spacing, typography } from '@/lib/theme';

const DEFAULT_BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}Z';

export default function FestivalDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [activeEditionId, setActiveEditionId] = useState<string | undefined>(undefined);
  const [isPostClipModalVisible, setIsPostClipModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Queries
  const {
    data: festival,
    isLoading: isFestivalLoading,
    refetch: refetchFestival,
  } = useFestival(id || '');

  const {
    data: editions = [],
    isLoading: isEditionsLoading,
    refetch: refetchEditions,
  } = useFestivalEditions(festival?.id || id || '');

  // Select the latest edition by default
  useEffect(() => {
    if (editions.length > 0 && !activeEditionId) {
      setActiveEditionId(editions[0].id);
    }
  }, [editions, activeEditionId]);

  const {
    data: selections = [],
    isLoading: isSelectionsLoading,
    refetch: refetchSelections,
  } = useFestivalSelections(activeEditionId);

  const {
    data: clips = [],
    isLoading: isClipsLoading,
    refetch: refetchClips,
  } = useFestivalClips(festival?.id || id || '');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchFestival(),
        refetchEditions(),
        refetchSelections(),
        refetchClips(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleShare = async () => {
    if (!festival) return;
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Share.share({
        title: `${festival.name} on Takilya`,
        message: `Explore official selections, winners, and trailers from ${festival.name} on Takilya: https://takilya.app/festival/${festival.slug}`,
      });
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  if (isFestivalLoading && !festival) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <View style={styles.skeletonWrapper}>
          <SkeletonLoader height={180} style={{ width: '100%', borderRadius: radius.md }} />
          <SkeletonLoader height={24} style={{ width: '70%', marginTop: 20 }} />
          <SkeletonLoader height={14} style={{ width: '45%', marginTop: 8 }} />
          <SkeletonLoader height={60} style={{ width: '100%', marginTop: 24 }} />
        </View>
      </View>
    );
  }

  if (!festival) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <EmptyState
          title="Festival Not Found"
          description="The requested film festival could not be loaded."
          actionLabel="Back to Festivals"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  const isVerified = festival.verification_status === 'verified';
  const activeEdition = editions.find((e) => e.id === activeEditionId);

  return (
    <View style={styles.container}>
      {/* Top Floating Glass Header */}
      <GlassHeader
        title={festival.name}
        left={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={styles.headerBtn}>
            <ArrowLeft size={20} color="#FFFFFF" />
          </Pressable>
        }
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Share festival"
            onPress={handleShare}
            style={styles.headerBtn}>
            <Share2 size={18} color="#FFFFFF" />
          </Pressable>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 48, paddingBottom: spacing.xxl * 2 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#FFFFFF"
          />
        }>
        {/* Banner Backdrop */}
        <View style={styles.bannerWrapper}>
          <Image
            source={{ uri: festival.banner_url || festival.logo_url || undefined }}
            placeholder={DEFAULT_BLURHASH}
            contentFit="cover"
            transition={300}
            style={styles.bannerImage}
          />
          <View style={styles.bannerOverlay} />
        </View>

        {/* Identity & Header Info */}
        <View style={styles.headerCard}>
          <View style={styles.logoAndInfoRow}>
            {/* Festival Logo */}
            <View style={styles.logoWrapper}>
              <Image
                source={{ uri: festival.logo_url || undefined }}
                placeholder={DEFAULT_BLURHASH}
                contentFit="cover"
                style={styles.logoImage}
              />
            </View>

            <View style={styles.nameWrap}>
              <View style={styles.nameRow}>
                <Text style={styles.festivalName}>{festival.name}</Text>
                {isVerified && <VerifiedBadge size={16} />}
              </View>

              {/* Meta stats */}
              <View style={styles.metaRow}>
                {festival.location && (
                  <View style={styles.metaItem}>
                    <MapPin size={12} color="#8A8A8A" />
                    <Text style={styles.metaText} numberOfLines={1}>
                      {festival.location}
                    </Text>
                  </View>
                )}

                {festival.founded_year && (
                  <View style={styles.metaItem}>
                    <Calendar size={12} color="#8A8A8A" />
                    <Text style={styles.metaText}>Est. {festival.founded_year}</Text>
                  </View>
                )}

                <View style={styles.metaItem}>
                  <Users size={12} color="#8A8A8A" />
                  <Text style={styles.metaText}>
                    {festival.followers_count.toLocaleString()} followers
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Action Row: Follow & Share & Post Clip */}
          <View style={styles.actionsRow}>
            <FollowButton
              targetType="festival"
              targetId={festival.id}
              targetName={festival.name}
              size="md"
              style={styles.followActionBtn}
            />

            {/* Post Official Clip Button (Only accessible if verified account) */}
            {isVerified && (
              <Button
                label="Post Official Clip"
                variant="secondary"
                onPress={() => {
                  try {
                    void Haptics.selectionAsync();
                  } catch {}
                  setIsPostClipModalVisible(true);
                }}
                icon={<Video size={15} color="#FFFFFF" />}
                style={styles.postClipBtn}
              />
            )}
          </View>

          {/* Description */}
          {festival.description && (
            <View style={styles.descriptionWrap}>
              <Text style={styles.descriptionText}>{festival.description}</Text>
            </View>
          )}
        </View>

        {/* 1. Official Festival Clips Rail */}
        <FestivalClipsRail clips={clips} />

        {/* 2. Edition Selector */}
        {editions.length > 0 && (
          <FestivalEditionPicker
            editions={editions}
            selectedEditionId={activeEditionId}
            onSelectEdition={setActiveEditionId}
          />
        )}

        {/* 3. Official Selections Header & List */}
        <View style={styles.selectionsSection}>
          <View style={styles.selectionsHeaderRow}>
            <View>
              <Text style={styles.selectionsTitle}>
                {activeEdition ? `${activeEdition.name || activeEdition.year} Selections` : 'Official Selections'}
              </Text>
              {activeEdition?.theme && (
                <Text style={styles.themeSubtitle}>
                  Theme: “{activeEdition.theme}”
                </Text>
              )}
            </View>
            <View style={styles.countBadge}>
              <Film size={12} color="#FFFFFF" />
              <Text style={styles.countText}>{selections.length} FILMS</Text>
            </View>
          </View>

          {/* Selections List */}
          {isSelectionsLoading && selections.length === 0 ? (
            <View style={styles.selectionsSkeleton}>
              <SkeletonLoader height={100} style={{ width: '100%', marginBottom: 8 }} />
              <SkeletonLoader height={100} style={{ width: '100%', marginBottom: 8 }} />
              <SkeletonLoader height={100} style={{ width: '100%', marginBottom: 8 }} />
            </View>
          ) : selections.length === 0 ? (
            <EmptyState
              title="No Selections Listed"
              description={`Selections for ${activeEdition?.name || 'this edition'} have not been cataloged yet.`}
              style={styles.emptySelections}
            />
          ) : (
            <View style={styles.selectionsList}>
              {selections.map((selection) => (
                <FestivalSelectionCard
                  key={selection.id}
                  selection={selection}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Post Official Clip Modal for Verified Festivals */}
      <PostFestivalClipModal
        visible={isPostClipModalVisible}
        festivalId={festival.id}
        festivalName={festival.name}
        onClose={() => setIsPostClipModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  skeletonWrapper: {
    width: '100%',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  bannerWrapper: {
    width: '100%',
    height: 180,
    backgroundColor: '#141414',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  headerCard: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  logoAndInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  logoWrapper: {
    width: 68,
    height: 68,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  nameWrap: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  festivalName: {
    ...typography.title,
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.caption,
    fontSize: 11,
    color: '#8A8A8A',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  followActionBtn: {
    flex: 1,
    minHeight: 44,
  },
  postClipBtn: {
    flex: 1,
    minHeight: 44,
  },
  descriptionWrap: {
    marginTop: spacing.md,
    backgroundColor: '#0A0A0A',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  descriptionText: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 18,
    color: '#D4D4D4',
  },
  selectionsSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  selectionsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  selectionsTitle: {
    ...typography.title,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  themeSubtitle: {
    ...typography.caption,
    fontSize: 12,
    color: '#8A8A8A',
    fontStyle: 'italic',
    marginTop: 2,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#141414',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  countText: {
    ...typography.mono,
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  selectionsSkeleton: {
    marginTop: spacing.sm,
  },
  selectionsList: {
    marginTop: spacing.xs,
  },
  emptySelections: {
    paddingVertical: spacing.xl,
  },
});

