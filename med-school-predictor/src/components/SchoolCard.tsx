import { useState } from 'react';
import type { SchoolOdds } from '../types';

interface SchoolCardProps {
  odds: SchoolOdds;
  userGpa: number;
  userMcat: number;
}

const CATEGORY_STYLES = {
  safety: { badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: 'Safety', ring: 'ring-emerald-500/20' },
  target: { badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Target', ring: 'ring-blue-500/20' },
  reach: { badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Reach', ring: 'ring-amber-500/20' },
  far_reach: { badge: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Far Reach', ring: 'ring-red-500/20' },
};

const ODDS_COLOR = {
  safety: 'text-emerald-400',
  target: 'text-blue-400',
  reach: 'text-amber-400',
  far_reach: 'text-red-400',
};

function formatMultiplier(m: number): string {
  if (m === 1.0) return 'None';
  return `${m.toFixed(2)}x`;
}

export default function SchoolCard({ odds, userGpa, userMcat }: SchoolCardProps) {
  const [expanded, setExpanded] = useState(false);
  const style = CATEGORY_STYLES[odds.category];
  const gpaDiff = odds.schoolAvgGPA !== null ? userGpa - odds.schoolAvgGPA : null;
  const mcatDiff = odds.schoolAvgMCAT !== null ? userMcat - odds.schoolAvgMCAT : null;

  return (
    <div className={`bg-navy-800/60 border border-navy-700 rounded-xl overflow-hidden hover:border-navy-600 transition-all ring-1 ${style.ring}`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-semibold text-sm truncate">{odds.shortName}</h3>
              <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                odds.schoolType === 'MD' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
              }`}>{odds.schoolType}</span>
            </div>
            <p className="text-xs text-navy-400 truncate">
              {odds.schoolState}{odds.ownership === 'private' ? ' · Private' : ' · Public'}
            </p>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <span className={`text-2xl font-extrabold tabular-nums ${ODDS_COLOR[odds.category]}`}>{odds.finalOdds}%</span>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${style.badge}`}>{style.label}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs mb-2">
          <div className="text-navy-400">
            Avg GPA: <span className="text-navy-200">{odds.schoolAvgGPA?.toFixed(2) ?? 'N/A'}</span>
            {gpaDiff !== null && <span className={gpaDiff >= 0 ? 'text-emerald-400 ml-1' : 'text-red-400 ml-1'}>({gpaDiff >= 0 ? '+' : ''}{gpaDiff.toFixed(2)})</span>}
          </div>
          <div className="text-navy-400">
            Avg MCAT: <span className="text-navy-200">{odds.schoolAvgMCAT ?? 'N/A'}</span>
            {mcatDiff !== null && <span className={mcatDiff >= 0 ? 'text-emerald-400 ml-1' : 'text-red-400 ml-1'}>({mcatDiff >= 0 ? '+' : ''}{mcatDiff})</span>}
          </div>
          {odds.inStatePercent !== null && (
            <div className="text-navy-400">
              In-state: <span className="text-navy-200">{odds.inStatePercent}%</span>
              {odds.isInState && <span className="text-teal-400 ml-1">(you)</span>}
            </div>
          )}
        </div>

        <button onClick={() => setExpanded(!expanded)}
          className="text-xs text-teal-400 hover:text-teal-300 transition-colors" aria-expanded={expanded}>
          {expanded ? 'Hide breakdown' : 'Show breakdown'}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-navy-700 bg-navy-900/40 px-4 py-3">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-navy-400">National baseline ({odds.schoolType})</span>
              <span className="text-navy-200 font-medium">{odds.baselineOdds}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-400">Stats adjustment</span>
              <span className={`font-medium ${odds.statsAdjustment >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {odds.statsAdjustment >= 0 ? '+' : ''}{odds.statsAdjustment}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-400">Residency multiplier</span>
              <span className={`font-medium ${odds.inStateMultiplier > 1 ? 'text-emerald-400' : odds.inStateMultiplier < 1 ? 'text-red-400' : 'text-navy-200'}`}>
                {formatMultiplier(odds.inStateMultiplier)}{odds.isInState && ' (in-state)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-400">Qualitative bonus</span>
              <span className={`font-medium ${odds.qualitativeBonus > 0 ? 'text-emerald-400' : 'text-navy-200'}`}>+{odds.qualitativeBonus}%</span>
            </div>
            <div className="flex justify-between pt-1.5 border-t border-navy-700">
              <span className="text-navy-300 font-medium">Final odds</span>
              <span className={`font-bold ${ODDS_COLOR[odds.category]}`}>{odds.finalOdds}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
