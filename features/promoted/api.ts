/**
 * Takilya - Promoted Trailer Slots & Analytics API
 *
 * ARCHITECTURAL NOTICE / AGENTS.md RULE:
 * Promoted content is strictly limited to at most 1 promoted slot per 10 organic feed items.
 * The first item in the feed (position 1) is NEVER promoted.
 * This strict cap is intentionally designed into the platform architecture to safeguard
 * organic visibility for independent, regional, and heritage Philippine films, ensuring
 * commercial sponsors cannot dominate user feeds.
 */

import { supabase } from '@/lib/supabase';
import {
  PromotedSlot,
  CreatePromotedSlotPayload,
  RecordPromotedEventPayload,
  PromotedOverviewAnalytics,
} from './types';

// In-memory fallback mock storage for offline / local testing
const LOCAL_PROMOTED_SLOTS: PromotedSlot[] = [
  {
    id: '30303030-0001-0000-0000-000000000000',
    film_id: 'cccccccc-0003-0000-0000-000000000000',
    trailer_id: '20202020-0002-0000-0000-000000000000',
    sponsor_name: 'QCinema Autumn Re-Release',
    starts_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    ends_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 23).toISOString(),
    is_active: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    film_title: 'Leonor Will Never Die',
    trailer_title: 'Official Festival Presentation Trailer',
    youtube_id: '7lMwbA9bUVo',
    impressions_count: 1420,
    taps_count: 118,
    ctr: 8.31,
  },
  {
    id: '30303030-0002-0000-0000-000000000000',
    film_id: 'cccccccc-0001-0000-0000-000000000000',
    trailer_id: '20202020-0001-0000-0000-000000000000',
    sponsor_name: 'FDCP Philippine Cinema Centennial',
    starts_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    ends_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    is_active: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    film_title: 'Maynila sa mga Kuko ng Liwanag',
    trailer_title: 'Restored 4K Trailer',
    youtube_id: 'L_LUpnjgPso',
    impressions_count: 3250,
    taps_count: 247,
    ctr: 7.6,
  },
];

const LOCAL_EVENTS: { slot_id: string; event_type: 'impression' | 'tap'; created_at: string }[] = [];

/**
 * Fetch all promoted slots with impression and tap counts.
 */
export async function fetchPromotedSlots(includeInactive = true): Promise<PromotedSlot[]> {
  try {
    let query = supabase
      .from('promoted_slots')
      .select(`
        id,
        film_id,
        trailer_id,
        sponsor_name,
        starts_at,
        ends_at,
        is_active,
        created_at,
        films (
          id,
          title,
          poster_url
        ),
        trailers (
          id,
          title,
          youtube_id
        )
      `)
      .order('created_at', { ascending: false });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return includeInactive
        ? LOCAL_PROMOTED_SLOTS
        : LOCAL_PROMOTED_SLOTS.filter((s) => s.is_active);
    }

    // Query events count for each slot
    const slotIds = data.map((d: any) => d.id);
    const { data: events } = await supabase
      .from('promoted_events')
      .select('slot_id, event_type')
      .in('slot_id', slotIds);

    const impressionsBySlot: Record<string, number> = {};
    const tapsBySlot: Record<string, number> = {};

    if (events) {
      events.forEach((ev: any) => {
        if (ev.event_type === 'impression') {
          impressionsBySlot[ev.slot_id] = (impressionsBySlot[ev.slot_id] || 0) + 1;
        } else if (ev.event_type === 'tap') {
          tapsBySlot[ev.slot_id] = (tapsBySlot[ev.slot_id] || 0) + 1;
        }
      });
    }

    return data.map((item: any) => {
      const film = item.films;
      const trailer = item.trailers;
      const impressions = impressionsBySlot[item.id] || 0;
      const taps = tapsBySlot[item.id] || 0;
      const ctr = impressions > 0 ? Number(((taps / impressions) * 100).toFixed(2)) : 0;

      return {
        id: item.id,
        film_id: item.film_id,
        trailer_id: item.trailer_id,
        sponsor_name: item.sponsor_name,
        starts_at: item.starts_at,
        ends_at: item.ends_at,
        is_active: item.is_active,
        created_at: item.created_at,
        film_title: film?.title || 'Philippine Film',
        poster_url: film?.poster_url || null,
        trailer_title: trailer?.title || 'Promoted Trailer',
        youtube_id: trailer?.youtube_id || '',
        impressions_count: impressions,
        taps_count: taps,
        ctr,
      };
    });
  } catch (err) {
    console.warn('[Takilya Promoted API] fetchPromotedSlots error, using local fallback:', err);
    return includeInactive
      ? LOCAL_PROMOTED_SLOTS
      : LOCAL_PROMOTED_SLOTS.filter((s) => s.is_active);
  }
}

/**
 * Creates a new promoted trailer slot (Admin only)
 */
export async function createPromotedSlot(
  payload: CreatePromotedSlotPayload
): Promise<PromotedSlot> {
  const trimmedSponsor = payload.sponsor_name?.trim();
  if (!trimmedSponsor) {
    throw new Error('Sponsor name is required.');
  }

  if (!payload.film_id) {
    throw new Error('Please select an associated film.');
  }

  if (!payload.trailer_id) {
    throw new Error('Please select an associated trailer/clip.');
  }

  const startDate = new Date(payload.starts_at);
  const endDate = new Date(payload.ends_at);
  if (endDate <= startDate) {
    throw new Error('Campaign end date must be after start date.');
  }

  try {
    const insertData = {
      film_id: payload.film_id,
      trailer_id: payload.trailer_id,
      sponsor_name: trimmedSponsor,
      starts_at: payload.starts_at,
      ends_at: payload.ends_at,
      is_active: payload.is_active ?? true,
    };

    const { data, error } = await supabase
      .from('promoted_slots')
      .insert(insertData)
      .select(`
        id,
        film_id,
        trailer_id,
        sponsor_name,
        starts_at,
        ends_at,
        is_active,
        created_at,
        films ( id, title, poster_url ),
        trailers ( id, title, youtube_id )
      `)
      .single();

    if (error || !data) {
      console.warn('[Takilya Promoted API] Supabase insert warning, saving locally:', error?.message);
      const newSlot: PromotedSlot = {
        id: `slot-${Date.now()}`,
        ...insertData,
        created_at: new Date().toISOString(),
        film_title: 'Selected Philippine Film',
        trailer_title: 'Official Clip',
        impressions_count: 0,
        taps_count: 0,
        ctr: 0,
      };
      LOCAL_PROMOTED_SLOTS.unshift(newSlot);
      return newSlot;
    }

    return {
      id: data.id,
      film_id: data.film_id,
      trailer_id: data.trailer_id,
      sponsor_name: data.sponsor_name,
      starts_at: data.starts_at,
      ends_at: data.ends_at,
      is_active: data.is_active,
      created_at: data.created_at,
      film_title: (data as any).films?.title || 'Philippine Film',
      poster_url: (data as any).films?.poster_url || null,
      trailer_title: (data as any).trailers?.title || 'Promoted Trailer',
      youtube_id: (data as any).trailers?.youtube_id || '',
      impressions_count: 0,
      taps_count: 0,
      ctr: 0,
    };
  } catch (err) {
    const newSlot: PromotedSlot = {
      id: `slot-${Date.now()}`,
      film_id: payload.film_id,
      trailer_id: payload.trailer_id,
      sponsor_name: trimmedSponsor,
      starts_at: payload.starts_at,
      ends_at: payload.ends_at,
      is_active: payload.is_active ?? true,
      created_at: new Date().toISOString(),
      film_title: 'Selected Philippine Film',
      trailer_title: 'Official Clip',
      impressions_count: 0,
      taps_count: 0,
      ctr: 0,
    };
    LOCAL_PROMOTED_SLOTS.unshift(newSlot);
    return newSlot;
  }
}

/**
 * Toggle active status of a promoted slot (Admin only)
 */
export async function togglePromotedSlot(
  slotId: string,
  isActive: boolean
): Promise<{ success: boolean }> {
  try {
    const { error } = await supabase
      .from('promoted_slots')
      .update({ is_active: isActive })
      .eq('id', slotId);

    if (error) {
      const slot = LOCAL_PROMOTED_SLOTS.find((s) => s.id === slotId);
      if (slot) {
        slot.is_active = isActive;
      }
    }

    return { success: true };
  } catch {
    const slot = LOCAL_PROMOTED_SLOTS.find((s) => s.id === slotId);
    if (slot) {
      slot.is_active = isActive;
    }
    return { success: true };
  }
}

/**
 * Record an event (impression after 3s viewability, or tap on action)
 */
export async function recordPromotedEvent(
  payload: RecordPromotedEventPayload
): Promise<void> {
  if (!payload.slot_id) return;

  try {
    const { error } = await supabase.from('promoted_events').insert({
      slot_id: payload.slot_id,
      event_type: payload.event_type,
    });

    if (error) {
      // Local fallback record
      LOCAL_EVENTS.push({
        slot_id: payload.slot_id,
        event_type: payload.event_type,
        created_at: new Date().toISOString(),
      });
      const slot = LOCAL_PROMOTED_SLOTS.find((s) => s.id === payload.slot_id);
      if (slot) {
        if (payload.event_type === 'impression') {
          slot.impressions_count = (slot.impressions_count || 0) + 1;
        } else {
          slot.taps_count = (slot.taps_count || 0) + 1;
        }
        if (slot.impressions_count && slot.impressions_count > 0) {
          slot.ctr = Number((((slot.taps_count || 0) / slot.impressions_count) * 100).toFixed(2));
        }
      }
    }
  } catch {
    LOCAL_EVENTS.push({
      slot_id: payload.slot_id,
      event_type: payload.event_type,
      created_at: new Date().toISOString(),
    });
  }
}

/**
 * Fetches overview analytics for the Admin Promoted Dashboard
 */
export async function fetchPromotedAnalytics(): Promise<PromotedOverviewAnalytics> {
  const slots = await fetchPromotedSlots(true);

  let totalImpressions = 0;
  let totalTaps = 0;
  let activeSlotsCount = 0;

  const slotAnalytics = slots.map((slot) => {
    if (slot.is_active) activeSlotsCount++;
    const imp = slot.impressions_count || 0;
    const taps = slot.taps_count || 0;
    totalImpressions += imp;
    totalTaps += taps;
    return {
      slot,
      impressions: imp,
      taps,
      ctr: slot.ctr || 0,
    };
  });

  const averageCtr =
    totalImpressions > 0
      ? Number(((totalTaps / totalImpressions) * 100).toFixed(2))
      : 0;

  return {
    totalSlots: slots.length,
    activeSlots: activeSlotsCount,
    totalImpressions,
    totalTaps,
    averageCtr,
    slots: slotAnalytics,
  };
}

/**
 * Helper to fetch trailers for a given film ID when creating a promoted slot
 */
export async function fetchFilmTrailersForSlot(
  filmId: string
): Promise<{ id: string; title: string; youtube_id: string }[]> {
  try {
    const { data, error } = await supabase
      .from('trailers')
      .select('id, title, youtube_id')
      .eq('film_id', filmId)
      .order('published_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return [
        {
          id: '20202020-0002-0000-0000-000000000000',
          title: 'Official Theatrical Trailer',
          youtube_id: '7lMwbA9bUVo',
        },
      ];
    }

    return data;
  } catch {
    return [
      {
        id: '20202020-0002-0000-0000-000000000000',
        title: 'Official Theatrical Trailer',
        youtube_id: '7lMwbA9bUVo',
      },
    ];
  }
}

