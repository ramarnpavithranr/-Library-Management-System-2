import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { identifier, portal } = body || {};

    const cleanId = String(identifier || '').trim();
    if (!cleanId) {
      return NextResponse.json({ success: false, message: 'Identifier required.' }, { status: 400 });
    }

    const pool = getDbPool();
    const client = await pool.connect();

    try {
      if (portal === 'student') {
        // If an email was directly provided
        if (cleanId.includes('@')) {
          // Check that this email actually belongs to a student
          const studentEmailCheck = await client.query(
            `
            SELECT email, "Username", "Roll Number"
            FROM public."Students"
            WHERE lower(email) = lower($1)
            LIMIT 1;
            `,
            [cleanId]
          );

          if (studentEmailCheck.rows.length > 0) {
            const row = studentEmailCheck.rows[0];
            return NextResponse.json({
              success: true,
              email: row.email.toLowerCase(),
              username: row.Username,
              rollNumber: row['Roll Number'],
            });
          }

          // Also check auth.users with student role
          const authStudentCheck = await client.query(
            `
            SELECT email, raw_user_meta_data
            FROM auth.users
            WHERE lower(email) = lower($1)
              AND raw_user_meta_data->>'role' = 'student'
            LIMIT 1;
            `,
            [cleanId]
          );

          if (authStudentCheck.rows.length > 0) {
            return NextResponse.json({
              success: true,
              email: authStudentCheck.rows[0].email.toLowerCase(),
              username: authStudentCheck.rows[0].raw_user_meta_data?.username,
              rollNumber: authStudentCheck.rows[0].raw_user_meta_data?.rollNumber,
            });
          }

          // Not a student account
          return NextResponse.json(
            { success: false, message: 'Student account not found with this email.' },
            { status: 404 }
          );
        }

        // Query Students table for Username or Roll Number
        const studentRes = await client.query(
          `
          SELECT email, "Username", "Roll Number"
          FROM public."Students"
          WHERE lower("Username") = lower($1)
             OR upper("Roll Number") = upper($1)
          LIMIT 1;
          `,
          [cleanId]
        );

        if (studentRes.rows.length > 0) {
          const row = studentRes.rows[0];
          const resolvedEmail =
            row.email ||
            `${String(row.Username || cleanId).toLowerCase()}@sreesakthi.edu.in`;

          return NextResponse.json({
            success: true,
            email: resolvedEmail.toLowerCase(),
            username: row.Username,
            rollNumber: row['Roll Number'],
          });
        }

        return NextResponse.json(
          { success: false, message: 'No student found with this Username or Roll Number.' },
          { status: 404 }
        );
      }

      if (portal === 'admin') {
        // If an email was directly provided
        if (cleanId.includes('@')) {
          const adminEmailCheck = await client.query(
            `
            SELECT email, raw_user_meta_data
            FROM auth.users
            WHERE lower(email) = lower($1)
              AND (raw_user_meta_data->>'role' = 'admin' OR raw_user_meta_data->>'role' IS NULL)
            LIMIT 1;
            `,
            [cleanId]
          );

          if (adminEmailCheck.rows.length > 0) {
            return NextResponse.json({
              success: true,
              email: adminEmailCheck.rows[0].email.toLowerCase(),
            });
          }

          return NextResponse.json(
            { success: false, message: 'Administrator account not found with this email.' },
            { status: 404 }
          );
        }

        // Query auth.users for an admin account matching username or email prefix
        const adminRes = await client.query(
          `
          SELECT email, raw_user_meta_data
          FROM auth.users
          WHERE (lower(raw_user_meta_data->>'username') = lower($1)
             OR lower(email) = lower($2))
             AND (raw_user_meta_data->>'role' = 'admin' OR raw_user_meta_data->>'role' IS NULL)
          LIMIT 1;
          `,
          [cleanId, `${cleanId.toLowerCase()}@sreesakthi.edu.in`]
        );

        if (adminRes.rows.length > 0) {
          return NextResponse.json({
            success: true,
            email: adminRes.rows[0].email.toLowerCase(),
          });
        }

        return NextResponse.json(
          { success: false, message: 'Administrator account not found with this username.' },
          { status: 404 }
        );
      }

      // Generic lookup fallback if portal is not specified
      if (cleanId.includes('@')) {
        return NextResponse.json({ success: true, email: cleanId.toLowerCase() });
      }

      return NextResponse.json({
        success: true,
        email: `${cleanId.toLowerCase()}@sreesakthi.edu.in`,
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Error in /api/auth/lookup:', err);
    return NextResponse.json({
      success: false,
      message: 'Identifier lookup failed',
    }, { status: 500 });
  }
}
