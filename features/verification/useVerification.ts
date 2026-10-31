import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchVerificationRequests,
  submitVerificationRequest,
  approveVerificationRequest,
  rejectVerificationRequest,
  fetchUserVerificationStatus,
} from './api';
import { VerificationRequestStatus, SubmitVerificationPayload } from './types';

export function useVerificationRequests(statusFilter: VerificationRequestStatus | 'all' = 'all') {
  return useQuery({
    queryKey: ['verificationRequests', statusFilter],
    queryFn: () => fetchVerificationRequests(statusFilter),
    staleTime: 1000 * 60 * 2,
  });
}

export function useSubmitVerificationRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitVerificationPayload) => submitVerificationRequest(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['verificationRequests'] });
      void queryClient.invalidateQueries({ queryKey: ['userVerificationStatus'] });
    },
  });
}

export function useApproveVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (param: string | { requestId: string; adminId?: string }) =>
      approveVerificationRequest(param),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['verificationRequests'] });
      void queryClient.invalidateQueries({ queryKey: ['studios'] });
      void queryClient.invalidateQueries({ queryKey: ['festivals'] });
      void queryClient.invalidateQueries({ queryKey: ['people'] });
    },
  });
}

export function useRejectVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (param: string | { requestId: string; notes?: string; adminId?: string }) =>
      rejectVerificationRequest(param),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['verificationRequests'] });
    },
  });
}

export function useUserVerificationStatus(userId?: string) {
  return useQuery({
    queryKey: ['userVerificationStatus', userId],
    queryFn: () => (userId ? fetchUserVerificationStatus(userId) : null),
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 5,
  });
}

