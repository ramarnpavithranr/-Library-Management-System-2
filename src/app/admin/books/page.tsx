'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { SearchInput } from '@/components/common/SearchInput';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { ExcelImportModal } from '@/components/admin/ExcelImportModal';
import { Book } from '@/types';

export default function AdminBooksPage() {
  const { books, categories, addBook, bulkAddBooks, updateBook, deleteBook } = useLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'out'>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: categories[0]?.name || 'Programming',
    isbn: '',
    publisher: '',
    edition: '1st Edition',
    publicationYear: 2023,
    quantity: 10,
    availableQuantity: 10,
    shelfLocation: 'Shelf A1-Rack 1',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop',
    description: '',
  });

  // Filter books
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.includes(searchQuery) ||
      book.shelfLocation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || book.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesAvailability =
      availabilityFilter === 'all'
        ? true
        : availabilityFilter === 'available'
        ? book.availableQuantity > 0
        : book.availableQuantity === 0;

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      author: '',
      category: categories[0]?.name || 'Programming',
      isbn: `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      publisher: 'Academic Press',
      edition: '1st Edition',
      publicationYear: 2024,
      quantity: 8,
      availableQuantity: 8,
      shelfLocation: 'Shelf B2-Rack 3',
      coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?q=80&w=600&auto=format&fit=crop',
      description: 'Comprehensive college textbook for undergraduate and postgraduate studies.',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (book: Book) => {
    setSelectedBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      category: book.category,
      isbn: book.isbn,
      publisher: book.publisher,
      edition: book.edition,
      publicationYear: book.publicationYear,
      quantity: book.quantity,
      availableQuantity: book.availableQuantity,
      shelfLocation: book.shelfLocation,
      coverImage: book.coverImage,
      description: book.description,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.author) {
      alert('Please fill in title and author');
      return;
    }
    addBook(formData);
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;
    updateBook(selectedBook.id, formData);
    setIsEditModalOpen(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}" from the catalogue?`)) {
      deleteBook(id);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopBar
        title="Book Management"
        subtitle="Catalogue, Shelf Locations & Inventory"
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Top Controls: Search, Add Button & Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex-1 max-w-lg">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by title, author, ISBN, shelf..."
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExcelModalOpen(true)}
              className="py-3 px-4 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full text-xs font-bold shadow-soft flex items-center gap-2 active:scale-95 transition-all"
            >
              <FileSpreadsheet size={16} className="text-emerald-700" />
              <span>Upload Excel</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="py-3 px-5 bg-gradient-to-r from-burgundy-900 to-burgundy-800 hover:from-burgundy-800 hover:to-burgundy-900 text-white rounded-full text-xs font-bold shadow-burgundy-glow flex items-center gap-2 active:scale-95 transition-all"
            >
              <Plus size={16} />
              <span>Add New Book</span>
            </button>
          </div>
        </div>

        {/* Category Pills & Availability Filter Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-x-auto pb-1">
          {/* Category Horizontal Scrolling Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'All'
                  ? 'bg-burgundy-800 text-white shadow-sm'
                  : 'bg-white text-charcoal-700 border border-burgundy-100 hover:bg-burgundy-50'
              }`}
            >
              All Categories ({books.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.name)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === c.name
                    ? 'bg-burgundy-800 text-white shadow-sm'
                    : 'bg-white text-charcoal-700 border border-burgundy-100 hover:bg-burgundy-50'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-burgundy-100 shadow-soft shrink-0">
            <button
              onClick={() => setAvailabilityFilter('all')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all ${
                availabilityFilter === 'all'
                  ? 'bg-burgundy-800 text-white'
                  : 'text-charcoal-600 hover:text-burgundy-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setAvailabilityFilter('available')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all ${
                availabilityFilter === 'available'
                  ? 'bg-emerald-600 text-white'
                  : 'text-charcoal-600 hover:text-emerald-700'
              }`}
            >
              In Stock
            </button>
            <button
              onClick={() => setAvailabilityFilter('out')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all ${
                availabilityFilter === 'out'
                  ? 'bg-rose-600 text-white'
                  : 'text-charcoal-600 hover:text-rose-700'
              }`}
            >
              Checked Out
            </button>
          </div>
        </div>

        {/* Books Grid / Cards (Mobile First, responsive grid) */}
        {filteredBooks.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-burgundy-100 shadow-soft">
            <BookOpen size={40} className="mx-auto text-burgundy-300 mb-3" />
            <h4 className="text-base font-bold text-charcoal-800 mb-1">No Books Matched</h4>
            <p className="text-xs text-charcoal-500 mb-4">
              Try adjusting your search terms or filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setAvailabilityFilter('all');
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
              return (
                <div
                  key={book.id}
                  className="bg-white rounded-3xl p-4 border border-burgundy-100/80 shadow-soft hover:shadow-soft-lg transition-all duration-200 flex flex-col justify-between"
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
                              {book.availableQuantity} Left
                            </Badge>
                          ) : (
                            <Badge variant="danger" size="sm" dot>
                              Reserved
                            </Badge>
                          )}
                        </div>

                        <h4 className="text-sm font-extrabold text-charcoal-900 line-clamp-2 leading-tight">
                          {book.title}
                        </h4>
                        <p className="text-xs text-charcoal-600 font-medium truncate mt-0.5">
                          by {book.author}
                        </p>
                        <p className="text-[10px] text-charcoal-400 font-mono mt-1">
                          ISBN: {book.isbn}
                        </p>
                      </div>
                    </div>

                    {/* Shelf Location & Edition */}
                    <div className="p-2.5 rounded-2xl bg-[#FAF7F7] border border-burgundy-50 flex items-center justify-between text-[11px] text-charcoal-600 mb-3">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-burgundy-700" />
                        <span className="font-semibold text-charcoal-800">{book.shelfLocation}</span>
                      </div>
                      <span className="text-charcoal-400">{book.edition}</span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-2 border-t border-burgundy-50 flex items-center justify-between">
                    <span className="text-[11px] text-charcoal-500 font-medium">
                      Total: <strong>{book.quantity}</strong> | Avail: <strong className={isAvailable ? 'text-emerald-600' : 'text-rose-600'}>{book.availableQuantity}</strong>
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedBook(book);
                          setIsDetailModalOpen(true);
                        }}
                        className="p-2 rounded-xl text-charcoal-500 hover:text-burgundy-900 hover:bg-burgundy-50"
                        title="View details"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(book)}
                        className="p-2 rounded-xl text-charcoal-500 hover:text-burgundy-900 hover:bg-burgundy-50"
                        title="Edit book"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(book.id, book.title)}
                        className="p-2 rounded-xl text-charcoal-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete book"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ADD BOOK MODAL */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Book to Library"
          subtitle="Register a new academic title in the catalogue"
          maxWidth="lg"
        >
          <form onSubmit={handleSaveAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Book Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Design Patterns: Elements of Reusable Object-Oriented Software"
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Author(s) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="e.g. Erich Gamma, Richard Helm"
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  ISBN Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                  placeholder="978-xxxxxxxxxx"
                  className="w-full text-xs font-mono font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Shelf / Rack Location *
                </label>
                <input
                  type="text"
                  required
                  value={formData.shelfLocation}
                  onChange={(e) => setFormData({ ...formData, shelfLocation: e.target.value })}
                  placeholder="e.g. Shelf A2-Rack 4"
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Publisher
                </label>
                <input
                  type="text"
                  value={formData.publisher}
                  onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                  placeholder="e.g. Pearson / MIT Press"
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Edition
                </label>
                <input
                  type="text"
                  value={formData.edition}
                  onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
                  placeholder="e.g. 2nd Edition"
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Total Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => {
                    const q = parseInt(e.target.value) || 1;
                    setFormData({ ...formData, quantity: q, availableQuantity: q });
                  }}
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Available Copies
                </label>
                <input
                  type="number"
                  min="0"
                  max={formData.quantity}
                  value={formData.availableQuantity}
                  onChange={(e) => setFormData({ ...formData, availableQuantity: parseInt(e.target.value) || 0 })}
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Book Cover Image URL
                </label>
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Description / Synopsis
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Overview of this book's content..."
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-burgundy-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-charcoal-600 hover:bg-charcoal-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-burgundy-800 hover:bg-burgundy-900 text-white rounded-2xl text-xs font-bold shadow-burgundy-glow"
              >
                Save & Add Book
              </button>
            </div>
          </form>
        </Modal>

        {/* EDIT BOOK MODAL */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Book Details"
          subtitle={`Update record for: ${selectedBook?.title}`}
          maxWidth="lg"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Book Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Author
                </label>
                <input
                  type="text"
                  required
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Shelf Location
                </label>
                <input
                  type="text"
                  required
                  value={formData.shelfLocation}
                  onChange={(e) => setFormData({ ...formData, shelfLocation: e.target.value })}
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Available Copies
                </label>
                <input
                  type="number"
                  min="0"
                  max={formData.quantity}
                  value={formData.availableQuantity}
                  onChange={(e) => setFormData({ ...formData, availableQuantity: parseInt(e.target.value) || 0 })}
                  className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-burgundy-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-charcoal-600 hover:bg-charcoal-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-burgundy-800 hover:bg-burgundy-900 text-white rounded-2xl text-xs font-bold shadow-burgundy-glow"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>

        {/* VIEW DETAILS MODAL */}
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="Book Details & Availability"
          maxWidth="md"
        >
          {selectedBook && (
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-24 h-36 rounded-2xl overflow-hidden shadow-md shrink-0 bg-burgundy-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedBook.coverImage}
                    alt={selectedBook.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <Badge variant="burgundy" size="sm" className="mb-1">
                    {selectedBook.category}
                  </Badge>
                  <h3 className="text-base font-bold text-charcoal-900 leading-tight">
                    {selectedBook.title}
                  </h3>
                  <p className="text-xs text-charcoal-600 mt-1">by {selectedBook.author}</p>
                  <p className="text-[11px] font-mono text-charcoal-400 mt-1">
                    ISBN: {selectedBook.isbn}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant={selectedBook.availableQuantity > 0 ? 'success' : 'danger'} dot>
                      {selectedBook.availableQuantity > 0
                        ? `${selectedBook.availableQuantity} of ${selectedBook.quantity} Available`
                        : 'Currently Checked Out'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-[#FAF7F7] rounded-2xl border border-burgundy-50 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Shelf & Rack Location:</span>
                  <span className="font-bold text-charcoal-800">{selectedBook.shelfLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Publisher:</span>
                  <span className="font-medium text-charcoal-800">{selectedBook.publisher} ({selectedBook.publicationYear})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Edition:</span>
                  <span className="font-medium text-charcoal-800">{selectedBook.edition}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1">
                  Description / Synopsis
                </h4>
                <p className="text-xs text-charcoal-600 leading-relaxed bg-[#FAF7F7] p-3 rounded-2xl border border-burgundy-50">
                  {selectedBook.description}
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-5 py-2.5 bg-burgundy-800 text-white rounded-2xl text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Excel Import Modal */}
        <ExcelImportModal
          isOpen={isExcelModalOpen}
          onClose={() => setIsExcelModalOpen(false)}
          type="books"
          onImport={(importedBooks) => {
            bulkAddBooks(importedBooks);
          }}
        />
      </main>
    </div>
  );
}

