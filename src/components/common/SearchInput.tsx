import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  onFilterClick?: () => void;
  showFilterBtn?: boolean;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search books, authors, ISBN...',
  onFilterClick,
  showFilterBtn = false,
  className = '',
}) => {
  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      <div className="relative flex-1 flex items-center">
        <Search
          size={18}
          className="absolute left-4 text-charcoal-400 pointer-events-none"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white text-charcoal-900 placeholder-charcoal-400 pl-11 pr-10 py-3 rounded-full text-sm font-medium border border-burgundy-100/80 shadow-soft focus:outline-none focus:ring-2 focus:ring-burgundy-700/20 focus:border-burgundy-600 transition-all"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3.5 p-1 rounded-full text-charcoal-400 hover:text-charcoal-700 hover:bg-charcoal-100 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {showFilterBtn && (
        <button
          onClick={onFilterClick}
          className="p-3 bg-burgundy-800 text-white rounded-full shadow-burgundy-glow hover:bg-burgundy-900 transition-all flex items-center justify-center shrink-0 active:scale-95"
          title="Filter"
        >
          <SlidersHorizontal size={17} />
        </button>
      )}
    </div>
  );
};

