// Server-only contact delivery: routing, rate limiting, email composition, Resend.
// Imported only by route handlers; never import from a client component.
import { createHash } from 'node:crypto';
import { getRedis } from '@/lib/content';
import {
  CONTACT_CONSENT_VERSION,
  CONTACT_FIELDS,
  CONTACT_INTENTS,
  PRIVACY_FIELD_LABEL,
  type ContactIntent,
  type ContactSubmission,
} from '@/lib/contact';

const PERSONAL = 'erickmclark@hotmail.com';
const BUSINESS = 'erick@clarkstrategics.com';

const ROUTES: Record<ContactIntent, string> = {
  leadership: PERSONAL,
  product: PERSONAL,
  general: PERSONAL,
  advisory: BUSINESS,
  build: BUSINESS,
  speaking: BUSINESS,
};

export function recipientForIntent(intent: ContactIntent): string {
  return ROUTES[intent];
}

export class ContactDeliveryError extends Error {}
export class RateLimiterUnavailableError extends Error {}

export const RATE_LIMIT_PER_IP = { limit: 5, windowSeconds: 600 };
export const RATE_LIMIT_GLOBAL = { limit: 50, windowSeconds: 86_400 };

export function clientIdentifier(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = forwarded || headers.get('x-real-ip')?.trim() || 'unknown';
  return createHash('sha256').update(ip).digest('hex');
}

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfter: number };

async function hit(
  redis: NonNullable<ReturnType<typeof getRedis>>,
  key: string,
  { limit, windowSeconds }: { limit: number; windowSeconds: number },
): Promise<RateLimitResult> {
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, windowSeconds);
  if (count <= limit) return { allowed: true };
  const ttl = await redis.ttl(key);
  // A key left without a TTL (EXPIRE lost after INCR) would block forever; restore the window.
  if (ttl < 0) await redis.expire(key, windowSeconds);
  return { allowed: false, retryAfter: ttl > 0 ? ttl : windowSeconds };
}

async function limited(key: (headers: Headers) => string, config: { limit: number; windowSeconds: number }, headers: Headers) {
  try {
    const redis = getRedis();
    if (!redis) throw new RateLimiterUnavailableError('redis not configured');
    return await hit(redis, key(headers), config);
  } catch (e) {
    if (e instanceof RateLimiterUnavailableError) throw e;
    throw new RateLimiterUnavailableError('rate limiter failed');
  }
}

/** Per-client limit, applied to every request. Fails closed: throws RateLimiterUnavailableError when Redis is missing or errors. */
export function checkClientRateLimit(headers: Headers): Promise<RateLimitResult> {
  return limited((h) => `contact:rl:ip:${clientIdentifier(h)}`, RATE_LIMIT_PER_IP, headers);
}

/** Global daily cap, counted only for valid non-spam sends. Fails closed like checkClientRateLimit. */
export function checkGlobalRateLimit(): Promise<RateLimitResult> {
  return limited(() => 'contact:rl:global', RATE_LIMIT_GLOBAL, new Headers());
}

export function composeEmail(
  submission: ContactSubmission,
  now: Date = new Date(),
): { subject: string; text: string } {
  const label = CONTACT_INTENTS.find((i) => i.id === submission.intent)?.label ?? submission.intent;
  const subject = `Portfolio inquiry: ${label} from ${submission.name}`;
  const lines: string[] = [`Name: ${submission.name}`, `Email: ${submission.email}`];
  for (const field of CONTACT_FIELDS[submission.intent]) {
    const v = submission.fields[field.name];
    if (v === undefined) continue;
    const shown = typeof v === 'boolean' ? (v ? 'Yes' : 'No') : v;
    lines.push(field.kind === 'textarea' ? `${field.label}:\n${shown}` : `${field.label}: ${shown}`);
  }
  lines.push(
    '',
    '---',
    `Intent: ${submission.intent}`,
    `Source page: ${submission.sourcePage ?? 'Not provided'}`,
    `View: ${submission.view ?? 'Not provided'}`,
    `Received: ${now.toISOString()}`,
    `Consent version: ${CONTACT_CONSENT_VERSION}`,
    `${PRIVACY_FIELD_LABEL}: ${submission.privacyAcknowledged ? 'Yes' : 'No'}`,
  );
  return { subject, text: lines.join('\n') };
}

export async function sendContactEmail(submission: ContactSubmission): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !from) throw new ContactDeliveryError('email delivery is not configured');

  const { subject, text } = composeEmail(submission);
  let res: Response;
  try {
    res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [recipientForIntent(submission.intent)],
        reply_to: submission.email,
        subject,
        text,
      }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new ContactDeliveryError('email provider request failed');
  }
  if (!res.ok) throw new ContactDeliveryError(`email provider returned ${res.status}`);
}
