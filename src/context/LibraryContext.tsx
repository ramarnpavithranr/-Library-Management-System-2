'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Book,
  Category,
  Student,
  MembershipCard,
  BorrowRecord,
  PreBookRequest,
  FineRecord,
  LibraryNotification,
} from '../types';
import {
  INITIAL_BOOKS,
  INITIAL_CATEGORIES,
  INITIAL_STUDENTS,
  INITIAL_MEMBERSHIPS,
  INITIAL_BORROW_RECORDS,
  INITIAL_PRE_BOOKINGS,
  INITIAL_FINES,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData';
import { ENV } from '@/config/env';
import { getSupabaseClient, createEphemeralAuthClient } from '@/lib/supabaseClient';

interface LibraryContextType {
  books: Book[];
  categories: Category[];
  students: Student[];
  memberships: MembershipCard[];
  borrowRecords: BorrowRecord[];
  preBookings: PreBookRequest[];
  fines: FineRecord[];
  notifications: LibraryNotification[];

  // Statistics
  stats: {
    totalBooks: number;
    totalStudents: number;
    totalCategories: number;
    totalAuthors: number;
    availableBooks: number;
    borrowedBooks: number;
    returnedBooks: number;
    notReturnedBooks: number;
    overdueBooks: number;
    totalFines: number;
    pendingMemberships: number;
    pendingPreBooks: number;
  };

  // Book methods
  addBook: (book: Omit<Book, 'id'>) => Book;
  bulkAddBooks: (books: Omit<Book, 'id'>[]) => number;
  updateBook: (id: string, book: Partial<Book>) => void;
  deleteBook: (id: string) => void;
  getBook: (id: string) => Book | undefined;

  // Category methods
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Student methods
  addStudent: (student: Omit<Student, 'id' | 'joinedDate'>) => Promise<{ success: boolean; message?: string; student?: Student }>;
  bulkAddStudents: (students: Omit<Student, 'id' | 'joinedDate'>[]) => number;
  updateStudent: (id: string, student: Partial<Student>) => void;
  changeStudentPassword: (studentId: string, currentPass: string, newPass: string) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };

  // Issue & Return
  issueBook: (studentId: string, bookId: string, dueDate: string, remarks?: string) => { success: boolean; message: string };
  returnBook: (borrowId: string, returnDate?: string) => { success: boolean; fineCalculated: number };

  // Pre-Bookings
  requestPreBook: (studentId: string, bookId: string, notes?: string) => { success: boolean; message: string };
  updatePreBookStatus: (id: string, status: PreBookRequest['status'], pickupDeadline?: string, notes?: string) => void;

  // Membership
  applyForMembership: (
    studentId: string,
    photoOrData?: string | {
      studentName?: string;
      rollNumber?: string;
      department?: string;
      year?: string;
      phone?: string;
      email?: string;
      photo?: string;
    }
  ) => { success: boolean; message: string };
  approveMembership: (membershipId: string) => void;
  rejectMembership: (membershipId: string) => void;
  resetStudentMembership: (studentId: string) => void;

  // Fines
  addFine: (fine: Omit<FineRecord, 'id'>) => void;
  payFine: (fineId: string) => void;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Demo state reset
  resetAllData: () => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

const STORAGE_KEYS = {
  BOOKS: 'ssec_admin_books_v3',
  CATEGORIES: 'ssec_lib_categories_v3',
  STUDENTS: 'ssec_admin_students_v3',
  MEMBERSHIPS: 'ssec_lib_memberships_v3',
  BORROW_RECORDS: 'ssec_lib_borrows_v3',
  PRE_BOOKINGS: 'ssec_lib_prebooks_v3',
  FINES: 'ssec_lib_fines_v3',
  NOTIFICATIONS: 'ssec_lib_notifs_v3',
};

const BASE_CATEGORIES: Category[] = INITIAL_CATEGORIES.map(c => ({ ...c, bookCount: 0 }));

export const mapSupabaseBookToFrontend = (row: any): Book => ({
  id: String(row.id || row.book_id || row.Book_id || `bk-${Date.now()}`),
  title: row.title || row.Title || 'Untitled Book',
  author: row.author || row.Author || 'Unknown Author',
  category: row.category || row.Category || 'Computer Science Core',
  isbn: row.ISBN || row.isbn || '',
  quantity: Number(row.available_quantity || row.quantity || row.Available_quantity || 1),
  availableQuantity: Number(row.available_quantity || row.availableQuantity || row.Available_quantity || 1),
  shelfLocation: row.shelfLocation || row.shelf_location || row['Shelf Location'] || 'Main Stacks',
  coverImage: row.coverImage || row.cover_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop',
  description: row.description || '',
  edition: row.edition || '1st Edition',
  publisher: row.publisher || 'Academic Press',
  publicationYear: Number(row.publicationYear || row.publication_year) || 2024,
});

export const mapFrontendBookToSupabase = (b: Book | Omit<Book, 'id'>, id?: string) => ({
  id: id || (b as any).id || `bk-${Date.now()}`,
  book_id: (b as any).id || id || `bk-${Date.now()}`,
  title: b.title,
  author: b.author,
  category: b.category,
  ISBN: b.isbn || (b as any).ISBN || '',
  available_quantity: typeof b.availableQuantity === 'number' ? b.availableQuantity : b.quantity,
});

export const mapSupabaseStudentToFrontend = (row: any): Student => ({
  id: String(row.id || `stu-${Date.now()}`),
  studentId: row.student_id || row.studentId || row.id || (row.username ? `STU-${row.username}` : `STU-${Date.now()}`),
  username: row.username || row.Username || '',
  name: row.name || row.Name || 'Student Member',
  rollNumber: row.roll_number || row['Roll number'] || row['Roll Number'] || row.rollNumber || '',
  email: row.email || row.Email || (row.username ? `${String(row.username).toLowerCase()}@sreesakthi.edu.in` : ''),
  phone: row.phone || '',
  department: row.department || row.Department || 'Computer Science & Engineering',
  college: row.college || row.College || 'Sree Sakthi Engineering College',
  year: row.year || row.Year || '1st Year',
  section: row.section || row.Section || 'A',
  password: '',
  status: (row.status === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive',
  profileImage: row.profileImage || row.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
  joinedDate: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
});

export const mapFrontendStudentToSupabase = (s: Student | Omit<Student, 'id' | 'joinedDate'>, id?: string) => ({
  id: id || (s as any).id || `stu-${Date.now()}`,
  username: s.username,
  name: s.name,
  roll_number: s.rollNumber || (s as any).roll_number || '',
  college: s.college || '',
});

const safeSupabaseSync = async (task: () => PromiseLike<any>) => {
  try {
    const res = await task();
    if (res?.error) {
      console.warn('Supabase sync notice:', res.error.message);
    }
    return res;
  } catch (err) {
    console.warn('Supabase operation warning:', err);
    return null;
  }
};

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>(BASE_CATEGORIES);
  const [students, setStudents] = useState<Student[]>([]);
  const [memberships, setMemberships] = useState<MembershipCard[]>([]);
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>([]);
  const [preBookings, setPreBookings] = useState<PreBookRequest[]>([]);
  const [fines, setFines] = useState<FineRecord[]>([]);
  const [notifications, setNotifications] = useState<LibraryNotification[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage and Supabase on mount
  useEffect(() => {
    let localBooks: Book[] = [];
    let localStudents: Student[] = [];

    try {
      const storedBooks = localStorage.getItem(STORAGE_KEYS.BOOKS);
      const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      const storedStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      const storedMemberships = localStorage.getItem(STORAGE_KEYS.MEMBERSHIPS);
      const storedBorrows = localStorage.getItem(STORAGE_KEYS.BORROW_RECORDS);
      const storedPreBooks = localStorage.getItem(STORAGE_KEYS.PRE_BOOKINGS);
      const storedFines = localStorage.getItem(STORAGE_KEYS.FINES);
      const storedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);

      if (storedBooks) {
        localBooks = JSON.parse(storedBooks);
        setBooks(localBooks);
      }
      if (storedStudents) {
        localStudents = JSON.parse(storedStudents);
        setStudents(localStudents);
      }
      if (storedCategories) setCategories(JSON.parse(storedCategories));
      if (storedMemberships) setMemberships(JSON.parse(storedMemberships));
      if (storedBorrows) setBorrowRecords(JSON.parse(storedBorrows));
      if (storedPreBooks) setPreBookings(JSON.parse(storedPreBooks));
      if (storedFines) setFines(JSON.parse(storedFines));
      if (storedNotifs) setNotifications(JSON.parse(storedNotifs));
    } catch (e) {
      console.warn('Failed to parse stored library data', e);
    } finally {
      setIsLoaded(true);
    }

    // Connect to Supabase tables 'Books' / 'books' and 'Students' / 'students'
    const supabase = getSupabaseClient();
    if (supabase) {
      safeSupabaseSync(async () => {
        let bData: any[] | null = null;
        const res1 = await supabase.from('Books').select('*');
        if (!res1.error && Array.isArray(res1.data) && res1.data.length > 0) {
          bData = res1.data;
        } else {
          const res2 = await supabase.from('books').select('*');
          if (!res2.error && Array.isArray(res2.data)) {
            bData = res2.data;
          }
        }
        if (bData && bData.length > 0) {
          setBooks(bData.map(mapSupabaseBookToFrontend));
        }
      });

      safeSupabaseSync(async () => {
        let sData: any[] | null = null;
        const res1 = await supabase.from('Students').select('*');
        if (!res1.error && Array.isArray(res1.data) && res1.data.length > 0) {
          sData = res1.data;
        } else {
          const res2 = await supabase.from('students').select('*');
          if (!res2.error && Array.isArray(res2.data)) {
            sData = res2.data;
          }
        }

        if (sData && sData.length > 0) {
          const mapped = sData.map(mapSupabaseStudentToFrontend);
          setStudents((prev) => {
            const merged = [...mapped];
            prev.forEach((localS) => {
              if (
                !merged.some(
                  (m) =>
                    m.id === localS.id ||
                    (m.username && localS.username && m.username.toLowerCase() === localS.username.toLowerCase())
                )
              ) {
                merged.push(localS);
              }
            });
            return merged;
          });
        }
      });
    }
  }, []);

  // Dynamically update category book counts to match existing books
  useEffect(() => {
    if (!isLoaded) return;
    setCategories(prev =>
      prev.map(cat => ({
        ...cat,
        bookCount: books.filter(b => (b.category || '').toLowerCase() === cat.name.toLowerCase()).length
      }))
    );
  }, [books, isLoaded]);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
      localStorage.setItem(STORAGE_KEYS.MEMBERSHIPS, JSON.stringify(memberships));
      localStorage.setItem(STORAGE_KEYS.BORROW_RECORDS, JSON.stringify(borrowRecords));
      localStorage.setItem(STORAGE_KEYS.PRE_BOOKINGS, JSON.stringify(preBookings));
      localStorage.setItem(STORAGE_KEYS.FINES, JSON.stringify(fines));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [books, categories, students, memberships, borrowRecords, preBookings, fines, notifications, isLoaded]);

  // Derived statistics
  const totalBooks = books.reduce((sum, b) => sum + (b.quantity || 0), 0);
  const availableBooks = books.reduce((sum, b) => sum + (b.availableQuantity || 0), 0);
  const borrowedBooks = borrowRecords.filter(r => r.status === 'borrowed').length;
  const returnedBooks = borrowRecords.filter(r => r.status === 'returned').length;
  const notReturnedBooks = borrowRecords.filter(r => r.status === 'not_returned').length;
  const overdueBooks = borrowRecords.filter(r => r.status === 'overdue').length;
  const totalFines = fines.filter(f => f.status === 'unpaid').reduce((sum, f) => sum + f.amount, 0);
  const pendingMemberships = memberships.filter(m => m.status === 'pending').length;
  const pendingPreBooks = preBookings.filter(p => p.status === 'pending').length;
  const totalStudents = students.length;
  const totalCategories = categories.length;
  const uniqueAuthors = new Set(books.map(b => b.author.trim()));
  const totalAuthors = uniqueAuthors.size;

  const stats = {
    totalBooks,
    totalStudents,
    totalCategories,
    totalAuthors,
    availableBooks,
    borrowedBooks,
    returnedBooks,
    notReturnedBooks,
    overdueBooks,
    totalFines,
    pendingMemberships,
    pendingPreBooks,
  };

  // Book methods
  const addBook = (bookData: Omit<Book, 'id'>) => {
    const newBook: Book = {
      ...bookData,
      id: `bk-${Date.now()}`
    };
    setBooks(prev => [newBook, ...prev]);

    // Sync to Supabase books table
    const supabase = getSupabaseClient();
    if (supabase) {
      safeSupabaseSync(() => supabase.from('books').insert([mapFrontendBookToSupabase(newBook, newBook.id)]));
    }

    return newBook;
  };

  const bulkAddBooks = (newBooksData: Omit<Book, 'id'>[]): number => {
    if (!newBooksData || newBooksData.length === 0) return 0;
    const now = Date.now();
    const createdBooks: Book[] = newBooksData.map((b, idx) => ({
      ...b,
      id: `bk-${now}-${idx}`,
      availableQuantity: typeof b.availableQuantity === 'number' ? b.availableQuantity : b.quantity,
      status: (b as any).status || 'available',
      rating: (b as any).rating || 4.5,
      coverImage: b.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop',
      description: b.description || 'Institutional library acquisition for engineering courses.'
    }));

    setBooks(prev => [...createdBooks, ...prev]);

    // Sync to Supabase books table
    const supabase = getSupabaseClient();
    if (supabase) {
      const supaRows = createdBooks.map(b => mapFrontendBookToSupabase(b, b.id));
      safeSupabaseSync(() => supabase.from('books').insert(supaRows));
    }

    setNotifications(prev => [
      {
        id: `notif-${now}`,
        recipientType: 'admin',
        title: 'Excel Books Imported Successfully',
        message: `Successfully imported ${createdBooks.length} new book titles into the college catalogue.`,
        timestamp: 'Just now',
        read: false,
        type: 'success'
      },
      ...prev
    ]);

    return createdBooks.length;
  };

  const updateBook = (id: string, updates: Partial<Book>) => {
    setBooks(prev => prev.map(b => (b.id === id ? { ...b, ...updates } : b)));
    const supabase = getSupabaseClient();
    if (supabase) {
      safeSupabaseSync(() => supabase.from('books').update(updates).eq('id', id));
    }
  };

  const deleteBook = (id: string) => {
    setBooks(prev => prev.filter(b => b.id !== id));
    const supabase = getSupabaseClient();
    if (supabase) {
      safeSupabaseSync(() => supabase.from('books').delete().eq('id', id));
    }
  };

  const getBook = (id: string) => books.find(b => b.id === id);

  // Category methods
  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...categoryData,
      id: `cat-${Date.now()}`
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Student methods
  const addStudent = async (
    studentData: Omit<Student, 'id' | 'joinedDate'>
  ): Promise<{ success: boolean; message?: string; student?: Student }> => {
    const studentUsername = (studentData.username || '').trim().toLowerCase();
    const studentRoll = (studentData.rollNumber || '').trim().toUpperCase();
    const studentEmail = (studentData.email || `${studentUsername}@sreesakthi.edu.in`).trim().toLowerCase();

    // 1. Pre-check in local memory for duplicate username or roll number
    const duplicate = students.find(
      (s) =>
        s.username.toLowerCase() === studentUsername ||
        s.rollNumber.toUpperCase() === studentRoll
    );
    if (duplicate) {
      const field = duplicate.username.toLowerCase() === studentUsername ? 'Username' : 'Roll number';
      return {
        success: false,
        message: `${field} "${duplicate.username.toLowerCase() === studentUsername ? studentUsername : studentRoll}" is already registered to ${duplicate.name}.`,
      };
    }

    let assignedId = `stu-${Date.now()}`;
    const provisionMessage = `Student account for ${studentData.name} (${studentUsername}) provisioned successfully!`;

    // 2. Call server-side API route handler /api/admin/create-student
    try {
      const res = await fetch('/api/admin/create-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: studentUsername,
          password: studentData.password,
          name: studentData.name,
          rollNumber: studentRoll,
          department: studentData.department,
          college: studentData.college || 'Sree Sakthi Engineering College',
          year: studentData.year,
          section: studentData.section,
          email: studentEmail,
          phone: studentData.phone,
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        if (data.user?.id) assignedId = data.user.id;
        if (data.authNotice) {
          console.info('Supabase Auth notice:', data.authNotice);
        }
      } else if (!res.ok && data?.message) {
        // Return duplicate or validation error directly to the Admin
        return {
          success: false,
          message: data.message,
        };
      } else {
        console.warn('Backend student provisioning notice:', data?.message);
      }
    } catch (err: any) {
      console.warn('Network notice during student provisioning:', err?.message);
    }

    // 3. Assemble complete newStudent record
    const newStudent: Student = {
      ...studentData,
      id: assignedId,
      studentId: studentData.studentId || assignedId,
      email: studentEmail,
      username: studentUsername,
      rollNumber: studentRoll,
      college: studentData.college || 'Sree Sakthi Engineering College',
      password: '', // Plaintext password is NEVER stored in database or memory
      status: studentData.status || 'active',
      joinedDate: new Date().toISOString().split('T')[0],
      profileImage:
        studentData.profileImage ||
        `https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop`,
    };

    // 4. Update React state immediately so student appears in Student Records list instantly
    setStudents((prev) => [newStudent, ...prev.filter((s) => s.username?.toLowerCase() !== studentUsername)]);

    // 5. Synchronously persist to LocalStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      const existing: Student[] = stored ? JSON.parse(stored) : [];
      const updated = [newStudent, ...existing.filter((s) => s.username?.toLowerCase() !== studentUsername)];
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updated));
    } catch (storageErr) {
      console.warn('LocalStorage save error:', storageErr);
    }

    return {
      success: true,
      message: provisionMessage,
      student: newStudent,
    };
  };

  const bulkAddStudents = (newStudentsData: Omit<Student, 'id' | 'joinedDate'>[]): number => {
    if (!newStudentsData || newStudentsData.length === 0) return 0;
    const now = Date.now();
    const today = new Date().toISOString().split('T')[0];
    const supabase = getSupabaseClient();
    const ephemeralClient = createEphemeralAuthClient();

    const createdStudents: Student[] = newStudentsData.map((s, idx) => {
      const studentUsername = (s.username || '').trim().toLowerCase();
      const studentEmail = (s.email || `${studentUsername}@sreesakthi.edu.in`).trim().toLowerCase();
      const assignedId = `stu-${now}-${idx}`;

      if (ephemeralClient && s.password && s.password.length >= 6) {
        ephemeralClient.auth
          .signUp({
            email: studentEmail,
            password: s.password,
            options: {
              data: {
                username: studentUsername,
                name: s.name,
                roll_number: s.rollNumber,
                role: 'student',
                department: s.department,
                year: s.year,
                section: s.section,
              },
            },
          })
          .then((res) => {
            const authId = res.data?.user?.id;
            if (authId) {
              setStudents((prev) =>
                prev.map((item) =>
                  item.id === assignedId ? { ...item, id: authId, studentId: authId } : item
                )
              );
              if (supabase) {
                safeSupabaseSync(() =>
                  supabase.from('students').update({ id: authId }).eq('id', assignedId)
                );
              }
            }
          })
          .catch(() => {});
      }

      return {
        ...s,
        id: assignedId,
        studentId: s.studentId || assignedId,
        email: studentEmail,
        joinedDate: today,
        status: s.status || 'active',
        password: '', // Plaintext password is NEVER stored in database
        profileImage:
          s.profileImage ||
          `https://images.unsplash.com/photo-${1534528741775 + (idx % 10)}?q=80&w=400&auto=format&fit=crop`,
      };
    });

    setStudents((prev) => [...createdStudents, ...prev]);

    // Save to localStorage synchronously
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      const existing: Student[] = stored ? JSON.parse(stored) : [];
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([...createdStudents, ...existing]));
    } catch (storageErr) {
      console.warn('LocalStorage save error in bulkAddStudents:', storageErr);
    }

    // Sync to Supabase students table (only id, username, name, roll_number)
    if (supabase) {
      const supaRows = createdStudents.map((s) => ({
        id: s.id,
        username: s.username,
        name: s.name,
        roll_number: s.rollNumber,
      }));
      safeSupabaseSync(async () => {
        const r1 = await supabase.from('Students').insert(supaRows);
        if (r1.error) {
          await supabase.from('students').insert(supaRows);
        }
      });
    }

    setNotifications((prev) => [
      {
        id: `notif-${now}`,
        recipientType: 'admin',
        title: 'Excel Students Imported Successfully',
        message: `Successfully provisioned ${createdStudents.length} student records from Excel.`,
        timestamp: 'Just now',
        read: false,
        type: 'success',
      },
      ...prev,
    ]);

    return createdStudents.length;
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id || s.studentId === id ? { ...s, ...updates } : s))
    );
    const supabase = getSupabaseClient();
    if (supabase) {
      const allowedCols: any = {};
      if (updates.name !== undefined) allowedCols.name = updates.name;
      if (updates.username !== undefined) allowedCols.username = updates.username;
      if (updates.rollNumber !== undefined) allowedCols.roll_number = updates.rollNumber;
      if (Object.keys(allowedCols).length > 0) {
        safeSupabaseSync(() =>
          supabase.from('students').update(allowedCols).or(`id.eq.${id},username.eq.${id}`)
        );
      }
    }
  };

  const changeStudentPassword = async (
    studentId: string,
    currentPass: string,
    newPass: string
  ): Promise<{ success: boolean; message: string }> => {
    const student = students.find((s) => s.studentId === studentId || s.id === studentId);
    if (!student) {
      return { success: false, message: 'Student record not found.' };
    }
    if (newPass.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters long.' };
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.auth.updateUser({ password: newPass });
        if (error) {
          return { success: false, message: error.message };
        }
      } catch (err: any) {
        return { success: false, message: err?.message || 'Failed to update password.' };
      }
    }
    return { success: true, message: 'Password updated successfully in Supabase Authentication!' };
  };

  // Issue Book
  const issueBook = (studentId: string, bookId: string, dueDate: string, remarks?: string) => {
    const student = students.find(s => s.studentId === studentId || s.id === studentId);
    const book = books.find(b => b.id === bookId);

    if (!student) return { success: false, message: 'Selected student does not exist.' };
    if (!book) return { success: false, message: 'Selected book does not exist.' };
    if (book.availableQuantity <= 0) return { success: false, message: 'No copies of this book are currently available.' };

    const issueDateStr = new Date().toISOString().split('T')[0];

    const newRecord: BorrowRecord = {
      id: `br-${Date.now()}`,
      studentId: student.studentId,
      studentName: student.name,
      rollNumber: student.rollNumber,
      bookId: book.id,
      bookTitle: book.title,
      bookCover: book.coverImage,
      issueDate: issueDateStr,
      dueDate,
      status: 'borrowed',
      fineAmount: 0,
      fineStatus: 'none',
      remarks: remarks || 'Issued by Librarian'
    };

    // Decrease book available count
    setBooks(prev =>
      prev.map(b => (b.id === book.id ? { ...b, availableQuantity: b.availableQuantity - 1 } : b))
    );

    // Add record
    setBorrowRecords(prev => [newRecord, ...prev]);

    // Send notification
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        recipientType: 'student',
        studentId: student.studentId,
        title: 'Book Issued Successfully',
        message: `"${book.title}" has been issued to you. Due date: ${dueDate}.`,
        timestamp: 'Just now',
        read: false,
        type: 'success'
      },
      ...prev
    ]);

    return { success: true, message: `Successfully issued "${book.title}" to ${student.name}.` };
  };

  // Return Book
  const returnBook = (borrowId: string, returnDate?: string) => {
    const record = borrowRecords.find(r => r.id === borrowId);
    if (!record) return { success: false, fineCalculated: 0 };

    const returnDateStr = returnDate || new Date().toISOString().split('T')[0];

    // Calculate overdue
    const dueTime = new Date(record.dueDate).getTime();
    const returnTime = new Date(returnDateStr).getTime();
    const diffDays = Math.ceil((returnTime - dueTime) / (1000 * 60 * 60 * 24));
    const overdueDays = diffDays > 0 ? diffDays : 0;
    const fineAmount = overdueDays * ENV.FINE_PER_DAY; // Configurable fine per overdue day from ENV

    // Mark record returned
    setBorrowRecords(prev =>
      prev.map(r =>
        r.id === borrowId
          ? {
              ...r,
              returnDate: returnDateStr,
              status: 'returned',
              fineAmount,
              fineStatus: fineAmount > 0 ? 'unpaid' : 'none'
            }
          : r
      )
    );

    // Increase book available quantity
    setBooks(prev =>
      prev.map(b => (b.id === record.bookId ? { ...b, availableQuantity: b.availableQuantity + 1 } : b))
    );

    // If fine occurred, create fine record
    if (fineAmount > 0) {
      const newFine: FineRecord = {
        id: `fn-${Date.now()}`,
        studentId: record.studentId,
        studentName: record.studentName,
        rollNumber: record.rollNumber,
        bookTitle: record.bookTitle,
        amount: fineAmount,
        reason: `Overdue return (${overdueDays} days @ $5/day)`,
        dueDate: record.dueDate,
        issuedDate: returnDateStr,
        status: 'unpaid'
      };
      setFines(prev => [newFine, ...prev]);

      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          recipientType: 'student',
          studentId: record.studentId,
          title: 'Fine Incurred on Late Return',
          message: `Late return for "${record.bookTitle}". Overdue: ${overdueDays} days. Fine due: $${fineAmount}.`,
          timestamp: 'Just now',
          read: false,
          type: 'warning'
        },
        ...prev
      ]);
    }

    return { success: true, fineCalculated: fineAmount };
  };

  // Pre-Bookings
  const requestPreBook = (studentId: string, bookId: string, notes?: string) => {
    const student = students.find(s => s.studentId === studentId || s.id === studentId);
    const book = books.find(b => b.id === bookId);

    if (!student || !book) return { success: false, message: 'Invalid student or book.' };

    const existingRequest = preBookings.find(
      p => p.studentId === student.studentId && p.bookId === book.id && (p.status === 'pending' || p.status === 'approved')
    );
    if (existingRequest) {
      return { success: false, message: 'You already have an active reservation for this title.' };
    }

    const newRequest: PreBookRequest = {
      id: `pb-${Date.now()}`,
      studentId: student.studentId,
      studentName: student.name,
      rollNumber: student.rollNumber,
      department: student.department,
      bookId: book.id,
      bookTitle: book.title,
      bookCover: book.coverImage,
      author: book.author,
      requestDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      notes: notes || 'Student online reservation request'
    };

    setPreBookings(prev => [newRequest, ...prev]);

    // Admin notification
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        recipientType: 'admin',
        title: 'New Book Pre-Book Request',
        message: `${student.name} requested to reserve "${book.title}".`,
        timestamp: 'Just now',
        read: false,
        type: 'info'
      },
      ...prev
    ]);

    return { success: true, message: `Reservation submitted for "${book.title}". Waiting for librarian approval.` };
  };

  const updatePreBookStatus = (
    id: string,
    status: PreBookRequest['status'],
    pickupDeadline?: string,
    notes?: string
  ) => {
    setPreBookings(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              status,
              ...(pickupDeadline ? { pickupDeadline } : {}),
              ...(notes ? { notes } : {})
            }
          : p
      )
    );

    const req = preBookings.find(p => p.id === id);
    if (req) {
      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          recipientType: 'student',
          studentId: req.studentId,
          title: `Pre-Book Request ${status.toUpperCase()}`,
          message:
            status === 'approved'
              ? `Your reservation for "${req.bookTitle}" has been approved! Pick it up before ${pickupDeadline || '7 days'}.`
              : `Your reservation for "${req.bookTitle}" was marked as ${status}.`,
          timestamp: 'Just now',
          read: false,
          type: status === 'approved' ? 'success' : 'alert'
        },
        ...prev
      ]);
    }
  };

  // Membership
  const applyForMembership = (
    studentId: string,
    photoOrData?: string | {
      studentName?: string;
      rollNumber?: string;
      department?: string;
      year?: string;
      phone?: string;
      email?: string;
      photo?: string;
    }
  ) => {
    const student = students.find(s => s.studentId === studentId || s.id === studentId);
    if (!student) return { success: false, message: 'Student profile not found.' };

    const existing = memberships.find(m => m.studentId === student.studentId);
    if (existing && existing.status === 'approved') {
      return { success: false, message: 'You already have an active Digital Membership Card!' };
    }
    if (existing && existing.status === 'pending') {
      return { success: false, message: 'Your application is already pending approval.' };
    }

    const isObj = typeof photoOrData === 'object' && photoOrData !== null;
    const photo = isObj ? photoOrData.photo : photoOrData;
    const studentName = (isObj && photoOrData.studentName) || student.name;
    const rollNumber = (isObj && photoOrData.rollNumber) || student.rollNumber;
    const department = (isObj && photoOrData.department) || student.department;
    const year = (isObj && photoOrData.year) || student.year;

    // Also update student profile if phone/email/photo changed
    if (isObj && (photoOrData.phone || photoOrData.email || photoOrData.photo)) {
      setStudents(prev =>
        prev.map(s =>
          s.studentId === student.studentId
            ? {
                ...s,
                ...(photoOrData.phone ? { phone: photoOrData.phone } : {}),
                ...(photoOrData.email ? { email: photoOrData.email } : {}),
                ...(photoOrData.photo ? { profileImage: photoOrData.photo } : {}),
                ...(photoOrData.studentName ? { name: photoOrData.studentName } : {}),
                ...(photoOrData.department ? { department: photoOrData.department } : {}),
                ...(photoOrData.year ? { year: photoOrData.year } : {}),
              }
            : s
        )
      );
    }

    const newApp: MembershipCard = {
      id: `mem-${Date.now()}`,
      studentId: student.studentId,
      studentName,
      rollNumber,
      department,
      year,
      membershipId: `LIB-MEM-PENDING-${Date.now().toString().slice(-4)}`,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      photo: photo || student.profileImage
    };

    setMemberships(prev => [newApp, ...prev.filter(m => m.studentId !== student.studentId)]);

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        recipientType: 'admin',
        title: 'New Membership Application',
        message: `${studentName} (${rollNumber}) applied for a Digital Library Card.`,
        timestamp: 'Just now',
        read: false,
        type: 'info'
      },
      ...prev
    ]);

    return { success: true, message: 'Membership application submitted successfully!' };
  };

  const approveMembership = (membershipId: string) => {
    const issueDate = new Date();
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 2); // 2 year validity

    const issueDateStr = issueDate.toISOString().split('T')[0];
    const expiryDateStr = expiry.toISOString().split('T')[0];
    const generatedId = `LIB-MEM-2024-${Math.floor(1000 + Math.random() * 9000)}`;

    setMemberships(prev =>
      prev.map(m => {
        if (m.id === membershipId || m.membershipId === membershipId) {
          return {
            ...m,
            status: 'approved',
            membershipId: generatedId,
            approvedDate: issueDateStr,
            expiryDate: expiryDateStr,
            qrData: `SSEC-LIB-MEM:${m.rollNumber}:${generatedId}`
          };
        }
        return m;
      })
    );

    const mem = memberships.find(m => m.id === membershipId || m.membershipId === membershipId);
    if (mem) {
      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          recipientType: 'student',
          studentId: mem.studentId,
          title: 'Digital Library Card Approved! 🎉',
          message: `Your smart library membership is now active. Card ID: ${generatedId}.`,
          timestamp: 'Just now',
          read: false,
          type: 'success'
        },
        ...prev
      ]);
    }
  };

  const rejectMembership = (membershipId: string) => {
    setMemberships(prev =>
      prev.map(m => (m.id === membershipId || m.membershipId === membershipId ? { ...m, status: 'rejected' } : m))
    );
  };

  const resetStudentMembership = (studentId: string) => {
    setMemberships(prev => prev.filter(m => m.studentId !== studentId));
  };

  // Fine Management
  const addFine = (fineData: Omit<FineRecord, 'id'>) => {
    const newFine: FineRecord = {
      ...fineData,
      id: `fn-${Date.now()}`
    };
    setFines(prev => [newFine, ...prev]);
  };

  const payFine = (fineId: string) => {
    const paidDate = new Date().toISOString().split('T')[0];
    setFines(prev =>
      prev.map(f => (f.id === fineId ? { ...f, status: 'paid', paidDate } : f))
    );
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Reset data
  const resetAllData = () => {
    localStorage.clear();
    setBooks([]);
    setStudents([]);
    setCategories(BASE_CATEGORIES);
    setMemberships([]);
    setBorrowRecords([]);
    setPreBookings([]);
    setFines([]);
    setNotifications([]);
  };

  return (
    <LibraryContext.Provider
      value={{
        books,
        categories,
        students,
        memberships,
        borrowRecords,
        preBookings,
        fines,
        notifications,
        stats,
        addBook,
        bulkAddBooks,
        updateBook,
        deleteBook,
        getBook,
        addCategory,
        updateCategory,
        deleteCategory,
        addStudent,
        bulkAddStudents,
        updateStudent,
        changeStudentPassword,
        issueBook,
        returnBook,
        requestPreBook,
        updatePreBookStatus,
        applyForMembership,
        approveMembership,
        rejectMembership,
        resetStudentMembership,
        addFine,
        payFine,
        markNotificationAsRead,
        markAllNotificationsRead,
        resetAllData,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};

