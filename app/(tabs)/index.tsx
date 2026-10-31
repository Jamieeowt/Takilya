import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Platform,
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/lib/theme';
import { Badge } from '@/components/Badge';
import { useFeedVideos } from '@/features/feed/useFeed';
import { VideoItem } from '@/features/films/types';
import { useAppStore } from '@/lib/store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_WIDTH = SCREEN_WIDTH - spacing.lg * 2;
const VIDEO_HEIGHT = Math.round((VIDEO_WIDTH * 9) / 16);

export default function FeedScreen() {
  const { data: videos, isLoading, isError, refetch, isRefetching } = useFeedVideos();
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});
  const isVideoMuted = useAppStore((state) => state.isVideoMuted);
  const toggleMute = useAppStore((state) => state.toggleVideoMute);

  const toggleWatchlist = (id: string) => {
    setSavedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderVideoItem = ({ item }: { item: VideoItem }) => {
    const isPlaying = playingVideoId === item.id;
    const isSaved = Boolean(savedIds[item.id]);

    return (
      <View style={styles.cardContainer}>
        {/* Header / Promoted / Type indicator */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Badge
              label={item.type === 'trailer' ? 'Official Trailer' : 'Official Clip'}
              variant="neutral"
            />
            {item.is_promoted && (
              <Badge
                label={item.promoted_label ? `Promoted • ${item.promoted_label}` : 'Promoted'}
                variant="promoted"
              />
            )}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isVideoMuted ? 'Unmute video audio' : 'Mute video audio'}
            onPress={toggleMute}
            style={styles.iconButtonSmall}
            hitSlop={8}>
            <Ionicons
              name={isVideoMuted ? 'volume-mute' : 'volume-high'}
              size={18}
              color={colors.text.secondary}
            />
          </Pressable>
        </View>

        {/* Video Player Canvas using react-native-youtube-iframe */}
        <View style={styles.videoWrapper}>
          {Platform.OS === 'web' ? (
            <View style={styles.webFallbackContainer}>
              <Ionicons name="play-circle-outline" size={48} color={colors.gold.primary} />
              <Text style={styles.webFallbackTitle}>{item.title}</Text>
              <Text style={styles.webFallbackSub}>
                YouTube ID: {item.youtube_video_id}
              </Text>
            </View>
          ) : (
            <YoutubePlayer
              height={VIDEO_HEIGHT}
              width={VIDEO_WIDTH}
              play={isPlaying}
              videoId={item.youtube_video_id}
              mute={isVideoMuted}
            />
          )}

          {/* Inline Play/Pause Overlay Toggle for Native */}
          {Platform.OS !== 'web' && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isPlaying ? 'Pause video' : 'Play video'}
              onPress={() => setPlayingVideoId(isPlaying ? null : item.id)}
              style={styles.playStateBar}>
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={14}
                color={colors.gold.primary}
              />
              <Text style={styles.playStateText}>
                {isPlaying ? 'Playing clip' : 'Tap to play trailer'}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Film Details */}
        <View style={styles.cardBody}>
          <View style={styles.titleRow}>
            <Text style={styles.filmTitle}>{item.film_title}</Text>
            <Text style={styles.filmYear}>({item.release_year})</Text>
          </View>

          <Text style={styles.directorText}>Dir. {item.director}</Text>
          <Text style={styles.clipTitle}>{item.title}</Text>

          {/* Dual Ratings: Critic vs Audience */}
          <View style={styles.scoresRow}>
            {item.critic_score !== undefined && (
              <Badge
                variant="critic"
                label={`Critic ${item.critic_score}%`}
                icon={<Ionicons name="star" size={12} color={colors.gold.primary} />}
              />
            )}
            {item.audience_score !== undefined && (
              <Badge
                variant="audience"
                label={`Audience ${item.audience_score}%`}
                icon={<Ionicons name="people" size={12} color={colors.film.audienceScore} />}
              />
            )}
          </View>

          {/* Bottom Actions: accessible >= 44px tap targets */}
          <View style={styles.actionRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isSaved ? 'Remove from watchlist' : 'Add to watchlist'}
              onPress={() => toggleWatchlist(item.id)}
              style={[styles.actionBtn, isSaved && styles.actionBtnActive]}>
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={18}
                color={isSaved ? colors.gold.primary : colors.text.secondary}
              />
              <Text style={[styles.actionBtnText, isSaved && styles.actionBtnTextActive]}>
                {isSaved ? 'Saved' : 'Watchlist'}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Read reviews for this film"
              style={styles.actionBtn}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.text.secondary} />
              <Text style={styles.actionBtnText}>Discuss</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Share this film clip"
              style={styles.actionBtn}>
              <Ionicons name="share-social-outline" size={18} color={colors.text.secondary} />
              <Text style={styles.actionBtnText}>Share</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.gold.primary} />
        <Text style={styles.loadingText}>Loading Philippine cinema feed...</Text>
      </View>
    );
  }

  // Error state
  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.status.error} />
        <Text style={styles.errorTitle}>Unable to load trailers</Text>
        <Text style={styles.errorSubtitle}>Please check your connection and retry.</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retry loading feed"
          onPress={() => refetch()}
          style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  // Empty state
  if (!videos || videos.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="film-outline" size={48} color={colors.gold.primary} />
        <Text style={styles.emptyTitle}>No Philippine trailers yet</Text>
        <Text style={styles.emptySubtitle}>Official clips will appear here shortly.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        renderItem={renderVideoItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              void refetch();
            }}
            tintColor={colors.gold.primary}
            colors={[colors.gold.primary]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  cardContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  iconButtonSmall: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoWrapper: {
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webFallbackContainer: {
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
    backgroundColor: '#050508',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  webFallbackTitle: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  webFallbackSub: {
    color: colors.text.tertiary,
    fontSize: 12,
    marginTop: 4,
  },
  playStateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    gap: 6,
  },
  playStateText: {
    color: colors.gold.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  cardBody: {
    padding: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  filmTitle: {
    ...typography.titleMedium,
    color: colors.text.primary,
  },
  filmYear: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  directorText: {
    ...typography.bodySmall,
    color: colors.gold.primary,
    marginTop: 2,
  },
  clipTitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  scoresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopColor: colors.border.subtle,
    borderTopWidth: 1,
    marginTop: spacing.lg,
    paddingTop: spacing.xs,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 80,
    gap: 6,
    paddingHorizontal: spacing.sm,
  },
  actionBtnActive: {
    borderColor: colors.gold.subtleBorder,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  actionBtnTextActive: {
    color: colors.gold.primary,
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
  errorSubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
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
  emptyTitle: {
    ...typography.titleSmall,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
});
