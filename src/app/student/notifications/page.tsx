'use client';

import React from 'react';
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';
import { StudentTopBar } from '@/components/student/StudentTopBar';

export default function StudentNotificationsPage() {
  const { user } = useAuth();
  const { notifications, markNotificationAsRead, markAllNotificationsRead } = useLibrary();

  const currentStudentId = user?.studentId || user?.id || '';
  const myNotifs = notifications.filter(
    (n) => (n.recipientType === 'student' && n.studentId === currentStudentId) || n.recipientType === 'all'
  );

  return (
    <div className="flex-1 flex flex-col">
      <StudentTopBar
        title="Notifications & Alerts"
        subtitle="Due Date Warnings, Reservation Alerts & Pass Approvals"
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
            {myNotifs.length} In-App Notifications
          </span>
          <button
            onClick={markAllNotificationsRead}
            className="text-xs font-bold text-burgundy-800 hover:text-burgundy-950 flex items-center gap-1.5"
          >
            <CheckCheck size={16} />
            <span>Mark All as Read</span>
          </button>
        </div>

        {myNotifs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-burgundy-100 shadow-soft">
            <Bell size={36} className="mx-auto text-burgundy-300 mb-2" />
            <h4 className="text-sm font-bold text-charcoal-800 mb-1">No Notifications</h4>
            <p className="text-xs text-charcoal-500">
              You are all caught up with your library updates.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {myNotifs.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationAsRead(n.id)}
                className={`p-4 rounded-3xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  n.read
                    ? 'bg-white border-burgundy-50 shadow-soft opacity-85'
                    : 'bg-white border-burgundy-200 shadow-md ring-1 ring-burgundy-100'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    n.type === 'alert' || n.type === 'warning'
                      ? 'bg-rose-50 text-rose-600'
                      : n.type === 'success'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-burgundy-50 text-burgundy-800'
                  }`}
                >
                  {n.type === 'alert' || n.type === 'warning' ? (
                    <AlertTriangle size={18} />
                  ) : n.type === 'success' ? (
                    <CheckCircle size={18} />
                  ) : (
                    <Info size={18} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-xs font-bold text-charcoal-900 leading-tight">
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-charcoal-400 whitespace-nowrap">
                      {n.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-600 leading-relaxed">
                    {n.message}
                  </p>
                </div>

                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-burgundy-600 shrink-0 mt-1" />
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

