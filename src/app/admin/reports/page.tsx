'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Download,
  Calendar,
  BookOpen,
  Users,
  RotateCcw,
  Receipt,
  CreditCard,
  Printer,
  Sparkles,
} from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { StatCard } from '@/components/common/StatCard';
import { Badge } from '@/components/common/Badge';

export default function AdminReportsPage() {
  const { stats, books, categories, borrowRecords, fines, memberships, preBookings } = useLibrary();

  const [reportType, setReportType] = useState<'circulation' | 'categories' | 'fines' | 'memberships'>('circulation');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopBar
        title="Reports & Visual Analytics"
        subtitle="Institutional Circulation Reports, Fine Tracking & Inventory Metrics"
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Top Control Bar: Report Switcher & Export */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-full border border-burgundy-100 shadow-soft overflow-x-auto">
            <button
              onClick={() => setReportType('circulation')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all ${
                reportType === 'circulation'
                  ? 'bg-burgundy-800 text-white shadow-sm'
                  : 'text-charcoal-600 hover:text-burgundy-900'
              }`}
            >
              Circulation Report
            </button>
            <button
              onClick={() => setReportType('categories')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all ${
                reportType === 'categories'
                  ? 'bg-burgundy-800 text-white shadow-sm'
                  : 'text-charcoal-600 hover:text-burgundy-900'
              }`}
            >
              Category Inventory
            </button>
            <button
              onClick={() => setReportType('fines')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all ${
                reportType === 'fines'
                  ? 'bg-burgundy-800 text-white shadow-sm'
                  : 'text-charcoal-600 hover:text-burgundy-900'
              }`}
            >
              Fines & Overdue
            </button>
            <button
              onClick={() => setReportType('memberships')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all ${
                reportType === 'memberships'
                  ? 'bg-burgundy-800 text-white shadow-sm'
                  : 'text-charcoal-600 hover:text-burgundy-900'
              }`}
            >
              Memberships
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="py-2.5 px-4 bg-white border border-burgundy-200 hover:bg-cream-100 text-charcoal-800 rounded-full text-xs font-bold shadow-soft flex items-center gap-2 active:scale-95"
            >
              <Printer size={15} />
              <span>Print Report</span>
            </button>
          </div>
        </div>

        {/* Dynamic Report Content */}
        {reportType === 'circulation' && (
          <div className="space-y-6">
            {/* Visual Circulation Bar Breakdown */}
            <div className="bg-white rounded-3xl p-6 border border-burgundy-100 shadow-soft">
              <h3 className="text-sm font-extrabold text-charcoal-900 mb-1">
                Circulation Status Breakdown
              </h3>
              <p className="text-xs text-charcoal-500 mb-6">
                Real-time tracking of issued books, returned, overdue, and unreturned books.
              </p>

              {/* Visual Bar Chart */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-charcoal-700 mb-1">
                    <span>Available in Stacks ({stats.availableBooks})</span>
                    <span>{Math.round((stats.availableBooks / (stats.totalBooks || 1)) * 100)}%</span>
                  </div>
                  <div className="h-3 w-full bg-burgundy-50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${(stats.availableBooks / (stats.totalBooks || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-charcoal-700 mb-1">
                    <span>Active Issued Books ({stats.borrowedBooks})</span>
                    <span>{Math.round((stats.borrowedBooks / (stats.totalBooks || 1)) * 100)}%</span>
                  </div>
                  <div className="h-3 w-full bg-burgundy-50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-burgundy-700 rounded-full"
                      style={{ width: `${(stats.borrowedBooks / (stats.totalBooks || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-charcoal-700 mb-1">
                    <span>Overdue Returns ({stats.overdueBooks})</span>
                    <span>{Math.round((stats.overdueBooks / (stats.totalBooks || 1)) * 100)}%</span>
                  </div>
                  <div className="h-3 w-full bg-burgundy-50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${(stats.overdueBooks / (stats.totalBooks || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-charcoal-700 mb-1">
                    <span>Extended Not Returned ({stats.notReturnedBooks})</span>
                    <span>{Math.round((stats.notReturnedBooks / (stats.totalBooks || 1)) * 100)}%</span>
                  </div>
                  <div className="h-3 w-full bg-burgundy-50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${(stats.notReturnedBooks / (stats.totalBooks || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Loan Records Table */}
            <div className="bg-white rounded-3xl p-6 border border-burgundy-100 shadow-soft overflow-x-auto">
              <h4 className="text-sm font-extrabold text-charcoal-900 mb-4">
                Recent Circulation Audit Log
              </h4>

              <table className="w-full text-left text-xs text-charcoal-700">
                <thead className="bg-[#FAF7F7] text-charcoal-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3 rounded-l-2xl">Book Title</th>
                    <th className="p-3">Borrower</th>
                    <th className="p-3">Loan Date</th>
                    <th className="p-3">Due Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 rounded-r-2xl text-right">Fine</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-burgundy-50">
                  {borrowRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-burgundy-50/40 transition-colors">
                      <td className="p-3 font-bold text-charcoal-900">{r.bookTitle}</td>
                      <td className="p-3">{r.studentName} ({r.rollNumber})</td>
                      <td className="p-3">{r.issueDate}</td>
                      <td className="p-3">{r.dueDate}</td>
                      <td className="p-3">
                        <Badge
                          variant={
                            r.status === 'returned'
                              ? 'success'
                              : r.status === 'overdue'
                              ? 'danger'
                              : 'burgundy'
                          }
                          size="sm"
                        >
                          {r.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-charcoal-900">
                        ${r.fineAmount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'categories' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-3xl p-5 border border-burgundy-100 shadow-soft flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-sm font-extrabold text-charcoal-900">{cat.name}</h4>
                    <p className="text-xs text-charcoal-500 mt-0.5">{cat.description}</p>
                    <span className="text-[11px] font-mono text-burgundy-800 font-semibold mt-2 inline-block">
                      Stock: {cat.bookCount} registered copies
                    </span>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-burgundy-50 text-burgundy-800 flex items-center justify-center font-extrabold text-base border border-burgundy-100 shrink-0">
                    {cat.bookCount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {reportType === 'fines' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard
                title="Total Outstanding Fines"
                value={`$${stats.totalFines}`}
                subtitle="awaiting student clearance"
                variant="burgundy"
                icon={Receipt}
              />
              <StatCard
                title="Total Settled Revenue"
                value={`$${fines.filter((f) => f.status === 'paid').reduce((s, f) => s + f.amount, 0)}`}
                subtitle="credited to library fund"
                variant="cream"
                icon={RotateCcw}
              />
            </div>

            <div className="bg-white rounded-3xl p-6 border border-burgundy-100 shadow-soft">
              <h4 className="text-sm font-extrabold text-charcoal-900 mb-3">
                Full Fine Ledger
              </h4>
              <div className="space-y-2">
                {fines.map((f) => (
                  <div
                    key={f.id}
                    className="p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-charcoal-900">{f.studentName} ({f.rollNumber})</p>
                      <p className="text-[11px] text-charcoal-500">{f.reason} • {f.bookTitle}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-sm text-charcoal-900">${f.amount}</span>
                      <p className="text-[10px]">
                        <Badge variant={f.status === 'paid' ? 'success' : 'danger'} size="sm">
                          {f.status}
                        </Badge>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {reportType === 'memberships' && (
          <div className="bg-white rounded-3xl p-6 border border-burgundy-100 shadow-soft">
            <h4 className="text-sm font-extrabold text-charcoal-900 mb-4">
              Digital Membership Pass Log ({memberships.length} Total Applications)
            </h4>

            <div className="space-y-3">
              {memberships.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-2xl bg-[#FAF7F7] border border-burgundy-50 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-charcoal-900">{m.studentName} ({m.rollNumber})</p>
                    <p className="text-[11px] text-charcoal-500">{m.department} • {m.membershipId}</p>
                  </div>
                  <Badge variant={m.status === 'approved' ? 'success' : 'warning'} size="sm" dot>
                    {m.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

