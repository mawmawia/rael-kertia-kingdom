'use client'
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Script from 'next/script';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const NAV_ITEMS = [
  {id: 'task', icon: '📋', label: 'Task'},
  {id: 'mine', icon: '⛏️', label: 'Mine'},
  {id: 'store', icon: '🛒', label: 'Store'},
  {id: 'tools', icon: '🛠️', label: 'Tools'}
];

export default function Home() {
  const [crystals, setCrystals] = useState(0);
  const [activeTab, setActiveTab] = useState('mine');
  const [boostMultiplier, setBoostMultiplier] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [userId, setUserId] = useState('test-user');
  const [tg, setTg] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tgApp = window.Telegram.WebApp;
      tgApp.ready();
      tgApp.expand();
      setTg(tgApp);
      const uid = tgApp.initDataUnsafe?.user?.id?.toString() || 'test-user';
      setUserId(uid);
      loadData(uid);
    }
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      setBoostMultiplier(1);
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  async function loadData(uid) {
    const { data } = await supabase.from('crystals').select('*').eq('id', uid).single();
    if (data) {
      setCrystals(data.crystals || 0);
    }
  }

  const handleTap = async () => {
    const newCount = crystals + (1 * boostMultiplier);
    setCrystals(newCount);
    await supabase.from('crystals').upsert({ id: userId, crystals: newCount });
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f0a1a', color: '#fff', fontFamily: 'sans-serif' }}>
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />

      {/* Top User Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', background: '#1e1e2e', borderBottom: '1px solid #3b3b4f' }}>
        <span>👤 {tg?.initDataUnsafe?.user?.first_name || 'Player'}</span>
        <span style={{ fontWeight: 'bold', color: '#fbbf24' }}>💎 {crystals.toLocaleString()}</span>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {activeTab === 'mine' && (
          <div style={{ textAlign: 'center' }}>
            <div onClick={handleTap} style={{ width: '200px', height: '200px', borderRadius: '50%', background: boostMultiplier > 1 ? '#f59e0b' : '#a855f7', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px', margin: '0 auto' }}>
              💎
            </div>
            {timeLeft > 0 && <div style={{ marginTop: '20px', color: '#f59e0b', fontWeight: 'bold' }}>⚡ Boost Active: {Math.floor(timeLeft / 60)}m {timeLeft % 60}s</div>}
          </div>
        )}
        {activeTab !== 'mine' && <div style={{ fontSize: '20px', opacity: 0.7 }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Coming Soon</div>}
      </div>

      {/* Bottom Task Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '15px', background: '#1e1e2e', borderTop: '1px solid #3b3b4f' }}>
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ background: 'none', border: 'none', color: activeTab === item.id ? '#a855f7' : '#9ca3af', fontSize: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
