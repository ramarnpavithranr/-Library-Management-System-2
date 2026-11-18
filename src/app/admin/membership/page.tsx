'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Search,
  Sparkles,
  User,
  Calendar,
  AlertCircle,
  History,
  Users,
} from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { SearchInput } from '@/components/common/SearchInput';
import { Badge } from '@/components/common/Badge';
import { DigitalMembershipCard } from '@/components/student/DigitalMembershipCard';
import confetti from 'canvas-confetti';

export default function AdminMembershipPage() {
  const { memberships, approveMembership, rejectMembership, refreshMemberships } = useLibrary();

  useEffect(() => {
    refreshMemberships();
    const interval = setInterval(() => {
      refreshMemberships();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'all'>('pending');
  const [previewCardId, setPreviewCardId] = useState<string | null>(null);

  const filteredMemberships = memberships.filter((m) => {
    const matchesSearch =
      m.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.membershipId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab = activeTab === 'all' || m.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const [membershipHistorySearch, setMembershipHistorySearch] = useState('');

  const totalMembershipsCount = memberships.length;
  const activeMembershipsCount = memberships.filter((m) => m.status === 'approved').length;
  const pendingMembershipsCount = memberships.filter((m) => m.status === 'pending').length;

  const filteredHistoryMemberships = memberships.filter((m) => {
    const q = membershipHistorySearch.toLowerCase().trim();
    if (!q) return true;
    return (
      m.studentName.toLowerCase().includes(q) ||
      m.rollNumber.toLowerCase().includes(q) ||
      m.membershipId.toLowerCase().includes(q) ||
      m.department.toLowerCase().includes(q)
    );
  });

  const handleApprove = (id: string, name: string) => {
    approveMembership(id);
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6E1129', '#B42244', '#10B981', '#F59E0B'],
    });
  };

  const handleReject = (id: string, name: string) => {
    if (confirm(`Reject membership pass application for ${name}?`)) {
      rejectMembership(id);
    }
  };

  const previewCard = memberships.find((m) => m.id === previewCardId);

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopBar
        title="Membership Applications"
        subtitle="Digital Pass Approvals & ID Card Lifecycle"
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Info card */}
        <div className="p-4 rounded-3xl bg-[#FFF9F6] border border-burgundy-100 shadow-soft flex items-start gap-3">
          <CreditCard size={20} className="text-burgundy-800 shrink-0 mt-0.5" />
          <p className="text-xs text-charcoal-700 leading-relaxed">
            <strong className="text-burgundy-950 font-bold">Automated Digital ID Issuance:</strong> When you click &quot;Approve&quot;, the system automatically generates an encrypted digital library pass with a 2-year validity period, unique institutional membership ID, and verifiable barcode.
          </p>
        </div>

        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by student name, roll no, card ID..."
            />
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-burgundy-100 shadow-soft">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all ${
                activeTab === 'pending'
                  ? 'bg-burgundy-800 text-white shadow-sm'
                  : 'text-charcoal-600 hover:text-burgundy-900'
              }`}
            >
              Pending ({memberships.filter((m) => m.status === 'pending').length})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all ${
                activeTab === 'approved'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-charcoal-600 hover:text-emerald-700'
              }`}
            >
              Issued Cards ({memberships.filter((m) => m.status === 'approved').length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all ${
                activeTab === 'all'
                  ? 'bg-charcoal-800 text-white shadow-sm'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              All Records
            </button>
          </div>
        </div>

        {/* Cards & Applications List */}
        {filteredMemberships.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-burgundy-100 shadow-soft">
            <CreditCard size={36} className="mx-auto text-burgundy-300 mb-2" />
            <h4 className="text-sm font-bold text-charcoal-800 mb-1">No Applications in this Queue</h4>
            <p className="text-xs text-charcoal-500">
              All student membership card applications in this view have been processed.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredMemberships.map((m) => {
              const isApproved = m.status === 'approved';
              const isPending = m.status === 'pending';

              return (
                <div
                  key={m.id}
                  className="bg-white rounded-3xl p-5 border border-burgundy-100/80 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden border border-burgundy-200 shrink-0 bg-burgundy-950 shadow-sm">
                          {m.photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={m.photo} alt={m.studentName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                              {m.studentName[0]}
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="text-sm font-extrabold text-charcoal-900 leading-tight">
                            {m.studentName}
                          </h4>
                          <p className="text-xs font-mono font-semibold text-burgundy-800">
                            Roll: {m.rollNumber}
                          </p>
                          <span className="text-[10px] text-charcoal-400">
                            Applied: {m.appliedDate}
                          </span>
                        </div>
                      </div>

                      <Badge
                        variant={isApproved ? 'success' : isPending ? 'warning' : 'danger'}
                        size="sm"
                        dot
                      >
                        {m.status}
                      </Badge>
                    </div>

                    {/* Details Box */}
                    <div className="p-3 bg-[#FAF7F7] rounded-2xl border border-burgundy-50 space-y-1 text-xs text-charcoal-600 mb-4">
                      <p className="truncate">
                        Dept: <strong className="text-charcoal-800">{m.department}</strong>
                      </p>
                      <p className="font-mono text-[11px] text-charcoal-500">
                        Card ID: <strong className="text-burgundy-950">{m.membershipId}</strong>
                      </p>
                      {isApproved && (
                        <p className="text-[11px] text-emerald-700 font-semibold">
                          Valid Thru: {m.expiryDate || '2026-06-30'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-burgundy-50 flex items-center justify-between gap-2">
                    {isPending ? (
                      <>
                        <button
                          onClick={() => handleReject(m.id, m.studentName)}
                          className="px-3 py-2 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold transition-all"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(m.id, m.studentName)}
                          className="px-4 py-2 bg-gradient-to-r from-burgundy-900 to-burgundy-800 hover:from-burgundy-800 hover:to-burgundy-900 text-white rounded-xl text-xs font-bold shadow-burgundy-glow flex items-center gap-1.5 active:scale-95 transition-all"
                        >
                          <Sparkles size={14} />
                          <span>Approve & Issue Card</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setPreviewCardId(m.id)}
                        className="w-full py-2 bg-burgundy-50 hover:bg-burgundy-100 text-burgundy-900 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <CreditCard size={14} />
                        <span>View Digital Pass</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MEMBERSHIP REGISTRY & HISTORY SECTION (SUPABASE MEMBERSHIP TABLE DATA)    */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-burgundy-100 shadow-soft space-y-4">
          {/* Header & KPI Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-burgundy-50">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-burgundy-800 text-white flex items-center justify-center shadow-sm shrink-0">
                <ShieldCheck size={16} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-charcoal-900">
                    Membership Details & History
                  </h3>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-burgundy-50 text-burgundy-900 border border-burgundy-100">
                    Total: {totalMembershipsCount}
                  </span>
                </div>
                <p className="text-xs text-charcoal-500">
                  Live membership directory populated directly from the Supabase <code className="font-mono text-burgundy-900 font-bold">membership</code> table
                </p>
              </div>
            </div>

            {/* KPI Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 font-medium">
                <CheckCircle size={14} className="text-emerald-700" />
                <span>Active Cards: <strong className="font-bold">{activeMembershipsCount}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 font-medium">
                <CreditCard size={14} className="text-amber-700" />
                <span>Pending Approvals: <strong className="font-bold">{pendingMembershipsCount}</strong></span>
              </div>
            </div>
          </div>

          {/* Search inside Membership History */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3.5 top-3 text-charcoal-400" />
              <input
                type="text"
                value={membershipHistorySearch}
                onChange={(e) => setMembershipHistorySearch(e.target.value)}
                placeholder="Search memberships by student name, roll no, card ID..."
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
                  <th className="py-3 px-3">Membership ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-3">Start Date</th>
                  <th className="py-3 px-3">End Date</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-burgundy-50">
                {filteredHistoryMemberships.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-charcoal-400">
                      No membership records match your search query.
                    </td>
                  </tr>
                ) : (
                  filteredHistoryMemberships.map((m) => {
                    const isApproved = m.status === 'approved';
                    const isPending = m.status === 'pending';

                    return (
                      <tr key={m.id} className="hover:bg-burgundy-50/40 transition-colors">
                        {/* Student Name */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-charcoal-900 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-burgundy-100 text-burgundy-900 text-[10px] font-bold flex items-center justify-center shrink-0">
                              {m.studentName ? m.studentName[0] : 'S'}
                            </span>
                            <span className="truncate max-w-[150px]">{m.studentName}</span>
                          </div>
                        </td>

                        {/* Student ID */}
                        <td className="py-3 px-3 font-mono font-medium text-charcoal-700">
                          {m.rollNumber || m.studentId}
                        </td>

                        {/* Membership ID */}
                        <td className="py-3 px-3 font-mono font-bold text-burgundy-900">
                          {m.membershipId}
                        </td>

                        {/* Type */}
                        <td className="py-3 px-4 text-charcoal-600">
                          {m.year || 'Standard Student'} • {m.department ? m.department.split(' ')[0] : 'Engineering'}
                        </td>

                        {/* Start Date */}
                        <td className="py-3 px-3 whitespace-nowrap text-charcoal-600">
                          {m.issuedDate || m.appliedDate || 'N/A'}
                        </td>

                        {/* End Date */}
                        <td className="py-3 px-3 whitespace-nowrap text-charcoal-600">
                          {m.expiryDate || (isApproved ? '2-Year Term' : 'Pending Issuance')}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {isApproved ? (
                            <Badge variant="success" size="sm" dot>Active Pass</Badge>
                          ) : isPending ? (
                            <Badge variant="warning" size="sm" dot>Pending Approval</Badge>
                          ) : (
                            <Badge variant="danger" size="sm" dot>Rejected</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* MODAL: PREVIEW DIGITAL PASS */}
        {previewCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm"
              onClick={() => setPreviewCardId(null)}
            />
            <div className="relative bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full z-10 border border-burgundy-100">
              <h3 className="text-sm font-bold text-charcoal-900 mb-4 text-center">
                Generated Digital Pass Preview
              </h3>
              <DigitalMembershipCard card={previewCard} />
              <button
                onClick={() => setPreviewCardId(null)}
                className="mt-5 w-full py-2.5 bg-burgundy-800 text-white rounded-2xl text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

