'use client'
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Script from 'next/script';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Constants
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
  
  // Timer for active boost
  useEffect(() => {
    if (timeLeft <= 0) {
      setBoostMultiplier(1);
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleTap = async () => {
    const newCount = crystals + (1 * boostMultiplier);
    setCrystals(newCount);
    await supabase.from('crystals').upsert({ id: userId, crystals: newCount });
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f0a1a', color: '#fff' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', background: '#1a0b2e' }}>
        <span>👤 Player</span>
        <span style={{ fontWeight: 'bold' }}>💎 {crystals.toLocaleString()}</span>
      </div>

      {/* Main Mining Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {activeTab === 'mine' && (
          <>
            <div onClick={handleTap} style={{ width: '200px', height: '200px', borderRadius: '50%', background: boostMultiplier > 1 ? '#f59e0b' : '#a855f7', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px' }}>
              💎
            </div>
            {timeLeft > 0 && <div style={{ marginTop: '20px', color: '#f59e0b' }}>Boost Active: {Math.floor(timeLeft / 60)}m {timeLeft % 60}s</div>}
          </>
        )}
      </div>

      {/* Persistent Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '15px', background: '#1a0b2e', borderTop: '1px solid #333' }}>
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ background: 'none', border: 'none', color: activeTab === item.id ? '#fff' : '#666' }}>
            {item.icon} {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
