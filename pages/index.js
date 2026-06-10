'use client'
import { useEffect, useState, useRef } from 'react';
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
  const [crystals, setCrystals] = useState(0);
  const [energy, setEnergy] = useState(1000);
  const [maxEnergy, setMaxEnergy] = useState(1000);
  const [miningPower, setMiningPower] = useState(1);
  const [level, setLevel] = useState(1);
  const [userId, setUserId] = useState('test-user');
  const [tg, setTg] = useState(null);
  const [tapAnim, setTapAnim] = useState(false);

  // Daily/Ads states
  const [dailyAds, setDailyAds] = useState(0);
  const [dailyAdsDate, setDailyAdsDate] = useState('');
  const [dailyCheckin, setDailyCheckin] = useState(false);
  const [completedTasks, setCompletedTasks] = useState([]);

  // Boost states
  const [boostMultiplier, setBoostMultiplier] = useState(1);
  const [boostExpires, setBoostExpires] = useState(null);

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

  // Load data from Supabase
  async function loadData(uid) {
    const { data } = await supabase.from('crystals').select('*').eq('user_id', uid).single();
    if (data) {
      setCrystals(data.crystals || 0);
      setEnergy(data.energy || 1000);
      setMaxEnergy(data.max_energy || 1000);
      setMiningPower(data.mining_power || 1);
      setLevel(data.level || 1);
      setDailyAds(data.daily_ads_watched || 0);
      setDailyAdsDate(data.daily_ads_date || '');
      setDailyCheckin(data.daily_checkin_date === new Date().toDateString());
      setCompletedTasks(data.completed_tasks || []);

      // Check boost
      if (data.boost_expires_at && new Date(data.boost_expires_at) > new Date()) {
        setBoostMultiplier(data.boost_multiplier || 1);
        setBoostExpires(data.boost_expires_at);
      }
    } else {
      // Create new user
      await supabase.from('crystals').insert({
        user_id: uid,
        crystals: 0,
        energy: 1000,
        max_energy: 1000,
        mining_power: 1,
        level: 1
      });
    }
  }

  const saveData = async (updates) => {
    await supabase.from('crystals').upsert({
      user_id: userId,
     ...updates,
      last_mined_at: new Date().toISOString()
    });
  };

  // MINING - FIXED WITH BUTTON
  const handleMine = async () => {
    if (energy <= 0) {
      tg?.showAlert('⚡ No energy! Wait for recharge');
      return;
    }

    setTapAnim(true);
    setTimeout(() => setTapAnim(false), 100);

    const gain = miningPower * boostMultiplier;
    const newCrystals = crystals + gain;
    const newEnergy = energy - 1;

    setCrystals(newCrystals);
    setEnergy(newEnergy);

    await saveData({
      crystals: newCrystals,
      energy: newEnergy
    });

    tg?.HapticFeedback?.impactOccurred('light');
  };

  // Energy recharge every 3 sec
  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy(prev => Math.min(prev + 1, maxEnergy));
    }, 3000);
    return () => clearInterval(interval);
  }, [maxEnergy]);

  // Boost timer
  useEffect(() => {
    if (!boostExpires) return;
    const interval = setInterval(() => {
      if (new Date(boostExpires) <= new Date()) {
        setBoostMultiplier(1);
        setBoostExpires(null);
        saveData({ boost_multiplier: 1, boost_expires_at: null });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [boostExpires]);

  // DAILY ADS - MONETAG
  const showAd = () => {
    const today = new Date().toDateString();
    if (dailyAdsDate!== today) {
      setDailyAds(0);
      setDailyAdsDate(today);
      saveData({ daily_ads_watched: 0, daily_ads_date: today });
    }
    if (dailyAds >= 20) return tg?.showAlert('Daily limit 20/20 reached! Come back tomorrow');

    if (typeof window.show_11126210!== 'function') {
      return tg?.showAlert('Ads loading... tap again in 3 seconds');
    }

    window.show_11126210().then(() => {
      const reward = 500 * boostMultiplier;
      const newAds = dailyAds + 1;
      const newCrystals = crystals + reward;

      setDailyAds(newAds);
      setCrystals(newCrystals);

      saveData({
        crystals: newCrystals,
        daily_ads_watched: newAds,
        daily_ads_date: today
      });

      tg?.showPopup({
        title: '🎉 Ad Completed!',
        message: `+${reward} crystals\nAds: ${newAds}/20 today`
      });
    }).catch(() => {
      tg?.showAlert('Ad not completed. Watch full ad');
    });
  };

  // Daily checkin
  const doCheckin = async () => {
    if (dailyCheckin) return;
    const reward = 30000;
    const newCrystals = crystals + reward;
    setCrystals(newCrystals);
    setDailyCheckin(true);
    saveData({ crystals: newCrystals, daily_checkin_date: new Date().toDateString() });
    tg?.showPopup({title: 'Daily Check-in!', message: `+${reward} crystals`});
  };

  const boostActive = boostMultiplier > 1;
  const boostTimeLeft = boostExpires? Math.max(0, Math.floor((new Date(boostExpires) - new Date()) / 1000)) : 0;

  return (
    <div style={{height: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, #0a0a1a 0%, #1a0b2e 100%)', color: '#fff'}}>
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      <Script src="//libtl.com/sdk.js" data-zone='11126210' data-sdk='show_11126210' strategy="afterInteractive" />

      {/* HEADER */}
      <div style={{padding: '15px 20px', background: 'rgba(26, 11, 46, 0.8)', borderBottom: '2px solid rgba(168, 85, 247, 0.3)'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <span>👤 {tg?.initDataUnsafe?.user?.first_name || 'Player'} Lvl {level}</span>
          <span style={{fontWeight: 'bold', color: '#ffd700'}}>💎 {crystals.toLocaleString()}</span>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{flex: 1, overflowY: 'auto'}}>

        {/* MINE TAB */}
        {tab === 'mine' && (
          <div style={{padding: '20px'}}>
            <div style={{textAlign: 'center', marginBottom: '30px'}}>
              <div style={{fontSize: '14px', color: '#aaa'}}>Crystals</div>
              <div style={{fontSize: '48px', fontWeight: 'bold', color: '#ffd700'}}>{crystals.toLocaleString()}</div>
              <div style={{fontSize: '12px', color: '#4ade80'}}>1 tap = {miningPower} crystal {boostActive? `x${boostMultiplier}` : ''}</div>
            </div>

            {/* ENERGY BAR */}
            <div style={{marginBottom: '20px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px'}}>
                <span>⚡ Energy</span>
                <span>{energy}/{maxEnergy}</span>
              </div>
              <div style={{height: '8px', background: '#1a1a2e', borderRadius: '10px', overflow: 'hidden'}}>
                <div style={{
                  width: `${(energy/maxEnergy)*100}%`,
                  height: '100%',
                  background: energy > 50? 'linear-gradient(90deg,#4ade80,#22c55e)' : 'linear-gradient(90deg,#fbbf24,#f59e0b)',
                  transition: 'width 0.3s'
                }} />
              </div>
            </div>

            {/* TAP BUTTON - THIS IS THE FIX */}
            <div style={{display: 'flex', justifyContent: 'center', marginBottom: '40px'}}>
              <button
                onClick={handleMine}
                disabled={energy <= 0}
                style={{
                  width: '200px', height: '200px', borderRadius: '50%',
                  background: energy > 0
                   ? 'radial-gradient(circle at 30% 30%, #a855f7, #6b21a8, #3b0764)'
                    : '#333',
                  border: `4px solid ${energy > 0? '#c084fc' : '#555'}`,
                  cursor: energy > 0? 'pointer' : 'not-allowed',
                  boxShadow: energy > 0? '0 0 40px rgba(168,85,247,0.6)' : 'none',
                  transform: tapAnim? 'scale(0.9)' : 'scale(1)',
                  transition: 'all 0.1s',
                  fontSize: '60px'
                }}
              >
                {boostActive? '⚡' : '💎'}
              </button>
            </div>

            {/* STATS */}
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
              <div style={{background: 'rgba(168,85,247,0.1)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(168,85,247,0.3)'}}>
                <div style={{fontSize: '12px', color: '#aaa'}}>Mining Power</div>
                <div style={{fontSize: '20px', fontWeight: 'bold', color: '#c084fc'}}>{miningPower}</div>
              </div>
              <div style={{background: 'rgba(59,130,246,0.1)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.3)'}}>
                <div style={{fontSize: '12px', color: '#aaa'}}>Level</div>
                <div style={{fontSize: '20px', fontWeight: 'bold', color: '#60a5fa'}}>{level}</div>
              </div>
            </div>

            {boostActive && (
              <div style={{marginTop: '20px', textAlign: 'center', padding: '10px', background: 'rgba(251,191,36,0.2)', borderRadius: '10px', color: '#fbbf24', fontWeight: 'bold'}}>
                ⚡ BOOST ACTIVE: {boostMultiplier}x - {Math.ceil(boostTimeLeft/60)}min left
              </div>
            )}
          </div>
        )}

        {/* DAILY TAB */}
        {tab === 'daily' && (
          <div style={{padding: '20px'}}>
            <h2>Daily Tasks</h2>
            <div style={{opacity: 0.6, fontSize: '12px', marginBottom: '20px'}}>Resets daily at 00:00 UTC</div>

            {!dailyCheckin && (
              <div onClick={doCheckin} style={{background: 'rgba(168,85,247,0.2)', padding: '15px', borderRadius: '15px', marginBottom: '10px', cursor: 'pointer', border: '1px solid #a855f7'}}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <span>📅 Daily Check-in</span>
                  <span style={{color: '#ffd700'}}>💎 +30,000</span>
                </div>
              </div>
            )}

            <div onClick={showAd} style={{background: 'rgba(59,130,246,0.2)', padding: '15px', borderRadius: '15px', cursor: 'pointer', border: '1px solid #3b82f6'}}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <div>
                  <div>🎥 Watch Ads ({dailyAds}/20)</div>
                  <div style={{fontSize: '12px', color: '#4ade80'}}>90% Revenue Share</div>
                </div>
                <span>↗️</span>
              </div>
            </div>
          </div>
        )}

        {/* TASK TAB */}
        {tab === 'task' && (
          <div style={{padding: '20px'}}>
            <h2>Tasks</h2>
            <div style={{background: 'rgba(0,136,204,0.2)', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '1px solid #0088cc'}}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <div>
                  <div>Join Telegram Channel</div>
                  <div style={{fontSize: '12px', color: '#4ade80'}}>+500 💎 + 2x Boost</div>
                </div>
                <button style={{padding: '8px 16px', background: '#0088cc', border: 'none', borderRadius: '8px', color: 'white'}}>Join</button>
              </div>
            </div>
          </div>
        )}

        {/* SPECIAL TAB */}
        {tab === 'special' && <div style={{padding: '20px'}}><h2>Special Offers</h2><p>Coming Soon</p></div>}

        {/* USDT TAB */}
        {tab === 'usdt' && (
          <div style={{padding: '20px'}}>
            <h2>💵 Earn USDT</h2>
            <div onClick={showAd} style={{background: 'linear-gradient(135deg, #4a4a8a, #2a2a5a)', padding: '20px', borderRadius: '15px', cursor: 'pointer', border: '2px solid #6a6aaa'}}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <div>
                  <div style={{fontWeight: 'bold'}}>🎥 Daily Ads Watched ({dailyAds}/20)</div>
                  <div style={{fontSize: '12px', color: '#4ade80', marginTop: '5px'}}>90% Revenue Share • +500 💎 per ad</div>
                </div>
                <span style={{fontSize: '24px'}}>↗️</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div style={{display: 'flex', justifyContent: 'space-around', padding: '12px 0', background: 'rgba(26, 11, 46, 0.95)', borderTop: '2px solid rgba(168, 85, 247, 0.4)'}}>
        {TABS.map(item => (
          <button key={item.id} onClick={() => setTab(item.id)} style={{
            background: 'none', border: 'none',
            color: tab === item.id? '#fff' : '#8b5cf6',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer'
          }}>
            <span style={{fontSize: '24px'}}>{item.icon}</span>
            <span style={{fontSize: '11px'}}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
  }
