import {
  extractTikTokId,
  getTikTokEmbedHtml,
  getTikTokVideoUrl,
  isValidTikTokId,
} from '../../lib/tiktok';
import { detectVideoPlatform, parseVideoSource } from '../../lib/video';

describe('Unit Test: TikTok Utility & Video Platform Detection', () => {
  const VERIFIED_TIKTOK_ITEMS = [
    {
      film: 'Leonor Will Never Die',
      id: '7652287895692266769',
      url: 'https://www.tiktok.com/@le.filesofxy/video/7652287895692266769',
    },
    {
      film: 'Cleaners',
      id: '7608148655559920917',
      url: 'https://www.tiktok.com/@cteau2wins/video/7608148655559920917',
    },
    {
      film: 'Himala',
      id: '7445243271833488648',
      url: 'https://www.tiktok.com/@creazionstudios/video/7445243271833488648',
    },
    {
      film: 'John Denver Trending',
      id: '7684804262509006088',
      url: 'https://www.tiktok.com/@yeonhonq/video/7684804262509006088',
    },
  ];

  describe('extractTikTokId', () => {
    it('extracts ID from raw numeric string', () => {
      VERIFIED_TIKTOK_ITEMS.forEach(({ id }) => {
        expect(extractTikTokId(id)).toBe(id);
      });
    });

    it('extracts ID from full web URL', () => {
      VERIFIED_TIKTOK_ITEMS.forEach(({ id, url }) => {
        expect(extractTikTokId(url)).toBe(id);
      });
    });

    it('extracts ID from embed URL', () => {
      const embedUrl = 'https://www.tiktok.com/embed/v2/7445243271833488648?lang=en-US';
      expect(extractTikTokId(embedUrl)).toBe('7445243271833488648');
    });

    it('extracts ID from short format /v/ URL', () => {
      const shortUrl = 'https://www.tiktok.com/v/7652287895692266769.html';
      expect(extractTikTokId(shortUrl)).toBe('7652287895692266769');
    });

    it('returns null for null, undefined, empty, or whitespace strings', () => {
      expect(extractTikTokId(null)).toBeNull();
      expect(extractTikTokId(undefined)).toBeNull();
      expect(extractTikTokId('')).toBeNull();
      expect(extractTikTokId('   ')).toBeNull();
    });

    it('returns null for invalid non-numeric strings', () => {
      expect(extractTikTokId('not-a-valid-id')).toBeNull();
      expect(extractTikTokId('12345')).toBeNull(); // Less than 10 digits
    });
  });

  describe('isValidTikTokId', () => {
    it('validates 15-22 digit numeric IDs', () => {
      expect(isValidTikTokId('7652287895692266769')).toBe(true);
      expect(isValidTikTokId('7445243271833488648')).toBe(true);
    });

    it('rejects short numbers and non-numeric strings', () => {
      expect(isValidTikTokId('12345')).toBe(false);
      expect(isValidTikTokId('abc7652287895692266769')).toBe(false);
      expect(isValidTikTokId(null)).toBe(false);
      expect(isValidTikTokId('')).toBe(false);
    });
  });

  describe('getTikTokEmbedHtml', () => {
    it('generates valid HTML document with embedded iframe and black styling', () => {
      const videoId = '7652287895692266769';
      const html = getTikTokEmbedHtml(videoId);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain(`https://www.tiktok.com/embed/v2/${videoId}?lang=en-US`);
      expect(html).toContain('background-color: #000000');
      expect(html).toContain('allowfullscreen');
    });

    it('extracts ID from full URL when generating embed HTML', () => {
      const url = 'https://www.tiktok.com/@le.filesofxy/video/7652287895692266769';
      const html = getTikTokEmbedHtml(url);

      expect(html).toContain('https://www.tiktok.com/embed/v2/7652287895692266769?lang=en-US');
    });
  });

  describe('getTikTokVideoUrl', () => {
    it('creates canonical TikTok watch URL', () => {
      const videoId = '7652287895692266769';
      expect(getTikTokVideoUrl(videoId)).toBe(`https://www.tiktok.com/video/${videoId}`);
    });
  });

  describe('detectVideoPlatform & parseVideoSource', () => {
    it('correctly detects TikTok from IDs and URLs', () => {
      expect(detectVideoPlatform('7652287895692266769')).toBe('tiktok');
      expect(
        detectVideoPlatform('https://www.tiktok.com/@le.filesofxy/video/7652287895692266769')
      ).toBe('tiktok');
    });

    it('correctly detects YouTube from IDs and URLs', () => {
      expect(detectVideoPlatform('7lMwbA9bUVo')).toBe('youtube');
      expect(detectVideoPlatform('https://www.youtube.com/watch?v=7lMwbA9bUVo')).toBe('youtube');
      expect(detectVideoPlatform('https://youtu.be/7lMwbA9bUVo')).toBe('youtube');
    });

    it('returns unknown for unrecognized sources', () => {
      expect(detectVideoPlatform('random-string-xyz')).toBe('unknown');
      expect(detectVideoPlatform('')).toBe('unknown');
      expect(detectVideoPlatform(null)).toBe('unknown');
    });

    it('parses platform and ID cleanly', () => {
      const parsedTikTok = parseVideoSource(
        'https://www.tiktok.com/@creazionstudios/video/7445243271833488648'
      );
      expect(parsedTikTok.platform).toBe('tiktok');
      expect(parsedTikTok.id).toBe('7445243271833488648');

      const parsedYouTube = parseVideoSource('https://youtu.be/7lMwbA9bUVo');
      expect(parsedYouTube.platform).toBe('youtube');
      expect(parsedYouTube.id).toBe('7lMwbA9bUVo');
    });
  });
});

