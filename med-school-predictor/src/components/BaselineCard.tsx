import type { BaselineResult } from '../types';

interface BaselineCardProps {
  result: BaselineResult;
}

export default function BaselineCard({ result }: BaselineCardProps) {
  const { acceptanceRate, gpaRange, mcatRange } = result;

  if (acceptanceRate === null) {
    return (
      <div className="bg-navy-800/50 border border-navy-700 rounded-xl p-6">
        <h3 className="text-sm font-medium text-navy-300 uppercase tracking-wider mb-2">
          National Baseline
        </h3>
        <p className="text-navy-300 text-sm">
          Insufficient data for this GPA/MCAT combination. The AAMC reports fewer than 10
          applicants in this cell.
        </p>
        <div className="mt-3 flex gap-3 text-xs text-navy-400">
          <span>GPA: {gpaRange}</span>
          <span>MCAT: {mcatRange}</span>
        </div>
      </div>
    );
  }

  const color =
    acceptanceRate >= 60
      ? 'text-emerald-400'
      : acceptanceRate >= 40
        ? 'text-blue-400'
        : acceptanceRate >= 20
          ? 'text-amber-400'
          : 'text-red-400';

  return (
    <div className="bg-gradient-to-br from-navy-800/80 to-navy-900/80 border border-navy-700 rounded-xl p-6">
      <h3 className="text-sm font-medium text-navy-300 uppercase tracking-wider mb-1">
        National Baseline
      </h3>
      <p className="text-xs text-navy-400 mb-4">AAMC Table A-23 (2021–2024)</p>

      <div className="flex items-baseline gap-2 mb-3">
        <span className={`text-5xl font-extrabold tabular-nums ${color}`}>
          {acceptanceRate}%
        </span>
        <span className="text-navy-400 text-sm">acceptance rate</span>
      </div>

      <p className="text-sm text-navy-200 leading-relaxed">
        Applicants with a <span className="text-white font-medium">GPA {gpaRange}</span> and{' '}
        <span className="text-white font-medium">MCAT {mcatRange}</span> were accepted{' '}
        <span className="text-white font-medium">{acceptanceRate}%</span> of the time nationally.
      </p>
    </div>
  );
}
