
import React from 'react';

interface OutcomeOverlayProps {
  type: 'victory' | 'loser';
}

const OutcomeOverlay: React.FC<OutcomeOverlayProps> = ({ type }) => {
  const isVictory = type === 'victory';

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-500">
      <div className={`
        relative px-8 py-12 rounded-2xl border-4 text-center transform animate-in zoom-in duration-300
        ${isVictory 
          ? 'bg-emerald-950/90 border-emerald-500 shadow-[0_0_100px_rgba(16,185,129,0.5)]' 
          : 'bg-red-950/90 border-red-500 shadow-[0_0_100px_rgba(239,68,68,0.5)]'}
      `}>
        {/* Background Decorative Rings */}
        <div className={`absolute inset-0 rounded-xl animate-pulse ${isVictory ? 'ring-4 ring-emerald-500/20' : 'ring-4 ring-red-500/20'}`} />
        
        <h2 className={`
          text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter mb-4 italic
          ${isVictory ? 'text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,1)]' : 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]'}
        `}>
          {isVictory ? "CONGRATULATIONS!" : "LOSER!"}
        </h2>
        
        <p className={`
          text-lg sm:text-2xl font-bold uppercase tracking-widest
          ${isVictory ? 'text-emerald-200' : 'text-red-300'}
        `}>
          {isVictory ? "Selamat atas kemenangannya!" : "Misi Gagal. Coba lagi!"}
        </p>

        {/* Animated Particles/Icons */}
        <div className="mt-8 flex justify-center gap-4">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`w-3 h-3 rounded-full animate-bounce ${isVictory ? 'bg-emerald-400' : 'bg-red-500'}`} 
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OutcomeOverlay;
