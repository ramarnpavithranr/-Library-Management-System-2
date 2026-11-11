'use client';

import React, { useState } from 'react';
import { MembershipCard } from '@/types';
import { CollegeLogo } from '@/components/common/CollegeLogo';
import { Badge } from '@/components/common/Badge';
import { QrCode, ShieldCheck, Download, Sparkles, AlertCircle, RefreshCw, CreditCard } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ENV } from '@/config/env';

interface DigitalMembershipCardProps {
  card?: MembershipCard;
  onApply?: () => void;
  isApplying?: boolean;
}

export const DigitalMembershipCard: React.FC<DigitalMembershipCardProps> = ({
  card,
  onApply,
  isApplying = false,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6E1129', '#B42244', '#FB7185', '#F59E0B'],
    });
  };

  if (!card) {
    return (
      <div className="w-full bg-white rounded-3xl p-6 sm:p-7 border border-burgundy-100 shadow-soft text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-burgundy-50 border border-burgundy-100 flex items-center justify-center text-burgundy-700 shadow-inner">
          <CreditCard size={32} />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-burgundy-100 text-burgundy-900 text-[11px] font-bold mb-2">
          <Sparkles size={13} className="text-burgundy-700" />
          <span>Membership Application</span>
        </div>
        <h3 className="text-base font-extrabold text-charcoal-900 mb-1.5">
          Apply for Digital Library Card
        </h3>
        <p className="text-xs text-charcoal-600 mb-6 max-w-sm mx-auto leading-relaxed">
          Submit your official library pass application. The Library Administrator will review and approve your request to generate your encrypted digital pass with QR Code & Barcode.
        </p>
        <button
          onClick={onApply}
          disabled={isApplying}
          className="w-full max-w-xs mx-auto py-3.5 px-6 bg-gradient-to-r from-burgundy-900 via-burgundy-800 to-burgundy-950 hover:from-burgundy-800 hover:to-burgundy-900 text-white rounded-2xl font-bold text-xs shadow-burgundy-glow transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isApplying ? (
            <>
              <RefreshCw size={15} className="animate-spin" />
              <span>Submitting Application to Admin...</span>
            </>
          ) : (
            <>
              <Sparkles size={15} />
              <span>Apply for Digital Member Card</span>
            </>
          )}
        </button>
      </div>
    );
  }

  if (card.status === 'pending') {
    return (
      <div className="w-full bg-gradient-to-br from-amber-50 via-white to-amber-50/50 rounded-3xl p-6 sm:p-7 border border-amber-200 shadow-soft text-center">
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-amber-100/80 text-amber-800 flex items-center justify-center">
          <ShieldCheck size={28} />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold mb-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>Pending Admin Approval</span>
        </div>
        <h4 className="text-base font-extrabold text-charcoal-900 mb-1">
          Application Under Review
        </h4>
        <p className="text-xs text-charcoal-600 mb-4 max-w-sm mx-auto leading-relaxed">
          Your card application was submitted on <strong className="text-charcoal-800">{card.appliedDate}</strong>. The Administrator is reviewing your request in the Admin Portal.
        </p>
        <div className="p-3.5 bg-white rounded-2xl border border-amber-200/80 flex items-center gap-3 text-left max-w-sm mx-auto">
          <AlertCircle size={18} className="text-amber-600 shrink-0" />
          <p className="text-[11px] text-charcoal-600 leading-snug">
            Once approved by the Admin, your official digital pass with QR code and Barcode will appear right here!
          </p>
        </div>
      </div>
    );
  }

  if (card.status === 'rejected') {
    return (
      <div className="bg-rose-50 rounded-3xl p-6 border border-rose-200 shadow-soft">
        <Badge variant="danger" dot>Application Rejected</Badge>
        <h4 className="text-sm font-bold text-charcoal-900 mt-2 mb-1">
          Membership Request Not Approved
        </h4>
        <p className="text-xs text-charcoal-600 mb-4">
          Please verify your roll number and department details with the library administration.
        </p>
        <button
          onClick={onApply}
          className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700"
        >
          Re-Apply with Verified Info
        </button>
      </div>
    );
  }

  // Approved Digital Card!
  return (
    <div className="w-full flex flex-col items-center">
      {/* 3D Perspective Flip Container */}
      <div
        className="w-full max-w-sm cursor-pointer select-none"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`relative w-full aspect-[1.586/1] rounded-3xl p-5 text-white transition-all duration-500 shadow-2xl overflow-hidden border border-burgundy-600/40 bg-gradient-to-br from-burgundy-950 via-burgundy-800 to-burgundy-900`}
        >
          {/* Subtle metallic holographic sheen background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-500/25 via-transparent to-black/30 pointer-events-none" />

          {/* Micro chip pattern */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-rose-300/80">SSEC SECURE ID</span>
            <div className="w-7 h-5 rounded-md bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 p-0.5 shadow-inner">
              <div className="w-full h-full border border-amber-800/40 rounded-2xs flex flex-col justify-around px-0.5">
                <div className="w-full h-px bg-amber-800/40" />
                <div className="w-full h-px bg-amber-800/40" />
              </div>
            </div>
          </div>

          {/* Card Top: College Emblem & Title */}
          <div className="flex items-center gap-2 mb-3">
            <CollegeLogo size="sm" variant="glass" showText={false} />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold tracking-widest text-rose-200 leading-none">
                {ENV.COLLEGE_NAME}
              </span>
              <span className="text-xs font-extrabold tracking-tight text-white leading-tight">
                {ENV.LIBRARY_NAME} Pass
              </span>
            </div>
          </div>

          {!isFlipped ? (
            /* FRONT OF CARD */
            <div className="flex flex-col justify-between h-[calc(100%-46px)]">
              {/* Student details + photo */}
              <div className="flex items-center gap-3.5 mt-1">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/40 shadow-md shrink-0 bg-burgundy-950">
                  {card.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={card.photo}
                      alt={card.studentName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-lg text-rose-200">
                      {card.studentName[0]}
                    </div>
                  )}
                  {/* Verified check badge */}
                  <div className="absolute bottom-0 right-0 p-0.5 bg-emerald-500 rounded-tl-md text-white">
                    <ShieldCheck size={10} />
                  </div>
                </div>

                <div className="min-w-0">
                  <h4 className="text-sm font-extrabold text-white truncate leading-tight">
                    {card.studentName}
                  </h4>
                  <p className="text-[11px] font-mono font-medium text-rose-200">
                    Roll: {card.rollNumber} • {card.year}
                  </p>
                  <p className="text-[10px] text-white/80 truncate">
                    {card.department}
                  </p>
                </div>
              </div>

              {/* Card Footer: ID & Barcode simulation */}
              <div className="pt-2 border-t border-white/15 flex items-end justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-rose-300 block">
                    Card ID
                  </span>
                  <span className="text-xs font-mono font-bold tracking-wider text-white">
                    {card.membershipId}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-wider text-rose-300 block">
                    Valid Thru
                  </span>
                  <span className="text-xs font-mono font-semibold text-emerald-300">
                    {card.expiryDate || '2026-06-30'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* BACK OF CARD: QR Code & Academic Terms */
            <div className="flex flex-col justify-between h-[calc(100%-46px)] py-1">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] text-rose-200 font-semibold">Digital Verification Key</p>
                  <p className="text-[9px] text-white/70 max-w-[170px] leading-tight">
                    Present this barcode at entry gate scanner or automated checkout kiosk.
                  </p>
                </div>
                <div className="bg-white p-1.5 rounded-xl text-charcoal-900 shadow-md">
                  <QrCode size={48} />
                </div>
              </div>

              {/* Simulated barcode */}
              <div className="mt-2 bg-white/10 p-1.5 rounded-xl border border-white/15 flex flex-col items-center">
                <div className="w-full flex justify-between h-5 items-stretch px-1">
                  {Array.from({ length: 42 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-0.5 bg-white ${
                        i % 3 === 0 ? 'opacity-90' : i % 2 === 0 ? 'opacity-40' : 'opacity-70'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[9px] font-mono tracking-widest text-rose-200 mt-1">
                  *{card.membershipId}*
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card action buttons */}
      <div className="flex items-center gap-3 mt-3.5">
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="text-xs font-semibold text-burgundy-800 hover:text-burgundy-950 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-burgundy-50 border border-burgundy-100 hover:bg-burgundy-100 transition-all active:scale-95"
        >
          <RefreshCw size={12} className={isFlipped ? 'rotate-180 transition-transform' : ''} />
          <span>{isFlipped ? 'Show Front' : 'Flip to QR Barcode'}</span>
        </button>

        <button
          onClick={() => {
            triggerConfetti();
            alert('Membership Pass downloaded to mobile wallet / device!');
          }}
          className="text-xs font-semibold text-charcoal-700 hover:text-charcoal-900 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-burgundy-100 hover:bg-burgundy-50 transition-all active:scale-95 shadow-soft"
        >
          <Download size={12} />
          <span>Save to Wallet</span>
        </button>
      </div>
    </div>
  );
};

