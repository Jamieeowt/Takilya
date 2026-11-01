/// <reference types="node" />
/**
 * Cinemalaya Catalog Chunked Seeder
 * Reads supabase/data/cinemalaya_films.json and ingests 205 films into Supabase
 * in safe batches of 20 to avoid payload limits and timeouts.
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// 1. Environment Variables Loader
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach((line) => {
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
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_KEY = SERVICE_KEY || ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('[Seeder] Error: EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY is missing.');
  process.exit(1);
}

console.log('='.repeat(70));
console.log('Takilya: Cinemalaya Film Archive Chunked Ingester');
console.log('='.repeat(70));
console.log(`Connecting to: ${SUPABASE_URL}`);
console.log(`Auth Mode:     ${SERVICE_KEY ? 'SUPABASE_SERVICE_ROLE_KEY (RLS Bypass Enabled)' : 'ANON_KEY (Public Key)'}`);
if (!SERVICE_KEY) {
  console.log('\n[!] Notice: Database tables have Row-Level Security (RLS) enabled.');
  console.log('    If inserts are blocked with code 42501, add SUPABASE_SERVICE_ROLE_KEY to .env:');
  console.log('    Supabase Dashboard -> Project Settings -> API -> Project API Keys -> service_role secret.');
}
console.log('='.repeat(70) + '\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

export function slugify(text: string): string {
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
  genre?: string | string[];
  letterboxd?: string;
  now_showing?: boolean;
  awards?: Array<Record<string, any>>;
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
  citation_e: 'Special Citation for Ensemble',
  citation_d: 'Special Citation for Direction',
  citation: 'Special Citation',
  nccta: 'NETPAC / Special Award',
};

// Generates small, safe SQL chunks (20 films each) for manual fallback
function generateSqlChunks(rawData: RawFilm[]) {
  const chunksDir = path.resolve(process.cwd(), 'supabase/seed_chunks');
  if (!fs.existsSync(chunksDir)) {
    fs.mkdirSync(chunksDir, { recursive: true });
  }

  const BATCH_SIZE = 20;
  const total = rawData.length;
  const numChunks = Math.ceil(total / BATCH_SIZE);

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

  for (let c = 0; c < numChunks; c++) {
    const chunk = rawData.slice(c * BATCH_SIZE, (c + 1) * BATCH_SIZE);
    const chunkIndex = c + 1;
    const lines: string[] = [];

    lines.push(`-- Takilya Cinemalaya Seed Chunk ${chunkIndex}/${numChunks} (Films ${c * BATCH_SIZE + 1} to ${Math.min((c + 1) * BATCH_SIZE, total)})`);
    lines.push('BEGIN;\n');

    for (const film of chunk) {
      const releaseYear = Number(film.year) || 2026;
      const filmSlug = slugify(film.title) ? `${slugify(film.title)}-${releaseYear}` : `film-${c}-${releaseYear}`;
      const synopsis = film.description?.trim() || 'No synopsis available.';
      const posterUrl = film.poster || null;
      const letterboxdUrl = film.letterboxd || null;

      const rawGenres = Array.isArray(film.genre)
        ? film.genre
        : typeof film.genre === 'string'
        ? film.genre.split(',').map((g) => slugify(g)).filter(Boolean)
        : [];
      const culturalTags = Array.from(new Set(['cinemalaya', 'indie', ...rawGenres]));

      lines.push(
        `INSERT INTO public.films (title, original_title, slug, synopsis, release_date, release_year, poster_url, letterboxd_url, cultural_tags, language, is_classic)` +
        ` VALUES (${escapeSql(film.title.trim())}, ${escapeSql(film.title.trim())}, ${escapeSql(filmSlug)}, ${escapeSql(synopsis)}, '${releaseYear}-01-01', ${releaseYear}, ${escapeSql(posterUrl)}, ${escapeSql(letterboxdUrl)}, ${escapeSql(culturalTags)}, 'Filipino', ${releaseYear <= 2010 ? 'TRUE' : 'FALSE'})` +
        ` ON CONFLICT (slug) DO UPDATE SET poster_url = COALESCE(EXCLUDED.poster_url, public.films.poster_url), letterboxd_url = COALESCE(EXCLUDED.letterboxd_url, public.films.letterboxd_url);`
      );

      // Directors & Cast
      if (film.director) {
        film.director.split(',').map((s) => s.trim()).filter(Boolean).forEach((dirName, dIdx) => {
          const pSlug = slugify(dirName);
          lines.push(`INSERT INTO public.people (name, slug, role_type, verification_status) VALUES (${escapeSql(dirName)}, ${escapeSql(pSlug)}, 'director', 'verified') ON CONFLICT (slug) DO NOTHING;`);
          lines.push(`INSERT INTO public.film_credits (film_id, person_id, role, billing_order) SELECT f.id, p.id, 'director', ${dIdx} FROM public.films f, public.people p WHERE f.slug = ${escapeSql(filmSlug)} AND p.slug = ${escapeSql(pSlug)} ON CONFLICT DO NOTHING;`);
        });
      }

      if (film.cast) {
        film.cast.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 8).forEach((castName, cIdx) => {
          const pSlug = slugify(castName);
          lines.push(`INSERT INTO public.people (name, slug, role_type, verification_status) VALUES (${escapeSql(castName)}, ${escapeSql(pSlug)}, 'actor', 'verified') ON CONFLICT (slug) DO NOTHING;`);
          lines.push(`INSERT INTO public.film_credits (film_id, person_id, role, billing_order) SELECT f.id, p.id, 'lead_actor', ${cIdx + 1} FROM public.films f, public.people p WHERE f.slug = ${escapeSql(filmSlug)} AND p.slug = ${escapeSql(pSlug)} ON CONFLICT DO NOTHING;`);
        });
      }
    }

    lines.push('\nCOMMIT;');
    const chunkFile = path.join(chunksDir, `cinemalaya_chunk_${String(chunkIndex).padStart(2, '0')}.sql`);
    fs.writeFileSync(chunkFile, lines.join('\n'), 'utf8');
  }

  console.log(`[SQL Chunker] Generated ${numChunks} small SQL files in supabase/seed_chunks/ (safe for SQL Editor)\n`);
}

async function main() {
  const jsonPath = path.resolve(process.cwd(), 'supabase/data/cinemalaya_films.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`[Seeder] JSON file not found at: ${jsonPath}`);
    process.exit(1);
  }

  const rawData: RawFilm[] = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Loaded ${rawData.length} Cinemalaya film records from ${jsonPath}`);

  // Generate safe 20-film chunk SQL files in case direct SQL execution is preferred
  generateSqlChunks(rawData);

  // 1. Ensure Cinemalaya Festival Record
  console.log('1. Ensuring Cinemalaya festival record in "festivals"...');
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
    .select('id, name, slug')
    .maybeSingle();

  if (festError) {
    if (festError.code === '42501') {
      console.warn('   [RLS Warning] RLS policy blocked festival insert with anon key.');
    } else {
      console.warn('   [Festival Note]', festError.message);
    }
  } else {
    console.log(`   Festival confirmed: ${festData?.name} (ID: ${festData?.id})`);
  }

  // 2. Ensure Cinemalaya Award Body & Categories
  console.log('2. Ensuring Cinemalaya award body & categories...');
  const awardBodyId = '10101010-0002-0000-0000-000000000000';
  await supabase
    .from('award_bodies')
    .upsert(
      {
        id: awardBodyId,
        name: 'Cinemalaya Independent Film Festival Awards',
        acronym: 'Cinemalaya',
        scope: 'festival',
        description: 'Balanghai Trophies awarded annually to outstanding Philippine independent films.',
        country: 'Philippines',
      },
      { onConflict: 'id' }
    );

  const categoryMap: Record<string, string> = {};
  const { data: existingCats } = await supabase
    .from('award_categories')
    .select('id, name')
    .eq('award_body_id', awardBodyId);

  (existingCats || []).forEach((c) => {
    categoryMap[c.name] = c.id;
  });

  for (const catName of Object.values(AWARD_NAMES_MAP)) {
    if (!categoryMap[catName]) {
      const { data: createdCat } = await supabase
        .from('award_categories')
        .upsert(
          {
            award_body_id: awardBodyId,
            name: catName,
          },
          { onConflict: 'award_body_id, name' }
        )
        .select('id, name')
        .maybeSingle();

      if (createdCat) {
        categoryMap[createdCat.name] = createdCat.id;
      }
    }
  }
  console.log(`   Configured ${Object.keys(categoryMap).length} award categories.\n`);

  // 3. Batch Ingest Films in chunks of 20
  const BATCH_SIZE = 20;
  const totalBatches = Math.ceil(rawData.length / BATCH_SIZE);
  let totalImported = 0;
  let totalPeopleCreated = 0;
  let totalCreditsCreated = 0;
  let totalAwardsCreated = 0;

  console.log(`3. Ingesting ${rawData.length} films in ${totalBatches} batches (batch size: ${BATCH_SIZE})...\n`);

  // Cache person slug -> ID
  const personSlugToId = new Map<string, string>();

  // Check whether 'release_year' & 'cultural_tags' columns exist in schema
  let schemaHasExtendedColumns = true;

  for (let b = 0; b < totalBatches; b++) {
    const chunk = rawData.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);
    const batchNumber = b + 1;

    // Prepare film records
    const filmBatch = chunk.map((item, idx) => {
      const releaseYear = Number(item.year) || 2026;
      const filmSlug = slugify(item.title)
        ? `${slugify(item.title)}-${releaseYear}`
        : `film-${b * BATCH_SIZE + idx}-${releaseYear}`;
      const synopsis = item.description?.trim() || 'No synopsis available.';
      const posterUrl = item.poster || null;
      const letterboxdUrl = item.letterboxd || null;

      const rawGenres = Array.isArray(item.genre)
        ? item.genre
        : typeof item.genre === 'string'
        ? item.genre.split(',').map((g) => slugify(g)).filter(Boolean)
        : [];
      const culturalTags = Array.from(new Set(['cinemalaya', 'indie', ...rawGenres]));

      if (schemaHasExtendedColumns) {
        return {
          title: item.title.trim(),
          original_title: item.title.trim(),
          slug: filmSlug,
          release_year: releaseYear,
          release_date: `${releaseYear}-01-01`,
          synopsis,
          poster_url: posterUrl,
          letterboxd_url: letterboxdUrl,
          cultural_tags: culturalTags,
          language: 'Filipino',
          is_classic: releaseYear <= 2010,
        };
      } else {
        return {
          title: item.title.trim(),
          original_title: item.title.trim(),
          slug: filmSlug,
          release_date: `${releaseYear}-01-01`,
          synopsis,
          poster_url: posterUrl,
          language: 'Filipino',
          is_classic: releaseYear <= 2010,
        };
      }
    });

    // Attempt upsert with 'title, release_year' or fallback to 'slug'
    let upsertResult: { data: any[] | null; error: any } = { data: null, error: null };

    if (schemaHasExtendedColumns) {
      upsertResult = await supabase
        .from('films')
        .upsert(filmBatch, { onConflict: 'title, release_year' })
        .select('id, title, release_year, slug');

      // If columns are missing in schema cache, fallback to base schema
      if (
        upsertResult.error &&
        (upsertResult.error.code === 'PGRST204' ||
          upsertResult.error.message?.includes('release_year') ||
          upsertResult.error.message?.includes('cultural_tags') ||
          upsertResult.error.message?.includes('letterboxd_url'))
      ) {
        schemaHasExtendedColumns = false;
        console.warn('   [Notice] Extended schema columns not yet present in database cache.');
        console.warn('   [Notice] Falling back to base columns (title, slug, synopsis, release_date)...');

        const fallbackBatch = chunk.map((item, idx) => {
          const releaseYear = Number(item.year) || 2026;
          const filmSlug = slugify(item.title)
            ? `${slugify(item.title)}-${releaseYear}`
            : `film-${b * BATCH_SIZE + idx}-${releaseYear}`;
          return {
            title: item.title.trim(),
            original_title: item.title.trim(),
            slug: filmSlug,
            release_date: `${releaseYear}-01-01`,
            synopsis: item.description?.trim() || 'No synopsis available.',
            poster_url: item.poster || null,
            language: 'Filipino',
            is_classic: releaseYear <= 2010,
          };
        });

        upsertResult = await supabase
          .from('films')
          .upsert(fallbackBatch, { onConflict: 'slug' })
          .select('id, title, slug');
      }
    } else {
      upsertResult = await supabase
        .from('films')
        .upsert(filmBatch, { onConflict: 'slug' })
        .select('id, title, slug');
    }

    if (upsertResult.error) {
      if (upsertResult.error.code === '42501') {
        console.error(`\n[!] Supabase RLS Policy Blocked Write on Batch ${batchNumber}/${totalBatches}:`);
        console.error(`    ${upsertResult.error.message}`);
        console.error(`\n======================================================================`);
        console.error(`HOW TO RESOLVE:`);
        console.error(`1. Set SUPABASE_SERVICE_ROLE_KEY in .env:`);
        console.error(`   Copy your project's 'service_role' secret from:`);
        console.error(`   https://supabase.com/dashboard/project/zwsbywbpvjzrumnqkbwt/settings/api`);
        console.error(`   and add: SUPABASE_SERVICE_ROLE_KEY=your_key to .env`);
        console.error(`\n2. OR run the 11 small chunk files generated in:`);
        console.error(`   supabase/seed_chunks/cinemalaya_chunk_01.sql ... chunk_11.sql`);
        console.error(`   directly in the Supabase SQL Editor (safe, 20 films each, no size limit).`);
        console.error(`======================================================================\n`);
        break;
      } else {
        console.warn(`[Batch ${batchNumber}] Upsert note:`, upsertResult.error.message);
      }
    }

    const insertedFilms = upsertResult.data || [];
    const filmMap = new Map<string, string>(); // slug -> film_id

    insertedFilms.forEach((f: any) => {
      if (f.id && f.slug) filmMap.set(f.slug, f.id);
    });

    // If select didn't return all IDs, look them up by slug
    if (filmMap.size < chunk.length) {
      const slugsToQuery = chunk.map((item, idx) => {
        const releaseYear = Number(item.year) || 2026;
        return slugify(item.title)
          ? `${slugify(item.title)}-${releaseYear}`
          : `film-${b * BATCH_SIZE + idx}-${releaseYear}`;
      });
      const { data: queriedFilms } = await supabase
        .from('films')
        .select('id, slug')
        .in('slug', slugsToQuery);

      (queriedFilms || []).forEach((f: any) => {
        if (f.id && f.slug) filmMap.set(f.slug, f.id);
      });
    }

    const successfulInBatch = filmMap.size;
    totalImported += successfulInBatch;

    // Process People, Credits & Awards for this batch
    for (let i = 0; i < chunk.length; i++) {
      const item = chunk[i];
      const releaseYear = Number(item.year) || 2026;
      const filmSlug = slugify(item.title)
        ? `${slugify(item.title)}-${releaseYear}`
        : `film-${b * BATCH_SIZE + i}-${releaseYear}`;
      const filmId = filmMap.get(filmSlug);

      if (!filmId) continue;

      // Extract unique names
      const directors = (item.director || '').split(',').map((s) => s.trim()).filter(Boolean);
      const castList = (item.cast || '').split(',').map((s) => s.trim()).filter(Boolean);

      // Upsert directors into people
      for (let d = 0; d < directors.length; d++) {
        const dirName = directors[d];
        const dirSlug = slugify(dirName);
        if (!dirSlug) continue;

        let personId = personSlugToId.get(dirSlug);
        if (!personId) {
          const { data: pData } = await supabase
            .from('people')
            .upsert(
              {
                name: dirName,
                slug: dirSlug,
                role_type: 'director',
                verification_status: 'verified',
              },
              { onConflict: 'slug' }
            )
            .select('id')
            .maybeSingle();

          if (pData?.id) {
            const newId = String(pData.id);
            personId = newId;
            personSlugToId.set(dirSlug, newId);
            totalPeopleCreated++;
          }
        }

        if (personId) {
          await supabase
            .from('film_credits')
            .upsert(
              {
                film_id: filmId,
                person_id: personId,
                role: 'director',
                billing_order: d,
              },
              { onConflict: 'film_id, person_id, role, character_name', ignoreDuplicates: true }
            );
          totalCreditsCreated++;
        }
      }

      // Upsert cast into people (top 6 per film)
      for (let c = 0; c < Math.min(castList.length, 6); c++) {
        const castName = castList[c];
        const castSlug = slugify(castName);
        if (!castSlug) continue;

        let personId = personSlugToId.get(castSlug);
        if (!personId) {
          const { data: pData } = await supabase
            .from('people')
            .upsert(
              {
                name: castName,
                slug: castSlug,
                role_type: 'actor',
                verification_status: 'verified',
              },
              { onConflict: 'slug' }
            )
            .select('id')
            .maybeSingle();

          if (pData?.id) {
            const newId = String(pData.id);
            personId = newId;
            personSlugToId.set(castSlug, newId);
            totalPeopleCreated++;
          }
        }

        if (personId) {
          await supabase
            .from('film_credits')
            .upsert(
              {
                film_id: filmId,
                person_id: personId,
                role: 'lead_actor',
                billing_order: c + 1,
              },
              { onConflict: 'film_id, person_id, role, character_name', ignoreDuplicates: true }
            );
          totalCreditsCreated++;
        }
      }

      // Upsert awards from item.awards
      if (item.awards && Array.isArray(item.awards)) {
        for (const awardObj of item.awards) {
          for (const [awardKey, awardVal] of Object.entries(awardObj)) {
            if (awardKey === 'name' || awardKey === 'name:' || !awardVal || awardVal === false) continue;

            const categoryName = AWARD_NAMES_MAP[awardKey];
            if (!categoryName) continue;

            const catId = categoryMap[categoryName];
            if (!catId) continue;

            const awardeeName = (awardObj.name || awardObj['name:'] || '').trim();
            const personId = awardeeName ? personSlugToId.get(slugify(awardeeName)) : null;

            await supabase
              .from('award_recognitions')
              .upsert(
                {
                  category_id: catId,
                  ceremony_year: releaseYear,
                  status: 'won',
                  recipient_type: personId ? 'person' : 'film',
                  recipient_id: personId || filmId,
                  notes: `${categoryName} winner`,
                },
                { onConflict: 'id', ignoreDuplicates: true }
              );
            totalAwardsCreated++;
          }
        }
      }
    }

    console.log(`Batch ${batchNumber}/${totalBatches} completed... ${successfulInBatch} films inserted/verified (Total: ${totalImported}/${rawData.length})`);
  }

  console.log('\n' + '='.repeat(70));
  console.log(`Ingestion Summary:`);
  console.log(`  Films Imported / Verified: ${totalImported} / ${rawData.length}`);
  console.log(`  People Created / Cached:   ${personSlugToId.size}`);
  console.log(`  Film Credits Linked:       ${totalCreditsCreated}`);
  console.log(`  Award Recognitions Added:  ${totalAwardsCreated}`);
  console.log('='.repeat(70) + '\n');
}

main().catch((err) => {
  console.error('[Seeder Fatal Error]:', err);
  process.exit(1);
});
