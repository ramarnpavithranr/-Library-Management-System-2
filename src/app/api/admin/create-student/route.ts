import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yvogbzoolyosvilgtyxi.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_I2tfBLTvezL4ckvlIjDgoQ_IL3blLtj';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON request payload.' },
        { status: 400 }
      );
    }

    const {
      username,
      password,
      name,
      rollNumber,
      department,
      college,
      year,
      section,
      email,
      phone,
    } = body || {};

    // 1. Validate required fields
    if (!username || !password || !name || !rollNumber) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please provide all required fields: Student Name, Username, Roll Number, and Password.',
        },
        { status: 400 }
      );
    }

    if (String(password).length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters for Supabase Authentication.' },
        { status: 400 }
      );
    }

    // 2. VERIFY CALLER IS AUTHENTICATED ADMINISTRATOR
    const authHeader = req.headers.get('authorization') || '';
    const userJwt = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!userJwt) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized: Authentication bearer token is required to create a student account.',
        },
        { status: 401 }
      );
    }

    // Verify admin session via Supabase HTTPS Auth API
    const authCheckClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: authUserData, error: authUserErr } = await authCheckClient.auth.getUser(userJwt);
    if (authUserErr || !authUserData?.user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized: Invalid or expired administrator session.',
        },
        { status: 401 }
      );
    }

    const caller = authUserData.user;
    const callerMeta = caller.user_metadata || {};
    const callerEmail = (caller.email || '').toLowerCase();
    const isAdmin =
      callerMeta.role === 'admin' ||
      callerEmail === 'ramarnpavithranr@gmail.com' ||
      callerEmail === 'admin@sreesakthi.edu.in' ||
      callerEmail === 'library@sreesakthi.edu.in' ||
      callerEmail.includes('admin') ||
      callerEmail.includes('librarian');

    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: 'Forbidden: Only authenticated Library Administrators are permitted to create student accounts.',
        },
        { status: 403 }
      );
    }

    // Clean & normalize student inputs
    const cleanUsername = String(username).trim().toLowerCase();
    const cleanRollNumber = String(rollNumber).trim().toUpperCase();
    const cleanName = String(name).trim();
    const cleanDepartment = String(department || 'Computer Science & Engineering').trim();
    const cleanCollege = String(college || 'Sree Sakthi Engineering College').trim();
    const cleanYear = String(year || '1st Year').trim();
    const cleanSection = String(section || 'A').trim();
    const cleanPhone = String(phone || '').trim();

    const cleanEmail = (email && String(email).includes('@')
      ? String(email).trim().toLowerCase()
      : `${cleanUsername}@sreesakthi.edu.in`);

    const rawNumericPhone = cleanPhone ? parseInt(cleanPhone.replace(/\D/g, ''), 10) : null;
    const numericPhone = rawNumericPhone && !isNaN(rawNumericPhone) ? rawNumericPhone : null;

    // 3. INITIALIZE OFFICIAL SUPABASE CLIENT (HTTPS REST)
    // Avoids Node.js pg TCP connections and eliminates certificate chain errors on Vercel
    const dbClient = SUPABASE_SERVICE_KEY
      ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
          auth: { persistSession: false, autoRefreshToken: false },
        })
      : createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: { headers: { Authorization: `Bearer ${userJwt}` } },
        });

    // 4. CHECK FOR DUPLICATES IN Students TABLE (PREVENTS DUPLICATES ON RETRY)
    const { data: existingStudents } = await dbClient
      .from('Students')
      .select('id, Username, "Roll Number"')
      .or(`Username.ilike.${cleanUsername},"Roll Number".ilike.${cleanRollNumber}`)
      .limit(1);

    if (existingStudents && existingStudents.length > 0) {
      const match = existingStudents[0];
      const matchUsername = (match.Username || '').toLowerCase();
      const isUserMatch = matchUsername === cleanUsername;
      return NextResponse.json(
        {
          success: false,
          message: isUserMatch
            ? `A student account with username "${cleanUsername}" is already registered.`
            : `A student with roll number "${cleanRollNumber}" is already registered.`,
        },
        { status: 409 }
      );
    }

    // 5. PROVISION AUTHENTICATION USER IN SUPABASE AUTH (HTTPS)
    let authUserId: string | null = null;
    const studentUserMeta = {
      username: cleanUsername,
      name: cleanName,
      roll_number: cleanRollNumber,
      role: 'student',
      department: cleanDepartment,
      college: cleanCollege,
      year: cleanYear,
      section: cleanSection,
      phone: cleanPhone,
    };

    if (SUPABASE_SERVICE_KEY) {
      // Primary: Official Supabase Admin API
      const adminAuthClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data: createData, error: createErr } = await adminAuthClient.auth.admin.createUser({
        email: cleanEmail,
        password: String(password),
        email_confirm: true,
        user_metadata: studentUserMeta,
      });

      if (!createErr && createData?.user) {
        authUserId = createData.user.id;
      } else if (createErr) {
        // If user already exists in auth (e.g. from previous attempt), recover and update credentials
        if (
          createErr.message.toLowerCase().includes('already') ||
          createErr.message.toLowerCase().includes('exists')
        ) {
          const { data: listData } = await adminAuthClient.auth.admin.listUsers();
          const existingUser = (listData?.users || []).find(
            (u) => (u.email || '').toLowerCase() === cleanEmail.toLowerCase()
          );
          if (existingUser) {
            authUserId = existingUser.id;
            await adminAuthClient.auth.admin.updateUserById(authUserId, {
              password: String(password),
              user_metadata: studentUserMeta,
            });
          }
        }
      }
    }

    if (!authUserId) {
      // Fallback: Standard Supabase Auth API
      const ephemeralClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data: signUpData, error: signUpErr } = await ephemeralClient.auth.signUp({
        email: cleanEmail,
        password: String(password),
        options: {
          data: studentUserMeta,
        },
      });

      if (signUpData?.user) {
        authUserId = signUpData.user.id;
      } else if (signUpErr) {
        // If user already registered, retrieve auth session with credentials
        try {
          const { data: signInData } = await ephemeralClient.auth.signInWithPassword({
            email: cleanEmail,
            password: String(password),
          });
          if (signInData?.user) {
            authUserId = signInData.user.id;
          }
        } catch (_) {}
      }
    }

    // 6. INSERT STUDENT RECORD INTO public."Students" TABLE (HTTPS REST)
    // Primary attempt: Full schema columns
    const fullPayload: any = {
      Name: cleanName,
      Username: cleanUsername,
      "Roll Number": cleanRollNumber,
      Department: cleanDepartment,
      college: cleanCollege,
      year: cleanYear,
      section: cleanSection,
      email: cleanEmail,
      status: 'active',
      password: null, // Plaintext password is NEVER stored in database
    };
    if (numericPhone !== null) fullPayload["Phone Number"] = numericPhone;
    if (authUserId) fullPayload.auth_id = authUserId;

    let dbRecordId: string | null = null;
    let savedRow: any = null;

    const { data: insertData, error: insertErr } = await dbClient
      .from('Students')
      .insert([fullPayload])
      .select();

    if (!insertErr && insertData && insertData.length > 0) {
      savedRow = insertData[0];
      dbRecordId = String(savedRow.id);
    } else if (insertErr) {
      console.warn('Full schema insert notice, falling back to core columns:', insertErr.message);

      // Core schema fallback: Standard database columns
      const corePayload: any = {
        Name: cleanName,
        Username: cleanUsername,
        "Roll Number": cleanRollNumber,
        Department: cleanDepartment,
      };
      if (numericPhone !== null) corePayload["Phone Number"] = numericPhone;

      const { data: coreData, error: coreErr } = await dbClient
        .from('Students')
        .insert([corePayload])
        .select();

      if (!coreErr && coreData && coreData.length > 0) {
        savedRow = coreData[0];
        dbRecordId = String(savedRow.id);
      } else {
        const errorMsg = coreErr?.message || insertErr.message;
        console.error('Database insert failed for Students table:', errorMsg);
        return NextResponse.json(
          {
            success: false,
            message: `Database error inserting into Students table: ${errorMsg}`,
          },
          { status: 500 }
        );
      }
    }

    if (!dbRecordId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Database insert failed: No record ID returned from Students table.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Student account for ${cleanName} provisioned successfully!`,
      user: {
        id: dbRecordId,
        studentId: authUserId || dbRecordId,
        recordId: dbRecordId,
        username: cleanUsername,
        name: cleanName,
        rollNumber: cleanRollNumber,
        email: cleanEmail,
        department: cleanDepartment,
        college: cleanCollege,
        year: cleanYear,
        section: cleanSection,
        phone: cleanPhone,
        status: 'active',
        authUserId: authUserId,
      },
    });
  } catch (err: any) {
    console.error('Server error creating student account:', err);
    return NextResponse.json(
      { success: false, message: err?.message || 'Internal server error creating student account.' },
      { status: 500 }
    );
  }
}
