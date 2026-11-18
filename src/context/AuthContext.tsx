'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession } from '../types';
import { useLibrary } from './LibraryContext';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient';

interface AuthContextType {
  user: UserSession | null;
  isAdmin: boolean;
  isStudent: boolean;
  loginAdmin: (usernameOrEmail: string, pass: string, remember?: boolean) => Promise<{ success: boolean; message: string }>;
  loginStudent: (usernameOrRoll: string, pass: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isSupabaseConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'ssec_lib_auth_user_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { students } = useLibrary();
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabaseClient = getSupabaseClient();
  const hasSupabase = isSupabaseConfigured() && Boolean(supabaseClient);

  const saveUser = (u: UserSession | null) => {
    setUser(u);
    if (u) {
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
        if (typeof document !== 'undefined') {
          document.cookie = `ssec_user_role=${u.role}; path=/; max-age=604800; SameSite=Lax`;
        }
      } catch (_) {}
    } else {
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        if (typeof document !== 'undefined') {
          document.cookie = `ssec_user_role=; path=/; max-age=0; SameSite=Lax`;
        }
      } catch (_) {}
    }
  };

  // Helper to construct user session from Supabase Auth user
  const resolveSessionUser = async (sUser: any): Promise<UserSession> => {
    const meta = sUser.user_metadata || {};

    // 1. Check if user exists in public."Students" table
    let studentRecord: any = null;
    if (supabaseClient) {
      try {
        const { data } = await supabaseClient
          .from('Students')
          .select('*')
          .or(`auth_id.eq.${sUser.id},email.ilike.${sUser.email}`)
          .limit(1);

        if (Array.isArray(data) && data.length > 0) {
          studentRecord = data[0];
        }
      } catch (_) {}
    }

    if (!studentRecord && students.length > 0) {
      studentRecord = students.find(
        (s) =>
          s.id === sUser.id ||
          s.studentId === sUser.id ||
          s.email?.toLowerCase() === sUser.email?.toLowerCase() ||
          s.username === meta.username
      );
    }

    // If record is in Students table or meta.role is student -> Student Role
    const isStudentUser = Boolean(studentRecord) || meta.role === 'student';

    if (isStudentUser) {
      return {
        role: 'student',
        id: studentRecord?.id || sUser.id,
        studentId: studentRecord?.student_id || studentRecord?.auth_id || meta.studentId || sUser.id,
        username: studentRecord?.Username || studentRecord?.username || meta.username || sUser.email?.split('@')[0] || 'student',
        name: studentRecord?.Name || studentRecord?.name || meta.name || 'Student Member',
        email: sUser.email || studentRecord?.email || '',
        department: studentRecord?.Department || studentRecord?.department || meta.department || 'General Engineering',
        college: studentRecord?.college || meta.college || 'Sree Sakthi Engineering College',
        rollNumber: studentRecord?.['Roll Number'] || studentRecord?.roll_number || meta.roll_number || '',
        year: studentRecord?.year || meta.year || '1st Year',
        section: studentRecord?.section || meta.section || 'A',
        profileImage: studentRecord?.profileImage || meta.profileImage,
      };
    }

    // Otherwise -> Administrator Role
    return {
      role: 'admin',
      id: sUser.id,
      username: meta.username || sUser.email?.split('@')[0] || 'admin',
      name: meta.name || meta.full_name || 'Administrator',
      email: sUser.email || '',
      profileImage:
        meta.profileImage ||
        meta.avatar_url ||
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop',
    };
  };

  // Sync session on mount and listen to Supabase auth events
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        if (hasSupabase && supabaseClient) {
          const { data, error } = await supabaseClient.auth.getSession();
          if (!error && data?.session?.user) {
            const sessionUser = await resolveSessionUser(data.session.user);
            if (isMounted) {
              saveUser(sessionUser);
              setIsLoading(false);
              return;
            }
          }
        }

        // Fallback to stored session if offline
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored && isMounted) {
          try {
            setUser(JSON.parse(stored));
          } catch (_) {}
        }
      } catch (e) {
        console.warn('Notice initializing auth session:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initAuth();

    // Listen to live Supabase Auth state changes (sign in, sign out, token refresh)
    if (hasSupabase && supabaseClient) {
      const { data: authListener } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
          saveUser(null);
        } else if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          const sessionUser = await resolveSessionUser(session.user);
          saveUser(sessionUser);
        }
      });

      return () => {
        isMounted = false;
        authListener.subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, [hasSupabase, students]);

  // 1. REAL ADMIN AUTHENTICATION VIA SUPABASE AUTH
  const loginAdmin = async (
    usernameOrEmail: string,
    pass: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanUser = (usernameOrEmail || '').trim();
    const cleanPass = (pass || '').trim();

    if (!cleanUser || !cleanPass) {
      return { success: false, message: 'Please enter both administrator username/email and password.' };
    }

    if (!hasSupabase || !supabaseClient) {
      return {
        success: false,
        message: 'Supabase Authentication is not configured. Please check your environment settings.',
      };
    }

    try {
      let authEmail = cleanUser;

      // If username provided instead of email, resolve via backend lookup API
      if (!cleanUser.includes('@')) {
        try {
          const lookupRes = await fetch('/api/auth/lookup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: cleanUser, portal: 'admin' }),
          });
          const lookupData = await lookupRes.json();
          if (lookupData?.email) {
            authEmail = lookupData.email;
          } else {
            authEmail = `${cleanUser.toLowerCase()}@sreesakthi.edu.in`;
          }
        } catch (_) {
          authEmail = `${cleanUser.toLowerCase()}@sreesakthi.edu.in`;
        }
      }

      // Real Supabase Authentication: signInWithPassword
      let authResult = await supabaseClient.auth.signInWithPassword({
        email: authEmail,
        password: cleanPass,
      });

      // If initial auth fails, test against alternate administrator accounts
      if (authResult.error) {
        const adminCandidates = [
          'ramarnpavithranr@gmail.com',
          'admin@sreesakthi.edu.in',
          'library@sreesakthi.edu.in',
        ].filter((em) => em.toLowerCase() !== authEmail.toLowerCase());

        for (const candidate of adminCandidates) {
          const fallbackResult = await supabaseClient.auth.signInWithPassword({
            email: candidate,
            password: cleanPass,
          });
          if (!fallbackResult.error && fallbackResult.data?.user) {
            authResult = fallbackResult;
            break;
          }
        }
      }

      if (authResult.error) {
        return {
          success: false,
          message: authResult.error.message || 'Invalid administrator credentials. Please check your username/email and password.',
        };
      }

      const data = authResult.data;

      // Verify role: Ensure student accounts cannot access Admin Portal
      const sUser = data.user;
      const meta = sUser.user_metadata || {};

      let isStudentAccount = meta.role === 'student';
      if (!isStudentAccount) {
        const { data: stuCheck } = await supabaseClient
          .from('Students')
          .select('id')
          .or(`auth_id.eq.${sUser.id},email.ilike.${sUser.email}`)
          .limit(1);

        if (Array.isArray(stuCheck) && stuCheck.length > 0) {
          isStudentAccount = true;
        }
      }

      if (isStudentAccount) {
        await supabaseClient.auth.signOut();
        return {
          success: false,
          message: 'Access Restricted: This account belongs to a Student. Please log in through the Student Portal.',
        };
      }

      const adminSession: UserSession = {
        role: 'admin',
        id: sUser.id,
        username: meta.username || sUser.email?.split('@')[0] || cleanUser,
        name: meta.name || meta.full_name || 'Administrator',
        email: sUser.email || authEmail,
        profileImage:
          meta.profileImage ||
          meta.avatar_url ||
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop',
      };

      saveUser(adminSession);
      return { success: true, message: 'Welcome back, Administrator. Authenticated via Supabase.' };
    } catch (err: any) {
      console.error('Supabase Auth error during admin login:', err);
      return { success: false, message: err?.message || 'Authentication error occurred.' };
    }
  };

  // 2. REAL STUDENT AUTHENTICATION VIA SUPABASE AUTH
  const loginStudent = async (
    usernameOrRoll: string,
    pass: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanUser = (usernameOrRoll || '').trim();
    const cleanPass = (pass || '').trim();

    if (!cleanUser || !cleanPass) {
      return { success: false, message: 'Please enter student username, roll number, or email and password.' };
    }

    if (!hasSupabase || !supabaseClient) {
      return {
        success: false,
        message: 'Supabase Authentication is not configured. Please check your environment settings.',
      };
    }

    try {
      let authEmail = cleanUser;

      // If username or roll number entered, resolve to auth email via backend lookup API
      if (!cleanUser.includes('@')) {
        try {
          const lookupRes = await fetch('/api/auth/lookup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: cleanUser, portal: 'student' }),
          });
          const lookupData = await lookupRes.json();
          if (lookupData?.email) {
            authEmail = lookupData.email;
          } else {
            authEmail = `${cleanUser.toLowerCase()}@sreesakthi.edu.in`;
          }
        } catch (_) {
          authEmail = `${cleanUser.toLowerCase()}@sreesakthi.edu.in`;
        }
      }

      // Real Supabase Authentication: signInWithPassword
      let authResult = await supabaseClient.auth.signInWithPassword({
        email: authEmail,
        password: cleanPass,
      });

      // Fallback: If initial authentication fails, test against candidate student emails
      if (authResult.error) {
        const candidates: string[] = [];

        const defaultEmail = `${cleanUser.toLowerCase()}@sreesakthi.edu.in`;
        if (defaultEmail.toLowerCase() !== authEmail.toLowerCase()) {
          candidates.push(defaultEmail);
        }

        const matchedStudent = students.find(
          (s) =>
            s.rollNumber?.toLowerCase() === cleanUser.toLowerCase() ||
            s.username?.toLowerCase() === cleanUser.toLowerCase() ||
            s.name?.toLowerCase() === cleanUser.toLowerCase()
        );
        if (matchedStudent?.email && !candidates.includes(matchedStudent.email.toLowerCase())) {
          candidates.push(matchedStudent.email.toLowerCase());
        }

        for (const candidate of candidates) {
          const fallbackResult = await supabaseClient.auth.signInWithPassword({
            email: candidate,
            password: cleanPass,
          });
          if (!fallbackResult.error && fallbackResult.data?.user) {
            authResult = fallbackResult;
            break;
          }
        }
      }

      if (authResult.error) {
        return {
          success: false,
          message: authResult.error.message || 'Invalid student credentials. Please check your username/roll number and password.',
        };
      }

      const data = authResult.data;

      if (!data?.user) {
        return { success: false, message: 'Authentication failed. No user record returned by Supabase.' };
      }

      // Verify role: Ensure administrators cannot authenticate through Student Portal
      const sUser = data.user;
      const meta = sUser.user_metadata || {};

      if (meta.role === 'admin') {
        await supabaseClient.auth.signOut();
        return {
          success: false,
          message: 'Access Restricted: This account belongs to an Administrator. Please log in through the Admin Portal.',
        };
      }

      // Fetch student profile from public."Students" table
      let studentRecord: any = null;
      try {
        const { data: dbRows } = await supabaseClient
          .from('Students')
          .select('*')
          .or(`auth_id.eq.${sUser.id},email.ilike.${sUser.email}`)
          .limit(1);

        if (Array.isArray(dbRows) && dbRows.length > 0) {
          studentRecord = dbRows[0];
        }
      } catch (_) {}

      // Check account status if record exists
      if (studentRecord && studentRecord.status === 'inactive') {
        await supabaseClient.auth.signOut();
        return { success: false, message: 'Student account is inactive. Please contact Library Administration.' };
      }

      const studentSession: UserSession = {
        role: 'student',
        id: studentRecord?.id || sUser.id,
        studentId: studentRecord?.student_id || studentRecord?.auth_id || meta.studentId || sUser.id,
        username: studentRecord?.Username || studentRecord?.username || meta.username || cleanUser,
        name: studentRecord?.Name || studentRecord?.name || meta.name || 'Student Member',
        email: sUser.email || studentRecord?.email || authEmail,
        department: studentRecord?.Department || studentRecord?.department || meta.department || 'General Engineering',
        college: studentRecord?.college || meta.college || 'Sree Sakthi Engineering College',
        rollNumber: studentRecord?.['Roll Number'] || studentRecord?.roll_number || meta.roll_number || cleanUser.toUpperCase(),
        year: studentRecord?.year || meta.year || '1st Year',
        section: studentRecord?.section || meta.section || 'A',
        profileImage: studentRecord?.profileImage || meta.profileImage,
      };

      saveUser(studentSession);
      return { success: true, message: `Welcome back, ${studentSession.name}!` };
    } catch (err: any) {
      console.error('Supabase Auth error during student login:', err);
      return { success: false, message: err?.message || 'Authentication error occurred.' };
    }
  };

  const logout = async () => {
    if (hasSupabase && supabaseClient) {
      try {
        await supabaseClient.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut notice:', err);
      }
    }
    saveUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === 'admin',
        isStudent: user?.role === 'student',
        loginAdmin,
        loginStudent,
        logout,
        isLoading,
        isSupabaseConnected: hasSupabase,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
