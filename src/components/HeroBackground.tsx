import React from 'react';

export const HeroBackground = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-background">
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient
            id="glow-gradient"
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="shape-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* Central Glow */}
        <circle cx="50%" cy="30%" r="45%" fill="url(#glow-gradient)" />

        {/* Abstract Shapes */}
        <g opacity="0.15">
          <path
            d="M-100 -100 L 500 200 L 400 800 L -200 500 Z"
            fill="url(#shape-gradient)"
            transform="rotate(15 200 200)"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="15 200 200"
              to="375 200 200"
              dur="90s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M800 -200 L 1200 300 L 1100 900 L 700 400 Z"
            fill="url(#shape-gradient)"
            transform="rotate(-25 800 300)"
          >
             <animateTransform
              attributeName="transform"
              type="rotate"
              from="-25 800 300"
              to="335 800 300"
              dur="120s"
              repeatCount="indefinite"
            />
          </path>
        </g>
      </svg>
      {/* Blur overlay */}
      <div className="absolute inset-0 backdrop-blur-3xl bg-background/50"></div>
    </div>
  );
};
