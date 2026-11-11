'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession } from '../types';
import { useLibrary } from './LibraryContext';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient';

interface AuthContextType {
  user: UserSession | null;
  isAdmin: boolean;
  isStudent: boolean;
  loginAdmin: (username: string, pass: string, remember?: boolean) => Promise<{ success: boolean; message: string }>;
  loginStudent: (username: string, pass: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  switchDemoRole: (role: 'admin' | 'student', studentUsername?: string) => void;
  isLoading: boolean;
  isSupabaseConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'ssec_lib_auth_user_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { students } = useLibrary();
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabaseClient = getSupabaseClient();
  const hasSupabase = isSupabaseConfigured() && Boolean(supabaseClient);

  // Sync session on mount and listen to Supabase auth events
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        // 1. If Supabase is configured, check active Supabase Auth session
        if (hasSupabase && supabaseClient) {
          const { data, error } = await supabaseClient.auth.getSession();
          if (!error && data?.session?.user) {
            const sUser = data.session.user;
            const meta = sUser.user_metadata || {};
            let storedRole: 'admin' | 'student' | null = null;
            try {
              const raw = localStorage.getItem(AUTH_STORAGE_KEY);
              if (raw) storedRole = JSON.parse(raw)?.role || null;
            } catch (_) {}

            const role: 'admin' | 'student' =
              storedRole === 'admin' ||
              meta.role === 'admin' ||
              sUser.email?.includes('admin') ||
              sUser.email?.includes('librarian')
                ? 'admin'
                : 'student';

            // Find matching student details if student
            const matchedStudent = students.find(
              (s) =>
                s.id === sUser.id ||
                s.studentId === sUser.id ||
                s.email?.toLowerCase() === sUser.email?.toLowerCase() ||
                s.username === meta.username ||
                s.rollNumber === meta.roll_number
            );

            const sessionUser: UserSession = {
              role,
              id: matchedStudent?.id || sUser.id,
              username: matchedStudent?.username || meta.username || sUser.email?.split('@')[0] || (role === 'admin' ? 'admin' : 'student'),
              name: meta.name || matchedStudent?.name || (role === 'admin' ? 'Prof. Julian Vance' : 'Student Member'),
              email: sUser.email || matchedStudent?.email || '',
              studentId: matchedStudent?.studentId || matchedStudent?.id || meta.studentId || sUser.id,
              department: matchedStudent?.department || meta.department,
              rollNumber: matchedStudent?.rollNumber || meta.roll_number || meta.rollNumber,
              profileImage: matchedStudent?.profileImage || meta.profileImage,
              year: matchedStudent?.year || meta.year,
            };

            if (isMounted) {
              setUser(sessionUser);
              localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));
            }
            return;
          }
        }

        // 2. Fall back to local stored session if not on Supabase
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored && isMounted) {
          setUser(JSON.parse(stored));
        }
      } catch (e) {
        console.warn('Failed to initialize session:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initAuth();

    // 3. Supabase Auth State Change Listener
    if (hasSupabase && supabaseClient) {
      const { data: authListener } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
          saveUser(null);
        } else if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          const sUser = session.user;
          const meta = sUser.user_metadata || {};
          let storedRole: 'admin' | 'student' | null = null;
          try {
            const raw = localStorage.getItem(AUTH_STORAGE_KEY);
            if (raw) storedRole = JSON.parse(raw)?.role || null;
          } catch (_) {}

          const role: 'admin' | 'student' =
            storedRole === 'admin' ||
            meta.role === 'admin' ||
            sUser.email?.includes('admin') ||
            sUser.email?.includes('librarian')
              ? 'admin'
              : 'student';

          const matchedStudent = students.find(
            (s) =>
              s.id === sUser.id ||
              s.studentId === sUser.id ||
              s.email?.toLowerCase() === sUser.email?.toLowerCase() ||
              s.username === meta.username ||
              s.rollNumber === meta.roll_number
          );

          const sessionUser: UserSession = {
            role,
            id: matchedStudent?.id || sUser.id,
            username: matchedStudent?.username || meta.username || sUser.email?.split('@')[0] || (role === 'admin' ? 'admin' : 'student'),
            name: meta.name || matchedStudent?.name || (role === 'admin' ? 'Prof. Julian Vance' : 'Student Member'),
            email: sUser.email || matchedStudent?.email || '',
            studentId: matchedStudent?.studentId || matchedStudent?.id || meta.studentId || sUser.id,
            department: matchedStudent?.department || meta.department,
            rollNumber: matchedStudent?.rollNumber || meta.roll_number || meta.rollNumber,
            profileImage: matchedStudent?.profileImage || meta.profileImage,
            year: matchedStudent?.year || meta.year,
          };
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

  const saveUser = (u: UserSession | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  // 1. Admin Authentication with Supabase Auth
  const loginAdmin = async (
    username: string,
    pass: string,
    remember: boolean = true
  ): Promise<{ success: boolean; message: string }> => {
    const cleanUser = (username || '').trim();
    const cleanPass = (pass || '').trim();

    if (!cleanUser || !cleanPass) {
      return { success: false, message: 'Please enter both administrator username and password.' };
    }

    if (!hasSupabase || !supabaseClient) {
      return {
        success: false,
        message: 'Supabase Authentication is not configured. Please check your .env.local settings.',
      };
    }

    try {
      // Supabase signInWithPassword expects an email.
      // 1. If admin provided an email, use it directly.
      // 2. If admin provided a username/alias, attempt institutional format fallbacks.
      const candidateEmails: string[] = [];
      if (cleanUser.includes('@')) {
        candidateEmails.push(cleanUser);
      } else {
        candidateEmails.push(`${cleanUser.toLowerCase()}@sreesakthi.edu.in`);
        if (cleanUser.toLowerCase() === 'admin') {
          candidateEmails.push('library@sreesakthi.edu.in');
        }
        candidateEmails.push(cleanUser);
      }

      let authData: any = null;
      let lastErrorMessage = 'Invalid Admin credentials.';

      for (const candidateEmail of candidateEmails) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email: candidateEmail,
          password: cleanPass,
        });

        if (!error && data?.user) {
          authData = data;
          break;
        } else if (error) {
          lastErrorMessage = error.message;
        }
      }

      if (authData?.user) {
        const sUser = authData.user;
        const meta = sUser.user_metadata || {};
        const adminSession: UserSession = {
          role: 'admin',
          id: sUser.id,
          username: meta.username || sUser.email?.split('@')[0] || cleanUser,
          name: meta.name || meta.full_name || 'Administrator',
          email: sUser.email || (cleanUser.includes('@') ? cleanUser : `${cleanUser}@sreesakthi.edu.in`),
          profileImage:
            meta.profileImage ||
            meta.avatar_url ||
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop',
        };
        saveUser(adminSession);
        return { success: true, message: 'Welcome back, Administrator. Authenticated via Supabase.' };
      }

      return { success: false, message: lastErrorMessage };
    } catch (err: any) {
      console.warn('Supabase Auth error during admin login:', err);
      return { success: false, message: err?.message || 'Authentication error occurred.' };
    }
  };

  // 2. Student Authentication with Supabase Authentication
  const loginStudent = async (
    username: string,
    pass: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanUser = (username || '').trim().toLowerCase();
    const cleanPass = (pass || '').trim();

    if (!cleanUser || !cleanPass) {
      return { success: false, message: 'Please enter student username and password.' };
    }

    if (!hasSupabase || !supabaseClient) {
      return {
        success: false,
        message: 'Supabase Authentication is not configured. Please check your .env.local settings.',
      };
    }

    // 1. Locate student record from local state / cache
    let matched = students.find(
      (s) =>
        s.username.toLowerCase() === cleanUser ||
        s.email.toLowerCase() === cleanUser ||
        s.studentId.toLowerCase() === cleanUser ||
        s.rollNumber.toLowerCase() === cleanUser
    );

    // 2. Query existing Supabase 'Students' / 'students' table directly if not in memory
    if (!matched) {
      try {
        let supaData: any[] | null = null;
        const res1 = await supabaseClient
          .from('Students')
          .select('*')
          .or(`username.ilike.${cleanUser},roll_number.ilike.${cleanUser}`)
          .limit(1);

        if (!res1.error && Array.isArray(res1.data) && res1.data.length > 0) {
          supaData = res1.data;
        } else {
          const res2 = await supabaseClient
            .from('students')
            .select('*')
            .or(`username.ilike.${cleanUser},roll_number.ilike.${cleanUser}`)
            .limit(1);
          if (!res2.error && Array.isArray(res2.data)) {
            supaData = res2.data;
          }
        }

        if (supaData && supaData.length > 0) {
          const row = supaData[0];
          matched = {
            id: row.id,
            studentId: row.student_id || row.id,
            username: row.username || row.Username,
            name: row.name || row.Name || 'Student Member',
            rollNumber: row.roll_number || row['Roll number'] || row['Roll Number'] || row.rollNumber || '',
            email: row.email || `${(row.username || cleanUser).toLowerCase()}@sreesakthi.edu.in`,
            phone: row.phone || '',
            department: row.department || row.Department || 'Computer Science & Engineering',
            year: row.year || row.Year || '1st Year',
            section: row.section || row.Section || 'A',
            status: (row.status === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive',
            joinedDate: row.created_at
              ? new Date(row.created_at).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0],
          };
        }
      } catch (err) {
        console.warn('Supabase student lookup notice:', err);
      }
    }

    // Check account status if record exists
    if (matched && matched.status === 'inactive') {
      return { success: false, message: 'Account is inactive. Please contact Library Administration.' };
    }

    // 3. Assemble candidate emails for Supabase Auth
    const candidateEmails: string[] = [];
    if (cleanUser.includes('@')) {
      candidateEmails.push(cleanUser);
    } else {
      if (matched?.email) candidateEmails.push(matched.email.toLowerCase());
      if (matched?.username) candidateEmails.push(`${matched.username.toLowerCase()}@sreesakthi.edu.in`);
      if (matched?.rollNumber) candidateEmails.push(`${matched.rollNumber.toLowerCase()}@sreesakthi.edu.in`);
      candidateEmails.push(`${cleanUser}@sreesakthi.edu.in`);
      candidateEmails.push(cleanUser);
    }

    const uniqueEmails = Array.from(new Set(candidateEmails));
    let authData: any = null;
    let authError: any = null;

    // 4. Authenticate student securely using Supabase Auth signInWithPassword
    for (const emailToTry of uniqueEmails) {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: emailToTry,
        password: cleanPass,
      });

      if (!error && data?.user) {
        authData = data;
        authError = null;
        break;
      } else if (error) {
        authError = error;
        // If Supabase returns 'Email not confirmed', the password is verified as valid by Supabase
        if (error.message?.toLowerCase().includes('email not confirmed')) {
          authData = {
            user: {
              id: matched?.id || `stu-${cleanUser}`,
              email: emailToTry,
              user_metadata: {
                username: matched?.username || cleanUser,
                name: matched?.name || 'Student Member',
                roll_number: matched?.rollNumber || cleanUser.toUpperCase(),
                department: matched?.department || 'Computer Science & Engineering',
                college: matched?.college || 'Sree Sakthi Engineering College',
                year: matched?.year || '1st Year',
                section: matched?.section || 'A',
                role: 'student',
              },
            },
          };
          authError = null;
          break;
        }
      }
    }

    if (authData?.user) {
      const sUser = authData.user;
      const meta = sUser.user_metadata || {};

      // 5. Link the Supabase Auth user to the corresponding record in the students table
      const linkedStudent =
        matched ||
        students.find(
          (s) =>
            s.id === sUser.id ||
            s.studentId === sUser.id ||
            s.username.toLowerCase() === (meta.username || cleanUser).toLowerCase() ||
            s.rollNumber.toLowerCase() === (meta.roll_number || cleanUser).toLowerCase() ||
            s.email.toLowerCase() === (sUser.email || '').toLowerCase()
        );

      const studentSession: UserSession = {
        role: 'student',
        id: linkedStudent?.id || sUser.id,
        studentId: linkedStudent?.studentId || linkedStudent?.id || sUser.id,
        username: linkedStudent?.username || meta.username || cleanUser,
        name: linkedStudent?.name || meta.name || 'Student Member',
        email: sUser.email || linkedStudent?.email || `${cleanUser}@sreesakthi.edu.in`,
        department: linkedStudent?.department || meta.department || 'Computer Science & Engineering',
        college: linkedStudent?.college || meta.college || 'Sree Sakthi Engineering College',
        rollNumber: linkedStudent?.rollNumber || meta.roll_number || meta.rollNumber || cleanUser.toUpperCase(),
        year: linkedStudent?.year || meta.year || '1st Year',
        section: linkedStudent?.section || meta.section || 'A',
        profileImage: linkedStudent?.profileImage || meta.profileImage,
      };

      saveUser(studentSession);
      return { success: true, message: `Welcome back, ${studentSession.name}!` };
    }

    // Specific user-facing error messages
    if (!matched) {
      return {
        success: false,
        message: 'Username not found. Please verify your student username or contact Library Administration.',
      };
    }

    if (
      authError?.message?.toLowerCase().includes('invalid login credentials') ||
      authError?.message?.toLowerCase().includes('invalid grant')
    ) {
      return {
        success: false,
        message: 'Incorrect password. Please verify your password and try again.',
      };
    }

    return {
      success: false,
      message:
        authError?.message ||
        'Invalid student credentials. Please verify your username and password, or contact Library Administration.',
    };
  };

  const logout = async () => {
    if (hasSupabase && supabaseClient) {
      try {
        await supabaseClient.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut error:', err);
      }
    }
    saveUser(null);
  };

  const switchDemoRole = (role: 'admin' | 'student', studentUsername: string = 'brett.adams') => {
    if (role === 'admin') {
      const adminSession: UserSession = {
        role: 'admin',
        id: 'adm-01',
        username: 'admin',
        name: 'Prof. Julian Vance',
        email: 'librarian@sreesakthi.edu.in',
        profileImage:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop',
      };
      saveUser(adminSession);
    } else {
      const student = students.find((s) => s.username === studentUsername) || students[0];
      const studentSession: UserSession = {
        role: 'student',
        id: student.id,
        studentId: student.studentId,
        username: student.username,
        name: student.name,
        email: student.email,
        department: student.department,
        rollNumber: student.rollNumber,
        profileImage: student.profileImage,
      };
      saveUser(studentSession);
    }
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
        switchDemoRole,
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
