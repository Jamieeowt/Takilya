-- ==============================================================================
-- Takilya: Feed Functions & RPCs
-- Increments trailer view count after 3 seconds of continuous playback
-- ==============================================================================

create or replace function public.increment_trailer_view_count(t_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.trailers
  set view_count = view_count + 1
  where id = t_id;
end;
$$;

-- Allow anon and authenticated cinephiles to record trailer views
grant execute on function public.increment_trailer_view_count(uuid) to anon, authenticated;

