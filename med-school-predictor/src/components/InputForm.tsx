import { useState } from 'react';
import type { UserInputs, QualitativeFactor } from '../types';

const US_STATES = [
  { code: '', label: 'Select state...' },
  { code: 'AL', label: 'Alabama' },
  { code: 'AK', label: 'Alaska' },
  { code: 'AZ', label: 'Arizona' },
  { code: 'AR', label: 'Arkansas' },
  { code: 'CA', label: 'California' },
  { code: 'CO', label: 'Colorado' },
  { code: 'CT', label: 'Connecticut' },
  { code: 'DE', label: 'Delaware' },
  { code: 'DC', label: 'District of Columbia' },
  { code: 'FL', label: 'Florida' },
  { code: 'GA', label: 'Georgia' },
  { code: 'HI', label: 'Hawaii' },
  { code: 'ID', label: 'Idaho' },
  { code: 'IL', label: 'Illinois' },
  { code: 'IN', label: 'Indiana' },
  { code: 'IA', label: 'Iowa' },
  { code: 'KS', label: 'Kansas' },
  { code: 'KY', label: 'Kentucky' },
  { code: 'LA', label: 'Louisiana' },
  { code: 'ME', label: 'Maine' },
  { code: 'MD', label: 'Maryland' },
  { code: 'MA', label: 'Massachusetts' },
  { code: 'MI', label: 'Michigan' },
  { code: 'MN', label: 'Minnesota' },
  { code: 'MS', label: 'Mississippi' },
  { code: 'MO', label: 'Missouri' },
  { code: 'MT', label: 'Montana' },
  { code: 'NE', label: 'Nebraska' },
  { code: 'NV', label: 'Nevada' },
  { code: 'NH', label: 'New Hampshire' },
  { code: 'NJ', label: 'New Jersey' },
  { code: 'NM', label: 'New Mexico' },
  { code: 'NY', label: 'New York' },
  { code: 'NC', label: 'North Carolina' },
  { code: 'ND', label: 'North Dakota' },
  { code: 'OH', label: 'Ohio' },
  { code: 'OK', label: 'Oklahoma' },
  { code: 'OR', label: 'Oregon' },
  { code: 'PA', label: 'Pennsylvania' },
  { code: 'RI', label: 'Rhode Island' },
  { code: 'SC', label: 'South Carolina' },
  { code: 'SD', label: 'South Dakota' },
  { code: 'TN', label: 'Tennessee' },
  { code: 'TX', label: 'Texas' },
  { code: 'UT', label: 'Utah' },
  { code: 'VT', label: 'Vermont' },
  { code: 'VA', label: 'Virginia' },
  { code: 'WA', label: 'Washington' },
  { code: 'WV', label: 'West Virginia' },
  { code: 'WI', label: 'Wisconsin' },
  { code: 'WY', label: 'Wyoming' },
];

const QUALITATIVE_OPTIONS: { key: QualitativeFactor; label: string; desc: string }[] = [
  { key: 'clinical', label: 'Clinical Experience', desc: 'CNA, scribe, EMT, hospital volunteer' },
  { key: 'research', label: 'Research Experience', desc: 'Lab work, publications, posters' },
  { key: 'leadership', label: 'Leadership / Extracurriculars', desc: 'Club officer, team captain' },
  { key: 'volunteering', label: 'Volunteering / Community Service', desc: 'Non-clinical service' },
  { key: 'institutional', label: 'Institutional Connection', desc: 'Undergrad at affiliated school' },
  { key: 'scholarship', label: 'Named Scholarship / Honors', desc: 'e.g., Scott Scholar' },
  { key: 'urm', label: 'Underrepresented in Medicine', desc: 'URM status' },
];

interface InputFormProps {
  onCalculate: (inputs: UserInputs) => void;
}

export default function InputForm({ onCalculate }: InputFormProps) {
  const [gpa, setGpa] = useState('3.70');
  const [mcat, setMcat] = useState('510');
  const [state, setState] = useState('');
  const [factors, setFactors] = useState<Set<QualitativeFactor>>(new Set());

  const gpaNum = parseFloat(gpa);
  const mcatNum = parseInt(mcat, 10);
  const gpaWarning = !isNaN(gpaNum) && (gpaNum < 0 || gpaNum > 4.0);
  const mcatWarning = !isNaN(mcatNum) && (mcatNum < 472 || mcatNum > 528);

  function toggleFactor(key: QualitativeFactor) {
    setFactors((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onCalculate({
      gpa: gpaNum,
      mcat: mcatNum,
      state,
      qualitativeFactors: Array.from(factors),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Academic Stats</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="gpa" className="block text-sm font-medium text-navy-200 mb-1">
              GPA
            </label>
            <input
              id="gpa"
              type="number"
              step="0.01"
              min="0"
              max="4.00"
              value={gpa}
              onChange={(e) => setGpa(e.target.value)}
              className="w-full bg-navy-800 border border-navy-600 rounded-lg px-3 py-2.5 text-white
                         focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                         placeholder-navy-400"
              placeholder="e.g., 3.70"
              required
            />
            {gpaWarning && (
              <p className="mt-1 text-xs text-amber-400">
                GPA outside typical 0.00–4.00 range
              </p>
            )}
          </div>

          <div>
            <label htmlFor="mcat" className="block text-sm font-medium text-navy-200 mb-1">
              MCAT Score
            </label>
            <input
              id="mcat"
              type="number"
              min="472"
              max="528"
              value={mcat}
              onChange={(e) => setMcat(e.target.value)}
              className="w-full bg-navy-800 border border-navy-600 rounded-lg px-3 py-2.5 text-white
                         focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                         placeholder-navy-400"
              placeholder="e.g., 510"
              required
            />
            {mcatWarning && (
              <p className="mt-1 text-xs text-amber-400">
                MCAT outside typical 472–528 range
              </p>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Residency</h2>
        <label htmlFor="state" className="block text-sm font-medium text-navy-200 mb-1">
          State of Legal Residence
        </label>
        <select
          id="state"
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="w-full bg-navy-800 border border-navy-600 rounded-lg px-3 py-2.5 text-white
                     focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          {US_STATES.map((s) => (
            <option key={s.code} value={s.code}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Qualitative Factors</h2>
        <div className="space-y-3">
          {QUALITATIVE_OPTIONS.map((opt) => (
            <label
              key={opt.key}
              className="flex items-start gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={factors.has(opt.key)}
                onChange={() => toggleFactor(opt.key)}
                className="mt-0.5 h-4 w-4 rounded border-navy-500 bg-navy-800 text-teal-500
                           focus:ring-teal-500 focus:ring-offset-0"
              />
              <div>
                <span className="text-sm text-white group-hover:text-teal-400 transition-colors">
                  {opt.label}
                </span>
                <span className="block text-xs text-navy-400">{opt.desc}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-4
                   rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400
                   focus:ring-offset-2 focus:ring-offset-navy-900"
      >
        Calculate My Chances
      </button>
    </form>
  );
}
