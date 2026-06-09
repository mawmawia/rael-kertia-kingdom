import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const canvasRef = useRef(null);
  const [crystals, setCrystals] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0F0';
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = letters.charAt(Math.floor(Math.random() * letters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };
    const interval = setInterval(draw, 33);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, zIndex: -1 }} />
      <div style={{ padding: '20px', textAlign: 'center', color: 'white', zIndex: 1, position: 'relative' }}>
        <h1>Rael Kertia Kingdom</h1>
        <h2 style={{ fontSize: '3rem' }}>💎 {crystals}</h2>
        <button 
          onClick={() => setCrystals(c => c + 5)}
          style={{ padding: '15px 30px', background: '#3390ec', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer' }}
        >
          Manual Mine (+5)
        </button>
      </div>
    </div>
  );
}
