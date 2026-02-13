import baselineMdData from '../../data/baseline.json';
import baselineDoData from '../../data/baseline_do.json';
import schoolsAllData from '../../data/schools_all.json';
import type {
  BaselineData,
  SchoolsAllData,
  UserInputs,
  SchoolOdds,
  BaselineResult,
  QualitativeFactor,
  SchoolCategory,
  DegreeType,
} from '../types';

const baselineMd = baselineMdData as BaselineData;
const baselineDo = baselineDoData as BaselineData;
const allSchools = (schoolsAllData as SchoolsAllData).schools;

function getGpaRange(gpa: number): string {
  if (gpa >= 3.80) return '> 3.79';
  if (gpa >= 3.60) return '3.60-3.79';
  if (gpa >= 3.40) return '3.40-3.59';
  if (gpa >= 3.20) return '3.20-3.39';
  if (gpa >= 3.00) return '3.00-3.19';
  if (gpa >= 2.80) return '2.80-2.99';
  if (gpa >= 2.60) return '2.60-2.79';
  if (gpa >= 2.40) return '2.40-2.59';
  if (gpa >= 2.20) return '2.20-2.39';
  if (gpa >= 2.00) return '2.00-2.19';
  return '< 2.00';
}

function getMcatRange(mcat: number): string {
  if (mcat >= 518) return '> 517';
  if (mcat >= 514) return '514-517';
  if (mcat >= 510) return '510-513';
  if (mcat >= 506) return '506-509';
  if (mcat >= 502) return '502-505';
  if (mcat >= 498) return '498-501';
  if (mcat >= 494) return '494-497';
  if (mcat >= 490) return '490-493';
  if (mcat >= 486) return '486-489';
  return '< 486';
}

function lookupRate(data: BaselineData, gpaRange: string, mcatRange: string): number | null {
  const gpaRow = data.grid[gpaRange];
  if (!gpaRow) return null;
  const cell = gpaRow[mcatRange];
  if (!cell) return null;
  return cell.acceptanceRate ?? cell.matriculationRate ?? null;
}

export function getBaselineOdds(
  gpa: number,
  mcat: number,
  degreeType: DegreeType,
): BaselineResult {
  const gpaRange = getGpaRange(gpa);
  const mcatRange = getMcatRange(mcat);
  const data = degreeType === 'MD' ? baselineMd : baselineDo;
  const acceptanceRate = lookupRate(data, gpaRange, mcatRange);
  return { acceptanceRate, gpaRange, mcatRange };
}

export function getBaselineGrid(degreeType: DegreeType): {
  grid: BaselineData['grid'];
  gpaRanges: string[];
  mcatRanges: string[];
} {
  const data = degreeType === 'MD' ? baselineMd : baselineDo;
  return {
    grid: data.grid,
    gpaRanges: data.gpaRanges,
    mcatRanges: data.mcatRanges,
  };
}

const QUALITATIVE_BONUSES: Record<QualitativeFactor, number> = {
  clinical: 5,
  research: 5,
  leadership: 3,
  volunteering: 3,
  institutional: 3,
  scholarship: 5,
  urm: 5,
};

const IN_STATE_MULTIPLIERS: Record<string, { inState: number; oos: number }> = {
  very_strong: { inState: 1.5, oos: 0.4 },
  strong: { inState: 1.3, oos: 0.6 },
  moderate: { inState: 1.15, oos: 0.85 },
  none: { inState: 1.0, oos: 1.0 },
};

function categorize(odds: number): SchoolCategory {
  if (odds >= 60) return 'safety';
  if (odds >= 40) return 'target';
  if (odds >= 20) return 'reach';
  return 'far_reach';
}

export function calculateSchoolOdds(inputs: UserInputs): SchoolOdds[] {
  const mdBaseline = getBaselineOdds(inputs.gpa, inputs.mcat, 'MD');
  const doBaseline = getBaselineOdds(inputs.gpa, inputs.mcat, 'DO');

  let qualitativeBonus = 0;
  for (const factor of inputs.qualitativeFactors) {
    qualitativeBonus += QUALITATIVE_BONUSES[factor];
  }
  qualitativeBonus = Math.min(qualitativeBonus, 15);

  const filteredSchools = allSchools.filter((s) => {
    if (inputs.degreeFilter === 'both') return true;
    return s.type === inputs.degreeFilter;
  });

  return filteredSchools
    .filter((school) => school.averageMCAT !== null || school.averageGPA !== null)
    .map((school) => {
      const baselineResult = school.type === 'MD' ? mdBaseline : doBaseline;
      const baselineOdds = baselineResult.acceptanceRate;

      if (baselineOdds === null) return null;

      let statsAdjustment = 0;
      if (school.averageMCAT !== null) {
        statsAdjustment += (inputs.mcat - school.averageMCAT) * 2.5;
      }
      if (school.averageGPA !== null) {
        statsAdjustment += (inputs.gpa - school.averageGPA) * 50;
      }
      statsAdjustment = Math.max(-30, Math.min(30, statsAdjustment));

      const isInState = inputs.state !== '' && school.preferenceState === inputs.state;
      const strength = school.statePreferenceStrength;
      const multiplierConfig = IN_STATE_MULTIPLIERS[strength];
      let inStateMultiplier: number;
      if (isInState) {
        inStateMultiplier = multiplierConfig.inState;
      } else if (inputs.state !== '' && school.preferenceState !== null) {
        inStateMultiplier = multiplierConfig.oos;
      } else {
        inStateMultiplier = 1.0;
      }

      const adjustedBaseline = baselineOdds + statsAdjustment;
      const withResidency = adjustedBaseline * inStateMultiplier;
      const withQualitative = withResidency + qualitativeBonus;
      const finalOdds = Math.max(1, Math.min(95, withQualitative));

      return {
        schoolId: school.id,
        schoolName: school.name,
        shortName: school.shortName,
        schoolState: school.state,
        schoolType: school.type,
        ownership: school.ownership,
        baselineOdds,
        statsAdjustment: Math.round(statsAdjustment * 10) / 10,
        inStateMultiplier,
        qualitativeBonus,
        finalOdds: Math.round(finalOdds * 10) / 10,
        category: categorize(finalOdds),
        schoolAvgMCAT: school.averageMCAT,
        schoolAvgGPA: school.averageGPA,
        inStatePercent: school.inStatePercent,
        classSize: school.classSize,
        isInState,
      };
    })
    .filter((r): r is SchoolOdds => r !== null)
    .sort((a, b) => b.finalOdds - a.finalOdds);
}
