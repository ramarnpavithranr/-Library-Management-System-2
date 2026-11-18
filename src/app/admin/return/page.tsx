'use client';

import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Search,
  Calendar,
  Receipt,
  Clock,
  Sparkles,
  History,
  User,
  Hash,
  BookOpen,
  CheckCircle,
} from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { Badge } from '@/components/common/Badge';
import confetti from 'canvas-confetti';
import { ENV } from '@/config/env';

export default function AdminReturnBookPage() {
  const { borrowRecords, returnBook, refreshBookIssues, books } = useLibrary();

  useEffect(() => {
    refreshBookIssues();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [returnHistorySearch, setReturnHistorySearch] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState('');
  const [studentInput, setStudentInput] = useState('');
  const [bookIdInput, setBookIdInput] = useState('');
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [resultModal, setResultModal] = useState<{
    show: boolean;
    bookTitle: string;
    studentName: string;
    overdueDays: number;
    fineAmount: number;
  } | null>(null);

  // Filter only currently unreturned records (borrowed, overdue)
  const activeRecords = borrowRecords.filter(
    (r) =>
      r.status !== 'returned' &&
      !r.returnDate &&
      (r.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.bookId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Match selected loan either by explicit click or by entered Student Name/ID and Book ID
  const selectedRecord =
    borrowRecords.find((r) => r.id === selectedRecordId) ||
    borrowRecords.find(
      (r) =>
        r.status !== 'returned' &&
        !r.returnDate &&
        (studentInput.trim() &&
          (r.studentName.toLowerCase() === studentInput.trim().toLowerCase() ||
            r.rollNumber.toLowerCase() === studentInput.trim().toLowerCase() ||
            r.studentId.toLowerCase() === studentInput.trim().toLowerCase())) &&
        (bookIdInput.trim() &&
          (r.bookId === bookIdInput.trim() ||
            r.bookTitle.toLowerCase().includes(bookIdInput.trim().toLowerCase())))
    );

  const handleSelectLoan = (r: (typeof borrowRecords)[0]) => {
    setSelectedRecordId(r.id);
    setStudentInput(r.studentName);
    setBookIdInput(r.bookId);
  };

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

  // All returned records from database & memory
  const returnedRecords = borrowRecords.filter(
    (r) => r.status === 'returned' || !!r.returnDate
  );
  const totalReturnedCount = returnedRecords.length;

  // Filtered returned records for history display
  const filteredReturnHistory = returnedRecords.filter((r) => {
    const q = returnHistorySearch.toLowerCase().trim();
    if (!q) return true;
    return (
      r.studentName.toLowerCase().includes(q) ||
      r.bookTitle.toLowerCase().includes(q) ||
      r.rollNumber.toLowerCase().includes(q) ||
      r.bookId.toLowerCase().includes(q) ||
      (r.returnDate && r.returnDate.includes(q))
    );
  });

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
      setStudentInput('');
      setBookIdInput('');
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
                      onClick={() => handleSelectLoan(r)}
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

              {/* Input fields for Student Name/ID & Book ID */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-[11px] font-bold text-charcoal-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <User size={13} className="text-burgundy-800" />
                    <span>Student Name / ID</span>
                  </label>
                  <input
                    type="text"
                    value={studentInput}
                    onChange={(e) => setStudentInput(e.target.value)}
                    placeholder="e.g. Priya Sharma or Roll Number"
                    className="w-full text-xs font-medium p-2.5 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20 text-charcoal-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-charcoal-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Hash size={13} className="text-burgundy-800" />
                    <span>Book ID / Title</span>
                  </label>
                  <input
                    type="text"
                    value={bookIdInput}
                    onChange={(e) => setBookIdInput(e.target.value)}
                    placeholder="e.g. 1, 2 or Title"
                    className="w-full text-xs font-medium p-2.5 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20 text-charcoal-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-charcoal-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Calendar size={13} className="text-burgundy-800" />
                    <span>Actual Return Date *</span>
                  </label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full text-xs font-medium p-2.5 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20 text-charcoal-900"
                  />
                </div>
              </div>

              {selectedRecord ? (
                <div className="space-y-4">
                  <div className="p-3 bg-[#FAF7F7] rounded-2xl border border-burgundy-50 text-xs space-y-1">
                    <p className="text-charcoal-500 text-[11px]">Selected Outstanding Loan:</p>
                    <p className="font-bold text-charcoal-900 text-sm leading-tight">{selectedRecord.bookTitle}</p>
                    <p className="text-charcoal-600 text-[11px]">
                      Student: <strong className="text-burgundy-950">{selectedRecord.studentName}</strong> ({selectedRecord.rollNumber})
                    </p>
                    <p className="text-charcoal-500 text-[10px]">
                      Issue Date: {selectedRecord.issueDate} • Due Date: {selectedRecord.dueDate}
                    </p>
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
                <div className="py-6 text-center text-xs text-charcoal-400 bg-[#FAF7F7] rounded-2xl border border-dashed border-burgundy-100">
                  Select an active loan from the left list or type Student Name and Book ID to clear loan.
                </div>
              )}
            </div>

            <button
              onClick={handleReturnSubmit}
              disabled={!selectedRecord}
              className="mt-6 w-full py-3.5 bg-gradient-to-r from-burgundy-900 to-burgundy-800 hover:from-burgundy-800 hover:to-burgundy-900 text-white rounded-2xl text-xs font-bold shadow-burgundy-glow transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw size={16} />
              <span>Confirm & Process Return</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BOOK RETURN HISTORY SECTION (DYNAMIC SUPABASE RETURN RECORDS)             */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-burgundy-100 shadow-soft space-y-4">
          {/* Header & KPI Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-burgundy-50">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-sm shrink-0">
                <RotateCcw size={16} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-charcoal-900">
                    Book Return History
                  </h3>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Total Returned: {totalReturnedCount}
                  </span>
                </div>
                <p className="text-xs text-charcoal-500">
                  Audit log of all books checked-in and restored to library inventory
                </p>
              </div>
            </div>

            {/* Quick Search inside Return History */}
            <div className="relative w-full sm:w-72">
              <Search size={15} className="absolute left-3.5 top-3 text-charcoal-400" />
              <input
                type="text"
                value={returnHistorySearch}
                onChange={(e) => setReturnHistorySearch(e.target.value)}
                placeholder="Search returned books, student, roll..."
                className="w-full text-xs pl-9 pr-4 py-2 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20 text-charcoal-900"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-2xl border border-burgundy-100">
            <table className="w-full text-left text-xs text-charcoal-700">
              <thead className="bg-[#FAF7F7] border-b border-burgundy-100 text-[11px] font-extrabold uppercase tracking-wider text-charcoal-600">
                <tr>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Book Name</th>
                  <th className="py-3 px-3">Issue Date</th>
                  <th className="py-3 px-3">Due Date</th>
                  <th className="py-3 px-3">Actual Return Date</th>
                  <th className="py-3 px-3 text-center">Return Status</th>
                  <th className="py-3 px-4">Fine / Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-burgundy-50">
                {filteredReturnHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-charcoal-400">
                      No returned book records found matching your query.
                    </td>
                  </tr>
                ) : (
                  filteredReturnHistory.map((rec) => {
                    const isLate = (rec.fineAmount && rec.fineAmount > 0) || (rec.dueDate && rec.returnDate && rec.returnDate > rec.dueDate);

                    return (
                      <tr key={rec.id} className="hover:bg-burgundy-50/40 transition-colors">
                        {/* Student Name */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-charcoal-900 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                              {rec.studentName ? rec.studentName[0] : 'S'}
                            </span>
                            <div>
                              <p className="truncate max-w-[150px]">{rec.studentName}</p>
                              {rec.rollNumber && rec.rollNumber !== 'N/A' && (
                                <p className="text-[10px] text-charcoal-400 font-mono">{rec.rollNumber}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Book Name */}
                        <td className="py-3 px-4">
                          <span className="font-semibold text-charcoal-900 block max-w-[220px] truncate" title={rec.bookTitle}>
                            {rec.bookTitle}
                          </span>
                          <span className="text-[10px] font-mono text-burgundy-900">ID: #{rec.bookId}</span>
                        </td>

                        {/* Issue Date */}
                        <td className="py-3 px-3 whitespace-nowrap text-charcoal-600">
                          {rec.issueDate}
                        </td>

                        {/* Due Date */}
                        <td className="py-3 px-3 whitespace-nowrap font-medium text-charcoal-700">
                          {rec.dueDate}
                        </td>

                        {/* Actual Return Date */}
                        <td className="py-3 px-3 whitespace-nowrap font-bold text-emerald-800">
                          {rec.returnDate || 'Returned'}
                        </td>

                        {/* Return Status */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {isLate ? (
                            <Badge variant="warning" size="sm" dot>Returned Late</Badge>
                          ) : (
                            <Badge variant="success" size="sm" dot>Returned (On Time)</Badge>
                          )}
                        </td>

                        {/* Fine / Remarks */}
                        <td className="py-3 px-4 text-charcoal-600 max-w-[180px] truncate">
                          {rec.fineAmount && rec.fineAmount > 0 ? (
                            <span className="text-rose-700 font-bold">${rec.fineAmount} Fine Assessed</span>
                          ) : (
                            <span className="text-charcoal-400">No Fines • Checked in</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

