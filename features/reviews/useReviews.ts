import { useQuery } from '@tanstack/react-query';
import { fetchReviewsData } from './api';

export function useReviews() {
  return useQuery({
    queryKey: ['reviewsData'],
    queryFn: fetchReviewsData,
  });
}

