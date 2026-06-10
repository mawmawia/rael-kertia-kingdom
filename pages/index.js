'use client'
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Script from 'next/script';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const TABS = [
  {id: 'mine', label: 'Mine', icon: '💎'},
  {id: 'daily', label: 'Daily Task', icon: '📅'},
  {id: 'task', label: 'Task', icon: '📋'},
  {id: 'special', label: 'Special', icon: '⭐'},
  {id: 'usdt', label: 'USDT', icon: '💵'}
];

export default function Home() {
  const [tab, setTab] = useState('mine');
  const [crystals, setCrystals] = useState(0);
  const [energy, setEnergy] = useState(4000);
  const [maxEnergy, setMaxEnergy] = useState(4000);
  const [userId, setUserId] = useState('test-user');
  const [tg, setTg] = useState(null);
  const [dailyAds, setDailyAds] = useState(0);
  const [checkedIn, setCheckedIn] = useState(false);
  const [completedTasks, setCompletedTasks] = useState([]);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tgApp = window.Telegram.WebApp;
      tgApp.ready(); tgApp.expand();
      setTg(tgApp);
      const uid = tgApp.initDataUnsafe?.user?.id?.toString() || 'test-user';
      setUserId(uid);
      loadData(uid);
    }
  }, []);

  async function loadData(uid) {
    const { data } = await supabase.from('crystals').select('*').eq('id', uid).single();
    if (data) {
      setCrystals(data.crystals || 0);
      setEnergy(data.energy || 4000);
      setMaxEnergy(data.max_energy || 4000);
      setDailyAds(data.daily_ads_watched || 0);
      setCompletedTasks(data.completed_tasks || []);
      
      const today = new Date().toDateString();
      setCheckedIn(data.daily_checkin_date === today);
    }
  }

  const saveData = async (updates) => {
    await supabase.from('crystals').upsert({id: userId, ...updates});
  };

  const handleTap = () => {
    if (energy <= 0) return tg?.showAlert('Energy empty! Wait for recharge');
    const newEnergy = energy - 1;
    const newCrystals = crystals + 1;
    setEnergy(newEnergy);
    setCrystals(newCrystals);
    saveData({crystals: newCrystals, energy: newEnergy});
  };

  const dailyCheckin = async () => {
    if (checkedIn) return;
    const today = new Date().toDateString();
    const newCrystals = crystals + 30000;
    setCrystals(newCrystals);
    setCheckedIn(true);
    saveData({crystals: newCrystals, daily_checkin_date: today});
    tg?.showPopup({title: 'Check-in Complete!', message: '+30,000 crystals'});
  };

  const showAd = () => {
    if (dailyAds >= 20) return tg?.showAlert('Daily ad limit reached!');
    // MONETAG SDK CALL HERE
    window.show_1234567?.().then(() => { // Replace with your Monetag zone ID
      const newAds = dailyAds + 1;
      const newCrystals = crystals + 500;
      setDailyAds(newAds);
      setCrystals(newCrystals);
      saveData({crystals: newCrystals, daily_ads_watched: newAds, daily_ads_date: new Date().toDateString()});
      tg?.showPopup({title: 'Ad Watched!', message: '+500 crystals'});
    });
  };

  // TAB CONTENT
  if (tab === 'mine') return (
    <div style={{height: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a1a', color: 'white'}}>
      <Script src="https://telegram.org/js/telegram-web-app.js" />
      <Script src="//w.monetag.com/sdk.js" strategy="afterInteractive" /> {/* ADS SDK */}
      
      {/* HEADER */}
      <div style={{padding: '15px', background: 'linear-gradient(90deg, #1a1a3a, #2a2a5a)'}}>
        <div style={{fontSize: '12px', opacity: 0.7}}>Stephen ... LVI NewBie ▶️</div>
        <div style={{fontSize: '28px', fontWeight: 'bold', color: '#ffdd00'}}>💰 {crystals.toLocaleString()}</div>
      </div>

      {/* COIN RAIN AREA */}
      <div onClick={handleTap} style={{flex: 1, position: 'relative', overflow: 'hidden', cursor: 'pointer'}}>
        {[...Array(20)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute', left: `${Math.random()*100}%`, top: '-50px',
            animation: `fall ${3+Math.random()*3}s linear infinite ${Math.random()*5}s`,
            fontSize: '40px'
          }}>💰</div>
        ))}
        <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: '80px'}}>💎</div>
      </div>

      {/* ENERGY BAR */}
      <div style={{padding: '10px 20px', background: 'rgba(0,0,0,0.5)'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px'}}>
          <span>Energy</span><span>{energy}/{maxEnergy}</span>
        </div>
        <div style={{height: '8px', background: '#333', borderRadius: '10px'}}>
          <div style={{width: `${energy/maxEnergy*100}%`, height: '100%', background: '#4ade80', borderRadius: '10px', transition: 'width 0.3s'}} />
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div style={{display: 'flex', background: '#1a1a3a', borderTop: '2px solid #4a4a8a'}}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '12px', background: 'none', border: 'none',
            color: tab === t.id? '#ffdd00' : '#888', fontSize: '11px'
          }}>
            <div style={{fontSize: '20px'}}>{t.icon}</div>
            <div>{t.label}</div>
          </button>
        ))}
      </div>

      <style jsx>{`
        @keyframes fall {
          0% {top: -50px; opacity: 0}
          10% {opacity: 1}
          90% {opacity: 1}
          100% {top: 100vh; opacity: 0}
        }
      `}</style>
    </div>
  );

  if (tab === 'daily') return (
    <div style={{padding: '20px', background: '#0a0a1a', color: 'white', minHeight: '100vh'}}>
      <h2>Daily Tasks</h2>
      <div style={{opacity: 0.6, fontSize: '12px', marginBottom: '20px'}}>Daily refresh: 18:21:35</div>
      
      <div style={{background: '#1a1a3a', padding: '15px', borderRadius: '15px', marginBottom: '15px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <div>
            <div style={{fontWeight: 'bold'}}>Complete All Daily Tasks: 0/8</div>
            <div style={{color: '#ffdd00'}}>💰 +200K</div>
          </div>
          <button style={{background: '#ffdd00', border: 'none', padding: '8px 20px', borderRadius: '10px', fontWeight: 'bold'}}>Claim</button>
        </div>
      </div>

      {!checkedIn && (
        <div onClick={dailyCheckin} style={{background: '#2a2a5a', padding: '15px', borderRadius: '15px', marginBottom: '10px', cursor: 'pointer'}}>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <span>📅 Daily Check-in</span>
            <span style={{color: '#ffdd00'}}>💰 +30K</span>
          </div>
        </div>
      )}

      <div onClick={showAd} style={{background: '#2a2a5a', padding: '15px', borderRadius: '15px', marginBottom: '10px', cursor: 'pointer'}}>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <div>
            <div>🎥 Daily Ads Watched ({dailyAds}/20)</div>
            <div style={{fontSize: '12px', color: '#4ade80'}}>90% Revenue Share</div>
          </div>
          <span>↗️</span>
        </div>
      </div>
    </div>
  );

  if (tab === 'task') return <div style={{padding: '20px', background: '#0a0a1a', color: 'white'}}>Task tab - Telegram/YouTube tasks here</div>;
  if (tab === 'special') return <div style={{padding: '20px', background: '#0a0a1a', color: 'white'}}>Special tab - Play other bots</div>;
  if (tab === 'usdt') return <div style={{padding: '20px', background: '#0a0a1a', color: 'white'}}>USDT tab - Ads earnings</div>;
          }
