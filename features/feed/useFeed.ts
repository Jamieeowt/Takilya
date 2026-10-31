import { useQuery } from '@tanstack/react-query';
import { fetchFeedVideos } from './api';

export function useFeedVideos(page = 1) {
  return useQuery({
    queryKey: ['feedVideos', page],
    queryFn: () => fetchFeedVideos(page),
  });
}

