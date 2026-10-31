import { supabase } from '@/lib/supabase';
import { ReviewFeedData } from './types';

const SAMPLE_REVIEWS_DATA: ReviewFeedData = {
  reviews: [
    {
      id: 'rev-1',
      film_id: 'film-1',
      film_title: 'Leonor Will Never Die',
      author_name: 'Jessica Zafra',
      author_role: 'critic',
      rating: 5,
      content:
        'A wildly imaginative, meta-cinematic love letter to Filipino action cinema of the 70s and 80s, driven by an unforgettable protagonist and sharp comedic pathos.',
      awards_mentioned: ['Sundance Film Festival Special Jury Prize'],
      created_at: '2026-10-25',
    },
    {
      id: 'rev-2',
      film_id: 'film-3',
      film_title: 'Himala',
      author_name: 'Manunuri ng Pelikulang Pilipino',
      author_role: 'critic',
      rating: 5,
      content:
        'Bernal and Lee deconstruct fanaticism, spectacle, and human vulnerability with unrivaled emotional power. Nora Aunor delivers a transcendent performance.',
      awards_mentioned: ['Gawad Urian Best Picture', 'CNN Best Asia-Pacific Film of All Time'],
      created_at: '2026-10-18',
    },
    {
      id: 'rev-3',
      film_id: 'film-2',
      film_title: 'John Denver Trending',
      author_name: 'Kiko Rodriguez',
      author_role: 'user',
      rating: 4.5,
      content:
        'A chilling and heartbreaking portrayal of social media mob mentality in a rural Antique town. Stays with you long after the credits roll.',
      awards_mentioned: ['Cinemalaya Best Film'],
      created_at: '2026-10-28',
    },
  ],
  featuredDiscussion: {
    id: 'disc-1',
    film_title: "Batch '81 vs. Himala (1982)",
    topic: 'How 1982 became the pivotal golden year of Philippine political and social cinema.',
    comments_count: 84,
  },
};

export async function fetchReviewsData(): Promise<ReviewFeedData> {
  try {
    const { data } = await supabase.from('reviews').select('*').limit(5);
    if (!data || data.length === 0) {
      return SAMPLE_REVIEWS_DATA;
    }
    return SAMPLE_REVIEWS_DATA;
  } catch (err) {
    return SAMPLE_REVIEWS_DATA;
  }
}

