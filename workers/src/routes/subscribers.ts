import { Hono } from 'hono';
import { verifyTurnstile } from '../lib/turnstile';
import type { AppEnv } from '../types';

// ---------------------------------------------------------------------------
// Public routes  (mounted at /api/v1/subscribers)
// ---------------------------------------------------------------------------

export const publicSubscribers = new Hono<AppEnv>();

publicSubscribers.post('/', async (c) => {
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

  if (!body.email?.trim()) {
    return c.json({ error: 'Email is required' }, 400);
  }

  const email = body.email.trim().toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return c.json({ error: 'Invalid email format' }, 400);
  }

  // Check for existing subscriber - return success either way to avoid
  // leaking whether an email address is already subscribed.
  const existing = await c.env.DB.prepare(
    'SELECT id FROM subscribers WHERE email = ?'
  )
    .bind(email)
    .first();

  if (existing) {
    return c.json({ message: 'Subscribed successfully' }, 200);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await c.env.DB.prepare(
    'INSERT INTO subscribers (id, email, source, created_at) VALUES (?, ?, ?, ?)'
  )
    .bind(id, email, body.source || 'website', now)
    .run();

  return c.json({ message: 'Subscribed successfully' }, 201);
});
