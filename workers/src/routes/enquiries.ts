import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
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

// ---------------------------------------------------------------------------
// Admin routes  (mounted at /api/v1/admin/enquiries)
// ---------------------------------------------------------------------------

export const adminEnquiries = new Hono<AppEnv>();

adminEnquiries.use('*', requireAuth);

adminEnquiries.get('/', async (c) => {
  const status = c.req.query('status');

  let sql = 'SELECT * FROM enquiries';
  const params: string[] = [];

  if (status) {
    sql += ' WHERE status = ?';
    params.push(status);
  }

  sql += ' ORDER BY created_at DESC';

  const { results } = await c.env.DB.prepare(sql).bind(...params).all();

  return c.json({ data: results || [] });
});

adminEnquiries.get('/:id', async (c) => {
  const id = c.req.param('id');

  const row = await c.env.DB.prepare('SELECT * FROM enquiries WHERE id = ?')
    .bind(id)
    .first();

  if (!row) {
    return c.json({ error: 'Enquiry not found' }, 404);
  }

  // Auto-mark as read if currently 'new'
  if (row.status === 'new') {
    const now = new Date().toISOString();
    await c.env.DB.prepare(
      'UPDATE enquiries SET status = ?, read_at = ?, updated_at = ? WHERE id = ?'
    )
      .bind('read', now, now, id)
      .run();

    row.status = 'read';
    row.read_at = now;
    row.updated_at = now;
  }

  return c.json({ data: row });
});

adminEnquiries.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const now = new Date().toISOString();

  const existing = await c.env.DB.prepare(
    'SELECT * FROM enquiries WHERE id = ?'
  )
    .bind(id)
    .first();

  if (!existing) {
    return c.json({ error: 'Enquiry not found' }, 404);
  }

  await c.env.DB.prepare(
    'UPDATE enquiries SET status = ?, notes = ?, updated_at = ? WHERE id = ?'
  )
    .bind(
      body.status ?? existing.status,
      body.notes !== undefined ? body.notes : existing.notes,
      now,
      id
    )
    .run();

  return c.json({ success: true });
});

adminEnquiries.delete('/:id', async (c) => {
  const id = c.req.param('id');

  const existing = await c.env.DB.prepare(
    'SELECT id FROM enquiries WHERE id = ?'
  )
    .bind(id)
    .first();

  if (!existing) {
    return c.json({ error: 'Enquiry not found' }, 404);
  }

  await c.env.DB.prepare('DELETE FROM enquiries WHERE id = ?').bind(id).run();

  return c.json({ success: true });
});
