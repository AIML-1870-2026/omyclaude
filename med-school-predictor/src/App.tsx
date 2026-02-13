import { useState } from 'react';
import type { UserInputs, SchoolOdds, BaselineResult } from './types';
import { getBaselineOdds, calculateSchoolOdds } from './lib/calculator';
import InputForm from './components/InputForm';
import BaselineCard from './components/BaselineCard';
import SummaryBar from './components/SummaryBar';
import SchoolResults from './components/SchoolResults';
import GridHeatmap from './components/GridHeatmap';
import Disclaimer from './components/Disclaimer';

export default function App() {
  const [inputs, setInputs] = useState<UserInputs | null>(null);
  const [baseline, setBaseline] = useState<BaselineResult | null>(null);
  const [schoolResults, setSchoolResults] = useState<SchoolOdds[]>([]);

  function handleCalculate(userInputs: UserInputs) {
    setInputs(userInputs);
    setBaseline(getBaselineOdds(userInputs.gpa, userInputs.mcat));
    setSchoolResults(calculateSchoolOdds(userInputs));
  }

  const hasResults = baseline !== null;

  return (
    <div className="min-h-screen bg-navy-950 text-white">
      {/* Header */}
      <header className="border-b border-navy-800 bg-navy-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Med School Chance Predictor
          </h1>
          <p className="text-xs text-navy-400 mt-0.5">
            Powered by AAMC Table A-23 Data (2021–2024)
          </p>
        </div>
      </header>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Input Form */}
          <aside className="lg:w-80 xl:w-96 shrink-0">
            <div className="lg:sticky lg:top-20 bg-navy-900/60 border border-navy-800 rounded-xl p-5">
              <InputForm onCalculate={handleCalculate} />
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {!hasResults ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="text-6xl mb-4 opacity-20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-navy-400 mb-2">
                    Enter your stats
                  </h2>
                  <p className="text-sm text-navy-500 max-w-sm">
                    Fill in your GPA, MCAT score, and state of residency to see your estimated
                    chances at 15 medical schools.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Baseline + Summary row */}
                <div className="grid gap-4 md:grid-cols-2">
                  <BaselineCard result={baseline} />
                  <div className="bg-navy-800/50 border border-navy-700 rounded-xl p-6 flex flex-col justify-center">
                    <h3 className="text-sm font-medium text-navy-300 uppercase tracking-wider mb-3">
                      School Breakdown
                    </h3>
                    <SummaryBar results={schoolResults} />
                    <p className="text-xs text-navy-500 mt-3">
                      {schoolResults.length} schools analyzed
                    </p>
                  </div>
                </div>

                {/* Heatmap */}
                <GridHeatmap
                  userGpa={inputs?.gpa ?? null}
                  userMcat={inputs?.mcat ?? null}
                />

                {/* School Results */}
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4">
                    School-by-School Results
                  </h2>
                  <SchoolResults
                    results={schoolResults}
                    userGpa={inputs?.gpa ?? 0}
                    userMcat={inputs?.mcat ?? 0}
                  />
                </div>

                <Disclaimer />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
