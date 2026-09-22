export type CandidateProfile = {
  fullName: string | null;
  headline: string | null;
  seniority: string | null;
  yearsExperience: number | null;
  location: string | null;
  languages: string[];
  primarySkills: string[];
  secondarySkills: string[];
  domains: string[];
  summary: string | null;
};

export type JobCard = {
  id: string;
  title: string;
  company: string | null;
  companyUrl: string | null;
  location: string | null;
  date: string | null;
  url: string;
  source: string;
};

export type JobMatch = {
  title: string;
  company: string | null;
  location: string | null;
  url: string;
  source: string;
  score: number;
  verdict: string;
  notes: string;
};

export type MatchResponse = {
  candidateSummary: string;
  jobs: JobMatch[];
  sourcesUsed: string[];
  sourcesFailed: string[];
};
