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
  Award,
  Users,
  Film,
  Calendar,
  Sparkles,
} from 'lucide-react-native';
import {
  usePerson,
  usePersonCredits,
  usePersonAwards,
  usePersonClips,
} from '@/features/people/usePeople';
import { PersonAwardsCard, PersonFilmography } from '@/components/people';
import { OfficialClipsRail } from '@/components/ui/OfficialClipsRail';
import { FollowButton } from '@/components/social/FollowButton';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { GlassHeader } from '@/components/ui/GlassHeader';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { radius, spacing, typography } from '@/lib/theme';

const DEFAULT_BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}Z';

export default function PersonDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);

  const {
    data: person,
    isLoading: isPersonLoading,
    refetch: refetchPerson,
  } = usePerson(id || '');

  const personId = person?.id || id || '';

  const {
    data: credits = [],
    isLoading: isCreditsLoading,
    refetch: refetchCredits,
  } = usePersonCredits(personId);

  const {
    data: awards,
    isLoading: isAwardsLoading,
    refetch: refetchAwards,
  } = usePersonAwards(personId);

  const {
    data: clips = [],
    isLoading: isClipsLoading,
    refetch: refetchClips,
  } = usePersonClips(personId);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchPerson(),
        refetchCredits(),
        refetchAwards(),
        refetchClips(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleShare = async () => {
    if (!person) return;
    try {
      void Haptics.selectionAsync();
      await Share.share({
        title: person.name,
        message: `Explore ${person.name}'s filmography and awards on Takilya - Philippine Cinema Database`,
      });
    } catch {}
  };

  const isVerified = person?.verification_status === 'verified';
  const isNationalArtist = Boolean(person?.national_artist);

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'director':
        return 'Director & Filmmaker';
      case 'actor':
        return 'Screen Performer & Actor';
      case 'writer':
        return 'Screenwriter';
      case 'cinematographer':
        return 'Director of Photography';
      case 'producer':
        return 'Film Producer';
      default:
        return 'Filmmaker';
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Navigation Header */}
      <GlassHeader
        title={person?.name || 'Filmmaker'}
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
            accessibilityLabel="Share person profile"
            onPress={handleShare}
            style={styles.headerBtn}>
            <Share2 size={18} color="#FFFFFF" />
          </Pressable>
        }
      />

      {isPersonLoading ? (
        <View style={styles.loadingContainer}>
          <SkeletonLoader style={styles.skeletonAvatar} />
          <SkeletonLoader style={styles.skeletonTitle} />
          <SkeletonLoader style={styles.skeletonSubtitle} />
          <SkeletonLoader style={styles.skeletonBio} />
        </View>
      ) : !person ? (
        <EmptyState
          title="Filmmaker Not Found"
          description="The requested person or filmmaker profile could not be loaded."
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
          {/* Hero Profile Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              {/* Photo */}
              <View style={styles.avatarWrap}>
                <Image
                  source={{ uri: person.photo_url || undefined }}
                  placeholder={DEFAULT_BLURHASH}
                  contentFit="cover"
                  transition={200}
                  style={styles.avatar}
                />
                {isNationalArtist && (
                  <View style={styles.naFloatingBadge}>
                    <Award size={14} color="#000000" strokeWidth={2.5} />
                  </View>
                )}
              </View>

              {/* Title & Metadata */}
              <View style={styles.heroDetails}>
                <View style={styles.nameRow}>
                  <Text style={styles.name} numberOfLines={2}>
                    {person.name}
                  </Text>
                  {isVerified && <VerifiedBadge size={16} />}
                </View>

                <Text style={styles.roleText}>
                  {getRoleLabel(person.role_type)}
                </Text>

                {person.birth_year && (
                  <View style={styles.birthRow}>
                    <Calendar size={12} color="#8A8A8A" />
                    <Text style={styles.birthText}>
                      Born {person.birth_year}
                    </Text>
                  </View>
                )}

                {/* Follower Stats */}
                <View style={styles.statsRow}>
                  {person.followers_count !== undefined && (
                    <View style={styles.statItem}>
                      <Users size={12} color="#8A8A8A" />
                      <Text style={styles.statCount}>
                        {person.followers_count}
                      </Text>
                      <Text style={styles.statLabel}>Followers</Text>
                    </View>
                  )}
                  {credits.length > 0 && (
                    <View style={styles.statItem}>
                      <Film size={12} color="#8A8A8A" />
                      <Text style={styles.statCount}>{credits.length}</Text>
                      <Text style={styles.statLabel}>Credits</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Follow Action */}
            <View style={styles.followActionRow}>
              <FollowButton
                targetType="person"
                targetId={person.id}
                size="md"
              />
            </View>
          </View>

          {/* National Artist Highlight Box (if applicable) */}
          {isNationalArtist && person.national_artist && (
            <View style={styles.naCard}>
              <View style={styles.naHeaderRow}>
                <View style={styles.naIconBox}>
                  <Award size={16} color="#000000" strokeWidth={2.5} />
                </View>
                <View style={styles.naHeaderTextWrap}>
                  <Text style={styles.naCardTitle}>
                    ORDER OF NATIONAL ARTISTS
                  </Text>
                  <Text style={styles.naCardSubtitle}>
                    Conferred in {person.national_artist.year_conferred} • {person.national_artist.category || 'Film and Broadcast Arts'}
                  </Text>
                </View>
              </View>

              {person.national_artist.citation && (
                <Text style={styles.naCitation}>
                  &ldquo;{person.national_artist.citation}&rdquo;
                </Text>
              )}
            </View>
          )}

          {/* Biography Section */}
          {person.bio && (
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>BIOGRAPHY & LEGACY</Text>
              <Text
                style={styles.bioText}
                numberOfLines={bioExpanded ? undefined : 4}>
                {person.bio}
              </Text>
              {person.bio.length > 200 && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={bioExpanded ? 'Read less bio' : 'Read more bio'}
                  onPress={() => setBioExpanded(!bioExpanded)}
                  style={styles.expandBioBtn}>
                  <Text style={styles.expandBioText}>
                    {bioExpanded ? 'Show less' : 'Read more'}
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Awards Summary Card */}
          {awards && awards.recognitions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>HONORS & RECOGNITION</Text>
              <PersonAwardsCard awards={awards} />
            </View>
          )}

          {/* Filmography Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>FILMOGRAPHY</Text>
            <PersonFilmography credits={credits} />
          </View>

          {/* Official Clips & Archives */}
          {clips.length > 0 && (
            <OfficialClipsRail
              title="OFFICIAL ARCHIVES & CLIPS"
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
  skeletonAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginTop: spacing.md,
  },
  skeletonTitle: {
    width: 200,
    height: 24,
    borderRadius: radius.sm,
  },
  skeletonSubtitle: {
    width: 140,
    height: 16,
    borderRadius: radius.sm,
  },
  skeletonBio: {
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
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backgroundColor: '#141414',
  },
  naFloatingBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000000',
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
  roleText: {
    ...typography.caption,
    color: '#D4D4D4',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  birthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  birthText: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 11,
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
  naCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: '#141414',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  naHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  naIconBox: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  naHeaderTextWrap: {
    flex: 1,
  },
  naCardTitle: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  naCardSubtitle: {
    ...typography.caption,
    fontSize: 11,
    color: '#8A8A8A',
  },
  naCitation: {
    ...typography.caption,
    color: '#D4D4D4',
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
    marginTop: spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: '#FFFFFF',
    paddingLeft: spacing.sm,
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
  bioText: {
    ...typography.body,
    color: '#D4D4D4',
    fontSize: 13,
    lineHeight: 20,
  },
  expandBioBtn: {
    paddingVertical: spacing.xs,
    marginTop: 4,
    minHeight: 44,
    justifyContent: 'center',
  },
  expandBioText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});

