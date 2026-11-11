import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || (!supabaseAnonKey && !supabaseServiceKey)) {
      return NextResponse.json(
        { success: false, message: 'Supabase configuration is missing on server.' },
        { status: 500 }
      );
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const cleanRollNumber = String(rollNumber).trim().toUpperCase();
    const cleanName = String(name).trim();
    const cleanDepartment = String(department || 'Computer Science & Engineering').trim();
    const cleanCollege = String(college || 'Sree Sakthi Engineering College').trim();
    const cleanYear = String(year || '1st Year').trim();
    const cleanSection = String(section || 'A').trim();
    const cleanPhone = String(phone || '').trim();

    // Map username internally to unique Supabase Auth email without requiring student to enter it
    const cleanEmail = (email && String(email).includes('@')
      ? String(email).trim().toLowerCase()
      : `${cleanUsername}@sreesakthi.edu.in`);

    const dbClient = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 2. Prevent duplicate student records in Students table if table is queryable
    try {
      const { data: existingRows } = await dbClient
        .from('Students')
        .select('id, username')
        .eq('username', cleanUsername)
        .limit(1);

      if (existingRows && existingRows.length > 0) {
        return NextResponse.json(
          {
            success: false,
            message: `Username "${cleanUsername}" is already registered. Please choose another username.`,
          },
          { status: 409 }
        );
      }
    } catch (checkErr: any) {
      console.warn('Pre-check notice on Students table:', checkErr?.message);
    }

    let authUserId: string | null = null;
    let authError: string | null = null;

    // 3. Create Supabase Auth user securely using Admin-assigned credentials
    if (supabaseServiceKey) {
      const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data, error } = await adminClient.auth.admin.createUser({
        email: cleanEmail,
        password: String(password),
        email_confirm: true,
        user_metadata: {
          username: cleanUsername,
          name: cleanName,
          roll_number: cleanRollNumber,
          role: 'student',
          department: cleanDepartment,
          college: cleanCollege,
          year: cleanYear,
          section: cleanSection,
          phone: cleanPhone,
        },
      });

      if (error) {
        authError = error.message;
      } else if (data?.user) {
        authUserId = data.user.id;
      }
    } else {
      // Ephemeral server-side client with anon key
      const serverClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data, error } = await serverClient.auth.signUp({
        email: cleanEmail,
        password: String(password),
        options: {
          data: {
            username: cleanUsername,
            name: cleanName,
            roll_number: cleanRollNumber,
            role: 'student',
            department: cleanDepartment,
            college: cleanCollege,
            year: cleanYear,
            section: cleanSection,
            phone: cleanPhone,
          },
        },
      });

      if (error) {
        authError = error.message;
      } else if (data?.user) {
        authUserId = data.user.id;
      }
    }

    if (authError) {
      console.warn('Supabase Auth notice during student creation:', authError);
      // If user already exists in auth, handle duplicate cleanly
      if (
        authError.toLowerCase().includes('already registered') ||
        authError.toLowerCase().includes('already exists')
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `An authentication account with username "${cleanUsername}" or email already exists.`,
          },
          { status: 409 }
        );
      }
    }

    // Link student record to the exact Supabase Auth user ID
    const finalId = authUserId || `stu-${Date.now()}`;

    // 4. Insert student profile record into existing 'Students' table linked by authUserId
    // Fields: id (authUserId), username, name, roll_number, etc. (NEVER password)
    let dbSuccess = false;
    let dbErrorMsg: string | null = null;

    try {
      // First attempt: insert with full fields
      const { error: err1 } = await dbClient.from('Students').insert([
        {
          id: finalId,
          username: cleanUsername,
          name: cleanName,
          roll_number: cleanRollNumber,
        },
      ]);

      if (!err1) {
        dbSuccess = true;
      } else {
        // Second attempt: 'Roll number' casing fallback
        const { error: err2 } = await dbClient.from('Students').insert([
          {
            id: finalId,
            username: cleanUsername,
            name: cleanName,
            "Roll number": cleanRollNumber,
          },
        ]);

        if (!err2) {
          dbSuccess = true;
        } else {
          // Fallback to lowercase 'students' table
          const { error: err3 } = await dbClient.from('students').insert([
            {
              id: finalId,
              username: cleanUsername,
              name: cleanName,
              roll_number: cleanRollNumber,
            },
          ]);

          if (!err3) {
            dbSuccess = true;
          } else {
            dbErrorMsg = err1.message || err2.message || err3.message;
            console.warn('Supabase Students table insert notice:', dbErrorMsg);
          }
        }
      }
    } catch (e: any) {
      dbErrorMsg = e?.message;
      console.warn('Supabase Students table insert exception:', dbErrorMsg);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: finalId,
        studentId: finalId,
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
      dbSynced: dbSuccess,
      dbNotice: dbErrorMsg,
      authNotice: authError || undefined,
    });
  } catch (err: any) {
    console.error('Server error creating student account:', err);
    return NextResponse.json(
      { success: false, message: err?.message || 'Internal server error creating student account.' },
      { status: 500 }
    );
  }
}
