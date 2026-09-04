import React from 'react';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  onClick?: () => void;
  textColor?: 'white' | 'dark';
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  onClick,
  textColor = 'white',
}) => {
  const dims = {
    sm: { svg: 26, font: 'text-base', badge: 'text-[8px] px-1 py-0.2' },
    md: { svg: 32, font: 'text-lg', badge: 'text-[9px] px-1.5 py-0.5' },
    lg: { svg: 42, font: 'text-xl', badge: 'text-[10px] px-2 py-0.5' },
    xl: { svg: 52, font: 'text-2xl', badge: 'text-xs px-2.5 py-1' },
  }[size];

  const maskId = React.useId();
  const gradId = React.useId();
  const strokeGradId = React.useId();

  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer hover:opacity-95 transition-opacity' : ''} ${className}`}
    >
      {/* Diagonal Blue - Sea Green Rectangle with Space in the Middle */}
      <div 
        className="relative flex items-center justify-center shrink-0 drop-shadow-[0_2px_10px_rgba(13,148,136,0.35)]"
        style={{ width: dims.svg, height: dims.svg }}
      >
        <svg 
          viewBox="0 0 44 44" 
          width={dims.svg} 
          height={dims.svg} 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Diagonal Blue to Sea Green Gradient */}
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1d4ed8" />
              <stop offset="35%" stopColor="#2563eb" />
              <stop offset="70%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>

            <linearGradient id={strokeGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#5eead4" stopOpacity="0.9" />
            </linearGradient>

            {/* Mask defining the space/aperture in the middle */}
            <mask id={maskId}>
              {/* Solid White Base */}
              <rect width="44" height="44" fill="white" />
              {/* Hollow space in the middle rotated along diagonal */}
              <rect 
                x="14" 
                y="15" 
                width="16" 
                height="14" 
                rx="3.5" 
                transform="rotate(-15 22 22)" 
                fill="black" 
              />
            </mask>
          </defs>

          {/* Outer Diagonal Blue-Sea Green Rectangle with Hollow Space in the Center */}
          <rect
            x="6"
            y="7.5"
            width="32"
            height="29"
            rx="7"
            transform="rotate(-15 22 22)"
            fill={`url(#${gradId})`}
            mask={`url(#${maskId})`}
          />

          {/* Refined Inner Rim Border for the Space in the Middle */}
          <rect
            x="14"
            y="15"
            width="16"
            height="14"
            rx="3.5"
            transform="rotate(-15 22 22)"
            stroke={`url(#${strokeGradId})`}
            strokeWidth="1.2"
            fill="none"
          />

          {/* Signature / Document tick in the center */}
          <rect
            x="17"
            y="19"
            width="10"
            height="1.75"
            rx="0.85"
            transform="rotate(-15 22 22)"
            fill="#5eead4"
          />
          <rect
            x="17"
            y="23"
            width="6.5"
            height="1.75"
            rx="0.85"
            transform="rotate(-15 22 22)"
            fill="#93c5fd"
          />
        </svg>
      </div>

      {/* App Wordmark */}
      {showText && (
        <div className="flex items-center gap-2">
          <span className={`font-extrabold tracking-tight ${textColor === 'white' ? 'text-white' : 'text-slate-900'} ${dims.font}`}>
            CONTRACT<span className="font-light italic text-teal-400">S</span>
          </span>
          <span className={`font-mono font-bold rounded-full bg-gradient-to-r from-blue-500/20 to-teal-500/20 text-teal-300 border border-teal-400/30 uppercase tracking-wider ${dims.badge}`}>
            E-Sign
          </span>
        </div>
      )}
    </div>
  );
};
