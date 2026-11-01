/// <reference types="node" />
/**
 * Video URL Health & Reachability Checker for Takilya
 * Sends HTTP HEAD requests to all configured video_url endpoints
 * to verify status, content-type, and catch dead or blocked links early.
 */

import fs from 'fs';
import path from 'path';

interface UrlCheckResult {
  url: string;
  source: string;
  status: number | string;
  contentType: string;
  contentLength: string;
  accessible: boolean;
  notes?: string;
}

// 1. URLs extracted from seed data & default feed
const SAMPLE_URLS: Array<{ url: string; source: string }> = [
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    source: 'BigBuckBunny.mp4 (Test Clip 1)',
  },
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    source: 'ElephantsDream.mp4 (Test Clip 2)',
  },
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    source: 'ForBiggerBlazes.mp4 (Test Clip 3)',
  },
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    source: 'ForBiggerEscapes.mp4 (Test Clip 4)',
  },
];

async function checkVideoUrl(item: { url: string; source: string }): Promise<UrlCheckResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(item.url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Takilya/1.0',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const contentType = res.headers.get('content-type') || 'unknown';
    const contentLength = res.headers.get('content-length') || 'unknown';
    const accessible = res.status >= 200 && res.status < 400;

    let notes = '';
    if (res.status === 403) {
      notes = 'Forbidden: GCS bucket permissions require authentication/public read.';
    } else if (res.status === 404) {
      notes = 'Not Found: Dead link.';
    } else if (accessible) {
      notes = 'OK: Streamable direct video.';
    }

    return {
      url: item.url,
      source: item.source,
      status: res.status,
      contentType,
      contentLength,
      accessible,
      notes,
    };
  } catch (err: any) {
    return {
      url: item.url,
      source: item.source,
      status: 'CONN_ERR',
      contentType: 'none',
      contentLength: 'none',
      accessible: false,
      notes: err.message || 'Connection failed',
    };
  }
}

async function main() {
  console.log('='.repeat(90));
  console.log('Takilya Video URL Health & Reachability Checker');
  console.log('='.repeat(90));
  console.log(`Checking ${SAMPLE_URLS.length} trailer video URLs via HTTP HEAD requests...\n`);

  const results: UrlCheckResult[] = [];

  for (const item of SAMPLE_URLS) {
    console.log(`Sending HEAD request to: ${item.source}...`);
    const res = await checkVideoUrl(item);
    results.push(res);
  }

  console.log('\n' + '='.repeat(90));
  console.log('URL VERIFICATION RESULTS TABLE:');
  console.log('='.repeat(90));

  console.table(
    results.map((r) => ({
      Source: r.source,
      Status: r.status,
      'Content-Type': r.contentType,
      Size: r.contentLength,
      Accessible: r.accessible ? 'YES' : 'NO',
      Notes: r.notes || '',
    }))
  );

  const accessibleCount = results.filter((r) => r.accessible).length;
  console.log('='.repeat(90));
  console.log(`Summary: ${accessibleCount} of ${results.length} URLs currently accessible.`);
  if (accessibleCount < results.length) {
    console.log(`Notice: Any URL returning 403 / 404 will activate the in-app poster + Retry card`);
    console.log(`        in FeedPlayer without crashing or showing a blank screen.`);
  }
  console.log('='.repeat(90) + '\n');
}

main().catch((err) => {
  console.error('[Fatal Error]:', err);
  process.exit(1);
});

