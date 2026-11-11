'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  BookOpen,
  MapPin,
  BookmarkPlus,
  CheckCircle,
  Eye,
  SlidersHorizontal,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';
import { useAuth } from '@/context/AuthContext';
import { StudentTopBar } from '@/components/student/StudentTopBar';
import { SearchInput } from '@/components/common/SearchInput';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { Book } from '@/types';
import confetti from 'canvas-confetti';

function BooksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const { books, categories, requestPreBook, preBookings } = useLibrary();
  const { user } = useAuth();
  const currentStudentId = user?.studentId || 'STU-2024-001';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [availabilityOnly, setAvailabilityOnly] = useState(false);

  // Pre-Book reservation modal state
  const [selectedBookForPreBook, setSelectedBookForPreBook] = useState<Book | null>(null);
  const [isPreBookModalOpen, setIsPreBookModalOpen] = useState(false);
  const [preBookNotes, setPreBookNotes] = useState('');
  const [preBookResult, setPreBookResult] = useState<{ success: boolean; message: string } | null>(null);

  // Book Details Modal state
  const [detailBook, setDetailBook] = useState<Book | null>(null);

  // Update selectedCategory if query param changes
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  // Filter books
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.includes(searchQuery) ||
      book.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.shelfLocation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || book.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesAvail = !availabilityOnly || book.availableQuantity > 0;

    return matchesSearch && matchesCategory && matchesAvail;
  });

  const handleOpenPreBook = (book: Book) => {
    setSelectedBookForPreBook(book);
    setPreBookNotes('Reserve for academic term project');
    setPreBookResult(null);
    setIsPreBookModalOpen(true);
  };

  const handleConfirmPreBook = () => {
    if (!selectedBookForPreBook) return;
    const res = requestPreBook(currentStudentId, selectedBookForPreBook.id, preBookNotes);
    setPreBookResult(res);

    if (res.success) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#6E1129', '#B42244', '#FB7185'],
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <StudentTopBar
        title="Library Catalogue"
        subtitle="Search Textbooks, Research Monograms & Reserves"
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Search & In-Stock Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex-1 max-w-lg">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by Title, Author, Category, ISBN..."
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none bg-white px-4 py-2.5 rounded-full border border-burgundy-100 shadow-soft text-xs font-bold text-charcoal-700 self-start sm:self-auto">
            <input
              type="checkbox"
              checked={availabilityOnly}
              onChange={(e) => setAvailabilityOnly(e.target.checked)}
              className="rounded text-burgundy-800 focus:ring-burgundy-700 w-4 h-4"
            />
            <span>Show Only Available Books</span>
          </label>
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'All'
                ? 'bg-burgundy-800 text-white shadow-sm'
                : 'bg-white text-charcoal-700 border border-burgundy-100 hover:bg-burgundy-50'
            }`}
          >
            All Disciplines ({books.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.name)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory.toLowerCase() === c.name.toLowerCase()
                  ? 'bg-burgundy-800 text-white shadow-sm'
                  : 'bg-white text-charcoal-700 border border-burgundy-100 hover:bg-burgundy-50'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Books Cards Grid */}
        {filteredBooks.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-burgundy-100 shadow-soft">
            <BookOpen size={40} className="mx-auto text-burgundy-300 mb-3" />
            <h4 className="text-base font-bold text-charcoal-800 mb-1">No Matching Books Found</h4>
            <p className="text-xs text-charcoal-500 mb-4">
              We couldn&apos;t find any books matching &quot;{searchQuery}&quot;.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setAvailabilityOnly(false);
              }}
              className="px-4 py-2 bg-burgundy-50 text-burgundy-900 rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredBooks.map((book) => {
              const isAvailable = book.availableQuantity > 0;
              const hasPreBooked = preBookings.some(
                (p) => p.studentId === currentStudentId && p.bookId === book.id && (p.status === 'pending' || p.status === 'approved')
              );

              return (
                <div
                  key={book.id}
                  className="bg-white rounded-3xl p-4 sm:p-5 border border-burgundy-100/80 shadow-soft hover:shadow-soft-lg transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Top row: Cover image thumbnail + Basic Details */}
                    <div className="flex gap-3.5 mb-3">
                      <div className="relative w-20 h-28 rounded-2xl overflow-hidden bg-burgundy-950 shrink-0 shadow-sm border border-burgundy-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 text-[9px] font-bold bg-black/70 text-white px-1.5 py-0.5 rounded">
                          {book.publicationYear}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Badge variant="burgundy" size="sm">
                            {book.category}
                          </Badge>
                          {isAvailable ? (
                            <Badge variant="success" size="sm" dot>
                              {book.availableQuantity} In Stacks
                            </Badge>
                          ) : (
                            <Badge variant="danger" size="sm" dot>
                              All Out
                            </Badge>
                          )}
                        </div>

                        <h4
                          onClick={() => setDetailBook(book)}
                          className="text-sm font-extrabold text-charcoal-900 line-clamp-2 leading-tight cursor-pointer hover:text-burgundy-800 transition-colors"
                        >
                          {book.title}
                        </h4>
                        <p className="text-xs text-charcoal-600 font-medium truncate mt-0.5">
                          {book.author}
                        </p>
                        <p className="text-[10px] text-charcoal-400 font-mono mt-0.5">
                          ISBN: {book.isbn}
                        </p>
                      </div>
                    </div>

                    {/* Shelf Location */}
                    <div className="p-2.5 rounded-2xl bg-[#FAF7F7] border border-burgundy-50 flex items-center justify-between text-xs text-charcoal-600 mb-3">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-burgundy-700" />
                        <span className="font-semibold text-charcoal-800">{book.shelfLocation}</span>
                      </div>
                      <span className="text-[11px] text-charcoal-400">{book.edition}</span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-2 border-t border-burgundy-50 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setDetailBook(book)}
                      className="px-3 py-2 text-charcoal-700 hover:text-burgundy-900 rounded-xl text-xs font-bold hover:bg-burgundy-50 transition-colors flex items-center gap-1"
                    >
                      <Eye size={14} />
                      <span>Details</span>
                    </button>

                    {hasPreBooked ? (
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                        Reserved
                      </span>
                    ) : (
                      <button
                        onClick={() => handleOpenPreBook(book)}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1.5 ${
                          isAvailable
                            ? 'bg-burgundy-800 hover:bg-burgundy-900 text-white shadow-burgundy-glow'
                            : 'bg-amber-600 hover:bg-amber-700 text-white'
                        }`}
                      >
                        <BookmarkPlus size={14} />
                        <span>{isAvailable ? 'Reserve / Pre-Book' : 'Join Waitlist (Pre-Book)'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PRE-BOOK / RESERVE MODAL */}
        <Modal
          isOpen={isPreBookModalOpen}
          onClose={() => setIsPreBookModalOpen(false)}
          title="Pre-Book Library Title"
          subtitle="Submit online hold request to Library Circulation Desk"
        >
          {selectedBookForPreBook && (
            <div className="space-y-4">
              <div className="flex gap-3.5 items-center p-3 bg-[#FAF7F7] rounded-2xl border border-burgundy-50">
                <div className="w-12 h-16 rounded-xl overflow-hidden bg-burgundy-950 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedBookForPreBook.coverImage}
                    alt={selectedBookForPreBook.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-charcoal-900 leading-tight">
                    {selectedBookForPreBook.title}
                  </h4>
                  <p className="text-xs text-charcoal-600">by {selectedBookForPreBook.author}</p>
                  <p className="text-[11px] text-charcoal-500 font-mono mt-0.5">
                    Location: {selectedBookForPreBook.shelfLocation}
                  </p>
                </div>
              </div>

              {preBookResult ? (
                <div
                  className={`p-4 rounded-2xl border text-xs ${
                    preBookResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  <p className="font-bold mb-1">
                    {preBookResult.success ? '✓ Request Submitted!' : 'Submission Notice'}
                  </p>
                  <p>{preBookResult.message}</p>
                  <button
                    onClick={() => setIsPreBookModalOpen(false)}
                    className="mt-3 px-4 py-1.5 bg-burgundy-800 text-white rounded-xl font-bold text-xs"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-burgundy-50 rounded-2xl border border-burgundy-100 text-xs text-burgundy-950 leading-relaxed">
                    <strong>Pre-Booking Policy:</strong> Once approved by the librarian, this title will be held at circulation counter 2 for <strong>5 working days</strong>. You will receive an in-app confirmation.
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                      Academic Reason / Reservation Note
                    </label>
                    <input
                      type="text"
                      value={preBookNotes}
                      onChange={(e) => setPreBookNotes(e.target.value)}
                      placeholder="e.g. Lab assignment research"
                      className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                    />
                  </div>

                  <div className="pt-3 border-t border-burgundy-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPreBookModalOpen(false)}
                      className="px-4 py-2.5 rounded-2xl text-xs font-bold text-charcoal-600 hover:bg-charcoal-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmPreBook}
                      className="px-5 py-2.5 bg-burgundy-800 hover:bg-burgundy-900 text-white rounded-2xl text-xs font-bold shadow-burgundy-glow flex items-center gap-1.5"
                    >
                      <Sparkles size={14} />
                      <span>Confirm Pre-Booking</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </Modal>

        {/* BOOK DETAILS MODAL */}
        <Modal
          isOpen={!!detailBook}
          onClose={() => setDetailBook(null)}
          title="Book Details & Availability"
          maxWidth="md"
        >
          {detailBook && (
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-24 h-36 rounded-2xl overflow-hidden shadow-md shrink-0 bg-burgundy-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={detailBook.coverImage}
                    alt={detailBook.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <Badge variant="burgundy" size="sm" className="mb-1">
                    {detailBook.category}
                  </Badge>
                  <h3 className="text-base font-bold text-charcoal-900 leading-tight">
                    {detailBook.title}
                  </h3>
                  <p className="text-xs text-charcoal-600 mt-1">by {detailBook.author}</p>
                  <p className="text-[11px] font-mono text-charcoal-400 mt-1">
                    ISBN: {detailBook.isbn}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant={detailBook.availableQuantity > 0 ? 'success' : 'danger'} dot>
                      {detailBook.availableQuantity > 0
                        ? `${detailBook.availableQuantity} Copies Available`
                        : 'Currently Checked Out'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-[#FAF7F7] rounded-2xl border border-burgundy-50 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Shelf Location:</span>
                  <span className="font-bold text-charcoal-800">{detailBook.shelfLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Publisher:</span>
                  <span className="font-medium text-charcoal-800">{detailBook.publisher} ({detailBook.publicationYear})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Edition:</span>
                  <span className="font-medium text-charcoal-800">{detailBook.edition}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1">
                  Synopsis
                </h4>
                <p className="text-xs text-charcoal-600 leading-relaxed bg-[#FAF7F7] p-3 rounded-2xl border border-burgundy-50">
                  {detailBook.description}
                </p>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  onClick={() => setDetailBook(null)}
                  className="px-4 py-2 text-charcoal-500 hover:text-charcoal-800 text-xs font-bold"
                >
                  Close
                </button>

                <button
                  onClick={() => {
                    const b = detailBook;
                    setDetailBook(null);
                    handleOpenPreBook(b);
                  }}
                  className="px-5 py-2.5 bg-burgundy-800 hover:bg-burgundy-900 text-white rounded-2xl text-xs font-bold shadow-burgundy-glow flex items-center gap-1.5"
                >
                  <BookmarkPlus size={14} />
                  <span>Pre-Book Title</span>
                </button>
              </div>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
}

export default function StudentBooksPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-charcoal-500">Loading library catalogue...</div>}>
      <BooksContent />
    </Suspense>
  );
}

