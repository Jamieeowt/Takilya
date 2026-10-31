export type ReportTargetType = 'trailer' | 'review' | 'comment' | 'thread' | 'user';

export type ReportStatusType = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export interface ReportItem {
  id: string;
  reporter_id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  status: ReportStatusType;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at: string;
}

export interface SubmitReportPayload {
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  details?: string;
}

export const REPORT_REASONS = [
  'Spam or misleading content',
  'Spoilers without warning tag',
  'Harassment or hate speech',
  'Piracy or unauthorized streaming links',
  'Inappropriate or offensive media',
  'Other violation',
] as const;

