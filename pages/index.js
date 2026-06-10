'use client'
import { useState, useEffect } from 'react';
import Script from 'next/script';

export default function Home() {
  const [crystals, setCrystals] = useState(0);
  const [tab, setTab] = useState('mine');
  const [version, setVersion] = useState('v1.0');

  useEffect(() => {
    // Force show version so we know new code loaded
    setVersion('v2.0 - ' + new Date().getHours() + ':' + new Date().getMinutes());
    if (window.Telegram?.WebApp) window.Telegram.WebApp.ready();
  }, []);

  const manualMine = () => {
    setCrystals(c => c + 5);
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium');
  };

  return (
    <div style={{height: '100vh', background: '#000', color: '#0f0', fontFamily: 'monospace', display: 'flex', flexDirection: 'column'}}>
      <Script src="https://telegram.org/js/telegram-web-app.js?v=2" strategy="beforeInteractive" />
      
      {/* VERSION TAG - if you dont see this, old code is cached */}
      <div style={{position: 'absolute', top: 5, right: 10, fontSize: 10, color: 'yellow'}}>{version}</div>

      {/* MATRIX BG */}
      <div style={{position: 'absolute', inset: 0, opacity: 0.2, fontSize: 12}}>
        {Array.from({length: 40}).map((_, i) => (
          <div key={i} style={{position: 'absolute', left: i*2.5 + '%', animation: `fall 6s linear infinite ${i%3}s`}}>
            {'01'.repeat(30).split('').join('\n')}
          </div>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 1}}>
        {tab === 'mine' && (
          <>
            <h1>Rael Kertia Kingdom</h1>
            <div style={{fontSize: 60, margin: '20px'}}>💎 {crystals}</div>
            <button 
              onClick={manualMine}
              style={{
                padding: '15px 40px',
                background: '#3390ec',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '18px',
                fontWeight: 'bold'
              }}
            >
              Manual Mine (+5)
            </button>
          </>
        )}
        {tab !== 'mine' && <h2>{tab.toUpperCase()} TAB - Coming</h2>}
      </div>

      {/* BOTTOM TABS */}
      <div style={{display: 'flex', background: '#111', borderTop: '2px solid #0f0'}}>
        {['mine','daily','task','special','usdt'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: 12, background: 'none', border: 'none',
            color: tab === t? '#0ff' : '#666', fontSize: 11
          }}>
            {t}
          </button>
        ))}
      </div>

      <style jsx global>{`
        @keyframes fall {0%{top:-100px} 100%{top:100vh}}
      `}</style>
    </div>
  );
}
