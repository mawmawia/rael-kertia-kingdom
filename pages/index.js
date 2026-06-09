import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [crystals, setCrystals] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [userId] = useState(typeof window !== 'undefined' ? 
    window.Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString() || 'test-user' : 'test-user');

  useEffect(() => {
    async function fetchData() {
      let { data } = await supabase.from('crystals').select('crystals').eq('id', userId).single();
      if (data) setCrystals(data.crystals);
    }
    fetchData();
  }, [userId]);

  const handleMine = async () => {
    // x2 multiplier if subscribed
    const boost = isSubscribed ? 2 : 1;
    const addedAmount = 5 * boost;
    const newCount = crystals + addedAmount;
    
    setCrystals(newCount);
    
    const { error } = await supabase.from('crystals').upsert({ id: userId, crystals: newCount });
    if (error) console.error("Error saving:", error);
  };

  const handleSubscribe = () => {
    // Change this to your actual channel link
    window.open('https://t.me/your_channel_username', '_blank');
    setIsSubscribed(true); // Simplified logic: assumes user subscribed
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px', color: '#fff', background: '#000', minHeight: '100vh' }}>
      <h1>Rael Kertia Kingdom</h1>
      <div style={{ fontSize: '30px', margin: '20px' }}>💎 {crystals}</div>
      
      <button onClick={handleMine} style={{ padding: '20px 40px', fontSize: '18px', background: '#3390ec', borderRadius: '15px', color: 'white', border: 'none' }}>
        Manual Mine (+{isSubscribed ? 10 : 5})
      </button>

      <div style={{ marginTop: '20px' }}>
        <button onClick={handleSubscribe} style={{ padding: '10px 20px', background: isSubscribed ? '#28a745' : '#ffc107', borderRadius: '10px' }}>
          {isSubscribed ? 'Subscribed (x2 Boost Active!)' : 'Subscribe to Channel (+2x Boost)'}
        </button>
      </div>
    </div>
  );
}
