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

  return (
    <div className="flex flex-wrap gap-3">
      {CATEGORIES.map((cat) => (
        <div
          key={cat.key}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${cat.color}`}
        >
          <span className="text-lg font-bold tabular-nums">{counts[cat.key]}</span>
          <span>{cat.label}</span>
        </div>
      ))}
    </div>
  );
}
