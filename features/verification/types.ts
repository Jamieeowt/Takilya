export type VerificationTargetType = 'studio' | 'festival' | 'person';
export type VerificationRequestStatus = 'pending' | 'approved' | 'rejected';

export interface VerificationRequest {
  id: string;
  user_id: string;
  user_username?: string;
  user_display_name?: string;
  target_type: VerificationTargetType;
  target_id: string;
  entity_name: string;
  proof_url: string;
  notes?: string | null;
  status: VerificationRequestStatus;
  created_at: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  applicant?: {
    username?: string | null;
    display_name?: string | null;
    avatar_url?: string | null;
    role?: string | null;
  };
}

export interface SubmitVerificationPayload {
  user_id?: string;
  target_type: VerificationTargetType;
  target_id?: string;
  entity_name: string;
  proof_url: string;
  notes?: string;
}
