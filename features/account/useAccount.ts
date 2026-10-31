import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchUserProfile,
  fetchUserDiary,
  fetchUserWatchlist,
  fetchUserCustomLists,
  fetchUserReviews,
  updateUserProfile,
  updateTopFilms,
  removeFromWatchlist,
  createCustomList,
} from './api';
import { UserProfile } from './types';

export function useUserProfile(userId?: string) {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => fetchUserProfile(userId),
    enabled: true,
  });
}

export function useUserDiary(userId?: string) {
  return useQuery({
    queryKey: ['userDiary', userId],
    queryFn: () => fetchUserDiary(userId),
    enabled: true,
  });
}

export function useUserWatchlist(userId?: string) {
  return useQuery({
    queryKey: ['userWatchlist', userId],
    queryFn: () => fetchUserWatchlist(userId),
    enabled: true,
  });
}

export function useUserCustomLists(userId?: string) {
  return useQuery({
    queryKey: ['userCustomLists', userId],
    queryFn: () => fetchUserCustomLists(userId),
    enabled: true,
  });
}

export function useUserReviews(userId?: string) {
  return useQuery({
    queryKey: ['userReviews', userId],
    queryFn: () => fetchUserReviews(userId),
    enabled: true,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: { display_name?: string; bio?: string; avatar_url?: string };
    }) => updateUserProfile(userId, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['userProfile', variables.userId],
      });
    },
  });
}

export function useUpdateTopFilms() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      films,
    }: {
      userId: string;
      films: { filmId: string; position: number }[];
    }) => updateTopFilms(userId, films),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['userProfile', variables.userId],
      });
    },
  });
}

export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, filmId }: { userId: string; filmId: string }) =>
      removeFromWatchlist(userId, filmId),
    onMutate: async ({ userId, filmId }) => {
      await queryClient.cancelQueries({ queryKey: ['userWatchlist', userId] });
      const previous = queryClient.getQueryData(['userWatchlist', userId]);
      if (Array.isArray(previous)) {
        queryClient.setQueryData(
          ['userWatchlist', userId],
          previous.filter((item: any) => item.film_id !== filmId)
        );
      }
      return { previous };
    },
    onError: (_, { userId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['userWatchlist', userId], context.previous);
      }
    },
    onSettled: (_, __, { userId }) => {
      void queryClient.invalidateQueries({
        queryKey: ['userWatchlist', userId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['userProfile', userId],
      });
    },
  });
}

export function useCreateCustomList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      title,
      description,
      isPrivate,
    }: {
      userId: string;
      title: string;
      description?: string;
      isPrivate?: boolean;
    }) => createCustomList(userId, title, description, isPrivate),
    onSuccess: (_, { userId }) => {
      void queryClient.invalidateQueries({
        queryKey: ['userCustomLists', userId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['userProfile', userId],
      });
    },
  });
}
