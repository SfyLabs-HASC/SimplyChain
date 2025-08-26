import React from 'react';

export const HeroBackground: React.FC = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg className="absolute -top-24 left-1/2 -translate-x-1/2 opacity-20" width="1200" height="800" viewBox="0 0 1200 800" aria-hidden>
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
      <div className="absolute inset-0 hero-gradient" />
    </div>
  );
};