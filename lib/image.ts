/**
 * Takilya Image Caching & Media Optimization
 *
 * Implements Prompt 2.7:
 * - Aggressive disk and memory caching via expo-image (`memory-disk`)
 * - Smooth blurhash placeholders while network images load
 * - Pre-configured priority profiles for Posters, Backdrops, and Avatars
 */

export const DEFAULT_BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}Z';

export const POSTER_IMAGE_PROPS = {
  cachePolicy: 'memory-disk' as const,
  transition: 250,
  priority: 'high' as const,
  placeholder: { blurhash: DEFAULT_BLURHASH },
  contentFit: 'cover' as const,
};

export const BACKDROP_IMAGE_PROPS = {
  cachePolicy: 'memory-disk' as const,
  transition: 300,
  priority: 'high' as const,
  placeholder: { blurhash: DEFAULT_BLURHASH },
  contentFit: 'cover' as const,
};

export const AVATAR_IMAGE_PROPS = {
  cachePolicy: 'memory-disk' as const,
  transition: 200,
  priority: 'normal' as const,
  placeholder: { blurhash: DEFAULT_BLURHASH },
  contentFit: 'cover' as const,
};

export const THUMBNAIL_IMAGE_PROPS = {
  cachePolicy: 'memory-disk' as const,
  transition: 150,
  priority: 'low' as const,
  placeholder: { blurhash: DEFAULT_BLURHASH },
  contentFit: 'cover' as const,
};

