// Shared, isomorphic contact schema and pure validation. No Node APIs, env reads,
// secrets or recipient addresses: safe to import from a client component.

export const CONTACT_CONSENT_VERSION = '2026-10-25';

export const CONTACT_INTENT_IDS = [
  'leadership',
  'advisory',
  'build',
  'product',
  'speaking',
  'general',
] as const;
export type ContactIntent = (typeof CONTACT_INTENT_IDS)[number];

export const CONTACT_INTENTS: readonly { id: ContactIntent; label: string }[] = [
  { id: 'leadership', label: 'Employment Opportunity' },
  { id: 'advisory', label: 'Strategic Advisory' },
  { id: 'build', label: 'Build a Product / Website' },
  { id: 'product', label: 'Product or Partnership' },
  { id: 'speaking', label: 'Speaking or Training' },
  { id: 'general', label: 'General Inquiry' },
];

export type ContactFieldKind =
  | 'text'
  | 'email'
  | 'url'
  | 'textarea'
  | 'select'
  | 'date'
  | 'boolean';

export interface ContactField {
  name: string;
  label: string;
  kind: ContactFieldKind;
  required: boolean;
  options?: readonly string[];
}

const f = (
  name: string,
  label: string,
  kind: ContactFieldKind,
  required: boolean,
  options?: readonly string[],
): ContactField => (options ? { name, label, kind, required, options } : { name, label, kind, required });

export const COMMON_FIELDS: readonly ContactField[] = [
  f('name', 'Name', 'text', true),
  f('email', 'Email', 'email', true),
];

// The one required free-text field, shared by every intent so the first step stays short.
const MESSAGE = f('message', 'Message', 'textarea', true);

export const CONTACT_FIELDS: Record<ContactIntent, readonly ContactField[]> = {
  leadership: [
    MESSAGE,
    f('organization', 'Organization', 'text', false),
    f('roleTitle', 'Role title', 'text', false),
    f('jobPostingUrl', 'Job posting URL', 'url', false),
    f('workArrangement', 'Location/work arrangement', 'select', false, ['Remote', 'Hybrid', 'On-site', 'Other']),
    f('employmentType', 'Employment type', 'select', false, ['Permanent', 'Contract', 'Contract-to-hire']),
    f('roleDetails', 'Role details or questions', 'textarea', false),
  ],
  advisory: [
    MESSAGE,
    f('organization', 'Organization', 'text', false),
    f('areaOfSupport', 'Area of support', 'select', false, [
      'AI Strategy',
      'Technology Strategy',
      'Enterprise Transformation',
      'AI Governance',
      'AI-Assisted Engineering',
      'Technology Operations',
      'Portfolio or PMO',
      'Other',
    ]),
    f('biggestChallenge', 'Biggest challenge today', 'textarea', false),
    f('desiredOutcome', 'Desired outcome', 'textarea', false),
    f('timeframe', 'Target timeframe', 'select', false, ['Immediately', '1–3 months', '3–6 months', 'Exploring']),
    f('budgetRange', 'Budget range', 'select', false, ['Still defining', 'Under $10K', '$10K–$25K', '$25K–$50K', '$50K+']),
    f('preferredNextStep', 'Preferred next step', 'select', false, [
      'Discovery conversation',
      'Written response',
      'Not sure',
    ]),
  ],
  build: [
    MESSAGE,
    f('projectName', 'Organization or project name', 'text', false),
    f('projectType', 'Type of project', 'select', false, [
      'AI Application',
      'Business Web App',
      'Website',
      'Workflow Automation',
      'Internal Tool',
      'Improve Existing Product',
      'Other',
    ]),
    f('problem', 'Problem the product should solve', 'textarea', false),
    f('users', 'Who will use it', 'select', false, ['Customers', 'Employees', 'Partners', 'Internal Team', 'Other']),
    f('keyWorkflows', 'Three most important workflows/features', 'textarea', false),
    f('existingSystem', 'Existing application/system', 'select', false, ['Yes', 'No']),
    f('integrations', 'Integrations required', 'select', false, ['Yes', 'No', 'Not sure']),
    f('sensitiveData', 'Sensitive or regulated data', 'select', false, ['Yes', 'No', 'Not sure']),
    f('currentStage', 'Current stage', 'select', false, ['Idea', 'Requirements', 'Prototype', 'Existing Product']),
    f('launchTimeframe', 'Target launch timeframe', 'select', false, ['Immediately', '1–3 months', '3–6 months', 'Exploring']),
    f('budget', 'Estimated budget', 'select', false, ['Not decided', 'Under $10K', '$10K–$25K', '$25K–$50K', '$50K–$100K', '$100K+']),
    f('requirementsUrl', 'Supporting requirements/design link', 'url', false),
  ],
  product: [
    MESSAGE,
    f('product', 'Product', 'select', false, [
      'AuthMatch AI',
      'Prepera',
      'SanctionsWatch',
      'Regulatory Intelligence',
      'Gen4Me',
      'AI Engineering Factory',
      'AI Strategy & Governance Platform',
      'Other',
    ]),
    f('inquiryType', 'Inquiry', 'select', false, [
      'Demo',
      'Partnership',
      'Integration',
      'Research',
      'Investment',
      'Other',
    ]),
    f('organizationRole', 'Organization and role', 'text', false),
    f('useCase', 'Intended use case', 'textarea', false),
    f('nextStep', 'Desired next step', 'textarea', false),
    f('followDevelopment', 'Follow development of this product', 'boolean', false),
  ],
  speaking: [
    MESSAGE,
    f('organization', 'Organization', 'text', false),
    f('topic', 'Topic', 'select', false, [
      'AI Strategy',
      'AI Governance',
      'AI-Assisted Engineering',
      'Enterprise Transformation',
      'Technology Leadership',
      'Other',
    ]),
    f('format', 'Format', 'select', false, [
      'Keynote',
      'Workshop',
      'Executive Briefing',
      'Team Training',
      'Virtual Session',
    ]),
    f('proposedDate', 'Proposed date', 'date', false),
    f('audienceSize', 'Audience size', 'text', false),
    f('audienceBackground', 'Audience background', 'textarea', false),
    f('learningObjective', 'Learning objective', 'textarea', false),
    f('location', 'Location / virtual', 'text', false),
    f('otherDetails', 'Other details', 'textarea', false),
  ],
  general: [MESSAGE, f('subject', 'Subject', 'text', false)],
};

/** Fields shown inside the optional disclosure: everything except the shared message and the follow opt-in. */
export function optionalFieldNames(intent: ContactIntent): string[] {
  return CONTACT_FIELDS[intent].filter((x) => x.name !== MESSAGE.name && x.kind !== 'boolean').map((x) => x.name);
}

/** The disclosure starts open only when an optional field is prefilled. */
export function initialDetailsOpen(values: Record<string, string>, optionalNames: readonly string[]): boolean {
  return optionalNames.some((n) => !!values[n]);
}

/** A validation error on an optional field must reveal it. */
export function shouldOpenForErrors(errors: Record<string, string>, optionalNames: readonly string[]): boolean {
  return optionalNames.some((n) => !!errors[n]);
}

export const PRIVACY_FIELD_LABEL = 'Privacy Policy acknowledged';

export const CONTACT_ERRORS = {
  required: 'Please complete this field.',
  email: 'Enter a valid email address.',
  privacy: 'Please acknowledge the Privacy Policy before sending.',
  invalid: 'Enter a valid value.',
  url: 'Enter a valid web address starting with http:// or https://.',
  date: 'Enter a valid date.',
  tooLong: 'This entry is too long.',
  option: 'Choose one of the listed options.',
  singleLine: 'Use plain text on a single line.',
  intent: 'Select a valid inquiry type.',
} as const;

const MAX_TEXT = 200;
const MAX_EMAIL = 254;
const MAX_URL = 2048;
const MAX_TEXTAREA = 5000;
const MAX_SOURCE_PAGE = 200;
const MAX_VIEW = 50;
const MIN_ELAPSED_MS = 3000;

export interface ContactSubmission {
  intent: ContactIntent;
  name: string;
  email: string;
  privacyAcknowledged: true;
  sourcePage?: string;
  view?: string;
  fields: Record<string, string | boolean>;
}

export type ContactValidationResult =
  | { ok: true; submission: ContactSubmission }
  | { ok: false; fieldErrors: Record<string, string> };

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

const CONTROL_ANY = /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/;
// Textareas may contain tab, LF and CR only.
const CONTROL_MULTILINE = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/;
const EMAIL_RE = /^[^\s@<>(),;:\\"[\]]+@[^\s@<>(),;:\\"[\]]+\.[^\s@<>(),;:\\"[\]]{2,}$/;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function isRealDate(v: string): boolean {
  const m = DATE_RE.exec(v);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
}

function isHttpUrl(v: string): boolean {
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

type Parsed = { value: string | boolean | undefined } | { error: string };

function parseField(field: ContactField, raw: unknown): Parsed {
  if (field.kind === 'boolean') {
    if (raw === undefined || raw === null || raw === '') {
      return field.required ? { error: CONTACT_ERRORS.required } : { value: undefined };
    }
    return typeof raw === 'boolean' ? { value: raw } : { error: CONTACT_ERRORS.invalid };
  }
  if (raw === undefined || raw === null) {
    return field.required ? { error: CONTACT_ERRORS.required } : { value: undefined };
  }
  if (typeof raw !== 'string') return { error: CONTACT_ERRORS.invalid };
  const v = raw.trim();
  if (v === '') return field.required ? { error: CONTACT_ERRORS.required } : { value: undefined };

  switch (field.kind) {
    case 'textarea':
      if (v.length > MAX_TEXTAREA) return { error: CONTACT_ERRORS.tooLong };
      if (CONTROL_MULTILINE.test(v)) return { error: CONTACT_ERRORS.invalid };
      return { value: v };
    case 'email':
      if (v.length > MAX_EMAIL) return { error: CONTACT_ERRORS.email };
      if (CONTROL_ANY.test(v) || !EMAIL_RE.test(v)) return { error: CONTACT_ERRORS.email };
      return { value: v };
    case 'url':
      if (v.length > MAX_URL) return { error: CONTACT_ERRORS.tooLong };
      if (CONTROL_ANY.test(v)) return { error: CONTACT_ERRORS.singleLine };
      return isHttpUrl(v) ? { value: v } : { error: CONTACT_ERRORS.url };
    case 'select':
      if (CONTROL_ANY.test(v) || !field.options?.includes(v)) return { error: CONTACT_ERRORS.option };
      return { value: v };
    case 'date':
      return isRealDate(v) ? { value: v } : { error: CONTACT_ERRORS.date };
    default:
      if (v.length > MAX_TEXT) return { error: CONTACT_ERRORS.tooLong };
      if (CONTROL_ANY.test(v)) return { error: CONTACT_ERRORS.singleLine };
      return { value: v };
  }
}

function parseMeta(raw: unknown, max: number): Parsed {
  if (raw === undefined || raw === null) return { value: undefined };
  if (typeof raw !== 'string') return { error: CONTACT_ERRORS.invalid };
  const v = raw.trim();
  if (v === '') return { value: undefined };
  if (v.length > max) return { error: CONTACT_ERRORS.tooLong };
  if (CONTROL_ANY.test(v)) return { error: CONTACT_ERRORS.singleLine };
  return { value: v };
}

export function validateContactSubmission(input: unknown): ContactValidationResult {
  if (!isObject(input)) {
    return { ok: false, fieldErrors: { intent: CONTACT_ERRORS.intent } };
  }
  const intent = input.intent;
  if (typeof intent !== 'string' || !(CONTACT_INTENT_IDS as readonly string[]).includes(intent)) {
    return { ok: false, fieldErrors: { intent: CONTACT_ERRORS.intent } };
  }
  const id = intent as ContactIntent;
  const fieldErrors: Record<string, string> = {};
  const fields: Record<string, string | boolean> = {};
  const common: Record<string, string> = {};

  for (const field of COMMON_FIELDS) {
    const r = parseField(field, input[field.name]);
    if ('error' in r) fieldErrors[field.name] = r.error;
    else if (typeof r.value === 'string') common[field.name] = r.value;
  }
  for (const field of CONTACT_FIELDS[id]) {
    const r = parseField(field, input[field.name]);
    if ('error' in r) fieldErrors[field.name] = r.error;
    else if (r.value !== undefined) fields[field.name] = r.value;
  }

  if (input.privacyAcknowledged !== true) fieldErrors.privacyAcknowledged = CONTACT_ERRORS.privacy;

  const sourcePage = parseMeta(input.sourcePage, MAX_SOURCE_PAGE);
  if ('error' in sourcePage) fieldErrors.sourcePage = sourcePage.error;
  const view = parseMeta(input.view, MAX_VIEW);
  if ('error' in view) fieldErrors.view = view.error;

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  const submission: ContactSubmission = {
    intent: id,
    name: common.name,
    email: common.email,
    privacyAcknowledged: true,
    fields,
  };
  if ('value' in sourcePage && typeof sourcePage.value === 'string') submission.sourcePage = sourcePage.value;
  if ('value' in view && typeof view.value === 'string') submission.view = view.value;
  return { ok: true, submission };
}

export const CONTACT_HONEYPOT_FIELD = 'website';
export const CONTACT_MIN_ELAPSED_MS = MIN_ELAPSED_MS;

export function isHoneypotTripped(input: unknown): boolean {
  if (!isObject(input)) return false;
  const v = input[CONTACT_HONEYPOT_FIELD];
  if (v === undefined || v === null) return false;
  if (typeof v === 'string') return v.trim() !== '';
  return true;
}

export function isTooFast(input: unknown): boolean {
  if (!isObject(input)) return true;
  const v = input.elapsedMs;
  return typeof v !== 'number' || !Number.isFinite(v) || v < MIN_ELAPSED_MS;
}

export function isSpam(input: unknown): boolean {
  return isHoneypotTripped(input) || isTooFast(input);
}

// Form copy per intent (content spec section 10, verbatim) and URL preselection. Client-safe.
export const CONTACT_INTENT_COPY: Record<
  ContactIntent,
  { heading: string; supporting?: string; submit: string }
> = {
  leadership: {
    heading: "Let's discuss the role.",
    supporting:
      "I'm interested in Director, Senior Director, and Vice President opportunities across technology strategy, enterprise transformation, AI strategy, and technology business operations.",
    submit: 'Send Opportunity',
  },
  advisory: {
    heading: "Tell me about the challenge you're trying to solve.",
    supporting:
      "Whether you're evaluating AI, transforming operations, or improving technology execution, the first step is understanding the business problem.",
    submit: 'Request a Consultation',
  },
  build: {
    heading: "Let's understand what you want to build.",
    supporting:
      "Share the problem, intended users, and essential workflows. You don't need a technical specification to start.",
    submit: 'Discuss My Project',
  },
  product: {
    heading: 'Which product would you like to explore?',
    supporting: "Tell me what interested you and how you might use it. I'll follow up with the appropriate next step.",
    submit: 'Request Product Information',
  },
  speaking: {
    heading: "Let's discuss your event or learning program.",
    supporting:
      'I can discuss enterprise AI strategy, responsible AI adoption, technology transformation, and practical AI-assisted engineering from a leadership and builder perspective.',
    submit: 'Send Invitation',
  },
  general: { heading: 'Have something else in mind?', submit: 'Send Message' },
};

export const GOVERNANCE_PLATFORM_PRODUCT = 'AI Strategy & Governance Platform';
export const FACTORY_AREA_OF_SUPPORT = 'AI-Assisted Engineering';

export function contactHref(intent: ContactIntent, preselect?: { name: string; value: string }): string {
  const p = new URLSearchParams({ type: intent });
  if (preselect) p.set(preselect.name, preselect.value);
  return `/contact?${p.toString()}`;
}

type ParamValue = string | string[] | undefined;

/**
 * Resolve `?type=` plus the optional `area` (advisory) and `product` (product) preselects.
 * Unknown values fall back safely: an unknown type gives the first intent, an unknown option is ignored.
 */
export function resolveContactPrefill(params: Record<string, ParamValue>): {
  intent: ContactIntent;
  values: Record<string, string>;
} {
  const one = (v: ParamValue) => (Array.isArray(v) ? v[0] : v);
  const type = one(params.type);
  const intent = (CONTACT_INTENT_IDS as readonly string[]).includes(type ?? '')
    ? (type as ContactIntent)
    : CONTACT_INTENT_IDS[0];
  const values: Record<string, string> = {};
  const preselects: [ContactIntent, string, string][] = [
    ['advisory', 'area', 'areaOfSupport'],
    ['product', 'product', 'product'],
  ];
  for (const [forIntent, param, field] of preselects) {
    const v = one(params[param]);
    const options = CONTACT_FIELDS[forIntent].find((x) => x.name === field)?.options;
    if (intent === forIntent && v && options?.includes(v)) values[field] = v;
  }
  return { intent, values };
}

/**
 * Like `resolveContactPrefill`, but the intent is null unless `?type=` names a valid intent,
 * so a bare /contact opens nothing.
 */
export function resolveContactOpen(params: Record<string, ParamValue>): {
  intent: ContactIntent | null;
  values: Record<string, string>;
} {
  const t = Array.isArray(params.type) ? params.type[0] : params.type;
  if (!(CONTACT_INTENT_IDS as readonly string[]).includes(t ?? '')) return { intent: null, values: {} };
  return resolveContactPrefill(params);
}
