export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  category: string;
  publisher: string;
  edition: string;
  publicationYear: number;
  quantity: number;
  availableQuantity: number;
  shelfLocation: string;
  coverImage: string;
  description: string;
  featured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  bookCount: number;
  colorTag: string;
}

export interface Student {
  id: string;
  studentId: string;
  name: string;
  rollNumber: string;
  email: string;
  phone: string;
  department: string;
  college?: string;
  year: string;
  section: string;
  username: string;
  password?: string;
  status: 'active' | 'inactive';
  profileImage?: string;
  joinedDate: string;
}

export interface MembershipCard {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  department: string;
  year: string;
  membershipId: string;
  appliedDate: string;
  approvedDate?: string;
  expiryDate?: string;
  status: 'pending' | 'approved' | 'rejected';
  photo?: string;
  qrData?: string;
}

export interface BorrowRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  bookId: string;
  bookTitle: string;
  bookCover?: string;
  issueDate: string; // YYYY-MM-DD
  dueDate: string;   // YYYY-MM-DD
  returnDate?: string; // YYYY-MM-DD
  status: 'borrowed' | 'returned' | 'overdue' | 'not_returned';
  fineAmount: number;
  fineStatus: 'none' | 'unpaid' | 'paid';
  remarks?: string;
}

export interface PreBookRequest {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  department: string;
  bookId: string;
  bookTitle: string;
  bookCover?: string;
  author: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  notes?: string;
  pickupDeadline?: string;
}

export interface FineRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  bookTitle: string;
  amount: number;
  reason: string;
  dueDate: string;
  issuedDate: string;
  status: 'unpaid' | 'paid';
  paidDate?: string;
}

export interface LibraryNotification {
  id: string;
  recipientType: 'admin' | 'student' | 'all';
  studentId?: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'alert';
}

export interface UserSession {
  role: 'admin' | 'student';
  id: string;
  username: string;
  name: string;
  studentId?: string;
  email?: string;
  department?: string;
  college?: string;
  rollNumber?: string;
  year?: string;
  section?: string;
  profileImage?: string;
}

