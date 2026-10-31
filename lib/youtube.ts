/**
 * YouTube Utility functions for Takilya
 * Strict YouTube embed and ID extraction per AGENTS.md rules.
 */

/**
 * Safely extracts the 11-character YouTube video ID from any format:
 * - Pure 11-character ID: "7lMwbA9bUVo"
 * - Standard watch URL: "https://www.youtube.com/watch?v=7lMwbA9bUVo"
 * - Short URL: "https://youtu.be/7lMwbA9bUVo"
 * - Embed URL: "https://www.youtube.com/embed/7lMwbA9bUVo"
 * - Shorts URL: "https://www.youtube.com/shorts/7lMwbA9bUVo"
 * - URL with query params: "https://www.youtube.com/watch?v=7lMwbA9bUVo&feature=shared"
 */
export function extractYouTubeId(urlOrId?: string | null): string {
  if (!urlOrId) return '';
  const trimmed = urlOrId.trim();

  // If already exactly 11 valid characters, return directly
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Match standard, short, embed, live, or shorts YouTube URLs
  const regex =
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|live\/|watch\?(?:.*&)?v=|shorts\/))([a-zA-Z0-9_-]{11})/i;
  const match = trimmed.match(regex);
  if (match && match[1]) {
    return match[1];
  }

  return '';
}

/**
 * Returns high-resolution thumbnail URL from YouTube CDN
 */
export function getYouTubeThumbnailUrl(
  urlOrId?: string | null,
  quality: 'hqdefault' | 'mqdefault' | 'maxresdefault' = 'hqdefault'
): string {
  const videoId = extractYouTubeId(urlOrId);
  if (!videoId) return '';
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * Validates if a string is a valid 11-character YouTube video ID
 */
export function isValidYouTubeId(id?: string | null): boolean {
  if (!id) return false;
  return /^[a-zA-Z0-9_-]{11}$/.test(id.trim());
}

