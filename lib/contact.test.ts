import { describe, expect, it } from 'vitest';
import {
  CONTACT_CONSENT_VERSION,
  CONTACT_ERRORS,
  CONTACT_INTENT_IDS,
  isHoneypotTripped,
  isSpam,
  isTooFast,
  validateContactSubmission,
  type ContactIntent,
} from './contact';

const base = { name: 'Ada Lovelace', email: 'ada@example.com', privacyAcknowledged: true };

const valid: Record<ContactIntent, Record<string, unknown>> = {
  leadership: { organization: 'Acme', roleTitle: 'VP Strategy', workArrangement: 'Hybrid', employmentType: 'Permanent', jobPostingUrl: 'https://acme.com/job' },
  advisory: { organization: 'Acme', areaOfSupport: 'AI-Assisted Engineering', biggestChallenge: 'x', desiredOutcome: 'y', timeframe: '1–3 months', budgetRange: '$25K–$50K' },
  build: { projectType: 'Website', problem: 'p', users: 'Customers', keyWorkflows: 'w', currentStage: 'Idea', integrations: 'Not sure' },
  product: { product: 'Prepera', inquiryType: 'Demo', useCase: 'u', followDevelopment: true },
  speaking: { organization: 'Acme', topic: 'AI Strategy', format: 'Keynote', learningObjective: 'l', proposedDate: '2027-02-28' },
  general: { subject: 's', message: 'm' },
};

const payload = (intent: ContactIntent, extra: Record<string, unknown> = {}) => ({ intent, ...base, ...valid[intent], ...extra });
const errors = (input: unknown) => {
  const r = validateContactSubmission(input);
  if (r.ok) throw new Error('expected failure');
  return r.fieldErrors;
};

describe('validateContactSubmission', () => {
  const OPTIONAL_SELECTS: [ContactIntent, string, string[]][] = [
    ['advisory', 'budgetRange', ['Still defining', 'Under $10K', '$10K–$25K', '$25K–$50K', '$50K+']],
    ['build', 'launchTimeframe', ['Immediately', '1–3 months', '3–6 months', 'Exploring']],
    ['build', 'budget', ['Not decided', 'Under $10K', '$10K–$25K', '$25K–$50K', '$50K–$100K', '$100K+']],
  ];
  describe.each(OPTIONAL_SELECTS)('%s %s select', (intent, field, options) => {
    it.each(options)('accepts %s', (value) => {
      expect(validateContactSubmission(payload(intent, { [field]: value })).ok).toBe(true);
    });
    it('accepts empty or absent', () => {
      expect(validateContactSubmission(payload(intent, { [field]: '' })).ok).toBe(true);
      expect(validateContactSubmission(payload(intent)).ok).toBe(true);
    });
    it.each(['50k', 'Around $20K', '$10K-$25K'])('rejects %s', (value) => {
      expect(errors(payload(intent, { [field]: value }))[field]).toBeTruthy();
    });
  });

  it.each(CONTACT_INTENT_IDS)('accepts a valid %s payload', (intent) => {
    const r = validateContactSubmission(payload(intent));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.submission.intent).toBe(intent);
      expect(r.submission.privacyAcknowledged).toBe(true);
    }
  });

  it('exposes the consent version constant', () => {
    expect(CONTACT_CONSENT_VERSION).toBe('2026-10-25');
  });

  it('rejects unknown or missing intent', () => {
    expect(errors({ ...base, intent: 'nope' }).intent).toBeTruthy();
    expect(errors({ ...base }).intent).toBeTruthy();
    expect(errors('x').intent).toBeTruthy();
  });

  it('requires required fields with the spec microcopy', () => {
    const e = errors({ intent: 'general', privacyAcknowledged: true });
    expect(e.name).toBe('Please complete this field.');
    expect(e.email).toBe('Please complete this field.');
    expect(e.subject).toBe('Please complete this field.');
    expect(e.message).toBe('Please complete this field.');
    expect(errors(payload('general', { subject: '   ' })).subject).toBe('Please complete this field.');
  });

  it('rejects bad email', () => {
    for (const email of ['nope', 'a@b', 'a b@c.com', 'a@b.com, c@d.com', 'a@b.com\r\nBcc: x@y.com']) {
      expect(errors(payload('general', { email })).email).toBe('Enter a valid email address.');
    }
  });

  it('requires privacy acknowledgement to be boolean true', () => {
    for (const v of [false, 'true', 1, undefined]) {
      expect(errors(payload('general', { privacyAcknowledged: v })).privacyAcknowledged).toBe(
        'Please acknowledge the Privacy Policy before sending.',
      );
    }
  });

  it('rejects values outside enums', () => {
    expect(errors(payload('leadership', { workArrangement: 'remote' })).workArrangement).toBeTruthy();
    expect(errors(payload('advisory', { timeframe: '1-3 months' })).timeframe).toBeTruthy();
    expect(errors(payload('speaking', { format: 'Webinar' })).format).toBeTruthy();
  });

  it('accepts AI-Assisted Engineering for advisory area of support', () => {
    expect(validateContactSubmission(payload('advisory', { areaOfSupport: 'AI-Assisted Engineering' })).ok).toBe(true);
  });

  it('requires http(s) urls that parse', () => {
    for (const u of ['ftp://x.com', 'javascript:alert(1)', 'not a url']) {
      expect(errors(payload('leadership', { jobPostingUrl: u })).jobPostingUrl).toBeTruthy();
    }
    expect(errors(payload('build', { requirementsUrl: 'nope' })).requirementsUrl).toBeTruthy();
  });

  it('requires a real calendar date', () => {
    for (const d of ['2027-02-30', '2027-13-01', '02/03/2027', '2027-2-3']) {
      expect(errors(payload('speaking', { proposedDate: d })).proposedDate).toBeTruthy();
    }
    expect(validateContactSubmission(payload('speaking', { proposedDate: '2028-02-29' })).ok).toBe(true);
  });

  it('enforces length caps', () => {
    expect(errors(payload('general', { name: 'a'.repeat(201) })).name).toBeTruthy();
    expect(errors(payload('general', { message: 'a'.repeat(5001) })).message).toBeTruthy();
    expect(validateContactSubmission(payload('general', { message: 'a'.repeat(5000) })).ok).toBe(true);
    expect(errors(payload('general', { email: `${'a'.repeat(250)}@b.com` })).email).toBeTruthy();
    expect(errors(payload('leadership', { jobPostingUrl: `https://a.com/${'a'.repeat(2048)}` })).jobPostingUrl).toBeTruthy();
    expect(errors(payload('general', { sourcePage: 'a'.repeat(201) })).sourcePage).toBeTruthy();
    expect(errors(payload('general', { view: 'a'.repeat(51) })).view).toBeTruthy();
  });

  it('rejects CR/LF and control characters in single-line fields', () => {
    expect(errors(payload('general', { name: 'Ada\r\nBcc: x@y.com' })).name).toBeTruthy();
    expect(errors(payload('general', { subject: 'hi\nthere' })).subject).toBeTruthy();
    expect(errors(payload('general', { name: 'Ada\u0000' })).name).toBeTruthy();
    expect(errors(payload('general', { sourcePage: '/a\nb' })).sourcePage).toBeTruthy();
  });

  it('allows newlines in textareas', () => {
    const r = validateContactSubmission(payload('general', { message: 'line1\nline2' }));
    expect(r.ok && r.submission.fields.message).toBe('line1\nline2');
  });

  it('trims strings and omits empty optionals', () => {
    const r = validateContactSubmission(payload('leadership', { name: '  Ada  ', jobPostingUrl: '  ', roleDetails: '' }));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.submission.name).toBe('Ada');
      expect('jobPostingUrl' in r.submission.fields).toBe(false);
      expect('roleDetails' in r.submission.fields).toBe(false);
    }
  });

  it('drops unknown keys and fields of other intents', () => {
    const r = validateContactSubmission(payload('general', { evil: 'x', organization: 'Acme', website: '', elapsedMs: 5000 }));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(JSON.stringify(r.submission)).not.toMatch(/evil|Acme|elapsedMs|website/);
    }
  });

  it('carries boolean followDevelopment and rejects non-boolean', () => {
    const r = validateContactSubmission(payload('product', { followDevelopment: false }));
    expect(r.ok && r.submission.fields.followDevelopment).toBe(false);
    expect(errors(payload('product', { followDevelopment: 'yes' })).followDevelopment).toBeTruthy();
  });

  it('rejects non-string text values', () => {
    expect(errors(payload('general', { name: 5 })).name).toBe(CONTACT_ERRORS.invalid);
  });
});

describe('spam checks', () => {
  it('flags any non-empty honeypot', () => {
    expect(isHoneypotTripped({ website: 'http://spam' })).toBe(true);
    expect(isHoneypotTripped({ website: ' ' })).toBe(false);
    expect(isHoneypotTripped({})).toBe(false);
  });

  it('flags missing, invalid or fast timing', () => {
    expect(isTooFast({})).toBe(true);
    expect(isTooFast({ elapsedMs: '5000' })).toBe(true);
    expect(isTooFast({ elapsedMs: NaN })).toBe(true);
    expect(isTooFast({ elapsedMs: Infinity })).toBe(true);
    expect(isTooFast({ elapsedMs: -1 })).toBe(true);
    expect(isTooFast({ elapsedMs: 2999 })).toBe(true);
    expect(isTooFast({ elapsedMs: 3000 })).toBe(false);
  });

  it('isSpam combines both', () => {
    expect(isSpam({ elapsedMs: 5000 })).toBe(false);
    expect(isSpam({ elapsedMs: 5000, website: 'x' })).toBe(true);
    expect(isSpam({ website: '' })).toBe(true);
  });
});
