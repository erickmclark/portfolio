import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/content', () => ({ getRedis: vi.fn() }));

import { getRedis } from '@/lib/content';
import { POST } from './route';

let counts: Map<string, number>;
let fetchMock: ReturnType<typeof vi.fn>;

function req(body: unknown, raw = false) {
  return new NextRequest('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'x-forwarded-for': '1.2.3.4' },
    body: raw ? (body as string) : JSON.stringify(body),
  });
}

const good = {
  intent: 'general',
  name: 'Ada',
  email: 'ada@example.com',
  privacyAcknowledged: true,
  subject: 'Hello',
  message: 'Hi there',
  elapsedMs: 8000,
  website: '',
};

beforeEach(() => {
  counts = new Map();
  vi.mocked(getRedis).mockReset();
  vi.mocked(getRedis).mockReturnValue({
    incr: async (k: string) => {
      const n = (counts.get(k) ?? 0) + 1;
      counts.set(k, n);
      return n;
    },
    expire: async () => 1,
    ttl: async () => 120,
  } as unknown as ReturnType<typeof getRedis>);
  fetchMock = vi.fn(async () => new Response('{}', { status: 200 }));
  vi.stubGlobal('fetch', fetchMock);
  vi.stubEnv('CONTACT_SUBMISSIONS_ENABLED', 'true');
  vi.stubEnv('RESEND_API_KEY', 're_test');
  vi.stubEnv('CONTACT_FROM_EMAIL', 'site@clarkstrategics.com');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('POST /api/contact', () => {
  it.each([undefined, 'false'])('returns 503 when disabled (%s) without fetch or Redis', async (v) => {
    if (v === undefined) vi.stubEnv('CONTACT_SUBMISSIONS_ENABLED', undefined as unknown as string);
    else vi.stubEnv('CONTACT_SUBMISSIONS_ENABLED', v);
    const res = await POST(req(good));
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.code).toBe('submissions_disabled');
    expect(json.error).toContain('erickmclark@hotmail.com');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(getRedis).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid JSON and non-objects', async () => {
    expect((await POST(req('{nope', true))).status).toBe(400);
    expect((await POST(req([1]))).status).toBe(400);
    expect((await POST(req('"str"', true))).status).toBe(400);
  });

  it('returns 400 with fieldErrors on validation failure', async () => {
    const res = await POST(req({ ...good, email: 'bad', privacyAcknowledged: false }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Please check the highlighted fields.');
    expect(json.fieldErrors.email).toBe('Enter a valid email address.');
    expect(json.fieldErrors.privacyAcknowledged).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('answers spam like success without sending', async () => {
    for (const body of [{ ...good, website: 'http://spam' }, { ...good, elapsedMs: 500 }, { ...good, elapsedMs: undefined }]) {
      const res = await POST(req(body));
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ ok: true });
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 429 with Retry-After when rate limited', async () => {
    for (let i = 0; i < 5; i++) expect((await POST(req(good))).status).toBe(200);
    const res = await POST(req(good));
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('120');
    expect((await res.json()).code).toBe('rate_limited');
    expect(fetchMock).toHaveBeenCalledTimes(5);
  });

  it('returns 500 when the limiter is unavailable (fails closed)', async () => {
    vi.mocked(getRedis).mockReturnValue(null);
    const res = await POST(req(good));
    expect(res.status).toBe(500);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 500 when delivery fails', async () => {
    fetchMock.mockResolvedValue(new Response('no', { status: 500 }));
    const res = await POST(req(good));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe(
      "Your message couldn't be sent. Please try again or use the direct email link.",
    );
  });

  it('sends once to the routed recipient on success', async () => {
    const res = await POST(req({ ...good, intent: 'speaking', organization: 'Acme', topic: 'AI Strategy', format: 'Keynote', learningObjective: 'x' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(body.to).toEqual(['erick@clarkstrategics.com']);
    expect(body.reply_to).toBe('ada@example.com');
  });
});
