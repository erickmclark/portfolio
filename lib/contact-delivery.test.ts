import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/content', () => ({ getRedis: vi.fn() }));

import { getRedis } from '@/lib/content';
import { CONTACT_INTENT_IDS, type ContactSubmission } from './contact';
import {
  checkRateLimit,
  clientIdentifier,
  composeEmail,
  recipientForIntent,
  RateLimiterUnavailableError,
  sendContactEmail,
  ContactDeliveryError,
} from './contact-delivery';

function fakeRedis() {
  const store = new Map<string, number>();
  return {
    store,
    incr: vi.fn(async (k: string) => {
      const n = (store.get(k) ?? 0) + 1;
      store.set(k, n);
      return n;
    }),
    expire: vi.fn(async () => 1),
    ttl: vi.fn(async () => 300),
  };
}
const asRedis = (r: ReturnType<typeof fakeRedis>) => r as unknown as ReturnType<typeof getRedis>;
const headers = (h: Record<string, string> = {}) => new Headers(h);

const submission: ContactSubmission = {
  intent: 'advisory',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  privacyAcknowledged: true,
  sourcePage: '/projects/prepera',
  view: 'consultant',
  fields: { organization: 'Acme', areaOfSupport: 'AI Strategy', biggestChallenge: 'Line1\nLine2', desiredOutcome: 'Win' },
};

describe('recipientForIntent', () => {
  it('routes every intent per spec', () => {
    const expected = {
      leadership: 'erickmclark@hotmail.com',
      product: 'erickmclark@hotmail.com',
      general: 'erickmclark@hotmail.com',
      advisory: 'erick@clarkstrategics.com',
      build: 'erick@clarkstrategics.com',
      speaking: 'erick@clarkstrategics.com',
    };
    expect(CONTACT_INTENT_IDS.length).toBe(6);
    for (const id of CONTACT_INTENT_IDS) expect(recipientForIntent(id)).toBe(expected[id]);
  });
});

describe('checkRateLimit', () => {
  beforeEach(() => vi.mocked(getRedis).mockReset());

  it('allows up to the limit then blocks with retryAfter', async () => {
    const r = fakeRedis();
    vi.mocked(getRedis).mockReturnValue(asRedis(r));
    const h = headers({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' });
    for (let i = 0; i < 5; i++) expect(await checkRateLimit(h)).toEqual({ allowed: true });
    expect(await checkRateLimit(h)).toEqual({ allowed: false, retryAfter: 300 });
  });

  it('sets EXPIRE only on the first hit of a key', async () => {
    const r = fakeRedis();
    vi.mocked(getRedis).mockReturnValue(asRedis(r));
    await checkRateLimit(headers({ 'x-real-ip': '9.9.9.9' }));
    expect(r.expire).toHaveBeenCalledTimes(2); // ip + global
    await checkRateLimit(headers({ 'x-real-ip': '9.9.9.9' }));
    expect(r.expire).toHaveBeenCalledTimes(2);
  });

  it('restores the window when a blocked key has lost its TTL', async () => {
    const r = fakeRedis();
    r.ttl.mockResolvedValue(-1);
    vi.mocked(getRedis).mockReturnValue(asRedis(r));
    const h = headers({ 'x-real-ip': '8.8.8.8' });
    for (let i = 0; i < 5; i++) await checkRateLimit(h);
    r.expire.mockClear();
    expect(await checkRateLimit(h)).toEqual({ allowed: false, retryAfter: 600 });
    expect(r.expire).toHaveBeenCalledWith(expect.stringContaining('contact:rl:ip:'), 600);
  });

  it('never stores the raw IP in keys', async () => {
    const r = fakeRedis();
    vi.mocked(getRedis).mockReturnValue(asRedis(r));
    await checkRateLimit(headers({ 'x-forwarded-for': '203.0.113.7' }));
    for (const k of r.store.keys()) expect(k).not.toContain('203.0.113.7');
    expect(clientIdentifier(headers({ 'x-forwarded-for': '203.0.113.7' }))).toMatch(/^[0-9a-f]{64}$/);
  });

  it('enforces the global cap across clients', async () => {
    const r = fakeRedis();
    vi.mocked(getRedis).mockReturnValue(asRedis(r));
    for (let i = 0; i < 50; i++) expect(await checkRateLimit(headers({ 'x-forwarded-for': `10.0.0.${i}` }))).toEqual({ allowed: true });
    const res = await checkRateLimit(headers({ 'x-forwarded-for': '10.0.1.1' }));
    expect(res.allowed).toBe(false);
  });

  it('fails closed without Redis or on Redis error', async () => {
    vi.mocked(getRedis).mockReturnValue(null);
    await expect(checkRateLimit(headers())).rejects.toBeInstanceOf(RateLimiterUnavailableError);
    const r = fakeRedis();
    r.incr.mockRejectedValue(new Error('boom'));
    vi.mocked(getRedis).mockReturnValue(asRedis(r));
    await expect(checkRateLimit(headers())).rejects.toBeInstanceOf(RateLimiterUnavailableError);
  });
});

describe('composeEmail', () => {
  it('builds a plain-text subject and body with fields and metadata', () => {
    const { subject, text } = composeEmail(submission, new Date('2026-10-25T12:00:00.000Z'));
    expect(subject).toBe('Portfolio inquiry: Strategic Advisory from Ada Lovelace');
    expect(text).toContain('Name: Ada Lovelace');
    expect(text).toContain('Email: ada@example.com');
    expect(text).toContain('Organization: Acme');
    expect(text).toContain('Area of support: AI Strategy');
    expect(text).toContain('Biggest challenge today:\nLine1\nLine2');
    expect(text).toContain('Intent: advisory');
    expect(text).toContain('Source page: /projects/prepera');
    expect(text).toContain('View: consultant');
    expect(text).toContain('Received: 2026-10-25T12:00:00.000Z');
    expect(text).toContain('Consent version: 2026-10-25');
    expect(text).toContain('Privacy Policy acknowledged: Yes');
    expect(text).not.toMatch(/<[a-z]+>/i);
  });

  it('renders boolean opt-in', () => {
    const { text } = composeEmail({ ...submission, intent: 'product', fields: { product: 'Prepera', inquiryType: 'Demo', useCase: 'x', followDevelopment: true } });
    expect(text).toContain('Follow development of this product: Yes');
  });
});

describe('sendContactEmail', () => {
  beforeEach(() => {
    vi.stubEnv('RESEND_API_KEY', 're_test');
    vi.stubEnv('CONTACT_FROM_EMAIL', 'site@clarkstrategics.com');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('posts the expected request to Resend', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    await sendContactEmail(submission);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.resend.com/emails');
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({ Authorization: 'Bearer re_test', 'Content-Type': 'application/json' });
    expect(init.signal).toBeInstanceOf(AbortSignal);
    const body = JSON.parse(init.body as string);
    expect(body.from).toBe('site@clarkstrategics.com');
    expect(body.to).toEqual(['erick@clarkstrategics.com']);
    expect(body.reply_to).toBe('ada@example.com');
    expect(typeof body.text).toBe('string');
    expect(body.html).toBeUndefined();
  });

  it('throws on non-2xx', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('secret detail', { status: 422 })));
    await expect(sendContactEmail(submission)).rejects.toBeInstanceOf(ContactDeliveryError);
  });

  it('throws on network failure or timeout', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('timeout'); }));
    await expect(sendContactEmail(submission)).rejects.toBeInstanceOf(ContactDeliveryError);
  });

  it('throws when env is missing, without calling fetch', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('RESEND_API_KEY', '');
    await expect(sendContactEmail(submission)).rejects.toBeInstanceOf(ContactDeliveryError);
    vi.stubEnv('RESEND_API_KEY', 're_test');
    vi.stubEnv('CONTACT_FROM_EMAIL', '');
    await expect(sendContactEmail(submission)).rejects.toBeInstanceOf(ContactDeliveryError);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
