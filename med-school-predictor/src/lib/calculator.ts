import baselineData from '../../data/baseline.json';
import schoolsData from '../../data/schools.json';
import type {
  BaselineData,
  SchoolsData,
  UserInputs,
  SchoolOdds,
  BaselineResult,
  QualitativeFactor,
  SchoolCategory,
} from '../types';

const baseline = baselineData as BaselineData;
const schools = (schoolsData as SchoolsData).schools;

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

export function getBaselineOdds(gpa: number, mcat: number): BaselineResult {
  const gpaRange = getGpaRange(gpa);
  const mcatRange = getMcatRange(mcat);

  const gpaRow = baseline.grid[gpaRange];
  if (!gpaRow) return { acceptanceRate: null, gpaRange, mcatRange };

  const cell = gpaRow[mcatRange];
  if (!cell) return { acceptanceRate: null, gpaRange, mcatRange };

  return {
    acceptanceRate: cell.acceptanceRate,
    gpaRange,
    mcatRange,
  };
}

export function getBaselineGrid(): {
  grid: BaselineData['grid'];
  gpaRanges: string[];
  mcatRanges: string[];
} {
  return {
    grid: baseline.grid,
    gpaRanges: baseline.gpaRanges,
    mcatRanges: baseline.mcatRanges,
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
  const baselineResult = getBaselineOdds(inputs.gpa, inputs.mcat);
  const baselineOdds = baselineResult.acceptanceRate;

  if (baselineOdds === null) return [];

  let qualitativeBonus = 0;
  for (const factor of inputs.qualitativeFactors) {
    qualitativeBonus += QUALITATIVE_BONUSES[factor];
  }
  qualitativeBonus = Math.min(qualitativeBonus, 15);

  return schools
    .filter((school) => {
      const mcat = school.academics.medianMCAT ?? school.academics.averageMCAT;
      const gpa = school.academics.medianGPA ?? school.academics.averageGPA;
      return mcat !== null || gpa !== null;
    })
    .map((school) => {
      const schoolMCAT = school.academics.medianMCAT ?? school.academics.averageMCAT;
      const schoolGPA = school.academics.medianGPA ?? school.academics.averageGPA;

      let statsAdjustment = 0;
      if (schoolMCAT !== null) {
        statsAdjustment += (inputs.mcat - schoolMCAT) * 2.5;
      }
      if (schoolGPA !== null) {
        statsAdjustment += (inputs.gpa - schoolGPA) * 50;
      }
      statsAdjustment = Math.max(-30, Math.min(30, statsAdjustment));

      const isInState =
        inputs.state !== '' && school.demographics.preferenceState === inputs.state;
      const strength = school.demographics.statePreferenceStrength;
      const multiplierConfig = IN_STATE_MULTIPLIERS[strength];
      let inStateMultiplier: number;
      if (isInState) {
        inStateMultiplier = multiplierConfig.inState;
      } else if (inputs.state !== '' && school.demographics.preferenceState !== null) {
        inStateMultiplier = multiplierConfig.oos;
      } else {
        inStateMultiplier = 1.0;
      }

      const adjustedBaseline = baselineOdds + statsAdjustment;
      const withResidency = adjustedBaseline * inStateMultiplier;
      const withQualitative = withResidency + qualitativeBonus;
      const finalOdds = Math.max(1, Math.min(95, withQualitative));

      const tuition = isInState ? school.tuition.inState : school.tuition.outOfState;

      return {
        schoolId: school.id,
        schoolName: school.name,
        shortName: school.shortName,
        location: school.location,
        ownership: school.ownership,
        baselineOdds,
        statsAdjustment: Math.round(statsAdjustment * 10) / 10,
        inStateMultiplier,
        qualitativeBonus,
        finalOdds: Math.round(finalOdds * 10) / 10,
        category: categorize(finalOdds),
        schoolMedianMCAT: schoolMCAT,
        schoolMedianGPA: schoolGPA,
        tuition,
        inStatePercent: school.demographics.inStatePercent,
        classSize: school.admissions.classSize,
        isInState,
      };
    })
    .sort((a, b) => b.finalOdds - a.finalOdds);
}
