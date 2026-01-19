
import { useState, useEffect, useRef, forwardRef } from 'react';
import allSlokasData from './allSlokasData';


// Book page-turn animation wrapper component (must be before App)
const SlokaSlideCard = forwardRef(function SlokaSlideCard({ children }, ref) {
  const [state, setState] = useState('enter');
  useEffect(() => {
    setState('enter');
    const timeout = setTimeout(() => setState('enter-active'), 10);
    return () => clearTimeout(timeout);
  }, []);
  return (
    <div
      ref={ref}
      className={`card shadow-lg border-0 rounded-4 p-4 mb-5 sloka-card sloka-page-${state}`}
      style={{
        background: 'linear-gradient(120deg, #f9f6f1 80%, #ecd9b6 100%)',
        maxWidth: 900,
        margin: '2rem auto',
        willChange: 'opacity',
        position: 'relative',
        minHeight: 400,
      }}
    >
      {children}
    </div>
  );
});
import vaishnavaLogo from './assets/vaishnava-logo.png';
import './App.css';
import SlokaObjectBuilder from './SlokaObjectBuilder';
import { prayers } from './prayersData';
import { slokas } from './slokasData';

function getRandomSlokaFromAll() {
  if (!allSlokasData.length) return null;
  const idx = Math.floor(Math.random() * allSlokasData.length);
  return allSlokasData[idx];
}


// Advanced IAST normalization and regex builder for ASCII search
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

// Build a regex for ASCII search that matches IAST diacritics
function buildIASTRegex(ascii) {
  // Map ASCII to IAST regex
  // e.g. aham -> a(h|ḥ)a(m|ṃ|ṁ)?
  let out = '';
  for (let i = 0; i < ascii.length; i++) {
    const c = ascii[i];
    if (c === 'a') out += '[aāáàâäãåā]';
    else if (c === 'i') out += '[iīíìîïī]';
    else if (c === 'u') out += '[uūúùûüū]';
    else if (c === 'r') out += '[rṛṝ]';
    else if (c === 'l') out += '[lḷḹ]';
    else if (c === 'n') out += '[nṅṇñń]';
    else if (c === 't') out += '[tṭ]';
    else if (c === 'd') out += '[dḍ]';
    else if (c === 's') out += '[sśṣ]';
    else if (c === 'm') out += '[mṃṁ]';
    else if (c === 'c') out += '[cç]';
    else if (c === 'e') out += '[eē]';
    else if (c === 'o') out += '[oō]';
    else out += c;
  }
  return new RegExp(out, 'i');
}

function App() {
  const [selectedPrayer, setSelectedPrayer] = useState(null);
  const [selectedSlokaIdx, setSelectedSlokaIdx] = useState(null);
  const [language, setLanguage] = useState('both');
  const [search, setSearch] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [vandanaOfDay] = useState(getRandomSlokaFromAll());
  
  // For slide animation
  const [slokaAnimKey, setSlokaAnimKey] = useState(0);
  const slokaCardRef = useRef(null);

  const prayerTitle = selectedPrayer !== null ? prayers[selectedPrayer].title : null;
  const slokaList = prayerTitle && slokas[prayerTitle] ? slokas[prayerTitle] : [];
  const selectedSloka = selectedSlokaIdx !== null && slokaList[selectedSlokaIdx] ? slokaList[selectedSlokaIdx] : null;

  // Autocomplete suggestions for IAST (english) sloka text
  useEffect(() => {
    if (!search.trim()) {
      setSearchSuggestions([]);
      return;
    }
    const q = search.trim().toLowerCase();
    const qNorm = normalizeIAST(q);
    const qRegex = buildIASTRegex(qNorm);
    const matches = allSlokasData.filter(item => {
      const eng = item.sloka.english || '';
      const num = item.sloka.number || '';
      // Match if: original includes, normalized includes, or regex matches
      return (
        eng.toLowerCase().includes(q) ||
        normalizeIAST(eng).includes(qNorm) ||
        qRegex.test(eng) ||
        num.toLowerCase().includes(q)
      );
    }).slice(0, 30); // limit to 30 suggestions
    setSearchSuggestions(matches);
  }, [search]);

  // Compute Vedabase link for the selected sloka
  const vedabaseSlokaUrl = selectedSloka && selectedSloka.number
    ? `https://vedabase.io/en/library/sb/${selectedSloka.number.replace('ŚB ', '').split('.').join('/')}/`
    : null;

  // Responsive: show dropdown on mobile, chips on desktop
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Navigation: handle scroll and arrow keys for sloka navigation
  useEffect(() => {
    if (selectedPrayer === null || !slokaList.length) return;
    const handleKeyDown = (e) => {
      if (selectedSlokaIdx === null) return;
      if (
        (e.key === 'ArrowDown' || e.key === 'ArrowRight') &&
        selectedSlokaIdx < slokaList.length - 1
      ) {
        setSelectedSlokaIdx(idx => idx + 1);
        setSlokaAnimKey(k => k + 1);
      } else if (
        (e.key === 'ArrowUp' || e.key === 'ArrowLeft') &&
        selectedSlokaIdx > 0
      ) {
        setSelectedSlokaIdx(idx => idx - 1);
        setSlokaAnimKey(k => k + 1);
      }
    };
    const handleWheel = (e) => {
      if (selectedSlokaIdx === null) return;
      if (e.deltaY > 0 && selectedSlokaIdx < slokaList.length - 1) {
        setSelectedSlokaIdx(idx => idx + 1);
        setSlokaAnimKey(k => k + 1);
      } else if (e.deltaY < 0 && selectedSlokaIdx > 0) {
        setSelectedSlokaIdx(idx => idx - 1);
        setSlokaAnimKey(k => k + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    // Only enable scroll navigation on touch devices (mobile/tablet)
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
      window.addEventListener('wheel', handleWheel, { passive: true });
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (isTouchDevice) {
        window.removeEventListener('wheel', handleWheel);
      }
    };
  }, [selectedSlokaIdx, selectedPrayer, slokaList.length]);

  return (
      <>
      <nav className="navbar navbar-expand-lg navbar-light" style={{ background: 'linear-gradient(90deg, #ecd9b6 60%, #f9f6f1 100%)', borderBottom: '2px solid #e2c799' }}>
        <div className="container-fluid">
          <a className="navbar-brand d-flex align-items-center gap-2" href="#">
            <img src={vaishnavaLogo} alt="Vaiṣṇava Prayers Logo" width="56" height="56" style={{ borderRadius: 12, boxShadow: '0 2px 8px #e2c79922', background: '#fff' }} />
            <span className="fw-bold vaisnava-vandana-title" style={{ color: '#7c4700', fontFamily: 'serif', fontSize: 22, letterSpacing: 1, whiteSpace: 'normal', wordBreak: 'break-word' }}>Kṛṣṇa Vandanā</span>
          </a>
          <button className="navbar-toggler d-block d-md-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebarOffcanvas" aria-controls="sidebarOffcanvas" aria-label="Toggle sidebar">
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>
      </nav>
      <div className="container-fluid min-vh-100 p-0" style={{ background: 'linear-gradient(120deg, #f9f6f1 60%, #ecd9b6 100%)' }}>
        <div className="row g-0 main-row">
          {/* Sidebar for desktop */}
          <aside className="col-md-3 col-lg-2 border-end shadow-sm py-0 px-3 d-none d-md-block sidebar" style={{ background: 'linear-gradient(180deg, #f8ecd4 80%, #e2c799 100%)', display: 'flex', flexDirection: 'column', height: '100vh', minHeight: 0 }}>
            <div style={{ position: 'sticky', top: 0, zIndex: 2, background: 'linear-gradient(180deg, #f8ecd4 80%, #e2c799 100%)', paddingTop: '1.5rem', paddingBottom: '1rem' }}>
              <h2 className="fw-bold mb-4" style={{ fontFamily: 'serif', color: '#7c4700', letterSpacing: 1, marginBottom: 0 }}>Śrīmad Bhāgavatam Prayers</h2>
            </div>
            <div className="nav flex-column" style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingTop: 0 }}>
              {prayers.map((prayer, idx) => (
                <button
                  key={prayer.title}
                  className={`btn text-start mb-3 py-3 px-3 rounded-4 border-0 ${selectedPrayer === idx ? 'fw-bold' : ''}`}
                  style={{
                    fontFamily: 'serif',
                    fontSize: 18,
                    background: selectedPrayer === idx ? 'linear-gradient(90deg, #ecd9b6 80%, #f9f6f1 100%)' : '#fff',
                    color: selectedPrayer === idx ? '#7c4700' : '#4b2e05',
                    boxShadow: selectedPrayer === idx ? '0 4px 16px #e2c79944' : '0 2px 8px #e2c79922',
                    border: selectedPrayer === idx ? '2px solid #b77b1c' : '1px solid #e2c799',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => {
                    setSelectedPrayer(idx);
                    setSelectedSlokaIdx(null);
                  }}
                >
                  {prayer.title}
                  <div className="small mt-1" style={{ color: selectedPrayer === idx ? '#b77b1c' : '#a67c52' }}>{prayer.reference}</div>
                </button>
              ))}
            </div>
          </aside>
          {/* Sidebar for mobile (offcanvas) */}
          <div className="offcanvas offcanvas-start d-md-none" tabIndex="-1" id="sidebarOffcanvas" aria-labelledby="sidebarOffcanvasLabel">
            <div className="offcanvas-header">
              <h5 className="offcanvas-title" id="sidebarOffcanvasLabel" style={{ fontFamily: 'serif', color: '#7c4700' }}>Śrīmad Bhāgavatam Prayers</h5>
              <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body">
              <div className="nav flex-column">
                {prayers.map((prayer, idx) => (
                  <button
                    key={prayer.title}
                    className={`btn text-start mb-3 py-3 px-3 rounded-4 border-0 ${selectedPrayer === idx ? 'fw-bold' : ''}`}
                    style={{
                      fontFamily: 'serif',
                      fontSize: 18,
                      background: selectedPrayer === idx ? 'linear-gradient(90deg, #ecd9b6 80%, #f9f6f1 100%)' : '#fff',
                      color: selectedPrayer === idx ? '#7c4700' : '#4b2e05',
                      boxShadow: selectedPrayer === idx ? '0 4px 16px #e2c79944' : '0 2px 8px #e2c79922',
                      border: selectedPrayer === idx ? '2px solid #b77b1c' : '1px solid #e2c799',
                      transition: 'all 0.2s',
                    }}
                    data-bs-dismiss="offcanvas"
                    onClick={() => {
                      setSelectedPrayer(idx);
                      setSelectedSlokaIdx(null);
                    }}
                  >
                    {prayer.title}
                    <div className="small mt-1" style={{ color: selectedPrayer === idx ? '#b77b1c' : '#a67c52' }}>{prayer.reference}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        <main className="col-md-9 col-lg-10 px-4 py-4 main-content" style={{ background: 'linear-gradient(120deg, #f9f6f1 80%, #ecd9b6 100%)' }}>
          {/* Search Bar with Autocomplete */}
          <div className="mb-4 position-relative" style={{ maxWidth: 400 }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search slokas (IAST, number, etc)..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              style={{ fontSize: 18, fontFamily: 'serif', borderRadius: 12, border: '1.5px solid #e2c799', boxShadow: '0 2px 8px #e2c79922' }}
              autoComplete="off"
            />
            {showSuggestions && searchSuggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 10,
                background: '#fff',
                border: '1.5px solid #e2c799',
                borderTop: 'none',
                maxHeight: 320,
                overflowY: 'auto',
                borderRadius: '0 0 12px 12px',
                boxShadow: '0 4px 16px #e2c79944',
              }}>
                {searchSuggestions.map((item, idx) => (
                  <div
                    key={item.prayerTitle + item.sloka.number + idx}
                    className="px-3 py-2 suggestion-item"
                    style={{ cursor: 'pointer', borderBottom: '1px solid #f8ecd4', background: '#fff' }}
                    onMouseDown={() => {
                      // Find the prayer index and sloka index
                      const prayerIdx = prayers.findIndex(p => p.title === item.prayerTitle);
                      if (prayerIdx !== -1 && slokas[item.prayerTitle]) {
                        const slokaIdx = slokas[item.prayerTitle].findIndex(s => s.number === item.sloka.number);
                        if (slokaIdx !== -1) {
                          setSelectedPrayer(prayerIdx);
                          setSelectedSlokaIdx(slokaIdx);
                          setSearch('');
                          setShowSuggestions(false);
                        }
                      }
                    }}
                  >
                    <div style={{ fontWeight: 600, color: '#7c4700', fontSize: 15 }}>{item.sloka.number} <span style={{ color: '#b77b1c', fontWeight: 400 }}>({item.prayerTitle})</span></div>
                    <div style={{ fontSize: 14, color: '#3d2a0a', fontFamily: 'Noto Serif, Georgia, serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.sloka.english}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Vandana of the Day */}
          {selectedPrayer === null && vandanaOfDay && (
            <div className="card mb-5 p-4" style={{ background: 'linear-gradient(120deg, #f9f6f1 80%, #ecd9b6 100%)', borderRadius: 18, boxShadow: '0 2px 8px #e2c79922', maxWidth: 700, margin: '0 auto' }}>
              <div className="fw-bold mb-2" style={{ color: '#b77b1c', fontSize: 20 }}>Vandana of the Day</div>
              <div className="mb-2" style={{ color: '#7c4700', fontWeight: 600, fontSize: 18 }}>{vandanaOfDay.prayerTitle}</div>
              <h2 className="card-title text-center mb-4" style={{ fontFamily: 'serif', fontSize: 44, color: '#7c4700' }}>{vandanaOfDay.sloka.number}</h2>
              <div className="sanskrit mb-4" style={{ fontSize: 32, fontFamily: 'Noto Serif Devanagari, Noto Serif, serif', color: '#1a1200', fontWeight: 500, textAlign: 'center', whiteSpace: 'pre-line' }}>{vandanaOfDay.sloka.sanskrit}</div>
              <div className="english mb-4" style={{ fontSize: 22, fontFamily: 'Noto Serif, Georgia, serif', color: '#3d2a0a', fontStyle: 'italic', textAlign: 'center', whiteSpace: 'pre-line' }}>{vandanaOfDay.sloka.english}</div>
              {vandanaOfDay.sloka.odia && (
                <div className="odia mb-4" style={{ fontSize: 22, fontFamily: 'Noto Serif, Georgia, serif', color: '#0a3d2a', textAlign: 'center', whiteSpace: 'pre-line' }}>{vandanaOfDay.sloka.odia}</div>
              )}
              <div className="translation card border-0 rounded-3 p-3 mt-3 mx-auto" style={{ color: '#7c4700', fontSize: 20, maxWidth: 700, background: 'linear-gradient(90deg, #f9f6f1 80%, #ecd9b6 100%)' }}>
                <b style={{ color: '#b77b1c' }}>Translation:</b> {vandanaOfDay.sloka.translation}
              </div>
            </div>
          )}
          {/* Main content */}
          {selectedPrayer !== null ? (
            <div>
              <h2 className="fw-bold mb-2" style={{ fontFamily: 'serif', fontSize: 32, color: '#7c4700', letterSpacing: 1 }}>{prayers[selectedPrayer].title}</h2>
              <div className="mb-2" style={{ color: '#a67c52' }}>Reference: {prayers[selectedPrayer].reference}</div>
              <a
                href={vedabaseSlokaUrl || prayers[selectedPrayer].link}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-4 d-inline-block text-decoration-underline fw-semibold"
                style={{ color: '#b77b1c' }}
              >
                Open on Vedabase
              </a>
              {slokaList.length > 0 && (
                <div className="mt-4">
                  <h3 className="fw-bold mb-3" style={{ fontSize: 22, color: '#7c4700' }}>Slokas</h3>
                  {isMobile ? (
                    <select
                      className="form-select mb-4 sloka-dropdown"
                      style={{ maxWidth: 320, fontSize: 18, fontFamily: 'serif', background: '#f8ecd4', color: '#7c4700', border: '1.5px solid #e2c799', borderRadius: 12, boxShadow: '0 2px 8px #e2c79922' }}
                      value={selectedSlokaIdx !== null ? selectedSlokaIdx : ''}
                      onChange={e => setSelectedSlokaIdx(Number(e.target.value))}
                    >
                      <option value="" disabled>Select a Sloka</option>
                      {slokaList.map((sloka, idx) => (
                        <option key={sloka.number} value={idx}>{sloka.number}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="sloka-chips mb-4" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {slokaList.map((sloka, idx) => (
                        <button
                          key={sloka.number}
                          className={`sloka-chip ${selectedSlokaIdx === idx ? 'selected' : ''}`}
                          onClick={() => setSelectedSlokaIdx(idx)}
                          style={{
                            fontSize: 16,
                            fontFamily: 'serif',
                            fontWeight: selectedSlokaIdx === idx ? 600 : 400,
                            background: selectedSlokaIdx === idx ? 'linear-gradient(90deg, #ecd9b6 80%, #f9f6f1 100%)' : '#f8ecd4',
                            color: selectedSlokaIdx === idx ? '#7c4700' : '#4b2e05',
                            border: selectedSlokaIdx === idx ? '2px solid #b77b1c' : '1px solid #e2c799',
                            boxShadow: selectedSlokaIdx === idx ? '0 4px 16px #e2c79944' : '0 2px 8px #e2c79922',
                            borderRadius: '16px',
                            padding: '0.4rem 1rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          {sloka.number}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {selectedSloka && (
                <SlokaSlideCard key={slokaAnimKey} ref={slokaCardRef}>
                  {/* Navigation Arrows */}
                  {selectedSlokaIdx > 0 && (
                    <div className="sloka-nav-arrow left" tabIndex={0} onClick={() => { setSelectedSlokaIdx(idx => idx - 1); setSlokaAnimKey(k => k + 1); }}>
                      <svg viewBox="0 0 24 24"><path d="M15.5 19.5L8.5 12.5L15.5 5.5" stroke="#b77b1c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                      <span className="sloka-nav-tooltip">Tip: Use keyboard arrows or scroll on mobile/PC</span>
                    </div>
                  )}
                  {selectedSlokaIdx < slokaList.length - 1 && (
                    <div className="sloka-nav-arrow right" tabIndex={0} onClick={() => { setSelectedSlokaIdx(idx => idx + 1); setSlokaAnimKey(k => k + 1); }}>
                      <svg viewBox="0 0 24 24"><path d="M8.5 19.5L15.5 12.5L8.5 5.5" stroke="#b77b1c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                      <span className="sloka-nav-tooltip">Tip: Use keyboard arrows or scroll on mobile/PC</span>
                    </div>
                  )}
                  <h2 className="card-title text-center mb-4" style={{ fontFamily: 'serif', fontSize: 44, color: '#7c4700' }}>{selectedSloka.number}</h2>
                  <div className="d-flex justify-content-center align-items-center mb-4">
                    <label htmlFor="lang-select" className="fw-bold me-2" style={{ color: '#7c4700' }}>Show:</label>
                    <select
                      id="lang-select"
                      value={language}
                      onChange={e => setLanguage(e.target.value)}
                      className="form-select w-auto"
                      style={{ fontSize: 18, fontFamily: 'serif', background: '#f9f6f1', color: '#7c4700' }}
                    >
                      <option value="sanskrit">Sanskrit</option>
                      <option value="english">English</option>
                      {selectedSloka && selectedSloka.odia && <option value="odia">Odia</option>}
                      <option value="both">Both</option>
                    </select>
                  </div>
                  {language === 'sanskrit' && (
                    <div className="sanskrit mb-4" style={{ fontSize: 32, fontFamily: 'Noto Serif Devanagari, Noto Serif, serif', color: '#1a1200', fontWeight: 500, textAlign: 'center', whiteSpace: 'pre-line' }}>{selectedSloka.sanskrit}</div>
                  )}
                  {language === 'english' && (
                    <div className="english mb-4" style={{ fontSize: 22, fontFamily: 'Noto Serif, Georgia, serif', color: '#3d2a0a', fontStyle: 'italic', textAlign: 'center', whiteSpace: 'pre-line' }}>{selectedSloka.english}</div>
                  )}
                  {language === 'odia' && selectedSloka.odia && (
                    <div className="odia mb-4" style={{ fontSize: 22, fontFamily: 'Noto Serif, Georgia, serif', color: '#0a3d2a', textAlign: 'center', whiteSpace: 'pre-line' }}>{selectedSloka.odia}</div>
                  )}
                  {language === 'both' && (
                    <>
                      <div className="sanskrit mb-4" style={{ fontSize: 32, fontFamily: 'Noto Serif Devanagari, Noto Serif, serif', color: '#1a1200', fontWeight: 500, textAlign: 'center', whiteSpace: 'pre-line' }}>{selectedSloka.sanskrit}</div>
                      <div className="english mb-4" style={{ fontSize: 22, fontFamily: 'Noto Serif, Georgia, serif', color: '#3d2a0a', fontStyle: 'italic', textAlign: 'center', whiteSpace: 'pre-line' }}>{selectedSloka.english}</div>
                      {selectedSloka.odia && (
                        <div className="odia mb-4" style={{ fontSize: 22, fontFamily: 'Noto Serif, Georgia, serif', color: '#0a3d2a', textAlign: 'center', whiteSpace: 'pre-line' }}>{selectedSloka.odia}</div>
                      )}
                    </>
                  )}
                  <div className="translation card border-0 rounded-3 p-3 mt-3 mx-auto" style={{ color: '#7c4700', fontSize: 20, maxWidth: 700, background: 'linear-gradient(90deg, #f9f6f1 80%, #ecd9b6 100%)' }}>
                    <b style={{ color: '#b77b1c' }}>Translation:</b> {selectedSloka.translation}
                  </div>
                </SlokaSlideCard>
              )}



            </div>
          ) : (
            <div className="fw-semibold fs-4 mt-5" style={{ color: '#b77b1c' }}>
              Please select a prayer from the left to view details.
            </div>
          )}
        </main>
      </div>
    </div>
    </>
  );
}

export default App;
