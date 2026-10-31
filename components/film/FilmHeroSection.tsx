import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { FilmDetailFull } from '@/features/films/types';
import { Chip } from '@/components/ui/Chip';
import { radius, typography } from '@/lib/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BACKDROP_HEIGHT = 380;
const DEFAULT_BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}Z';

interface FilmHeroSectionProps {
  film: FilmDetailFull;
  scrollY: SharedValue<number>;
}

export function FilmHeroSection({ film, scrollY }: FilmHeroSectionProps) {
  // Parallax backdrop animation: slight downward translation and zoom when pulling down
  const animatedBackdropStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [-BACKDROP_HEIGHT, 0, BACKDROP_HEIGHT],
      [-BACKDROP_HEIGHT / 2, 0, BACKDROP_HEIGHT * 0.45],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      scrollY.value,
      [-BACKDROP_HEIGHT, 0],
      [1.3, 1],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY }, { scale }],
    };
  });

  const formattedRuntime = film.runtime_minutes
    ? `${film.runtime_minutes} min`
    : null;

  return (
    <View style={styles.container}>
      {/* 1. Parallax Backdrop Container */}
      <View style={styles.backdropContainer}>
        <Animated.View style={[styles.backdropImageWrap, animatedBackdropStyle]}>
          <Image
            source={{ uri: film.backdrop_url || film.poster_url || undefined }}
            placeholder={{ blurhash: DEFAULT_BLURHASH }}
            style={styles.backdropImage}
            contentFit="cover"
            transition={300}
          />
        </Animated.View>

        {/* Top Dark Scrim for Status Bar & Header Buttons Contrast */}
        <View pointerEvents="none" style={styles.topScrimWrap}>
          <Svg width={SCREEN_WIDTH} height={120} style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="heroTopScrim" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#000000" stopOpacity="0.85" />
                <Stop offset="0.6" stopColor="#000000" stopOpacity="0.35" />
                <Stop offset="1" stopColor="#000000" stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Rect width={SCREEN_WIDTH} height={120} fill="url(#heroTopScrim)" />
          </Svg>
        </View>

        {/* Bottom Parallax Scrim fading directly into pure black (#000000) */}
        <View pointerEvents="none" style={styles.bottomScrimWrap}>
          <Svg width={SCREEN_WIDTH} height={260} style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="heroBottomScrim" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#000000" stopOpacity="0" />
                <Stop offset="0.4" stopColor="#000000" stopOpacity="0.5" />
                <Stop offset="0.85" stopColor="#000000" stopOpacity="0.95" />
                <Stop offset="1" stopColor="#000000" stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Rect width={SCREEN_WIDTH} height={260} fill="url(#heroBottomScrim)" />
          </Svg>
        </View>
      </View>

      {/* 2. Metadata Section (Overlapping the bottom of the backdrop) */}
      <View style={styles.metadataContent}>
        {/* Left: 2:3 Poster Card with Blurhash */}
        <View style={styles.posterWrapper}>
          <Image
            source={{ uri: film.poster_url || undefined }}
            placeholder={{ blurhash: DEFAULT_BLURHASH }}
            style={styles.posterImage}
            contentFit="cover"
            transition={300}
          />
        </View>

        {/* Right: Titles & Attributes */}
        <View style={styles.infoCol}>
          {/* Main Title */}
          <Text style={styles.primaryTitle} numberOfLines={2}>
            {film.title}
          </Text>

          {/* Original Filipino Title (if different) */}
          {film.original_title && film.original_title !== film.title && (
            <Text style={styles.originalTitle} numberOfLines={1}>
              {film.original_title}
            </Text>
          )}

          {/* Director credit */}
          <Text style={styles.directorText} numberOfLines={1}>
            Dir. <Text style={styles.directorName}>{film.director}</Text>
          </Text>

          {/* Quick Specs: Year • Runtime • MTRCB */}
          <View style={styles.specsRow}>
            <Text style={styles.specText}>{film.release_year}</Text>
            {formattedRuntime && (
              <>
                <Text style={styles.specDot}>•</Text>
                <Text style={styles.specText}>{formattedRuntime}</Text>
              </>
            )}
            {film.mtrcb_rating && (
              <>
                <Text style={styles.specDot}>•</Text>
                <View style={styles.mtrcbBadge}>
                  <Text style={styles.mtrcbText}>{film.mtrcb_rating}</Text>
                </View>
              </>
            )}
          </View>

          {/* Studio Name if available */}
          {film.studio && (
            <Text style={styles.studioText} numberOfLines={1}>
              {film.studio.name}
            </Text>
          )}

          {/* Genres Chips */}
          <View style={styles.genresWrap}>
            {film.genres.slice(0, 3).map((genre) => (
              <Chip
                key={genre}
                label={genre}
                variant="outlined"
                style={styles.genreChip}
                textStyle={styles.genreChipText}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    position: 'relative',
    paddingBottom: 16,
  },
  backdropContainer: {
    height: BACKDROP_HEIGHT,
    width: SCREEN_WIDTH,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  backdropImageWrap: {
    width: SCREEN_WIDTH,
    height: BACKDROP_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  backdropImage: {
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
  topScrimWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 1,
  },
  bottomScrimWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 260,
    zIndex: 1,
  },
  metadataContent: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: -85,
    zIndex: 2,
    gap: 16,
    alignItems: 'flex-start',
  },
  posterWrapper: {
    width: 120,
    height: 180, // 2:3 aspect ratio
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 8,
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  infoCol: {
    flex: 1,
    paddingTop: 6,
    gap: 4,
  },
  primaryTitle: {
    ...typography.title,
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  originalTitle: {
    ...typography.caption,
    fontSize: 13,
    color: '#8A8A8A',
    fontStyle: 'italic',
  },
  directorText: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 13,
    marginTop: 2,
  },
  directorName: {
    color: '#D4D4D4',
    fontWeight: '600',
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  specText: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 12,
  },
  specDot: {
    color: '#2E2E2E',
    fontSize: 12,
  },
  mtrcbBadge: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.xs,
  },
  mtrcbText: {
    ...typography.mono,
    color: '#D4D4D4',
    fontSize: 10,
    fontWeight: '700',
  },
  studioText: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  genresWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  genreChip: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.full,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  genreChipText: {
    fontSize: 11,
    color: '#D4D4D4',
  },
});

