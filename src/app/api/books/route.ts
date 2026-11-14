import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
export async function GET(req: NextRequest) {
  const supabase = getSupabase(req);
  if (!supabase) {
    return NextResponse.json({ success: false, message: 'Supabase client not configured.' }, { status: 500 });
  }

  try {
    const { data, error } = await supabase.from('Books').select('*').order('id', { ascending: true });

    if (error) {
      console.warn('Notice querying Supabase Books table:', error.message);
      return NextResponse.json({
        success: false,
        message: error.message,
        books: [],
      });
    }

    const books = (data || []).map(mapSupabaseBookRow);
    return NextResponse.json({ success: true, count: books.length, books });
  } catch (err: any) {
    console.error('Error in GET /api/books:', err);
    return NextResponse.json({ success: false, message: err?.message || 'Server error' }, { status: 500 });
  }
}

// POST: Store a new book in public."Books"
// Endpoint: https://yvogbzoolyosvilgtyxi.supabase.co/rest/v1/Books
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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

    if (!title) {
      return NextResponse.json({ success: false, message: 'Book title is required.' }, { status: 400 });
    }

    const supabase = getSupabase(req);
    if (!supabase) {
      return NextResponse.json({ success: false, message: 'Supabase client not configured.' }, { status: 500 });
    }

    // Prepare verified types for public."Books" columns
    // Columns: [id (bigint auto-inc), "Book Title" (text), Author (text), Category (text),
    //           Edition (bigint), Publisher (text), "ISBN Number" (bigint), "Available Copies" (bigint)]
    const cleanTitle = String(title).trim();
    const cleanAuthor = String(author || 'Unknown Author').trim();
    const cleanCategory = String(category || 'General Engineering').trim();
    const cleanPublisher = String(publisher || 'Academic Press').trim();

    const numericIsbn = parseInt(String(isbn || '').replace(/\D/g, ''), 10) || Math.floor(1000000000 + Math.random() * 9000000000);
    const numericEdition = parseInt(String(edition || '').replace(/\D/g, ''), 10) || 1;
    const numericAvailable = Number(availableQuantity ?? quantity ?? 1) || 1;
    const numericTotal = Number(quantity ?? numericAvailable) || 1;
    const numericPubYear = Number(publicationYear) || 2024;

    // Attempt 1: Extended schema insert (includes supplementary columns if present)
    const extendedPayload: any = {
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

    let insertedRow: any = null;
    let supaError: string | null = null;

    const { data: extData, error: extErr } = await supabase
      .from('Books')
      .insert([extendedPayload])
      .select();

    if (!extErr && extData && extData.length > 0) {
      insertedRow = extData[0];
    } else {
      // Attempt 2: Core confirmed schema insert (only the 7 verified columns in public."Books")
      const corePayload = {
        "Book Title": cleanTitle,
        Author: cleanAuthor,
        Category: cleanCategory,
        Edition: numericEdition,
        Publisher: cleanPublisher,
        "ISBN Number": numericIsbn,
        "Available Copies": numericAvailable,
      };

      const { data: coreData, error: coreErr } = await supabase
        .from('Books')
        .insert([corePayload])
        .select();

      if (!coreErr && coreData && coreData.length > 0) {
        insertedRow = coreData[0];
      } else {
        supaError = coreErr?.message || extErr?.message || 'Database insert error';
      }
    }

    if (!insertedRow) {
      console.warn('Notice inserting into Supabase Books table:', supaError);
      return NextResponse.json({
        success: false,
        message: `Failed to insert book into database: ${supaError}. Please execute 'supabase_books_policies.sql' in Supabase SQL Editor.`,
        error: supaError,
        endpointUsed: 'https://yvogbzoolyosvilgtyxi.supabase.co/rest/v1/Books',
      }, { status: 500 });
    }

    const createdBook = mapSupabaseBookRow(insertedRow);
    return NextResponse.json({
      success: true,
      message: `Book "${cleanTitle}" stored in Supabase Books table successfully!`,
      book: createdBook,
      endpointUsed: 'https://yvogbzoolyosvilgtyxi.supabase.co/rest/v1/Books',
    });
  } catch (err: any) {
    console.error('Error in POST /api/books:', err);
    return NextResponse.json({ success: false, message: err?.message || 'Server error' }, { status: 500 });
  }
}

// PATCH: Update an existing book in public."Books"
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body || {};

    if (!id) {
      return NextResponse.json({ success: false, message: 'Book ID is required.' }, { status: 400 });
    }

    const supabase = getSupabase(req);
    if (!supabase) {
      return NextResponse.json({ success: false, message: 'Supabase client not configured.' }, { status: 500 });
    }

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

    let query = supabase.from('Books').update(updatePayload);
    if (!isNaN(Number(id))) {
      query = query.eq('id', Number(id));
    } else {
      query = query.eq('Book Title', updates.title || '');
    }

    const { data, error } = await query.select();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Book updated successfully.',
      book: data && data[0] ? mapSupabaseBookRow(data[0]) : null,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message }, { status: 500 });
  }
}

// DELETE: Remove a book from public."Books"
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Book ID is required.' }, { status: 400 });
    }

    const supabase = getSupabase(req);
    if (!supabase) {
      return NextResponse.json({ success: false, message: 'Supabase client not configured.' }, { status: 500 });
    }

    let query = supabase.from('Books').delete();
    if (!isNaN(Number(id))) {
      query = query.eq('id', Number(id));
    }

    const { error } = await query;
    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Book deleted successfully.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message }, { status: 500 });
  }
}
