import { supabase } from '@/lib/supabase';
import { VideoItem } from '@/features/films/types';

/**
 * Sample fallback clips of iconic and indie Philippine cinema
 * for testing and offline development
 */
export const SAMPLE_FEED_VIDEOS: VideoItem[] = [
  {
    id: 'vid-1',
    film_id: 'film-1',
    film_title: 'Leonor Will Never Die',
    youtube_video_id: '7lMwbA9bUVo',
    type: 'trailer',
    title: 'Official Sundance Trailer',
    director: 'Martika Ramirez Escobar',
    release_year: 2022,
    critic_score: 91,
    audience_score: 87,
    is_promoted: false,
    views_count: 14200,
  },
  {
    id: 'vid-2',
    film_id: 'film-2',
    film_title: 'John Denver Trending',
    youtube_video_id: 'dQw4w9WgXcQ',
    type: 'clip',
    title: 'Official Festival Clip - Cinemalaya',
    director: 'Arden Rod Condez',
    release_year: 2019,
    critic_score: 89,
    audience_score: 85,
    is_promoted: false,
    views_count: 9800,
  },
  {
    id: 'vid-3',
    film_id: 'film-3',
    film_title: 'Himala (Restored 4K)',
    youtube_video_id: 'L_LUpnjgPso',
    type: 'trailer',
    title: 'Heritage 4K Restoration Trailer',
    director: 'Ishmael Bernal (National Artist)',
    release_year: 1982,
    critic_score: 98,
    audience_score: 95,
    is_promoted: false,
    views_count: 45000,
  },
  {
    id: 'vid-4',
    film_id: 'film-4',
    film_title: 'Cleaners',
    youtube_video_id: 'kJQP7kiw5Fk',
    type: 'trailer',
    title: 'Photocopied High School Coming-of-Age',
    director: 'Glenn Barit',
    release_year: 2019,
    critic_score: 94,
    audience_score: 90,
    is_promoted: true,
    promoted_label: 'QCinema Feature',
    views_count: 18500,
  },
];

export async function fetchFeedVideos(page = 1, pageSize = 10): Promise<VideoItem[]> {
  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from('trailers')
      .select('id, film_id, youtube_id, title, type, view_count, films(id, title, release_date)')
      .range(from, to);

    if (error || !data || data.length === 0) {
      // Return structured sample feed items if Supabase table is not yet seeded
      return SAMPLE_FEED_VIDEOS;
    }

    return data.map((item: any) => ({
      id: item.id,
      film_id: item.film_id,
      film_title: item.films?.title || 'Philippine Film',
      youtube_video_id: item.youtube_id,
      type: item.type === 'clip' ? 'clip' : 'trailer',
      title: item.title,
      director: 'Filipino Filmmaker',
      release_year: item.films?.release_date ? new Date(item.films.release_date).getFullYear() : 2024,
      critic_score: 90,
      audience_score: 88,
      is_promoted: false,
      views_count: Number(item.view_count || 0),
    }));
  } catch (err) {
    console.warn('Supabase fetchFeedVideos error, fallback to sample data:', err);
    return SAMPLE_FEED_VIDEOS;
  }
}
