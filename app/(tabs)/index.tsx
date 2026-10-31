import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { colors, spacing, radius, typography } from '@/lib/theme';
import { FeedType, FeedTrailerItem } from '@/features/feed/types';
import { useInfiniteFeed } from '@/features/feed/useFeed';
import { FeedVideoItem } from '@/features/feed/components/FeedVideoItem';
import { FeedCommentsModal } from '@/features/feed/components/FeedCommentsModal';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/features/auth';

const { width: SCREEN_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
// Default fallback height: Window height minus bottom tabs height (60px)
const DEFAULT_ITEM_HEIGHT = WINDOW_HEIGHT - 60;

export default function FeedScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [feedType, setFeedType] = useState<FeedType>('latest');
  const [containerHeight, setContainerHeight] = useState(DEFAULT_ITEM_HEIGHT);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [selectedCommentItem, setSelectedCommentItem] = useState<FeedTrailerItem | null>(null);

  // Global audio mute state (muted by default as required)
  const isVideoMuted = useAppStore((state) => state.isVideoMuted);
  const toggleMute = useAppStore((state) => state.toggleVideoMute);

  // TanStack Query with Cursor Pagination
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteFeed(feedType, user?.id);

  // Flatten paginated pages
  const feedItems: FeedTrailerItem[] = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) || [];
  }, [data]);

  // Viewability tracking: Only visible item plays, others pause
  const onViewableItemsChanged = useRef(
    (info: { viewableItems: Array<{ index?: number | null }> }) => {
      if (
        info.viewableItems.length > 0 &&
        info.viewableItems[0].index !== null &&
        info.viewableItems[0].index !== undefined
      ) {
        setVisibleIndex(info.viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  // Navigate to Film Detail Screen
  const handleNavigateToFilm = (item: FeedTrailerItem) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const filmId = item.film_id || item.id;
    router.push(`/film/${filmId}` as any);
  };

  // Render individual vertical feed page
  const renderItem = ({ item, index }: { item: FeedTrailerItem; index: number }) => {
    const isVisible = index === visibleIndex;

    return (
      <FeedVideoItem
        item={item}
        isVisible={isVisible}
        play={isVisible}
        isMuted={isVideoMuted}
        onToggleMute={toggleMute}
        itemHeight={containerHeight}
        itemWidth={SCREEN_WIDTH}
        onOpenComments={(targetItem) => setSelectedCommentItem(targetItem)}
        onPressFilm={() => handleNavigateToFilm(item)}
      />
    );
  };

  const handleToggleFeedType = (nextType: FeedType) => {
    if (feedType !== nextType) {
      try {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
      setFeedType(nextType);
      setVisibleIndex(0);
    }
  };

  return (
    <View
      style={styles.container}
      onLayout={(e) => {
        const measuredHeight = e.nativeEvent.layout.height;
        if (measuredHeight > 0 && measuredHeight !== containerHeight) {
          setContainerHeight(measuredHeight);
        }
      }}>
      {/* 3. Translucent Blurred Top Bar with Segmented Toggle (expo-blur) */}
      <View style={styles.topHeader} pointerEvents="box-none">
        <BlurView intensity={70} tint="dark" style={styles.tabTogglePill}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Switch to For You feed from followed festivals and studios"
            accessibilityState={{ selected: feedType === 'for_you' }}
            onPress={() => handleToggleFeedType('for_you')}
            style={[styles.toggleTab, feedType === 'for_you' && styles.toggleTabActive]}>
            <Text
              style={[
                styles.toggleTabText,
                feedType === 'for_you' && styles.toggleTabTextActive,
              ]}>
              For You
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Switch to Latest feed of all Philippine trailers and clips"
            accessibilityState={{ selected: feedType === 'latest' }}
            onPress={() => handleToggleFeedType('latest')}
            style={[styles.toggleTab, feedType === 'latest' && styles.toggleTabActive]}>
            <Text
              style={[
                styles.toggleTabText,
                feedType === 'latest' && styles.toggleTabTextActive,
              ]}>
              Latest
            </Text>
          </Pressable>
        </BlurView>
      </View>

      {/* Main Content States (Strict Monochrome) */}
      {isLoading ? (
        // Loading State
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading Philippine cinema feed...</Text>
        </View>
      ) : isError ? (
        // Error State
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FFFFFF" />
          <Text style={styles.errorTitle}>Unable to load trailers</Text>
          <Text style={styles.errorSub}>
            {(error as any)?.message || 'Please check your connection and retry.'}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry loading feed"
            onPress={() => refetch()}
            style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : feedItems.length === 0 ? (
        // Empty State
        <View style={styles.centerContainer}>
          <Ionicons name="film-outline" size={54} color="#FFFFFF" />
          <Text style={styles.emptyTitle}>
            {feedType === 'for_you' ? 'Your Feed is Quiet' : 'No trailers found'}
          </Text>
          <Text style={styles.emptySub}>
            {feedType === 'for_you'
              ? 'Follow Philippine festivals (Cinemalaya, QCinema), indie studios (TBA, Black Sheep), and filmmakers to personalize your For You feed.'
              : 'Official Philippine cinema clips and trailers will appear here shortly.'}
          </Text>
          {feedType === 'for_you' && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Switch to Latest trailers"
              onPress={() => setFeedType('latest')}
              style={styles.exploreButton}>
              <Text style={styles.exploreButtonText}>Browse Latest Trailers</Text>
            </Pressable>
          )}
        </View>
      ) : (
        // Vertical Pager FlatList (TikTok / Reels-style)
        <FlatList
          data={feedItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          pagingEnabled={true}
          snapToInterval={containerHeight}
          snapToAlignment="start"
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(_, index) => ({
            length: containerHeight,
            offset: containerHeight * index,
            index,
          })}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              void fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                void refetch();
              }}
              tintColor="#FFFFFF"
              colors={['#FFFFFF']}
            />
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            ) : undefined
          }
        />
      )}

      {/* 7. Comments Bottom Sheet Modal */}
      <FeedCommentsModal
        visible={Boolean(selectedCommentItem)}
        item={selectedCommentItem}
        onClose={() => setSelectedCommentItem(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topHeader: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
    pointerEvents: 'box-none',
  },
  tabTogglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 10, 0.65)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderRadius: radius.full,
    padding: 3,
    overflow: 'hidden',
  },
  toggleTab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.full,
  },
  toggleTabActive: {
    backgroundColor: '#FFFFFF',
  },
  toggleTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A8A8A',
    letterSpacing: -0.2,
  },
  toggleTabTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  loadingText: {
    color: '#8A8A8A',
    marginTop: spacing.md,
    fontSize: 14,
  },
  errorTitle: {
    ...typography.titleMedium,
    color: '#FFFFFF',
    marginTop: spacing.sm,
  },
  errorSub: {
    ...typography.bodySmall,
    color: '#8A8A8A',
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  retryButton: {
    marginTop: spacing.lg,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.xl,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.card,
  },
  retryButtonText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 14,
  },
  emptyTitle: {
    ...typography.titleMedium,
    color: '#FFFFFF',
    marginTop: spacing.sm,
  },
  emptySub: {
    ...typography.body,
    color: '#8A8A8A',
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    lineHeight: 20,
    marginTop: 4,
  },
  exploreButton: {
    marginTop: spacing.lg,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.xl,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.card,
  },
  exploreButtonText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 14,
  },
  footerLoader: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
