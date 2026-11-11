'use client';

import React, { useState } from 'react';
import {
  BookmarkCheck,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Check,
  Calendar,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { SearchInput } from '@/components/common/SearchInput';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { PreBookRequest } from '@/types';

export default function AdminPreBookingsPage() {
  const { preBookings, updatePreBookStatus } = useLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'completed' | 'rejected'>('all');

  const [selectedRequest, setSelectedRequest] = useState<PreBookRequest | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [pickupDeadline, setPickupDeadline] = useState('');
  const [notes, setNotes] = useState('Reserved at Circulation Desk Counter 2.');

  const filteredRequests = preBookings.filter((p) => {
    const matchesSearch =
      p.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenApprove = (req: PreBookRequest) => {
    setSelectedRequest(req);
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 5);
    setPickupDeadline(deadline.toISOString().split('T')[0]);
    setIsApproveModalOpen(true);
  };

  const handleConfirmApprove = () => {
    if (!selectedRequest) return;
    updatePreBookStatus(selectedRequest.id, 'approved', pickupDeadline, notes);
    setIsApproveModalOpen(false);
  };

  const handleReject = (req: PreBookRequest) => {
    if (confirm(`Reject reservation request for "${req.bookTitle}" by ${req.studentName}?`)) {
      updatePreBookStatus(req.id, 'rejected', undefined, 'Copies allocated to academic course reserves.');
    }
  };

  const handleComplete = (req: PreBookRequest) => {
    updatePreBookStatus(req.id, 'completed', undefined, 'Book checked out to student.');
  };

  const getStatusBadge = (status: PreBookRequest['status']) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success" dot>Approved (Hold)</Badge>;
      case 'pending':
        return <Badge variant="warning" dot>Pending Review</Badge>;
      case 'completed':
        return <Badge variant="neutral">Completed / Picked Up</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopBar
        title="Pre-Book Reservations"
        subtitle="Manage Book Holds, Queue Approvals & Pickup Deadlines"
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search reservations by book, student, roll no..."
            />
          </div>

          {/* Status Filter Toggle */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-burgundy-100 shadow-soft overflow-x-auto">
            {(['all', 'pending', 'approved', 'completed', 'rejected'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-[11px] font-bold rounded-full capitalize whitespace-nowrap transition-all ${
                  statusFilter === st
                    ? 'bg-burgundy-800 text-white shadow-sm'
                    : 'text-charcoal-600 hover:text-burgundy-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-burgundy-100 shadow-soft">
            <BookmarkCheck size={36} className="mx-auto text-burgundy-300 mb-2" />
            <h4 className="text-sm font-bold text-charcoal-800 mb-1">No Reservations Found</h4>
            <p className="text-xs text-charcoal-500">
              No pre-booking requests currently match the selected status filter.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-burgundy-100/80 shadow-soft hover:shadow-soft-lg transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Left: Book Cover & Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-16 rounded-xl overflow-hidden bg-burgundy-950 shrink-0 border border-burgundy-100">
                    {req.bookCover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={req.bookCover} alt={req.bookTitle} className="w-full h-full object-cover" />
                    ) : null}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusBadge(req.status)}
                      <span className="text-[10px] text-charcoal-400 font-mono">
                        Req: {req.requestDate}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-charcoal-900 leading-tight truncate">
                      {req.bookTitle}
                    </h4>
                    <p className="text-xs text-charcoal-600 truncate mt-0.5">
                      Student: <strong className="text-charcoal-800">{req.studentName}</strong> ({req.rollNumber}) • {req.department.split(' ')[0]}
                    </p>

                    {req.pickupDeadline && (
                      <p className="text-[11px] text-emerald-700 font-medium mt-1">
                        Pickup Deadline: <strong>{req.pickupDeadline}</strong> ({req.notes})
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-0 border-burgundy-50">
                  {req.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleOpenApprove(req)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 active:scale-95 transition-all"
                      >
                        <Check size={14} />
                        <span>Approve Hold</span>
                      </button>
                      <button
                        onClick={() => handleReject(req)}
                        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold active:scale-95 transition-all"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {req.status === 'approved' && (
                    <button
                      onClick={() => handleComplete(req)}
                      className="px-4 py-2 bg-burgundy-800 hover:bg-burgundy-900 text-white rounded-xl text-xs font-bold shadow-burgundy-glow flex items-center gap-1.5 active:scale-95 transition-all"
                    >
                      <CheckCircle size={14} />
                      <span>Mark Fulfilled / Picked Up</span>
                    </button>
                  )}

                  {(req.status === 'completed' || req.status === 'rejected') && (
                    <span className="text-xs font-semibold text-charcoal-400">
                      Archive Record
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* APPROVE RESERVATION MODAL */}
        <Modal
          isOpen={isApproveModalOpen}
          onClose={() => setIsApproveModalOpen(false)}
          title="Approve Book Reservation"
          subtitle={`Hold book for: ${selectedRequest?.studentName}`}
        >
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900">
              Approving this request reserves one copy of <strong>&quot;{selectedRequest?.bookTitle}&quot;</strong> and notifies the student to collect it within the specified pickup window.
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                Pickup Deadline
              </label>
              <input
                type="date"
                value={pickupDeadline}
                onChange={(e) => setPickupDeadline(e.target.value)}
                className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                Desk Instructions / Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
              />
            </div>

            <div className="pt-3 border-t border-burgundy-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsApproveModalOpen(false)}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-charcoal-600 hover:bg-charcoal-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApprove}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-sm"
              >
                Confirm Approval & Hold
              </button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
}

