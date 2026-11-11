'use client';

import React, { useState } from 'react';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Search,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { SearchInput } from '@/components/common/SearchInput';
import { Modal } from '@/components/common/Modal';
import { Category } from '@/types';

export default function AdminCategoriesPage() {
  const { categories, books, addCategory, updateCategory, deleteCategory } = useLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'FolderTree',
    colorTag: '#6E1129',
    bookCount: 0,
  });

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      description: '',
      icon: 'BookOpen',
      colorTag: '#6E1129',
      bookCount: 0,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      icon: category.icon,
      colorTag: category.colorTag,
      bookCount: category.bookCount,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    addCategory(formData);
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    updateCategory(selectedCategory.id, formData);
    setIsEditModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete category "${name}"?`)) {
      deleteCategory(id);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopBar
        title="Category Management"
        subtitle="Departmental Taxonomy & Category-Wise Statistics"
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search academic categories..."
            />
          </div>

          <button
            onClick={handleOpenAdd}
            className="py-3 px-5 bg-gradient-to-r from-burgundy-900 to-burgundy-800 hover:from-burgundy-800 hover:to-burgundy-900 text-white rounded-full text-xs font-bold shadow-burgundy-glow flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Plus size={16} />
            <span>Add Category</span>
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCategories.map((cat) => {
            // Count actual books in catalogue matching this category
            const liveBookCount = books.filter(
              (b) => b.category.toLowerCase() === cat.name.toLowerCase()
            ).length;
            const displayCount = Math.max(liveBookCount, cat.bookCount);

            return (
              <div
                key={cat.id}
                className="bg-white rounded-3xl p-5 border border-burgundy-100/80 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-burgundy-50 border border-burgundy-100 text-burgundy-800 flex items-center justify-center">
                      <FolderTree size={20} />
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-burgundy-50 text-burgundy-900 border border-burgundy-100">
                      {displayCount} Books
                    </span>
                  </div>

                  <h4 className="text-base font-extrabold text-charcoal-900 leading-tight mb-1">
                    {cat.name}
                  </h4>
                  <p className="text-xs text-charcoal-500 line-clamp-2 leading-relaxed">
                    {cat.description || 'Academic collection for reference and course curriculum.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-burgundy-50 flex items-center justify-between">
                  <span className="text-[10px] text-charcoal-400 font-semibold uppercase tracking-wider">
                    Category Tag
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 rounded-lg text-charcoal-500 hover:text-burgundy-900 hover:bg-burgundy-50"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="p-1.5 rounded-lg text-charcoal-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ADD CATEGORY MODAL */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Create New Category"
          subtitle="Add an academic subject or specialization"
        >
          <form onSubmit={handleSaveAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Artificial Intelligence"
                className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                Description / Scope
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Details on books grouped in this category..."
                className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                Initial Stock Count
              </label>
              <input
                type="number"
                min="0"
                value={formData.bookCount}
                onChange={(e) => setFormData({ ...formData, bookCount: parseInt(e.target.value) || 0 })}
                className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
              />
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
                Save Category
              </button>
            </div>
          </form>
        </Modal>

        {/* EDIT CATEGORY MODAL */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Category"
          subtitle={`Modifying category: ${selectedCategory?.name}`}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                Category Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
              />
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
                Save Updates
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
}

