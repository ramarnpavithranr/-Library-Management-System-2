import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'pre-bookings.json');

declare global {
  // eslint-disable-next-line no-var
  var __preBookingsStore: any[] | undefined;
}

function loadPreBookings(): any[] {
  if (global.__preBookingsStore && global.__preBookingsStore.length > 0) {
    return global.__preBookingsStore;
  }

  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        global.__preBookingsStore = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Notice reading pre-bookings from disk:', err);
  }

  const initial: any[] = [
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
      pickupDeadline: '2026-11-20',
      notes: 'Approved. Book held at Circulation Desk counter 2.'
    }
  ];

  global.__preBookingsStore = initial;
  savePreBookings(initial);
  return initial;
}

function savePreBookings(list: any[]) {
  global.__preBookingsStore = list;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.warn('Notice saving pre-bookings to disk:', err);
  }
}

// GET: Retrieve all pre-booking reservations
export async function GET() {
  const list = loadPreBookings();
  return NextResponse.json({ success: true, preBookings: list });
}

// POST: Student submits a new pre-booking reservation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const list = loadPreBookings();

    const {
      studentId,
      studentName,
      rollNumber,
      department,
      bookId,
      bookTitle,
      bookCover,
      author,
      notes,
    } = body || {};

    if (!bookId || !studentId) {
      return NextResponse.json(
        { success: false, message: 'Student ID and Book ID are required.' },
        { status: 400 }
      );
    }

    // Check if already active reservation
    const existing = list.find(
      (p) =>
        (p.studentId === studentId || (rollNumber && p.rollNumber === rollNumber)) &&
        p.bookId === bookId &&
        (p.status === 'pending' || p.status === 'approved')
    );

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'You already have an active reservation for this title.' },
        { status: 400 }
      );
    }

    const newReservation = {
      id: `pb-${Date.now()}`,
      studentId: String(studentId),
      studentName: String(studentName || 'Student Member'),
      rollNumber: String(rollNumber || ''),
      department: String(department || 'Computer Science & Engineering'),
      bookId: String(bookId),
      bookTitle: String(bookTitle || 'Untitled Book'),
      bookCover: bookCover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop',
      author: String(author || 'Unknown Author'),
      requestDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      notes: notes || 'Student online reservation request',
    };

    list.unshift(newReservation);
    savePreBookings(list);

    return NextResponse.json({
      success: true,
      message: `Reservation submitted for "${newReservation.bookTitle}". Waiting for librarian approval.`,
      preBooking: newReservation,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Server error creating pre-booking.' },
      { status: 500 }
    );
  }
}

// PATCH: Admin approves, rejects, or completes reservation
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, pickupDeadline, notes } = body || {};

    if (!id) {
      return NextResponse.json({ success: false, message: 'Reservation ID is required.' }, { status: 400 });
    }

    const list = loadPreBookings();
    const index = list.findIndex((p) => p.id === id);

    if (index === -1) {
      return NextResponse.json({ success: false, message: 'Reservation not found.' }, { status: 404 });
    }

    list[index] = {
      ...list[index],
      ...(status ? { status } : {}),
      ...(pickupDeadline !== undefined ? { pickupDeadline } : {}),
      ...(notes !== undefined ? { notes } : {}),
    };

    savePreBookings(list);

    return NextResponse.json({
      success: true,
      message: `Reservation updated to ${status}.`,
      preBooking: list[index],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Server error updating reservation.' },
      { status: 500 }
    );
  }
}

// DELETE: Cancel or remove a reservation
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Reservation ID required.' }, { status: 400 });
    }

    let list = loadPreBookings();
    list = list.filter((p) => p.id !== id);
    savePreBookings(list);

    return NextResponse.json({ success: true, message: 'Reservation cancelled.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message }, { status: 500 });
  }
}
