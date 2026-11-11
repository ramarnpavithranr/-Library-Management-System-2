'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { Badge } from '@/components/common/Badge';
import confetti from 'canvas-confetti';
import { ENV } from '@/config/env';

export default function AdminIssueBookPage() {
  const router = useRouter();
  const { students, books, issueBook, stats } = useLibrary();

  // Search queries for selectors
  const [studentSearch, setStudentSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');

  // Selected entities
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');

  // Dates
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultDue = new Date();
  defaultDue.setDate(defaultDue.getDate() + ENV.DEFAULT_LOAN_DAYS);
  const defaultDueStr = defaultDue.toISOString().split('T')[0];

  const [issueDate, setIssueDate] = useState(todayStr);
  const [dueDate, setDueDate] = useState(defaultDueStr);
  const [remarks, setRemarks] = useState('Standard Academic Term Loan');

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

  // Filter books (only in stock)
  const filteredBooks = books.filter(
    (b) =>
      b.availableQuantity > 0 &&
      (b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
        b.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
        b.isbn.includes(bookSearch))
  );

  const selectedStudent = students.find((s) => s.studentId === selectedStudentId);
  const selectedBook = books.find((b) => b.id === selectedBookId);

  const handleIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setMessage({ type: 'error', text: 'Please select a registered student.' });
      return;
    }
    if (!selectedBookId) {
      setMessage({ type: 'error', text: 'Please select an available book.' });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = issueBook(selectedStudentId, selectedBookId, dueDate, remarks);
      setIsSubmitting(false);

      if (res.success) {
        setMessage({ type: 'success', text: res.message });
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#6E1129', '#B42244', '#10B981'],
        });
        // Reset selections
        setSelectedBookId('');
      } else {
        setMessage({ type: 'error', text: res.message });
      }
    }, 300);
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
              className="text-xs font-bold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <form onSubmit={handleIssue} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* STEP 1: SELECT STUDENT */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-burgundy-100 shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-burgundy-800 text-white text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <h3 className="text-sm font-extrabold text-charcoal-900">
                    Select Student
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
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {filteredStudents.map((s) => {
                  const isSelected = selectedStudentId === s.studentId;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedStudentId(s.studentId)}
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
                          <p className="text-[10px] text-charcoal-500 font-mono">Roll: {s.rollNumber} • {s.department.split(' ')[0]}</p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        checked={isSelected}
                        onChange={() => setSelectedStudentId(s.studentId)}
                        className="text-burgundy-800 focus:ring-burgundy-700"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedStudent && (
              <div className="mt-4 pt-3 border-t border-burgundy-50 text-xs text-charcoal-600 bg-burgundy-50/50 p-2.5 rounded-2xl">
                Borrower: <strong className="text-burgundy-950">{selectedStudent.name}</strong> ({selectedStudent.rollNumber})
              </div>
            )}
          </div>

          {/* STEP 2: SELECT BOOK */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-burgundy-100 shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-burgundy-800 text-white text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <h3 className="text-sm font-extrabold text-charcoal-900">
                    Select Available Book
                  </h3>
                </div>
                {selectedBook && (
                  <Badge variant="success" size="sm" dot>Selected</Badge>
                )}
              </div>

              {/* Book Search Bar */}
              <div className="relative mb-3">
                <Search size={16} className="absolute left-3.5 top-3.5 text-charcoal-400" />
                <input
                  type="text"
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  placeholder="Filter title, author or ISBN..."
                  className="w-full text-xs pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
              </div>

              {/* Books Selection List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {filteredBooks.map((b) => {
                  const isSelected = selectedBookId === b.id;
                  return (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBookId(b.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-burgundy-50 border-burgundy-700 shadow-sm'
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
                          <p className="text-[10px] text-charcoal-500 truncate">{b.author} • {b.shelfLocation}</p>
                        </div>
                      </div>
                      <Badge variant="success" size="sm">{b.availableQuantity} Avail</Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedBook && (
              <div className="mt-4 pt-3 border-t border-burgundy-50 text-xs text-charcoal-600 bg-burgundy-50/50 p-2.5 rounded-2xl">
                Title: <strong className="text-burgundy-950">{selectedBook.title}</strong> ({selectedBook.shelfLocation})
              </div>
            )}
          </div>

          {/* STEP 3 & 4: DATES & CONFIRMATION (Full width) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-burgundy-100 shadow-soft">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-burgundy-800 text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h3 className="text-sm font-extrabold text-charcoal-900">
                Loan Dates & Confirmation
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Due Date (14 Days Standard)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Loan Remarks
                </label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Course Project reference"
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-burgundy-50">
              <p className="text-xs text-charcoal-500">
                Issuing updates live stock counts and notifies the student immediately.
              </p>

              <button
                type="submit"
                disabled={isSubmitting || !selectedStudentId || !selectedBookId}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-burgundy-900 via-burgundy-800 to-burgundy-950 hover:from-burgundy-800 hover:to-burgundy-900 text-white rounded-2xl font-bold text-xs shadow-burgundy-glow transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
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
        </form>
      </main>
    </div>
  );
}

