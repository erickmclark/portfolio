import type { CaseStudySection, Project } from './types';

const DEFAULT_TITLES: Record<CaseStudySection, string> = {
  role: 'Role',
  dates: 'Dates',
  intro: 'Overview',
  challenge: 'The challenge',
  responsibility: 'My responsibility',
  keyDecisions: 'Key decisions',
  delivered: 'What I delivered',
  howItWorks: 'How it works',
  riskAndControls: 'Risk and controls',
  outcome: 'Outcome and evidence',
  evidence: 'Evidence',
  learned: 'What I learned / would improve',
};

const EMPLOYMENT_TITLES: Partial<Record<CaseStudySection, string>> = {
  challenge: 'Business challenge',
  responsibility: 'Leadership responsibility',
  keyDecisions: 'Strategic decisions',
  delivered: 'Actions and execution',
  outcome: 'Organizational impact',
  evidence: 'Evidence',
};

/** Case-study section heading; Employment projects use the leadership-case-study titles. */
export function caseStudySectionTitle(project: Pick<Project, 'relationship'>, key: CaseStudySection): string {
  return (project.relationship === 'Employment' && EMPLOYMENT_TITLES[key]) || DEFAULT_TITLES[key];
}

/** Facts-strip label for the case-study dates: "Tenure" for Employment, otherwise "Date". */
export function caseStudyDateLabel(project: Pick<Project, 'relationship'>): string {
  return project.relationship === 'Employment' ? 'Tenure' : 'Date';
}
