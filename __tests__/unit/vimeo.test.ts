import {
  extractVimeoId,
  resolveVimeoId,
  getVimeoEmbedUrl,
  getVimeoVideoUrl,
  detectVideoPlatform,
  DEFAULT_VIMEO_FALLBACK_ID,
} from '../../lib/video';

describe('Unit Test: Vimeo Video Utility & Embed Generation', () => {
  const VERIFIED_VIMEO_ITEMS = [
    {
      film: 'Leonor Will Never Die',
      id: '769367056',
      url: 'https://vimeo.com/769367056',
    },
    {
      film: 'John Denver Trending',
      id: '368470441',
      url: 'https://vimeo.com/368470441',
    },
    {
      film: 'Himala',
      id: '138298816',
      url: 'https://vimeo.com/138298816',
    },
    {
      film: 'Cleaners (Fallback)',
      id: '769367056',
      url: 'https://player.vimeo.com/video/769367056',
    },
  ];

  describe('extractVimeoId', () => {
    it('extracts ID from clean numeric string', () => {
      VERIFIED_VIMEO_ITEMS.forEach(({ id }) => {
        expect(extractVimeoId(id)).toBe(id);
      });
    });

    it('extracts ID from full vimeo.com URL', () => {
      VERIFIED_VIMEO_ITEMS.forEach(({ id, url }) => {
        expect(extractVimeoId(url)).toBe(id);
      });
    });

    it('extracts ID from player.vimeo.com URL', () => {
      expect(extractVimeoId('https://player.vimeo.com/video/769367056?autoplay=1')).toBe('769367056');
    });

    it('returns null for empty or invalid input', () => {
      expect(extractVimeoId(null)).toBeNull();
      expect(extractVimeoId(undefined)).toBeNull();
      expect(extractVimeoId('')).toBeNull();
      expect(extractVimeoId('not-a-vimeo-link')).toBeNull();
    });
  });

  describe('resolveVimeoId', () => {
    it('resolves valid Vimeo ID when provided', () => {
      expect(resolveVimeoId('138298816')).toBe('138298816');
      expect(resolveVimeoId('https://vimeo.com/368470441')).toBe('368470441');
    });

    it('returns DEFAULT_VIMEO_FALLBACK_ID when input is invalid or missing', () => {
      expect(resolveVimeoId(null)).toBe(DEFAULT_VIMEO_FALLBACK_ID);
      expect(resolveVimeoId('')).toBe(DEFAULT_VIMEO_FALLBACK_ID);
      expect(resolveVimeoId('invalid')).toBe(DEFAULT_VIMEO_FALLBACK_ID);
      expect(DEFAULT_VIMEO_FALLBACK_ID).toBe('769367056');
    });
  });

  describe('getVimeoEmbedUrl', () => {
    it('generates compliant autoplay looping embed URL with muted state', () => {
      const url = getVimeoEmbedUrl('769367056');
      expect(url).toContain('https://player.vimeo.com/video/769367056');
      expect(url).toContain('autoplay=1');
      expect(url).toContain('loop=1');
      expect(url).toContain('byline=0');
      expect(url).toContain('title=0');
      expect(url).toContain('portrait=0');
      expect(url).toContain('muted=1');
      expect(url).toContain('playsinline=1');
      expect(url).toContain('dnt=1');
    });

    it('generates unmuted embed URL when isMuted is false', () => {
      const url = getVimeoEmbedUrl('769367056', false);
      expect(url).toContain('muted=0');
    });

    it('falls back to DEFAULT_VIMEO_FALLBACK_ID if empty', () => {
      const url = getVimeoEmbedUrl('');
      expect(url).toContain(`https://player.vimeo.com/video/${DEFAULT_VIMEO_FALLBACK_ID}`);
    });
  });

  describe('getVimeoVideoUrl', () => {
    it('generates canonical vimeo.com URL', () => {
      expect(getVimeoVideoUrl('138298816')).toBe('https://vimeo.com/138298816');
    });
  });

  describe('detectVideoPlatform', () => {
    it('detects vimeo URLs and IDs correctly', () => {
      expect(detectVideoPlatform('https://vimeo.com/769367056')).toBe('vimeo');
      expect(detectVideoPlatform('https://player.vimeo.com/video/138298816')).toBe('vimeo');
      expect(detectVideoPlatform('769367056')).toBe('vimeo');
      expect(detectVideoPlatform('368470441')).toBe('vimeo');
    });

    it('detects tiktok and youtube platforms', () => {
      expect(detectVideoPlatform('https://www.tiktok.com/@user/video/7445243271833488648')).toBe('tiktok');
      expect(detectVideoPlatform('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('youtube');
    });
  });
});

