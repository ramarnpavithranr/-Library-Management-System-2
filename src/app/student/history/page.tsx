'use client';

import React, { useState } from 'react';
import {
  History,
  Search,
  CheckCircle2,
  Clock,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';
import { StudentTopBar } from '@/components/student/StudentTopBar';
import { SearchInput } from '@/components/common/SearchInput';
import { Badge } from '@/components/common/Badge';

export default function StudentHistoryPage() {
  const { user } = useAuth();
  const { borrowRecords } = useLibrary();

  const currentStudentId = user?.studentId || user?.id || '';
  const myHistory = borrowRecords.filter((r) => r.studentId === currentStudentId);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'borrowed' | 'returned' | 'overdue'>('all');

  const filteredHistory = myHistory.filter((r) => {
    const matchesSearch =
      r.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.issueDate.includes(searchQuery) ||
      r.dueDate.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 flex flex-col">
      <StudentTopBar
        title="Borrowing History"
        subtitle="Complete Reading Log & Circulation Records"
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by book title or date..."
            />
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-burgundy-100 shadow-soft overflow-x-auto">
            {(['all', 'borrowed', 'returned', 'overdue'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-xs font-bold rounded-full capitalize transition-all ${
                  statusFilter === st
                    ? 'bg-burgundy-800 text-white'
                    : 'text-charcoal-600 hover:text-burgundy-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* List of past borrowing records */}
        {filteredHistory.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-burgundy-100 shadow-soft">
            <History size={40} className="mx-auto text-burgundy-300 mb-3" />
            <h4 className="text-base font-bold text-charcoal-800 mb-1">No Records Found</h4>
            <p className="text-xs text-charcoal-500">
              No previous book checkouts matched your search criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-burgundy-100 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-16 rounded-xl overflow-hidden bg-burgundy-950 shrink-0 border border-burgundy-100 shadow-sm">
                    {item.bookCover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.bookCover} alt={item.bookTitle} className="w-full h-full object-cover" />
                    ) : null}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={
                          item.status === 'returned'
                            ? 'success'
                            : item.status === 'overdue'
                            ? 'danger'
                            : 'burgundy'
                        }
                        size="sm"
                        dot
                      >
                        {item.status}
                      </Badge>
                      <span className="text-[10px] text-charcoal-400">
                        Loaned on {item.issueDate}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-charcoal-900 leading-tight truncate">
                      {item.bookTitle}
                    </h4>

                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-charcoal-500">
                      <span>Due: <strong>{item.dueDate}</strong></span>
                      {item.returnDate && (
                        <span>Returned: <strong className="text-emerald-700">{item.returnDate}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-auto text-left sm:text-right pt-2 sm:pt-0 border-t sm:border-0 border-burgundy-50">
                  <span className="text-xs text-charcoal-500 block">Fine Status:</span>
                  <span className="text-xs font-mono font-bold text-charcoal-800">
                    {item.fineAmount > 0 ? `$${item.fineAmount} (${item.fineStatus})` : '$0.00 (None)'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

