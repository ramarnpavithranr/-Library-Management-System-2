'use client';

import React from 'react';
import Link from 'next/navigation';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  FolderTree,
  Users,
  BookPlus,
  RotateCcw,
  BookmarkCheck,
  CreditCard,
  Receipt,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';
import { CollegeLogo } from '../common/CollegeLogo';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

export const AdminNavigation: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { stats, notifications } = useLibrary();

  const unreadNotifs = notifications.filter(n => n.recipientType === 'admin' && !n.read).length;

  const mainNavItems: NavItem[] = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Books Catalog', href: '/admin/books', icon: BookOpen },
    { name: 'Categories', href: '/admin/categories', icon: FolderTree },
    { name: 'Student Records', href: '/admin/students', icon: Users },
    { name: 'Issue Book', href: '/admin/issue', icon: BookPlus },
    { name: 'Return Book', href: '/admin/return', icon: RotateCcw },
    { name: 'Pre-Bookings', href: '/admin/pre-bookings', icon: BookmarkCheck, badge: stats.pendingPreBooks },
    { name: 'Memberships', href: '/admin/membership', icon: CreditCard, badge: stats.pendingMemberships },
    { name: 'Fine Management', href: '/admin/fines', icon: Receipt },
    { name: 'Reports & Analytics', href: '/admin/reports', icon: BarChart3 },
  ];

  const secondaryNavItems: NavItem[] = [
    { name: 'Notifications', href: '/admin/notifications', icon: Bell, badge: unreadNotifs },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  // Mobile Bottom Navigation Bar Items (matching Proton Vault design)
  const mobileNavItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Books', href: '/admin/books', icon: BookOpen },
    { name: 'Issue', href: '/admin/issue', icon: PlusCircle, isCenter: true },
    { name: 'Requests', href: '/admin/pre-bookings', icon: BookmarkCheck, badge: stats.pendingPreBooks },
    { name: 'Students', href: '/admin/students', icon: Users },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-burgundy-100/80 flex-col justify-between h-screen sticky top-0 z-30 shadow-soft">
        <div>
          {/* Logo & College Header */}
          <div className="p-6 border-b border-burgundy-50">
            <CollegeLogo size="md" variant="burgundy" />
            <div className="mt-3 px-2 py-1 bg-burgundy-50 rounded-xl inline-flex items-center gap-1.5 border border-burgundy-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-burgundy-900 uppercase tracking-wider">
                Admin Control Portal
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-charcoal-400">
              Management
            </span>
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href === '/admin' && (pathname === '/admin' || pathname === '/admin/dashboard')) ||
                (item.href !== '/admin' && item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-burgundy-800 to-burgundy-900 text-white shadow-burgundy-glow'
                      : 'text-charcoal-700 hover:bg-burgundy-50 hover:text-burgundy-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={17} className={isActive ? 'text-rose-200' : 'text-charcoal-400'} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-white text-burgundy-900' : 'bg-rose-500 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-3">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-charcoal-400">
                System
              </span>
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all mt-1 ${
                      isActive
                        ? 'bg-gradient-to-r from-burgundy-800 to-burgundy-900 text-white shadow-burgundy-glow'
                        : 'text-charcoal-700 hover:bg-burgundy-50 hover:text-burgundy-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={17} className={isActive ? 'text-rose-200' : 'text-charcoal-400'} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500 text-white">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Admin User Footer Profile & Logout */}
        <div className="p-4 border-t border-burgundy-50 bg-[#FAF7F7]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-burgundy-800 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                AD
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-charcoal-900 truncate">
                  {user?.name || 'Administrator'}
                </p>
                <p className="text-[10px] text-charcoal-500 truncate">
                  Head Librarian
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-charcoal-400 hover:text-rose-600 rounded-xl hover:bg-white transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION BAR (Proton Vault inspired floating capsule dock) */}
      <nav className="lg:hidden fixed bottom-3 left-4 right-4 z-40">
        <div className="bg-white/95 backdrop-blur-xl border border-burgundy-100/90 rounded-full shadow-2xl px-3 py-2 flex items-center justify-around">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            if (item.isCenter) {
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className="relative -top-5 flex flex-col items-center group"
                >
                  <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-burgundy-950 via-burgundy-800 to-rose-600 text-white flex items-center justify-center shadow-burgundy-glow border-4 border-white transition-transform active:scale-90">
                    <Icon size={24} />
                  </div>
                  <span className="text-[10px] font-bold text-burgundy-900 mt-0.5">
                    {item.name}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`flex flex-col items-center py-1 px-2.5 rounded-2xl relative transition-all active:scale-95 ${
                  isActive ? 'text-burgundy-900 font-bold' : 'text-charcoal-400 font-medium'
                }`}
              >
                <div className="relative">
                  <Icon size={20} className={isActive ? 'text-burgundy-800' : 'text-charcoal-400'} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-2.5 bg-rose-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5">{item.name}</span>
                {isActive && (
                  <div className="w-1 h-1 bg-burgundy-800 rounded-full mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

