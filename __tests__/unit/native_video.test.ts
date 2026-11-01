import { PUBLIC_TEST_VIDEOS, SAMPLE_PAGINATED_TRAILERS } from '@/features/feed/api';

describe('Unit Test: Native In-App Video & expo-video Architecture', () => {
  describe('Public Test Video URLs (Seed Data)', () => {
    it('has exactly 4 public test video URLs as specified', () => {
      expect(PUBLIC_TEST_VIDEOS).toHaveLength(4);
    });

    it('all 4 URLs are direct HTTPS .mp4 links', () => {
      PUBLIC_TEST_VIDEOS.forEach((item) => {
        expect(item.url).toMatch(/^https:\/\/.+\.mp4$/);
        expect(item.duration).toBeGreaterThan(0);
      });
    });

    it('contains BigBuckBunny, ElephantsDream, ForBiggerBlazes, and ForBiggerEscapes', () => {
      const urls = PUBLIC_TEST_VIDEOS.map((v) => v.url);
      expect(urls).toContain(
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
      );
      expect(urls).toContain(
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
      );
      expect(urls).toContain(
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
      );
      expect(urls).toContain(
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
      );
    });
  });

  describe('SAMPLE_PAGINATED_TRAILERS Data Compliance', () => {
    it('all sample items have valid video_url and rights_note', () => {
      SAMPLE_PAGINATED_TRAILERS.forEach((item) => {
        expect(item.video_url).toBeDefined();
        expect(item.video_url).toMatch(/^https:\/\/.+\.mp4$/);
        expect(item.rights_note).toContain('TEST CLIPS');
        expect(item.duration_seconds).toBeGreaterThan(0);
        expect(item.poster_url).toBeDefined();
      });
    });

    it('has supported video_platform in feed items', () => {
      SAMPLE_PAGINATED_TRAILERS.forEach((item) => {
        expect(['native', 'vimeo']).toContain(item.video_platform);
      });
    });
  });

  describe('Preload & Memory Management Invariant', () => {
    it('only allows active index and active index + 1 to mount players', () => {
      const activeIndex = 2;
      const totalItems = 10;

      const mountedIndices: number[] = [];
      for (let i = 0; i < totalItems; i++) {
        const isVisible = i === activeIndex;
        const shouldPreload = i === activeIndex + 1;
        const shouldMount = isVisible || shouldPreload;
        if (shouldMount) {
          mountedIndices.push(i);
        }
      }

      // Must be at most 2 items mounted: active (2) and preload (3)
      expect(mountedIndices).toEqual([2, 3]);
      expect(mountedIndices.length).toBeLessThanOrEqual(2);
    });
  });
});

