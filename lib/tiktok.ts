/**
 * TikTok Video Utility functions for Takilya
 * Native vertical 9:16 video embed engine for Philippine cinema trailers.
 */

/**
 * Safely extracts the numeric TikTok video ID from full URLs or raw IDs.
 * Handles:
 * - Raw numeric ID: "7652287895692266769"
 * - Standard web URL: "https://www.tiktok.com/@le.filesofxy/video/7652287895692266769"
 * - Mobile / Embed URLs: "https://www.tiktok.com/embed/v2/7652287895692266769?lang=en-US"
 * - Shortened / Share URLs containing numeric ID segments
 */
export function extractTikTokId(urlOrId?: string | null): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();
  if (!trimmed) return null;

  // 1. Raw numeric ID (TikTok IDs are 15-22 digits, minimum 10 digits)
  if (/^\d{10,25}$/.test(trimmed)) {
    return trimmed;
  }

  // 2. Standard URL formats: /video/{id}, /embed/v2/{id}, /v/{id}
  const urlPattern = /(?:video\/|embed\/v2\/|embed\/|v\/)(\d{10,25})/i;
  const match = trimmed.match(urlPattern);
  if (match && match[1]) {
    return match[1];
  }

  // 3. Fallback: Any URL from tiktok.com domain with a long numeric sequence
  if (trimmed.includes('tiktok.com')) {
    const generalMatch = trimmed.match(/(\d{15,25})/);
    if (generalMatch && generalMatch[1]) {
      return generalMatch[1];
    }
  }

  return null;
}

/**
 * Generates a clean, black-background HTML document embedding the official TikTok vertical player
 */
export function getTikTokEmbedHtml(videoId: string): string {
  const sanitizedId = extractTikTokId(videoId) || videoId;
  return `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body {
        width: 100%;
        height: 100%;
        background-color: #000000;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      iframe {
        width: 100% !important;
        height: 100% !important;
        border: none !important;
      }
    </style>
  </head>
  <body>
    <iframe
      src="https://www.tiktok.com/embed/v2/${sanitizedId}?lang=en-US"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen>
    </iframe>
  </body>
</html>`;
}

/**
 * Validates if a string is a valid numeric TikTok video ID
 */
export function isValidTikTokId(id?: string | null): boolean {
  if (!id) return false;
  return /^\d{10,25}$/.test(id.trim());
}

/**
 * Returns canonical web URL for a TikTok video
 */
export function getTikTokVideoUrl(videoId: string): string {
  const sanitizedId = extractTikTokId(videoId) || videoId;
  return `https://www.tiktok.com/video/${sanitizedId}`;
}

