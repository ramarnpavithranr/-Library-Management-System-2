'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookPlus,
  UserCheck,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Search,
  BookOpen,
  ArrowRight,
  Sparkles,
  Hash,
  FileText,
  User,
  History,
  Clock,
  Users,
} from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { Badge } from '@/components/common/Badge';
import confetti from 'canvas-confetti';
import { ENV } from '@/config/env';

export default function AdminIssueBookPage() {
  const router = useRouter();
  const { students, books, issueBook, stats, borrowRecords, refreshBookIssues } = useLibrary();

  useEffect(() => {
    refreshBookIssues();
  }, []);

  // Search queries for selectors & history
  const [studentSearch, setStudentSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'all' | 'borrowed' | 'returned' | 'overdue'>('all');

  // Form Fields: Student Name & Book ID (Manual & Database Flow)
  const [studentName, setStudentName] = useState('');
  const [bookId, setBookId] = useState('');

  // Selected entity IDs
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');

  // Loan Dates & Remarks (Kept as required)
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultDue = new Date();
  defaultDue.setDate(defaultDue.getDate() + ENV.DEFAULT_LOAN_DAYS);
  const defaultDueStr = defaultDue.toISOString().split('T')[0];

  const [issueDate, setIssueDate] = useState(todayStr); // From Date
  const [dueDate, setDueDate] = useState(defaultDueStr); // Due Date
  const [remarks, setRemarks] = useState('Standard Academic Term Loan'); // Loan Remarks

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter students
  const filteredStudents = students.filter(
    (s) =>
      s.status === 'active' &&
      (s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.studentId.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  // Filter books catalog
  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.isbn.includes(bookSearch) ||
      String(b.id).includes(bookSearch)
  );

  // Resolved entities from either ID or text match
  const selectedStudent = students.find(
    (s) =>
      s.studentId === selectedStudentId ||
      s.name.toLowerCase() === studentName.trim().toLowerCase() ||
      s.rollNumber.toLowerCase() === studentName.trim().toLowerCase()
  );

  const selectedBook = books.find(
    (b) =>
      b.id === (selectedBookId || bookId) ||
      String(b.id) === String(bookId).trim() ||
      b.isbn === bookId.trim() ||
      b.title.toLowerCase() === bookId.trim().toLowerCase()
  );

  // Computed history values & filters
  const totalIssuedCount = borrowRecords.length;
  const uniqueStudentsCount = new Set(
    borrowRecords.map((r) => (r.studentName || '').trim().toLowerCase()).filter(Boolean)
  ).size;
  const activeLoansCount = borrowRecords.filter((r) => r.status !== 'returned').length;
  const returnedCount = borrowRecords.filter((r) => r.status === 'returned').length;

  const filteredHistory = borrowRecords.filter((rec) => {
    const q = historySearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      rec.studentName.toLowerCase().includes(q) ||
      rec.rollNumber.toLowerCase().includes(q) ||
      rec.studentId.toLowerCase().includes(q) ||
      rec.bookTitle.toLowerCase().includes(q) ||
      rec.bookId.toLowerCase().includes(q) ||
      (rec.remarks && rec.remarks.toLowerCase().includes(q));

    const matchesStatus =
      historyStatusFilter === 'all' ||
      (historyStatusFilter === 'borrowed' && rec.status === 'borrowed') ||
      (historyStatusFilter === 'returned' && rec.status === 'returned') ||
      (historyStatusFilter === 'overdue' && rec.status === 'overdue');

    return matchesSearch && matchesStatus;
  });

  // Sync manual input changes to selection states
  const handleStudentNameChange = (val: string) => {
    setStudentName(val);
    const matched = students.find((s) => s.name.toLowerCase() === val.trim().toLowerCase());
    if (matched) {
      setSelectedStudentId(matched.studentId);
    }
  };

  const handleBookIdChange = (val: string) => {
    setBookId(val);
    const matched = books.find(
      (b) =>
        b.id === val.trim() ||
        String(b.id) === val.trim() ||
        b.isbn === val.trim() ||
        b.title.toLowerCase() === val.trim().toLowerCase()
    );
    if (matched) {
      setSelectedBookId(matched.id);
    }
  };

  // Quick picker handlers
  const handlePickStudent = (s: (typeof students)[0]) => {
    setSelectedStudentId(s.studentId);
    setStudentName(s.name);
  };

  const handlePickBook = (b: (typeof books)[0]) => {
    setSelectedBookId(b.id);
    setBookId(b.id);
  };

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const cleanStudentName = studentName.trim();
    const cleanBookId = bookId.trim();

    if (!cleanStudentName) {
      setMessage({ type: 'error', text: 'Please enter or select a Student Name.' });
      return;
    }

    if (!cleanBookId) {
      setMessage({ type: 'error', text: 'Please enter or select a Book ID.' });
      return;
    }

    if (!dueDate) {
      setMessage({ type: 'error', text: 'Please provide a valid Due Date.' });
      return;
    }

    // Check if book has Available Copies = 0
    if (selectedBook) {
      if (selectedBook.availableQuantity <= 0) {
        setMessage({
          type: 'error',
          text: `Cannot issue book: "${selectedBook.title}" has 0 available copies remaining (Available Copies = 0).`,
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const res = await issueBook(
        selectedStudentId || cleanStudentName,
        selectedBook ? selectedBook.id : cleanBookId,
        dueDate,
        remarks,
        issueDate,
        cleanStudentName
      );

      setIsSubmitting(false);

      if (res.success) {
        setMessage({ type: 'success', text: res.message });
        confetti({
          particleCount: 65,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#6E1129', '#B42244', '#10B981'],
        });
        // Reset book fields for next issue
        setBookId('');
        setSelectedBookId('');
      } else {
        setMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setMessage({ type: 'error', text: err?.message || 'Failed to issue book in database.' });
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopBar
        title="Issue Book Module"
        subtitle="Authorize & Record Book Borrowing to Students"
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
        {/* Status Message Alert */}
        {message && (
          <div
            className={`p-4 rounded-3xl border shadow-soft flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{message.text}</span>
            </div>
            <button
              onClick={() => setMessage(null)}
              className="text-xs font-bold underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <form onSubmit={handleIssue} className="space-y-6">
          {/* PRIMARY SECTION: BOOK ISSUE DETAILS (STUDENT NAME, BOOK ID, FROM DATE, DUE DATE, REMARKS) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-burgundy-100 shadow-soft">
            <div className="flex items-center justify-between mb-4 border-b border-burgundy-50 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-burgundy-800 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                  <BookPlus size={15} />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-charcoal-900">
                    Book Issue Details
                  </h3>
                  <p className="text-[11px] text-charcoal-500">
                    Enter details manually or select from the catalogue below
                  </p>
                </div>
              </div>

              {selectedBook && (
                <div className="flex items-center gap-2">
                  {selectedBook.availableQuantity > 0 ? (
                    <Badge variant="success" size="sm" dot>
                      {selectedBook.availableQuantity} Copies Available
                    </Badge>
                  ) : (
                    <Badge variant="danger" size="sm" dot>
                      0 Copies Available (Out of Stock)
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* 5 Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {/* Field 1: Student Name */}
              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <User size={13} className="text-burgundy-800" />
                  <span>Student Name *</span>
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => handleStudentNameChange(e.target.value)}
                  placeholder="e.g. Priya Sharma or select below..."
                  required
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20 text-charcoal-900"
                />
              </div>

              {/* Field 2: Book ID */}
              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Hash size={13} className="text-burgundy-800" />
                  <span>Book ID *</span>
                </label>
                <input
                  type="text"
                  value={bookId}
                  onChange={(e) => handleBookIdChange(e.target.value)}
                  placeholder="e.g. 1, 2 or select below..."
                  required
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20 text-charcoal-900 font-mono"
                />
              </div>

              {/* Field 3: From Date (Issue Date) */}
              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Calendar size={13} className="text-burgundy-800" />
                  <span>From Date *</span>
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  required
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20 text-charcoal-900"
                />
              </div>

              {/* Field 4: Due Date */}
              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Calendar size={13} className="text-burgundy-800" />
                  <span>Due Date (14 Days Standard) *</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20 text-charcoal-900"
                />
              </div>

              {/* Field 5: Loan Remarks */}
              <div className="md:col-span-2 lg:col-span-2">
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <FileText size={13} className="text-burgundy-800" />
                  <span>Loan Remarks</span>
                </label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Standard Academic Term Loan / Course reference"
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20 text-charcoal-900"
                />
              </div>
            </div>

            {/* Live Entity Preview & Stock Feedback Banner */}
            {(selectedBook || studentName) && (
              <div className="mt-2 p-3.5 rounded-2xl bg-burgundy-50/60 border border-burgundy-100/70 text-xs flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  {studentName && (
                    <p className="text-charcoal-700">
                      Borrower:{' '}
                      <strong className="text-burgundy-950 font-bold">{studentName}</strong>
                      {selectedStudent?.rollNumber && (
                        <span className="font-mono text-charcoal-500 text-[11px] ml-1">
                          (Roll: {selectedStudent.rollNumber})
                        </span>
                      )}
                    </p>
                  )}
                  {selectedBook && (
                    <p className="text-charcoal-700">
                      Book:{' '}
                      <strong className="text-burgundy-950 font-bold">{selectedBook.title}</strong>
                      <span className="text-charcoal-500 text-[11px] ml-1">
                        • {selectedBook.author} ({selectedBook.shelfLocation})
                      </span>
                    </p>
                  )}
                </div>

                {selectedBook && (
                  <div className="text-right shrink-0">
                    {selectedBook.availableQuantity > 0 ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[11px]">
                        <span>
                          Available Copies: {selectedBook.availableQuantity} →{' '}
                          {selectedBook.availableQuantity - 1} after issue
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-800 rounded-full font-bold text-[11px]">
                        <AlertCircle size={13} />
                        <span>Available Copies: 0 (Issue Blocked)</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Out-of-Stock Warning Alert */}
            {selectedBook && selectedBook.availableQuantity <= 0 && (
              <div className="mt-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-rose-600" />
                <span>
                  <strong>Warning:</strong> &quot;{selectedBook.title}&quot; currently has 0 available copies in the Books table. This book cannot be issued until a copy is returned.
                </span>
              </div>
            )}

            {/* Submit Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-4 border-t border-burgundy-50">
              <p className="text-xs text-charcoal-500">
                Saves issue details to the <code className="font-mono text-burgundy-900 font-bold">book_issues</code> table and reduces Available Copies by 1 in <code className="font-mono text-burgundy-900 font-bold">&quot;Books&quot;</code> table.
              </p>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !studentName.trim() ||
                  !bookId.trim() ||
                  (selectedBook !== undefined && selectedBook.availableQuantity <= 0)
                }
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-burgundy-900 via-burgundy-800 to-burgundy-950 hover:from-burgundy-800 hover:to-burgundy-900 text-white rounded-2xl font-bold text-xs shadow-burgundy-glow transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Processing Loan...</span>
                ) : (
                  <>
                    <BookPlus size={16} />
                    <span>Authorize & Issue Book</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* LOWER TWO-COLUMN SECTION: SELECTION PICKERS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* STEP 1: SELECT STUDENT QUICK PICKER */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-burgundy-100 shadow-soft flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-burgundy-800 text-white text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <h3 className="text-sm font-extrabold text-charcoal-900">
                      Select Registered Student
                    </h3>
                  </div>
                  {selectedStudent && (
                    <Badge variant="success" size="sm" dot>Selected</Badge>
                  )}
                </div>

                {/* Student Search Bar */}
                <div className="relative mb-3">
                  <Search size={16} className="absolute left-3.5 top-3.5 text-charcoal-400" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Filter student name or roll number..."
                    className="w-full text-xs pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                  />
                </div>

                {/* Students Selection List */}
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {filteredStudents.map((s) => {
                    const isSelected =
                      selectedStudentId === s.studentId ||
                      studentName.trim().toLowerCase() === s.name.toLowerCase();
                    return (
                      <div
                        key={s.id}
                        onClick={() => handlePickStudent(s)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-burgundy-50 border-burgundy-700 shadow-sm'
                            : 'bg-[#FAF7F7] border-burgundy-50 hover:bg-white hover:border-burgundy-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-burgundy-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {s.name[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-charcoal-900 truncate">{s.name}</p>
                            <p className="text-[10px] text-charcoal-500 font-mono">
                              Roll: {s.rollNumber} • {s.department.split(' ')[0]}
                            </p>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="studentRadio"
                          checked={isSelected}
                          onChange={() => handlePickStudent(s)}
                          className="text-burgundy-800 focus:ring-burgundy-700 cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedStudent && (
                <div className="mt-4 pt-3 border-t border-burgundy-50 text-xs text-charcoal-600 bg-burgundy-50/50 p-2.5 rounded-2xl">
                  Selected: <strong className="text-burgundy-950">{selectedStudent.name}</strong> ({selectedStudent.rollNumber})
                </div>
              )}
            </div>

            {/* STEP 2: SELECT BOOK QUICK PICKER */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-burgundy-100 shadow-soft flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-burgundy-800 text-white text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <h3 className="text-sm font-extrabold text-charcoal-900">
                      Select Book from Catalogue
                    </h3>
                  </div>
                  {selectedBook && (
                    <Badge variant={selectedBook.availableQuantity > 0 ? 'success' : 'danger'} size="sm" dot>
                      {selectedBook.availableQuantity > 0 ? 'Selected' : 'Out of Stock'}
                    </Badge>
                  )}
                </div>

                {/* Book Search Bar */}
                <div className="relative mb-3">
                  <Search size={16} className="absolute left-3.5 top-3.5 text-charcoal-400" />
                  <input
                    type="text"
                    value={bookSearch}
                    onChange={(e) => setBookSearch(e.target.value)}
                    placeholder="Filter title, author, ISBN or ID..."
                    className="w-full text-xs pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                  />
                </div>

                {/* Books Selection List */}
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {filteredBooks.map((b) => {
                    const isSelected =
                      selectedBookId === b.id ||
                      bookId.trim() === b.id ||
                      String(b.id) === bookId.trim();
                    const isOutOfStock = b.availableQuantity <= 0;

                    return (
                      <div
                        key={b.id}
                        onClick={() => handlePickBook(b)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-burgundy-50 border-burgundy-700 shadow-sm'
                            : isOutOfStock
                            ? 'bg-[#FAF7F7]/60 border-burgundy-50 opacity-70 hover:opacity-100'
                            : 'bg-[#FAF7F7] border-burgundy-50 hover:bg-white hover:border-burgundy-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-11 rounded-lg overflow-hidden bg-burgundy-950 shrink-0 border border-burgundy-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={b.coverImage} alt={b.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-charcoal-900 truncate">{b.title}</p>
                            <p className="text-[10px] text-charcoal-500 truncate">
                              ID: <span className="font-mono font-bold text-burgundy-900">{b.id}</span> • {b.author}
                            </p>
                          </div>
                        </div>

                        {isOutOfStock ? (
                          <Badge variant="danger" size="sm">0 Avail</Badge>
                        ) : (
                          <Badge variant="success" size="sm">{b.availableQuantity} Avail</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedBook && (
                <div className="mt-4 pt-3 border-t border-burgundy-50 text-xs text-charcoal-600 bg-burgundy-50/50 p-2.5 rounded-2xl flex items-center justify-between">
                  <span className="truncate">
                    Title: <strong className="text-burgundy-950">{selectedBook.title}</strong>
                  </span>
                  <span className="font-mono text-[11px] text-burgundy-900 font-bold shrink-0 ml-2">
                    ID: {selectedBook.id}
                  </span>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* ========================================================================= */}
        {/* BOOK ISSUE HISTORY SECTION (DYNAMIC SUPABASE BOOK_ISSUES DATA DISPLAY)    */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-burgundy-100 shadow-soft space-y-4">
          {/* Header & KPI Summary */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-burgundy-50">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-burgundy-800 text-white flex items-center justify-center shadow-sm shrink-0">
                <History size={16} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-charcoal-900">
                    Book Issue History
                  </h3>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-burgundy-50 text-burgundy-900 border border-burgundy-100">
                    Total Issued: {totalIssuedCount}
                  </span>
                </div>
                <p className="text-xs text-charcoal-500">
                  Comprehensive audit trail of all previous and currently issued library books
                </p>
              </div>
            </div>

            {/* Quick KPI Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F7] border border-burgundy-100 rounded-2xl text-charcoal-700 font-medium">
                <Users size={14} className="text-burgundy-800" />
                <span>Students Borrowed: <strong className="text-burgundy-950 font-bold">{uniqueStudentsCount}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 font-medium">
                <Clock size={14} className="text-amber-700" />
                <span>Active Loans: <strong className="font-bold">{activeLoansCount}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 font-medium">
                <CheckCircle2 size={14} className="text-emerald-700" />
                <span>Returned: <strong className="font-bold">{returnedCount}</strong></span>
              </div>
            </div>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3.5 top-3 text-charcoal-400" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search history by student name, roll no, book title, ID..."
                className="w-full text-xs pl-9 pr-4 py-2 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20 text-charcoal-900"
              />
            </div>

            <div className="flex items-center gap-1 bg-[#FAF7F7] p-1 rounded-2xl border border-burgundy-100">
              <button
                type="button"
                onClick={() => setHistoryStatusFilter('all')}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                  historyStatusFilter === 'all'
                    ? 'bg-burgundy-800 text-white shadow-sm'
                    : 'text-charcoal-600 hover:text-burgundy-950'
                }`}
              >
                All ({borrowRecords.length})
              </button>
              <button
                type="button"
                onClick={() => setHistoryStatusFilter('borrowed')}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                  historyStatusFilter === 'borrowed'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-charcoal-600 hover:text-amber-800'
                }`}
              >
                Issued ({activeLoansCount})
              </button>
              <button
                type="button"
                onClick={() => setHistoryStatusFilter('returned')}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                  historyStatusFilter === 'returned'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-charcoal-600 hover:text-emerald-800'
                }`}
              >
                Returned ({returnedCount})
              </button>
              <button
                type="button"
                onClick={() => setHistoryStatusFilter('overdue')}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                  historyStatusFilter === 'overdue'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-charcoal-600 hover:text-rose-800'
                }`}
              >
                Overdue ({borrowRecords.filter(r => r.status === 'overdue').length})
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-2xl border border-burgundy-100">
            <table className="w-full text-left text-xs text-charcoal-700">
              <thead className="bg-[#FAF7F7] border-b border-burgundy-100 text-[11px] font-extrabold uppercase tracking-wider text-charcoal-600">
                <tr>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-3">Student ID</th>
                  <th className="py-3 px-4">Book Name</th>
                  <th className="py-3 px-3">Book ID</th>
                  <th className="py-3 px-3">Issue Date</th>
                  <th className="py-3 px-3">Due Date</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4">Loan Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-burgundy-50">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-charcoal-400">
                      No issue records match the current filter.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((rec) => {
                    const isReturned = rec.status === 'returned';
                    const isOverdue = rec.status === 'overdue';

                    return (
                      <tr key={rec.id} className="hover:bg-burgundy-50/40 transition-colors">
                        {/* Student Name */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-charcoal-900 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-burgundy-100 text-burgundy-900 text-[10px] font-bold flex items-center justify-center shrink-0">
                              {rec.studentName ? rec.studentName[0] : 'S'}
                            </span>
                            <span className="truncate max-w-[150px]">{rec.studentName}</span>
                          </div>
                        </td>

                        {/* Student ID */}
                        <td className="py-3 px-3 font-mono font-medium text-charcoal-700">
                          {rec.rollNumber && rec.rollNumber !== 'N/A' ? rec.rollNumber : rec.studentId}
                        </td>

                        {/* Book Name */}
                        <td className="py-3 px-4">
                          <span className="font-semibold text-charcoal-900 block max-w-[220px] truncate" title={rec.bookTitle}>
                            {rec.bookTitle}
                          </span>
                        </td>

                        {/* Book ID */}
                        <td className="py-3 px-3 font-mono font-bold text-burgundy-900">
                          #{rec.bookId}
                        </td>

                        {/* Issue Date */}
                        <td className="py-3 px-3 whitespace-nowrap text-charcoal-600">
                          {rec.issueDate}
                        </td>

                        {/* Due Date */}
                        <td className="py-3 px-3 whitespace-nowrap font-medium text-charcoal-800">
                          {rec.dueDate}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {isReturned ? (
                            <Badge variant="success" size="sm" dot>Returned</Badge>
                          ) : isOverdue ? (
                            <Badge variant="danger" size="sm" dot>Overdue</Badge>
                          ) : (
                            <Badge variant="warning" size="sm" dot>Issued</Badge>
                          )}
                        </td>

                        {/* Loan Remarks */}
                        <td className="py-3 px-4 text-charcoal-500 max-w-[200px] truncate" title={rec.remarks}>
                          {rec.remarks || 'Standard Academic Term Loan'}
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
