import { Hono } from 'hono';
import { verifyTurnstile } from '../lib/turnstile';
import type { AppEnv } from '../types';

// ---------------------------------------------------------------------------
// Public routes  (mounted at /api/v1/enquiries)
// ---------------------------------------------------------------------------

export const publicEnquiries = new Hono<AppEnv>();

publicEnquiries.post('/', async (c) => {
  const body = await c.req.json();

  // Verify Turnstile token
  const turnstileToken = body['cf-turnstile-response'];
  if (!turnstileToken) {
    return c.json({ error: 'Turnstile verification required' }, 400);
  }

  const remoteIp = c.req.header('CF-Connecting-IP') || undefined;
  const turnstileOk = await verifyTurnstile(
    turnstileToken,
    c.env.TURNSTILE_SECRET_KEY,
    remoteIp
  );

  if (!turnstileOk) {
    return c.json({ error: 'Turnstile verification failed' }, 403);
  }

  const errors: string[] = [];
  if (!body.name?.trim()) errors.push('name is required');
  if (!body.email?.trim()) errors.push('email is required');
  if (!body.service?.trim()) errors.push('service is required');
  if (!body.message?.trim()) errors.push('message is required');

  if (errors.length > 0) {
    return c.json({ error: 'Validation failed', details: errors }, 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email.trim())) {
    return c.json({ error: 'Invalid email format' }, 400);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await c.env.DB.prepare(
    `INSERT INTO enquiries (id, name, email, company, service, message, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      body.name.trim(),
      body.email.trim().toLowerCase(),
      body.company?.trim() || null,
      body.service.trim(),
      body.message.trim(),
      'new',
      now
    )
    .run();

  return c.json({ id, message: 'Enquiry submitted successfully' }, 201);
});
