export interface GridCell {
  acceptees?: number;
  applicants: number;
  acceptanceRate?: number;
  matriculated?: number;
  matriculationRate?: number;
}

export interface BaselineData {
  source: string;
  sourceUrl: string;
  copyright: string;
  description: string;
  mcatRanges: string[];
  gpaRanges: string[];
  grid: Record<string, Record<string, GridCell | null>>;
  totals?: Record<string, GridCell>;
}

export type DegreeType = 'MD' | 'DO';
export type DegreeFilter = 'both' | 'MD' | 'DO';

export interface SchoolSimple {
  id: string;
  name: string;
  shortName: string;
  state: string;
  type: DegreeType;
  ownership: string;
  averageGPA: number | null;
  averageMCAT: number | null;
  inStatePercent: number | null;
  preferenceState: string | null;
  statePreferenceStrength: 'very_strong' | 'strong' | 'moderate' | 'none';
  totalApplicants?: number;
  interviewed?: number;
  classSize?: number;
  acceptanceRate?: number;
}

export interface SchoolsAllData {
  lastUpdated: string;
  dataSources: string[];
  notes: string;
  schools: SchoolSimple[];
}

export type QualitativeFactor =
  | 'clinical'
  | 'research'
  | 'leadership'
  | 'volunteering'
  | 'institutional'
  | 'scholarship'
  | 'urm';

export interface UserInputs {
  gpa: number;
  mcat: number;
  state: string;
  degreeFilter: DegreeFilter;
  qualitativeFactors: QualitativeFactor[];
}

export type SchoolCategory = 'safety' | 'target' | 'reach' | 'far_reach';

export interface SchoolOdds {
  schoolId: string;
  schoolName: string;
  shortName: string;
  schoolState: string;
  schoolType: DegreeType;
  ownership: string;
  baselineOdds: number;
  statsAdjustment: number;
  inStateMultiplier: number;
  qualitativeBonus: number;
  finalOdds: number;
  category: SchoolCategory;
  schoolAvgMCAT: number | null;
  schoolAvgGPA: number | null;
  inStatePercent: number | null;
  classSize: number | undefined;
  isInState: boolean;
}

export interface BaselineResult {
  acceptanceRate: number | null;
  gpaRange: string;
  mcatRange: string;
}
