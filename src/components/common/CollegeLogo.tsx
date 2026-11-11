import React from 'react';
import Image from 'next/image';
import { ENV } from '@/config/env';

interface CollegeLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'light' | 'dark' | 'burgundy' | 'glass';
  showText?: boolean;
  orientation?: 'horizontal' | 'vertical';
  animated?: boolean;
  className?: string;
}

export const CollegeLogo: React.FC<CollegeLogoProps> = ({
  size = 'md',
  variant = 'burgundy',
  showText = true,
  orientation = 'horizontal',
  animated = false,
  className = '',
}) => {
  const pixelSizes = {
    sm: 36,
    md: 48,
    lg: 68,
    xl: 96,
    '2xl': 128,
  };

  const containerSizes = {
    sm: 'w-9 h-9 p-0.5',
    md: 'w-12 h-12 p-1',
    lg: 'w-17 h-17 p-1',
    xl: 'w-24 h-24 p-1.5',
    '2xl': 'w-32 h-32 p-2',
  };

  return (
    <div
      className={`flex ${
        orientation === 'vertical' ? 'flex-col items-center text-center' : 'items-center text-left'
      } gap-3 ${className}`}
    >
      {/* College Official Circular Logo */}
      <div
        className={`relative flex items-center justify-center rounded-full bg-white shadow-soft transition-all duration-300 ${
          animated ? 'animate-float hover:scale-105' : 'hover:scale-105'
        } ${containerSizes[size]}`}
      >
        {/* Ambient Burgundy / Gold Ring Halo */}
        <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-burgundy-700 via-amber-400 to-rose-500 opacity-30 blur-sm pointer-events-none" />

        {/* Real Official College Emblem Image */}
        <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-white border-2 border-burgundy-900/10">
          <Image
            src="/college-logo.png"
            alt="Sree Sakthi Engineering College Logo"
            width={pixelSizes[size]}
            height={pixelSizes[size]}
            priority
            className="w-full h-full object-contain rounded-full select-none"
          />
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span
            className={`font-black tracking-wider text-burgundy-900 uppercase leading-tight ${
              size === '2xl'
                ? 'text-base sm:text-lg font-black'
                : size === 'xl'
                ? 'text-sm sm:text-base font-extrabold'
                : size === 'lg'
                ? 'text-xs sm:text-sm font-bold'
                : 'text-[11px] font-bold'
            }`}
          >
            {ENV.COLLEGE_NAME || 'SREE SAKTHI ENGINEERING COLLEGE'}
          </span>
          <div className="flex items-center gap-1.5 justify-center sm:justify-start">
            <span
              className={`font-bold tracking-tight text-burgundy-700 leading-tight ${
                size === '2xl' || size === 'xl' ? 'text-xs' : 'text-[10px]'
              }`}
            >
              {ENV.COLLEGE_LOCATION ? `${ENV.COLLEGE_LOCATION} • ` : ''}{ENV.LIBRARY_NAME || 'Central Smart Library'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
