import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCommunityActivity,
  toggleLikeReview,
  fetchReviewComments,
  addReviewComment,
  searchFilmsForList,
  createCuratedListWithFilms,
} from './api';
import { ActivityItem, ReviewComment, CuratedListDraft } from './types';

export function useCommunityActivity(
  userId?: string,
  filter: 'all' | 'following' | 'reviews' = 'all'
) {
  return useQuery({
    queryKey: ['communityActivity', userId, filter],
    queryFn: () => fetchCommunityActivity(userId, filter),
    staleTime: 1000 * 30, // 30s
  });
}

export function useToggleLikeReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      reviewId,
      currentlyLiked,
    }: {
      userId: string;
      reviewId: string;
      currentlyLiked: boolean;
      activityId?: string;
    }) => toggleLikeReview(userId, reviewId, currentlyLiked),

    onMutate: async ({ reviewId, currentlyLiked, activityId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['communityActivity'] });

      // Optimistically update all matching community activity queries
      const queries = queryClient.getQueriesData<ActivityItem[]>({
        queryKey: ['communityActivity'],
      });

      const delta = currentlyLiked ? -1 : 1;

      queries.forEach(([queryKey, oldData]) => {
        if (!oldData) return;
        queryClient.setQueryData<ActivityItem[]>(
          queryKey,
          oldData.map((item) => {
            if (item.review?.id === reviewId || item.id === activityId) {
              const updatedLikes = Math.max(0, item.likes_count + delta);
              return {
                ...item,
                likes_count: updatedLikes,
                is_liked: !currentlyLiked,
                review: item.review
                  ? {
                      ...item.review,
                      likes_count: updatedLikes,
                      is_liked: !currentlyLiked,
                    }
                  : undefined,
              };
            }
            return item;
          })
        );
      });

      return { queries };
    },

    onError: (_, __, context) => {
      if (context?.queries) {
        context.queries.forEach(([queryKey, oldData]) => {
          queryClient.setQueryData(queryKey, oldData);
        });
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['communityActivity'] });
    },
  });
}

export function useReviewComments(reviewId: string) {
  return useQuery({
    queryKey: ['reviewComments', reviewId],
    queryFn: () => fetchReviewComments(reviewId),
    enabled: Boolean(reviewId),
  });
}

export function useAddReviewComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      reviewId,
      body,
    }: {
      userId: string;
      reviewId: string;
      body: string;
    }) => addReviewComment(userId, reviewId, body),

    onMutate: async ({ reviewId, body, userId }) => {
      await queryClient.cancelQueries({ queryKey: ['reviewComments', reviewId] });

      const previousComments = queryClient.getQueryData<ReviewComment[]>([
        'reviewComments',
        reviewId,
      ]);

      const optimisticComment: ReviewComment = {
        id: 'opt-comment-' + Date.now(),
        review_id: reviewId,
        user: {
          id: userId,
          name: 'You',
          username: 'cinephile',
          role: 'user',
        },
        body,
        created_at: 'Just now',
      };

      if (previousComments) {
        queryClient.setQueryData<ReviewComment[]>(
          ['reviewComments', reviewId],
          [...previousComments, optimisticComment]
        );
      }

      // Also increment comment count in activity
      const queries = queryClient.getQueriesData<ActivityItem[]>({
        queryKey: ['communityActivity'],
      });

      queries.forEach(([queryKey, oldData]) => {
        if (!oldData) return;
        queryClient.setQueryData<ActivityItem[]>(
          queryKey,
          oldData.map((item) => {
            if (item.review?.id === reviewId) {
              return {
                ...item,
                comments_count: item.comments_count + 1,
                review: item.review
                  ? {
                      ...item.review,
                      comments_count: item.review.comments_count + 1,
                    }
                  : undefined,
              };
            }
            return item;
          })
        );
      });

      return { previousComments };
    },

    onError: (_, { reviewId }, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(['reviewComments', reviewId], context.previousComments);
      }
    },

    onSettled: (_, __, { reviewId }) => {
      void queryClient.invalidateQueries({ queryKey: ['reviewComments', reviewId] });
      void queryClient.invalidateQueries({ queryKey: ['communityActivity'] });
    },
  });
}

export function useSearchFilmsForList(query: string) {
  return useQuery({
    queryKey: ['searchFilmsForList', query],
    queryFn: () => searchFilmsForList(query),
    enabled: query.trim().length >= 2,
    staleTime: 1000 * 60,
  });
}

export function useCreateCuratedList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      draft,
    }: {
      userId: string;
      draft: CuratedListDraft;
    }) => createCuratedListWithFilms(userId, draft),

    onSuccess: (_, { userId }) => {
      void queryClient.invalidateQueries({ queryKey: ['communityActivity'] });
      void queryClient.invalidateQueries({ queryKey: ['userCustomLists', userId] });
      void queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
    },
  });
}

