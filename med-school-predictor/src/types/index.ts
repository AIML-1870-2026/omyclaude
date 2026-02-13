export interface GridCell {
  acceptees: number;
  applicants: number;
  acceptanceRate: number;
}

export interface BaselineData {
  source: string;
  sourceUrl: string;
  copyright: string;
  lastUpdated: string;
  description: string;
  mcatRanges: string[];
  gpaRanges: string[];
  grid: Record<string, Record<string, GridCell | null>>;
  totals: Record<string, GridCell>;
}

export interface SchoolLocation {
  city: string;
  state: string;
  region: string;
  additionalCampuses?: string[];
}

export interface School {
  id: string;
  name: string;
  shortName: string;
  fullName: string;
  type: string;
  ownership: string;
  location: SchoolLocation;
  founded?: number;
  admissions: {
    applicationCycles?: string;
    totalApplicants: number | null;
    interviewed?: number | null;
    interviewRate?: number | null;
    classSize: number | null;
    acceptanceRate: number | null;
    acceptedToInterviewedRatio?: number | null;
  };
  academics: {
    medianMCAT: number | null;
    averageMCAT: number | null;
    mcatRange?: Record<string, number | null>;
    medianGPA: number | null;
    averageGPA: number | null;
    gpaRange?: Record<string, number | null>;
  };
  demographics: {
    percentMale?: number;
    percentFemale?: number;
    inStatePercent: number | null;
    outOfStatePercent: number | null;
    preferenceState: string | null;
    statePreferenceStrength: 'very_strong' | 'strong' | 'moderate' | 'none';
  };
  tuition: {
    inState: number | null;
    outOfState: number | null;
    year?: string;
  };
  mission: {
    focus: string[];
    description: string;
  };
  requirements?: Record<string, unknown>;
  urls?: Record<string, string>;
}

export interface SchoolsData {
  lastUpdated: string;
  dataSources: string[];
  notes: string;
  schools: School[];
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
  qualitativeFactors: QualitativeFactor[];
}

export type SchoolCategory = 'safety' | 'target' | 'reach' | 'far_reach';

export interface SchoolOdds {
  schoolId: string;
  schoolName: string;
  shortName: string;
  location: SchoolLocation;
  ownership: string;
  baselineOdds: number;
  statsAdjustment: number;
  inStateMultiplier: number;
  qualitativeBonus: number;
  finalOdds: number;
  category: SchoolCategory;
  schoolMedianMCAT: number | null;
  schoolMedianGPA: number | null;
  tuition: number | null;
  inStatePercent: number | null;
  classSize: number | null;
  isInState: boolean;
}

export interface BaselineResult {
  acceptanceRate: number | null;
  gpaRange: string;
  mcatRange: string;
}
