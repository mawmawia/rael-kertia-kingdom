import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [crystals, setCrystals] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const userId = typeof window !== 'undefined' ? window.Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString() || 'test-user' : 'test-user';

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.from('crystals').select('*').eq('id', userId).single();
      if (data) {
        setCrystals(data.crystals);
        if (data.completed_tasks?.includes('channel_sub')) setIsSubscribed(true);
      }
    }
    loadData();
  }, [userId]);

  const handleTap = async () => {
    const boost = isSubscribed ? 2 : 1; // x2 boost if subscribed
    const newCount = crystals + (1 * boost);
    setCrystals(newCount);
    await supabase.from('crystals').upsert({ id: userId, crystals: newCount });
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#000', color: '#fff', fontFamily: 'sans-serif' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px' }}>
        <span>👤 Profile</span>
        <span>💎 {crystals}</span>
      </div>

      {/* Main Tap Area */}
      <div onClick={handleTap} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
        <div style={{ fontSize: '100px' }}>💎</div>
      </div>

      {/* Bottom Nav Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '20px', background: '#1c1c1c' }}>
        <span>Task</span>
        <span>Mine</span>
        <span>Store</span>
        <span>Friends</span>
      </div>
    </div>
  );
}
