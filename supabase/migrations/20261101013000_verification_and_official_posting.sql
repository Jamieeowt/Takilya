-- ==============================================================================
-- TAKILYA: VERIFICATION REQUESTS & OFFICIAL POSTING WORKFLOW
-- ==============================================================================

create table if not exists public.verification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  target_type text not null check (target_type in ('studio', 'festival', 'person')),
  target_id uuid not null,
  entity_name text not null,
  proof_url text not null,
  notes text,
  status text default 'pending' not null check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id)
);

create index if not exists idx_verification_requests_user on public.verification_requests(user_id);
create index if not exists idx_verification_requests_status on public.verification_requests(status);
create index if not exists idx_verification_requests_target on public.verification_requests(target_type, target_id);

alter table public.verification_requests enable row level security;

-- Policies
create policy "Users can view their own verification requests"
  on public.verification_requests for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can insert their own verification requests"
  on public.verification_requests for insert
  with check (auth.uid() = user_id);

create policy "Admins can update verification requests"
  on public.verification_requests for update
  using (public.is_admin());

-- ==============================================================================
-- Stored Procedures for Verification Approval & Rejection
-- ==============================================================================

create or replace function public.approve_verification_request(p_request_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  v_request public.verification_requests%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Unauthorized: Only administrators can approve verification requests.';
  end if;

  select * into v_request from public.verification_requests where id = p_request_id;
  if not found then
    raise exception 'Verification request not found.';
  end if;

  -- 1. Update verification_requests record
  update public.verification_requests
  set status = 'approved',
      reviewed_at = timezone('utc'::text, now()),
      reviewed_by = auth.uid()
  where id = p_request_id;

  -- 2. Promote applicant's profile to verified_official
  update public.profiles
  set role = 'verified_official',
      verification_status = 'verified',
      updated_at = timezone('utc'::text, now())
  where id = v_request.user_id;

  -- 3. Set the target entity verification_status = 'verified'
  if v_request.target_type = 'studio' then
    update public.studios
    set verification_status = 'verified'
    where id = v_request.target_id;
  elsif v_request.target_type = 'festival' then
    update public.festivals
    set verification_status = 'verified'
    where id = v_request.target_id;
  elsif v_request.target_type = 'person' then
    update public.people
    set verification_status = 'verified'
    where id = v_request.target_id;
  end if;

  return json_build_object('success', true, 'request_id', p_request_id, 'status', 'approved');
end;
$$;

create or replace function public.reject_verification_request(
  p_request_id uuid,
  p_notes text default null
)
returns json
language plpgsql
security definer
as $$
declare
  v_request public.verification_requests%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Unauthorized: Only administrators can reject verification requests.';
  end if;

  select * into v_request from public.verification_requests where id = p_request_id;
  if not found then
    raise exception 'Verification request not found.';
  end if;

  update public.verification_requests
  set status = 'rejected',
      reviewed_at = timezone('utc'::text, now()),
      reviewed_by = auth.uid(),
      notes = coalesce(p_notes, notes)
  where id = p_request_id;

  return json_build_object('success', true, 'request_id', p_request_id, 'status', 'rejected');
end;
$$;

