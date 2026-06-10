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
  {id: 'friends', icon: '👥', label: 'Friends'}
];

// PRE-DEFINED CODES - Change these anytime
const BOOST_CODES = {
  'RAEL3X': { multiplier: 3, duration: 3600, reward: 0 }, // 1 hour 3x
  'WELCOME2X': { multiplier: 2, duration: 7200, reward: 200 }, // 2 hours 2x + 200 coins
};

export default function Home() {
  const [crystals, setCrystals] = useState(0);
  const [activeTab, setActiveTab] = useState('mine');
  const [tg, setTg] = useState(null);
  const [userId, setUserId] = useState('test-user');
  const [tapAnim, setTapAnim] = useState(false);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [boostMultiplier, setBoostMultiplier] = useState(1);
  const [codeInput, setCodeInput] = useState('');
  const [showCodeBox, setShowCodeBox] = useState(false);

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
    const { data } = await supabase.from('crystals').select('*').eq('id', uid).single();

    if (data) {
      setCrystals(data.crystals || 0);
      setCompletedTasks(data.completed_tasks || []);

      // Check boost expiry
      if (data.boost_expires_at && new Date(data.boost_expires_at) > new Date()) {
        setBoostMultiplier(data.boost_multiplier || 1);
      } else {
        setBoostMultiplier(1);
      }
    }
  }

  const saveData = async (newCrystals, newTasks, multiplier, expires) => {
    await supabase.from('crystals').upsert({
      id: userId,
      crystals: newCrystals,
      completed_tasks: newTasks,
      boost_multiplier: multiplier,
      boost_expires_at: expires,
      last_mined_at: new Date().toISOString()
    });
  };

  const handleTap = async () => {
    setTapAnim(true);
    setTimeout(() => setTapAnim(false), 150);

    const newCount = crystals + (1 * boostMultiplier);
    setCrystals(newCount);
    saveData(newCount, completedTasks, boostMultiplier, new Date(Date.now() + 3600000).toISOString());
  };

  const checkTelegramSub = async () => {
    if (completedTasks.includes('tg_sub')) return;

    window.open('https://t.me/RaelKertiaKingdom', '_blank');

    setTimeout(async () => {
      const res = await fetch('/api/check-sub', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ userId, channel: '@RaelKertiaKingdom' })
      });
      const { isSubscribed } = await res.json();

      if (isSubscribed) {
        const newTasks = [...completedTasks, 'tg_sub'];
        setCompletedTasks(newTasks);
        const expires = new Date(Date.now() + 86400000 * 999); // permanent 2x
        setBoostMultiplier(2);
        setCrystals(c => c + 500);
        saveData(crystals + 500, newTasks, 2, expires.toISOString());
        tg?.showPopup({title: 'Verified! ✅', message: '2x Mining Boost Unlocked Forever!' });
      } else {
        tg?.showAlert('Join @RaelKertiaKingdom channel first!');
      }
    }, 3000);
  };

  const completeYoutubeTask = () => {
    if (completedTasks.includes('yt_sub')) return;

    window.open('https://youtube.com/@RaelKertia-p4s', '_blank');

    setTimeout(async () => {
      const newTasks = [...completedTasks, 'yt_sub'];
      setCompletedTasks(newTasks);
      setCrystals(c => c + 300);
      saveData(crystals + 300, newTasks, boostMultiplier, new Date(Date.now() + 3600000).toISOString());
      tg?.showPopup({title: 'Task Complete!', message: '+300 crystals!' });
    }, 5000);
  };

  const redeemCode = async () => {
    const code = codeInput.toUpperCase().trim();

    if (!BOOST_CODES[code]) {
      tg?.showAlert('Invalid code!');
      return;
    }

    if (completedTasks.includes(`code_${code}`)) {
      tg?.showAlert('Code already used!');
      return;
    }

    const codeData = BOOST_CODES[code];
    const newTasks = [...completedTasks, `code_${code}`];
    setCompletedTasks(newTasks);

    const expires = new Date(Date.now() + codeData.duration * 1000);
    setBoostMultiplier(codeData.multiplier);
    const newCount = crystals + codeData.reward;
    setCrystals(newCount);

    saveData(newCount, newTasks, codeData.multiplier, expires.toISOString());
    setCodeInput('');
    setShowCodeBox(false);

    tg?.showPopup({
      title: `${codeData.multiplier}x BOOST ACTIVATED!`,
      message: `${codeData.reward > 0? `+${codeData.reward} crystals + ` : ''}${codeData.multiplier}x mining for ${codeData.duration/60}min!`
    });
  };

  const TabContent = () => {
    if (activeTab === 'mine') return (
      <div onClick={handleTap} style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',cursor:'pointer'}}>
        <div style={{
          width: '220px', height: '220px', borderRadius: '50%',
          background: boostMultiplier > 1
           ? 'radial-gradient(circle at 30% 30%, #fbbf24, #f59e0b, #1a0b2e)'
            : 'radial-gradient(circle at 30% 30%, #a855f7, #6b21a8, #1a0b2e)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `4px solid ${boostMultiplier > 1? 'rgba(251,191,36,0.6)' : 'rgba(168,85,247,0.5)'}`,
          boxShadow: tapAnim? `0 0 80px ${boostMultiplier > 1? '#fbbf24' : '#a855f7'}` : `0 0 60px ${boostMultiplier > 1? '#fbbf24' : '#a855f7'}`,
          transform: tapAnim? 'scale(0.92)' : 'scale(1)',
          transition: 'all 0.15s'
        }}>
          <span style={{fontSize: '100px'}}>{boostMultiplier > 1? '⚡' : '💎'}</span>
        </div>
        <div style={{marginTop: '20px', fontSize: '52px', fontWeight: 'bold'}}>{crystals.toLocaleString()}</div>
        {boostMultiplier > 1 && <div style={{marginTop: '10px', color: '#fbbf24', fontWeight: 'bold'}}>⚡ {boostMultiplier}x BOOST ACTIVE</div>}
      </div>
    );

    if (activeTab === 'task') return (
      <div style={{padding: '20px', width: '100%', flex: 1, overflowY: 'auto'}}>
        <h2 style={{textAlign: 'center', marginBottom: '20px'}}>Tasks & Rewards</h2>

        <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>

          {/* Telegram Subscribe - Hides after complete */}
          {!completedTasks.includes('tg_sub') && (
            <div style={{background: 'rgba(0,136,204,0.2)', padding: '20px', borderRadius: '15px', border: '1px solid #0088cc'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <div style={{fontWeight: 'bold', fontSize: '16px'}}>Join Telegram Channel</div>
                  <div style={{fontSize: '12px', opacity: 0.7}}>@RaelKertiaKingdom</div>
                  <div style={{fontSize: '12px', color: '#4ade80', marginTop: '5px'}}>+500 💎 + 2x Mining Boost Forever</div>
                </div>
                <button onClick={checkTelegramSub} style={{
                  padding: '10px 20px', background: '#0088cc', border: 'none',
                  borderRadius: '10px', color: 'white', fontWeight: 'bold', cursor: 'pointer'
                }}>Join & Check</button>
              </div>
            </div>
          )}

          {/* YouTube Subscribe - Hides after complete */}
          {!completedTasks.includes('yt_sub') && (
            <div style={{background: 'rgba(255,0,0,0.2)', padding: '20px', borderRadius: '15px', border: '1px solid #ff0000'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <div style={{fontWeight: 'bold', fontSize: '16px'}}>Subscribe YouTube</div>
                  <div style={{fontSize: '12px', opacity: 0.7}}>@RaelKertia-p4s</div>
                  <div style={{fontSize: '12px', color: '#4ade80', marginTop: '5px'}}>+300 💎</div>
                </div>
                <button onClick={completeYoutubeTask} style={{
                  padding: '10px 20px', background: '#ff0000', border: 'none',
                  borderRadius: '10px', color: 'white', fontWeight: 'bold', cursor: 'pointer'
                }}>Subscribe</button>
              </div>
            </div>
          )}

          {/* Code Redeem Task */}
          <div style={{background: 'rgba(168,85,247,0.2)', padding: '20px', borderRadius: '15px', border: '1px solid #a855f7'}}>
            <div style={{fontWeight: 'bold', fontSize: '16px', marginBottom: '10px'}}>Enter Code for 3x Boost</div>
            <div style={{fontSize: '12px', opacity: 0.7, marginBottom: '15px'}}>Watch ads/videos → Get code → Redeem here</div>

            {!showCodeBox? (
              <button onClick={() => setShowCodeBox(true)} style={{
                width: '100%', padding: '12px', background: '#a855f7', border: 'none',
                borderRadius: '10px', color: 'white', fontWeight: 'bold', cursor: 'pointer'
              }}>Enter Code</button>
            ) : (
              <div style={{display: 'flex', gap: '10px'}}>
                <input
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="Enter code here"
                  style={{
                    flex: 1, padding: '12px', background: '#1a0b2e', border: '1px solid #a855f7',
                    borderRadius: '10px', color: 'white', outline: 'none'
                  }}
                />
                <button onClick={redeemCode} style={{
                  padding: '12px 20px', background: '#4ade80', border: 'none',
                  borderRadius: '10px', color: '#000', fontWeight: 'bold', cursor: 'pointer'
                }}>Redeem</button>
              </div>
            )}

            <div style={{marginTop: '10px', fontSize: '11px', opacity: 0.5}}>
              Used codes: {completedTasks.filter(t => t.startsWith('code_')).length}
            </div>
          </div>

          {completedTasks.length === 3 && (
            <div style={{textAlign: 'center', padding: '40px', opacity: 0.6}}>
              ✓ All tasks completed! Check back later for new tasks.
            </div>
          )}
        </div>
      </div>
    );

    if (activeTab === 'store') return <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}>Store Coming Soon</div>;
    if (activeTab === 'friends') return <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}>Invite Friends</div>;
  };

  return (
    <div style={{height: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, #0f0a1a 0%, #1a0b2e 100%)', color: '#fff'}}>
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />

      <div style={{display: 'flex', justifyContent: 'space-between', padding: '18px 20px', background: 'rgba(45, 27, 78, 0.6)'}}>
        <span>👤 {tg?.initDataUnsafe?.user?.first_name || 'Player'}</span>
        <span style={{fontWeight: 'bold'}}>💎 {crystals.toLocaleString()}</span>
      </div>

      {TabContent()}

      <div style={{display: 'flex', justifyContent: 'space-around', padding: '12px 0', background: 'rgba(26, 11, 46, 0.9)', borderTop: '2px solid rgba(168, 85, 247, 0.4)'}}>
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} style={{
            background: 'none', border: 'none',
            color: activeTab === item.id? '#fff' : '#8b5cf6',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer'
          }}>
            <span style={{fontSize: '28px'}}>{item.icon}</span>
            <span style={{fontSize: '12px'}}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
