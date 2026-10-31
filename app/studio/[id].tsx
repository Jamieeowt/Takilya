import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Share,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  Share2,
  Calendar,
  Users,
  Film,
  Building2,
} from 'lucide-react-native';
import {
  useStudio,
  useStudioFilms,
  useStudioAwards,
  useStudioClips,
} from '@/features/studios/useStudios';
import {
  StudioFilmGrid,
  StudioAwardsShowcase,
} from '@/components/studios';
import { OfficialClipsRail } from '@/components/ui/OfficialClipsRail';
import { FollowButton } from '@/components/social/FollowButton';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { GlassHeader } from '@/components/ui/GlassHeader';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { radius, spacing, typography } from '@/lib/theme';

const DEFAULT_BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}Z';

export default function StudioDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  const {
    data: studio,
    isLoading: isStudioLoading,
    refetch: refetchStudio,
  } = useStudio(id || '');

  const studioId = studio?.id || id || '';

  const {
    data: films = [],
    isLoading: isFilmsLoading,
    refetch: refetchFilms,
  } = useStudioFilms(studioId);

  const {
    data: awards,
    isLoading: isAwardsLoading,
    refetch: refetchAwards,
  } = useStudioAwards(studioId);

  const {
    data: clips = [],
    isLoading: isClipsLoading,
    refetch: refetchClips,
  } = useStudioClips(studioId);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchStudio(),
        refetchFilms(),
        refetchAwards(),
        refetchClips(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleShare = async () => {
    if (!studio) return;
    try {
      void Haptics.selectionAsync();
      await Share.share({
        title: studio.name,
        message: `Check out ${studio.name}'s film catalog and releases on Takilya - Philippine Cinema Database`,
      });
    } catch {}
  };

  const isVerified = studio?.verification_status === 'verified';

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Navigation Header */}
      <GlassHeader
        title={studio?.name || 'Studio'}
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
            accessibilityLabel="Share studio"
            onPress={handleShare}
            style={styles.headerBtn}>
            <Share2 size={18} color="#FFFFFF" />
          </Pressable>
        }
      />

      {isStudioLoading ? (
        <View style={styles.loadingContainer}>
          <SkeletonLoader style={styles.skeletonLogo} />
          <SkeletonLoader style={styles.skeletonTitle} />
          <SkeletonLoader style={styles.skeletonSubtitle} />
          <SkeletonLoader style={styles.skeletonDesc} />
        </View>
      ) : !studio ? (
        <EmptyState
          title="Studio Not Found"
          description="The requested production studio or collective profile could not be loaded."
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + spacing.xxl },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#FFFFFF"
            />
          }>
          {/* Hero Studio Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              {/* Logo */}
              <View style={styles.logoWrap}>
                <Image
                  source={{ uri: studio.logo_url || undefined }}
                  placeholder={DEFAULT_BLURHASH}
                  contentFit="cover"
                  transition={200}
                  style={styles.logo}
                />
              </View>

              {/* Details */}
              <View style={styles.heroDetails}>
                <View style={styles.nameRow}>
                  <Text style={styles.name} numberOfLines={2}>
                    {studio.name}
                  </Text>
                  {isVerified && <VerifiedBadge size={16} />}
                </View>

                {studio.founded_year && (
                  <View style={styles.foundedRow}>
                    <Calendar size={12} color="#8A8A8A" />
                    <Text style={styles.foundedText}>
                      Founded {studio.founded_year}
                    </Text>
                  </View>
                )}

                {/* Follower & Film Stats */}
                <View style={styles.statsRow}>
                  {studio.followers_count !== undefined && (
                    <View style={styles.statItem}>
                      <Users size={12} color="#8A8A8A" />
                      <Text style={styles.statCount}>
                        {studio.followers_count}
                      </Text>
                      <Text style={styles.statLabel}>Followers</Text>
                    </View>
                  )}
                  {films.length > 0 && (
                    <View style={styles.statItem}>
                      <Film size={12} color="#8A8A8A" />
                      <Text style={styles.statCount}>{films.length}</Text>
                      <Text style={styles.statLabel}>Titles</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Follow Action */}
            <View style={styles.followActionRow}>
              <FollowButton
                targetType="studio"
                targetId={studio.id}
                size="md"
              />
            </View>
          </View>

          {/* Description / Manifesto */}
          {studio.description && (
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>ABOUT & MANIFESTO</Text>
              <Text
                style={styles.descText}
                numberOfLines={descExpanded ? undefined : 4}>
                {studio.description}
              </Text>
              {studio.description.length > 180 && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={descExpanded ? 'Show less about studio' : 'Show more about studio'}
                  onPress={() => setDescExpanded(!descExpanded)}
                  style={styles.expandDescBtn}>
                  <Text style={styles.expandDescText}>
                    {descExpanded ? 'Show less' : 'Read more'}
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Studio Awards Showcase */}
          {awards && awards.recognitions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>CATALOG RECOGNITIONS & AWARDS</Text>
              <StudioAwardsShowcase awards={awards} />
            </View>
          )}

          {/* Film Catalog Grid */}
          <View style={styles.section}>
            <View style={styles.catalogHeadingRow}>
              <Text style={styles.sectionHeading}>PRODUCED FILM CATALOG</Text>
              <Text style={styles.catalogCountText}>
                {films.length} {films.length === 1 ? 'Film' : 'Films'}
              </Text>
            </View>
            <StudioFilmGrid films={films} />
          </View>

          {/* Official Trailers & Clips */}
          {clips.length > 0 && (
            <OfficialClipsRail
              title="OFFICIAL TRAILERS & PRODUCTION CLIPS"
              clips={clips}
            />
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    padding: spacing.lg,
    gap: spacing.md,
    alignItems: 'center',
  },
  skeletonLogo: {
    width: 88,
    height: 88,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  skeletonTitle: {
    width: 200,
    height: 24,
    borderRadius: radius.sm,
  },
  skeletonSubtitle: {
    width: 120,
    height: 16,
    borderRadius: radius.sm,
  },
  skeletonDesc: {
    width: '100%',
    height: 100,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  scrollContent: {
    paddingTop: spacing.md,
  },
  heroCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    backgroundColor: '#0A0A0A',
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: spacing.lg,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  logoWrap: {
    width: 88,
    height: 88,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: '#141414',
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  heroDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    ...typography.titleMedium,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    flexShrink: 1,
  },
  foundedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  foundedText: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statCount: {
    ...typography.caption,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  statLabel: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 11,
  },
  followActionRow: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeading: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '800',
    color: '#8A8A8A',
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },
  catalogHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  catalogCountText: {
    ...typography.caption,
    fontSize: 11,
    color: '#8A8A8A',
    fontWeight: '600',
  },
  descText: {
    ...typography.body,
    color: '#D4D4D4',
    fontSize: 13,
    lineHeight: 20,
  },
  expandDescBtn: {
    paddingVertical: spacing.xs,
    marginTop: 4,
    minHeight: 44,
    justifyContent: 'center',
  },
  expandDescText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});

