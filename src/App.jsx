import { useState, useEffect, useRef, forwardRef } from 'react';
import allSlokasData from './allSlokasData';
import ContactUs from './ContactUs';


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
  let tries = 0;
  let sloka = null;
  while (tries < 10) {
    const idx = Math.floor(Math.random() * allSlokasData.length);
    sloka = allSlokasData[idx];
    // Check for non-empty sloka (has number and some text)
    if (sloka && sloka.sloka && (sloka.sloka.number || sloka.sloka.english || sloka.sloka.sanskrit)) {
      return sloka;
    }
    tries++;
  }
  return null;
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
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [selectedPrayer, setSelectedPrayer] = useState(null);
  const [selectedSlokaIdx, setSelectedSlokaIdx] = useState(null);
  const [language, setLanguage] = useState('both');
  const [search, setSearch] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [vandanaOfDay] = useState(getRandomSlokaFromAll());
  // Contact Us page state
  const [showContactUs, setShowContactUs] = useState(false);
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
    // Split query into words, ignore empty
    const qWords = q.split(/\s+/).filter(Boolean);
    const matches = allSlokasData.filter(item => {
      let eng = item.sloka.english || '';
      let num = item.sloka.number || '';
      // Replace \n with space for better matching
      eng = eng.replace(/\n/g, ' ');
      const engLower = eng.toLowerCase();
      const normEng = normalizeIAST(eng);
      // Each word in query must match somewhere in the sloka (original, normalized, regex, or number)
      return qWords.every(word => {
        const normWord = normalizeIAST(word);
        return (
          engLower.includes(word) ||
          normEng.includes(normWord) ||
          buildIASTRegex(normWord).test(eng) ||
          num.toLowerCase().includes(word)
        );
      });
    });
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
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedSlokaIdx, selectedPrayer, slokaList.length]);

  return (
      <>
      <nav className="navbar navbar-expand-lg navbar-light" style={{ background: 'linear-gradient(90deg, #ecd9b6 60%, #f9f6f1 100%)', borderBottom: '2px solid #e2c799', minHeight: 90 }}>
        <div className="container-fluid d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between navbar-mobile-row" style={{ gap: 8 }}>
          <a className="navbar-brand d-flex align-items-center gap-2" href="#">
            <img src={vaishnavaLogo} alt="Vaiṣṇava Prayers Logo" width="56" height="56" style={{ borderRadius: 12, boxShadow: '0 2px 8px #e2c79922', background: '#fff' }} />
            <span className="fw-bold vaisnava-vandana-title" style={{ color: '#7c4700', fontFamily: 'serif', fontSize: 22, letterSpacing: 1, whiteSpace: 'normal', wordBreak: 'break-word' }}>Kṛṣṇa Vandanā</span>
          </a>
          <div className="d-flex w-100 navbar-mobile-search-row align-items-center mt-2 mt-md-0" style={{gap:8}}>
            <div className="position-relative flex-grow-1 navbar-mobile-search" style={{ width: '100%', maxWidth: '100%', marginLeft: 0, marginRight: 0 }}>
              <input
                type="text"
                className="form-control shadow-lg"
                placeholder="Search slokas (Sloka number,phrase,without diacritics aham=>ahaṁ etc)..."
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                style={{
                  fontSize: 20,
                  fontFamily: 'serif',
                  borderRadius: 18,
                  border: '2.5px solid #b77b1c',
                  boxShadow: '0 6px 24px #e2c79955',
                  padding: '1.1rem 2rem',
                  width: '100%',
                  background: 'linear-gradient(90deg, #fffbe9 80%, #ecd9b6 100%)',
                  color: '#7c4700',
                  fontWeight: 500,
                  letterSpacing: 1,
                  transition: 'border 0.2s, box-shadow 0.2s',
                }}
                autoComplete="off"
              />
              {showSuggestions && searchSuggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 20,
                  background: '#fffbe9',
                  border: '2px solid #b77b1c',
                  borderTop: 'none',
                  maxHeight: 420,
                  overflowY: 'auto',
                  borderRadius: '0 0 18px 18px',
                  boxShadow: '0 8px 32px #e2c79977',
                }}>
                  {searchSuggestions.map((item, idx) => (
                    <div
                      key={item.prayerTitle + item.sloka.number + idx}
                      className="px-4 py-3 suggestion-item"
                      style={{
                        cursor: 'pointer',
                        borderBottom: '1px solid #ecd9b6',
                        background: '#fffbe9',
                        fontSize: 17,
                        fontFamily: 'Noto Serif, Georgia, serif',
                        color: '#7c4700',
                        fontWeight: 500,
                        transition: 'background 0.2s',
                      }}
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
                      <div style={{ fontWeight: 700, color: '#b77b1c', fontSize: 17 }}>{item.sloka.number} <span style={{ color: '#7c4700', fontWeight: 500 }}>({item.prayerTitle})</span></div>
                      <div style={{ fontSize: 15, color: '#7c4700', fontFamily: 'Noto Serif, Georgia, serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.sloka.english}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="navbar-toggler d-block d-md-none navbar-mobile-hamburger" type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebarOffcanvas" aria-controls="sidebarOffcanvas" aria-label="Toggle sidebar">
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>
        </div>
      </nav>
      <div className="container-fluid min-vh-100 p-0" style={{ background: 'linear-gradient(120deg, #f9f6f1 60%, #ecd9b6 100%)' }}>
        <div className="row g-0 main-row">
          {/* Sidebar for desktop */}
          <aside className="col-md-3 col-lg-2 border-end shadow-sm py-0 px-3 d-none d-md-block sidebar" style={{ background: 'linear-gradient(180deg, #f8ecd4 80%, #e2c799 100%)', display: 'flex', flexDirection: 'column', height: '100vh', minHeight: 0 }}>
            {/* Contact Us button - always first and outside collapsible tab */}
            <button
              className={`btn text-start mb-3 py-3 px-3 rounded-4 border-0 ${showContactUs ? 'fw-bold' : ''}`}
              style={{
                fontFamily: 'serif',
                fontSize: 18,
                background: showContactUs ? 'linear-gradient(90deg, #ecd9b6 80%, #f9f6f1 100%)' : '#fff',
                color: showContactUs ? '#7c4700' : '#2563eb',
                boxShadow: showContactUs ? '0 4px 16px #e2c79944' : '0 2px 8px #e2c79922',
                border: showContactUs ? '2px solid #b77b1c' : '1px solid #e2c799',
                transition: 'all 0.2s',
                width: '100%',
                marginTop: 18,
                marginBottom: 8
              }}
              onClick={() => {
                setShowContactUs(true);
                setSelectedPrayer(null);
                setSelectedSlokaIdx(null);
              }}
            >
              📧 Contact Us
            </button>
            <div style={{ position: 'sticky', top: 0, zIndex: 2, background: 'linear-gradient(180deg, #f8ecd4 80%, #e2c799 100%)', paddingTop: '1.5rem', paddingBottom: '1rem' }}>
              <div className="d-flex align-items-center justify-content-between mb-2"
                style={{
                  background: '#f5f4f2',
                  borderRadius: 18,
                  boxShadow: 'none',
                  padding: '0.7rem 1.2rem',
                  margin: 0,
                  width: '100%',
                  border: '1.5px solid #f3e3c2',
                  minHeight: 48,
                }}
              >
                <h2 className="fw-bold mb-0" style={{ fontFamily: 'serif', color: '#7c4700', letterSpacing: 1, marginBottom: 0, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Śrīmad Bhāgavatam</h2>
                <button
                  aria-label="Toggle prayers list"
                  onClick={() => setSidebarExpanded(exp => !exp)}
                  style={{
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    marginLeft: 8,
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'transform 0.2s',
                  }}
                >
                  {/* Bootstrap chevron-down icon, rotates for expand/collapse */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28" height="28" fill="#b77b1c"
                    viewBox="0 0 16 16"
                    style={{
                      transform: sidebarExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                      display: 'block',
                    }}
                  >
                    <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="nav flex-column" style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingTop: 0, maxHeight: sidebarExpanded ? '3000px' : '0', transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1)', overflow: sidebarExpanded ? 'auto' : 'hidden' }}>
              {sidebarExpanded && prayers.map((prayer, idx) => (
                <button
                  key={prayer.title}
                  className={`btn text-start mb-3 py-3 px-3 rounded-4 border-0 ${selectedPrayer === idx && !showContactUs ? 'fw-bold' : ''}`}
                  style={{
                    fontFamily: 'serif',
                    fontSize: 18,
                    background: selectedPrayer === idx && !showContactUs ? 'linear-gradient(90deg, #ecd9b6 80%, #f9f6f1 100%)' : '#fff',
                    color: selectedPrayer === idx && !showContactUs ? '#7c4700' : '#4b2e05',
                    boxShadow: selectedPrayer === idx && !showContactUs ? '0 4px 16px #e2c79944' : '0 2px 8px #e2c79922',
                    border: selectedPrayer === idx && !showContactUs ? '2px solid #b77b1c' : '1px solid #e2c799',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => {
                    setShowContactUs(false);
                    setSelectedPrayer(idx);
                    setSelectedSlokaIdx(0); // Always select first sloka
                  }}
                >
                  {prayer.title}
                  <div className="small mt-1" style={{ color: selectedPrayer === idx && !showContactUs ? '#b77b1c' : '#a67c52' }}>{prayer.reference}</div>
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
                <button
                  className={`btn text-start mb-3 py-3 px-3 rounded-4 border-0 ${showContactUs ? 'fw-bold' : ''}`}
                  style={{
                    fontFamily: 'serif',
                    fontSize: 18,
                    background: showContactUs ? 'linear-gradient(90deg, #ecd9b6 80%, #f9f6f1 100%)' : '#fff',
                    color: showContactUs ? '#7c4700' : '#2563eb',
                    boxShadow: showContactUs ? '0 4px 16px #e2c79944' : '0 2px 8px #e2c79922',
                    border: showContactUs ? '2px solid #b77b1c' : '1px solid #e2c799',
                    transition: 'all 0.2s',
                  }}
                  data-bs-dismiss="offcanvas"
                  onClick={() => {
                    setShowContactUs(true);
                    setSelectedPrayer(null);
                    setSelectedSlokaIdx(null);
                  }}
                >
                  📧 Contact Us
                </button>
                <hr style={{margin: '12px 0', borderColor: '#e2c799'}} />
                {prayers.map((prayer, idx) => (
                  <button
                    key={prayer.title}
                    className={`btn text-start mb-3 py-3 px-3 rounded-4 border-0 ${selectedPrayer === idx && !showContactUs ? 'fw-bold' : ''}`}
                    style={{
                      fontFamily: 'serif',
                      fontSize: 18,
                      background: selectedPrayer === idx && !showContactUs ? 'linear-gradient(90deg, #ecd9b6 80%, #f9f6f1 100%)' : '#fff',
                      color: selectedPrayer === idx && !showContactUs ? '#7c4700' : '#4b2e05',
                      boxShadow: selectedPrayer === idx && !showContactUs ? '0 4px 16px #e2c79944' : '0 2px 8px #e2c79922',
                      border: selectedPrayer === idx && !showContactUs ? '2px solid #b77b1c' : '1px solid #e2c799',
                      transition: 'all 0.2s',
                    }}
                    data-bs-dismiss="offcanvas"
                    onClick={() => {
                      setSelectedPrayer(idx);
                      setSelectedSlokaIdx(0); // Always select first sloka
                      setShowContactUs(false);
                    }}
                  >
                    {prayer.title}
                    <div className="small mt-1" style={{ color: selectedPrayer === idx && !showContactUs ? '#b77b1c' : '#a67c52' }}>{prayer.reference}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        <main className="col-md-9 col-lg-10 px-4 py-4 main-content" style={{ background: 'linear-gradient(120deg, #f9f6f1 80%, #ecd9b6 100%)' }}>
          {showContactUs ? (
            <ContactUs />
          ) : (
            <>
              {/* Sloka Dropdown above main card, centered */}
              {selectedPrayer !== null && slokaList.length > 0 && (
                <div className={`prayer-header-row d-flex align-items-center justify-content-between mb-3 flex-wrap${isMobile ? ' prayer-header-row-mobile' : ''}`} style={{gap:'1rem'}}>
                  <div className="d-flex flex-column align-items-start prayer-header-title-group">
                    <span className="fw-bold prayers-title-mobile" style={{ fontFamily: 'serif', fontSize: 28, color: '#7c4700', letterSpacing: 1, lineHeight: 1.1 }}>{prayers[selectedPrayer].title}</span>
                    <a
                      href={vedabaseSlokaUrl || prayers[selectedPrayer].link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="d-inline-block text-decoration-underline fw-semibold"
                      style={{ color: '#b77b1c', fontSize: 18 }}
                    >
                      Open on Vedabase
                    </a>
                  </div>
                  {isMobile ? (
                    <div className="prayer-header-mobile-dropdown-row" style={{display:'flex',width:'100%',gap:'0.5rem',justifyContent:'space-between',alignItems:'center'}}>
                      <select
                        id="lang-select"
                        value={language}
                        onChange={e => setLanguage(e.target.value)}
                        className="form-select w-auto"
                        style={{ fontSize: 15, fontFamily: 'serif', background: '#f8ecd4', color: '#7c4700', minWidth: '90px', maxWidth: '140px', border: '2px solid #b77b1c', borderRadius: 16, boxShadow: '0 4px 16px #e2c79944', fontWeight: 600, padding: '0.5rem 0.7rem', appearance: 'none', cursor: 'pointer', outline: 'none', transition: 'border 0.2s, box-shadow 0.2s' }}
                      >
                        <option value="sanskrit">Sanskrit</option>
                        <option value="english">English</option>
                        {selectedSloka && selectedSloka.odia && <option value="odia">Odia</option>}
                        {selectedSloka && selectedSloka.bengali && <option value="bengali">Bengali</option>}
                        <option value="both">Both</option>
                      </select>
                      <select
                        className="form-select sloka-dropdown"
                        style={{
                          maxWidth: 80,
                          fontSize: 15,
                          fontFamily: 'serif',
                          background: '#f8ecd4',
                          color: '#7c4700',
                          border: '2px solid #b77b1c',
                          borderRadius: 16,
                          boxShadow: '0 4px 16px #e2c79944',
                          fontWeight: 600,
                          padding: '0.5rem 0.7rem',
                          appearance: 'none',
                          cursor: 'pointer',
                          outline: 'none',
                          transition: 'border 0.2s, box-shadow 0.2s',
                        }}
                        value={selectedSlokaIdx !== null ? selectedSlokaIdx : ''}
                        onChange={e => setSelectedSlokaIdx(Number(e.target.value))}
                      >
                        <option value="" disabled>Select a Sloka</option>
                        {slokaList.map((sloka, idx) => (
                          <option key={sloka.number} value={idx}>{sloka.number}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <>
                      <div className="prayer-header-language-center d-flex align-items-center justify-content-center flex-grow-1" style={{minWidth:'160px'}}>
                        <label htmlFor="lang-select" className="fw-bold me-2 mb-0" style={{ color: '#7c4700', fontSize: 18 }}>Language:</label>
                        <select
                          id="lang-select"
                          value={language}
                          onChange={e => setLanguage(e.target.value)}
                          className="form-select w-auto"
                          style={{ fontSize: 18, fontFamily: 'serif', background: '#f9f6f1', color: '#7c4700', minWidth: '90px' }}
                        >
                          <option value="sanskrit">Sanskrit</option>
                          <option value="english">English</option>
                          {selectedSloka && selectedSloka.odia && <option value="odia">Odia</option>}
                          {selectedSloka && selectedSloka.bengali && <option value="bengali">Bengali</option>}
                          <option value="both">Both</option>
                        </select>
                      </div>
                      {slokaList.length > 1 ? (
                        <select
                          className="form-select sloka-dropdown"
                          style={{
                            maxWidth: 320,
                            fontSize: 18,
                            fontFamily: 'serif',
                            background: '#f8ecd4',
                            color: '#7c4700',
                            border: '2px solid #b77b1c',
                            borderRadius: 16,
                            boxShadow: '0 4px 16px #e2c79944',
                            fontWeight: 600,
                            padding: '0.7rem 1.2rem',
                            appearance: 'none',
                            cursor: 'pointer',
                            outline: 'none',
                            transition: 'border 0.2s, box-shadow 0.2s',
                          }}
                          value={selectedSlokaIdx !== null ? selectedSlokaIdx : ''}
                          onChange={e => setSelectedSlokaIdx(Number(e.target.value))}
                        >
                          <option value="" disabled>Select a Sloka</option>
                          {slokaList.map((sloka, idx) => (
                            <option key={sloka.number} value={idx}>{sloka.number}</option>
                          ))}
                        </select>
                      ) : null}
                    </>
                  )}
                </div>
              )}
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
                  {/* Open on Vedabase link next to main sloka display */}
                  {/* Removed old Slokas box and label; dropdown is now above main card */}
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
                      <div className="sloka-header-row mb-4 position-relative">
                        <h2 className="card-title mb-0 text-center w-100" style={{ fontFamily: 'serif', fontSize: 44, color: '#7c4700', minWidth: '180px', textAlign: 'center' }}>{selectedSloka.number}</h2>
                      </div>
                      {language === 'sanskrit' && (
                        <div className="sanskrit mb-2" style={{ fontSize: 32, fontFamily: 'Noto Serif Devanagari, Noto Serif, serif', color: '#1a1200', fontWeight: 500, textAlign: 'center', whiteSpace: 'pre-line' }}>{selectedSloka.sanskrit}</div>
                      )}
                      {language === 'english' && (
                        <div className="english mb-2" style={{ fontSize: 22, fontFamily: 'Noto Serif, Georgia, serif', color: '#3d2a0a', fontStyle: 'italic', textAlign: 'center', whiteSpace: 'pre-line' }}>{selectedSloka.english}</div>
                      )}
                      {language === 'odia' && selectedSloka.odia && (
                        <div className="odia mb-2" style={{ fontSize: 22, fontFamily: 'Noto Serif, Georgia, serif', color: '#0a3d2a', textAlign: 'center', whiteSpace: 'pre-line' }}>{selectedSloka.odia}</div>
                      )}
                      {language === 'bengali' && selectedSloka.bengali && (
                        <div className="bengali mb-2" style={{ fontSize: 22, fontFamily: 'Noto Serif Bengali, serif', color: '#0a3d2a', textAlign: 'center', whiteSpace: 'pre-line' }}>{selectedSloka.bengali}</div>
                      )}
                      {language === 'both' && (
                        <>
                          <div className="sanskrit mb-2" style={{ fontSize: 32, fontFamily: 'Noto Serif Devanagari, Noto Serif, serif', color: '#1a1200', fontWeight: 500, textAlign: 'center', whiteSpace: 'pre-line' }}>{selectedSloka.sanskrit}</div>
                          <div className="english mb-2" style={{ fontSize: 22, fontFamily: 'Noto Serif, Georgia, serif', color: '#3d2a0a', fontStyle: 'italic', textAlign: 'center', whiteSpace: 'pre-line' }}>{selectedSloka.english}</div>
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
            </>
          )}
        </main>
      </div>
    </div>
    </>
  );
}

export default App;
