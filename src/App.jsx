
import { useState } from 'react';
import vedasLogo from './assets/vedas-logo.svg';
import './App.css';
import { prayers } from './prayersData';
import { slokas } from './slokasData';

function App() {
  const [selectedPrayer, setSelectedPrayer] = useState(null);
  const [selectedSlokaIdx, setSelectedSlokaIdx] = useState(null);
  const [language, setLanguage] = useState('sanskrit');

  const prayerTitle = selectedPrayer !== null ? prayers[selectedPrayer].title : null;
  const slokaList = prayerTitle && slokas[prayerTitle] ? slokas[prayerTitle] : [];
  const selectedSloka = selectedSlokaIdx !== null && slokaList[selectedSlokaIdx] ? slokaList[selectedSlokaIdx] : null;

  return (
      <>
      <nav className="navbar navbar-expand-lg navbar-light" style={{ background: 'linear-gradient(90deg, #ecd9b6 60%, #f9f6f1 100%)', borderBottom: '2px solid #e2c799' }}>
        <div className="container-fluid">
          <a className="navbar-brand d-flex align-items-center gap-2" href="#">
            <img src={vedasLogo} alt="Vedas Logo" width="40" height="40" style={{ borderRadius: 8, boxShadow: '0 2px 8px #e2c79922' }} />
            <span className="fw-bold" style={{ color: '#7c4700', fontFamily: 'serif', fontSize: 22, letterSpacing: 1 }}>Śrīmad Bhāgavatam Prayers</span>
          </a>
          <button className="navbar-toggler d-block d-md-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebarOffcanvas" aria-controls="sidebarOffcanvas" aria-label="Toggle sidebar">
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>
      </nav>
      <div className="container-fluid min-vh-100 p-0" style={{ background: 'linear-gradient(120deg, #f9f6f1 60%, #ecd9b6 100%)' }}>
        <div className="row g-0">
          {/* Sidebar for desktop */}
          <aside className="col-md-3 col-lg-2 border-end shadow-sm py-4 px-3 d-none d-md-block" style={{ background: 'linear-gradient(180deg, #f8ecd4 80%, #e2c799 100%)' }}>
            <h2 className="fw-bold mb-4" style={{ fontFamily: 'serif', color: '#7c4700', letterSpacing: 1 }}>Śrīmad Bhāgavatam Prayers</h2>
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
        <main className="col-md-9 col-lg-10 px-4 py-4" style={{ background: 'linear-gradient(120deg, #f9f6f1 80%, #ecd9b6 100%)' }}>
          {selectedPrayer !== null ? (
            <div>
              <h2 className="fw-bold mb-2" style={{ fontFamily: 'serif', fontSize: 32, color: '#7c4700', letterSpacing: 1 }}>{prayers[selectedPrayer].title}</h2>
              <div className="mb-2" style={{ color: '#a67c52' }}>Reference: {prayers[selectedPrayer].reference}</div>
              <a href={prayers[selectedPrayer].link} target="_blank" rel="noopener noreferrer" className="mb-4 d-inline-block text-decoration-underline fw-semibold" style={{ color: '#b77b1c' }}>
                Open on Vedabase
              </a>
              {slokaList.length > 0 && (
                <div className="mt-4">
                  <h3 className="fw-bold mb-3" style={{ fontSize: 22, color: '#7c4700' }}>Slokas</h3>
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
                </div>
              )}
              {selectedSloka && (
                <div className="card shadow-lg border-0 rounded-4 p-4 mb-5" style={{ background: 'linear-gradient(120deg, #f9f6f1 80%, #ecd9b6 100%)', maxWidth: 900, margin: '2rem auto' }}>
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
                      <option value="both">Both</option>
                    </select>
                  </div>
                  {language === 'sanskrit' && (
                    <div className="sanskrit mb-4" style={{ fontSize: 32, fontFamily: 'Noto Serif Devanagari, Noto Serif, serif', color: '#1a1200', fontWeight: 500, textAlign: 'center', whiteSpace: 'pre-line' }}>{selectedSloka.sanskrit}</div>
                  )}
                  {language === 'english' && (
                    <div className="english mb-4" style={{ fontSize: 22, fontFamily: 'Noto Serif, Georgia, serif', color: '#3d2a0a', fontStyle: 'italic', textAlign: 'center', whiteSpace: 'pre-line' }}>{selectedSloka.english}</div>
                  )}
                  {language === 'both' && (
                    <>
                      <div className="sanskrit mb-4" style={{ fontSize: 32, fontFamily: 'Noto Serif Devanagari, Noto Serif, serif', color: '#1a1200', fontWeight: 500, textAlign: 'center', whiteSpace: 'pre-line' }}>{selectedSloka.sanskrit}</div>
                      <div className="english mb-4" style={{ fontSize: 22, fontFamily: 'Noto Serif, Georgia, serif', color: '#3d2a0a', fontStyle: 'italic', textAlign: 'center', whiteSpace: 'pre-line' }}>{selectedSloka.english}</div>
                    </>
                  )}
                  <div className="translation card border-0 rounded-3 p-3 mt-3 mx-auto" style={{ color: '#7c4700', fontSize: 20, maxWidth: 700, background: 'linear-gradient(90deg, #f9f6f1 80%, #ecd9b6 100%)' }}>
                    <b style={{ color: '#b77b1c' }}>Translation:</b> {selectedSloka.translation}
                  </div>
                </div>
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
