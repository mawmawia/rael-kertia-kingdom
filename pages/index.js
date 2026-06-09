import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [crystals, setCrystals] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userId] = useState(typeof window !== 'undefined' ? 
    window.Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString() || 'test-user' : 'test-user');

  // Calculate Rank
  const getRank = (count) => {
    if (count < 100) return 'Elite';
    if (count < 500) return 'Master';
    if (count < 1000) return 'Legend';
    if (count < 2000) return 'Mythic';
    const mythicLevel = Math.min(100, Math.floor((count - 2000) / 500) + 1);
    return `Mythic ${mythicLevel}`;
  };

  useEffect(() => {
    async function fetchData() {
      // Load User Data
      let { data: userData } = await supabase.from('crystals').select('crystals').eq('id', userId).single();
      if (userData) setCrystals(userData.crystals);

      // Load Leaderboard
      let { data: lbData } = await supabase.from('crystals').select('id, crystals').order('crystals', { ascending: false }).limit(10);
      if (lbData) setLeaderboard(lbData);
    }
    fetchData();
  }, [userId]);

  const handleMine = async () => {
    const newCount = crystals + 5;
    setCrystals(newCount);
    await supabase.from('crystals').upsert({ id: userId, crystals: newCount });
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px', fontFamily: 'sans-serif', color: '#fff' }}>
      <h1>Rael Kertia Kingdom</h1>
      <div style={{ fontSize: '24px', margin: '20px' }}>
        💎 {crystals} <br/>
        Rank: <strong>{getRank(crystals)}</strong>
      </div>
      
      <button onClick={handleMine} style={{ padding: '20px 40px', fontSize: '18px', background: '#3390ec', border: 'none', borderRadius: '15px', color: 'white', cursor: 'pointer' }}>
        Mine Crystals
      </button>

      <div style={{ marginTop: '40px' }}>
        <h3>🏆 Leaderboard (Top 10)</h3>
        {leaderboard.map((user, index) => (
          <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 20%' }}>
            <span>{index + 1}. Player {user.id.slice(-4)}</span>
            <span>{user.crystals} 💎</span>
          </div>
        ))}
      </div>
    </div>
  );
}
