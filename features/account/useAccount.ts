import { useQuery } from '@tanstack/react-query';
import { fetchUserProfile } from './api';

export function useUserProfile(userId?: string) {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => fetchUserProfile(userId),
    // Query is always enabled; if no userId is passed, it loads default sample data
    enabled: true,
  });
}
