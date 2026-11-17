'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CreditCard,
  User,
  Hash,
  GraduationCap,
  Mail,
  Phone,
  Image as ImageIcon,
  Camera,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  BookOpen,
  RotateCcw,
  Upload,
} from 'lucide-react';
import { CollegeLogo } from '@/components/common/CollegeLogo';

interface MembershipApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: {
    studentName: string;
    rollNumber: string;
    department: string;
    year: string;
    phone: string;
    email: string;
    photo: string;
    purpose: string;
  }) => void;
  initialData?: {
    name?: string;
    rollNumber?: string;
    department?: string;
    year?: string;
    phone?: string;
    email?: string;
    profileImage?: string;
  };
  isSubmitting?: boolean;
}

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Artificial Intelligence & Data Science',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
];

const YEARS = ['1st Year (B.E)', '2nd Year (B.E)', '3rd Year (B.E)', '4th Year (B.E)', 'M.E / M.Tech'];

const PURPOSES = [
  'Regular Academic Lending & Reference Stacks',
  'Semester Project & Capstone Research',
  'Competitive Exam Preparation (GATE / Placements)',
  'Digital E-Library & Research Journals',
];

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
];

export const MembershipApplicationModal: React.FC<MembershipApplicationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
}) => {
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [year, setYear] = useState(YEARS[2]);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState(SAMPLE_AVATARS[0]);
  const [photoMode, setPhotoMode] = useState<'upload' | 'camera'>('upload');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [purpose, setPurpose] = useState(PURPOSES[0]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera access is not supported by this browser.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access notice:', err);
      setCameraError('Unable to access camera. Please check permissions or upload a photo.');
      setIsCameraActive(false);
    }
  };

  const capturePhotoFromCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const size = Math.min(video.videoWidth || 360, video.videoHeight || 360);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const startX = (video.videoWidth - size) / 2;
      const startY = (video.videoHeight - size) / 2;
      ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setPhoto(dataUrl);
      stopCamera();
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      if (initialData.name) setStudentName(initialData.name);
      if (initialData.rollNumber) setRollNumber(initialData.rollNumber);
      if (initialData.department) setDepartment(initialData.department);
      if (initialData.year) setYear(initialData.year);
      if (initialData.phone) setPhone(initialData.phone);
      if (initialData.email) setEmail(initialData.email);
      if (initialData.profileImage) setPhoto(initialData.profileImage);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (PNG, JPG, JPEG, WebP)');
        return;
      }
      if (file.size > 3 * 1024 * 1024) {
        setError('Photo size must be less than 3MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const raw = reader.result;
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxDim = 400;
            let w = img.width;
            let h = img.height;
            if (w > maxDim || h > maxDim) {
              if (w > h) {
                h = Math.round((h * maxDim) / w);
                w = maxDim;
              } else {
                w = Math.round((w * maxDim) / h);
                h = maxDim;
              }
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, w, h);
              setPhoto(canvas.toDataURL('image/jpeg', 0.88));
            } else {
              setPhoto(raw);
            }
          };
          img.src = raw;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!studentName.trim()) {
      setError('Please provide your full student name.');
      return;
    }
    if (!rollNumber.trim()) {
      setError('Please provide your college roll number.');
      return;
    }
    if (!agreedToTerms) {
      setError('You must accept the library terms and institutional declaration.');
      return;
    }

    onSubmit({
      studentName: studentName.trim(),
      rollNumber: rollNumber.trim().toUpperCase(),
      department,
      year,
      phone: phone.trim() || '+91 98450 00000',
      email: email.trim() || `${rollNumber.toLowerCase()}@sreesakthi.edu.in`,
      photo,
      purpose,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-charcoal-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-burgundy-100 shadow-2xl overflow-hidden my-auto animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-burgundy-950 via-burgundy-900 to-burgundy-850 p-5 sm:p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/90 hover:text-white transition-all"
            aria-label="Close"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white p-1 shadow-md shrink-0 flex items-center justify-center">
              <CollegeLogo size="sm" showText={false} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-200 text-[10px] font-bold tracking-wider uppercase mb-1">
                <Sparkles size={11} className="text-rose-300" />
                <span>Official SSEC Library Pass Form</span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                Application for Digital Member Card
              </h3>
              <p className="text-[11px] text-rose-200/80 mt-0.5">
                Submitted to Library Administrator for official verification & pass issuance
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Photo Selection Preview */}
          <div className="bg-[#FAF7F7] p-4 rounded-2xl border border-burgundy-100/70 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-charcoal-700 uppercase tracking-wider">
                Student ID Card Photograph <span className="text-burgundy-700">*</span>
              </label>
              <span className="text-[10px] text-charcoal-500 font-medium">Required for Digital Pass & Library Entry</span>
            </div>

            {/* Options Tabs: Upload vs Camera */}
            <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-burgundy-100 max-w-xs">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setPhotoMode('upload');
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  photoMode === 'upload'
                    ? 'bg-burgundy-800 text-white shadow-sm'
                    : 'text-charcoal-600 hover:text-burgundy-900'
                }`}
              >
                <Upload size={13} />
                <span>Upload File</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPhotoMode('camera');
                  startCamera();
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  photoMode === 'camera'
                    ? 'bg-burgundy-800 text-white shadow-sm'
                    : 'text-charcoal-600 hover:text-burgundy-900'
                }`}
              >
                <Camera size={13} />
                <span>Take Photo</span>
              </button>
            </div>

            {/* Camera Viewfinder View */}
            {photoMode === 'camera' && (
              <div className="p-3 bg-white rounded-2xl border border-burgundy-100 space-y-3">
                {cameraError ? (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                    {cameraError}
                  </div>
                ) : (
                  <div className="relative w-full max-w-[260px] aspect-square mx-auto rounded-2xl overflow-hidden bg-charcoal-900 border-2 border-burgundy-800 shadow-md">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                    <div className="absolute inset-0 border-2 border-dashed border-white/40 rounded-full m-6 pointer-events-none" />
                  </div>
                )}

                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={capturePhotoFromCamera}
                    disabled={!isCameraActive}
                    className="px-4 py-2 bg-burgundy-800 hover:bg-burgundy-900 text-white rounded-xl text-xs font-bold shadow-burgundy-glow flex items-center gap-1.5 disabled:opacity-50 transition-all active:scale-95"
                  >
                    <Camera size={14} />
                    <span>Capture Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      setPhotoMode('upload');
                    }}
                    className="px-3 py-2 bg-charcoal-100 hover:bg-charcoal-200 text-charcoal-700 rounded-xl text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Standard Preview & Upload Controls */}
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-burgundy-800 shadow-sm shrink-0 bg-burgundy-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo} alt="Student Preview" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-[11px] text-charcoal-600">
                  Select a campus photo or upload your passport-sized image for institutional pass verification.
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {SAMPLE_AVATARS.map((avatar, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhoto(avatar)}
                      className={`w-7 h-7 rounded-xl overflow-hidden border-2 transition-transform active:scale-90 ${
                        photo === avatar ? 'border-burgundy-800 ring-2 ring-burgundy-400 scale-105' : 'border-white opacity-70 hover:opacity-100'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={avatar} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                  <label className="cursor-pointer px-2.5 py-1 rounded-xl bg-white border border-burgundy-200 text-burgundy-900 text-[10px] font-bold hover:bg-burgundy-50 transition-colors flex items-center gap-1">
                    <ImageIcon size={12} />
                    <span>Upload Custom</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Student Name & Roll Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                Full Legal Name <span className="text-burgundy-700">*</span>
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Brett Lee"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-burgundy-200 text-xs font-semibold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-burgundy-700 focus:border-transparent bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                College Roll Number <span className="text-burgundy-700">*</span>
              </label>
              <div className="relative">
                <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <input
                  type="text"
                  required
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. 22CS045"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-burgundy-200 text-xs font-semibold text-charcoal-900 uppercase focus:outline-none focus:ring-2 focus:ring-burgundy-700 focus:border-transparent bg-white"
                />
              </div>
            </div>
          </div>

          {/* Department & Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                Department / Program <span className="text-burgundy-700">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-burgundy-200 text-xs font-semibold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-burgundy-700 focus:border-transparent bg-white"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                Academic Year <span className="text-burgundy-700">*</span>
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-burgundy-200 text-xs font-semibold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-burgundy-700 focus:border-transparent bg-white"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                Contact Phone
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98450 12345"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-burgundy-200 text-xs font-semibold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-burgundy-700 focus:border-transparent bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                College Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@sreesakthi.edu.in"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-burgundy-200 text-xs font-semibold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-burgundy-700 focus:border-transparent bg-white"
                />
              </div>
            </div>
          </div>

          {/* Library Access Purpose */}
          <div>
            <label className="block text-[11px] font-bold text-charcoal-700 uppercase tracking-wider mb-1">
              Primary Purpose for Library Card Issuance
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-burgundy-200 text-xs font-semibold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-burgundy-700 focus:border-transparent bg-white"
            >
              {PURPOSES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Institutional Declaration Checkbox */}
          <div className="p-3.5 bg-burgundy-50/60 rounded-2xl border border-burgundy-100 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="libraryTerms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 rounded text-burgundy-800 focus:ring-burgundy-700 w-4 h-4"
            />
            <label htmlFor="libraryTerms" className="text-[11px] text-charcoal-700 leading-snug cursor-pointer">
              <strong className="text-burgundy-950 font-bold">Institutional Declaration:</strong> I certify that all details submitted are accurate and pertain to my current enrollment at Sree Sakthi Engineering College. I agree to comply with library loan policies, return textbooks before due dates, and surrender the digital pass upon graduation.
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-charcoal-200 text-xs font-bold text-charcoal-700 hover:bg-charcoal-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-gradient-to-r from-burgundy-900 to-burgundy-800 hover:from-burgundy-800 hover:to-burgundy-900 text-white rounded-xl text-xs font-bold shadow-burgundy-glow flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting to Admin...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={15} />
                  <span>Submit Application to Admin</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

