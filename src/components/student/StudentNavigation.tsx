'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Library,
  BookMarked,
  CreditCard,
  User,
  FolderTree,
  BookmarkCheck,
  Receipt,
  History,
  LogOut,
  Bell,
  X,
  Sparkles,
  ChevronRight,
  Layers,
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

export const StudentNavigation: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { borrowRecords, preBookings, fines, notifications } = useLibrary();

  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

  const currentStudentId = user?.studentId || user?.id || '';
  const myBorrows = borrowRecords.filter(r => r.studentId === currentStudentId && r.status === 'borrowed').length;
  const myPreBooks = preBookings.filter(r => r.studentId === currentStudentId && r.status === 'pending').length;
  const myUnpaidFines = fines.filter(f => f.studentId === currentStudentId && f.status === 'unpaid').length;
  const myUnreadNotifs = notifications.filter(
    n => (n.recipientType === 'student' && n.studentId === currentStudentId) && !n.read
  ).length;

  const mainNavItems: NavItem[] = [
    { name: 'Home Dashboard', href: '/student', icon: Home },
    { name: 'Browse Library', href: '/student/books', icon: Library },
    { name: 'Book Categories', href: '/student/categories', icon: FolderTree },
    { name: 'Books', href: '/student/my-books', icon: BookMarked, badge: myBorrows },
    { name: 'Pre Book', href: '/student/pre-bookings', icon: BookmarkCheck, badge: myPreBooks },
    { name: 'Membership Card', href: '/student/membership', icon: CreditCard },
    { name: 'Fines & Dues', href: '/student/fines', icon: Receipt, badge: myUnpaidFines },
    { name: 'Borrowing History', href: '/student/history', icon: History },
  ];

  const secondaryNavItems: NavItem[] = [
    { name: 'My Profile', href: '/student/profile', icon: User },
    { name: 'Notifications', href: '/student/notifications', icon: Bell, badge: myUnreadNotifs },
  ];

  const handleLogout = () => {
    logout();
    router.push('/student/login');
  };

  // Quick Action Menu Items (Opened by the small center icon)
  const quickActions = [
    {
      name: 'Book Catalog',
      desc: 'Browse & search textbooks, authors, shelf racks',
      href: '/student/books',
      icon: Library,
      badge: null,
      color: 'bg-burgundy-50 text-burgundy-900 border-burgundy-200',
    },
    {
      name: 'ID Pass / Digital Card',
      desc: 'Apply for or view your approved digital membership card',
      href: '/student/membership',
      icon: CreditCard,
      badge: null,
      color: 'bg-rose-50 text-rose-900 border-rose-200',
    },
    {
      name: 'Books',
      desc: 'Active book loans, return due countdowns & renewals',
      href: '/student/my-books',
      icon: BookMarked,
      badge: myBorrows > 0 ? `${myBorrows} active` : null,
      color: 'bg-amber-50 text-amber-900 border-amber-200',
    },
    {
      name: 'Pre Book',
      desc: 'Reservation queue & counter pickup hold status',
      href: '/student/pre-bookings',
      icon: BookmarkCheck,
      badge: myPreBooks > 0 ? `${myPreBooks} pending` : null,
      color: 'bg-cream-100 text-charcoal-800 border-burgundy-100',
    },
    {
      name: 'Fines & Dues',
      desc: 'Overdue penalties & payment history',
      href: '/student/fines',
      icon: Receipt,
      badge: myUnpaidFines > 0 ? `${myUnpaidFines} unpaid` : null,
      color: 'bg-red-50 text-red-900 border-red-200',
    },
    {
      name: 'Borrowing History',
      desc: 'Full academic reading record',
      href: '/student/history',
      icon: History,
      badge: null,
      color: 'bg-charcoal-50 text-charcoal-800 border-charcoal-200',
    },
  ];

  const navigateTo = (href: string) => {
    setIsActionMenuOpen(false);
    router.push(href);
  };

  const isHomeActive = pathname === '/student' || pathname === '/student/dashboard';
  const isProfileActive = pathname === '/student/profile';
  const isServicesActive = !isHomeActive && !isProfileActive;

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-burgundy-100/80 flex-col justify-between h-screen sticky top-0 z-30 shadow-soft">
        <div>
          {/* Logo & College Header */}
          <div className="p-6 border-b border-burgundy-50">
            <CollegeLogo size="md" variant="burgundy" />
            <div className="mt-3 px-2 py-1 bg-burgundy-50 rounded-xl inline-flex items-center gap-1.5 border border-burgundy-100">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[11px] font-bold text-burgundy-900 uppercase tracking-wider">
                Student Library Portal
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-charcoal-400">
              Library Services
            </span>
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href === '/student' && (pathname === '/student' || pathname === '/student/dashboard')) ||
                (item.href !== '/student' && item.href !== '/student/dashboard' && pathname.startsWith(item.href));
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-burgundy-800 text-white shadow-burgundy-glow'
                      : 'text-charcoal-700 hover:bg-burgundy-50 hover:text-burgundy-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={17} className={isActive ? 'text-rose-200' : 'text-charcoal-400'} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500 text-white shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-4">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-charcoal-400">
                Account & Settings
              </span>
              <div className="mt-1 space-y-1">
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <button
                      key={item.href}
                      onClick={() => router.push(item.href)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-burgundy-800 text-white shadow-burgundy-glow'
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
        </div>

        {/* User Profile Mini Footer (Desktop) */}
        <div className="p-4 border-t border-burgundy-50 bg-[#FAF7F7]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-burgundy-200 shrink-0">
                {user?.profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-burgundy-800 text-white flex items-center justify-center font-bold text-xs">
                    {user?.name?.[0] || 'S'}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-charcoal-900 truncate">
                  {user?.name || 'Student Member'}
                </p>
                <p className="text-[10px] text-charcoal-500 truncate">
                  {user?.rollNumber || user?.studentId || ''}
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

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      {/* Converted: [Home] • [Small Center Action Icon] • [Profile] */}
      <nav className="lg:hidden fixed bottom-3 left-6 right-6 z-40 max-w-sm mx-auto">
        <div className="bg-white/95 backdrop-blur-xl border border-burgundy-100 shadow-2xl rounded-full px-6 py-2 flex items-center justify-between">
          
          {/* 1. Left: Home */}
          <button
            onClick={() => router.push('/student')}
            className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all active:scale-95 ${
              isHomeActive ? 'text-burgundy-900 font-extrabold' : 'text-charcoal-400 font-medium'
            }`}
          >
            <Home size={22} className={isHomeActive ? 'text-burgundy-800' : 'text-charcoal-400'} />
            <span className="text-[10px] mt-0.5">Home</span>
            {isHomeActive && <div className="w-1.5 h-1.5 bg-burgundy-800 rounded-full mt-0.5" />}
          </button>

          {/* 2. Center: Small Action Icon (opens Catalog, ID Pass, My Books menu on click) */}
          <button
            onClick={() => setIsActionMenuOpen(true)}
            className="relative -top-3.5 flex flex-col items-center group active:scale-90 transition-transform"
            aria-label="Open Library Menu"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-burgundy-950 via-burgundy-800 to-rose-600 text-white flex items-center justify-center shadow-burgundy-glow border-3 border-white">
              <Layers size={21} className="drop-shadow-sm group-hover:scale-110 transition-transform" />
            </div>
            <span className={`text-[10px] font-bold mt-0.5 ${isServicesActive ? 'text-burgundy-900' : 'text-charcoal-500'}`}>
              Services
            </span>
          </button>

          {/* 3. Right: Profile */}
          <button
            onClick={() => router.push('/student/profile')}
            className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all active:scale-95 ${
              isProfileActive ? 'text-burgundy-900 font-extrabold' : 'text-charcoal-400 font-medium'
            }`}
          >
            <User size={22} className={isProfileActive ? 'text-burgundy-800' : 'text-charcoal-400'} />
            <span className="text-[10px] mt-0.5">Profile</span>
            {isProfileActive && <div className="w-1.5 h-1.5 bg-burgundy-800 rounded-full mt-0.5" />}
          </button>
        </div>
      </nav>

      {/* QUICK SERVICES ACTION POPUP / BOTTOM SHEET (Revealed on small icon click) */}
      {isActionMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex items-end justify-center p-0 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm"
            onClick={() => setIsActionMenuOpen(false)}
          />

          {/* Bottom Sheet Card */}
          <div className="relative w-full max-w-md bg-white rounded-t-3xl shadow-2xl p-5 pb-8 z-10 animate-in slide-in-from-bottom duration-300 border-t border-burgundy-100 max-h-[85vh] overflow-y-auto">
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-charcoal-200 rounded-full mx-auto mb-4" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-burgundy-50 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-burgundy-100/80 text-burgundy-900 flex items-center justify-center">
                  <Sparkles size={16} className="text-burgundy-700" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-charcoal-900 leading-tight">
                    Library Services Menu
                  </h3>
                  <p className="text-[11px] text-charcoal-500">
                    Quickly access your student privileges
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsActionMenuOpen(false)}
                className="p-1.5 rounded-full text-charcoal-400 hover:text-charcoal-800 hover:bg-burgundy-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Service Action Tiles (Catalog, ID Pass, My Books, Pre-Bookings, Fines, History) */}
            <div className="space-y-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                const isActive = pathname === action.href;
                return (
                  <button
                    key={action.href}
                    onClick={() => navigateTo(action.href)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all active:scale-[0.98] ${
                      isActive
                        ? 'bg-burgundy-800 text-white border-burgundy-900 shadow-burgundy-glow'
                        : 'bg-[#FAF7F7] hover:bg-white border-burgundy-100/80 text-charcoal-900'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                          isActive ? 'bg-white/20 text-white border-white/30' : action.color
                        }`}
                      >
                        <Icon size={19} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold leading-snug ${isActive ? 'text-white' : 'text-charcoal-900'}`}>
                            {action.name}
                          </span>
                          {action.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500 text-white shrink-0">
                              {action.badge}
                            </span>
                          )}
                        </div>
                        <p className={`text-[10px] leading-tight truncate mt-0.5 ${isActive ? 'text-rose-100' : 'text-charcoal-500'}`}>
                          {action.desc}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={16} className={isActive ? 'text-rose-200' : 'text-charcoal-400'} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
