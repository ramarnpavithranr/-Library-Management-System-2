'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Bell,
  Search,
  BookPlus,
  RotateCcw,
  Receipt,
  BarChart3,
  CreditCard,
  FolderTree,
  LogOut,
  Settings,
  ShieldCheck,
  BookmarkCheck,
  BookOpen,
  Users,
} from 'lucide-react';
import { CollegeLogo } from '../common/CollegeLogo';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';

interface AdminTopBarProps {
  title?: string;
  subtitle?: string;
}

export const AdminTopBar: React.FC<AdminTopBarProps> = ({ title, subtitle }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { stats, notifications } = useLibrary();

  const unreadCount = notifications.filter(n => n.recipientType === 'admin' && !n.read).length;

  const allDrawerLinks = [
    { name: 'Admin Dashboard', href: '/admin', icon: ShieldCheck },
    { name: 'Books Management', href: '/admin/books', icon: BookOpen },
    { name: 'Categories Management', href: '/admin/categories', icon: FolderTree },
    { name: 'Student Records', href: '/admin/students', icon: Users },
    { name: 'Issue Book Module', href: '/admin/issue', icon: BookPlus },
    { name: 'Return Book Module', href: '/admin/return', icon: RotateCcw },
    { name: 'Pre-Book Requests', href: '/admin/pre-bookings', icon: BookmarkCheck, badge: stats.pendingPreBooks },
    { name: 'Membership Applications', href: '/admin/membership', icon: CreditCard, badge: stats.pendingMemberships },
    { name: 'Fine Management', href: '/admin/fines', icon: Receipt },
    { name: 'Reports & Analytics', href: '/admin/reports', icon: BarChart3 },
    { name: 'System Notifications', href: '/admin/notifications', icon: Bell, badge: unreadCount },
    { name: 'Portal Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-burgundy-100/70 px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Left: Mobile Menu Trigger + Brand / Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="lg:hidden p-2 rounded-2xl text-charcoal-700 hover:bg-burgundy-50 border border-burgundy-100/60 active:scale-95"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-3">
            <CollegeLogo size="sm" variant="burgundy" showText={false} className="hidden sm:flex" />
            <div>
              <h1 className="text-base sm:text-lg font-bold text-charcoal-900 leading-tight">
                {title || 'Admin Portal'}
              </h1>
              {subtitle && (
                <p className="text-[11px] text-charcoal-500 hidden sm:block">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick actions & Notifications */}
        <div className="flex items-center gap-2">
          {/* Quick Issue action button */}
          <button
            onClick={() => router.push('/admin/issue')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-burgundy-50 hover:bg-burgundy-100 text-burgundy-900 border border-burgundy-200 rounded-full text-xs font-bold transition-all active:scale-95"
          >
            <BookPlus size={14} />
            <span>Issue Book</span>
          </button>

          {/* Notifications Bell */}
          <button
            onClick={() => router.push('/admin/notifications')}
            className="relative p-2.5 rounded-full text-charcoal-600 hover:text-burgundy-900 hover:bg-burgundy-50 border border-burgundy-100/60 transition-colors"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Admin Avatar badge */}
          <div className="flex items-center gap-2 pl-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-burgundy-900 to-burgundy-700 text-white flex items-center justify-center text-xs font-bold shadow-sm">
              AD
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE FULL DRAWER NAVIGATION */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Menu Panel */}
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
            <div>
              {/* Drawer Header */}
              <div className="p-5 border-b border-burgundy-100 flex items-center justify-between bg-[#FAF5F6]">
                <CollegeLogo size="sm" variant="burgundy" />
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-full text-charcoal-400 hover:text-charcoal-800 hover:bg-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-170px)]">
                {allDrawerLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <button
                      key={item.href}
                      onClick={() => {
                        setIsDrawerOpen(false);
                        router.push(item.href);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-burgundy-800 text-white shadow-burgundy-glow'
                          : 'text-charcoal-700 hover:bg-burgundy-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} className={isActive ? 'text-rose-200' : 'text-charcoal-400'} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500 text-white">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Logout Button */}
            <div className="p-4 border-t border-burgundy-100 bg-[#FAF7F7]">
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  logout();
                  router.push('/admin/login');
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-2xl text-xs font-bold transition-colors"
              >
                <LogOut size={15} />
                <span>Sign Out of Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

