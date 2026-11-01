/**
 * Unified Video Utilities for Takilya
 * Seamlessly handles TikTok 9:16 vertical embeds and YouTube fallback trailers.
 */

import { extractTikTokId, getTikTokEmbedHtml, isValidTikTokId, getTikTokVideoUrl } from './tiktok';
import { extractYouTubeId, getYouTubeThumbnailUrl, isValidYouTubeId } from './youtube';

export * from './tiktok';
export * from './youtube';

export type VideoPlatform = 'tiktok' | 'youtube' | 'unknown';

/**
 * Determines whether a URL or video identifier belongs to TikTok or YouTube.
 */
export function detectVideoPlatform(urlOrId?: string | null): VideoPlatform {
  if (!urlOrId) return 'unknown';
  const trimmed = urlOrId.trim();

  // If URL explicitly indicates domain
  if (trimmed.includes('tiktok.com')) return 'tiktok';
  if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) return 'youtube';

  // Check TikTok numeric pattern (typically 15-22 digits, >=10)
  const tiktokId = extractTikTokId(trimmed);
  if (tiktokId && /^\d{10,25}$/.test(tiktokId)) {
    return 'tiktok';
  }

  // Check YouTube 11-char alphanumeric pattern
  const ytId = extractYouTubeId(trimmed);
  if (ytId && ytId.length === 11) {
    return 'youtube';
  }

  return 'unknown';
}

/**
 * Extracts platform and video ID from any video URL or identifier.
 */
export function parseVideoSource(urlOrId?: string | null): {
  platform: VideoPlatform;
  id: string;
} {
  if (!urlOrId) return { platform: 'unknown', id: '' };

  const platform = detectVideoPlatform(urlOrId);
  if (platform === 'tiktok') {
    const id = extractTikTokId(urlOrId) || '';
    return { platform: 'tiktok', id };
  }

  if (platform === 'youtube') {
    const id = extractYouTubeId(urlOrId);
    return { platform: 'youtube', id };
  }

  return { platform: 'unknown', id: urlOrId.trim() };
}

