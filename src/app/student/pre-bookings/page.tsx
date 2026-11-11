'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  BookmarkCheck,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Sparkles,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';
import { useAuth } from '@/context/AuthContext';
import { StudentTopBar } from '@/components/student/StudentTopBar';
import { Badge } from '@/components/common/Badge';

export default function StudentPreBookingsPage() {
  const router = useRouter();
  const { preBookings, updatePreBookStatus } = useLibrary();
  const { user } = useAuth();
  const currentStudentId = user?.studentId || user?.id || '';

  const myReservations = preBookings.filter((p) => p.studentId === currentStudentId);

  const handleCancel = (id: string, title: string) => {
    if (confirm(`Cancel reservation for "${title}"?`)) {
      updatePreBookStatus(id, 'cancelled', undefined, 'Cancelled by student');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success" dot>Ready for Pickup</Badge>;
      case 'pending':
        return <Badge variant="warning" dot>Pending Librarian Approval</Badge>;
      case 'completed':
        return <Badge variant="neutral">Checked Out / Completed</Badge>;
      case 'rejected':
        return <Badge variant="danger">Not Available</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <StudentTopBar
        title="Pre Book"
        subtitle="Pre-Book Requests, Pickup Holds & Queue Status"
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto w-full">
        {/* Info card */}
        <div className="p-4 rounded-3xl bg-[#FFF9F6] border border-burgundy-100 shadow-soft flex items-start gap-3">
          <BookmarkCheck size={20} className="text-burgundy-800 shrink-0 mt-0.5" />
          <p className="text-xs text-charcoal-700 leading-relaxed">
            <strong className="text-burgundy-950 font-bold">Smart Reserve Policy:</strong> When your pre-book reservation is approved, the library holds the book exclusively for you for 5 days. Present your digital pass at the circulation desk counter to check it out.
          </p>
        </div>

        {myReservations.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-burgundy-100 shadow-soft">
            <BookmarkCheck size={40} className="mx-auto text-burgundy-300 mb-3" />
            <h4 className="text-base font-bold text-charcoal-800 mb-1">No Active Reservations</h4>
            <p className="text-xs text-charcoal-500 mb-4 max-w-sm mx-auto">
              You haven&apos;t reserved any books yet. You can pre-book titles in advance from the catalogue.
            </p>
            <button
              onClick={() => router.push('/student/books')}
              className="px-5 py-2.5 bg-burgundy-800 text-white rounded-2xl text-xs font-bold shadow-burgundy-glow"
            >
              Browse Catalogue to Reserve
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {myReservations.map((p) => {
              const isApproved = p.status === 'approved';
              const isPending = p.status === 'pending';

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-3xl p-5 border border-burgundy-100 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-20 rounded-2xl overflow-hidden bg-burgundy-950 shrink-0 border border-burgundy-100 shadow-sm">
                      {p.bookCover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.bookCover} alt={p.bookTitle} className="w-full h-full object-cover" />
                      ) : null}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusBadge(p.status)}
                        <span className="text-[10px] text-charcoal-400 font-mono">
                          Requested: {p.requestDate}
                        </span>
                      </div>

                      <h4 className="text-sm font-extrabold text-charcoal-900 leading-tight truncate">
                        {p.bookTitle}
                      </h4>
                      <p className="text-xs text-charcoal-600 mt-0.5 truncate">
                        by {p.author}
                      </p>

                      {isApproved && (
                        <div className="mt-2 p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                          Hold Active! Collect before: <strong className="underline">{p.pickupDeadline || '5 days'}</strong>. ({p.notes})
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-full sm:w-auto flex items-center justify-end gap-2 pt-3 sm:pt-0 border-t sm:border-0 border-burgundy-50">
                    {isPending && (
                      <button
                        onClick={() => handleCancel(p.id, p.bookTitle)}
                        className="px-3.5 py-1.5 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold transition-all"
                      >
                        Cancel Request
                      </button>
                    )}

                    {isApproved && (
                      <button
                        onClick={() => router.push('/student/membership')}
                        className="px-4 py-2 bg-burgundy-800 hover:bg-burgundy-900 text-white rounded-xl text-xs font-bold shadow-burgundy-glow"
                      >
                        Show Pass at Desk
                      </button>
                    )}
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

