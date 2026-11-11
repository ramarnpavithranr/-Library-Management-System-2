'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FolderTree, BookOpen, ChevronRight, Sparkles } from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';
import { StudentTopBar } from '@/components/student/StudentTopBar';

export default function StudentCategoriesPage() {
  const router = useRouter();
  const { categories, books } = useLibrary();

  return (
    <div className="flex-1 flex flex-col">
      <StudentTopBar
        title="Browse by Category"
        subtitle="Departmental Textbooks, Curriculums & Specializations"
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const actualCount = books.filter(
              (b) => b.category.toLowerCase() === cat.name.toLowerCase()
            ).length;
            const displayCount = Math.max(actualCount, cat.bookCount);

            return (
              <div
                key={cat.id}
                onClick={() => router.push(`/student/books?category=${encodeURIComponent(cat.name)}`)}
                className="bg-white rounded-3xl p-5 border border-burgundy-100/80 shadow-soft hover:shadow-soft-lg hover:border-burgundy-300 transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.98]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-burgundy-50 border border-burgundy-100 text-burgundy-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FolderTree size={22} />
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-burgundy-50 text-burgundy-900 border border-burgundy-100">
                      {displayCount} Books
                    </span>
                  </div>

                  <h4 className="text-base font-extrabold text-charcoal-900 leading-tight mb-1 group-hover:text-burgundy-800 transition-colors">
                    {cat.name}
                  </h4>
                  <p className="text-xs text-charcoal-500 line-clamp-2 leading-relaxed">
                    {cat.description || 'Core departmental textbooks and reference guides.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-burgundy-50 flex items-center justify-between text-xs font-bold text-burgundy-800">
                  <span>Explore Titles</span>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

