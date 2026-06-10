'use client'
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Script from 'next/script';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const TABS = [
  {id: 'mine', label: 'Mine', icon: '💎'},
  {id: 'daily', label: 'Daily', icon: '📅'},
  {id: 'task', label: 'Task', icon: '📋'},
  {id: 'special', label: 'Special', icon: '⭐'},
  {id: 'usdt', label: 'USDT', icon: '💵'}
];

export default function Home() {
  const [tab, setTab] = useState('mine');
  const [crystals, setCrystals] = useState(5);
  const [userId, setUserId] = useState('test-user');
  const [tg, setTg] = useState(null);

  useEffect(() => {
    if (typeof window!== 'undefined' && window.Telegram?.WebApp) {
      const tgApp = window.Telegram.WebApp;
      tgApp.ready();
      tgApp.expand();
      setTg(tgApp);
      const uid = tgApp.initDataUnsafe?.user?.id?.toString() || 'test-user';
      setUserId(uid);
      loadData(uid);
    }
  }, []);

  async function loadData(uid) {
    const { data } = await supabase.from('crystals').select('crystals').eq('user_id', uid).single();
    if (data) setCrystals(data.crystals);
    else await supabase.from('crystals').insert({user_id: uid, crystals: 5});
  }

  const manualMine = async () => {
    const newCrystals = crystals + 5; // +5 like your button
    setCrystals(newCrystals);
    await supabase.from('crystals').upsert({user_id: userId, crystals: newCrystals});
    tg?.HapticFeedback?.impactOccurred('medium');
  };

  return (
    <div style={{height: '100vh', display: 'flex', flexDirection: 'column', background: '#000', color: '#fff', overflow: 'hidden'}}>
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      <Script src="//libtl.com/sdk.js" data-zone='11126210' data-sdk='show_11126210' strategy="afterInteractive" />

      {/* MATRIX BACKGROUND */}
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden', opacity: 0.3}}>
        {Array.from({length: 50}).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${i*2}%`,
            top: '-100px',
            fontSize: '14px',
            color: '#0f0',
            fontFamily: 'monospace',
            animation: `matrix ${5 + Math.random()*10}s linear infinite ${Math.random()*5}s`,
            whiteSpace: 'pre'
          }}>
            {Array.from({length: 20}).map(() => Math.random() > 0.5? Math.floor(Math.random()*10) : String.fromCharCode(65+Math.floor(Math.random()*26))).join('\n')}
          </div>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 1}}>
        
        {tab === 'mine' && (
          <>
            <h1 style={{fontSize: '28px', fontWeight: 'bold', marginBottom: '40px'}}>Rael Kertia Kingdom</h1>
            
            <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px'}}>
              <span style={{fontSize: '60px'}}>💎</span>
              <span style={{fontSize: '48px', fontWeight: 'bold'}}>{crystals}</span>
            </div>

            {/* MANUAL MINE BUTTON - EXACTLY LIKE YOUR SCREENSHOT */}
            <button 
              onClick={manualMine}
              style={{
                padding: '15px 40px',
                background: 'linear-gradient(90deg, #3390ec, #00d4ff)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(51, 144, 236, 0.4)'
              }}
            >
              Manual Mine (+5)
            </button>
          </>
        )}

        {tab === 'daily' && (
          <div style={{padding: '20px', width: '100%'}}>
            <h2>Daily Tasks</h2>
            <p>Daily Check-in, Ads Watched 0/20 - Coming next</p>
          </div>
        )}

        {tab === 'task' && (
          <div style={{padding: '20px', width: '100%'}}>
            <h2>Tasks</h2>
            <p>Telegram tasks here - Coming next</p>
          </div>
        )}

        {tab === 'special' && (
          <div style={{padding: '20px', width: '100%'}}>
            <h2>Special</h2>
            <p>Play other bots - Coming next</p>
          </div>
        )}

        {tab === 'usdt' && (
          <div style={{padding: '20px', width: '100%'}}>
            <h2>USDT</h2>
            <button onClick={() => window.show_11126210?.().then(() => setCrystals(c => c + 500))}>
              Watch Ad +500
            </button>
          </div>
        )}
      </div>

      {/* BOTTOM NAV - 5 TABS LIKE YES APP */}
      <div style={{display: 'flex', justifyContent: 'space-around', padding: '12px 0', background: 'rgba(0,0,0,0.8)', borderTop: '1px solid #333', position: 'relative', zIndex: 2}}>
        {TABS.map(item => (
          <button key={item.id} onClick={() => setTab(item.id)} style={{
            background: 'none', border: 'none',
            color: tab === item.id? '#00d4ff' : '#666',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer'
          }}>
            <span style={{fontSize: '24px'}}>{item.icon}</span>
            <span style={{fontSize: '11px'}}>{item.label}</span>
          </button>
        ))}
      </div>

      <style jsx global>{`
        @keyframes matrix {
          0% {transform: translateY(0)}
          100% {transform: translateY(100vh)}
        }
      `}</style>
    </div>
  );
  }
