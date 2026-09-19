import React from 'react';

export interface BrandLogoProps {
  logoUrl?: string;
  restaurantName?: string;
  restaurantNameAr?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'receipt' | 'hero';
  variant?: 'color' | 'dark' | 'monochrome' | 'receipt';
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
}

/**
 * Official BISMIC RESTAURANT Brand Logo Component
 * Replicates the authentic Bismic emblem:
 * - Stylized saffron/amber "B"
 * - Serving cloche / platter with rising culinary steam
 * - Crisp geometric "BISMIC - RESTAURANT" typography
 * - "AUTHENTIC TASTE FROM PAKISTAN TO KSA" tagline
 * - Specialized high-contrast monochrome mode for 80mm thermal bill printing
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  logoUrl = '/bismic-logo.jpg',
  restaurantName = 'Bismic Restaurant',
  restaurantNameAr = 'بسمک ریستوران',
  size = 'md',
  variant = 'color',
  showText = false,
  showTagline = false,
  className = '',
}) => {
  const [imgError, setImgError] = React.useState(false);

  // Size mappings
  const sizeClasses = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    receipt: 'w-16 h-16',
    hero: 'w-32 h-32',
  };

  // If a valid custom image URL/base64 is provided and hasn't errored
  if (logoUrl && !imgError) {
    return (
      <div className={`relative flex flex-col items-center justify-center shrink-0 ${className}`}>
        <img
          src={logoUrl}
          alt={restaurantName}
          onError={() => setImgError(true)}
          className={`${sizeClasses[size]} object-contain rounded-lg ${
            variant === 'monochrome' || variant === 'receipt' ? 'filter grayscale contrast-150' : ''
          }`}
        />
        {showText && (
          <div className="text-center mt-1.5">
            <span
              className={`block font-black tracking-wider text-xs ${
                variant === 'dark' ? 'text-white' : 'text-slate-900'
              }`}
            >
              BISMIC
            </span>
            <span className="block text-[10px] font-bold text-amber-600 tracking-widest uppercase">
              — RESTAURANT —
            </span>
            {showTagline && (
              <span className="block text-[8px] text-slate-400 tracking-wider uppercase mt-0.5">
                Authentic Taste from Pakistan to KSA
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  const isMono = variant === 'monochrome' || variant === 'receipt';
  const isDark = variant === 'dark';

  // Authentic Bismic Brand Colors
  const amberOrange = isMono ? '#000000' : '#E77E23';
  const clocheFill = isMono ? '#ffffff' : isDark ? '#FFF7ED' : '#FFFDF7';
  const clocheStroke = isMono ? '#000000' : '#E77E23';
  const steamStroke = isMono ? '#000000' : isDark ? '#FFF7ED' : '#EA580C';
  const textWhite = isMono ? '#000000' : isDark ? '#FFFFFF' : '#1E1B18';
  const taglineColor = isMono ? '#333333' : isDark ? '#E5E7EB' : '#4B5563';

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center shrink-0 select-none ${className}`}
      title={`${restaurantName} - ${restaurantNameAr}`}
    >
      <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
        <svg
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xs"
        >
          {/* Background disc/square (subtle contrast when dark, transparent otherwise) */}
          {isDark && (
            <rect width="160" height="160" rx="28" fill="#14110F" fillOpacity="0.85" />
          )}

          {/* ========================================================
              THE ICONIC BISMIC "B"
              ======================================================== */}
          {/* Main Body of "B" with two hollow counter chambers */}
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="
              M 32 14
              H 96
              C 122 14 138 28 138 52
              C 138 68 126 78 112 82
              C 132 86 144 100 144 122
              C 144 146 124 160 98 160
              H 32
              V 14
              Z
              M 52 34
              V 70
              H 92
              C 106 70 116 63 116 52
              C 116 41 106 34 92 34
              H 52
              Z
              M 52 90
              V 140
              H 94
              C 110 140 122 132 122 115
              C 122 98 110 90 94 90
              H 52
              Z
            "
            fill={amberOrange}
          />

          {/* ========================================================
              SERVING CLOCHE (FOOD DOME) INSIDE LOWER COUNTER
              ======================================================== */}
          {/* Lower Dome Base Platter Line */}
          <rect
            x="58"
            y="131"
            width="58"
            height="6"
            rx="3"
            fill={clocheFill}
            stroke={isMono ? '#000000' : undefined}
            strokeWidth={isMono ? 1.5 : 0}
          />

          {/* Semicircular Serving Dome */}
          <path
            d="M 61 131 C 61 108 73 98 87 98 C 101 98 113 108 113 131 Z"
            fill={clocheFill}
            stroke={isMono ? '#000000' : undefined}
            strokeWidth={isMono ? 2 : 0}
          />

          {/* Cloche Top Knob Handle */}
          <circle
            cx="87"
            cy="95"
            r="4.5"
            fill={clocheFill}
            stroke={isMono ? '#000000' : undefined}
            strokeWidth={isMono ? 1.5 : 0}
          />

          {/* ========================================================
              CULINARY STEAM WAVES RISING INTO UPPER COUNTER
              ======================================================== */}
          {/* Middle Steam Trail */}
          <path
            d="M 87 88 C 84 81 91 74 86 67 C 82 60 88 52 86 44"
            stroke={steamStroke}
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Left Steam Trail */}
          <path
            d="M 76 86 C 73 80 79 73 75 66 C 71 59 76 53 74 46"
            stroke={steamStroke}
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
          />

          {/* Right Steam Trail */}
          <path
            d="M 98 86 C 95 80 101 73 97 66 C 93 59 99 53 97 46"
            stroke={steamStroke}
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Typography Lockup below the emblem if requested */}
      {showText && (
        <div className="text-center mt-2 w-full max-w-[220px]">
          {/* BISMIC Title */}
          <h2
            className="text-sm font-black tracking-wider leading-none uppercase font-sans"
            style={{ color: textWhite, letterSpacing: '0.08em' }}
          >
            BISMIC
          </h2>

          {/* RESTAURANT Sub-header with amber dashes */}
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <span
              className="inline-block w-4 h-0.5 rounded-full"
              style={{ backgroundColor: amberOrange }}
            />
            <span
              className="text-[10px] font-extrabold tracking-widest uppercase"
              style={{ color: amberOrange, letterSpacing: '0.18em' }}
            >
              RESTAURANT
            </span>
            <span
              className="inline-block w-4 h-0.5 rounded-full"
              style={{ backgroundColor: amberOrange }}
            />
          </div>

          {/* Urdu Brand Name */}
          <div className="text-xs font-urdu font-bold text-amber-700 mt-0.5">
            {restaurantNameAr || 'بسمک ریستوران'}
          </div>

          {/* Tagline */}
          {showTagline && (
            <p
              className="text-[8px] font-semibold tracking-widest uppercase mt-1 leading-tight"
              style={{ color: taglineColor, letterSpacing: '0.12em' }}
            >
              Authentic Taste from Pakistan to KSA
            </p>
          )}
        </div>
      )}
    </div>
  );
};
