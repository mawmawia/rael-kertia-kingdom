import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [crystals, setCrystals] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [lastMined, setLastMined] = useState(null);
  const userId = typeof window !== 'undefined' ? window.Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString() || 'test-user' : 'test-user';

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.from('crystals').select('*').eq('id', userId).single();
      if (data) {
        setCrystals(data.crystals);
        setLastMined(new Date(data.last_mined_at));
        // Check if subscribed based on completed_tasks
        if (data.completed_tasks?.includes('channel_sub')) setIsSubscribed(true);
      }
    }
    loadData();
  }, [userId]);

  const handleMine = async () => {
    const boost = isSubscribed ? 2 : 1;
    const newCount = crystals + (5 * boost);
    setCrystals(newCount);
    
    await supabase.from('crystals').upsert({ 
      id: userId, 
      crystals: newCount, 
      last_mined_at: new Date().toISOString() 
    });
  };

  const handleSubscribe = async () => {
    window.open('https://t.me/RaelKertiaKingdom', '_blank');
    setIsSubscribed(true);
    // Update DB with task completion
    await supabase.from('crystals').upsert({ 
      id: userId, 
      completed_tasks: ['channel_sub'] 
    });
    alert("Subscribed! Boost activated.");
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px', color: '#fff', background: '#000', minHeight: '100vh' }}>
      <h1>Rael Kertia Kingdom</h1>
      <div style={{ fontSize: '40px', margin: '30px' }}>💎 {crystals}</div>
      
      <button onClick={handleMine} style={{ padding: '20px 40px', fontSize: '20px', background: '#3390ec', borderRadius: '15px', color: 'white', border: 'none' }}>
        Mine (+{isSubscribed ? 10 : 5})
      </button>

      <div style={{ marginTop: '20px' }}>
        <button onClick={handleSubscribe} style={{ padding: '15px', background: isSubscribed ? '#28a745' : '#ffc107', borderRadius: '10px' }}>
          {isSubscribed ? '✅ Subscribed (x2 Boost)' : 'Subscribe to Channel (+2x Boost)'}
        </button>
      </div>
    </div>
  );
}
