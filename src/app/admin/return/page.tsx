'use client';

import React, { useState } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Search,
  Calendar,
  Receipt,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { Badge } from '@/components/common/Badge';
import confetti from 'canvas-confetti';
import { ENV } from '@/config/env';

export default function AdminReturnBookPage() {
  const { borrowRecords, returnBook } = useLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState('');
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [resultModal, setResultModal] = useState<{
    show: boolean;
    bookTitle: string;
    studentName: string;
    overdueDays: number;
    fineAmount: number;
  } | null>(null);

  // Filter only currently unreturned records (borrowed, overdue, not_returned)
  const activeRecords = borrowRecords.filter(
    (r) =>
      r.status !== 'returned' &&
      (r.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedRecord = borrowRecords.find((r) => r.id === selectedRecordId);

  // Live Overdue calculation based on selected return date
  let calculatedOverdueDays = 0;
  let calculatedFine = 0;

  if (selectedRecord) {
    const dueTime = new Date(selectedRecord.dueDate).getTime();
    const returnTime = new Date(returnDate).getTime();
    const diffDays = Math.ceil((returnTime - dueTime) / (1000 * 60 * 60 * 24));
    calculatedOverdueDays = diffDays > 0 ? diffDays : 0;
    calculatedFine = calculatedOverdueDays * ENV.FINE_PER_DAY;
  }

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    const res = returnBook(selectedRecord.id, returnDate);
    if (res.success) {
      if (res.fineCalculated === 0) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10B981', '#6E1129'],
        });
      }

      setResultModal({
        show: true,
        bookTitle: selectedRecord.bookTitle,
        studentName: selectedRecord.studentName,
        overdueDays: calculatedOverdueDays,
        fineAmount: res.fineCalculated,
      });

      setSelectedRecordId('');
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopBar
        title="Return Book Module"
        subtitle="Check-in Processing, Automated Overdue & Fine Computation"
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
        {/* Success / Fine Incurred Banner */}
        {resultModal?.show && (
          <div className="p-5 rounded-3xl bg-white border border-burgundy-100 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    resultModal.fineAmount > 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {resultModal.fineAmount > 0 ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />}
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-charcoal-900">
                    Book Returned Successfully!
                  </h4>
                  <p className="text-xs text-charcoal-600 mt-0.5">
                    <strong>{resultModal.bookTitle}</strong> has been restored to library catalogue inventory from <strong>{resultModal.studentName}</strong>.
                  </p>
                  {resultModal.fineAmount > 0 ? (
                    <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800">
                      <Receipt size={14} />
                      <span>Late Return Fine Assessed: ${resultModal.fineAmount} ({resultModal.overdueDays} days @ $5/day)</span>
                    </div>
                  ) : (
                    <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800">
                      <CheckCircle2 size={14} />
                      <span>Returned On Schedule • Zero Fines Incurred</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setResultModal(null)}
                className="text-xs font-bold px-3 py-1.5 bg-burgundy-50 text-burgundy-900 rounded-xl hover:bg-burgundy-100"
              >
                Done
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* STEP 1: SELECT OUTSTANDING LOAN (2 Cols) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-burgundy-100 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-burgundy-800 text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="text-sm font-extrabold text-charcoal-900">
                  Select Loan Record to Clear ({activeRecords.length} Active)
                </h3>
              </div>
            </div>

            {/* Search query */}
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3.5 top-3.5 text-charcoal-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student name, roll number, or book title..."
                className="w-full text-xs pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
              />
            </div>

            {/* Records List */}
            {activeRecords.length === 0 ? (
              <div className="py-12 text-center text-xs text-charcoal-400">
                No active loans found matching your query.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {activeRecords.map((r) => {
                  const isSelected = selectedRecordId === r.id;
                  const isOverdue = r.status === 'overdue' || new Date(r.dueDate) < new Date();

                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRecordId(r.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-burgundy-50 border-burgundy-700 shadow-sm'
                          : 'bg-[#FAF7F7] border-burgundy-50 hover:bg-white hover:border-burgundy-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-12 rounded-lg overflow-hidden bg-burgundy-950 shrink-0 border border-burgundy-100">
                          {r.bookCover ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={r.bookCover} alt={r.bookTitle} className="w-full h-full object-cover" />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-charcoal-900 truncate">
                            {r.bookTitle}
                          </p>
                          <p className="text-[11px] text-charcoal-600 truncate">
                            Issued to: <strong className="text-charcoal-800">{r.studentName}</strong> ({r.rollNumber})
                          </p>
                          <p className="text-[10px] text-charcoal-400">
                            Loan Date: {r.issueDate} • Due Date: {r.dueDate}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {isOverdue ? (
                          <Badge variant="danger" size="sm" dot>Overdue</Badge>
                        ) : (
                          <Badge variant="burgundy" size="sm">Active Loan</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* STEP 2: RETURN & FINE CALCULATION PANEL */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-burgundy-100 shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-burgundy-800 text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h3 className="text-sm font-extrabold text-charcoal-900">
                  Return Verification
                </h3>
              </div>

              {selectedRecord ? (
                <div className="space-y-4">
                  <div className="p-3 bg-[#FAF7F7] rounded-2xl border border-burgundy-50 text-xs space-y-1.5">
                    <p className="text-charcoal-500">Selected Title:</p>
                    <p className="font-bold text-charcoal-900 text-sm leading-tight">{selectedRecord.bookTitle}</p>
                    <p className="text-charcoal-600 text-[11px]">
                      Student: {selectedRecord.studentName} ({selectedRecord.rollNumber})
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                      Actual Return Date
                    </label>
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                    />
                  </div>

                  {/* Overdue & Fine Computation Card */}
                  <div
                    className={`p-4 rounded-2xl border ${
                      calculatedFine > 0
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span>Overdue Status:</span>
                      <span className="font-bold">
                        {calculatedOverdueDays > 0 ? `${calculatedOverdueDays} Days Late` : 'On Time'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold mb-2">
                      <span>Daily Fine Rate:</span>
                      <span>{ENV.CURRENCY_SYMBOL}{ENV.FINE_PER_DAY.toFixed(2)} / day</span>
                    </div>

                    <div className="pt-2 border-t border-current/20 flex items-center justify-between">
                      <span className="text-xs uppercase font-bold tracking-wider">
                        Total Fine Due:
                      </span>
                      <span className="text-lg font-extrabold">
                        ${calculatedFine}.00
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-xs text-charcoal-400">
                  Select an active loan from the left list to calculate returns and overdue fines.
                </div>
              )}
            </div>

            <button
              onClick={handleReturnSubmit}
              disabled={!selectedRecord}
              className="mt-6 w-full py-3.5 bg-gradient-to-r from-burgundy-900 to-burgundy-800 hover:from-burgundy-800 hover:to-burgundy-900 text-white rounded-2xl text-xs font-bold shadow-burgundy-glow transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} />
              <span>Confirm & Process Return</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

