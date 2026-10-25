import { NextRequest, NextResponse } from 'next/server';
import { isSpam, validateContactSubmission } from '@/lib/contact';
import { checkRateLimit, sendContactEmail } from '@/lib/contact-delivery';

const SERVER_ERROR =
  "Your message couldn't be sent. Please try again or use the direct email link.";

export async function POST(request: NextRequest) {
  if (process.env.CONTACT_SUBMISSIONS_ENABLED !== 'true') {
    return NextResponse.json(
      {
        error:
          'The contact form is not accepting submissions yet. Please email erickmclark@hotmail.com directly.',
        code: 'submissions_disabled',
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: 'Request body must be a JSON object.' }, { status: 400 });
  }

  let limit;
  try {
    limit = await checkRateLimit(request.headers);
  } catch {
    return NextResponse.json({ error: SERVER_ERROR }, { status: 500 });
  }
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many messages. Please try again later.', code: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  if (isSpam(body)) return NextResponse.json({ ok: true });

  const result = validateContactSubmission(body);
  if (!result.ok) {
    return NextResponse.json(
      { error: 'Please check the highlighted fields.', fieldErrors: result.fieldErrors },
      { status: 400 },
    );
  }

  try {
    await sendContactEmail(result.submission);
  } catch {
    return NextResponse.json({ error: SERVER_ERROR }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
