import { useState, useEffect, useRef, forwardRef } from 'react';
import allSlokasData from './allSlokasData';
import ContactUs from './ContactUs';
import vaishnavaLogo from './assets/vaishnava-logo.png';
import './App.css';
import SlokaObjectBuilder from './SlokaObjectBuilder';
import { prayers } from './prayersData';
import { slokas, normalizedSlokasMap, normalizePrayerTitle } from './slokasData';
import PrayersModal from './PrayersModal';
  



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
  // const [sidebarExpanded, setSidebarExpanded] = useState(true);
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
  // Refs for each sloka card
  const slokaRefs = useRef([]);

  // Modal for prayers list
  const [showPrayersModal, setShowPrayersModal] = useState(false);

  const prayerTitle = selectedPrayer !== null ? prayers[selectedPrayer].title : null;
  const slokaList = prayerTitle && slokas[prayerTitle] ? slokas[prayerTitle] : [];
  const selectedSloka = selectedSlokaIdx !== null && slokaList[selectedSlokaIdx] ? slokaList[selectedSlokaIdx] : null;

  // Autocomplete suggestions for IAST (english) sloka text
  useEffect(() => {
    if (!search.trim()) {
      setSearchSuggestions([]);
      return;
    }
    const q = search.trim();
    // Detect if query contains any IAST diacritics
    const hasIAST = /[āīūṛṝḷṅṇñṭḍśṣṁṃçēō]/i.test(q);
    const qWords = q.toLowerCase().split(/\s+/).filter(Boolean);
    let matches;
    if (!hasIAST) {
      // ASCII search: normalize all slokas and query
      const normQWords = qWords.map(normalizeIAST);
      matches = allSlokasData.filter(item => {
        let eng = item.sloka.english || '';
        let num = item.sloka.number || '';
        eng = eng.replace(/\n/g, ' ');
        const normEng = normalizeIAST(eng);
        // Each word in query must match somewhere in the normalized sloka or number
        return normQWords.every(normWord =>
          normEng.includes(normWord) ||
          num.toLowerCase().includes(normWord)
        );
      });
    } else {
      // IAST search: match using original text only
      matches = allSlokasData.filter(item => {
        let eng = item.sloka.english || '';
        let num = item.sloka.number || '';
        eng = eng.replace(/\n/g, ' ');
        const engLower = eng.toLowerCase();
        // Each word in query must match somewhere in the original sloka or number
        return qWords.every(word =>
          engLower.includes(word) ||
          num.toLowerCase().includes(word)
        );
      });
    }
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

  // Scroll to selected sloka when dropdown changes
  useEffect(() => {
    if (
      selectedSlokaIdx !== null &&
      slokaRefs.current[selectedSlokaIdx]
    ) {
      slokaRefs.current[selectedSlokaIdx].scrollIntoView({
        behavior: 'smooth',
        block: 'start', // scroll so top of card is near top
      });
      // Optional: adjust for sticky header (e.g., 80px)
      setTimeout(() => {
        window.scrollBy({ top: -80, left: 0, behavior: 'smooth' });
      }, 300);
    }
  }, [selectedSlokaIdx]);

  return (
    <div className="app-container">
      {/* Fixed header */}
      <nav className="navbar navbar-expand-lg navbar-light" style={{ background: 'linear-gradient(90deg, #ecd9b6 60%, #f9f6f1 100%)', borderBottom: '2px solid #e2c799', minHeight: 90, position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2000 }}>
        <div className="container-fluid d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between navbar-mobile-row" style={{ gap: 8 }}>
          <button className="navbar-brand d-flex align-items-center gap-2 btn border-0 bg-transparent p-0 m-0" style={{cursor:'pointer'}} onClick={() => setShowPrayersModal(true)}>
            <img src={vaishnavaLogo} alt="Vaiṣṇava Prayers Logo" width="56" height="56" style={{ borderRadius: 12, boxShadow: '0 2px 8px #e2c79922', background: '#fff' }} />
            <span className="fw-bold vaisnava-vandana-title" style={{ color: '#7c4700', fontFamily: 'serif', fontSize: 22, letterSpacing: 1, whiteSpace: 'normal', wordBreak: 'break-word' }}>Kṛṣṇa Vandanam</span>
          </button>
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
                  fontSize: 18,
                  fontFamily: 'serif',
                  borderRadius: 14,
                  border: '2px solid #b77b1c',
                  boxShadow: '0 4px 16px #e2c79933',
                  padding: '0.7rem 1rem',
                  width: '100%',
                  background: 'linear-gradient(90deg, #fffbe9 80%, #ecd9b6 100%)',
                  color: '#7c4700',
                  fontWeight: 500,
                  letterSpacing: 1,
                  transition: 'border 0.2s, box-shadow 0.2s',
                  marginBottom: 0,
                }}
                autoComplete="off"
              />
              <style>{`
                @media (max-width: 900px) {
                  .navbar-mobile-search input.form-control {
                    font-size: 15px !important;
                    padding: 0.5rem 0.7rem !important;
                    border-radius: 10px !important;
                    margin-bottom: 0 !important;
                  }
                  .navbar-mobile-row {
                    flex-direction: column !important;
                    align-items: stretch !important;
                  }
                  .navbar-mobile-search-row {
                    flex-direction: column !important;
                    align-items: stretch !important;
                  }
                  .navbar-mobile-hamburger {
                    position: absolute !important;
                    top: 18px !important;
                    right: 18px !important;
                    z-index: 3001 !important;
                  }
                }
              `}</style>
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
                        // Debug: log the mapping process
                        const normTitle = normalizePrayerTitle(item.prayerTitle.trim());
                        const prayerIdx = prayers.findIndex(p => normalizePrayerTitle(p.title.trim()) === normTitle);
                        const slokaArr = normalizedSlokasMap[normTitle];
                        console.log('DEBUG: Clicked suggestion:', item.prayerTitle);
                        console.log('DEBUG: Normalized title:', normTitle);
                        console.log('DEBUG: Found prayerIdx:', prayerIdx, prayers[prayerIdx]?.title);
                        if (slokaArr) {
                          console.log('DEBUG: Sloka array found, first 3 sloka numbers:', slokaArr.slice(0,3).map(s=>s.number));
                        } else {
                          console.log('DEBUG: No sloka array found for normalized title');
                        }
                        if (prayerIdx !== -1 && slokaArr) {
                          const slokaIdx = slokaArr.findIndex(s => s.number === item.sloka.number);
                          console.log('DEBUG: Found slokaIdx:', slokaIdx, 'for sloka number:', item.sloka.number);
                          setSelectedPrayer(prayerIdx);
                          setSelectedSlokaIdx(slokaIdx !== -1 ? slokaIdx : 0);
                          setSearch('');
                          setShowSuggestions(false);
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
            <button
              className="navbar-toggler d-block d-md-none navbar-mobile-hamburger"
              type="button"
              aria-label="Toggle sidebar"
              onClick={() => {
                // Open the offcanvas sidebar manually if Bootstrap JS is not available
                const sidebar = document.getElementById('sidebarOffcanvas');
                if (sidebar) {
                  sidebar.classList.add('show');
                  sidebar.style.visibility = 'visible';
                  sidebar.style.transform = 'none';
                  sidebar.style.display = 'block';
                  document.body.style.overflow = 'hidden';
                }
              }}
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>
        </div>
      </nav>
      {/* Layout below header: sidebar and main content */}
      <div style={{ display: 'flex', height: '100vh', paddingTop: 90 }}>
        {/* Minimal Sidebar for PC: only main topic and Contact Us */}
        <aside className="d-none d-md-flex flex-column sidebar" style={{minWidth:220, maxWidth:260, background:'linear-gradient(180deg, #f5e9d4 90%, #e2c799 100%)', borderRight:'2px solid #e2c799', boxShadow:'2px 0 16px 0 #e2c79944', padding:'2rem 1rem 1rem 1rem', position:'fixed', top:90, left:0, height:'calc(100vh - 90px)', zIndex:1001}}>
          <button
            className="btn text-start mb-3 py-3 px-3 rounded-4 border-0 fw-bold"
            style={{ fontFamily: 'serif', fontSize: 20, background: '#fff', color: '#7c4700', boxShadow: '0 2px 8px #e2c79922', border: '2px solid #b77b1c', marginBottom: 18 }}
            onClick={() => {
              console.log('DEBUG: Sidebar prayers button clicked');
              setShowPrayersModal(true);
            }}
          >
            Śrīmad Bhāgavatam
          </button>
          <button
            className={`btn text-start py-3 px-3 rounded-4 border-0${showContactUs ? ' fw-bold' : ''}`}
            style={{ fontFamily: 'serif', fontSize: 18, background: showContactUs ? 'linear-gradient(90deg, #ecd9b6 80%, #f9f6f1 100%)' : '#fff', color: showContactUs ? '#7c4700' : '#2563eb', boxShadow: showContactUs ? '0 4px 16px #e2c79944' : '0 2px 8px #e2c79922', border: showContactUs ? '2px solid #b77b1c' : '1px solid #e2c799', transition: 'all 0.2s', width: '100%' }}
            onClick={() => {
              setShowContactUs(true);
              setSelectedPrayer(null);
              setSelectedSlokaIdx(null);
            }}
          >
            📧 Contact Us
          </button>
        </aside>
          {/* Sidebar for mobile (offcanvas) */}
          <div className="offcanvas offcanvas-start d-md-none" tabIndex="-1" id="sidebarOffcanvas" aria-labelledby="sidebarOffcanvasLabel" style={{visibility:'hidden', transform:'translateX(-100%)', transition:'transform 0.3s, visibility 0.3s', position:'fixed', zIndex:3002, background:'#fffbe9', width:'80vw', maxWidth:340, height:'100vh', top:0, left:0, display:'none'}}>
            <div className="offcanvas-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1rem'}}>
              <h5 className="offcanvas-title" id="sidebarOffcanvasLabel" style={{ fontFamily: 'serif', color: '#7c4700' }}>Śrīmad Bhāgavatam Prayers</h5>
              <button type="button" className="btn-close text-reset" aria-label="Close" onClick={() => {
                const sidebar = document.getElementById('sidebarOffcanvas');
                if (sidebar) {
                  sidebar.classList.remove('show');
                  sidebar.style.visibility = 'hidden';
                  sidebar.style.transform = 'translateX(-100%)';
                  sidebar.style.display = 'none';
                  document.body.style.overflow = '';
                }
              }}></button>
            </div>
            <div className="offcanvas-body" style={{padding:'1rem'}}>
              <div className="nav flex-column">
                <button
                  className="btn text-start mb-3 py-3 px-3 rounded-4 border-0 fw-bold"
                  style={{
                    fontFamily: 'serif',
                    fontSize: 20,
                    background: '#fff',
                    color: '#7c4700',
                    boxShadow: '0 2px 8px #e2c79922',
                    border: '2px solid #b77b1c',
                    marginBottom: 18
                  }}
                  data-bs-dismiss="offcanvas"
                  onClick={() => {
                    setShowPrayersModal(true);
                    // Optionally close sidebar
                    const sidebar = document.getElementById('sidebarOffcanvas');
                    if (sidebar) {
                      sidebar.classList.remove('show');
                      sidebar.style.visibility = 'hidden';
                      sidebar.style.transform = 'translateX(-100%)';
                      sidebar.style.display = 'none';
                      document.body.style.overflow = '';
                    }
                  }}
                >
                  Śrīmad Bhāgavatam
                </button>
                <button
                  className={`btn text-start py-3 px-3 rounded-4 border-0${showContactUs ? ' fw-bold' : ''}`}
                  style={{
                    fontFamily: 'serif',
                    fontSize: 18,
                    background: showContactUs ? 'linear-gradient(90deg, #ecd9b6 80%, #f9f6f1 100%)' : '#fff',
                    color: showContactUs ? '#7c4700' : '#2563eb',
                    boxShadow: showContactUs ? '0 4px 16px #e2c79944' : '0 2px 8px #e2c79922',
                    border: showContactUs ? '2px solid #b77b1c' : '1px solid #e2c799',
                    transition: 'all 0.2s',
                    width: '100%'
                  }}
                  data-bs-dismiss="offcanvas"
                  onClick={() => {
                    setShowContactUs(true);
                    setSelectedPrayer(null);
                    setSelectedSlokaIdx(null);
                    // Close sidebar on mobile
                    const sidebar = document.getElementById('sidebarOffcanvas');
                    if (sidebar) {
                      sidebar.classList.remove('show');
                      sidebar.style.visibility = 'hidden';
                      sidebar.style.transform = 'translateX(-100%)';
                      sidebar.style.display = 'none';
                      document.body.style.overflow = '';
                    }
                  }}
                >
                  📧 Contact Us
                </button>
              </div>
            </div>
          </div>
        <main
          className="col-md-9 col-lg-10 py-4 main-content"
          style={{
            background: 'linear-gradient(120deg, #f9f6f1 80%, #ecd9b6 100%)',
            marginLeft: 240, // match sidebar width
            minHeight: 'calc(100vh - 90px)',
            paddingRight: 0,
            paddingLeft: 0,
            width: 'calc(100vw - 240px)',
            maxWidth: 'calc(100vw - 240px)',
            overflowX: 'hidden',
            transition: 'margin-left 0.2s',
          }}
        >
          <div className="main-content-center-wrapper" style={{paddingLeft: 0, paddingRight: 0}}>
            {showContactUs ? (
              <ContactUs />
            ) : (
              <>
                {/* Vandana of the Day: only show when no prayer is selected */}
                {vandanaOfDay && selectedPrayer === null && (
                  <div
                    className="card mb-5 p-4"
                    style={{
                      background: 'linear-gradient(120deg, #f9f6f1 80%, #ecd9b6 100%)',
                      borderRadius: 18,
                      boxShadow: '0 2px 8px #e2c79922',
                      width: '100%',
                      maxWidth: 700,
                      margin: '32px auto 0 auto',
                      overflow: 'visible',
                      padding: '1.5rem 1.2rem',
                    }}
                  >
                    <style>{`
                      @media (max-width: 900px) {
                        .card.mb-5.p-4 {
                          margin: 18px 4vw 0 4vw !important;
                          padding: 1.1rem 0.5rem !important;
                          max-width: 98vw !important;
                        }
                        .card-title.text-center.mb-4 {
                          font-size: 28px !important;
                        }
                        .sanskrit.mb-4 {
                          font-size: 20px !important;
                        }
                        .english.mb-4, .odia.mb-4 {
                          font-size: 15px !important;
                        }
                        .translation.card.border-0.rounded-3.p-3.mt-3.mx-auto {
                          font-size: 15px !important;
                          padding: 0.7rem 0.5rem !important;
                        }
                      }
                    `}</style>
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
                      <div style={{ fontSize: 15, color: '#a67c52', marginTop: 8 }}>
                        <em>
                          <b>Translation is taken from Vedabase by His Divine Grace A.C. Bhaktivedanta Swami Prabhupāda, Founder-Ācārya of ISKCON.</b>
                        </em>
                      </div>
                    </div>
                  </div>
                )}
                {/* Main content */}
  {selectedPrayer !== null ? (
    <div>
      {/* Sticky prayer name header with sloka dropdown */}
      <div
        className="prayer-header-mobile"
        style={{
          background: 'linear-gradient(120deg, #f9f6f1 80%, #ecd9b6 100%)',
          borderBottom: '2px solid #ecd9b6',
          padding: '1.2rem 1rem 1.2rem 2rem',
          fontFamily: 'serif',
          fontWeight: 700,
          fontSize: 32,
          color: '#7c4700',
          letterSpacing: 1,
          textAlign: 'center',
          boxShadow: '0 2px 8px #e2c79922',
          borderRadius: '18px 18px 0 0',
          margin: '0 auto 0 auto',
          maxWidth: 900,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <span style={{flex:1, textAlign:'left'}}>{prayers[selectedPrayer]?.title}</span>
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
      </div>
      {/* Remove margin-top so the first card touches the header */}
      <div>
      {slokaList.map((sloka, idx) => (
        <SlokaSlideCard key={sloka.number} ref={el => (slokaRefs.current[idx] = el)}>
          {/* Mobile: Dropdown in top-right corner, Desktop: in header row */}
          <div className="sloka-header-row mb-4 position-relative">
            <h2 className="card-title mb-0 text-center w-100" style={{ fontFamily: 'serif', fontSize: 44, color: '#7c4700', minWidth: '180px', textAlign: 'center' }}>{sloka.number}</h2>
            {/* Mobile dropdown absolutely positioned top right */}
            <div className="sloka-dropdown-mobile-wrapper d-block d-md-none">
              <select
                id={`lang-select-${idx}`}
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="form-select w-auto"
                style={{ fontSize: 18, fontFamily: 'serif', background: '#f9f6f1', color: '#7c4700', minWidth: '90px' }}
              >
                <option value="sanskrit">Sanskrit</option>
                <option value="english">English</option>
                {sloka.odia && <option value="odia">Odia</option>}
                {sloka.bengali && <option value="bengali">Bengali</option>}
                <option value="both">Both</option>
              </select>
            </div>
          </div>
          {/* Desktop: Language label and dropdown (hidden on mobile) */}
          <div className="d-none d-md-flex" style={{ position: 'absolute', top: 24, right: 32, zIndex: 2, alignItems: 'center', minWidth: 160 }}>
            <label
              htmlFor={`lang-select-${idx}`}
              className="fw-bold me-2 mb-0 sloka-lang-label"
              style={{ color: '#7c4700', fontSize: 18, display: 'block' }}
            >
              Language:
            </label>
            <select
              id={`lang-select-${idx}`}
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="form-select w-auto"
              style={{ fontSize: 18, fontFamily: 'serif', background: '#f9f6f1', color: '#7c4700', minWidth: '90px' }}
            >
              <option value="sanskrit">Sanskrit</option>
              <option value="english">English</option>
              {sloka.odia && <option value="odia">Odia</option>}
              {sloka.bengali && <option value="bengali">Bengali</option>}
              <option value="both">Both</option>
            </select>
          </div>
          {language === 'sanskrit' && (
            <div className="sanskrit mb-2" style={{ fontSize: 32, fontFamily: 'Noto Serif Devanagari, Noto Serif, serif', color: '#1a1200', fontWeight: 500, textAlign: 'center', whiteSpace: 'pre-line' }}>{sloka.sanskrit}</div>
          )}
          {language === 'english' && (
            <div className="english mb-2" style={{ fontSize: 22, fontFamily: 'Noto Serif, Georgia, serif', color: '#3d2a0a', fontStyle: 'italic', textAlign: 'center', whiteSpace: 'pre-line' }}>{sloka.english}</div>
          )}
          {language === 'odia' && sloka.odia && (
            <div className="odia mb-2" style={{ fontSize: 22, fontFamily: 'Noto Serif, Georgia, serif', color: '#0a3d2a', textAlign: 'center', whiteSpace: 'pre-line' }}>{sloka.odia}</div>
          )}
          {language === 'bengali' && sloka.bengali && (
            <div className="bengali mb-2" style={{ fontSize: 22, fontFamily: 'Noto Serif Bengali, serif', color: '#0a3d2a', textAlign: 'center', whiteSpace: 'pre-line' }}>{sloka.bengali}</div>
          )}
          {language === 'both' && (
            <>
              <div className="sanskrit mb-2" style={{ fontSize: 32, fontFamily: 'Noto Serif Devanagari, Noto Serif, serif', color: '#1a1200', fontWeight: 500, textAlign: 'center', whiteSpace: 'pre-line' }}>{sloka.sanskrit}</div>
              <div className="english mb-2" style={{ fontSize: 22, fontFamily: 'Noto Serif, Georgia, serif', color: '#3d2a0a', fontStyle: 'italic', textAlign: 'center', whiteSpace: 'pre-line' }}>{sloka.english}</div>
            </>
          )}
          <div className="translation card border-0 rounded-3 p-3 mt-3 mx-auto" style={{ color: '#7c4700', fontSize: 20, maxWidth: 700, background: 'linear-gradient(90deg, #f9f6f1 80%, #ecd9b6 100%)' }}>
            <b style={{ color: '#b77b1c' }}>Translation:</b> {sloka.translation}
            <div style={{ fontSize: 15, color: '#a67c52', marginTop: 8 }}>
              <em>
                <b>Translation is taken from Vedabase by His Divine Grace A.C. Bhaktivedanta Swami Prabhupāda, Founder-Ācārya of ISKCON.</b>
                {sloka.number && (
                  <>
                    &nbsp;[
                    <a
                      href={`https://vedabase.io/en/library/sb/${sloka.number.replace('ŚB ', '').split('.').join('/')}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#b77b1c', textDecoration: 'underline' }}
                    >
                      vedabase link
                    </a>
                    ]
                  </>
                )}
              </em>
            </div>
          </div>
        </SlokaSlideCard>
      ))}
    </div>
  </div>
) : (
  <div className="fw-semibold fs-4 mt-5" style={{ color: '#b77b1c' }}>
    Please click the main topic above to view all prayers.
  </div>
)}
              </>
            )}
          </div>
        </main>
      </div>
      {/* Prayers Modal */}
      {showPrayersModal && (
        <>
          {console.log('DEBUG: PrayersModal rendered (showPrayersModal is true)')}
          <PrayersModal
            prayers={prayers}
            onSelect={idx => {
              setSelectedPrayer(idx);
              setSelectedSlokaIdx(0);
              setShowPrayersModal(false);
              setShowContactUs(false);
            }}
            onClose={() => setShowPrayersModal(false)}
          />
        </>
      )}
    </div>
  );
}

export default App;
