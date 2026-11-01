const fs = require('fs');

const items = [
  { id: '7445243271833488648', label: 'Himala', url: 'https://www.tiktok.com/@creazionstudios/video/7445243271833488648' },
  { id: '7652287895692266769', label: 'Leonor Will Never Die', url: 'https://www.tiktok.com/@le.filesofxy/video/7652287895692266769' },
  { id: '7684804262509006088', label: 'John Denver Trending', url: 'https://www.tiktok.com/@yeonhonq/video/7684804262509006088' },
  { id: '7608148655559920917', label: 'Cleaners', url: 'https://www.tiktok.com/@cteau2wins/video/7608148655559920917' },
];

async function inspect() {
  for (const item of items) {
    try {
      const res = await fetch(item.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      const html = await res.text();
      
      // Extract title tag
      const titleMatch = html.match(/<title data-rh="true">(.*?)<\/title>/) || html.match(/<title>(.*?)<\/title>/);
      const title = titleMatch ? titleMatch[1] : 'N/A';
      
      // Extract creator / author
      const authorMatch = html.match(/"author":\{"uniqueId":"(.*?)"/) || html.match(/@([a-zA-Z0-9_.-]+)/);
      const author = authorMatch ? authorMatch[1] : item.url.split('/@')[1]?.split('/')[0] || 'Unknown';
      
      // Extract og:description
      const descMatch = html.match(/property="og:description" content="(.*?)"/) || html.match(/name="description" content="(.*?)"/);
      const desc = descMatch ? descMatch[1] : 'N/A';

      console.log('----------------------------------------------------');
      console.log('ID:', item.id);
      console.log('Film Label:', item.label);
      console.log('Author/Account:', author);
      console.log('Page Title:', title);
      console.log('Description:', desc);
    } catch (e) {
      console.log('ID:', item.id, 'ERROR:', e.message);
    }
  }
}

inspect();

