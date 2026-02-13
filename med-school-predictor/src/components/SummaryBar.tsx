import type { SchoolOdds } from '../types';

interface SummaryBarProps {
  results: SchoolOdds[];
}

const CATEGORIES = [
  { key: 'safety', label: 'Safety', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { key: 'target', label: 'Target', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { key: 'reach', label: 'Reach', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { key: 'far_reach', label: 'Far Reach', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
] as const;

export default function SummaryBar({ results }: SummaryBarProps) {
  const counts = {
    safety: results.filter((r) => r.category === 'safety').length,
    target: results.filter((r) => r.category === 'target').length,
    reach: results.filter((r) => r.category === 'reach').length,
    far_reach: results.filter((r) => r.category === 'far_reach').length,
  };

  const mdCount = results.filter((r) => r.schoolType === 'MD').length;
  const doCount = results.filter((r) => r.schoolType === 'DO').length;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {CATEGORIES.map((cat) => (
          <div key={cat.key} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-sm font-medium ${cat.color}`}>
            <span className="text-lg font-bold tabular-nums">{counts[cat.key]}</span>
            <span>{cat.label}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-navy-500">
        {mdCount} MD · {doCount} DO · {results.length} total
      </p>
    </div>
  );
}
