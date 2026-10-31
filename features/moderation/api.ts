import { supabase } from '@/lib/supabase';
import { SubmitReportPayload, ReportItem } from './types';

/**
 * Submits a new moderation report to public.reports table
 */
export async function submitReport(payload: SubmitReportPayload): Promise<ReportItem> {
  const finalReason = payload.details
    ? `${payload.reason}: ${payload.details.trim()}`
    : payload.reason;

  const { data, error } = await supabase
    .from('reports')
    .insert({
      reporter_id: payload.reporterId,
      target_type: payload.targetType,
      target_id: payload.targetId,
      reason: finalReason,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to submit report. Please try again.');
  }

  return data as ReportItem;
}

