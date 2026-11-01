/**
 * Unified Video Utilities for Takilya
 * Supports dedicated Vimeo player embeds, TikTok vertical embeds, and YouTube fallback trailers.
 */

import { extractTikTokId, getTikTokEmbedHtml, isValidTikTokId, getTikTokVideoUrl } from './tiktok';
import { extractYouTubeId, getYouTubeThumbnailUrl, isValidYouTubeId } from './youtube';

export * from './tiktok';
export * from './youtube';

export type VideoPlatform = 'vimeo' | 'tiktok' | 'youtube' | 'unknown';

export const DEFAULT_VIMEO_FALLBACK_ID = '769367056';

/**
 * Safely extracts a numeric Vimeo ID from full URLs or clean numeric strings.
 * Handles formats:
 * - 769367056
 * - https://vimeo.com/769367056
 * - https://player.vimeo.com/video/769367056
 * - https://vimeo.com/channels/staffpicks/769367056
 */
export function extractVimeoId(urlOrId?: string | null): string | null {
  if (!urlOrId) return null;
  const str = String(urlOrId).trim();
  if (!str) return null;

  // Clean numeric ID (Vimeo IDs are typically 7 to 12 digits)
  if (/^\d{6,14}$/.test(str)) {
    return str;
  }

  // URL matching
  const match = str.match(/(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^/]*\/videos\/|video\/|))(\d{6,14})/i);
  if (match && match[1]) {
    return match[1];
  }

  // Any 7-12 digit sequence inside string
  const digitsMatch = str.match(/\b\d{7,12}\b/);
  if (digitsMatch) {
    return digitsMatch[0];
  }

  return null;
}

/**
 * Resolves a valid Vimeo ID with fallback
 */
export function resolveVimeoId(urlOrId?: string | null): string {
  const extracted = extractVimeoId(urlOrId);
  return extracted || DEFAULT_VIMEO_FALLBACK_ID;
}

/**
 * Generates the clean Vimeo background embed URL for in-app autoplay
 */
export function getVimeoEmbedUrl(vimeoId: string): string {
  const cleanId = extractVimeoId(vimeoId) || DEFAULT_VIMEO_FALLBACK_ID;
  return `https://player.vimeo.com/video/${cleanId}?background=1&autoplay=1&loop=1&byline=0&title=0&portrait=0&muted=1&playsinline=1&transparent=0&dnt=1`;
}

/**
 * Generates canonical Vimeo web URL
 */
export function getVimeoVideoUrl(vimeoId: string): string {
  const cleanId = extractVimeoId(vimeoId) || DEFAULT_VIMEO_FALLBACK_ID;
  return `https://vimeo.com/${cleanId}`;
}

/**
 * Determines whether a URL or video identifier belongs to Vimeo, TikTok, or YouTube.
 */
export function detectVideoPlatform(urlOrId?: string | null): VideoPlatform {
  if (!urlOrId) return 'unknown';
  const trimmed = urlOrId.trim();

  // If URL explicitly indicates domain
  if (trimmed.includes('vimeo.com')) return 'vimeo';
  if (trimmed.includes('tiktok.com')) return 'tiktok';
  if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) return 'youtube';

  // Check Vimeo numeric pattern (typically 8-10 digits)
  const vimeoId = extractVimeoId(trimmed);
  if (vimeoId && /^\d{8,11}$/.test(vimeoId)) {
    return 'vimeo';
  }

  // Check TikTok numeric pattern (typically 15-22 digits)
  const tiktokId = extractTikTokId(trimmed);
  if (tiktokId && /^\d{15,25}$/.test(tiktokId)) {
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
  if (platform === 'vimeo') {
    const id = extractVimeoId(urlOrId) || DEFAULT_VIMEO_FALLBACK_ID;
    return { platform: 'vimeo', id };
  }

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
