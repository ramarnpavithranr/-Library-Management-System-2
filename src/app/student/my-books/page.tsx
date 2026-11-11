'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  BookMarked,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';
import { useAuth } from '@/context/AuthContext';
import { StudentTopBar } from '@/components/student/StudentTopBar';
import { Badge } from '@/components/common/Badge';
import { ENV } from '@/config/env';

export default function StudentMyBooksPage() {
  const router = useRouter();
  const { borrowRecords } = useLibrary();
  const { user } = useAuth();
  const currentStudentId = user?.studentId || user?.id || '';

  // Active loans for this student
  const activeLoans = borrowRecords.filter(
    (r) => r.studentId === currentStudentId && r.status !== 'returned'
  );

  return (
    <div className="flex-1 flex flex-col">
      <StudentTopBar
        title="Books"
        subtitle="Active Loans, Due Dates & Circulation Guidelines"
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
        {/* Circulation Limit Notice */}
        <div className="p-4 rounded-3xl bg-[#FFF9F6] border border-burgundy-100 shadow-soft flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-burgundy-800 text-white flex items-center justify-center font-bold text-sm">
              {activeLoans.length}/{ENV.MAX_BOOKS_PER_STUDENT}
            </div>
            <div>
              <p className="text-xs font-bold text-charcoal-900">
                Active Loan Allocation
              </p>
              <p className="text-[11px] text-charcoal-500">
                You have {Math.max(0, ENV.MAX_BOOKS_PER_STUDENT - activeLoans.length)} remaining borrowing slots available on your student pass.
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push('/student/books')}
            className="px-3.5 py-1.5 bg-burgundy-800 text-white rounded-full text-xs font-bold shadow-burgundy-glow"
          >
            Borrow More
          </button>
        </div>

        {/* Active Loans List */}
        {activeLoans.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-burgundy-100 shadow-soft">
            <BookMarked size={40} className="mx-auto text-burgundy-300 mb-3" />
            <h4 className="text-base font-bold text-charcoal-800 mb-1">No Books Currently Borrowed</h4>
            <p className="text-xs text-charcoal-500 mb-4 max-w-sm mx-auto">
              You do not have any active volumes checked out. Browse our smart catalogue to reserve or issue titles.
            </p>
            <button
              onClick={() => router.push('/student/books')}
              className="px-5 py-2.5 bg-burgundy-800 text-white rounded-2xl text-xs font-bold shadow-burgundy-glow"
            >
              Explore Catalogue
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {activeLoans.map((loan) => {
              const dueTime = new Date(loan.dueDate).getTime();
              const nowTime = new Date().getTime();
              const diffDays = Math.ceil((dueTime - nowTime) / (1000 * 60 * 60 * 24));
              const isOverdue = diffDays < 0;

              return (
                <div
                  key={loan.id}
                  className="bg-white rounded-3xl p-5 border border-burgundy-100/90 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-16 h-22 rounded-2xl overflow-hidden bg-burgundy-950 shrink-0 border border-burgundy-100 shadow-sm">
                      {loan.bookCover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={loan.bookCover} alt={loan.bookTitle} className="w-full h-full object-cover" />
                      ) : null}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {isOverdue ? (
                          <Badge variant="danger" size="sm" dot>Overdue by {Math.abs(diffDays)} Days</Badge>
                        ) : (
                          <Badge variant="success" size="sm" dot>{diffDays} Days Remaining</Badge>
                        )}
                      </div>

                      <h4 className="text-sm sm:text-base font-extrabold text-charcoal-900 leading-tight">
                        {loan.bookTitle}
                      </h4>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-charcoal-500">
                        <span>Issued: <strong>{loan.issueDate}</strong></span>
                        <span>Due: <strong className={isOverdue ? 'text-rose-600' : 'text-burgundy-900'}>{loan.dueDate}</strong></span>
                      </div>

                      {isOverdue && loan.fineAmount > 0 && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-rose-50 text-rose-700 font-bold text-[11px] border border-rose-200">
                          <AlertTriangle size={12} />
                          <span>Accrued Fine: ${loan.fineAmount}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-full sm:w-auto flex flex-col sm:items-end justify-center pt-3 sm:pt-0 border-t sm:border-0 border-burgundy-50">
                    <span className="text-[11px] text-charcoal-500 mb-1.5">
                      Return at Circulation Desk Counter 1
                    </span>
                    <button
                      onClick={() => alert(`To return "${loan.bookTitle}", present your digital membership pass at circulation desk counter 1.`)}
                      className="px-4 py-2 bg-burgundy-50 hover:bg-burgundy-100 text-burgundy-900 rounded-xl text-xs font-bold border border-burgundy-200 active:scale-95 transition-all text-center"
                    >
                      Return Instructions
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

