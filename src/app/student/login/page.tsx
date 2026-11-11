'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, User, GraduationCap, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { CollegeLogo } from '@/components/common/CollegeLogo';
import { AnimatedLogoSplash } from '@/components/common/AnimatedLogoSplash';

export default function StudentLoginPage() {
  const router = useRouter();
  const { loginStudent } = useAuth();

  const [showSplash, setShowSplash] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await loginStudent(username, password);
      setIsLoading(false);
      if (res.success) {
        router.push('/student');
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <>
      {/* 1. Animated Logo Splash Screen (Shows first with animation, then proceeds to login) */}
      {showSplash && (
        <AnimatedLogoSplash
          portalTitle="Student Library Portal"
          portalSubtitle="Sree Sakthi Engineering College"
          onComplete={() => setShowSplash(false)}
          durationMs={2200}
        />
      )}

      {/* 2. Login Page with College Logo header */}
      <div className="min-h-screen bg-gradient-to-b from-[#FDF8F8] via-[#FAF3F3] to-[#F5ECEE] flex flex-col justify-center items-center p-4 sm:p-6 animate-scale-in">
        <div className="w-full max-w-sm flex flex-col items-center">
          
          {/* Official College Logo */}
          <div className="flex flex-col items-center text-center mb-6">
            <CollegeLogo size="xl" orientation="vertical" animated />
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-burgundy-100/80 text-burgundy-900 rounded-full text-xs font-bold mt-3 border border-burgundy-200 shadow-sm">
              <GraduationCap size={14} className="text-burgundy-700" />
              <span>Student Library Portal</span>
            </div>
          </div>

          {/* Student Sign In Card */}
          <div className="w-full bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-burgundy-100 relative overflow-hidden">
            {/* Burgundy accent stripe */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-burgundy-800 via-rose-600 to-amber-500" />

            <div className="mb-5">
              <h2 className="text-xl font-extrabold text-charcoal-900 tracking-tight">
                Student Sign In
              </h2>
              <p className="text-xs text-charcoal-500 mt-1">
                Enter your college student username to access your account.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Student Username */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                  Student Username
                </label>
                <div className="relative flex items-center">
                  <User size={17} className="absolute left-3.5 text-charcoal-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. 24CS050 or username"
                    className="w-full bg-[#FAF7F7] text-charcoal-900 text-sm font-medium pl-10 pr-4 py-3 rounded-2xl border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20 focus:border-burgundy-700 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock size={17} className="absolute left-3.5 text-charcoal-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter student password"
                    className="w-full bg-[#FAF7F7] text-charcoal-900 text-sm font-medium pl-10 pr-11 py-3 rounded-2xl border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20 focus:border-burgundy-700 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-charcoal-400 hover:text-charcoal-700 p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button to Dashboard */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-burgundy-900 via-burgundy-800 to-burgundy-950 hover:from-burgundy-800 hover:to-burgundy-900 text-white font-bold text-sm rounded-2xl shadow-burgundy-glow transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>


        </div>
      </div>
    </>
  );
}
