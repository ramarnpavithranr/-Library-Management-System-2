'use client';

import React, { useState, useEffect } from 'react';
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
  History,
  BookOpen,
  Users,
} from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { SearchInput } from '@/components/common/SearchInput';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { PreBookRequest } from '@/types';

export default function AdminPreBookingsPage() {
  const { preBookings, updatePreBookStatus, refreshPreBookings } = useLibrary();

  useEffect(() => {
    refreshPreBookings();
    const interval = setInterval(() => {
      refreshPreBookings();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'completed' | 'rejected'>('all');

  const [selectedRequest, setSelectedRequest] = useState<PreBookRequest | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [pickupDeadline, setPickupDeadline] = useState('');
  const [notes, setNotes] = useState('Reserved at Circulation Desk Counter 2.');
  const [rejectReason, setRejectReason] = useState('All circulating copies checked out. Allocated to academic reserve.');
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const filteredRequests = preBookings.filter((p) => {
    const matchesSearch =
      p.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const [historySearch, setHistorySearch] = useState('');

  const totalPreBookings = preBookings.length;
  const totalApproved = preBookings.filter((p) => p.status === 'approved' || p.status === 'completed').length;
  const totalRejected = preBookings.filter((p) => p.status === 'rejected').length;
  const totalPending = preBookings.filter((p) => p.status === 'pending').length;

  const filteredHistoryPreBookings = preBookings.filter((p) => {
    const q = historySearch.toLowerCase().trim();
    if (!q) return true;
    return (
      p.studentName.toLowerCase().includes(q) ||
      p.rollNumber.toLowerCase().includes(q) ||
      p.studentId.toLowerCase().includes(q) ||
      p.bookTitle.toLowerCase().includes(q) ||
      p.bookId.toLowerCase().includes(q)
    );
  });

  const handleOpenApprove = (req: PreBookRequest) => {
    setSelectedRequest(req);
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 5);
    setPickupDeadline(deadline.toISOString().split('T')[0]);
    setNotes('Reserved at Circulation Desk Counter 2.');
    setIsApproveModalOpen(true);
  };

  const handleConfirmApprove = () => {
    if (!selectedRequest) return;
    updatePreBookStatus(selectedRequest.id, 'approved', pickupDeadline, notes);
    setIsApproveModalOpen(false);
    setActionFeedback({
      type: 'success',
      message: `Reservation for "${selectedRequest.bookTitle}" by ${selectedRequest.studentName} approved successfully. Pickup hold set until ${pickupDeadline}.`,
    });
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleOpenReject = (req: PreBookRequest) => {
    setSelectedRequest(req);
    setRejectReason('All circulating copies checked out. Allocated to academic reserve.');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!selectedRequest) return;
    updatePreBookStatus(selectedRequest.id, 'rejected', undefined, rejectReason.trim());
    setIsRejectModalOpen(false);
    setActionFeedback({
      type: 'success',
      message: `Reservation request for "${selectedRequest.bookTitle}" by ${selectedRequest.studentName} has been Rejected. Status updated across portals.`,
    });
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleComplete = (req: PreBookRequest) => {
    updatePreBookStatus(req.id, 'completed', undefined, 'Book checked out to student.');
    setActionFeedback({
      type: 'success',
      message: `Reservation for "${req.bookTitle}" marked as Fulfilled / Picked Up.`,
    });
    setTimeout(() => setActionFeedback(null), 4000);
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
        return <Badge variant="danger" dot>Rejected</Badge>;
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
        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div
            className={`p-4 rounded-2xl flex items-center gap-2.5 text-xs font-bold shadow-sm animate-in fade-in duration-200 ${
              actionFeedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {actionFeedback.type === 'success' ? (
              <CheckCircle size={16} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
            )}
            <span>{actionFeedback.message}</span>
          </div>
        )}

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
                    {req.status === 'rejected' && req.notes && (
                      <p className="text-[11px] text-rose-700 font-medium mt-1">
                        Rejection Reason: <strong>{req.notes}</strong>
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
                        onClick={() => handleOpenReject(req)}
                        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold active:scale-95 transition-all flex items-center gap-1"
                      >
                        <XCircle size={14} />
                        <span>Reject</span>
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

                  {req.status === 'rejected' && (
                    <span className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-[11px] font-bold text-rose-700">
                      Request Rejected
                    </span>
                  )}

                  {req.status === 'completed' && (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700">
                      Fulfilled & Archived
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========================================================================= */}
        {/* PRE-BOOKING HISTORY SECTION (DYNAMIC DATABASE RESERVATIONS LOG)           */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-burgundy-100 shadow-soft space-y-4">
          {/* Header & KPI Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-burgundy-50">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-burgundy-800 text-white flex items-center justify-center shadow-sm shrink-0">
                <BookmarkCheck size={16} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-charcoal-900">
                    Pre-Booking History
                  </h3>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-burgundy-50 text-burgundy-900 border border-burgundy-100">
                    Total Pre-Bookings: {totalPreBookings}
                  </span>
                </div>
                <p className="text-xs text-charcoal-500">
                  Full reservation registry retaining all student pre-booking records and approval histories
                </p>
              </div>
            </div>

            {/* Totals Badges: Total, Total Approved, Total Rejected */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F7] border border-burgundy-100 rounded-2xl text-charcoal-700 font-medium">
                <BookmarkCheck size={14} className="text-burgundy-800" />
                <span>Total: <strong className="text-burgundy-950 font-bold">{totalPreBookings}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 font-medium">
                <CheckCircle size={14} className="text-emerald-700" />
                <span>Approved: <strong className="font-bold">{totalApproved}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 font-medium">
                <XCircle size={14} className="text-rose-700" />
                <span>Rejected: <strong className="font-bold">{totalRejected}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 font-medium">
                <Clock size={14} className="text-amber-700" />
                <span>Pending: <strong className="font-bold">{totalPending}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Search inside Pre-Booking History */}
          <div className="flex items-center justify-between gap-3 pt-1">
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
                  <th className="py-3 px-3">Pre-Booking Date</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4">Approval Date / Deadline</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-burgundy-50">
                {filteredHistoryPreBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-charcoal-400">
                      No pre-booking records match the search filter.
                    </td>
                  </tr>
                ) : (
                  filteredHistoryPreBookings.map((req) => (
                    <tr key={req.id} className="hover:bg-burgundy-50/40 transition-colors">
                      {/* Student Name */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-charcoal-900 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-burgundy-100 text-burgundy-900 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {req.studentName ? req.studentName[0] : 'S'}
                          </span>
                          <span className="truncate max-w-[150px]">{req.studentName}</span>
                        </div>
                      </td>

                      {/* Student ID */}
                      <td className="py-3 px-3 font-mono font-medium text-charcoal-700">
                        {req.rollNumber || req.studentId}
                      </td>

                      {/* Book Name */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-charcoal-900 block max-w-[220px] truncate" title={req.bookTitle}>
                          {req.bookTitle}
                        </span>
                      </td>

                      {/* Book ID */}
                      <td className="py-3 px-3 font-mono font-bold text-burgundy-900">
                        #{req.bookId}
                      </td>

                      {/* Pre-Booking Date */}
                      <td className="py-3 px-3 whitespace-nowrap text-charcoal-600">
                        {req.requestDate}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {getStatusBadge(req.status)}
                      </td>

                      {/* Approval Date / Hold Deadline */}
                      <td className="py-3 px-4 whitespace-nowrap text-charcoal-700">
                        {req.pickupDeadline ? (
                          <span className="font-semibold text-emerald-800">Hold: {req.pickupDeadline}</span>
                        ) : req.status === 'rejected' ? (
                          <span className="text-rose-600">Rejected</span>
                        ) : (
                          <span className="text-charcoal-400">Pending Review</span>
                        )}
                      </td>

                      {/* Notes / Remarks */}
                      <td className="py-3 px-4 text-charcoal-500 max-w-[200px] truncate" title={req.notes}>
                        {req.notes || 'Standard Reservation'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

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

        {/* REJECT RESERVATION MODAL */}
        <Modal
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          title="Reject Book Reservation"
          subtitle={`Reject request for: ${selectedRequest?.studentName}`}
        >
          <div className="space-y-4">
            <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-900">
              Rejecting this request will mark the reservation as <strong>Rejected</strong> and update the student&apos;s status immediately.
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                Select or Type Reason for Rejection
              </label>
              <div className="space-y-2 mb-2">
                {[
                  'All circulating copies checked out. Allocated to academic reserve.',
                  'Book undergoing binding or physical preservation maintenance.',
                  'Maximum student reservation quota reached for this semester.',
                  'Reserved for reference section counter study only.',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRejectReason(preset)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      rejectReason === preset
                        ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold'
                        : 'bg-[#FAF7F7] border-burgundy-100 text-charcoal-700 hover:bg-white'
                    }`}
                  >
                    • {preset}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Custom rejection reason..."
                className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-rose-700/20"
              />
            </div>

            <div className="pt-3 border-t border-burgundy-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-charcoal-600 hover:bg-charcoal-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
}

