export type AppStatus = 'Applied' | 'Phone Screen' | 'Interview' | 'Offer' | 'Rejected';

export interface Application {
  _id: string;
  company: string;
  role: string;
  jdLink?: string;
  notes?: string;
  dateApplied: string;
  status: AppStatus;
  salaryRange?: string;
  skills?: string[];
  niceToHaveSkills?: string[];
  seniority?: string;
  location?: string;
  resumeSuggestions?: string[];
}

export interface ParsedJD {
  company: string;
  role: string;
  skills: string[];
  niceToHaveSkills: string[];
  seniority: string;
  location: string;
  resumeSuggestions: string[];
}

export interface AuthResponse {
  token: string;
  email: string;
}
