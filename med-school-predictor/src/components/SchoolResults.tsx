import { useState, useMemo } from 'react';
import type { SchoolOdds } from '../types';
import SchoolCard from './SchoolCard';
import FilterBar, { type SortKey, type FilterCategory, type FilterType } from './FilterBar';

interface SchoolResultsProps {
  results: SchoolOdds[];
  userGpa: number;
  userMcat: number;
}

export default function SchoolResults({ results, userGpa, userMcat }: SchoolResultsProps) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortKey, setSortKey] = useState<SortKey>('odds');

  const processed = useMemo(() => {
    let list = results;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r) =>
        r.shortName.toLowerCase().includes(q) ||
        r.schoolName.toLowerCase().includes(q) ||
        r.schoolState.toLowerCase().includes(q),
      );
    }
    if (filterCategory !== 'all') list = list.filter((r) => r.category === filterCategory);
    if (filterType !== 'all') list = list.filter((r) => r.schoolType === filterType);

    return [...list].sort((a, b) => {
      switch (sortKey) {
        case 'odds': return b.finalOdds - a.finalOdds;
        case 'name': return a.shortName.localeCompare(b.shortName);
        case 'state': return a.schoolState.localeCompare(b.schoolState) || b.finalOdds - a.finalOdds;
        case 'mcat': return (b.schoolAvgMCAT ?? 0) - (a.schoolAvgMCAT ?? 0);
        case 'gpa': return (b.schoolAvgGPA ?? 0) - (a.schoolAvgGPA ?? 0);
      }
    });
  }, [results, search, filterCategory, filterType, sortKey]);

  return (
    <div>
      <FilterBar
        search={search} onSearchChange={setSearch}
        filterCategory={filterCategory} onFilterCategoryChange={setFilterCategory}
        filterType={filterType} onFilterTypeChange={setFilterType}
        sortKey={sortKey} onSortKeyChange={setSortKey}
        totalCount={results.length} filteredCount={processed.length}
      />
      {processed.length === 0 ? (
        <p className="text-navy-400 text-sm py-8 text-center">No schools match the current filters.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 mt-4">
          {processed.map((odds) => (
            <SchoolCard key={odds.schoolId} odds={odds} userGpa={userGpa} userMcat={userMcat} />
          ))}
        </div>
      )}
    </div>
  );
}
