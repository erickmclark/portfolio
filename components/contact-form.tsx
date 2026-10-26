'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import {
  COMMON_FIELDS,
  CONTACT_FIELDS,
  CONTACT_HONEYPOT_FIELD,
  CONTACT_INTENTS,
  CONTACT_INTENT_COPY,
  CONTACT_MIN_ELAPSED_MS,
  GOVERNANCE_PLATFORM_PRODUCT,
  validateContactSubmission,
  type ContactField,
  type ContactIntent,
} from '@/lib/contact';

type Props = {
  initialIntent: ContactIntent;
  initialValues: Record<string, string>;
  email: string;
  linkedinUrl?: string;
  resumeUrl?: string;
};

type Status = 'idle' | 'sending' | 'success' | 'disabled' | 'error' | 'rate';

const DOT: Record<ContactIntent, string> = {
  leadership: 'bg-brand-blue',
  advisory: 'bg-brand-orange',
  build: 'bg-brand-yellow',
  product: 'bg-brand-green',
  speaking: 'bg-brand-pink',
  general: 'bg-brand-sky',
};

const SENSITIVE = "Please don't submit passwords, protected health information, government IDs, or confidential business documents through this form.";
const PRODUCT_WARNING = 'Do not include patient information, credentials, or confidential records.';
const PRIVACY_LABEL = 'I have read the Privacy Policy and agree that my details are used to respond to this inquiry.';
const CSS_NOTE = 'This request may be handled through Clark Strategic Systems LLC (Clark Strategics), my consulting and engineering firm.';
const FOLLOW_LABEL = `Optional: send me occasional development updates about the ${GOVERNANCE_PLATFORM_PRODUCT}. Separate from this inquiry; unsubscribe from any update.`;
const SERVER_ERROR = "Your message couldn't be sent. Please try again or use the direct email link.";

const now = () => Date.now();

// Rows follow the approved Figma intent frames: a pair shares a row on sm and up, a single field spans the full width.
const ROWS: Record<ContactIntent, string[][]> = {
  leadership: [['organization', 'roleTitle'], ['jobPostingUrl'], ['workArrangement', 'employmentType'], ['roleDetails']],
  advisory: [['organization', 'areaOfSupport'], ['biggestChallenge'], ['desiredOutcome'], ['timeframe', 'budgetRange'], ['preferredNextStep']],
  build: [
    ['projectName', 'projectType'],
    ['problem'],
    ['users', 'currentStage'],
    ['keyWorkflows'],
    ['existingSystem', 'integrations'],
    ['sensitiveData', 'launchTimeframe'],
    ['budget', 'requirementsUrl'],
  ],
  product: [['product', 'inquiryType'], ['organizationRole'], ['useCase'], ['nextStep']],
  speaking: [
    ['organization', 'topic'],
    ['format', 'proposedDate'],
    ['audienceSize', 'location'],
    ['audienceBackground'],
    ['learningObjective'],
    ['otherDetails'],
  ],
  general: [['subject'], ['message']],
};

const control =
  'block min-h-11 w-full border border-ink bg-paper px-3.5 py-2 text-base text-ink aria-[invalid=true]:border-2 aria-[invalid=true]:border-red-700';
const note = 'border border-ink bg-paper px-4 py-3 text-[15px] leading-[1.5]';
const errText = 'mt-1.5 text-sm text-red-700';

export default function ContactForm({ initialIntent, initialValues, email, linkedinUrl, resumeUrl }: Props) {
  const uid = useId();
  const [intent, setIntent] = useState<ContactIntent>(initialIntent);
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [privacy, setPrivacy] = useState(false);
  const [follow, setFollow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const started = useRef(0);
  const honeypot = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    started.current = now();
  }, []);

  // Boolean fields (the follow-development opt-in) render as their own checkbox below.
  const fields = [...COMMON_FIELDS, ...CONTACT_FIELDS[intent]].filter((f) => f.kind !== 'boolean');
  const byName = new Map(fields.map((f) => [f.name, f]));
  const laid = [['name', 'email'], ...ROWS[intent]].map((r) => r.map((n) => byName.get(n)).filter((f): f is ContactField => !!f));
  const placed = new Set(laid.flat().map((f) => f.name));
  // Any field without a layout row still renders, full width.
  const rows = [...laid, ...fields.filter((f) => !placed.has(f.name)).map((f) => [f])].filter((r) => r.length > 0);
  const copy = CONTACT_INTENT_COPY[intent];
  const showFollow = intent === 'product' && values.product === GOVERNANCE_PLATFORM_PRODUCT;
  const fid = (name: string) => `${uid}-${name}`;

  function set(name: string, v: string) {
    setValues((s) => ({ ...s, [name]: v }));
  }

  function switchIntent(next: ContactIntent) {
    setIntent(next);
    setErrors({});
    setStatus('idle');
  }

  function focusFirstError(errs: Record<string, string>) {
    const first = Object.keys(errs)[0];
    const id = first === 'privacyAcknowledged' ? fid('privacy') : fid(first);
    requestAnimationFrame(() => {
      (document.getElementById(id) ?? resultRef.current)?.focus();
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'sending') return;
    const body: Record<string, unknown> = { intent, privacyAcknowledged: privacy, sourcePage: '/contact' };
    for (const f of fields) {
      body[f.name] = values[f.name] ?? '';
    }
    if (showFollow) body.followDevelopment = follow;

    const local = validateContactSubmission(body);
    if (!local.ok) {
      setErrors(local.fieldErrors);
      setStatus('idle');
      setMessage('Please check the highlighted fields.');
      focusFirstError(local.fieldErrors);
      return;
    }
    setErrors({});
    setMessage('');
    setStatus('sending');

    // The server treats a faster submit as spam and replies ok without sending, which would look
    // like success. Wait out the minimum instead of dropping a real message.
    const wait = CONTACT_MIN_ELAPSED_MS + 250 - (now() - started.current);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...body,
          [CONTACT_HONEYPOT_FIELD]: honeypot.current?.value ?? '',
          elapsedMs: now() - started.current,
        }),
      });
      const data: { ok?: boolean; error?: string; code?: string; fieldErrors?: Record<string, string> } = await res
        .json()
        .catch(() => ({}));
      if (res.ok && data.ok === true) {
        setStatus('success');
      } else if (res.status === 503 && data.code === 'submissions_disabled') {
        setMessage(data.error ?? '');
        setStatus('disabled');
      } else if (res.status === 400 && data.fieldErrors) {
        setErrors(data.fieldErrors);
        setMessage(data.error ?? 'Please check the highlighted fields.');
        setStatus('idle');
        focusFirstError(data.fieldErrors);
        return;
      } else if (res.status === 429) {
        setMessage(data.error ?? '');
        setStatus('rate');
      } else {
        setMessage(SERVER_ERROR);
        setStatus('error');
      }
    } catch {
      setMessage(SERVER_ERROR);
      setStatus('error');
    }
    requestAnimationFrame(() => resultRef.current?.focus());
  }

  function renderField(f: ContactField) {
    const id = fid(f.name);
    const err = errors[f.name];
    const common = {
      id,
      name: f.name,
      'aria-invalid': err ? true : undefined,
      'aria-describedby': err ? `${id}-err` : undefined,
      'aria-required': f.required || undefined,
      value: values[f.name] ?? '',
    } as const;
    let input: React.ReactNode;
    if (f.kind === 'textarea') {
      input = <textarea {...common} rows={5} onChange={(e) => set(f.name, e.target.value)} className={`${control} min-h-32`} />;
    } else if (f.kind === 'select') {
      input = (
        <select {...common} onChange={(e) => set(f.name, e.target.value)} className={control}>
          <option value="">Select…</option>
          {f.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    } else {
      const type = f.kind === 'email' ? 'email' : f.kind === 'url' ? 'url' : f.kind === 'date' ? 'date' : 'text';
      input = (
        <input
          {...common}
          type={type}
          autoComplete={f.name === 'name' ? 'name' : f.name === 'email' ? 'email' : 'off'}
          onChange={(e) => set(f.name, e.target.value)}
          className={control}
        />
      );
    }
    return (
      <div key={f.name}>
        <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
          {f.label}
          {!f.required && <span className="font-medium text-ink-muted"> (optional)</span>}
        </label>
        {input}
        {err && (
          <p id={`${id}-err`} className={errText}>
            {err}
          </p>
        )}
        {intent === 'product' && f.name === 'useCase' && (
          <p className="mt-3 border border-ink border-l-4 bg-white px-4 py-3 text-[15px]">{PRODUCT_WARNING}</p>
        )}
      </div>
    );
  }

  const emailLink = (
    <>
      Or email{' '}
      <a href={`mailto:${email}`} className="font-semibold underline underline-offset-4">
        {email}
      </a>
    </>
  );

  return (
    <div className="mt-12">
      <fieldset>
        <legend className="font-mono text-[11px] font-medium uppercase tracking-[0.2em]">What brings you here?</legend>
        <div className="mt-4 flex flex-wrap gap-3">
          {CONTACT_INTENTS.map((i) => {
            const on = i.id === intent;
            return (
              <button
                key={i.id}
                type="button"
                aria-pressed={on}
                onClick={() => switchIntent(i.id)}
                className={`inline-flex min-h-11 items-center gap-2.5 border border-ink px-4 text-[15px] font-semibold ${on ? 'on-dark bg-ink text-white' : 'bg-white hover:bg-paper'}`}
              >
                <span aria-hidden className={`size-2.5 ${DOT[i.id]}`} />
                {i.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-8 border-t border-ink pt-8">
        {status === 'success' ? (
          <div ref={resultRef} tabIndex={-1} role="status" className="border border-ink bg-paper p-6 outline-none">
            <h2 className="font-display text-2xl font-bold tracking-[-0.02em]">Message received.</h2>
            <p className="mt-2 text-base">
              Thank you for reaching out. Your message has been received. I&apos;ll review the details and follow up using the email you provided.
            </p>
          </div>
        ) : (
          <>
            <h2 className="font-display text-[28px] font-bold leading-[1.1] tracking-[-0.02em] sm:text-[32px]">{copy.heading}</h2>
            {copy.supporting && <p className="mt-3 max-w-[760px] text-base text-ink-muted">{copy.supporting}</p>}

            <form ref={formRef} onSubmit={onSubmit} noValidate className="mt-6">
              <div className="grid gap-y-5">
                {rows.map((row) => (
                  <div key={row[0].name} className={`grid gap-x-6 gap-y-5 ${row.length > 1 ? 'sm:grid-cols-2' : ''}`}>
                    {row.map(renderField)}
                  </div>
                ))}
              </div>

              <div aria-hidden className="sr-only">
                <label>
                  Website
                  <input ref={honeypot} type="text" name={CONTACT_HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
                </label>
              </div>

              <p className={`${note} mt-6`}>{SENSITIVE}</p>

              <div className="mt-5 flex items-start gap-3">
                <input
                  id={fid('privacy')}
                  type="checkbox"
                  checked={privacy}
                  onChange={(e) => setPrivacy(e.target.checked)}
                  aria-required
                  aria-invalid={errors.privacyAcknowledged ? true : undefined}
                  aria-describedby={errors.privacyAcknowledged ? `${fid('privacy')}-err` : undefined}
                  className="mt-0.5 size-6 shrink-0 accent-ink"
                />
                <label htmlFor={fid('privacy')} className="min-h-6 text-[15px] leading-[1.5]">
                  {PRIVACY_LABEL}
                </label>
              </div>
              {errors.privacyAcknowledged && (
                <p id={`${fid('privacy')}-err`} className={errText}>
                  {errors.privacyAcknowledged}
                </p>
              )}

              {showFollow && (
                <div className="mt-4 flex items-start gap-3">
                  <input
                    id={fid('follow')}
                    type="checkbox"
                    checked={follow}
                    onChange={(e) => setFollow(e.target.checked)}
                    className="mt-0.5 size-6 shrink-0 accent-ink"
                  />
                  <label htmlFor={fid('follow')} className="min-h-6 text-[15px] leading-[1.5]">
                    {FOLLOW_LABEL}
                  </label>
                </div>
              )}

              <div aria-live="polite" className="sr-only">
                {status === 'sending' ? 'Sending' : ''}
                {status === 'idle' && Object.keys(errors).length > 0 ? message : ''}
              </div>

              {(status === 'error' || status === 'disabled' || status === 'rate') && (
                <div
                  ref={resultRef}
                  tabIndex={-1}
                  role="alert"
                  className="mt-5 border border-red-700 bg-paper p-5 outline-none"
                >
                  {status === 'error' && (
                    <p className="font-display text-xl font-bold tracking-[-0.02em] text-red-700">
                      Your message couldn&apos;t be sent.
                    </p>
                  )}
                  <p className="mt-1 text-[15px]">
                    {status === 'error' ? 'Please try again or use the direct email link.' : message}
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="on-dark inline-flex min-h-11 items-center bg-ink px-5 text-[15px] font-semibold text-white disabled:opacity-60"
                >
                  {status === 'sending' ? 'Sending…' : copy.submit}
                </button>
                {intent === 'leadership' && resumeUrl && (
                  <a
                    className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold"
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download Résumé <ArrowDown size={14} aria-hidden />
                  </a>
                )}
                {intent === 'leadership' && linkedinUrl && (
                  <a
                    className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold"
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn <ArrowUpRight size={14} aria-hidden />
                  </a>
                )}
                {(status === 'error' || status === 'disabled' || status === 'rate') && (
                  <span className="text-[15px]">{emailLink}</span>
                )}
              </div>

              {(intent === 'advisory' || intent === 'build' || intent === 'speaking') && <p className={`${note} mt-6`}>{CSS_NOTE}</p>}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
