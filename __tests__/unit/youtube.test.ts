import { extractYouTubeId, getYouTubeThumbnailUrl } from '../../lib/youtube';

describe('Unit Test: YouTube URL Parsing (Prompt 5.1 & AGENTS.md)', () => {
  const EXPECTED_ID = '7lMwbA9bUVo';

  it('extracts ID from standard watch URL', () => {
    const url = 'https://www.youtube.com/watch?v=7lMwbA9bUVo';
    expect(extractYouTubeId(url)).toBe(EXPECTED_ID);
  });

  it('extracts ID from short URL (youtu.be)', () => {
    const url = 'https://youtu.be/7lMwbA9bUVo';
    expect(extractYouTubeId(url)).toBe(EXPECTED_ID);
  });

  it('extracts ID from embed URL', () => {
    const url = 'https://www.youtube.com/embed/7lMwbA9bUVo';
    expect(extractYouTubeId(url)).toBe(EXPECTED_ID);
  });

  it('extracts ID from YouTube Shorts URL', () => {
    const url = 'https://www.youtube.com/shorts/7lMwbA9bUVo';
    expect(extractYouTubeId(url)).toBe(EXPECTED_ID);
  });

  it('extracts ID from URL with additional query parameters', () => {
    const url = 'https://www.youtube.com/watch?v=7lMwbA9bUVo&t=42s&feature=shared';
    expect(extractYouTubeId(url)).toBe(EXPECTED_ID);
  });

  it('handles raw 11-character video ID directly', () => {
    expect(extractYouTubeId('7lMwbA9bUVo')).toBe(EXPECTED_ID);
    expect(extractYouTubeId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('handles null, empty, or whitespace inputs gracefully', () => {
    expect(extractYouTubeId('')).toBe('');
    expect(extractYouTubeId(null)).toBe('');
    expect(extractYouTubeId(undefined)).toBe('');
    expect(extractYouTubeId('   ')).toBe('');
    expect(extractYouTubeId('invalid-non-id')).toBe('');
  });

  it('validates canonical Philippine cinema trailer IDs', () => {
    const canonicalTrailers = [
      { film: 'Leonor Will Never Die', id: '7lMwbA9bUVo' },
      { film: 'BuyBust', id: 'R8tHz3ZgJ4E' },
      { film: 'On the Job', id: 'GSdh2IkQYxC' },
      { film: 'Heneral Luna', id: 'I_tOzY_k34M' },
      { film: 'Goyo: Ang Batang Heneral', id: '1fXn01_FvD0' },
      { film: 'Himala', id: 'L_LUpnjgPso' },
    ];

    canonicalTrailers.forEach(({ film, id }) => {
      expect(extractYouTubeId(id)).toBe(id);
      expect(extractYouTubeId(`https://www.youtube.com/watch?v=${id}`)).toBe(id);
      expect(extractYouTubeId(`https://youtu.be/${id}`)).toBe(id);
    });
  });

  it('generates correct YouTube CDN thumbnail URLs', () => {
    const thumbHq = getYouTubeThumbnailUrl('7lMwbA9bUVo', 'hqdefault');
    expect(thumbHq).toBe('https://img.youtube.com/vi/7lMwbA9bUVo/hqdefault.jpg');

    const thumbMaxRes = getYouTubeThumbnailUrl('https://youtu.be/7lMwbA9bUVo', 'maxresdefault');
    expect(thumbMaxRes).toBe('https://img.youtube.com/vi/7lMwbA9bUVo/maxresdefault.jpg');
  });
});

