import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Central in-memory cache to ensure instant cross-device availability
declare global {
  // eslint-disable-next-line no-var
  var __membershipsStore: any[] | undefined;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'memberships.json');

function loadMembershipsFromDisk(): any[] {
  if (global.__membershipsStore && global.__membershipsStore.length > 0) {
    return global.__membershipsStore;
  }

  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        global.__membershipsStore = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Notice reading memberships from disk:', err);
  }

  const initial: any[] = [];
  global.__membershipsStore = initial;
  return initial;
}

function saveMembershipsToDisk(list: any[]) {
  global.__membershipsStore = list;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.warn('Notice saving memberships to disk:', err);
  }
}

function getSupabase(req?: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yvogbzoolyosvilgtyxi.supabase.co';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_I2tfBLTvezL4ckvlIjDgoQ_IL3blLtj';
  if (!url || (!serviceKey && !anonKey)) return null;

  const authHeader = req?.headers.get('authorization') || '';

  if (serviceKey) {
    return createClient(url, serviceKey, { auth: { persistSession: false } });
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false },
    global: authHeader ? { headers: { Authorization: authHeader } } : undefined,
  });
}

// GET: Retrieve all membership cards and applications
export async function GET(req: NextRequest) {
  const list = loadMembershipsFromDisk();

  // Query Supabase table 'membership'
  const supabase = getSupabase(req);
  if (supabase) {
    try {
      const { data, error } = await supabase.from('membership').select('*');
      if (!error && Array.isArray(data) && data.length > 0) {
        data.forEach((row: any) => {
          const rowIdStr = String(row.id);
          const mappedName = row.Name || row.name || 'Student Member';
          const mappedRoll = String(row['Roll Number'] ?? row.roll_number ?? '');
          const mappedDept = row.Department || row.department || 'Computer Science & Engineering';
          const mappedStatus = (row.status as 'pending' | 'approved' | 'rejected') || 'pending';
          const mappedMembershipId =
            row.membership_id || (mappedStatus === 'approved' ? `LIB-MEM-${row.id}` : `LIB-MEM-PENDING-${row.id}`);

          const matchIndex = list.findIndex(
            (m) =>
              String(m.id) === rowIdStr ||
              (row.student_id && m.studentId === row.student_id) ||
              (m.studentName?.toLowerCase() === mappedName?.toLowerCase() &&
                (m.rollNumber === mappedRoll || m.rollNumber?.replace(/\D/g, '') === mappedRoll.replace(/\D/g, '')))
          );

          const existingStudentId = matchIndex >= 0 ? list[matchIndex].studentId : null;
          const finalStudentId = row.student_id || existingStudentId || (row.Username ? `STU-${row.Username}` : `stu-${row.id}`);

          const mapped = {
            id: rowIdStr,
            studentId: finalStudentId,
            studentName: mappedName,
            rollNumber: matchIndex >= 0 && list[matchIndex].rollNumber ? list[matchIndex].rollNumber : mappedRoll,
            department: mappedDept,
            year: row.year || (matchIndex >= 0 ? list[matchIndex].year : '1st Year'),
            phone: row.phone || (matchIndex >= 0 ? list[matchIndex].phone : ''),
            email: row.email || (matchIndex >= 0 ? list[matchIndex].email : ''),
            photo:
              row.photo ||
              (matchIndex >= 0 ? list[matchIndex].photo : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop'),
            membershipId: mappedMembershipId,
            appliedDate: row.created_at
              ? new Date(row.created_at).toISOString().split('T')[0]
              : (matchIndex >= 0 ? list[matchIndex].appliedDate : new Date().toISOString().split('T')[0]),
            status: mappedStatus,
            expiryDate: row.expiry_date || (matchIndex >= 0 ? list[matchIndex].expiryDate : ''),
            issuedDate: row.created_at
              ? new Date(row.created_at).toISOString().split('T')[0]
              : (matchIndex >= 0 ? list[matchIndex].issuedDate : ''),
            qrData: `SSEC-LIB-MEM:${mappedRoll}:${mappedMembershipId}`,
          };

          if (matchIndex >= 0) {
            list[matchIndex] = { ...list[matchIndex], ...mapped };
          } else {
            list.push(mapped);
          }
        });
        saveMembershipsToDisk(list);
      } else if (error) {
        console.warn('Supabase membership fetch warning:', error.message);
      }
    } catch (e) {
      console.warn('Notice querying Supabase membership table:', e);
    }
  }

  return NextResponse.json({ success: true, memberships: list });
}

// POST: Student submits a new membership application
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      studentId,
      studentName,
      rollNumber,
      department,
      year,
      phone,
      email,
      photo,
    } = body || {};

    if (!studentId && !studentName) {
      return NextResponse.json(
        { success: false, message: 'Student ID and Name are required.' },
        { status: 400 }
      );
    }

    const currentList = loadMembershipsFromDisk();
    const cleanStudentId = String(studentId || `stu-${Date.now()}`);
    const cleanRollNumber = String(rollNumber || '').trim().toUpperCase();
    const cleanName = String(studentName || 'Student Member').trim();
    const cleanDept = String(department || 'Computer Science & Engineering').trim();
    const cleanYear = String(year || '1st Year').trim();
    const cleanPhone = String(phone || '').trim();
    const cleanEmail = String(email || '').trim();
    const defaultPhoto = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop';
    const cleanPhoto = photo || defaultPhoto;

    // Check if an application already exists for this student
    const existingIndex = currentList.findIndex(
      (m) =>
        m.studentId === cleanStudentId ||
        (cleanRollNumber && m.rollNumber && m.rollNumber.toUpperCase() === cleanRollNumber)
    );

    let createdId = existingIndex >= 0 ? currentList[existingIndex].id : `mem-${Date.now()}`;
    const generatedPendingCardId = `LIB-MEM-PENDING-${Date.now().toString().slice(-4)}`;

    const newApp = {
      id: createdId,
      studentId: cleanStudentId,
      studentName: cleanName,
      rollNumber: cleanRollNumber,
      department: cleanDept,
      year: cleanYear,
      phone: cleanPhone,
      email: cleanEmail,
      photo: cleanPhoto,
      membershipId: generatedPendingCardId,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'pending' as const,
      qrData: `SSEC-LIB-MEM:${cleanRollNumber}:${generatedPendingCardId}`,
    };

    // Store in Supabase table public.membership via HTTPS REST client
    let supabaseSuccess = false;
    let supabaseErrorMsg = '';

    const supabase = getSupabase(req);
    if (supabase) {
      try {
        const numericRoll = parseInt(cleanRollNumber.replace(/\D/g, ''), 10) || Math.floor(1000 + Math.random() * 9000);
        const payload: any = {
          Name: cleanName,
          "Roll Number": numericRoll,
          Department: cleanDept,
          student_id: cleanStudentId,
          membership_id: generatedPendingCardId,
          status: 'pending',
          photo: cleanPhoto,
          phone: cleanPhone,
          email: cleanEmail,
          year: cleanYear,
        };

        const { data: insData, error: insErr } = await supabase
          .from('membership')
          .insert([payload])
          .select();

        if (!insErr && insData && insData[0]) {
          supabaseSuccess = true;
          createdId = String(insData[0].id);
          newApp.id = createdId;
        } else if (insErr) {
          supabaseErrorMsg = insErr.message;
        }
      } catch (e: any) {
        supabaseErrorMsg = e?.message || 'Supabase insert exception';
      }
    }

    if (existingIndex >= 0) {
      currentList[existingIndex] = {
        ...currentList[existingIndex],
        ...newApp,
      };
    } else {
      currentList.unshift(newApp);
    }

    saveMembershipsToDisk(currentList);

    return NextResponse.json({
      success: true,
      message: 'Membership application submitted successfully and sent for Admin approval.',
      membership: existingIndex >= 0 ? currentList[existingIndex] : newApp,
      storedInSupabase: supabaseSuccess,
    });
  } catch (err: any) {
    console.error('Error in POST /api/membership:', err);
    return NextResponse.json(
      { success: false, message: err?.message || 'Server error saving application.' },
      { status: 500 }
    );
  }
}

// PATCH: Admin approves or rejects application
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, membershipId, status, expiryDate } = body || {};

    if (!id && !membershipId) {
      return NextResponse.json(
        { success: false, message: 'Application ID is required.' },
        { status: 400 }
      );
    }

    const currentList = loadMembershipsFromDisk();
    let index = currentList.findIndex(
      (m) =>
        String(m.id) === String(id) ||
        m.membershipId === id ||
        m.membershipId === membershipId ||
        String(m.studentId) === String(id)
    );

    if (index === -1) {
      // Query Supabase directly if not in disk store
      const supabase = getSupabase(req);
      if (supabase) {
        try {
          const numId = !isNaN(Number(id)) ? Number(id) : 0;
          const { data: supaRow } = await supabase
            .from('membership')
            .select('*')
            .or(`id.eq.${numId},student_id.eq.${id},membership_id.eq.${id}`)
            .limit(1);

          if (Array.isArray(supaRow) && supaRow.length > 0) {
            const row = supaRow[0];
            const mapped = {
              id: String(row.id),
              studentId: row.student_id || `stu-${row.id}`,
              studentName: row.Name || 'Student Member',
              rollNumber: String(row['Roll Number'] || ''),
              department: row.Department || 'Computer Science & Engineering',
              year: row.year || '1st Year',
              membershipId: row.membership_id || `LIB-MEM-${row.id}`,
              appliedDate: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '',
              status: row.status || 'pending',
              photo: row.photo || '',
              phone: row.phone || '',
              email: row.email || '',
              expiryDate: row.expiry_date || '',
              qrData: `SSEC-LIB-MEM:${row['Roll Number']}:${row.membership_id || row.id}`,
            };
            currentList.push(mapped);
            index = currentList.length - 1;
          }
        } catch (_) {}
      }
    }

    if (index === -1) {
      const now = new Date();
      const twoYearsLater = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate()).toISOString().split('T')[0];
      const targetStatus = status || 'approved';
      const randomCardDigits = Math.floor(1000 + Math.random() * 9000);
      const newCardId = membershipId || `LIB-MEM-${now.getFullYear()}-${randomCardDigits}`;

      const syntheticCard = {
        id: String(id),
        studentId: String(id),
        studentName: 'Student Member',
        rollNumber: '',
        department: 'Engineering',
        year: '1st Year',
        membershipId: newCardId,
        appliedDate: now.toISOString().split('T')[0],
        status: targetStatus,
        expiryDate: expiryDate || twoYearsLater,
        issuedDate: now.toISOString().split('T')[0],
        qrData: `SSEC-LIB-MEM:${newCardId}`,
      };
      currentList.push(syntheticCard);
      index = currentList.length - 1;
    }

    const now = new Date();
    const twoYearsLater = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate())
      .toISOString()
      .split('T')[0];

    const targetStatus = status || 'approved';
    const randomCardDigits = Math.floor(1000 + Math.random() * 9000);
    const newCardId =
      targetStatus === 'approved' && (!currentList[index].membershipId || currentList[index].membershipId.includes('PENDING'))
        ? `LIB-MEM-${now.getFullYear()}-${randomCardDigits}`
        : currentList[index].membershipId || `LIB-MEM-${now.getFullYear()}-${randomCardDigits}`;

    const finalExpiry = targetStatus === 'approved' ? (expiryDate || twoYearsLater) : currentList[index].expiryDate;
    const finalIssue = targetStatus === 'approved' ? now.toISOString().split('T')[0] : currentList[index].issuedDate;

    currentList[index] = {
      ...currentList[index],
      status: targetStatus,
      membershipId: newCardId,
      issuedDate: finalIssue,
      expiryDate: finalExpiry,
      qrData: `SSEC-LIB-MEM:${currentList[index].rollNumber}:${newCardId}`,
    };

    saveMembershipsToDisk(currentList);

    // Sync status to Supabase table public.membership via HTTPS client
    const supabase = getSupabase(req);
    if (supabase) {
      try {
        const rowId = currentList[index].id;
        const updatePayload: any = {
          status: targetStatus,
          membership_id: newCardId,
          expiry_date: finalExpiry,
        };
        if (!isNaN(Number(rowId))) {
          await supabase.from('membership').update(updatePayload).eq('id', Number(rowId));
        } else {
          await supabase.from('membership').update(updatePayload).eq('Name', currentList[index].studentName);
        }
      } catch (err: any) {
        console.warn('Supabase update notice for membership PATCH:', err?.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Membership application marked as ${targetStatus}.`,
      membership: currentList[index],
    });
  } catch (err: any) {
    console.error('Error in PATCH /api/membership:', err);
    return NextResponse.json(
      { success: false, message: err?.message || 'Server error updating membership.' },
      { status: 500 }
    );
  }
}

// DELETE: Reset or remove a student's membership card
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const id = searchParams.get('id');

    let currentList = loadMembershipsFromDisk();
    const toDelete = currentList.find(
      (m) => m.studentId === studentId || m.id === id || m.membershipId === id
    );

    currentList = currentList.filter(
      (m) => m.studentId !== studentId && m.id !== id && m.membershipId !== id
    );
    saveMembershipsToDisk(currentList);

    const supabase = getSupabase(req);
    if (supabase && toDelete) {
      try {
        if (!isNaN(Number(toDelete.id))) {
          await supabase.from('membership').delete().eq('id', Number(toDelete.id));
        } else {
          await supabase.from('membership').delete().eq('Name', toDelete.studentName);
        }
      } catch (_) {}
    }

    return NextResponse.json({ success: true, message: 'Membership record removed.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message }, { status: 500 });
  }
}
