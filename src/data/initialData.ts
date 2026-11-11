import { Book, Category, Student, MembershipCard, BorrowRecord, PreBookRequest, FineRecord, LibraryNotification } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Artificial Intelligence',
    description: 'Deep Learning, Neural Networks, NLP, and Intelligent Agents',
    icon: 'Cpu',
    bookCount: 142,
    colorTag: '#6E1129'
  },
  {
    id: 'cat-2',
    name: 'Programming',
    description: 'Modern Software Engineering, Rust, Python, Go, and Design Patterns',
    icon: 'Code2',
    bookCount: 215,
    colorTag: '#8E1634'
  },
  {
    id: 'cat-3',
    name: 'Software Engineering',
    description: 'System Architecture, Design Patterns, Agile, and Cloud-Native Development',
    icon: 'Layers',
    bookCount: 98,
    colorTag: '#B42244'
  },
  {
    id: 'cat-4',
    name: 'Computer Networks',
    description: 'TCP/IP, Cybersecurity, Cloud Infrastructure, and Wireless Systems',
    icon: 'Network',
    bookCount: 76,
    colorTag: '#D33D5E'
  },
  {
    id: 'cat-5',
    name: 'Machine Learning',
    description: 'Statistical Learning, Mathematical Foundations, and Scikit-Learn',
    icon: 'Binary',
    bookCount: 110,
    colorTag: '#6E1129'
  },
  {
    id: 'cat-6',
    name: 'Computer Science Core',
    description: 'Data Structures, Algorithms, Compilers, and Operating Systems',
    icon: 'BookOpen',
    bookCount: 180,
    colorTag: '#8E1634'
  },
  {
    id: 'cat-7',
    name: 'Mathematics',
    description: 'Discrete Math, Linear Algebra, Probability, and Numerical Analysis',
    icon: 'Sigma',
    bookCount: 88,
    colorTag: '#B42244'
  },
  {
    id: 'cat-8',
    name: 'Management & Tech',
    description: 'Engineering Leadership, Agile Management, and Product Strategy',
    icon: 'Briefcase',
    bookCount: 64,
    colorTag: '#D33D5E'
  }
];

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'bk-1',
    isbn: '978-0134685991',
    title: 'Clean Architecture: A Craftsman\'s Guide',
    author: 'Robert C. Martin',
    category: 'Programming',
    publisher: 'Prentice Hall',
    edition: '1st Edition',
    publicationYear: 2018,
    quantity: 12,
    availableQuantity: 7,
    shelfLocation: 'Shelf A2-Rack 3',
    coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?q=80&w=600&auto=format&fit=crop',
    description: 'Practical software architecture solutions for building scalable, maintainable, and decoupled enterprise systems with modular design patterns.',
    featured: true
  },
  {
    id: 'bk-2',
    isbn: '978-0262033848',
    title: 'Introduction to Algorithms (CLRS)',
    author: 'Thomas H. Cormen, Charles E. Leiserson',
    category: 'Computer Science Core',
    publisher: 'MIT Press',
    edition: '4th Edition',
    publicationYear: 2022,
    quantity: 20,
    availableQuantity: 4,
    shelfLocation: 'Shelf B1-Rack 1',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop',
    description: 'The world\'s most authoritative algorithms textbook, spanning rigorous graph theory, dynamic programming, and computational complexity analysis.',
    featured: true
  },
  {
    id: 'bk-3',
    isbn: '978-1491950357',
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    category: 'Software Engineering',
    publisher: 'O\'Reilly Media',
    edition: '1st Edition',
    publicationYear: 2017,
    quantity: 15,
    availableQuantity: 0,
    shelfLocation: 'Shelf C3-Rack 2',
    coverImage: 'https://images.unsplash.com/photo-1507842229451-7f01be8610ce?q=80&w=600&auto=format&fit=crop',
    description: 'The definitive guide to distributed data stores, consistency models, replication, partitioning, and batch/stream processing architectures.',
    featured: true
  },
  {
    id: 'bk-4',
    isbn: '978-0262035613',
    title: 'Deep Learning (Adaptive Computation)',
    author: 'Ian Goodfellow, Yoshua Bengio, Aaron Courville',
    category: 'Artificial Intelligence',
    publisher: 'MIT Press',
    edition: '1st Edition',
    publicationYear: 2016,
    quantity: 10,
    availableQuantity: 3,
    shelfLocation: 'Shelf D2-Rack 4',
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop',
    description: 'The definitive deep learning bible covering neural networks, optimization algorithms, convolutional networks, and generative models.',
    featured: true
  },
  {
    id: 'bk-5',
    isbn: '978-1492032649',
    title: 'Hands-On Machine Learning with Scikit-Learn',
    author: 'Aurélien Géron',
    category: 'Machine Learning',
    publisher: 'O\'Reilly Media',
    edition: '3rd Edition',
    publicationYear: 2023,
    quantity: 14,
    availableQuantity: 6,
    shelfLocation: 'Shelf D1-Rack 1',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop',
    description: 'Comprehensive walk-through of end-to-end machine learning pipelines using Python, Scikit-Learn, Keras, and PyTorch.',
    featured: false
  },
  {
    id: 'bk-6',
    isbn: '978-0133594140',
    title: 'Computer Networking: A Top-Down Approach',
    author: 'James F. Kurose, Keith W. Ross',
    category: 'Computer Networks',
    publisher: 'Pearson',
    edition: '8th Edition',
    publicationYear: 2021,
    quantity: 18,
    availableQuantity: 8,
    shelfLocation: 'Shelf E2-Rack 3',
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=600&auto=format&fit=crop',
    description: 'Top-down exploration of computer networks, application layer protocols, transport reliability, IP routing, and network security.',
    featured: false
  },
  {
    id: 'bk-7',
    isbn: '978-0131103627',
    title: 'The C Programming Language',
    author: 'Brian W. Kernighan, Dennis M. Ritchie',
    category: 'Programming',
    publisher: 'Prentice Hall',
    edition: '2nd Edition',
    publicationYear: 1988,
    quantity: 8,
    availableQuantity: 2,
    shelfLocation: 'Shelf A1-Rack 1',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop',
    description: 'The foundational classic textbook on the C language by its inventors. Pointer arithmetic, system memory control, and data abstraction.',
    featured: false
  },
  {
    id: 'bk-8',
    isbn: '978-1593279288',
    title: 'The Rust Programming Language',
    author: 'Steve Klabnik, Carol Nichols',
    category: 'Programming',
    publisher: 'No Starch Press',
    edition: '2nd Edition',
    publicationYear: 2023,
    quantity: 10,
    availableQuantity: 5,
    shelfLocation: 'Shelf A3-Rack 2',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop',
    description: 'Official guide to memory safety without garbage collection, concurrency primitives, traits, and fearless systems engineering.',
    featured: true
  },
  {
    id: 'bk-9',
    isbn: '978-0073383095',
    title: 'Discrete Mathematics and Its Applications',
    author: 'Kenneth H. Rosen',
    category: 'Mathematics',
    publisher: 'McGraw-Hill',
    edition: '8th Edition',
    publicationYear: 2019,
    quantity: 16,
    availableQuantity: 11,
    shelfLocation: 'Shelf M1-Rack 2',
    coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=600&auto=format&fit=crop',
    description: 'Foundations of mathematical logic, set theory, combinatorics, graph theory, and proof techniques for computer science.',
    featured: false
  },
  {
    id: 'bk-10',
    isbn: '978-0321573513',
    title: 'Algorithms in a Nutshell',
    author: 'George T. Heineman',
    category: 'Computer Science Core',
    publisher: 'O\'Reilly Media',
    edition: '2nd Edition',
    publicationYear: 2016,
    quantity: 12,
    availableQuantity: 9,
    shelfLocation: 'Shelf B2-Rack 4',
    coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=600&auto=format&fit=crop',
    description: 'Quick-reference problem solving guide to sorting, searching, computational geometry, and combinatorial algorithms in practice.',
    featured: false
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'stu-1',
    studentId: 'STU-2024-001',
    name: 'Brett Adams',
    rollNumber: '22CS045',
    email: 'brett.adams@sreesakthi.edu.in',
    phone: '+91 98450 12345',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    section: 'A',
    username: 'brett.adams',
    password: '',
    status: 'active',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
    joinedDate: '2022-08-15'
  },
  {
    id: 'stu-2',
    studentId: 'STU-2024-002',
    name: 'Sophia Chen',
    rollNumber: '22AI012',
    email: 'sophia.chen@sreesakthi.edu.in',
    phone: '+91 98765 43210',
    department: 'Artificial Intelligence & Data Science',
    year: '3rd Year',
    section: 'B',
    username: 'sophia.chen',
    password: '',
    status: 'active',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop',
    joinedDate: '2022-08-15'
  },
  {
    id: 'stu-3',
    studentId: 'STU-2024-003',
    name: 'Rahul Sharma',
    rollNumber: '23IT088',
    email: 'rahul.sharma@sreesakthi.edu.in',
    phone: '+91 97123 45678',
    department: 'Information Technology',
    year: '2nd Year',
    section: 'A',
    username: 'rahul.sharma',
    password: '',
    status: 'active',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    joinedDate: '2023-08-10'
  },
  {
    id: 'stu-4',
    studentId: 'STU-2024-004',
    name: 'Priya Patel',
    rollNumber: '21CS102',
    email: 'priya.patel@sreesakthi.edu.in',
    phone: '+91 96543 21098',
    department: 'Computer Science & Engineering',
    year: '4th Year',
    section: 'C',
    username: 'priya.patel',
    password: '',
    status: 'active',
    profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop',
    joinedDate: '2021-08-20'
  },
  {
    id: 'stu-5',
    studentId: 'STU-2024-005',
    name: 'David Miller',
    rollNumber: '23EC034',
    email: 'david.miller@sreesakthi.edu.in',
    phone: '+91 99887 66554',
    department: 'Electronics & Communication',
    year: '2nd Year',
    section: 'B',
    username: 'david.miller',
    password: '',
    status: 'inactive',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
    joinedDate: '2023-08-10'
  }
];

export const INITIAL_MEMBERSHIPS: MembershipCard[] = [
  {
    id: 'mem-2',
    studentId: 'STU-2024-002',
    studentName: 'Sophia Chen',
    rollNumber: '22AI012',
    department: 'Artificial Intelligence & Data Science',
    year: '3rd Year',
    membershipId: 'LIB-MEM-2024-9104',
    appliedDate: '2024-01-15',
    approvedDate: '2024-01-16',
    expiryDate: '2026-06-30',
    status: 'approved',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop',
    qrData: 'APEX-LIB-MEM:22AI012:LIB-MEM-2024-9104'
  },
  {
    id: 'mem-3',
    studentId: 'STU-2024-003',
    studentName: 'Rahul Sharma',
    rollNumber: '23IT088',
    department: 'Information Technology',
    year: '2nd Year',
    membershipId: 'LIB-MEM-PENDING-003',
    appliedDate: '2026-11-02',
    status: 'pending',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop'
  }
];

export const INITIAL_BORROW_RECORDS: BorrowRecord[] = [
  {
    id: 'br-1',
    studentId: 'STU-2024-001',
    studentName: 'Brett Adams',
    rollNumber: '22CS045',
    bookId: 'bk-1',
    bookTitle: 'Clean Architecture: A Craftsman\'s Guide',
    bookCover: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?q=80&w=600&auto=format&fit=crop',
    issueDate: '2026-10-25',
    dueDate: '2026-11-09',
    status: 'borrowed',
    fineAmount: 0,
    fineStatus: 'none',
    remarks: 'Issued for Software Architecture Lab'
  },
  {
    id: 'br-2',
    studentId: 'STU-2024-001',
    studentName: 'Brett Adams',
    rollNumber: '22CS045',
    bookId: 'bk-2',
    bookTitle: 'Introduction to Algorithms (CLRS)',
    bookCover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop',
    issueDate: '2026-10-10',
    dueDate: '2026-10-24',
    status: 'overdue',
    fineAmount: 70, // 14 days overdue * $5 / ₹5
    fineStatus: 'unpaid',
    remarks: '14 days overdue. Notification sent.'
  },
  {
    id: 'br-3',
    studentId: 'STU-2024-002',
    studentName: 'Sophia Chen',
    rollNumber: '22AI012',
    bookId: 'bk-4',
    bookTitle: 'Deep Learning (Adaptive Computation)',
    bookCover: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop',
    issueDate: '2026-10-28',
    dueDate: '2026-11-12',
    status: 'borrowed',
    fineAmount: 0,
    fineStatus: 'none'
  },
  {
    id: 'br-4',
    studentId: 'STU-2024-004',
    studentName: 'Priya Patel',
    rollNumber: '21CS102',
    bookId: 'bk-6',
    bookTitle: 'Computer Networking: A Top-Down Approach',
    bookCover: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=600&auto=format&fit=crop',
    issueDate: '2026-10-01',
    dueDate: '2026-10-15',
    returnDate: '2026-10-14',
    status: 'returned',
    fineAmount: 0,
    fineStatus: 'none',
    remarks: 'Returned in excellent condition'
  },
  {
    id: 'br-5',
    studentId: 'STU-2024-003',
    studentName: 'Rahul Sharma',
    rollNumber: '23IT088',
    bookId: 'bk-7',
    bookTitle: 'The C Programming Language',
    bookCover: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop',
    issueDate: '2026-09-15',
    dueDate: '2026-09-29',
    status: 'not_returned',
    fineAmount: 195, // 39 days overdue
    fineStatus: 'unpaid',
    remarks: 'Student has not returned after multiple warnings'
  }
];

export const INITIAL_PRE_BOOKINGS: PreBookRequest[] = [
  {
    id: 'pb-1',
    studentId: 'STU-2024-001',
    studentName: 'Brett Adams',
    rollNumber: '22CS045',
    department: 'Computer Science & Engineering',
    bookId: 'bk-3',
    bookTitle: 'Designing Data-Intensive Applications',
    bookCover: 'https://images.unsplash.com/photo-1507842229451-7f01be8610ce?q=80&w=600&auto=format&fit=crop',
    author: 'Martin Kleppmann',
    requestDate: '2026-11-05',
    status: 'pending',
    notes: 'Reserved as all 15 copies currently checked out'
  },
  {
    id: 'pb-2',
    studentId: 'STU-2024-002',
    studentName: 'Sophia Chen',
    rollNumber: '22AI012',
    department: 'Artificial Intelligence & Data Science',
    bookId: 'bk-8',
    bookTitle: 'The Rust Programming Language',
    bookCover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop',
    author: 'Steve Klabnik, Carol Nichols',
    requestDate: '2026-11-04',
    status: 'approved',
    pickupDeadline: '2026-11-10',
    notes: 'Approved. Book held at Circulation Desk counter 2.'
  },
  {
    id: 'pb-3',
    studentId: 'STU-2024-004',
    studentName: 'Priya Patel',
    rollNumber: '21CS102',
    department: 'Computer Science & Engineering',
    bookId: 'bk-5',
    bookTitle: 'Hands-On Machine Learning with Scikit-Learn',
    bookCover: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop',
    author: 'Aurélien Géron',
    requestDate: '2026-10-20',
    status: 'completed',
    pickupDeadline: '2026-10-25',
    notes: 'Fulfilled on 2026-10-22'
  }
];

export const INITIAL_FINES: FineRecord[] = [
  {
    id: 'fn-1',
    studentId: 'STU-2024-001',
    studentName: 'Brett Adams',
    rollNumber: '22CS045',
    bookTitle: 'Introduction to Algorithms (CLRS)',
    amount: 70,
    reason: 'Overdue return (14 days @ $5/day)',
    dueDate: '2026-10-24',
    issuedDate: '2026-10-25',
    status: 'unpaid'
  },
  {
    id: 'fn-2',
    studentId: 'STU-2024-003',
    studentName: 'Rahul Sharma',
    rollNumber: '23IT088',
    bookTitle: 'The C Programming Language',
    amount: 195,
    reason: 'Severely overdue (39 days)',
    dueDate: '2026-09-29',
    issuedDate: '2026-09-30',
    status: 'unpaid'
  },
  {
    id: 'fn-3',
    studentId: 'STU-2024-004',
    studentName: 'Priya Patel',
    rollNumber: '21CS102',
    bookTitle: 'Operating System Concepts',
    amount: 25,
    reason: 'Overdue return (5 days)',
    dueDate: '2026-09-10',
    issuedDate: '2026-09-11',
    status: 'paid',
    paidDate: '2026-09-16'
  }
];

export const INITIAL_NOTIFICATIONS: LibraryNotification[] = [
  {
    id: 'notif-1',
    recipientType: 'student',
    studentId: 'STU-2024-001',
    title: 'Book Overdue Alert',
    message: 'Introduction to Algorithms (CLRS) was due on 24 Oct 2026. Fine is accruing at $5/day.',
    timestamp: '2 hours ago',
    read: false,
    type: 'warning'
  },
  {
    id: 'notif-2',
    recipientType: 'student',
    studentId: 'STU-2024-001',
    title: 'Pre-Book Request Under Review',
    message: 'Your pre-book reservation for "Designing Data-Intensive Applications" is pending librarian approval.',
    timestamp: 'Yesterday',
    read: true,
    type: 'info'
  },
  {
    id: 'notif-3',
    recipientType: 'admin',
    title: 'New Membership Application',
    message: 'Rahul Sharma (23IT088) has submitted a library membership application.',
    timestamp: '3 hours ago',
    read: false,
    type: 'info'
  },
  {
    id: 'notif-4',
    recipientType: 'admin',
    title: 'Pending Pre-Book Queue',
    message: '1 new book reservation request waiting for approval.',
    timestamp: '5 hours ago',
    read: false,
    type: 'alert'
  }
];

