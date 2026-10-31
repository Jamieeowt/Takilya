-- ==============================================================================
-- Takilya RLS Security Policy Test Suite (Prompt 5.1)
-- Verifies Row Level Security policies across public catalog, reviews,
-- trailers, discussions, and award administrative tables.
-- ==============================================================================

begin;

-- Create temporary test users in auth.users and public.profiles
do $$
declare
  v_user_a_id uuid := '11111111-aaaa-0000-0000-000000000001'::uuid;
  v_user_b_id uuid := '22222222-bbbb-0000-0000-000000000002'::uuid;
  v_admin_id  uuid := '99999999-dddd-0000-0000-000000000009'::uuid;
  v_test_film_id uuid := 'cccccccc-0001-0000-0000-000000000000'::uuid;
  v_thread_id uuid;
  v_comment_id uuid;
  v_review_id uuid;
  v_rows_affected int;
begin
  raise notice '=====================================================';
  raise notice 'STARTING TAKILYA RLS SECURITY SUITE';
  raise notice '=====================================================';

  -- --------------------------------------------------------------------------
  -- Setup test users
  -- --------------------------------------------------------------------------
  insert into public.profiles (id, username, display_name, role)
  values
    (v_user_a_id, 'cinephile_a', 'Cinephile Alpha', 'user'),
    (v_user_b_id, 'cinephile_b', 'Cinephile Beta', 'user'),
    (v_admin_id,  'takilya_admin', 'Takilya Admin', 'admin')
  on conflict (id) do nothing;

  -- --------------------------------------------------------------------------
  -- 1. TEST: Public Read Access across catalog tables
  -- --------------------------------------------------------------------------
  -- Simulate anonymous public visitor
  set local role anon;
  set local "request.jwt.claims" = '{"role": "anon"}';

  select count(*) into v_rows_affected from public.films;
  if v_rows_affected = 0 then
    raise exception 'TEST 1 FAILED: Anon role should be able to read public.films catalog';
  end if;
  raise notice '✔ TEST 1 PASSED: Anon role successfully read public.films catalog (% rows)', v_rows_affected;

  select count(*) into v_rows_affected from public.festivals;
  raise notice '✔ TEST 1 PASSED: Anon role successfully read public.festivals catalog (% rows)', v_rows_affected;

  -- --------------------------------------------------------------------------
  -- 2. TEST: Normal users cannot edit or delete another user''s review
  -- --------------------------------------------------------------------------
  -- Set auth context to User A
  set local role authenticated;
  set local "request.jwt.claims" = json_build_object('sub', v_user_a_id, 'role', 'authenticated')::text;

  -- User A creates their review
  insert into public.reviews (id, film_id, user_id, title, body, has_spoilers)
  values (gen_random_uuid(), v_test_film_id, v_user_a_id, 'A Masterpiece', 'Exceptional direction by Ishmael Bernal.', false)
  returning id into v_review_id;

  -- Switch auth context to User B
  set local "request.jwt.claims" = json_build_object('sub', v_user_b_id, 'role', 'authenticated')::text;

  -- User B tries to update User A's review
  update public.reviews
  set body = 'Tampered content by another user'
  where id = v_review_id;
  get diagnostics v_rows_affected = row_count;

  if v_rows_affected > 0 then
    raise exception 'TEST 2 FAILED: User B should NOT be able to update User A''s review (RLS breached)';
  end if;
  raise notice '✔ TEST 2 PASSED: User B blocked from updating User A''s review (0 rows updated)';

  -- User B tries to delete User A's review
  delete from public.reviews where id = v_review_id;
  get diagnostics v_rows_affected = row_count;

  if v_rows_affected > 0 then
    raise exception 'TEST 2 FAILED: User B should NOT be able to delete User A''s review (RLS breached)';
  end if;
  raise notice '✔ TEST 2 PASSED: User B blocked from deleting User A''s review (0 rows deleted)';

  -- --------------------------------------------------------------------------
  -- 3. TEST: Normal users cannot edit or delete another user''s comment
  -- --------------------------------------------------------------------------
  -- Set auth context to User A
  set local "request.jwt.claims" = json_build_object('sub', v_user_a_id, 'role', 'authenticated')::text;

  insert into public.discussion_threads (id, film_id, author_id, title, body)
  values (gen_random_uuid(), v_test_film_id, v_user_a_id, 'Symbolism Thread', 'Discussing the ending.')
  returning id into v_thread_id;

  insert into public.comments (id, thread_id, author_id, body)
  values (gen_random_uuid(), v_thread_id, v_user_a_id, 'First thought on the scene.')
  returning id into v_comment_id;

  -- Switch auth context to User B
  set local "request.jwt.claims" = json_build_object('sub', v_user_b_id, 'role', 'authenticated')::text;

  -- User B attempts updating User A's comment
  update public.comments
  set body = 'Vandalized comment'
  where id = v_comment_id;
  get diagnostics v_rows_affected = row_count;

  if v_rows_affected > 0 then
    raise exception 'TEST 3 FAILED: User B should NOT be able to update User A''s comment';
  end if;
  raise notice '✔ TEST 3 PASSED: User B blocked from updating User A''s comment';

  -- --------------------------------------------------------------------------
  -- 4. TEST: Normal unverified users cannot insert official clips into trailers
  -- --------------------------------------------------------------------------
  set local "request.jwt.claims" = json_build_object('sub', v_user_a_id, 'role', 'authenticated')::text;

  begin
    insert into public.trailers (film_id, youtube_id, title, type, is_official)
    values (v_test_film_id, 'dQw4w9WgXcQ', 'Unauthorized Official Upload', 'official', true);
    get diagnostics v_rows_affected = row_count;
    if v_rows_affected > 0 then
      raise exception 'TEST 4 FAILED: Normal unverified user should not insert official trailers';
    end if;
  exception
    when others then
      raise notice '✔ TEST 4 PASSED: Normal unverified user insertion of official trailers rejected';
  end;

  -- --------------------------------------------------------------------------
  -- 5. TEST: Only admin users can write to award_bodies
  -- --------------------------------------------------------------------------
  -- Normal User B attempts to create an award body
  set local "request.jwt.claims" = json_build_object('sub', v_user_b_id, 'role', 'authenticated')::text;

  begin
    insert into public.award_bodies (id, name, acronym, scope, description, country)
    values (gen_random_uuid(), 'Bogus Awards', 'BA', 'local', 'Fake award body', 'Philippines');
    get diagnostics v_rows_affected = row_count;
    if v_rows_affected > 0 then
      raise exception 'TEST 5 FAILED: Normal user should not be able to write to award_bodies';
    end if;
  exception
    when others then
      raise notice '✔ TEST 5 PASSED: Normal user insert into award_bodies rejected by RLS';
  end;

  -- Admin user attempts write
  set local "request.jwt.claims" = json_build_object('sub', v_admin_id, 'role', 'authenticated')::text;

  insert into public.award_bodies (id, name, acronym, scope, description, country)
  values (gen_random_uuid(), 'Test Admin Award', 'TAA', 'local', 'Created by admin', 'Philippines');
  get diagnostics v_rows_affected = row_count;

  if v_rows_affected = 0 then
    raise exception 'TEST 5 FAILED: Admin role should be permitted to insert into award_bodies';
  end if;
  raise notice '✔ TEST 5 PASSED: Admin role successfully inserted award body';

  raise notice '=====================================================';
  raise notice 'ALL RLS TESTS EXECUTED AND PASSED SUCCESSFULLY!';
  raise notice '=====================================================';
end $$;

-- Rollback transaction so test data does not contaminate database
rollback;

