import { useState } from 'react';
import type { SchoolOdds, SchoolCategory } from '../types';
import SchoolCard from './SchoolCard';

interface SchoolResultsProps {
  results: SchoolOdds[];
  userGpa: number;
  userMcat: number;
}

type SortKey = 'odds' | 'name' | 'mcat' | 'gpa';
type FilterCategory = 'all' | SchoolCategory;

const FILTER_OPTIONS: { key: FilterCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'safety', label: 'Safety' },
  { key: 'target', label: 'Target' },
  { key: 'reach', label: 'Reach' },
  { key: 'far_reach', label: 'Far Reach' },
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'odds', label: 'Chances' },
  { key: 'name', label: 'Name' },
  { key: 'mcat', label: 'MCAT' },
  { key: 'gpa', label: 'GPA' },
];

export default function SchoolResults({ results, userGpa, userMcat }: SchoolResultsProps) {
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [sortKey, setSortKey] = useState<SortKey>('odds');

  const filtered = filter === 'all' ? results : results.filter((r) => r.category === filter);

  const sorted = [...filtered].sort((a, b) => {
    switch (sortKey) {
      case 'odds':
        return b.finalOdds - a.finalOdds;
      case 'name':
        return a.shortName.localeCompare(b.shortName);
      case 'mcat':
        return (b.schoolMedianMCAT ?? 0) - (a.schoolMedianMCAT ?? 0);
      case 'gpa':
        return (b.schoolMedianGPA ?? 0) - (a.schoolMedianGPA ?? 0);
    }
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setFilter(opt.key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === opt.key
                  ? 'bg-teal-500 text-white'
                  : 'bg-navy-800 text-navy-300 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-navy-400">Sort:</span>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="bg-navy-800 border border-navy-600 rounded-lg px-2 py-1 text-xs text-white
                       focus:outline-none focus:ring-1 focus:ring-teal-500"
            aria-label="Sort results by"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="text-navy-400 text-sm py-8 text-center">
          No schools match the current filter.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {sorted.map((odds) => (
            <SchoolCard key={odds.schoolId} odds={odds} userGpa={userGpa} userMcat={userMcat} />
          ))}
        </div>
      )}
    </div>
  );
}
