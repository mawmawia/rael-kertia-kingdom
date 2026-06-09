import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [crystals, setCrystals] = useState(0);
  const [user, setUser] = useState("Player");

  useEffect(() => {
    // 1. Initialize Telegram SDK
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      setUser(tg.initDataUnsafe?.user?.first_name || "Traveler");
    }
  }, []);

  // 2. Idle Game Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCrystals(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#1c1c1c', color: 'white', minHeight: '100vh' }}>
      <Head>
        <script src="https://telegram.org/js/telegram-web-app.js" async />
      </Head>
      <h1>Rael Kertia Kingdom</h1>
      <p>Welcome, {user}!</p>
      <h2 style={{ fontSize: '3rem' }}>💎 {crystals}</h2>
      <button 
        style={{ padding: '15px 30px', fontSize: '18px', borderRadius: '10px', border: 'none', background: '#3390ec', color: 'white' }}
        onClick={() => setCrystals(c => c + 5)}
      >
        Manual Mine (+5)
      </button>
      <div style={{ marginTop: '30px' }}>
        <p>Subscribe to our channels for rewards!</p>
      </div>
    </div>
  );
}
