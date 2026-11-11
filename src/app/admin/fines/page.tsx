'use client';

import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  CheckCircle,
  AlertTriangle,
  Search,
  DollarSign,
  User,
  BookOpen,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { SearchInput } from '@/components/common/SearchInput';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { FineRecord } from '@/types';
import confetti from 'canvas-confetti';

export default function AdminFinesPage() {
  const { fines, payFine, addFine, students, stats } = useLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'paid'>('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: students[0]?.studentId || '',
    studentName: students[0]?.name || '',
    rollNumber: students[0]?.rollNumber || '',
    bookTitle: '',
    amount: 50,
    reason: 'Damaged Spine / Late return',
    dueDate: new Date().toISOString().split('T')[0],
    issuedDate: new Date().toISOString().split('T')[0],
    status: 'unpaid' as 'unpaid' | 'paid',
  });

  const totalOutstanding = fines
    .filter((f) => f.status === 'unpaid')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalCollected = fines
    .filter((f) => f.status === 'paid')
    .reduce((sum, f) => sum + f.amount, 0);

  const filteredFines = fines.filter((f) => {
    const matchesSearch =
      f.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.reason.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handlePay = (fineId: string) => {
    payFine(fineId);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#10B981', '#6E1129'],
    });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.bookTitle || formData.amount <= 0) {
      alert('Please enter valid book title and amount.');
      return;
    }
    const student = students.find((s) => s.studentId === formData.studentId);
    addFine({
      ...formData,
      studentName: student?.name || formData.studentName,
      rollNumber: student?.rollNumber || formData.rollNumber,
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopBar
        title="Fine & Penalty Management"
        subtitle="Late Return Penalties, Damage Assessments & Payment Receipts"
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-gradient-to-br from-burgundy-950 via-burgundy-900 to-burgundy-800 text-white shadow-2xl border border-burgundy-700/50">
            <span className="text-[11px] font-bold text-rose-200 uppercase tracking-wider block mb-1">
              Outstanding Dues
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">${totalOutstanding}</span>
              <span className="text-xs text-rose-200">unpaid penalties</span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-burgundy-100 shadow-soft">
            <span className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wider block mb-1">
              Total Cleared
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-600">${totalCollected}</span>
              <span className="text-xs text-charcoal-500">paid & settled</span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-burgundy-100 shadow-soft flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wider block mb-1">
                Fine Records
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-charcoal-900">{fines.length}</span>
                <span className="text-xs text-charcoal-500">total incidents</span>
              </div>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="py-2.5 px-4 bg-burgundy-800 hover:bg-burgundy-900 text-white rounded-2xl text-xs font-bold shadow-burgundy-glow flex items-center gap-1.5 active:scale-95"
            >
              <Plus size={15} />
              <span>Assess Fine</span>
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by student, book, or fine reason..."
            />
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-burgundy-100 shadow-soft">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all ${
                statusFilter === 'all'
                  ? 'bg-burgundy-800 text-white'
                  : 'text-charcoal-600 hover:text-burgundy-900'
              }`}
            >
              All Fines
            </button>
            <button
              onClick={() => setStatusFilter('unpaid')}
              className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all ${
                statusFilter === 'unpaid'
                  ? 'bg-rose-600 text-white'
                  : 'text-charcoal-600 hover:text-rose-700'
              }`}
            >
              Unpaid Dues
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all ${
                statusFilter === 'paid'
                  ? 'bg-emerald-600 text-white'
                  : 'text-charcoal-600 hover:text-emerald-700'
              }`}
            >
              Paid Receipts
            </button>
          </div>
        </div>

        {/* Fines Records Table / List */}
        {filteredFines.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-burgundy-100 shadow-soft">
            <Receipt size={36} className="mx-auto text-burgundy-300 mb-2" />
            <h4 className="text-sm font-bold text-charcoal-800 mb-1">No Fines in this Filter</h4>
            <p className="text-xs text-charcoal-500">
              No outstanding dues or penalties recorded under this query.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFines.map((f) => {
              const isUnpaid = f.status === 'unpaid';
              return (
                <div
                  key={f.id}
                  className="bg-white rounded-3xl p-4 sm:p-5 border border-burgundy-100/80 shadow-soft hover:shadow-soft-lg transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                        isUnpaid
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      ${f.amount}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={isUnpaid ? 'danger' : 'success'} size="sm" dot>
                          {isUnpaid ? 'Unpaid Fine' : 'Cleared & Paid'}
                        </Badge>
                        <span className="text-[10px] text-charcoal-400">
                          Issued: {f.issuedDate}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-charcoal-900 truncate">
                        {f.reason}
                      </h4>
                      <p className="text-xs text-charcoal-600 truncate mt-0.5">
                        Student: <strong className="text-charcoal-800">{f.studentName}</strong> ({f.rollNumber})
                      </p>
                      <p className="text-[11px] text-charcoal-500 font-medium">
                        Title: {f.bookTitle}
                      </p>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-0 border-burgundy-50">
                    {isUnpaid ? (
                      <button
                        onClick={() => handlePay(f.id)}
                        className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                      >
                        <CheckCircle size={14} />
                        <span>Record Payment (${f.amount})</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        Paid on {f.paidDate || 'Today'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ASSESS MANUAL FINE MODAL */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Assess Manual Penalty"
          subtitle="Record fine for damaged, missing, or special loan violations"
        >
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                Select Student *
              </label>
              <select
                value={formData.studentId}
                onChange={(e) => {
                  const student = students.find((s) => s.studentId === e.target.value);
                  setFormData({
                    ...formData,
                    studentId: e.target.value,
                    studentName: student?.name || '',
                    rollNumber: student?.rollNumber || '',
                  });
                }}
                className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.studentId}>
                    {s.name} ({s.rollNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                Book Title *
              </label>
              <input
                type="text"
                required
                value={formData.bookTitle}
                onChange={(e) => setFormData({ ...formData, bookTitle: e.target.value })}
                placeholder="e.g. Clean Architecture"
                className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                Penalty Amount ($) *
              </label>
              <input
                type="number"
                min="5"
                step="5"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                Reason for Fine *
              </label>
              <input
                type="text"
                required
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="e.g. Water damage to pages 40-55"
                className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
              />
            </div>

            <div className="pt-3 border-t border-burgundy-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-charcoal-600 hover:bg-charcoal-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-burgundy-800 hover:bg-burgundy-900 text-white rounded-2xl text-xs font-bold shadow-burgundy-glow"
              >
                Submit Fine Assessment
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
}

