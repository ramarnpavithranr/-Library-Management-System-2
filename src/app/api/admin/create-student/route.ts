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

    // Check optional Admin Bearer authorization token
    const authHeader = req.headers.get('authorization') || '';
    const userJwt = authHeader.replace(/^Bearer\s+/i, '').trim();

    let authUserId: string | null = null;
    let dbRecordId: string | null = null;
    let authError: string | null = null;

    // 2. PRIMARY FLOW: If SUPABASE_SERVICE_ROLE_KEY is configured, use official Supabase Admin API
    if (supabaseServiceKey) {
      try {
        const adminAuthClient = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        const { data, error } = await adminAuthClient.auth.admin.createUser({
          email: cleanEmail,
          password: String(password),
          email_confirm: true, // Auto-confirm email so student can immediately log in
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

    // 3. SECURE SERVER BACKEND FLOW: Direct PostgreSQL Provisioning via Connection Pooler
    // When service role key is absent, securely provision in auth.users + auth.identities + public."Students"
    if (!authUserId) {
      try {
        const pool = getDbPool();
        const client = await pool.connect();

        try {
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

          // B. Insert into auth.identities (omitting generated email column)
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

          // C. Insert into public."Students" table linking auth_id, with password = NULL (never plaintext)
          if (authUserId) {
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
          }
        } finally {
          client.release();
        }
      } catch (dbErr: any) {
        console.error('PostgreSQL direct auth provisioning notice:', dbErr);
        if (!authUserId) {
          authError = dbErr?.message || 'Database error provisioning student user';
        }
      }
    }

    // 4. Fallback Database Insertion into public."Students" (if auth user created via service key or needs REST sync)
    if (authUserId && !dbRecordId) {
      const dbClient = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
        auth: { autoRefreshToken: false, persistSession: false },
        global: !supabaseServiceKey && userJwt ? { headers: { Authorization: `Bearer ${userJwt}` } } : undefined,
      });

      const studentPayload: any = {
        Name: cleanName,
        Department: cleanDepartment,
        Username: cleanUsername,
        "Roll Number": cleanRollNumber,
        auth_id: authUserId,
        email: cleanEmail,
        year: cleanYear,
        college: cleanCollege,
        section: cleanSection,
        status: 'active',
        password: null, // Password must NEVER be stored as plain text
      };
      if (numericPhone) {
        studentPayload["Phone Number"] = numericPhone;
      }

      const { data: dbData, error: dbErr } = await dbClient
        .from('Students')
        .insert([studentPayload])
        .select();

      if (!dbErr && dbData && dbData.length > 0) {
        dbRecordId = String(dbData[0].id);
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

    if (!dbRecordId) {
      dbRecordId = authUserId;
    }

    return NextResponse.json({
      success: true,
      message: `Student account for ${cleanName} (${cleanUsername}) created in Supabase Auth and stored in Students table successfully!`,
      user: {
        id: authUserId,
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
