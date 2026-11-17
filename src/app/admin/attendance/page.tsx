'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  DoorOpen,
  Clock,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  Camera,
  User,
  ArrowRight,
  LogOut,
  Building2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { StatCard } from '@/components/common/StatCard';
import { AttendanceRecord } from '@/types';

export default function AdminAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    currentlyInside: 0,
    todayVisits: 0,
    completedToday: 0,
    totalRecords: 0,
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Inside' | 'Completed'>('all');
  const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD
  const [methodFilter, setMethodFilter] = useState<'all' | 'Roll Number' | 'Face Recognition'>('all');

  // Quick Manual Roll Number Entry/Exit by Admin
  const [manualRoll, setManualRoll] = useState('');
  const [isManualSubmitting, setIsManualSubmitting] = useState(false);
  const [actionNotice, setActionNotice] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      let query = '?limit=150';
      if (selectedDate) query += `&date=${selectedDate}`;
      if (statusFilter !== 'all') query += `&status=${statusFilter}`;

      const res = await fetch(`/api/attendance${query}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.records)) {
        setRecords(data.records);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.warn('Error fetching attendance logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [selectedDate, statusFilter]);

  // Handle Quick Entry/Exit via Admin Desk
  const handleManualAction = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = manualRoll.trim();
    if (!clean) return;

    setIsManualSubmitting(true);
    setActionNotice(null);

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rollNumber: clean,
          method: 'Roll Number',
        }),
      });

      const data = await res.json();

      if (data.success) {
        setActionNotice({
          type: 'success',
          message: data.message,
        });
        setManualRoll('');
        fetchRecords();
      } else {
        setActionNotice({
          type: 'error',
          message: data.message || 'Operation failed',
        });
      }
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        message: err?.message || 'Server error',
      });
    } finally {
      setIsManualSubmitting(false);
    }
  };

  // Filtered records for display
  const filteredRecords = records.filter((rec) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = rec.studentName?.toLowerCase().includes(q);
      const matchRoll = rec.rollNumber?.toLowerCase().includes(q);
      const matchDept = rec.department?.toLowerCase().includes(q);
      if (!matchName && !matchRoll && !matchDept) return false;
    }

    if (methodFilter !== 'all' && rec.method !== methodFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-16">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-burgundy-100 text-burgundy-900 rounded-full text-xs font-bold mb-2">
            <DoorOpen size={14} className="text-burgundy-700" />
            <span>Attendance & Visitor Management</span>
          </div>
          <h1 className="text-2xl font-extrabold text-charcoal-900 tracking-tight">
            Library Entry & Exit Tracking
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Real-time campus library footfall, study hours duration, and student entry/exit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchRecords}
            disabled={isLoading}
            className="px-3.5 py-2.5 bg-white border border-burgundy-100 text-charcoal-700 hover:text-burgundy-900 hover:bg-burgundy-50 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Currently Inside"
          value={stats.currentlyInside}
          subtitle="Active visitors in library"
          icon={Users}
          variant="accent"
        />
        <StatCard
          title="Today's Visits"
          value={stats.todayVisits}
          subtitle="Check-ins today"
          icon={DoorOpen}
          variant="burgundy"
        />
        <StatCard
          title="Completed Sessions"
          value={stats.completedToday}
          subtitle="Exited today"
          icon={Clock}
          variant="cream"
        />
        <StatCard
          title="Total Log Entries"
          value={stats.totalRecords}
          subtitle="Stored in database"
          icon={FileSpreadsheet}
          variant="white"
        />
      </div>

      {/* 3. Desk Check-In Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-burgundy-100 shadow-card">
        <div className="max-w-xl">
          <h3 className="text-sm font-extrabold text-charcoal-900 mb-1 flex items-center gap-2">
            <DoorOpen size={16} className="text-burgundy-700" />
            <span>Circulation Desk Check-In / Check-Out</span>
          </h3>
          <p className="text-xs text-charcoal-500 mb-4">
            Librarian quick scanner: Enter student roll number or scan student barcode to automatically record Entry or Exit.
          </p>

          <form onSubmit={handleManualAction} className="flex gap-2">
            <div className="relative flex-1">
              <User size={16} className="absolute left-3.5 top-3.5 text-charcoal-400" />
              <input
                type="text"
                value={manualRoll}
                onChange={(e) => setManualRoll(e.target.value)}
                placeholder="Scan / Enter Student Roll No. (e.g. 24CS49 or tharun)"
                className="w-full bg-[#FAF7F7] text-charcoal-900 text-xs font-semibold pl-10 pr-4 py-3 rounded-2xl border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20 focus:border-burgundy-700 uppercase"
              />
            </div>
            <button
              type="submit"
              disabled={isManualSubmitting || !manualRoll.trim()}
              className="px-5 py-3 bg-burgundy-800 hover:bg-burgundy-900 text-white font-bold text-xs rounded-2xl shadow-burgundy-glow transition-all disabled:opacity-50 flex items-center gap-2 shrink-0"
            >
              {isManualSubmitting ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <>
                  <span>Record</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {actionNotice && (
            <div
              className={`mt-3 p-3 rounded-xl text-xs flex items-center gap-2 border ${
                actionNotice.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {actionNotice.type === 'success' ? (
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
              )}
              <span>{actionNotice.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Filter & Search Controls */}
      <div className="bg-white rounded-3xl p-5 border border-burgundy-100 shadow-card space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-3.5 text-charcoal-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name or roll..."
              className="w-full bg-[#FAF7F7] text-charcoal-900 text-xs font-medium pl-9 pr-3 py-2.5 rounded-xl border border-burgundy-100 focus:outline-none focus:ring-1 focus:ring-burgundy-700"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-charcoal-500 shrink-0">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-[#FAF7F7] text-charcoal-900 text-xs font-medium px-3 py-2.5 rounded-xl border border-burgundy-100 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="Inside">Currently Inside</option>
              <option value="Completed">Completed Visits</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-charcoal-500 shrink-0">Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-[#FAF7F7] text-charcoal-900 text-xs font-medium px-3 py-2.5 rounded-xl border border-burgundy-100 focus:outline-none"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="text-[10px] text-charcoal-400 hover:text-rose-600 font-bold shrink-0"
              >
                Clear
              </button>
            )}
          </div>

          {/* Method Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-charcoal-500 shrink-0">Method:</span>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as any)}
              className="w-full bg-[#FAF7F7] text-charcoal-900 text-xs font-medium px-3 py-2.5 rounded-xl border border-burgundy-100 focus:outline-none"
            >
              <option value="all">All Methods</option>
              <option value="Roll Number">Roll Number</option>
              <option value="Face Recognition">Face Recognition</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. Attendance Records Table */}
      <div className="bg-white rounded-3xl p-6 border border-burgundy-100 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-extrabold text-charcoal-900">
              Attendance Activity Logs
            </h2>
            <p className="text-[11px] text-charcoal-500">
              Showing {filteredRecords.length} records
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-charcoal-400">
            <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-burgundy-700" />
            Loading attendance records from database...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="py-12 text-center text-xs text-charcoal-400 border border-dashed border-burgundy-100 rounded-2xl">
            <DoorOpen size={30} className="mx-auto text-charcoal-300 mb-2" />
            <p className="font-semibold text-charcoal-700">No attendance records match your filter.</p>
            <p className="text-[11px] text-charcoal-400 mt-1">
              Try adjusting the date, status, or search query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-burgundy-50">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F7] text-charcoal-500 font-bold uppercase text-[10px] tracking-wider border-b border-burgundy-100">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Entry Time</th>
                  <th className="py-3 px-4">Exit Time</th>
                  <th className="py-3 px-4">Visit Duration</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-burgundy-50 text-charcoal-800 font-medium">
                {filteredRecords.map((rec) => {
                  const entryDate = new Date(rec.entryTime);
                  const entryDateStr = entryDate.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  });
                  const entryTimeStr = entryDate.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  });
                  const exitTimeStr = rec.exitTime
                    ? new Date(rec.exitTime).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })
                    : '—';

                  return (
                    <tr key={rec.id} className="hover:bg-burgundy-50/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-burgundy-100 text-burgundy-900 flex items-center justify-center font-bold text-[10px] uppercase shrink-0">
                            {rec.studentName?.[0] || 'S'}
                          </div>
                          <span className="font-bold text-charcoal-900">{rec.studentName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-charcoal-800">{rec.rollNumber}</td>
                      <td className="py-3 px-4 text-charcoal-600">{rec.department || 'Engineering'}</td>
                      <td className="py-3 px-4">
                        <span className="text-charcoal-900 font-semibold">{entryDateStr}</span>{' '}
                        <span className="text-charcoal-500 text-[11px]">at {entryTimeStr}</span>
                      </td>
                      <td className="py-3 px-4">{exitTimeStr}</td>
                      <td className="py-3 px-4">
                        {rec.duration ? (
                          <span className="font-bold text-burgundy-900">{rec.duration}</span>
                        ) : (
                          <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Inside Now
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] text-charcoal-600">
                          {rec.method === 'Face Recognition' ? (
                            <Camera size={13} className="text-rose-600" />
                          ) : (
                            <User size={13} className="text-burgundy-700" />
                          )}
                          <span>{rec.method || 'Roll Number'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {rec.status === 'Inside' ? (
                          <Badge variant="success" dot>
                            Inside
                          </Badge>
                        ) : (
                          <Badge variant="neutral">Completed</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
