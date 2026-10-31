export interface FilmReview {
  id: string;
  film_id: string;
  film_title: string;
  author_name: string;
  author_role: 'critic' | 'user';
  rating: number; // 1-5 or 1-10
  content: string;
  awards_mentioned?: string[];
  created_at: string;
}

export interface ReviewFeedData {
  reviews: FilmReview[];
  featuredDiscussion: {
    id: string;
    film_title: string;
    topic: string;
    comments_count: number;
  };
}

