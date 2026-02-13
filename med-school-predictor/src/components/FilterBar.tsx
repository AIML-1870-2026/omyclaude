import type { SchoolCategory, DegreeType } from '../types';

export type SortKey = 'odds' | 'name' | 'mcat' | 'gpa' | 'state';
export type FilterCategory = 'all' | SchoolCategory;
export type FilterType = 'all' | DegreeType;

interface FilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  filterCategory: FilterCategory;
  onFilterCategoryChange: (v: FilterCategory) => void;
  filterType: FilterType;
  onFilterTypeChange: (v: FilterType) => void;
  sortKey: SortKey;
  onSortKeyChange: (v: SortKey) => void;
  totalCount: number;
  filteredCount: number;
}

const CATEGORY_OPTIONS: { key: FilterCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'safety', label: 'Safety' },
  { key: 'target', label: 'Target' },
  { key: 'reach', label: 'Reach' },
  { key: 'far_reach', label: 'Far Reach' },
];

const TYPE_OPTIONS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'MD', label: 'MD' },
  { key: 'DO', label: 'DO' },
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'odds', label: 'Chances' },
  { key: 'name', label: 'Name' },
  { key: 'state', label: 'State' },
  { key: 'mcat', label: 'MCAT' },
  { key: 'gpa', label: 'GPA' },
];

export default function FilterBar({
  search, onSearchChange,
  filterCategory, onFilterCategoryChange,
  filterType, onFilterTypeChange,
  sortKey, onSortKeyChange,
  totalCount, filteredCount,
}: FilterBarProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" placeholder="Search schools..." value={search} onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-navy-800 border border-navy-600 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          aria-label="Search schools by name" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_OPTIONS.map((opt) => (
            <button key={opt.key} onClick={() => onFilterCategoryChange(opt.key)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                filterCategory === opt.key ? 'bg-teal-500 text-white' : 'bg-navy-800 text-navy-300 hover:text-white'
              }`}>{opt.label}</button>
          ))}
        </div>
        <div className="h-4 w-px bg-navy-700" />
        <div className="flex gap-1.5">
          {TYPE_OPTIONS.map((opt) => (
            <button key={opt.key} onClick={() => onFilterTypeChange(opt.key)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                filterType === opt.key ? 'bg-teal-500 text-white' : 'bg-navy-800 text-navy-300 hover:text-white'
              }`}>{opt.label}</button>
          ))}
        </div>
        <div className="h-4 w-px bg-navy-700" />
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-navy-400">Sort:</span>
          <select value={sortKey} onChange={(e) => onSortKeyChange(e.target.value as SortKey)}
            className="bg-navy-800 border border-navy-600 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
            aria-label="Sort results by">
            {SORT_OPTIONS.map((opt) => <option key={opt.key} value={opt.key}>{opt.label}</option>)}
          </select>
        </div>
        <span className="text-xs text-navy-500 ml-auto">{filteredCount} of {totalCount} schools</span>
      </div>
    </div>
  );
}
