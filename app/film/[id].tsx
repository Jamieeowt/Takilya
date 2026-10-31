import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Share,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { ArrowLeft, Share2, Film as FilmIcon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useAuth } from '@/features/auth';
import {
  useFilmDetail,
  useToggleFilmWatchlist,
  useMarkFilmWatched,
  useSubmitFilmRating,
  useSubmitFilmReview,
} from '@/features/films/useFilm';
import {
  FilmHeroSection,
  FilmRatingsSection,
  FilmOverviewSection,
  FilmCastCrewSection,
  FilmAwardsSection,
  FilmMediaSection,
  FilmReviewsSection,
  FilmStickyActionBar,
  FilmRateModal,
} from '@/components/film';
import { GlassHeader } from '@/components/ui/GlassHeader';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { ErrorState } from '@/components/ui/ErrorState';
import { radius, typography } from '@/lib/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function FilmDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // Scroll offset shared value for parallax and collapsing header transition
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Modals state
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);

  // TanStack Query film detail
  const {
    data: film,
    isLoading,
    isError,
    refetch,
  } = useFilmDetail(id || '', user?.id);

  // Mutations
  const toggleWatchlistMutation = useToggleFilmWatchlist();
  const markWatchedMutation = useMarkFilmWatched();
  const submitRatingMutation = useSubmitFilmRating();
  const submitReviewMutation = useSubmitFilmReview();

  // Optimistic local overrides for instant responsiveness
  const [localWatchlist, setLocalWatchlist] = useState<boolean | null>(null);
  const [localWatched, setLocalWatched] = useState<boolean | null>(null);
  const [localUserRating, setLocalUserRating] = useState<number | null>(null);

  const isInWatchlist =
    localWatchlist !== null
      ? localWatchlist
      : film?.user_state?.is_in_watchlist ?? false;

  const isWatched =
    localWatched !== null
      ? localWatched
      : film?.user_state?.is_watched ?? false;

  const userRating =
    localUserRating !== null
      ? localUserRating
      : film?.user_state?.user_rating ?? null;

  // Header animation styles: Title and glass backdrop fade in on scroll
  const animatedHeaderGlassStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [120, 220],
      [0, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity,
    };
  });

  const animatedHeaderTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [150, 240],
      [0, 1],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      scrollY.value,
      [150, 240],
      [10, 0],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  // Floating button backing animation (circular glass fades out as header solidifies)
  const animatedFloatingBackingStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [80, 160],
      [1, 0],
      Extrapolation.CLAMP
    );
    return {
      opacity,
    };
  });

  // Actions
  const handleShare = async () => {
    if (!film) return;
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Share.share({
        title: film.title,
        message: `Watch "${film.title}" (${film.release_year}) directed by ${film.director} on Takilya — Discover Philippine Cinema.`,
      });
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  const handleToggleWatchlist = () => {
    if (!film) return;
    const nextState = !isInWatchlist;
    setLocalWatchlist(nextState);

    if (user) {
      toggleWatchlistMutation.mutate({
        filmId: film.id,
        userId: user.id,
        currentlyInWatchlist: isInWatchlist,
      });
    }
  };

  const handleToggleWatched = () => {
    if (!film) return;
    const nextState = !isWatched;
    setLocalWatched(nextState);

    if (user) {
      markWatchedMutation.mutate({
        filmId: film.id,
        userId: user.id,
        currentlyWatched: isWatched,
      });
    }
  };

  const handleSaveRatingReview = (data: {
    score: number;
    title: string;
    body: string;
    hasSpoilers: boolean;
  }) => {
    if (!film) return;
    setLocalUserRating(data.score);
    setLocalWatched(true);

    if (user) {
      if (data.body.trim()) {
        submitReviewMutation.mutate({
          filmId: film.id,
          userId: user.id,
          title: data.title,
          body: data.body,
          hasSpoilers: data.hasSpoilers,
          score: data.score,
        });
      } else {
        submitRatingMutation.mutate({
          filmId: film.id,
          userId: user.id,
          score: data.score,
        });
      }
    }
  };

  const handleRemoveRating = () => {
    if (!film) return;
    setLocalUserRating(null);
    setLocalWatched(false);

    if (user) {
      markWatchedMutation.mutate({
        filmId: film.id,
        userId: user.id,
        currentlyWatched: true,
      });
    }
  };

  // 1. Loading State with Skeletons
  if (isLoading && !film) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Backdrop Skeleton */}
        <SkeletonLoader height={320} borderRadius={0} />

        {/* Content Skeletons */}
        <View style={styles.loadingBody}>
          <View style={styles.loadingRow}>
            <SkeletonLoader width={110} height={165} borderRadius={radius.sm} />
            <View style={styles.loadingCol}>
              <SkeletonLoader width="80%" height={24} />
              <SkeletonLoader width="60%" height={16} />
              <SkeletonLoader width="40%" height={14} />
              <SkeletonLoader width="50%" height={26} borderRadius={radius.full} />
            </View>
          </View>

          {/* Dual Score Rings Skeleton */}
          <View style={styles.loadingRatingsBox}>
            <SkeletonLoader width={64} height={64} borderRadius={32} />
            <SkeletonLoader width={64} height={64} borderRadius={32} />
          </View>

          {/* Overview text skeleton */}
          <SkeletonLoader width="100%" height={16} />
          <SkeletonLoader width="90%" height={16} />
          <SkeletonLoader width="75%" height={16} />
        </View>
      </View>
    );
  }

  // 2. Error State
  if (isError && !film) {
    return (
      <View style={[styles.container, styles.centerContainer, { paddingTop: insets.top }]}>
        <ErrorState
          title="Film Unavailable"
          message="We could not load this film record. Please verify your connection."
          onRetry={() => { void refetch(); }}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Return to Feed"
          onPress={() => router.back()}
          style={styles.backFeedBtn}>
          <Text style={styles.backFeedText}>Return to Previous Screen</Text>
        </Pressable>
      </View>
    );
  }

  if (!film) return null;

  return (
    <View style={styles.container}>
      {/* 1. Collapsing Header Bar */}
      <View style={[styles.collapsibleHeaderContainer, { paddingTop: insets.top }]}>
        {/* Animated Glass Backdrop */}
        <Animated.View style={[StyleSheet.absoluteFill, animatedHeaderGlassStyle]}>
          <GlassHeader
            title=""
            intensity={80}
            style={styles.glassHeaderInner}
          />
        </Animated.View>

        {/* Header Content Bar */}
        <View style={styles.headerBar}>
          {/* Back Button with subtle circular glass backing */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to previous screen"
            onPress={() => {
              try {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch {}
              router.back();
            }}
            hitSlop={8}
            style={styles.navIconButton}>
            <Animated.View style={[styles.circularBacking, animatedFloatingBackingStyle]} />
            <ArrowLeft size={22} color="#FFFFFF" />
          </Pressable>

          {/* Film Title on scroll */}
          <Animated.View style={[styles.headerTitleWrap, animatedHeaderTitleStyle]}>
            <Text style={styles.headerTitleText} numberOfLines={1}>
              {film.title}
            </Text>
          </Animated.View>

          {/* Share Button with subtle circular glass backing */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Share film profile"
            onPress={handleShare}
            hitSlop={8}
            style={styles.navIconButton}>
            <Animated.View style={[styles.circularBacking, animatedFloatingBackingStyle]} />
            <Share2 size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      {/* 2. Scrollable Content */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Parallax Hero Backdrop & Metadata Section */}
        <FilmHeroSection film={film} scrollY={scrollY} />

        {/* Dual Score Rings (Audience & Critic) */}
        <FilmRatingsSection
          ratings={film.ratings}
          filmTitle={film.title}
        />

        {/* Synopsis & Where to Watch Badges */}
        <FilmOverviewSection
          synopsis={film.synopsis}
          watchOptions={film.watch_options}
        />

        {/* Cast & Crew Carousel */}
        <FilmCastCrewSection
          credits={film.credits}
          onSelectPerson={(personId) => {
            // Can route to /person/[id] or explorer
          }}
        />

        {/* Awards Carousel (Won, Nominated, Selection) */}
        <FilmAwardsSection awards={film.awards} />

        {/* Verified Trailers & Clips YouTube Carousel */}
        <FilmMediaSection trailers={film.trailers} />

        {/* Community Reviews & "Write a Review" entry */}
        <FilmReviewsSection
          reviews={film.reviews}
          onWriteReview={() => setIsRateModalOpen(true)}
          filmTitle={film.title}
        />

        {/* Bottom space clearance for sticky action bar */}
        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>

      {/* 3. Floating Sticky Action Bar */}
      <FilmStickyActionBar
        isInWatchlist={isInWatchlist}
        isWatched={isWatched}
        userRating={userRating}
        onToggleWatchlist={handleToggleWatchlist}
        onToggleWatched={handleToggleWatched}
        onOpenRateModal={() => setIsRateModalOpen(true)}
      />

      {/* 4. Rating & Review Modal */}
      <FilmRateModal
        visible={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        filmTitle={film.title}
        initialScore={userRating}
        initialReviewTitle={film.user_state?.user_review?.title}
        initialReviewBody={film.user_state?.user_review?.body}
        initialHasSpoilers={film.user_state?.user_review?.has_spoilers}
        onSubmit={handleSaveRatingReview}
        onRemoveRating={handleRemoveRating}
        isSubmitting={submitRatingMutation.isPending || submitReviewMutation.isPending}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  collapsibleHeaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  glassHeaderInner: {
    height: '100%',
    backgroundColor: 'rgba(10, 10, 10, 0.75)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
  },
  headerBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  navIconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  circularBacking: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  headerTitleWrap: {
    flex: 1,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  headerTitleText: {
    ...typography.title,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 90,
  },
  bottomSpacer: {
    height: 40,
  },

  // Loading skeleton layout
  loadingBody: {
    padding: 16,
    gap: 16,
    marginTop: -40,
  },
  loadingRow: {
    flexDirection: 'row',
    gap: 16,
  },
  loadingCol: {
    flex: 1,
    gap: 8,
    paddingTop: 8,
  },
  loadingRatingsBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#0A0A0A',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },

  // Error & empty states
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backFeedBtn: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  backFeedText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
});
