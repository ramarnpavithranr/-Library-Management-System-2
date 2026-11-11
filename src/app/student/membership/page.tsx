'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  ShieldCheck,
  Sparkles,
  QrCode,
  Download,
  AlertCircle,
  CheckCircle,
  RotateCcw,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';
import { StudentTopBar } from '@/components/student/StudentTopBar';
import { DigitalMembershipCard } from '@/components/student/DigitalMembershipCard';
import { MembershipApplicationModal } from '@/components/student/MembershipApplicationModal';

export default function StudentMembershipPage() {
  const { user } = useAuth();
  const { memberships, students, applyForMembership, resetStudentMembership } = useLibrary();

  const currentStudentId = user?.studentId || user?.id || '';
  const myCard = memberships.find((m) => m.studentId === currentStudentId);
  const currentStudent = students.find((s) => s.studentId === currentStudentId || s.id === user?.id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

  const handleOpenApply = () => {
    setIsApplicationModalOpen(true);
  };

  const handleFormSubmit = (formData: {
    studentName: string;
    rollNumber: string;
    department: string;
    year: string;
    phone: string;
    email: string;
    photo: string;
    purpose: string;
  }) => {
    setIsSubmitting(true);
    setTimeout(() => {
      applyForMembership(currentStudentId, {
        studentName: formData.studentName,
        rollNumber: formData.rollNumber,
        department: formData.department,
        year: formData.year,
        phone: formData.phone,
        email: formData.email,
        photo: formData.photo,
      });
      setIsSubmitting(false);
      setIsApplicationModalOpen(false);
    }, 400);
  };

  const handleResetForTesting = () => {
    if (confirm('Reset your membership card status to test the fresh application and admin approval flow?')) {
      resetStudentMembership(currentStudentId);
    }
  };

  return (
    <div className="flex-1 flex flex-col pb-24">
      <StudentTopBar
        title="Digital Membership Pass"
        subtitle="Sree Sakthi Engineering College Library ID & NFC Access"
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-xl mx-auto w-full">
        {/* Pass Render Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-burgundy-100 shadow-soft flex flex-col items-center">
          <div className="w-full mb-6 text-center">
            <h3 className="text-base font-extrabold text-charcoal-900">
              Official Student Library Pass
            </h3>
            <p className="text-xs text-charcoal-500 mt-0.5">
              {myCard?.status === 'approved'
                ? 'Tap the card below to toggle between front photo ID and back digital QR code.'
                : myCard?.status === 'pending'
                ? 'Your application has been received and is awaiting administrator approval.'
                : 'Apply below to request your institutional digital library pass.'}
            </p>
          </div>

          <DigitalMembershipCard
            card={myCard}
            onApply={handleOpenApply}
            isApplying={isSubmitting}
          />

          {/* Reset / Re-test Flow Button */}
          {myCard && (
            <div className="mt-5 pt-4 border-t border-burgundy-50 w-full text-center">
              <button
                onClick={handleResetForTesting}
                className="text-[11px] text-charcoal-400 hover:text-burgundy-800 font-semibold inline-flex items-center gap-1.5 transition-colors"
                title="Reset this card to test student application and admin approval workflow"
              >
                <RotateCcw size={12} />
                <span>Reset to test &quot;Apply &rarr; Admin Approve&quot; flow again</span>
              </button>
            </div>
          )}
        </div>

        {/* Membership Application Form Modal */}
        <MembershipApplicationModal
          isOpen={isApplicationModalOpen}
          onClose={() => setIsApplicationModalOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={{
            name: currentStudent?.name || user?.name,
            rollNumber: currentStudent?.rollNumber || user?.rollNumber,
            department: currentStudent?.department || user?.department,
            year: currentStudent?.year || user?.year,
            phone: currentStudent?.phone,
            email: currentStudent?.email || user?.email,
            profileImage: currentStudent?.profileImage || user?.profileImage,
          }}
          isSubmitting={isSubmitting}
        />

        {/* Workflow Info Steps */}
        <div className="bg-white rounded-3xl p-6 border border-burgundy-100 shadow-soft space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-burgundy-800" />
            <h4 className="text-xs font-extrabold text-charcoal-900 uppercase tracking-wider">
              Membership Issuance Lifecycle
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
            <div className="p-3 bg-[#FAF7F7] rounded-2xl border border-burgundy-100/60">
              <div className="flex items-center gap-1.5 font-bold text-burgundy-900 mb-1">
                <span className="w-4 h-4 rounded-full bg-burgundy-800 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                <span>Student Applies</span>
              </div>
              <p className="text-[11px] text-charcoal-500">
                Student submits application from this screen.
              </p>
            </div>

            <div className="p-3 bg-[#FAF7F7] rounded-2xl border border-burgundy-100/60">
              <div className="flex items-center gap-1.5 font-bold text-amber-800 mb-1">
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                <span>Admin Approves</span>
              </div>
              <p className="text-[11px] text-charcoal-500">
                Admin reviews & approves under Admin Portal &rarr; Membership.
              </p>
            </div>

            <div className="p-3 bg-[#FAF7F7] rounded-2xl border border-burgundy-100/60">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800 mb-1">
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">3</span>
                <span>Pass Generated</span>
              </div>
              <p className="text-[11px] text-charcoal-500">
                Digital card with QR & Barcode appears instantly here.
              </p>
            </div>
          </div>
        </div>

        {/* Verification Guidelines & Security Standards */}
        <div className="bg-white rounded-3xl p-6 border border-burgundy-100 shadow-soft space-y-3">
          <h4 className="text-xs font-extrabold text-charcoal-900 uppercase tracking-wider">
            Pass Privileges & Campus Rules
          </h4>

          <div className="space-y-2 text-xs text-charcoal-600">
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-burgundy-700 mt-1.5 shrink-0" />
              <span>Valid across all Sree Sakthi Engineering College reading halls, reference stacks, and digital labs.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-burgundy-700 mt-1.5 shrink-0" />
              <span>Allows concurrent checkout of up to 3 textbooks with 14-day renewal eligibility.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-burgundy-700 mt-1.5 shrink-0" />
              <span>Pre-booking privilege for restricted high-demand engineering textbooks.</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
