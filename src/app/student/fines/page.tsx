'use client';

import React, { useState } from 'react';
import {
  Receipt,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';
import { StudentTopBar } from '@/components/student/StudentTopBar';
import { StatCard } from '@/components/common/StatCard';
import { Badge } from '@/components/common/Badge';

export default function StudentFinesPage() {
  const { user } = useAuth();
  const { fines } = useLibrary();

  const currentStudentId = user?.studentId || user?.id || '';
  const myFines = fines.filter((f) => f.studentId === currentStudentId);

  const unpaidFines = myFines.filter((f) => f.status === 'unpaid');
  const paidFines = myFines.filter((f) => f.status === 'paid');
  const totalUnpaid = unpaidFines.reduce((sum, f) => sum + f.amount, 0);
  const totalPaid = paidFines.reduce((sum, f) => sum + f.amount, 0);

  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('all');

  const displayedFines = myFines.filter((f) => {
    if (filter === 'unpaid') return f.status === 'unpaid';
    if (filter === 'paid') return f.status === 'paid';
    return true;
  });

  return (
    <div className="flex-1 flex flex-col">
      <StudentTopBar
        title="Fines & Penalties"
        subtitle="Late Return Assessments, Receipts & Clearance"
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto w-full">
        {/* Fine Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            title="Current Outstanding Dues"
            value={`$${totalUnpaid}`}
            subtitle={totalUnpaid > 0 ? 'Requires counter payment' : 'No overdue dues'}
            icon={Receipt}
            variant={totalUnpaid > 0 ? 'burgundy' : 'white'}
          />
          <StatCard
            title="Previously Settled Fines"
            value={`$${totalPaid}`}
            subtitle={`${paidFines.length} receipts archived`}
            icon={CheckCircle}
            variant="cream"
          />
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-burgundy-100 shadow-soft">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all ${
                filter === 'all'
                  ? 'bg-burgundy-800 text-white'
                  : 'text-charcoal-600 hover:text-burgundy-900'
              }`}
            >
              All Records ({myFines.length})
            </button>
            <button
              onClick={() => setFilter('unpaid')}
              className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all ${
                filter === 'unpaid'
                  ? 'bg-rose-600 text-white'
                  : 'text-charcoal-600 hover:text-rose-700'
              }`}
            >
              Unpaid (${totalUnpaid})
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all ${
                filter === 'paid'
                  ? 'bg-emerald-600 text-white'
                  : 'text-charcoal-600 hover:text-emerald-700'
              }`}
            >
              Paid Receipts ({paidFines.length})
            </button>
          </div>
        </div>

        {/* Fines List */}
        {displayedFines.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-burgundy-100 shadow-soft">
            <CheckCircle size={40} className="mx-auto text-emerald-500 mb-3" />
            <h4 className="text-base font-bold text-charcoal-800 mb-1">
              {filter === 'unpaid' ? 'No Outstanding Fines!' : 'No Records in this Filter'}
            </h4>
            <p className="text-xs text-charcoal-500">
              Your library account has no unaddressed overdue penalties.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedFines.map((f) => {
              const isUnpaid = f.status === 'unpaid';
              return (
                <div
                  key={f.id}
                  className="bg-white rounded-3xl p-5 border border-burgundy-100 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                        isUnpaid
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      ${f.amount}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={isUnpaid ? 'danger' : 'success'} size="sm" dot>
                          {isUnpaid ? 'Unpaid Fine' : 'Paid & Cleared'}
                        </Badge>
                        <span className="text-[10px] text-charcoal-400">
                          Due Date: {f.dueDate}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-charcoal-900 leading-tight">
                        {f.reason}
                      </h4>
                      <p className="text-xs text-charcoal-600 mt-0.5">
                        Title: <strong>{f.bookTitle}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto text-left sm:text-right pt-3 sm:pt-0 border-t sm:border-0 border-burgundy-50">
                    {isUnpaid ? (
                      <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 inline-block">
                        Pay at Accounts Desk Counter 2
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 inline-block">
                        Cleared on {f.paidDate || 'Recent'}
                      </span>
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

