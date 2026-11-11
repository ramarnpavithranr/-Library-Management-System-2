'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Lock,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  GraduationCap,
  CreditCard,
  Building,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';
import { StudentTopBar } from '@/components/student/StudentTopBar';
import { Badge } from '@/components/common/Badge';
import { Student } from '@/types';

export default function StudentProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { students, changeStudentPassword, memberships } = useLibrary();

  const currentStudentId = user?.studentId || user?.id || '';
  const currentStudent = students.find((s) => s.studentId === currentStudentId || s.id === user?.id);
  const student: Student = currentStudent || {
    id: user?.id || 'stu-session',
    studentId: user?.studentId || 'STU-SESSION',
    name: user?.name || 'Student Member',
    rollNumber: user?.rollNumber || '24CS000',
    email: user?.email || '',
    phone: '+91 98450 00000',
    department: user?.department || 'Engineering',
    college: user?.college || 'Sree Sakthi Engineering College',
    year: user?.year || '1st Year',
    section: 'A',
    username: user?.username || 'student',
    status: 'active',
    profileImage: user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
    joinedDate: new Date().toISOString().split('T')[0],
  };
  const membership = memberships.find((m) => m.studentId === currentStudentId);

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleLogout = () => {
    if (confirm('Are you sure you want to sign out of your student library account?')) {
      logout();
      router.push('/student/login');
    }
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-charcoal-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(newPassword);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'New password and confirmation password do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setStatusMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    const res = await changeStudentPassword(student.studentId, currentPassword, newPassword);
    if (res.success) {
      setStatusMessage({ type: 'success', text: res.message });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="flex-1 flex flex-col pb-24">
      <StudentTopBar
        title="Student Profile & Security"
        subtitle="Verified Academic Credentials & Password Management"
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto w-full">
        {/* Profile Info Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-burgundy-100 shadow-soft">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-burgundy-50">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl overflow-hidden border-2 border-burgundy-200 shrink-0 bg-burgundy-950 shadow-md">
                {student?.profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={student.profileImage} alt={student.name} className="w-full h-full object-cover" />
                ) : null}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-lg font-extrabold text-charcoal-900 leading-tight">
                    {student?.name}
                  </h3>
                  <Badge variant="success" size="sm" dot>Active Student</Badge>
                </div>
                <p className="text-xs font-mono font-semibold text-burgundy-800">
                  Roll: {student?.rollNumber} • ID: {student?.studentId}
                </p>
                <p className="text-[11px] text-charcoal-500">
                  {student?.department}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
              <div className="bg-burgundy-50 px-3.5 py-2 rounded-2xl border border-burgundy-100 text-xs">
                <span className="text-[10px] text-charcoal-400 font-bold uppercase block">
                  Library Pass ID
                </span>
                <span className="font-mono font-bold text-burgundy-950">
                  {membership?.membershipId || 'Not Generated Yet'}
                </span>
              </div>

              {/* Quick Logout button in header banner */}
              <button
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors active:scale-95"
                title="Sign Out"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>

          {/* Academic Details Grid (Read-Only as requested in Section 22) */}
          <div className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
                Institutional Academic Record
              </h4>
              <span className="text-[10px] text-charcoal-400 font-semibold bg-charcoal-50 px-2 py-0.5 rounded">
                Admin Managed (Read-Only)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#FAF7F7] rounded-2xl border border-burgundy-100/60">
                <span className="text-charcoal-400 text-[10px] uppercase font-bold block mb-1">
                  Full Name
                </span>
                <span className="font-bold text-charcoal-900">{student?.name}</span>
              </div>

              <div className="p-3 bg-[#FAF7F7] rounded-2xl border border-burgundy-100/60">
                <span className="text-charcoal-400 text-[10px] uppercase font-bold block mb-1">
                  Roll Number
                </span>
                <span className="font-bold font-mono text-charcoal-900">{student?.rollNumber}</span>
              </div>

              <div className="p-3 bg-[#FAF7F7] rounded-2xl border border-burgundy-100/60">
                <span className="text-charcoal-400 text-[10px] uppercase font-bold block mb-1">
                  Student ID
                </span>
                <span className="font-bold font-mono text-charcoal-900">{student?.studentId}</span>
              </div>

              <div className="p-3 bg-[#FAF7F7] rounded-2xl border border-burgundy-100/60">
                <span className="text-charcoal-400 text-[10px] uppercase font-bold block mb-1">
                  Department
                </span>
                <span className="font-bold text-charcoal-900">{student?.department}</span>
              </div>

              <div className="p-3 bg-[#FAF7F7] rounded-2xl border border-burgundy-100/60">
                <span className="text-charcoal-400 text-[10px] uppercase font-bold block mb-1">
                  College / Institution
                </span>
                <span className="font-bold text-charcoal-900">{student?.college || 'Sree Sakthi Engineering College'}</span>
              </div>

              <div className="p-3 bg-[#FAF7F7] rounded-2xl border border-burgundy-100/60">
                <span className="text-charcoal-400 text-[10px] uppercase font-bold block mb-1">
                  Year & Section
                </span>
                <span className="font-bold text-charcoal-900">{student?.year} - Sec {student?.section}</span>
              </div>

              <div className="p-3 bg-[#FAF7F7] rounded-2xl border border-burgundy-100/60">
                <span className="text-charcoal-400 text-[10px] uppercase font-bold block mb-1">
                  Institutional Email
                </span>
                <span className="font-bold text-charcoal-900 truncate block">{student?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-burgundy-100 shadow-soft">
          <div className="flex items-center gap-2 mb-1">
            <KeyRound size={20} className="text-burgundy-800" />
            <h3 className="text-base font-extrabold text-charcoal-900">
              Change Account Password
            </h3>
          </div>
          <p className="text-xs text-charcoal-500 mb-6">
            Students are permitted to change their own password at any time. Keep your password confidential.
          </p>

          {statusMessage && (
            <div
              className={`p-3.5 rounded-2xl mb-5 flex items-center gap-2.5 text-xs font-semibold ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {statusMessage.type === 'success' ? <CheckCircle size={17} /> : <AlertCircle size={17} />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                Current Password *
              </label>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-3.5 text-charcoal-400 pointer-events-none" />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full text-xs font-medium pl-10 pr-10 py-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3.5 text-charcoal-400 hover:text-charcoal-700"
                >
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                New Password *
              </label>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-3.5 text-charcoal-400 pointer-events-none" />
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full text-xs font-medium pl-10 pr-10 py-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 text-charcoal-400 hover:text-charcoal-700"
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-[10px] font-semibold text-charcoal-500">
                    <span>Password Strength:</span>
                    <span className="font-bold">{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-charcoal-100 rounded-full overflow-hidden flex gap-1">
                    <div
                      className={`h-full rounded-full transition-all ${strength.color}`}
                      style={{ width: `${(strength.score / 3) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                Confirm New Password *
              </label>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-3.5 text-charcoal-400 pointer-events-none" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full text-xs font-medium pl-10 pr-10 py-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 text-charcoal-400 hover:text-charcoal-700"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 py-3 px-6 bg-gradient-to-r from-burgundy-900 to-burgundy-800 hover:from-burgundy-800 hover:to-burgundy-900 text-white rounded-2xl text-xs font-bold shadow-burgundy-glow active:scale-95 transition-all"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* Dedicated Account Logout Section */}
        <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-extrabold text-charcoal-900 flex items-center gap-2">
                <LogOut size={16} className="text-rose-600" />
                <span>Sign Out of Portal</span>
              </h4>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Logged in as <span className="font-bold text-charcoal-800">{user?.username || 'brett.adams'}</span>. End your current student session on this device.
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-200 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
