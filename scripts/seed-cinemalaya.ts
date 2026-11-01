/// <reference types="node" />
/**
 * Cinemalaya Film Archive Seeder for Takilya
 * Reads supabase/data/cinemalaya_films.json and:
 * 1. Generates standalone SQL seed script (supabase/seed_cinemalaya.sql)
 * 2. Attempts batch upsert into Supabase database:
 *    - Festival (Cinemalaya)
 *    - Award Body & Categories (Balanghai Trophies)
 *    - Films (with cultural_tags, release_year, letterboxd_url)
 *    - People (Directors, Cast, Screenplay, Cinematography, etc.)
 *    - Film Credits (film_credits)
 *    - Award Recognitions (award_recognitions)
 *    - Streaming Sources (watch_availability & watch_sources)
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// 1. Load Environment Variables from .env
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach((line: string) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...values] = trimmed.split('=');
        const val = values.join('=').trim().replace(/^["']|["']$/g, '');
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = val;
        }
      }
    });
  }
}

loadEnv();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('[Seeder] Error: EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY is missing.');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('[Seeder Note] Running with anon publishable key.');
  console.log('[Seeder Note] Note: If tables have RLS policies enabled, provide SUPABASE_SERVICE_ROLE_KEY in .env or run the generated supabase/seed_cinemalaya.sql in Supabase SQL Editor.\n');
} else {
  console.log('[Seeder] Using SUPABASE_SERVICE_ROLE_KEY (RLS bypass enabled).\n');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeSql(val: any): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return isNaN(val) ? 'NULL' : val.toString();
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (Array.isArray(val)) {
    const escaped = val.map((item) => `"${String(item).replace(/"/g, '""')}"`);
    return `'{${escaped.join(',')}}'`;
  }
  return `'${String(val).replace(/'/g, "''")}'`;
}

interface RawFilm {
  year: number | string;
  title: string;
  poster?: string;
  description?: string;
  director?: string;
  cast?: string;
  producers?: string;
  screenplay?: string;
  production_designer?: string;
  cinematographer?: string;
  editor?: string;
  sound?: string;
  music?: string;
  genre?: string;
  letterboxd?: string;
  now_showing?: boolean;
  watch?: Array<{ type: string; url?: string; link?: string; href?: string }>;
  awards?: Array<Record<string, any>>;
  trailer?: string;
}

const AWARD_NAMES_MAP: Record<string, string> = {
  film: 'Best Film (Balanghai Trophy)',
  special_jury: 'Special Jury Prize',
  audience: 'Audience Choice Award',
  direction: 'Best Direction',
  actor: 'Best Actor',
  actress: 'Best Actress',
  supporting_actor: 'Best Supporting Actor',
  supporting_actress: 'Best Supporting Actress',
  screenplay: 'Best Screenplay',
  cinematography: 'Best Cinematography',
  editing: 'Best Editing',
  sound: 'Best Sound',
  music: 'Best Musical Score',
  production: 'Best Production Design',
  netpac: 'NETPAC Award',
  ensemble: 'Best Acting Ensemble',
};

const PLATFORM_MAP: Record<string, { name: string; slug: string; is_local: boolean }> = {
  netflix: { name: 'Netflix Philippines', slug: 'netflix-ph', is_local: false },
  juanflix: { name: 'JuanFlix / FDCP Channel', slug: 'juanflix', is_local: true },
  prime: { name: 'Amazon Prime Video', slug: 'prime-video', is_local: false },
  iwant: { name: 'iWantTFC', slug: 'iwanttfc', is_local: true },
  viva: { name: 'Vivamax / Viva One', slug: 'vivamax', is_local: true },
  youtube: { name: 'YouTube Movies', slug: 'youtube', is_local: false },
  ccp: { name: 'CCP Channel', slug: 'ccp-channel', is_local: true },
  appletv: { name: 'Apple TV', slug: 'apple-tv', is_local: false },
  googletv: { name: 'Google TV', slug: 'google-tv', is_local: false },
  vimeo: { name: 'Vimeo On Demand', slug: 'vimeo', is_local: false },
};

/**
 * Generates an idempotent, full SQL seed script ready for Supabase Dashboard SQL Editor
 */
function generateSqlSeedFile(rawData: RawFilm[]) {
  const sqlFilePath = path.resolve(process.cwd(), 'supabase/seed_cinemalaya.sql');
  const buffer: string[] = [];

  buffer.push('-- ==============================================================================');
  buffer.push('-- Takilya: Cinemalaya Film Archive Database Seed');
  buffer.push(`-- Total Films in Archive: ${rawData.length}`);
  buffer.push('-- Generated from supabase/data/cinemalaya_films.json');
  buffer.push('-- ==============================================================================\n');

  buffer.push('-- 1. Schema Extensions (safe idempotent)');
  buffer.push('ALTER TABLE public.films');
  buffer.push('  ADD COLUMN IF NOT EXISTS release_year integer,');
  buffer.push('  ADD COLUMN IF NOT EXISTS letterboxd_url text,');
  buffer.push('  ADD COLUMN IF NOT EXISTS cultural_tags text[] DEFAULT \'{}\',');
  buffer.push('  ADD COLUMN IF NOT EXISTS watch_sources jsonb DEFAULT \'[]\';\n');

  buffer.push('DO $$');
  buffer.push('BEGIN');
  buffer.push('  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = \'films_title_release_year_key\') THEN');
  buffer.push('    ALTER TABLE public.films ADD CONSTRAINT films_title_release_year_key UNIQUE (title, release_year);');
  buffer.push('  END IF;');
  buffer.push('END $$;\n');

  buffer.push('-- 2. Cinemalaya Festival Record');
  buffer.push('INSERT INTO public.festivals (name, slug, description, location, founded_year, verification_status)');
  buffer.push('VALUES (');
  buffer.push('  \'Cinemalaya Philippine Independent Film Festival\',');
  buffer.push('  \'cinemalaya\',');
  buffer.push('  \'Premier Philippine independent film festival held annually at the Cultural Center of the Philippines.\',');
  buffer.push('  \'Manila, Philippines\',');
  buffer.push('  2005,');
  buffer.push('  \'verified\'');
  buffer.push(')');
  buffer.push('ON CONFLICT (slug) DO UPDATE SET verification_status = \'verified\';\n');

  buffer.push('-- 3. Award Body');
  buffer.push('INSERT INTO public.award_bodies (id, name, acronym, scope, description, country)');
  buffer.push('VALUES (');
  buffer.push('  \'10101010-0002-0000-0000-000000000000\',');
  buffer.push('  \'Cinemalaya Independent Film Festival Awards\',');
  buffer.push('  \'Cinemalaya\',');
  buffer.push('  \'festival\',');
  buffer.push('  \'Balanghai Trophies awarded annually to outstanding Philippine independent films.\',');
  buffer.push('  \'Philippines\'');
  buffer.push(')');
  buffer.push('ON CONFLICT (id) DO NOTHING;\n');

  buffer.push('-- 4. Award Categories');
  for (const [key, categoryName] of Object.entries(AWARD_NAMES_MAP)) {
    buffer.push(
      `INSERT INTO public.award_categories (award_body_id, name) VALUES ('10101010-0002-0000-0000-000000000000', ${escapeSql(categoryName)}) ON CONFLICT (award_body_id, name) DO NOTHING;`
    );
  }
  buffer.push('\n-- 5. Streaming Platforms');
  for (const [key, p] of Object.entries(PLATFORM_MAP)) {
    buffer.push(
      `INSERT INTO public.streaming_platforms (name, slug, is_local) VALUES (${escapeSql(p.name)}, ${escapeSql(p.slug)}, ${p.is_local ? 'TRUE' : 'FALSE'}) ON CONFLICT (slug) DO NOTHING;`
    );
  }
  buffer.push('\n-- 6. Cinemalaya Films & Linked Metadata');

  // Track unique people
  const seenPeople = new Set<string>();

  for (const film of rawData) {
    const releaseYear = Number(film.year) || 2020;
    const filmSlug = slugify(`${film.title}-${releaseYear}`);
    const synopsis = film.description?.trim() || 'No synopsis available.';
    const posterUrl = film.poster || null;
    const letterboxdUrl = film.letterboxd || null;

    const culturalTags = ['cinemalaya', 'indie'];
    if (film.genre) {
      film.genre
        .split(',')
        .map((g) => slugify(g))
        .filter(Boolean)
        .forEach((t) => {
          if (!culturalTags.includes(t)) culturalTags.push(t);
        });
    }

    const watchJson = film.watch ? JSON.stringify(film.watch).replace(/'/g, "''") : '[]';

    buffer.push(`\n-- Film: ${film.title} (${releaseYear})`);
    buffer.push(
      `INSERT INTO public.films (title, original_title, slug, synopsis, release_date, release_year, poster_url, letterboxd_url, cultural_tags, watch_sources, language, is_classic)` +
      ` VALUES (${escapeSql(film.title.trim())}, ${escapeSql(film.title.trim())}, ${escapeSql(filmSlug)}, ${escapeSql(synopsis)}, '${releaseYear}-01-01', ${releaseYear}, ${escapeSql(posterUrl)}, ${escapeSql(letterboxdUrl)}, ${escapeSql(culturalTags)}, '${watchJson}'::jsonb, 'Filipino', ${releaseYear <= 2010 ? 'TRUE' : 'FALSE'})` +
      ` ON CONFLICT (slug) DO UPDATE SET poster_url = COALESCE(EXCLUDED.poster_url, public.films.poster_url), letterboxd_url = COALESCE(EXCLUDED.letterboxd_url, public.films.letterboxd_url);`
    );

    // People & Credits helper
    const addPersonAndCredit = (personName: string, role: string, billingOrder: number) => {
      const name = personName.trim();
      if (!name) return;
      const slug = slugify(name);
      if (!seenPeople.has(slug)) {
        seenPeople.add(slug);
        buffer.push(
          `INSERT INTO public.people (name, slug, role_type, verification_status) VALUES (${escapeSql(name)}, ${escapeSql(slug)}, '${role === 'director' ? 'director' : 'actor'}', 'verified') ON CONFLICT (slug) DO NOTHING;`
        );
      }
      buffer.push(
        `INSERT INTO public.film_credits (film_id, person_id, role, billing_order)` +
        ` SELECT f.id, p.id, ${escapeSql(role)}, ${billingOrder}` +
        ` FROM public.films f, public.people p` +
        ` WHERE f.slug = ${escapeSql(filmSlug)} AND p.slug = ${escapeSql(slug)}` +
        ` ON CONFLICT (film_id, person_id, role, character_name) DO NOTHING;`
      );
    };

    // Directors
    if (film.director) {
      film.director.split(',').map((d) => d.trim()).filter(Boolean).forEach((d, i) => {
        addPersonAndCredit(d, 'director', i);
      });
    }

    // Cast
    if (film.cast) {
      film.cast.split(',').map((c) => c.trim()).filter(Boolean).forEach((c, i) => {
        addPersonAndCredit(c, i < 2 ? 'lead_actor' : 'supporting_actor', i + 1);
      });
    }

    // Writers
    if (film.screenplay) {
      film.screenplay.split(',').map((w) => w.trim()).filter(Boolean).forEach((w, i) => {
        addPersonAndCredit(w, 'writer', i + 10);
      });
    }

    // Awards
    if (film.awards && Array.isArray(film.awards)) {
      for (const awardObj of film.awards) {
        for (const [awardKey, val] of Object.entries(awardObj)) {
          if (val === true && AWARD_NAMES_MAP[awardKey]) {
            const categoryName = AWARD_NAMES_MAP[awardKey];
            buffer.push(
              `INSERT INTO public.award_recognitions (category_id, ceremony_year, status, recipient_type, recipient_id, notes)` +
              ` SELECT ac.id, ${releaseYear}, 'won'::public.award_status_type, 'film'::public.award_recipient_type, f.id, '${awardKey.replace(/_/g, ' ')} winner'` +
              ` FROM public.award_categories ac, public.films f` +
              ` WHERE ac.award_body_id = '10101010-0002-0000-0000-000000000000' AND ac.name = ${escapeSql(categoryName)} AND f.slug = ${escapeSql(filmSlug)}` +
              ` ON CONFLICT DO NOTHING;`
            );
          }
        }
      }
    }
  }

  fs.writeFileSync(sqlFilePath, buffer.join('\n'), 'utf8');
  console.log(`[SQL Generator] Successfully generated full SQL seed script:`);
  console.log(`                ${sqlFilePath} (${(fs.statSync(sqlFilePath).size / 1024).toFixed(1)} KB)\n`);
}

async function main() {
  console.log('='.repeat(80));
  console.log('Takilya Cinemalaya Film Archive Seeder');
  console.log('='.repeat(80));

  const jsonPath = path.resolve(process.cwd(), 'supabase/data/cinemalaya_films.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`[Seeder] JSON file not found at ${jsonPath}`);
    process.exit(1);
  }

  const rawData: RawFilm[] = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Loaded ${rawData.length} Cinemalaya film records from ${jsonPath}\n`);

  // Step 0: Always generate the standalone SQL seed file first
  generateSqlSeedFile(rawData);

  // Step 1: Ensure Cinemalaya Festival Record
  console.log('1. Ensuring Cinemalaya Festival record...');
  const { data: festData, error: festError } = await supabase
    .from('festivals')
    .upsert(
      {
        name: 'Cinemalaya Philippine Independent Film Festival',
        slug: 'cinemalaya',
        description: 'Premier Philippine independent film festival celebrating bold cinematic storytelling.',
        location: 'Manila, Philippines',
        founded_year: 2005,
        verification_status: 'verified',
      },
      { onConflict: 'slug' }
    )
    .select('id')
    .maybeSingle();

  if (festError) {
    console.warn('[Seeder] Note on festival upsert:', festError.message);
  }
  const festivalId = festData?.id;
  console.log(`   Festival ID: ${festivalId || 'verified/existing'}\n`);

  // Step 2: Ensure Cinemalaya Award Body
  console.log('2. Ensuring Cinemalaya Award Body & Categories...');
  let awardBodyId: string | null = null;
  const { data: bodyData } = await supabase
    .from('award_bodies')
    .select('id')
    .ilike('name', '%Cinemalaya%')
    .limit(1)
    .maybeSingle();

  if (bodyData) {
    awardBodyId = bodyData.id;
  } else {
    const { data: newBody } = await supabase
      .from('award_bodies')
      .insert({
        name: 'Cinemalaya Independent Film Festival Awards',
        acronym: 'Cinemalaya',
        scope: 'festival',
        description: 'Balanghai Trophies awarded annually to outstanding Philippine independent films.',
        country: 'Philippines',
      })
      .select('id')
      .maybeSingle();
    awardBodyId = newBody?.id || null;
  }

  // Pre-load / create award categories
  const categoryIdMap: Record<string, string> = {};
  if (awardBodyId) {
    const { data: existingCats } = await supabase
      .from('award_categories')
      .select('id, name')
      .eq('award_body_id', awardBodyId);

    (existingCats || []).forEach((c) => {
      categoryIdMap[c.name] = c.id;
    });

    for (const [key, categoryName] of Object.entries(AWARD_NAMES_MAP)) {
      if (!categoryIdMap[categoryName]) {
        const { data: createdCat } = await supabase
          .from('award_categories')
          .insert({
            award_body_id: awardBodyId,
            name: categoryName,
          })
          .select('id')
          .maybeSingle();
        if (createdCat) {
          categoryIdMap[categoryName] = createdCat.id;
        }
      }
    }
  }
  console.log(`   Registered ${Object.keys(categoryIdMap).length} award categories.\n`);

  // Step 3: Ensure Streaming Platforms
  console.log('3. Ensuring Streaming Platforms...');
  const platformIdMap: Record<string, string> = {};
  const { data: existingPlatforms } = await supabase.from('streaming_platforms').select('id, slug');
  (existingPlatforms || []).forEach((p) => {
    platformIdMap[p.slug] = p.id;
  });

  for (const [key, p] of Object.entries(PLATFORM_MAP)) {
    if (!platformIdMap[p.slug]) {
      const { data: createdPlatform } = await supabase
        .from('streaming_platforms')
        .insert({
          name: p.name,
          slug: p.slug,
          is_local: p.is_local,
        })
        .select('id')
        .maybeSingle();
      if (createdPlatform) {
        platformIdMap[p.slug] = createdPlatform.id;
      }
    }
  }
  console.log(`   Configured ${Object.keys(platformIdMap).length} streaming platforms.\n`);

  // Step 4: Batch Process Films in Chunks of 25
  const CHUNK_SIZE = 25;
  let totalImported = 0;
  let totalPeopleCreated = 0;
  let totalCreditsCreated = 0;
  let totalAwardsCreated = 0;
  let totalWatchCreated = 0;

  console.log(`4. Batch processing ${rawData.length} films via Supabase REST API in chunks of ${CHUNK_SIZE}...`);

  let rlsBlocked = false;

  for (let i = 0; i < rawData.length; i += CHUNK_SIZE) {
    if (rlsBlocked) break;
    const chunk = rawData.slice(i, i + CHUNK_SIZE);
    const chunkIndex = Math.floor(i / CHUNK_SIZE) + 1;
    const totalChunks = Math.ceil(rawData.length / CHUNK_SIZE);
    console.log(`\n--- Processing Chunk ${chunkIndex} of ${totalChunks} (Films ${i + 1} to ${i + chunk.length}) ---`);

    for (const film of chunk) {
      try {
        const releaseYear = Number(film.year) || 2020;
        const filmSlug = slugify(`${film.title}-${releaseYear}`);
        const synopsis = film.description?.trim() || 'No synopsis available.';
        const posterUrl = film.poster || null;
        const letterboxdUrl = film.letterboxd || null;

        // Build cultural tags array
        const culturalTags = ['cinemalaya', 'indie'];
        if (film.genre) {
          film.genre
            .split(',')
            .map((g) => slugify(g))
            .filter(Boolean)
            .forEach((tag) => {
              if (!culturalTags.includes(tag)) culturalTags.push(tag);
            });
        }

        // Upsert into public.films
        const filmRecord = {
          title: film.title.trim(),
          release_year: releaseYear,
          release_date: `${releaseYear}-01-01`,
          slug: filmSlug,
          synopsis,
          poster_url: posterUrl,
          letterboxd_url: letterboxdUrl,
          cultural_tags: culturalTags,
          watch_sources: film.watch || [],
          language: 'Filipino',
          is_classic: releaseYear <= 2010,
        };

        let upsertedFilmId: string | null = null;
        const { data: upsertData, error: filmError } = await supabase
          .from('films')
          .upsert(filmRecord, { onConflict: 'slug' })
          .select('id')
          .maybeSingle();

        if (filmError) {
          // If RLS blocks anonymous insert
          if (filmError.code === '42501' || filmError.message?.includes('row-level security')) {
            console.warn(`\n[!] Supabase Row-Level Security (RLS) is active on 'films':`);
            console.warn(`    The anon publishable key does not have INSERT/UPDATE permissions.`);
            console.warn(`    -> To seed via REST API: set SUPABASE_SERVICE_ROLE_KEY in .env`);
            console.warn(`    -> To seed via SQL: Run the generated 'supabase/seed_cinemalaya.sql' directly in your Supabase SQL Editor.`);
            console.warn(`    Halting REST loop.\n`);
            rlsBlocked = true;
            break;
          }

          // If cultural_tags column is not present in schema cache, try base columns
          if (filmError.message?.includes('cultural_tags')) {
            const baseRecord = {
              title: film.title.trim(),
              slug: filmSlug,
              synopsis,
              release_date: `${releaseYear}-01-01`,
              poster_url: posterUrl,
              language: 'Filipino',
              is_classic: releaseYear <= 2010,
            };
            const { data: fallbackData, error: fallbackError } = await supabase
              .from('films')
              .upsert(baseRecord, { onConflict: 'slug' })
              .select('id')
              .maybeSingle();

            if (fallbackError?.code === '42501' || fallbackError?.message?.includes('row-level security')) {
              console.warn(`\n[!] Supabase Row-Level Security (RLS) is active on 'films':`);
              console.warn(`    The anon publishable key does not have INSERT/UPDATE permissions.`);
              console.warn(`    -> To seed via REST API: set SUPABASE_SERVICE_ROLE_KEY in .env`);
              console.warn(`    -> To seed via SQL: Run the generated 'supabase/seed_cinemalaya.sql' directly in your Supabase SQL Editor.`);
              console.warn(`    Halting REST loop.\n`);
              rlsBlocked = true;
              break;
            }
            upsertedFilmId = fallbackData?.id || null;
          } else {
            console.warn(`   [!] Skipped film "${film.title}":`, filmError.message);
          }
        } else if (upsertData?.id) {
          upsertedFilmId = upsertData.id;
        }

        if (!upsertedFilmId) {
          // Check if film already exists in DB
          const { data: existingFilm } = await supabase
            .from('films')
            .select('id')
            .eq('slug', filmSlug)
            .maybeSingle();
          if (existingFilm?.id) {
            upsertedFilmId = existingFilm.id;
          }
        }

        if (!upsertedFilmId) continue;
        totalImported++;

        // Helper to upsert a person and return id
        async function getOrCreatePerson(personName: string, defaultRole: string = 'director'): Promise<string | null> {
          const name = personName.trim();
          if (!name) return null;
          const slug = slugify(name);

          const { data: personData } = await supabase
            .from('people')
            .upsert(
              {
                name,
                slug,
                role_type: defaultRole as any,
                verification_status: 'verified',
              },
              { onConflict: 'slug' }
            )
            .select('id')
            .maybeSingle();

          if (personData?.id) {
            totalPeopleCreated++;
            return personData.id;
          }
          return null;
        }

        // Helper to link a credit
        async function linkCredit(personId: string, role: string, billingOrder: number = 0) {
          await supabase
            .from('film_credits')
            .upsert(
              {
                film_id: upsertedFilmId,
                person_id: personId,
                role,
                billing_order: billingOrder,
              },
              { onConflict: 'film_id, person_id, role' }
            );
          totalCreditsCreated++;
        }

        // 1. Directors
        if (film.director) {
          const directors = film.director.split(',').map((d) => d.trim()).filter(Boolean);
          for (let dIdx = 0; dIdx < directors.length; dIdx++) {
            const pId = await getOrCreatePerson(directors[dIdx], 'director');
            if (pId) await linkCredit(pId, 'director', dIdx);
          }
        }

        // 2. Cast
        if (film.cast) {
          const actors = film.cast.split(',').map((a) => a.trim()).filter(Boolean);
          for (let cIdx = 0; cIdx < actors.length; cIdx++) {
            const pId = await getOrCreatePerson(actors[cIdx], 'actor');
            if (pId) await linkCredit(pId, cIdx < 2 ? 'lead_actor' : 'supporting_actor', cIdx + 1);
          }
        }

        // 3. Screenplay / Writers
        if (film.screenplay) {
          const writers = film.screenplay.split(',').map((w) => w.trim()).filter(Boolean);
          for (let wIdx = 0; wIdx < writers.length; wIdx++) {
            const pId = await getOrCreatePerson(writers[wIdx], 'writer');
            if (pId) await linkCredit(pId, 'writer', wIdx + 5);
          }
        }

        // 4. Awards
        if (film.awards && Array.isArray(film.awards) && awardBodyId) {
          for (const awardObj of film.awards) {
            for (const [awardKey, val] of Object.entries(awardObj)) {
              if (val === true && AWARD_NAMES_MAP[awardKey]) {
                const categoryName = AWARD_NAMES_MAP[awardKey];
                const catId = categoryIdMap[categoryName];
                if (catId) {
                  await supabase.from('award_recognitions').insert({
                    category_id: catId,
                    ceremony_year: releaseYear,
                    status: 'won',
                    recipient_type: 'film',
                    recipient_id: upsertedFilmId,
                    notes: `${awardKey.replace(/_/g, ' ')} winner`,
                  });
                  totalAwardsCreated++;
                }
              }
            }
          }
        }
      } catch (err: any) {
        console.warn(`   [!] Error processing film "${film.title}":`, err?.message || err);
      }
    }
    console.log(`   Chunk ${chunkIndex} complete. Total films imported so far: ${totalImported}`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('CINEMALAYA IMPORT SUMMARY:');
  console.log('='.repeat(80));
  console.log(`- Films in Cinemalaya Archive: ${rawData.length}`);
  console.log(`- Standalone SQL Seed File:   supabase/seed_cinemalaya.sql`);
  console.log(`- Films Rest API Imported:    ${totalImported}`);
  console.log(`- People Records Linked:      ${totalPeopleCreated}`);
  console.log(`- Film Credits Created:       ${totalCreditsCreated}`);
  console.log(`- Award Recognitions Mapped:  ${totalAwardsCreated}`);
  console.log('='.repeat(80));
  console.log('Cinemalaya seeding execution completed!\n');
}

main().catch((err) => {
  console.error('[Fatal Seeder Error]:', err);
  process.exit(1);
});
