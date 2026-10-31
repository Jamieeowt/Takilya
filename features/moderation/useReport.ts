import { useMutation } from '@tanstack/react-query';
import { submitReport } from './api';
import { SubmitReportPayload, ReportItem } from './types';

export function useSubmitReport() {
  return useMutation<ReportItem, Error, SubmitReportPayload>({
    mutationFn: (payload) => submitReport(payload),
  });
}

