import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yvogbzoolyosvilgtyxi.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_I2tfBLTvezL4ckvlIjDgoQ_IL3blLtj';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { identifier, portal } = body || {};

    const cleanId = String(identifier || '').trim();
    if (!cleanId) {
      return NextResponse.json({ success: false, message: 'Identifier required.' }, { status: 400 });
    }

    const client = SUPABASE_SERVICE_KEY
      ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } })
      : createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

    if (portal === 'student') {
      // 1. If an email was directly provided
      if (cleanId.includes('@')) {
        const { data: studentEmailCheck } = await client
          .from('Students')
          .select('email, "Username", "Roll Number"')
          .ilike('email', cleanId)
          .limit(1);

        if (studentEmailCheck && studentEmailCheck.length > 0) {
          const row = studentEmailCheck[0];
          return NextResponse.json({
            success: true,
            email: (row.email || cleanId).toLowerCase(),
            username: row.Username,
            rollNumber: row['Roll Number'],
          });
        }

        return NextResponse.json({
          success: true,
          email: cleanId.toLowerCase(),
        });
      }

      // 2. Query Students table for Username or Roll Number via HTTPS REST
      const { data: studentRes } = await client
        .from('Students')
        .select('email, "Username", "Roll Number"')
        .or(`Username.ilike.${cleanId},"Roll Number".ilike.${cleanId}`)
        .limit(1);

      if (studentRes && studentRes.length > 0) {
        const row = studentRes[0];
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

      // Default institutional email mapping fallback
      return NextResponse.json({
        success: true,
        email: `${cleanId.toLowerCase()}@sreesakthi.edu.in`,
      });
    }

    if (portal === 'admin') {
      if (cleanId.includes('@')) {
        return NextResponse.json({
          success: true,
          email: cleanId.toLowerCase(),
        });
      }

      // Default Administrator mapping
      if (cleanId.toLowerCase() === 'admin' || cleanId.toLowerCase() === 'ramarnpavithranr') {
        return NextResponse.json({
          success: true,
          email: 'ramarnpavithranr@gmail.com',
        });
      }

      return NextResponse.json({
        success: true,
        email: `${cleanId.toLowerCase()}@sreesakthi.edu.in`,
      });
    }

    // Generic fallback if portal is not specified
    if (cleanId.includes('@')) {
      return NextResponse.json({ success: true, email: cleanId.toLowerCase() });
    }

    return NextResponse.json({
      success: true,
      email: `${cleanId.toLowerCase()}@sreesakthi.edu.in`,
    });
  } catch (err: any) {
    console.error('Error in /api/auth/lookup:', err);
    return NextResponse.json({
      success: false,
      message: 'Identifier lookup failed',
    }, { status: 500 });
  }
}
