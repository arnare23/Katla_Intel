import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import type { AppEnv } from '../types';

// ---------------------------------------------------------------------------
// Public routes  (mounted at /api/v1/subscribers)
// ---------------------------------------------------------------------------

export const publicSubscribers = new Hono<AppEnv>();

publicSubscribers.post('/', async (c) => {
  const body = await c.req.json();

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

// ---------------------------------------------------------------------------
// Admin routes  (mounted at /api/v1/admin/subscribers)
// ---------------------------------------------------------------------------

export const adminSubscribers = new Hono<AppEnv>();

adminSubscribers.use('*', requireAuth);

adminSubscribers.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM subscribers ORDER BY created_at DESC'
  ).all();

  return c.json({ data: results || [] });
});

adminSubscribers.delete('/:id', async (c) => {
  const id = c.req.param('id');

  const existing = await c.env.DB.prepare(
    'SELECT id FROM subscribers WHERE id = ?'
  )
    .bind(id)
    .first();

  if (!existing) {
    return c.json({ error: 'Subscriber not found' }, 404);
  }

  await c.env.DB.prepare('DELETE FROM subscribers WHERE id = ?')
    .bind(id)
    .run();

  return c.json({ success: true });
});
