import { useQuery } from '@tanstack/react-query';
import { fetchExploreData } from './api';

export function useExplore() {
  return useQuery({
    queryKey: ['exploreData'],
    queryFn: fetchExploreData,
  });
}

