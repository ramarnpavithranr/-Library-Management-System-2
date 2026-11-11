'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ENV } from '@/config/env';

interface AnimatedLogoSplashProps {
  portalTitle: string;
  portalSubtitle?: string;
  onComplete: () => void;
  durationMs?: number;
}

export const AnimatedLogoSplash: React.FC<AnimatedLogoSplashProps> = ({
  portalTitle,
  portalSubtitle = 'Smart Library Management System',
  onComplete,
  durationMs = 2400,
}) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setIsFadingOut(true);
        setTimeout(() => {
          onComplete();
        }, 350);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [durationMs, onComplete]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 200);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#FDF8F8] via-[#FAF3F3] to-[#F5ECEE] transition-opacity duration-300 cursor-pointer select-none ${
        isFadingOut ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background ambient decorative glowing orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-rose-400/15 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-72 h-72 bg-amber-400/15 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />

      {/* Main Animated Content */}
      <div className="relative flex flex-col items-center text-center max-w-sm w-full animate-scale-in">
        
        {/* Animated Circular Logo Badge */}
        <div className="relative mb-6">
          {/* Outer Pulsing Glow Aura */}
          <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-burgundy-700 via-amber-400 to-rose-500 opacity-30 blur-md animate-pulse-glow" />

          {/* Golden Orbit Ring with subtle rotation */}
          <div className="absolute -inset-2 rounded-full border-2 border-dashed border-amber-500/40 animate-rotate-slow pointer-events-none" />

          {/* SSEC Emblem Container */}
          <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-white p-2 shadow-2xl border-4 border-burgundy-900/15 animate-float flex items-center justify-center">
            <Image
              src="/college-logo.png"
              alt="Sree Sakthi Engineering College Official Logo"
              width={160}
              height={160}
              priority
              className="w-full h-full object-contain rounded-full drop-shadow-md"
            />
          </div>
        </div>

        {/* College & Institution Typography */}
        <div className="space-y-1 mb-6 animate-fade-slide-up">
          <h1 className="text-lg sm:text-xl font-black uppercase tracking-wider text-burgundy-950 leading-snug">
            {ENV.COLLEGE_NAME || 'Sree Sakthi Engineering College'}
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600">
            {ENV.COLLEGE_LOCATION || 'Coimbatore'}
          </p>
          <div className="pt-2">
            <span className="inline-block px-3.5 py-1 rounded-full bg-burgundy-900 text-cream-100 text-xs font-extrabold tracking-wide shadow-burgundy-glow">
              {ENV.LIBRARY_NAME || 'Central Smart Library'}
            </span>
          </div>
        </div>

        {/* Portal Identifier Pill */}
        <div className="mb-8 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-2xl bg-white border border-burgundy-100 shadow-sm text-xs font-bold text-burgundy-800">
          <Sparkles size={14} className="text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
          <span>{portalTitle}</span>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-48 bg-burgundy-100/70 h-1.5 rounded-full overflow-hidden shadow-inner mb-3">
          <div
            className="h-full bg-gradient-to-r from-burgundy-800 via-rose-500 to-amber-500 rounded-full transition-all duration-75 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status text & Skip Hint */}
        <div className="flex items-center justify-between w-48 text-[11px] text-charcoal-500 font-medium">
          <span>Loading portal...</span>
          <span className="font-bold text-burgundy-800">{progress}%</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
          className="mt-6 text-xs text-charcoal-400 hover:text-burgundy-900 font-semibold inline-flex items-center gap-1 transition-colors"
        >
          <span>Tap to continue</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};

