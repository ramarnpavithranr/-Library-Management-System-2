'use client';

import React, { useState } from 'react';
import { Settings, ShieldCheck, Save, RotateCcw } from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { ENV } from '@/config/env';

export default function AdminSettingsPage() {
  const { resetAllData } = useLibrary();

  const [fineRate, setFineRate] = useState(ENV.FINE_PER_DAY);
  const [loanPeriod, setLoanPeriod] = useState(ENV.DEFAULT_LOAN_DAYS);
  const [maxBooks, setMaxBooks] = useState(ENV.MAX_BOOKS_PER_STUDENT);
  const [holdDays, setHoldDays] = useState(5);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopBar
        title="Library Settings"
        subtitle="Circulation Policies, Fine Schedules & Storage"
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto w-full">
        {saved && (
          <div className="p-4 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-in fade-in">
            ✓ Library policies updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 border border-burgundy-100 shadow-soft space-y-5">
          <h3 className="text-sm font-extrabold text-charcoal-900 border-b border-burgundy-50 pb-3">
            Circulation & Fine Rules
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                Overdue Fine Rate ($ / Day)
              </label>
              <input
                type="number"
                min="1"
                value={fineRate}
                onChange={(e) => setFineRate(parseInt(e.target.value) || 1)}
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
                onChange={(e) => setLoanPeriod(parseInt(e.target.value) || 14)}
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
                onChange={(e) => setMaxBooks(parseInt(e.target.value) || 3)}
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
                onChange={(e) => setHoldDays(parseInt(e.target.value) || 5)}
                className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-burgundy-50 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-burgundy-800 hover:bg-burgundy-900 text-white rounded-2xl text-xs font-bold shadow-burgundy-glow flex items-center gap-2 active:scale-95"
            >
              <Save size={15} />
              <span>Save System Settings</span>
            </button>
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

