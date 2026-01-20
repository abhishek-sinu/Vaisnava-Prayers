// add_transliterations.js
// Usage: node add_transliterations.js <input_json_file>
// This script adds Odia and Bengali transliterations to each sloka object in the given JSON file.
// It preserves all \n newlines in the text fields.

const fs = require('fs');
const path = require('path');
const glob = require('glob');
// Use the 'indic-transliteration' library for accurate script conversion
// Make sure to install it: npm install @indic-transliteration/sanscript
const Sanscript = require('@indic-transliteration/sanscript');

function normalizeIAST(iast) {
  // Replace all 'ṁ' (U+1E41) and 'ṃ' (U+1E43) with 'ṃ' (U+1E43)
  return iast.replace(/[ṁṃ]/g, 'ṃ');
}

function transliterateToOdia(iast) {
  // Normalize IAST before transliteration
  return Sanscript.t(normalizeIAST(iast), 'iast', 'oriya');
}

function transliterateToBengali(iast) {
  // Normalize IAST before transliteration
  return Sanscript.t(normalizeIAST(iast), 'iast', 'bengali');
}

function processFile(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let changed = false;
  const newData = data.map(obj => {
    const iast = obj.english || '';
    if (!obj.odia || !obj.bengali) {
      changed = true;
      return {
        ...obj,
        odia: obj.odia || transliterateToOdia(iast),
        bengali: obj.bengali || transliterateToBengali(iast)
      };
    }
    return obj;
  });
  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(newData, null, 2), 'utf8');
    console.log('Transliterations added to', filePath);
  } else {
    console.log('No changes needed for', filePath);
  }
}

if (require.main === module) {
  const inputFile = process.argv[2];
  if (inputFile) {
    processFile(path.resolve(inputFile));
  } else {
    // No argument: process all slokas_*.json files in the current directory
    glob.sync('slokas_*.json').forEach(file => {
      processFile(path.resolve(file));
    });
  }
}
