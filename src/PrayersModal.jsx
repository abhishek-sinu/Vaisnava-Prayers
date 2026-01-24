import React, { useState } from 'react';

// Copy of normalizeIAST from App.jsx for ASCII-insensitive search
function normalizeIAST(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[āáàâäãåā]/g, 'a')
    .replace(/[īíìîïī]/g, 'i')
    .replace(/[ūúùûüū]/g, 'u')
    .replace(/[ṛṝ]/g, 'r')
    .replace(/[ḷḹ]/g, 'l')
    .replace(/[ṅṇñń]/g, 'n')
    .replace(/[ṭ]/g, 't')
    .replace(/[ḍ]/g, 'd')
    .replace(/[śṣ]/g, 's')
    .replace(/[ç]/g, 'c')
    .replace(/[ē]/g, 'e')
    .replace(/[ō]/g, 'o')
    .replace(/[ṁṃ]/g, 'm')
    .replace(/[^a-z0-9\s]/g, '');
}

export default function PrayersModal({ prayers, onSelect, onClose }) {
  const [search, setSearch] = useState('');
  // If the search query contains IAST diacritics, search as-is (case-insensitive)
  // Otherwise, normalize both query and title for ASCII search
  const hasDiacritics = /[āīūṛṝḷḹṅṇñṭḍśṣçēōṁṃ]/i.test(search);
  const filteredPrayers = prayers.filter(prayer => {
    const title = prayer.title || '';
    const reference = prayer.reference || '';
    if (hasDiacritics) {
      return (
        title.toLowerCase().includes(search.toLowerCase()) ||
        reference.toLowerCase().includes(search.toLowerCase())
      );
    } else {
      const normQuery = normalizeIAST(search);
      const normTitle = normalizeIAST(title);
      const normRef = normalizeIAST(reference);
      return (
        normTitle.includes(normQuery) ||
        normRef.includes(normQuery)
      );
    }
  });
  return (
    <div className="prayers-modal-overlay" onClick={onClose}>
      <div className="prayers-modal" onClick={e => e.stopPropagation()}>
        <div className="prayers-modal-header">
          <h2>Prayers List</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <input
          type="text"
          className="prayers-modal-search"
          placeholder="Search prayers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="prayers-modal-list">
          {filteredPrayers.map((prayer, idx) => (
            <button
              key={prayer.title}
              className="prayers-modal-list-item"
              onClick={() => {
                // Debug: log which prayer is selected and its index in both arrays
                const origIdx = prayers.findIndex(p => p.title === prayer.title);
                console.log('PRAYERS MODAL DEBUG: Clicked prayer:', prayer.title, '| Filtered idx:', idx, '| Original idx:', origIdx);
                onSelect(origIdx);
              }}
            >
              <div className="prayer-title">{prayer.title}</div>
              <div className="prayer-ref">{prayer.reference}</div>
            </button>
          ))}
          {filteredPrayers.length === 0 && <div className="no-results">No prayers found.</div>}
        </div>
      </div>
    </div>
  );
}
