import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getDbPool } from '@/lib/db';

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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yvogbzoolyosvilgtyxi.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_I2tfBLTvezL4ckvlIjDgoQ_IL3blLtj';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

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

    const authCheckClient = createClient(supabaseUrl, supabaseAnonKey, {
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

    const rawNumericPhone = cleanPhone ? parseInt(cleanPhone.replace(/\D/g, ''), 10) : null;
    const numericPhone = (rawNumericPhone && !isNaN(rawNumericPhone)) ? rawNumericPhone : null;

    let authUserId: string | null = null;
    let dbRecordId: string | null = null;
    let authError: string | null = null;

    // 3. PRIMARY AUTH CREATION: If SUPABASE_SERVICE_ROLE_KEY is configured, use official Supabase Admin API
    if (supabaseServiceKey) {
      try {
        const adminAuthClient = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        const { data, error } = await adminAuthClient.auth.admin.createUser({
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
      } catch (adminClientErr: any) {
        authError = adminClientErr?.message || 'Admin auth client exception';
      }
    }

    // 4. SECURE SERVER BACKEND FLOW: Direct PostgreSQL Provisioning via Connection Pooler
    // Used when service role key is absent: provisions in auth.users + auth.identities
    const pool = getDbPool();
    const client = await pool.connect();

    try {
      if (!authUserId) {
        // Check for duplicate username or email in auth.users
        const existingAuth = await client.query(
          `SELECT id FROM auth.users WHERE lower(email) = lower($1) OR lower(raw_user_meta_data->>'username') = lower($2) LIMIT 1;`,
          [cleanEmail, cleanUsername]
        );

        if (existingAuth.rows.length > 0) {
          return NextResponse.json(
            {
              success: false,
              message: `An authentication account with username "${cleanUsername}" or email "${cleanEmail}" already exists in Supabase Auth.`,
            },
            { status: 409 }
          );
        }

        // Check for duplicate username or roll number in public."Students"
        const existingStudent = await client.query(
          `SELECT id FROM public."Students" WHERE lower("Username") = lower($1) OR upper("Roll Number") = upper($2) LIMIT 1;`,
          [cleanUsername, cleanRollNumber]
        );

        if (existingStudent.rows.length > 0) {
          return NextResponse.json(
            {
              success: false,
              message: `Student with username "${cleanUsername}" or roll number "${cleanRollNumber}" is already registered in the student database.`,
            },
            { status: 409 }
          );
        }

        // A. Insert into auth.users with confirmed email and bcrypt encrypted password
        const userMeta = {
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

        const userRes = await client.query(
          `
          INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            confirmation_token,
            recovery_token,
            email_change_token_new,
            email_change,
            phone_change,
            phone_change_token,
            reauthentication_token,
            email_change_confirm_status,
            raw_app_meta_data,
            raw_user_meta_data,
            is_sso_user,
            is_anonymous,
            created_at,
            updated_at
          ) VALUES (
            '00000000-0000-0000-0000-000000000000'::uuid,
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            $1,
            crypt($2, gen_salt('bf')),
            now(),
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            0,
            '{"provider": "email", "providers": ["email"]}'::jsonb,
            $3::jsonb,
            false,
            false,
            now(),
            now()
          )
          RETURNING id;
          `,
          [cleanEmail, String(password), JSON.stringify(userMeta)]
        );

        authUserId = userRes.rows[0]?.id;

        // B. Insert into auth.identities
        if (authUserId) {
          await client.query(
            `
            INSERT INTO auth.identities (
              id,
              provider_id,
              user_id,
              identity_data,
              provider,
              last_sign_in_at,
              created_at,
              updated_at
            ) VALUES (
              gen_random_uuid(),
              $1::text,
              $2::uuid,
              json_build_object('sub', $1::text, 'email', $3::text, 'email_verified', false, 'phone_verified', false),
              'email',
              now(),
              now(),
              now()
            );
            `,
            [String(authUserId), authUserId, cleanEmail]
          );
        }
      }

      if (!authUserId) {
        return NextResponse.json(
          {
            success: false,
            message: `Failed to create Supabase Auth account: ${authError || 'Unknown auth error'}`,
          },
          { status: 500 }
        );
      }

      // 5. INSERT INTO public."Students" TABLE
      // Rules:
      // - Do NOT insert auth.users.id into Students.id (Students.id is auto-generated bigint)
      // - Password must remain inside Supabase Auth and MUST NOT be stored in plain text
      // - auth_id links to auth.users.id
      try {
        const studentInsertRes = await client.query(
          `
          INSERT INTO public."Students" (
            "Name",
            "Username",
            "Roll Number",
            "Department",
            "Phone Number",
            "auth_id",
            "email",
            "year",
            "college",
            "section",
            "status",
            "password"
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NULL
          )
          RETURNING id;
          `,
          [
            cleanName,
            cleanUsername,
            cleanRollNumber,
            cleanDepartment,
            numericPhone,
            authUserId,
            cleanEmail,
            cleanYear,
            cleanCollege,
            cleanSection,
            'active',
          ]
        );

        if (studentInsertRes.rows && studentInsertRes.rows[0]) {
          dbRecordId = String(studentInsertRes.rows[0].id);
        }
      } catch (insertErr: any) {
        // Rollback created auth user if Students table insert fails
        console.error('Students table insert failed, rolling back auth user:', insertErr);
        await client.query('DELETE FROM auth.identities WHERE user_id = $1;', [authUserId]);
        await client.query('DELETE FROM auth.users WHERE id = $1;', [authUserId]);

        return NextResponse.json(
          {
            success: false,
            message: `Database error inserting into Students table: ${insertErr?.message || 'Insert failed'}`,
            error: insertErr?.message || 'Database error',
          },
          { status: 500 }
        );
      }
    } finally {
      client.release();
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
      message: 'Student Created Successfully',
      user: {
        id: dbRecordId,
        studentId: authUserId,
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
      storedInSupabase: true,
      endpointUsed: `${supabaseUrl}/rest/v1/Students`,
    });
  } catch (err: any) {
    console.error('Server error creating student account:', err);
    return NextResponse.json(
      { success: false, message: err?.message || 'Internal server error creating student account.' },
      { status: 500 }
    );
  }
}
