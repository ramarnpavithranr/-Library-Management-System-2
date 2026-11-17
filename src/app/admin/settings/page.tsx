'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  ShieldCheck,
  Save,
  RotateCcw,
  Building,
  Upload,
  Image as ImageIcon,
  MapPin,
  Check,
  Sparkles,
  RefreshCw,
  Mail,
  Phone,
  AlertCircle,
} from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { ENV } from '@/config/env';

export default function AdminSettingsPage() {
  const { settings, updateSettings, resetAllData } = useLibrary();

  // Institution & College Profile state
  const [collegeName, setCollegeName] = useState(settings?.collegeName || ENV.COLLEGE_NAME);
  const [collegeLogo, setCollegeLogo] = useState(settings?.collegeLogo || '/college-logo.png');
  const [address, setAddress] = useState(settings?.address || 'Bettathapuram, Karamadai, Coimbatore - 641104');
  const [location, setLocation] = useState(settings?.location || 'Coimbatore');
  const [libraryName, setLibraryName] = useState(settings?.libraryName || 'Central Smart Library');
  const [libraryEmail, setLibraryEmail] = useState(settings?.libraryEmail || 'library@sreesakthi.edu.in');
  const [libraryPhone, setLibraryPhone] = useState(settings?.libraryPhone || '+91 422 236 9900');

  // Circulation & Fine Rules state
  const [fineRate, setFineRate] = useState(settings?.fineRate || ENV.FINE_PER_DAY);
  const [loanPeriod, setLoanPeriod] = useState(settings?.loanPeriod || ENV.DEFAULT_LOAN_DAYS);
  const [maxBooks, setMaxBooks] = useState(settings?.maxBooks || ENV.MAX_BOOKS_PER_STUDENT);
  const [holdDays, setHoldDays] = useState(settings?.holdDays || 5);

  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Prevents the background 4s polling from clobbering unsaved edits or newly chosen logos
  const isDirtyRef = useRef(false);

  // Sync state when settings from context loads, but only if user hasn't made unsaved modifications
  useEffect(() => {
    if (settings && !isDirtyRef.current) {
      if (settings.collegeName) setCollegeName(settings.collegeName);
      if (settings.collegeLogo) setCollegeLogo(settings.collegeLogo);
      if (settings.address) setAddress(settings.address);
      if (settings.location) setLocation(settings.location);
      if (settings.libraryName) setLibraryName(settings.libraryName);
      if (settings.libraryEmail) setLibraryEmail(settings.libraryEmail);
      if (settings.libraryPhone) setLibraryPhone(settings.libraryPhone);
      if (settings.fineRate) setFineRate(settings.fineRate);
      if (settings.loanPeriod) setLoanPeriod(settings.loanPeriod);
      if (settings.maxBooks) setMaxBooks(settings.maxBooks);
      if (settings.holdDays) setHoldDays(settings.holdDays);
    }
  }, [settings]);

  // Handle Logo Upload / Replace with canvas compression to ensure valid, lightweight PNG
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage('');
    if (!file.type.match(/^image\/(png|jpe?g|webp|svg\+xml)$/i)) {
      setErrorMessage('Please select a valid image file (PNG, JPG, JPEG, or WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image file is too large. Please select an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const rawData = reader.result;
        // Resize and optimize image through HTML5 Canvas
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 360;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const compressed = canvas.toDataURL('image/png');
            isDirtyRef.current = true;
            setCollegeLogo(compressed);
            setSavedMessage('New logo chosen! Click "Save Settings & Logo" to apply permanently.');
          } else {
            isDirtyRef.current = true;
            setCollegeLogo(rawData);
          }
        };
        img.onerror = () => {
          setErrorMessage('Could not decode the selected image file. Please try another image.');
        };
        img.src = rawData;
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read image file from disk.');
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = () => {
    isDirtyRef.current = true;
    setCollegeLogo('/college-logo.png');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setSavedMessage('Logo reset to default. Click "Save Settings & Logo" to persist.');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedMessage('');
    setErrorMessage('');

    const payload = {
      collegeName: collegeName.trim(),
      collegeLogo,
      address: address.trim(),
      location: location.trim(),
      libraryName: libraryName.trim(),
      libraryEmail: libraryEmail.trim(),
      libraryPhone: libraryPhone.trim(),
      fineRate: Number(fineRate) || 5,
      loanPeriod: Number(loanPeriod) || 14,
      maxBooks: Number(maxBooks) || 3,
      holdDays: Number(holdDays) || 5,
    };

    const success = await updateSettings(payload);

    setIsSaving(false);
    isDirtyRef.current = false;

    if (success) {
      setSavedMessage('Institution profile, logo, and circulation settings saved successfully! Changes are live across all portals.');
      setTimeout(() => setSavedMessage(''), 5000);
    } else {
      setSavedMessage('Settings saved to local storage.');
      setTimeout(() => setSavedMessage(''), 4000);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopBar
        title="Settings & Institution Profile"
        subtitle="Manage College Identity, Logo, Location & Circulation Policies"
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto w-full">
        {savedMessage && (
          <div className="p-4 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-sm">
            <Check size={16} className="text-emerald-600 shrink-0" />
            <span>{savedMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-3xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-sm">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* SECTION 1: Institution & College Information */}
          <div className="bg-white rounded-3xl p-6 border border-burgundy-100 shadow-soft space-y-6">
            <div className="flex items-center justify-between border-b border-burgundy-50 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-burgundy-50 text-burgundy-800 flex items-center justify-center font-bold">
                  <Building size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-charcoal-900">
                    Institution & College Profile
                  </h3>
                  <p className="text-[11px] text-charcoal-500">
                    College identity, emblem logo, address, and campus location
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-burgundy-700 bg-burgundy-50 px-2.5 py-1 rounded-full">
                Global Branding
              </span>
            </div>

            {/* College Logo Management */}
            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-2">
                College Emblem / Logo
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-[#FAF7F7] border border-burgundy-100/80">
                {/* View Current Logo */}
                <div className="relative w-24 h-24 rounded-full bg-white p-1.5 border-2 border-burgundy-800/20 shadow-md flex items-center justify-center overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={collegeLogo || '/college-logo.png'}
                    alt="Current College Logo Preview"
                    className="w-full h-full object-contain rounded-full select-none"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/college-logo.png';
                    }}
                  />
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div className="text-xs font-bold text-charcoal-800">
                    Active Institutional Logo
                  </div>
                  <p className="text-[11px] text-charcoal-500 leading-relaxed">
                    Upload or replace the college emblem (PNG, JPG, or JPEG). The updated logo is displayed in headers, navigation, membership cards, and reports.
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="college-logo-file-input"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-burgundy-800 hover:bg-burgundy-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                    >
                      <Upload size={14} />
                      <span>{collegeLogo && collegeLogo !== '/college-logo.png' ? 'Re-upload / Replace Logo' : 'Upload New Logo'}</span>
                    </button>

                    {collegeLogo && collegeLogo !== '/college-logo.png' && (
                      <button
                        type="button"
                        onClick={handleResetLogo}
                        className="px-3 py-2 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-all active:scale-95"
                      >
                        Reset to Default
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Institution / College Name */}
            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                Institution / College Name
              </label>
              <input
                type="text"
                required
                value={collegeName}
                onChange={(e) => {
                  isDirtyRef.current = true;
                  setCollegeName(e.target.value);
                }}
                placeholder="e.g. Sree Sakthi Engineering College"
                className="w-full text-xs font-semibold p-3.5 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20 focus:border-burgundy-700 transition-all"
              />
              <p className="text-[10px] text-charcoal-400 mt-1">
                Reflected throughout the system: admin navigation, student pass, home overview, and login headers.
              </p>
            </div>

            {/* Address and Location in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Institution Address
                </label>
                <div className="relative flex items-center">
                  <MapPin size={16} className="absolute left-3.5 text-charcoal-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => {
                      isDirtyRef.current = true;
                      setAddress(e.target.value);
                    }}
                    placeholder="e.g. Bettathapuram, Karamadai"
                    className="w-full text-xs font-medium pl-10 pr-4 py-3.5 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20 focus:border-burgundy-700 transition-all"
                  />
                </div>
                <p className="text-[10px] text-charcoal-400 mt-1">Official campus physical address.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Campus Location / City
                </label>
                <div className="relative flex items-center">
                  <Building size={16} className="absolute left-3.5 text-charcoal-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => {
                      isDirtyRef.current = true;
                      setLocation(e.target.value);
                    }}
                    placeholder="e.g. Coimbatore"
                    className="w-full text-xs font-medium pl-10 pr-4 py-3.5 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20 focus:border-burgundy-700 transition-all"
                  />
                </div>
                <p className="text-[10px] text-charcoal-400 mt-1">City or region displayed under institution title.</p>
              </div>
            </div>

            {/* Library Name & Contact details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-burgundy-50">
              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Library Department Name
                </label>
                <input
                  type="text"
                  required
                  value={libraryName}
                  onChange={(e) => {
                    isDirtyRef.current = true;
                    setLibraryName(e.target.value);
                  }}
                  placeholder="e.g. Central Smart Library"
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Library Official Email
                </label>
                <div className="relative flex items-center">
                  <Mail size={15} className="absolute left-3 text-charcoal-400 pointer-events-none" />
                  <input
                    type="email"
                    value={libraryEmail}
                    onChange={(e) => {
                      isDirtyRef.current = true;
                      setLibraryEmail(e.target.value);
                    }}
                    placeholder="library@sreesakthi.edu.in"
                    className="w-full text-xs font-medium pl-9 pr-3 py-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Library Helpdesk Phone
                </label>
                <div className="relative flex items-center">
                  <Phone size={15} className="absolute left-3 text-charcoal-400 pointer-events-none" />
                  <input
                    type="tel"
                    value={libraryPhone}
                    onChange={(e) => {
                      isDirtyRef.current = true;
                      setLibraryPhone(e.target.value);
                    }}
                    placeholder="+91 422 236 9900"
                    className="w-full text-xs font-medium pl-9 pr-3 py-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Circulation & Fine Rules */}
          <div className="bg-white rounded-3xl p-6 border border-burgundy-100 shadow-soft space-y-5">
            <h3 className="text-sm font-extrabold text-charcoal-900 border-b border-burgundy-50 pb-3">
              Circulation & Fine Rules
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Overdue Fine Rate (₹ / Day)
                </label>
                <input
                  type="number"
                  min="1"
                  value={fineRate}
                  onChange={(e) => {
                    isDirtyRef.current = true;
                    setFineRate(parseInt(e.target.value) || 1);
                  }}
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Standard Loan Period (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  value={loanPeriod}
                  onChange={(e) => {
                    isDirtyRef.current = true;
                    setLoanPeriod(parseInt(e.target.value) || 14);
                  }}
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Max Books per Student
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={maxBooks}
                  onChange={(e) => {
                    isDirtyRef.current = true;
                    setMaxBooks(parseInt(e.target.value) || 3);
                  }}
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Pre-Book Hold Window (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  value={holdDays}
                  onChange={(e) => {
                    isDirtyRef.current = true;
                    setHoldDays(parseInt(e.target.value) || 5);
                  }}
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-burgundy-50 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-burgundy-800 hover:bg-burgundy-900 text-white rounded-2xl text-xs font-bold shadow-burgundy-glow flex items-center gap-2 active:scale-95 disabled:opacity-50 transition-all"
              >
                {isSaving ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Saving Settings & Logo...</span>
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    <span>Save Settings & Logo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Reset Demo Data Card */}
        <div className="bg-white rounded-3xl p-6 border border-burgundy-100 shadow-soft">
          <h3 className="text-sm font-extrabold text-charcoal-900 mb-1">
            Data State Management
          </h3>
          <p className="text-xs text-charcoal-500 mb-4">
            Reset all modified books, issues, pre-bookings, and student memberships back to the initial sample presentation state.
          </p>

          <button
            onClick={() => {
              if (confirm('Reset all demo state to fresh default values?')) {
                resetAllData();
                window.location.reload();
              }
            }}
            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all"
          >
            <RotateCcw size={15} />
            <span>Reset Demo State to Defaults</span>
          </button>
        </div>
      </main>
    </div>
  );
}
