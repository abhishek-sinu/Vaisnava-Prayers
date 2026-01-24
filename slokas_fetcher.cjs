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
// Prayers by Vyasadeva
// fetchRange(1, 1, 1, 3, './slokas_Vyasadeva.json');

// // Prayers by Arjuna
// fetchRange(1, 7, 22, 25, './slokas_Arjuna.json');

// // Prayers by Queen Kunti
// fetchRange(1, 8, 18, 43, './slokas_Queen_Kunti.json');
// // Prayers by Kardama Muni
// fetchRange(3, 28, 24, 33, './slokas_Kardama_Muni.json');

// // Prayers by Devahuti
// fetchRange(3, 33, 2, 8, './slokas_Devahuti.json');

// // Prayers by Dhruva
// fetchRange(4, 9, 6, 17, './slokas_Dhruva.json');

// // Prayers by Maharaja Prthu
// fetchRange(4, 20, 23, 31, './slokas_Maharaja_Prthu.json');

// // Prayers by Vritrasura
// fetchRange(6, 11, 23, 27, './slokas_Vritrasura.json');

// // Prayers by King Citraketu
// fetchRange(6, 16, 34, 48, './slokas_King_Citraketu.json');

// // Prayers by Prahlada
// fetchRange(7, 9, 8, 50, './slokas_Prahlada.json');

// // Prayers by Gajendra
// fetchRange(8, 3, 2, 29, './slokas_Gajendra.json');

// // Prayers by Satyavrata
// fetchRange(8, 24, 56, 60, './slokas_Satyavrata.json');

// // Prayers by Demigods
// fetchRange(10, 2, 26, 41, './slokas_Demigods.json');

// // Prayers by Nala Kubera
// fetchRange(10, 10, 29, 38, './slokas_Nala_Kubera.json');

// // Prayers by Brahma
// fetchRange(10, 14, 1, 39, './slokas_Brahma.json');

// // Prayers by Wives of Kaliya
// fetchRange(10, 16, 33, 53, './slokas_Wives_of_Kaliya.json');

// // Prayers by Indra
// fetchRange(10, 27, 4, 13, './slokas_Indra.json');

// // Prayers by Gopis
// fetchRange(10, 31, 1, 19, './slokas_Gopis.json');

// // Prayers by Akrura
// fetchRange(10, 40, 1, 30, './slokas_Akrura.json');

// // Prayers by Muchukunda
// fetchRange(10, 51, 45, 57, './slokas_Muchukunda.json');

// // Prayers by Rudra (Bana’s Battle)
// fetchRange(10, 63, 40, 44, './slokas_Rudra_Bana_Battle.json');

// // Prayers by Vedas
// fetchRange(10, 87, 21, 41, './slokas_Vedas.json');

fetchRange(6, 11, 24, 27, './slokas_Vritrasura.json');
// === AUTO-GENERATED FETCH COMMANDS FOR NEW PRAYERS ===
// CANTO 3
//fetchRange(3, 5, 39, 51, './slokas_Demigods.json');
// fetchRange(3, 16, 16, 25, './slokas_Sanakadi_Rishis.json');

// // CANTO 4
// fetchRange(4, 1, 26, 28, './slokas_Atri_Rishi.json');
// fetchRange(4, 1, 56, 57, './slokas_Demigods_Nara_Narayana.json');
// fetchRange(4, 24, 6, 23, './slokas_Brahma_to_Shiva.json');
// fetchRange(4, 7, 26, 47, './slokas_Daksha_Yajna.json');
// fetchRange(4, 17, 29, 36, './slokas_Dhara.json');
// fetchRange(4, 24, 33, 79, './slokas_Rudra_Gita.json');
// fetchRange(4, 30, 22, 42, './slokas_Pracetas.json');

// // CANTO 5
// fetchRange(5, 3, 4, 15, './slokas_Rtvija_Nabhi_Yajna.json');
// fetchRange(5, 17, 17, 24, './slokas_Shiva_Sankarsana.json');
// fetchRange(5, 18, 2, 6, './slokas_Bhadrasrava_Hayagriva.json');
// fetchRange(5, 18, 8, 14, './slokas_Prahlada_Nrsimha.json');
// fetchRange(5, 18, 18, 23, './slokas_Lakshmi_Kamadeva.json');
// fetchRange(5, 18, 25, 28, './slokas_Manu_Matsya.json');
// fetchRange(5, 18, 30, 33, './slokas_Aryama_Kurma.json');
// fetchRange(5, 18, 35, 39, './slokas_Bhumi_Varaha.json');

// // CANTO 6
// fetchRange(6, 4, 23, 34, './slokas_Daksha_Harina_Guhya.json');
// fetchRange(6, 9, 21, 27, './slokas_Demigods_Supreme.json');
// fetchRange(6, 9, 31, 45, './slokas_Demigods_Appearance.json');
// fetchRange(6, 16, 18, 25, './slokas_Narada_Muni.json');
// fetchRange(6, 16, 34, 48, './slokas_Citraketu_Stotra.json');

// // CANTO 7
// fetchRange(7, 8, 40, 56, './slokas_Demigods_Nrsimha.json');
// fetchRange(7, 10, 8, 50, './slokas_Prahlada_Pacify_Nrsimha.json');

// // CANTO 8
// fetchRange(8, 1, 9, 16, './slokas_Svayambhuva_Manu.json');
// fetchRange(8, 5, 26, 50, './slokas_Brahma_Ksirodakasayi.json');
// fetchRange(8, 6, 8, 15, './slokas_Brahma_Appearance.json');
// fetchRange(8, 7, 21, 35, './slokas_Prajapatis_Shiva.json');
// fetchRange(8, 12, 4, 13, './slokas_Shiva_Vishnu.json');
// fetchRange(8, 17, 8, 10, './slokas_Aditi.json');
// fetchRange(8, 17, 25, 28, './slokas_Brahma_Womb_Aditi.json');
// fetchRange(8, 22, 2, 11, './slokas_Bali_Vamana.json');
// fetchRange(8, 22, 20, 20, './slokas_Vindhyavali_Vamana.json');
// fetchRange(8, 22, 21, 23, './slokas_Brahma_Vamana.json');
// fetchRange(8, 23, 6, 8, './slokas_Prahlada_Vamana.json');
// fetchRange(8, 24, 27, 30, './slokas_Satyavrata_Matsya_1.json');
// fetchRange(8, 24, 46, 53, './slokas_Satyavrata_Matsya_2.json');

// // CANTO 9
// fetchRange(9, 5, 3, 11, './slokas_Ambarisha_Sudarshana.json');
// fetchRange(9, 8, 21, 26, './slokas_Anshuman_Kapila.json');
// fetchRange(9, 11, 6, 7, './slokas_Brahmanas_Rama.json');

// // CANTO 10 (only new/missing or range-corrected)
// fetchRange(10, 3, 13, 22, './slokas_Vasudeva_Krishna.json');
// fetchRange(10, 3, 24, 31, './slokas_Devaki_Krishna.json');
// fetchRange(10, 16, 56, 59, './slokas_Kaliya_Naga.json');
// fetchRange(10, 19, 9, 10, './slokas_Cowherd_Boys.json');
// fetchRange(10, 21, 7, 19, './slokas_Venu_Geet.json');
// fetchRange(10, 23, 29, 30, './slokas_Wives_Brahmanas.json');
// fetchRange(10, 23, 50, 50, './slokas_Brahmanas_Krishna.json');
// fetchRange(10, 27, 19, 21, './slokas_Surabhi_Cow.json');
// fetchRange(10, 28, 5, 8, './slokas_Varuna_Krishna.json');
// fetchRange(10, 29, 31, 41, './slokas_Gopis_Rasa_Sthali.json');
// fetchRange(10, 35, 2, 25, './slokas_Gopis_Pastimes.json');
// fetchRange(10, 37, 10, 23, './slokas_Narada_Muni_10.json');
// fetchRange(10, 39, 19, 30, './slokas_Gopis_Crying.json');
// fetchRange(10, 47, 12, 21, './slokas_Bhramara_Gita.json');
// fetchRange(10, 47, 58, 63, './slokas_Uddhava_Gopis.json');
// fetchRange(10, 48, 17, 27, './slokas_Akrura_Mathura.json');
// fetchRange(10, 52, 37, 43, './slokas_Rukmini_Letter.json');
// fetchRange(10, 59, 25, 31, './slokas_Bhumi_Devi.json');
// fetchRange(10, 60, 34, 46, './slokas_Rukmini_Krita_Stava.json');
// fetchRange(10, 63, 25, 28, './slokas_Shiva_Jvara.json');
// fetchRange(10, 63, 34, 45, './slokas_Shiva_Krishna.json');
// fetchRange(10, 64, 26, 29, './slokas_King_Nriga.json');
// fetchRange(10, 65, 28, 29, './slokas_Yamuna_Balarama.json');
// fetchRange(10, 69, 17, 18, './slokas_Narada_Muni_10_1.json');
// fetchRange(10, 69, 38, 39, './slokas_Narada_Muni_10_2.json');
// fetchRange(10, 70, 25, 30, './slokas_Jailed_Kings.json');
// fetchRange(10, 73, 8, 16, './slokas_Kings_Released.json');
// fetchRange(10, 74, 2, 5, './slokas_Yudhishthira_Krishna.json');
// fetchRange(10, 84, 16, 26, './slokas_Sages_Kurukshetra.json');
// fetchRange(10, 85, 3, 20, './slokas_Vasudeva_Krishna_Balarama.json');
// fetchRange(10, 85, 23, 39, './slokas_Devaki_Krishna_Balarama.json');
// fetchRange(10, 85, 39, 46, './slokas_King_Bali.json');
// fetchRange(10, 86, 31, 36, './slokas_Bahulasva.json');
// fetchRange(10, 86, 44, 49, './slokas_Shrutadeva.json');
// fetchRange(10, 87, 14, 41, './slokas_Personified_Vedas.json');
// fetchRange(10, 89, 58, 59, './slokas_Mahavishnu_Krishna_Arjuna.json');
// fetchRange(10, 90, 47, 50, './slokas_Sukadeva_Summarization.json');

// // CANTO 11
// fetchRange(11, 4, 10, 11, './slokas_Demigods_Nara_Narayana_11.json');
// fetchRange(11, 6, 7, 19, './slokas_Brahma_Demigods_Supreme_11.json');
// fetchRange(11, 29, 49, 49, './slokas_Sukadeva_Krishna_11.json');
// fetchRange(11, 30, 43, 43, './slokas_Daruka_Krishna_11.json');

// // CANTO 12
// fetchRange(12, 8, 40, 49, './slokas_Markandeya_Nara_Narayana_12.json');
// fetchRange(12, 10, 2, 2, './slokas_Markandeya_12.json');
// fetchRange(12, 10, 16, 17, './slokas_Markandeya_Shiva_12_1.json');
// fetchRange(12, 10, 28, 34, './slokas_Markandeya_Shiva_12_2.json');
// // === END AUTO-GENERATED ===

// // // Prayers by the Citizens of Dvārakā
// // fetchRange(1, 11, 6, 10, './slokas_Citizens_of_Dwaraka.json');

// // // Prayers by Lord Brahmā to Śrī Garbhodakaśāyī Viṣṇu
// // fetchRange(3, 9, 1, 25, './slokas_Brahma_Garbhodakasayi.json');

// // // Prayers to Lord Varāha by Ṛṣis
// // fetchRange(3, 13, 34, 45, './slokas_Rishis_Varaha.json');

// // // Prayers to Lord Viṣṇu by Sanakādi Ṛṣis at the Gate of Vaikuṇṭhaloka
// // fetchRange(3, 15, 46, 50, './slokas_Sanakadi_Vaikuntha.json');

// // // Prayers to Lord Varaha by Demigods
// // fetchRange(3, 19, 30, 30, './slokas_Demigods_Varaha.json');