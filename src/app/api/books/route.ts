import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yvogbzoolyosvilgtyxi.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_I2tfBLTvezL4ckvlIjDgoQ_IL3blLtj';

function getSupabaseClient(authHeader?: string) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: authHeader ? { headers: { Authorization: authHeader } } : undefined,
  });
}

// Map a Supabase row from public."Books" to frontend Book interface
function mapSupabaseBookRow(row: any) {
  const editionStr = row.Edition
    ? typeof row.Edition === 'number'
      ? `${row.Edition}th Edition`
      : String(row.Edition)
    : row.edition || '1st Edition';

  const isbnStr = row['ISBN Number']
    ? String(row['ISBN Number'])
    : row.ISBN || row.isbn || '';

  const availableCount = Number(row['Available Copies'] ?? row.available_quantity ?? row.availableQuantity ?? 1);
  const totalCount = Number(row.total_copies ?? row.quantity ?? availableCount);

  return {
    id: String(row.id || `bk-${Date.now()}`),
    title: row['Book Title'] || row.title || row.Title || 'Untitled Book',
    author: row.Author || row.author || 'Unknown Author',
    category: row.Category || row.category || 'Computer Science Core',
    isbn: isbnStr,
    edition: editionStr,
    publisher: row.Publisher || row.publisher || 'Academic Press',
    quantity: totalCount,
    availableQuantity: availableCount,
    shelfLocation: row.shelf_location || row['Shelf Location'] || row.shelfLocation || 'Main Stacks',
    coverImage:
      row.cover_image ||
      row.coverImage ||
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop',
    description: row.description || 'Institutional engineering reference resource.',
    publicationYear: Number(row.publication_year || row.publicationYear) || 2024,
    status: availableCount > 0 ? ('available' as const) : ('borrowed' as const),
    rating: 4.8,
  };
}

// GET: Retrieve all books from Supabase table public."Books"
export async function GET() {
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase.from('Books').select('*').order('id', { ascending: true });

    if (error) {
      console.warn('Notice querying Supabase Books table:', error.message);
      return NextResponse.json({
        success: false,
        message: error.message,
        books: [],
      }, { status: 500 });
    }

    const books = (data || []).map(mapSupabaseBookRow);
    return NextResponse.json({ success: true, count: books.length, books });
  } catch (err: any) {
    console.error('Error in GET /api/books:', err);
    return NextResponse.json({ success: false, message: err?.message || 'Server error' }, { status: 500 });
  }
}

// POST: Store a new book in public."Books"
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const userJwt = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!userJwt) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Administrator bearer token is required to add books.' },
        { status: 401 }
      );
    }

    // Verify token and verify caller is Administrator
    const authClient = getSupabaseClient();
    const { data: authUserData, error: authUserErr } = await authClient.auth.getUser(userJwt);

    if (authUserErr || !authUserData?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Invalid or expired administrator session.' },
        { status: 401 }
      );
    }

    const callerUser = authUserData.user;
    const callerMeta = callerUser.user_metadata || {};
    const callerEmail = (callerUser.email || '').toLowerCase();
    const isAdmin =
      callerMeta.role === 'admin' ||
      callerEmail === 'ramarnpavithranr@gmail.com' ||
      callerEmail === 'admin@sreesakthi.edu.in' ||
      callerEmail === 'library@sreesakthi.edu.in' ||
      callerEmail.includes('admin') ||
      callerEmail.includes('librarian');

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Only authenticated Library Administrators are permitted to add books.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      title,
      author,
      category,
      isbn,
      edition,
      publisher,
      quantity,
      availableQuantity,
      shelfLocation,
      coverImage,
      description,
      publicationYear,
    } = body || {};

    if (!title || !String(title).trim()) {
      return NextResponse.json({ success: false, message: 'Book title is required.' }, { status: 400 });
    }

    const cleanTitle = String(title).trim();
    const cleanAuthor = String(author || 'Unknown Author').trim();
    const cleanCategory = String(category || 'General Engineering').trim();
    const cleanPublisher = String(publisher || 'Academic Press').trim();

    const numericIsbn = parseInt(String(isbn || '').replace(/\D/g, ''), 10) || Math.floor(1000000000 + Math.random() * 9000000000);
    const numericEdition = parseInt(String(edition || '').replace(/\D/g, ''), 10) || 1;
    const numericAvailable = Number(availableQuantity ?? quantity ?? 1) || 1;
    const numericTotal = Number(quantity ?? numericAvailable) || 1;
    const numericPubYear = Number(publicationYear) || 2024;

    // Use authenticated Supabase client forwarding user's access token
    const userSupabase = getSupabaseClient(authHeader);

    const payload = {
      "Book Title": cleanTitle,
      Author: cleanAuthor,
      Category: cleanCategory,
      Edition: numericEdition,
      Publisher: cleanPublisher,
      "ISBN Number": numericIsbn,
      "Available Copies": numericAvailable,
      shelf_location: shelfLocation || 'Main Stacks',
      cover_image: coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop',
      description: description || 'Central Library acquisition.',
      publication_year: numericPubYear,
      total_copies: numericTotal,
    };

    // Attempt 1: Full payload insert
    const { data: extData, error: extErr } = await userSupabase
      .from('Books')
      .insert([payload])
      .select();

    if (!extErr && extData && extData.length > 0) {
      const createdBook = mapSupabaseBookRow(extData[0]);
      return NextResponse.json({
        success: true,
        message: 'Book Added Successfully',
        book: createdBook,
      });
    }

    // Attempt 2: Core 7 verified columns insert if supplementary columns fail
    const corePayload = {
      "Book Title": cleanTitle,
      Author: cleanAuthor,
      Category: cleanCategory,
      Edition: numericEdition,
      Publisher: cleanPublisher,
      "ISBN Number": numericIsbn,
      "Available Copies": numericAvailable,
    };

    const { data: coreData, error: coreErr } = await userSupabase
      .from('Books')
      .insert([corePayload])
      .select();

    if (coreErr || !coreData || coreData.length === 0) {
      const finalErrorMsg = coreErr?.message || extErr?.message || 'Database insert failed for Books table';
      console.error('Books insert failed:', finalErrorMsg);
      return NextResponse.json({
        success: false,
        message: `Database error inserting book: ${finalErrorMsg}`,
        error: finalErrorMsg,
      }, { status: 500 });
    }

    const createdBook = mapSupabaseBookRow(coreData[0]);
    return NextResponse.json({
      success: true,
      message: 'Book Added Successfully',
      book: createdBook,
    });
  } catch (err: any) {
    console.error('Error in POST /api/books:', err);
    return NextResponse.json({ success: false, message: err?.message || 'Server error' }, { status: 500 });
  }
}

// PATCH: Update an existing book in public."Books"
export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const userJwt = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!userJwt) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Administrator bearer token is required to update books.' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { id, ...updates } = body || {};

    if (!id) {
      return NextResponse.json({ success: false, message: 'Book ID is required.' }, { status: 400 });
    }

    const userSupabase = getSupabaseClient(authHeader);

    const updatePayload: any = {};
    if (updates.title) updatePayload["Book Title"] = String(updates.title).trim();
    if (updates.author) updatePayload.Author = String(updates.author).trim();
    if (updates.category) updatePayload.Category = String(updates.category).trim();
    if (updates.publisher) updatePayload.Publisher = String(updates.publisher).trim();
    if (updates.edition) {
      updatePayload.Edition = parseInt(String(updates.edition).replace(/\D/g, ''), 10) || 1;
    }
    if (updates.isbn) {
      updatePayload["ISBN Number"] = parseInt(String(updates.isbn).replace(/\D/g, ''), 10) || null;
    }
    if (updates.availableQuantity !== undefined) {
      updatePayload["Available Copies"] = Number(updates.availableQuantity);
    }

    let query = userSupabase.from('Books').update(updatePayload);
    if (!isNaN(Number(id))) {
      query = query.eq('id', Number(id));
    } else {
      query = query.eq('Book Title', updates.title || '');
    }

    const { data, error } = await query.select();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Book updated successfully', data });
  } catch (err: any) {
    console.error('Error in PATCH /api/books:', err);
    return NextResponse.json({ success: false, message: err?.message || 'Server error' }, { status: 500 });
  }
}

// DELETE: Remove a book from public."Books"
export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const userJwt = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!userJwt) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Administrator bearer token is required to delete books.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Book ID is required.' }, { status: 400 });
    }

    const userSupabase = getSupabaseClient(authHeader);

    let query = userSupabase.from('Books').delete();
    if (!isNaN(Number(id))) {
      query = query.eq('id', Number(id));
    } else {
      query = query.eq('Book Title', id);
    }

    const { error } = await query;
    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Book deleted successfully' });
  } catch (err: any) {
    console.error('Error in DELETE /api/books:', err);
    return NextResponse.json({ success: false, message: err?.message || 'Server error' }, { status: 500 });
  }
}
