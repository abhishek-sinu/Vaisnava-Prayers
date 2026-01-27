const axios = require('axios');
const cheerio = require('cheerio');

async function fetchVedabaseSloka(ref) {
  const url = `https://vedabase.io/en/library/${ref}`;
  const res = await axios.get(url);
  const $ = cheerio.load(res.data);


  // Extract all Devanagari slokas (may be more than one for a range)
  let sanskritBlock = '';
  $("h2:contains('Devanagari')").next('div').find('div.text-center').each((i, el) => {
    sanskritBlock += $(el).text().trim() + '\n';
  });
  let sanskrits = sanskritBlock.split(/॥\s*\d+\s*॥/).map(s => s.trim()).filter(Boolean);

  // Extract all English transliterations
  let englishBlock = '';
  $("h2:contains('Verse text')").next('div').find('div.text-center').each((i, el) => {
    // Prefer <em>, but fallback to text if <em> not found
    let emText = $(el).find('em').map((i, em) => $(em).text().trim()).get().join('\n');
    if (emText) {
      englishBlock += emText + '\n';
    } else {
      englishBlock += $(el).text().trim() + '\n';
    }
  });
  let englishes = englishBlock.split(/\n\s*\n/).map(e => e.trim()).filter(Boolean);

  // Extract translation(s)
  let translations = [];
  $('h2, h3, h4').each((i, el) => {
    if ($(el).text().toLowerCase().includes('translation')) {
      const txt = $(el).next().text().trim();
      translations = txt.split(/\n\s*\n/).map(t => t.trim()).filter(Boolean);
    }
  });

  // Parse verse numbers from ref
  const match = ref.match(/sb\/(\d+)\/(\d+)\/(\d+)(?:-(\d+))?\//);
  if (!match) throw new Error('Invalid reference format');
  const [_, canto, chapter, start, end] = match;
  const startVerse = parseInt(start, 10);
  const endVerse = end ? parseInt(end, 10) : startVerse;

  // Build JSON objects
  const results = [];
  for (let i = 0; i <= endVerse - startVerse; i++) {
    results.push({
      number: `ŚB ${canto}.${chapter}.${startVerse + i}`,
      sanskrit: sanskrits[i] || '',
      english: englishes[i] || '',
      translation: translations[i] || translations[0] || ''
    });
  }
  return results;
}

// Example usage:
if (require.main === module) {
  const ref = process.argv[2];
  const outFile = process.argv[3];
  if (!ref) {
    console.log('Usage: node single-sloka-fetcher.cjs sb/6/4/27-28/ [output.json]');
    process.exit(1);
  }
  fetchVedabaseSloka(ref).then(results => {
    if (outFile) {
      const fs = require('fs');
      fs.writeFileSync(outFile, JSON.stringify(results, null, 2), 'utf8');
      console.log(`Saved to ${outFile}`);
    } else {
      results.forEach(obj => console.log(JSON.stringify(obj, null, 2)));
    }
  }).catch(err => {
    console.error('Error:', err.message);
  });
}
