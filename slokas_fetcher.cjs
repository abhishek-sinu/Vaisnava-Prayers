// Node.js script to fetch slokas from Vedabase for a given range and save as JSON
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// Helper to fetch combined verses
async function fetchCombinedSloka(canto, chapter, v1, v2) {
  const url = `https://vedabase.io/en/library/sb/${canto}/${chapter}/${v1}-${v2}/`;
  const res = await axios.get(url);
  const $ = cheerio.load(res.data);

  // Extract number
  const number1 = `ŚB ${canto}.${chapter}.${v1}`;
  const number2 = `ŚB ${canto}.${chapter}.${v2}`;

  // Extract Sanskrit (Devanagari)
  let sanskrits = [];
  $("h2:contains('Devanagari')").next('div').find('div.text-center').each((i, el) => {
    const lines = [];
    $(el).contents().each((j, node) => {
      if (node.type === 'text') lines.push($(node).text().trim());
      if (node.name === 'br') lines.push('\n');
    });
    // Split by verse marker (॥)
    const joined = lines.join('').replace(/\n+/g, '\n').trim();
    sanskrits = joined.split(/॥\s*\d+\s*॥/).map(s => s.trim()).filter(Boolean);
  });

  // Extract English transliteration
  let englishes = [];
  $("h2:contains('Verse text')").next('div').find('div.text-center').each((i, el) => {
    const lines = [];
    $(el).find('em').contents().each((j, node) => {
      if (node.type === 'text') lines.push($(node).text().trim());
      if (node.name === 'br') lines.push('\n');
    });
    const joined = lines.join('').replace(/\n+/g, '\n').trim();
    englishes = joined.split(/\n\s*\n/).map(e => e.trim()).filter(Boolean);
  });

  // Extract translation (may be combined, so split by verse number)
  let translations = [];
  $('h2, h3, h4').each((i, el) => {
    if ($(el).text().toLowerCase().includes('translation')) {
      const txt = $(el).next().text().trim();
      // Try to split by verse number
      translations = txt.split(/\n\s*\n/).map(t => t.trim()).filter(Boolean);
    }
  });

  // Return array of objects for both verses
  return [
    { number: number1, sanskrit: sanskrits[0] || '', english: englishes[0] || '', translation: translations[0] || '' },
    { number: number2, sanskrit: sanskrits[1] || '', english: englishes[1] || '', translation: translations[1] || '' }
  ];
}

async function fetchSloka(canto, chapter, verse) {
  // Helper to fetch combined verses
  async function fetchCombinedSloka(canto, chapter, v1, v2) {
    const url = `https://vedabase.io/en/library/sb/${canto}/${chapter}/${v1}-${v2}/`;
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);

    // Extract number
    const number1 = `ŚB ${canto}.${chapter}.${v1}`;
    const number2 = `ŚB ${canto}.${chapter}.${v2}`;

    // Extract Sanskrit (Devanagari)
    let sanskrits = [];
    $("h2:contains('Devanagari')").next('div').find('div.text-center').each((i, el) => {
      const lines = [];
      $(el).contents().each((j, node) => {
        if (node.type === 'text') lines.push($(node).text().trim());
        if (node.name === 'br') lines.push('\n');
      });
      // Split by verse marker (॥)
      const joined = lines.join('').replace(/\n+/g, '\n').trim();
      sanskrits = joined.split(/॥\s*\d+\s*॥/).map(s => s.trim()).filter(Boolean);
    });

    // Extract English transliteration
    let englishes = [];
    $("h2:contains('Verse text')").next('div').find('div.text-center').each((i, el) => {
      const lines = [];
      $(el).find('em').contents().each((j, node) => {
        if (node.type === 'text') lines.push($(node).text().trim());
        if (node.name === 'br') lines.push('\n');
      });
      const joined = lines.join('').replace(/\n+/g, '\n').trim();
      englishes = joined.split(/\n\s*\n/).map(e => e.trim()).filter(Boolean);
    });

    // Extract translation (may be combined, so split by verse number)
    let translations = [];
    $('h2, h3, h4').each((i, el) => {
      if ($(el).text().toLowerCase().includes('translation')) {
        const txt = $(el).next().text().trim();
        // Try to split by verse number
        translations = txt.split(/\n\s*\n/).map(t => t.trim()).filter(Boolean);
      }
    });

    // Return array of objects for both verses
    return [
      { number: number1, sanskrit: sanskrits[0] || '', english: englishes[0] || '', translation: translations[0] || '' },
      { number: number2, sanskrit: sanskrits[1] || '', english: englishes[1] || '', translation: translations[1] || '' }
    ];
  }
  const url = `https://vedabase.io/en/library/sb/${canto}/${chapter}/${verse}/`;
  const res = await axios.get(url);
  const $ = cheerio.load(res.data);

  // Extract number
  const number = `ŚB ${canto}.${chapter}.${verse}`;

  // Extract Sanskrit (Devanagari)
  let sanskrit = '';
  $("h2:contains('Devanagari')").next('div').find('div.text-center').each((i, el) => {
    const lines = [];
    $(el).contents().each((j, node) => {
      if (node.type === 'text') lines.push($(node).text().trim());
      if (node.name === 'br') lines.push('\n');
    });
    sanskrit = lines.join('').replace(/\n+/g, '\n').trim();
  });

  // Extract English transliteration
  let english = '';
  $("h2:contains('Verse text')").next('div').find('div.text-center').each((i, el) => {
    const lines = [];
    $(el).find('em').contents().each((j, node) => {
      if (node.type === 'text') lines.push($(node).text().trim());
      if (node.name === 'br') lines.push('\n');
    });
    english = lines.join('').replace(/\n+/g, '\n').trim();
  });

  // Extract translation
  let translation = '';
  $('h2, h3, h4').each((i, el) => {
    if ($(el).text().toLowerCase().includes('translation')) {
      translation = $(el).next().text().trim();
    }
  });

  return { number, sanskrit, english, translation };
}

async function fetchRange(canto, chapter, startVerse, endVerse, outFile) {
  const results = [];
  const logFile = 'slokas_fetcher_errors.log';
  let v = startVerse;
  while (v <= endVerse) {
    try {
      const data = await fetchSloka(canto, chapter, v);
      results.push(data);
      console.log(`Fetched: ${data.number}`);
      v++;
    } catch (e) {
      if (e.response && e.response.status === 404 && v < endVerse) {
        // Try combined fetch for v and v+1
        try {
          const combined = await fetchCombinedSloka(canto, chapter, v, v+1);
          results.push(combined[0]);
          results.push(combined[1]);
          console.log(`Fetched combined: ${combined[0].number}, ${combined[1].number}`);
          v += 2;
          continue;
        } catch (e2) {
          const msg = `Failed for combined verses ${canto}.${chapter}.${v}-${v+1}: ${e2.message}\n`;
          console.error(msg);
          fs.appendFileSync(logFile, msg, 'utf8');
        }
      }
      const msg = `Failed for verse ${canto}.${chapter}.${v}: ${e.message}\n`;
      console.error(msg);
      fs.appendFileSync(logFile, msg, 'utf8');
      v++;
    }
  }
  fs.writeFileSync(outFile, JSON.stringify(results, null, 2), 'utf8');
  console.log(`Saved to ${outFile}`);
  console.log(`Any errors logged to ${logFile}`);
}

// Prayers by Kardama Muni
fetchRange(3, 28, 24, 33, './slokas_Kardama_Muni.json');

// Prayers by Devahuti
fetchRange(3, 33, 2, 8, './slokas_Devahuti.json');

// Prayers by Dhruva
fetchRange(4, 9, 6, 17, './slokas_Dhruva.json');

// Prayers by Maharaja Prthu
fetchRange(4, 20, 23, 31, './slokas_Maharaja_Prthu.json');

// Prayers by Vritrasura
fetchRange(6, 11, 23, 27, './slokas_Vritrasura.json');

// Prayers by King Citraketu
fetchRange(6, 16, 34, 48, './slokas_King_Citraketu.json');

// Prayers by Prahlada
fetchRange(7, 9, 8, 50, './slokas_Prahlada.json');

// Prayers by Gajendra
fetchRange(8, 3, 2, 29, './slokas_Gajendra.json');

// Prayers by Satyavrata
fetchRange(8, 24, 56, 60, './slokas_Satyavrata.json');

// Prayers by Demigods
fetchRange(10, 2, 26, 41, './slokas_Demigods.json');

// Prayers by Nala Kubera
fetchRange(10, 10, 29, 38, './slokas_Nala_Kubera.json');

// Prayers by Brahma
fetchRange(10, 14, 1, 39, './slokas_Brahma.json');

// Prayers by Wives of Kaliya
fetchRange(10, 16, 33, 53, './slokas_Wives_of_Kaliya.json');

// Prayers by Indra
fetchRange(10, 27, 4, 13, './slokas_Indra.json');

// Prayers by Gopis
fetchRange(10, 31, 1, 19, './slokas_Gopis.json');

// Prayers by Akrura
fetchRange(10, 40, 1, 30, './slokas_Akrura.json');

// Prayers by Muchukunda
fetchRange(10, 51, 45, 57, './slokas_Muchukunda.json');

// Prayers by Rudra (Bana’s Battle)
fetchRange(10, 63, 40, 44, './slokas_Rudra_Bana_Battle.json');

// Prayers by Vedas
fetchRange(10, 87, 21, 41, './slokas_Vedas.json');