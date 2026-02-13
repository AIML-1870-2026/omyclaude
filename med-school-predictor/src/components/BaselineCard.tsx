import type { BaselineResult, DegreeFilter } from '../types';

interface BaselineCardProps {
  mdResult: BaselineResult;
  doResult: BaselineResult;
  degreeFilter: DegreeFilter;
}

function RateDisplay({ label, result }: { label: string; result: BaselineResult }) {
  const { acceptanceRate } = result;
  if (acceptanceRate === null) {
    return (
      <div>
        <p className="text-xs text-navy-400 mb-1">{label}</p>
        <p className="text-navy-500 text-sm">Insufficient data</p>
      </div>
    );
  }
  const color = acceptanceRate >= 60 ? 'text-emerald-400' : acceptanceRate >= 40 ? 'text-blue-400' : acceptanceRate >= 20 ? 'text-amber-400' : 'text-red-400';
  return (
    <div>
      <p className="text-xs text-navy-400 mb-1">{label}</p>
      <span className={`text-4xl font-extrabold tabular-nums ${color}`}>{acceptanceRate}%</span>
    </div>
  );
}

export default function BaselineCard({ mdResult, doResult, degreeFilter }: BaselineCardProps) {
  const showMd = degreeFilter !== 'DO';
  const showDo = degreeFilter !== 'MD';
  return (
    <div className="bg-gradient-to-br from-navy-800/80 to-navy-900/80 border border-navy-700 rounded-xl p-6">
      <h3 className="text-sm font-medium text-navy-300 uppercase tracking-wider mb-1">National Baseline</h3>
      <p className="text-xs text-navy-400 mb-4">AAMC Table A-23 (MD) / AACOM Grid (DO)</p>
      <div className="flex gap-6 mb-4">
        {showMd && <RateDisplay label="MD Acceptance" result={mdResult} />}
        {showDo && <RateDisplay label="DO Matriculation" result={doResult} />}
      </div>
      <p className="text-xs text-navy-300 leading-relaxed">
        GPA range: <span className="text-white font-medium">{mdResult.gpaRange}</span>
        {' · '}MCAT range: <span className="text-white font-medium">{mdResult.mcatRange}</span>
      </p>
    </div>
  );
}
