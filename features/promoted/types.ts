/**
 * Takilya - Promoted Slots & Analytics Types
 * AGENTS.md rule: Promoted content is allowed only in clearly labeled promoted_slots,
 * shown at most 1 per 10 organic feed items, always with a visible "Promoted" tag.
 * The strict 1-per-10 cap exists to protect organic visibility for independent and regional films.
 */

export type PromotedEventType = 'impression' | 'tap';

export interface PromotedSlot {
  id: string;
  film_id: string;
  trailer_id: string;
  sponsor_name: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  created_at: string;
  // Augmented metadata
  film_title?: string;
  trailer_title?: string;
  youtube_id?: string;
  poster_url?: string | null;
  impressions_count?: number;
  taps_count?: number;
  ctr?: number; // e.g. 4.25 for 4.25%
}

export interface CreatePromotedSlotPayload {
  film_id: string;
  trailer_id: string;
  sponsor_name: string;
  starts_at: string;
  ends_at: string;
  is_active?: boolean;
}

export interface RecordPromotedEventPayload {
  slot_id: string;
  event_type: PromotedEventType;
}

export interface PromotedSlotAnalytics {
  slot: PromotedSlot;
  impressions: number;
  taps: number;
  ctr: number;
}

export interface PromotedOverviewAnalytics {
  totalSlots: number;
  activeSlots: number;
  totalImpressions: number;
  totalTaps: number;
  averageCtr: number;
  slots: PromotedSlotAnalytics[];
}

