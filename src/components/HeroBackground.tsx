import React from 'react';

export const HeroBackground: React.FC = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Concentric rings */}
      <svg className="absolute -top-24 left-1/2 -translate-x-1/2 opacity-20 animate-pulse" width="1200" height="800" viewBox="0 0 1200 800" aria-hidden>
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <g fill="none" stroke="url(#g1)" strokeWidth="0.6">
          {Array.from({ length: 40 }).map((_, i) => (
            <circle key={i} cx={600} cy={400} r={20 + i * 14} />
          ))}
        </g>
      </svg>

      {/* Floating tech chips */}
      <div className="absolute inset-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-24 h-16 glass-card rounded-lg border border-white/10 ${i % 2 === 0 ? 'animate-float-slow' : 'animate-float'} flex items-center justify-center`}
            style={{
              left: `${10 + i * 10}%`,
              top: `${(i * 13) % 80}%`,
              transform: `rotate(${(i * 17) % 360}deg)`
            }}
          >
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-primary/30 to-accent/20" />
          </div>
        ))}
      </div>

      {/* Scanning grid */}
      <div className="absolute inset-0 opacity-15">
        <div className="w-full h-full bg-[linear-gradient(transparent_95%,rgba(255,255,255,0.12)_96%),linear-gradient(90deg,transparent_95%,rgba(255,255,255,0.12)_96%)] bg-[length:100%_24px,24px_100%] animate-scan" />
      </div>

      <div className="absolute inset-0 hero-gradient" />
    </div>
  );
};