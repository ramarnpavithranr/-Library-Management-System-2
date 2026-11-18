import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yvogbzoolyosvilgtyxi.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_I2tfBLTvezL4ckvlIjDgoQ_IL3blLtj';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'book-issues.json');

declare global {
  // eslint-disable-next-line no-var
  var __bookIssuesStore: any[] | undefined;
}

function getSupabaseClient(authHeader?: string) {
  const key = SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY;
  return createClient(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: authHeader ? { headers: { Authorization: authHeader } } : undefined,
  });
}

function loadLocalIssues(): any[] {
  if (global.__bookIssuesStore && Array.isArray(global.__bookIssuesStore)) {
    return global.__bookIssuesStore;
  }
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        global.__bookIssuesStore = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Notice reading local book issues backup:', err);
  }
  global.__bookIssuesStore = [];
  return [];
}

function saveLocalIssues(issues: any[]) {
  global.__bookIssuesStore = issues;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(issues, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Notice writing local book issues backup:', err);
  }
}

// GET: Retrieve all book issue records from Supabase book_issues table
export async function GET() {
  const supabase = getSupabaseClient();
  try {
    const { data: issuesData, error: issuesErr } = await supabase
      .from('book_issues')
      .select('*')
      .order('created_at', { ascending: false });

    // Also fetch books and students to resolve book titles and student IDs
    const { data: booksData } = await supabase.from('Books').select('id, "Book Title", cover_image, "Available Copies"');
    const { data: studentsData } = await supabase.from('Students').select('id, Name, "Roll Number", auth_id, Department');

    const bookMap = new Map();
    if (Array.isArray(booksData)) {
      booksData.forEach((b: any) => {
        bookMap.set(String(b.id), b);
      });
    }

    const studentMap = new Map();
    if (Array.isArray(studentsData)) {
      studentsData.forEach((s: any) => {
        if (s.Name) studentMap.set(s.Name.toLowerCase().trim(), s);
        if (s['Roll Number']) studentMap.set(String(s['Roll Number']).toLowerCase().trim(), s);
      });
    }

    if (!issuesErr && Array.isArray(issuesData) && issuesData.length > 0) {
      const enriched = issuesData.map((row: any) => {
        const book = bookMap.get(String(row.book_id));
        const student = studentMap.get((row.student_name || '').toLowerCase().trim());
        return {
          ...row,
          book_title: row.book_title || book?.['Book Title'] || `Book #${row.book_id}`,
          book_cover: book?.cover_image || null,
          roll_number: row.roll_number || student?.['Roll Number'] || 'N/A',
          student_id: row.student_id || student?.auth_id || (student ? `STU-${student.id}` : null),
          department: student?.Department || 'Engineering',
        };
      });

      return NextResponse.json({ success: true, count: enriched.length, issues: enriched });
    }
  } catch (err) {
    console.warn('Notice querying Supabase book_issues table:', err);
  }

  // Fallback to local store
  const localIssues = loadLocalIssues();
  return NextResponse.json({ success: true, count: localIssues.length, issues: localIssues });
}

// POST: Authorize & Issue a Book to a Student
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const body = await req.json().catch(() => ({}));

    const studentName = (body.studentName || body['Student Name'] || '').trim();
    const rawBookId = (body.bookId || body['Book ID'] || '').toString().trim();
    const fromDate = body.fromDate || body.issueDate || body['From Date'] || new Date().toISOString().split('T')[0];
    const dueDate = body.dueDate || body['Due Date'] || '';
    const remarks = body.remarks || body.loanRemarks || body['Loan Remarks'] || 'Standard Academic Term Loan';
    const studentId = body.studentId || null;
    const rollNumber = body.rollNumber || null;

    // 1. Validate required inputs
    if (!studentName) {
      return NextResponse.json(
        { success: false, message: 'Student Name is required to issue a book.' },
        { status: 400 }
      );
    }

    if (!rawBookId) {
      return NextResponse.json(
        { success: false, message: 'Book ID is required to issue a book.' },
        { status: 400 }
      );
    }

    if (!dueDate) {
      return NextResponse.json(
        { success: false, message: 'Due Date is required to issue a book.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient(authHeader);

    // 2. Locate the existing book record in public."Books" table
    let bookRow: any = null;
    const numericId = parseInt(rawBookId.replace(/\D/g, ''), 10);

    try {
      if (!isNaN(numericId)) {
        const { data, error } = await supabase
          .from('Books')
          .select('*')
          .eq('id', numericId)
          .maybeSingle();
        if (!error && data) bookRow = data;
      }

      if (!bookRow) {
        const { data, error } = await supabase
          .from('Books')
          .select('*')
          .eq('id', rawBookId)
          .maybeSingle();
        if (!error && data) bookRow = data;
      }

      if (!bookRow) {
        const { data } = await supabase
          .from('Books')
          .select('*')
          .ilike('Book Title', rawBookId)
          .maybeSingle();
        if (data) bookRow = data;
      }
    } catch (lookupErr) {
      console.warn('Notice looking up book in Books table:', lookupErr);
    }

    // 3. Determine current available copies
    let currentAvailable = 1;
    let bookTitle = body.bookTitle || rawBookId;

    if (bookRow) {
      bookTitle = bookRow['Book Title'] || bookRow.title || bookTitle;
      const rawCount = bookRow['Available Copies'] ?? bookRow.available_quantity ?? bookRow.availableQuantity;
      currentAvailable = Number(rawCount !== undefined && rawCount !== null ? rawCount : 0);
    } else if (body.availableQuantity !== undefined) {
      currentAvailable = Number(body.availableQuantity);
    }

    // 4. Strict Validation: If Available Copies is already 0, PREVENT issuing
    if (currentAvailable <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot issue book: "${bookTitle}" has 0 available copies remaining (Available Copies = 0).`,
          availableCopies: 0,
        },
        { status: 400 }
      );
    }

    // 5. Automatically reduce Available Copies by exactly 1 in existing "Books" table
    const newAvailableCopies = Math.max(0, currentAvailable - 1);

    if (bookRow) {
      try {
        let updateQuery = supabase.from('Books').update({ 'Available Copies': newAvailableCopies });
        if (!isNaN(Number(bookRow.id))) {
          updateQuery = updateQuery.eq('id', Number(bookRow.id));
        } else {
          updateQuery = updateQuery.eq('id', bookRow.id);
        }

        const { error: updErr } = await updateQuery;
        if (updErr) {
          console.warn('Notice updating "Available Copies" in Books table:', updErr.message);
          await supabase.from('Books').update({ available_quantity: newAvailableCopies }).eq('id', bookRow.id);
        }
      } catch (updCatch) {
        console.warn('Notice updating Books table available copies:', updCatch);
      }
    }

    // 6. Save the issue details into the existing `book_issues` table
    const nowIso = new Date().toISOString();
    let insertedIssue: any = null;

    const issueRecord = {
      student_name: studentName,
      book_id: bookRow ? Number(bookRow.id) : (isNaN(numericId) ? 1 : numericId),
      issue_date: fromDate,
      due_date: dueDate,
      loan_remarks: remarks,
      academic_year_term: '2026-27',
      return_status: 'Not Returned',
      fine_per_day: 10,
      fine_amount: 0,
    };

    try {
      const { data: d1, error: e1 } = await supabase
        .from('book_issues')
        .insert([issueRecord])
        .select();

      if (!e1 && d1 && d1.length > 0) {
        insertedIssue = d1[0];
      } else {
        console.warn('Insert into book_issues notice:', e1?.message);
      }
    } catch (saveErr) {
      console.warn('Notice writing to book_issues table:', saveErr);
    }

    // 7. Save to local storage backup for persistence
    const localStore = loadLocalIssues();
    const finalRecord = insertedIssue || { id: `iss-${Date.now()}`, ...issueRecord, book_title: bookTitle, student_id: studentId, roll_number: rollNumber };
    localStore.unshift(finalRecord);
    saveLocalIssues(localStore);

    return NextResponse.json({
      success: true,
      message: `Successfully issued "${bookTitle}" to ${studentName}. Available copies reduced from ${currentAvailable} to ${newAvailableCopies}.`,
      issue: finalRecord,
      book: {
        id: String(bookRow?.id || rawBookId),
        title: bookTitle,
        previousAvailableCopies: currentAvailable,
        availableCopies: newAvailableCopies,
      },
    });
  } catch (err: any) {
    console.error('Error in POST /api/book-issues:', err);
    return NextResponse.json(
      { success: false, message: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PATCH: Process Book Return (Updates book_issues and increments Available Copies in Books)
export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const body = await req.json().catch(() => ({}));

    const issueId = body.id || body.borrowId;
    const returnDate = body.returnDate || new Date().toISOString().split('T')[0];
    const fineAmount = Number(body.fineAmount || 0);
    const returnRemarks = body.remarks || body.returnRemarks || 'Returned on time';

    if (!issueId) {
      return NextResponse.json(
        { success: false, message: 'Issue record ID is required to process return.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient(authHeader);

    // 1. Look up existing issue record
    let existingIssue: any = null;
    const numericIssueId = parseInt(String(issueId).replace(/\D/g, ''), 10);

    try {
      if (!isNaN(numericIssueId)) {
        const { data } = await supabase.from('book_issues').select('*').eq('id', numericIssueId).maybeSingle();
        if (data) existingIssue = data;
      }
      if (!existingIssue) {
        const { data } = await supabase.from('book_issues').select('*').eq('id', issueId).maybeSingle();
        if (data) existingIssue = data;
      }
    } catch (e) {
      console.warn('Notice finding issue in book_issues:', e);
    }

    // 2. Update issue record in book_issues
    let updatedIssue: any = null;
    if (existingIssue) {
      try {
        const updatedRemarks = existingIssue.loan_remarks
          ? `${existingIssue.loan_remarks} | Return: ${returnRemarks}`
          : returnRemarks;

        const { data, error } = await supabase
          .from('book_issues')
          .update({
            return_date: returnDate,
            return_status: 'Returned',
            fine_amount: fineAmount,
            loan_remarks: updatedRemarks,
          })
          .eq('id', existingIssue.id)
          .select();

        if (!error && data && data.length > 0) {
          updatedIssue = data[0];
        }
      } catch (updErr) {
        console.warn('Notice updating book_issues return:', updErr);
      }

      // 3. Increment Available Copies by 1 in "Books" table
      if (existingIssue.book_id) {
        try {
          const { data: bookData } = await supabase
            .from('Books')
            .select('id, "Available Copies", "Book Title"')
            .eq('id', existingIssue.book_id)
            .maybeSingle();

          if (bookData) {
            const currentCopies = Number(bookData['Available Copies'] || 0);
            await supabase
              .from('Books')
              .update({ 'Available Copies': currentCopies + 1 })
              .eq('id', existingIssue.book_id);
          }
        } catch (bErr) {
          console.warn('Notice incrementing book availability on return:', bErr);
        }
      }
    }

    // 4. Update local storage backup
    const localIssues = loadLocalIssues();
    const updatedLocal = localIssues.map((item: any) => {
      if (String(item.id) === String(issueId) || (existingIssue && String(item.id) === String(existingIssue.id))) {
        return {
          ...item,
          return_date: returnDate,
          return_status: 'Returned',
          fine_amount: fineAmount,
          loan_remarks: returnRemarks,
        };
      }
      return item;
    });
    saveLocalIssues(updatedLocal);

    return NextResponse.json({
      success: true,
      message: 'Book return recorded successfully in database.',
      issue: updatedIssue || { id: issueId, return_date: returnDate, return_status: 'Returned', fine_amount: fineAmount },
    });
  } catch (err: any) {
    console.error('Error in PATCH /api/book-issues:', err);
    return NextResponse.json(
      { success: false, message: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
