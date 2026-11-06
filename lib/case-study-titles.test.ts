import { describe, expect, it } from 'vitest';
import { caseStudyDateLabel, caseStudySectionTitle } from './case-study-titles';

describe('caseStudySectionTitle', () => {
  it('uses leadership titles for Employment projects', () => {
    const e = { relationship: 'Employment' as const };
    expect(caseStudySectionTitle(e, 'challenge')).toBe('Business challenge');
    expect(caseStudySectionTitle(e, 'responsibility')).toBe('Leadership responsibility');
    expect(caseStudySectionTitle(e, 'keyDecisions')).toBe('Strategic decisions');
    expect(caseStudySectionTitle(e, 'delivered')).toBe('Actions and execution');
    expect(caseStudySectionTitle(e, 'outcome')).toBe('Organizational impact');
    expect(caseStudySectionTitle(e, 'evidence')).toBe('Evidence');
  });

  it('keeps today\'s titles for other projects and titles evidence', () => {
    const n = { relationship: 'Independent Product' as const };
    expect(caseStudySectionTitle(n, 'challenge')).toBe('The challenge');
    expect(caseStudySectionTitle(n, 'responsibility')).toBe('My responsibility');
    expect(caseStudySectionTitle(n, 'keyDecisions')).toBe('Key decisions');
    expect(caseStudySectionTitle(n, 'delivered')).toBe('What I delivered');
    expect(caseStudySectionTitle(n, 'outcome')).toBe('Outcome and evidence');
    expect(caseStudySectionTitle(n, 'evidence')).toBe('Evidence');
    expect(caseStudySectionTitle({}, 'learned')).toBe('What I learned / would improve');
  });
});

describe('caseStudyDateLabel', () => {
  it('reads Tenure for Employment only', () => {
    expect(caseStudyDateLabel({ relationship: 'Employment' })).toBe('Tenure');
    expect(caseStudyDateLabel({ relationship: 'Client Work' })).toBe('Date');
    expect(caseStudyDateLabel({})).toBe('Date');
  });
});
