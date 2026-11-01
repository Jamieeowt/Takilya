/**
 * TikTok Embed Verifier Script (Step 2)
 * Calls official TikTok oEmbed endpoint:
 * https://www.tiktok.com/oembed?url=https://www.tiktok.com/@_/video/{id}
 * Records HTTP status, title, author, and thumbnail_url.
 */

interface OEmbedResponse {
  version?: string;
  type?: string;
  title?: string;
  author_url?: string;
  author_name?: string;
  width?: string;
  height?: string;
  html?: string;
  thumbnail_width?: number;
  thumbnail_height?: number;
  thumbnail_url?: string;
  provider_url?: string;
  provider_name?: string;
}

interface ResultItem {
  id: string;
  film: string;
  status: number | string;
  title: string;
  author: string;
  thumbnail_url: string;
  embeddable: 'YES' | 'NO';
}

const TIKTOK_IDS = [
  { id: '7445243271833488648', film: 'Himala (1982)' },
  { id: '7652287895692266769', film: 'Leonor Will Never Die (2022)' },
  { id: '7684804262509006088', film: 'John Denver Trending (2019)' },
  { id: '7608148655559920917', film: 'Cleaners (2019)' },
];

async function checkTikTokId(id: string, film: string): Promise<ResultItem> {
  const url = `https://www.tiktok.com/oembed?url=https://www.tiktok.com/@_/video/${id}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      },
    });

    const status = res.status;
    if (res.ok) {
      const data = (await res.json()) as OEmbedResponse;
      return {
        id,
        film,
        status,
        title: data.title ? (data.title.length > 40 ? data.title.slice(0, 37) + '...' : data.title) : 'N/A',
        author: data.author_name || 'N/A',
        thumbnail_url: data.thumbnail_url || 'N/A',
        embeddable: 'YES',
      };
    } else {
      return {
        id,
        film,
        status,
        title: 'HTTP Error ' + status,
        author: 'N/A',
        thumbnail_url: 'N/A',
        embeddable: 'NO',
      };
    }
  } catch (err: any) {
    return {
      id,
      film,
      status: err?.code || 'FETCH_ERROR',
      title: err?.message || 'Network error',
      author: 'N/A',
      thumbnail_url: 'N/A',
      embeddable: 'NO',
    };
  }
}

async function main() {
  console.log('='.repeat(80));
  console.log('Takilya TikTok Embed Verifier (STEP 2: oEmbed Check)');
  console.log('='.repeat(80));
  console.log(`Checking ${TIKTOK_IDS.length} unique TikTok IDs from seed.sql & features/feed/api.ts...\n`);

  const results: ResultItem[] = [];
  for (const item of TIKTOK_IDS) {
    console.log(`Checking [${item.film}] ID: ${item.id}...`);
    const res = await checkTikTokId(item.id, item.film);
    results.push(res);
  }

  console.log('\n' + '='.repeat(80));
  console.log('RESULTS TABLE:');
  console.log('='.repeat(80));
  console.table(
    results.map((r) => ({
      ID: r.id,
      Film: r.film,
      Status: r.status,
      Embeddable: r.embeddable,
      Author: r.author,
      Title: r.title,
    }))
  );

  console.log('\nTHUMBNAIL URLS (to store on trailers):');
  results.forEach((r) => {
    console.log(`- ${r.film} (${r.id}): ${r.thumbnail_url}`);
  });
}

main();

