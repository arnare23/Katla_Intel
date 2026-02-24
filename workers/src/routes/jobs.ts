import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import type { AppEnv } from '../types';

// ---------------------------------------------------------------------------
// Public routes  (mounted at /api/v1/jobs)
// ---------------------------------------------------------------------------

export const publicJobs = new Hono<AppEnv>();

publicJobs.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM jobs WHERE status = ? ORDER BY display_order ASC, created_at DESC'
  )
    .bind('published')
    .all();

  return c.json({ data: (results || []).map(parseJobRow) });
});

// ---------------------------------------------------------------------------
// Admin routes  (mounted at /api/v1/admin/jobs)
// ---------------------------------------------------------------------------

export const adminJobs = new Hono<AppEnv>();

adminJobs.use('*', requireAuth);

adminJobs.get('/', async (c) => {
  const status = c.req.query('status');

  let sql = 'SELECT * FROM jobs';
  const params: string[] = [];

  if (status) {
    sql += ' WHERE status = ?';
    params.push(status);
  }

  sql += ' ORDER BY display_order ASC, created_at DESC';

  const { results } = await c.env.DB.prepare(sql).bind(...params).all();

  return c.json({ data: (results || []).map(parseJobRow) });
});

adminJobs.post('/', async (c) => {
  const body = await c.req.json();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  if (!body.title) {
    return c.json({ error: 'Title is required' }, 400);
  }

  await c.env.DB.prepare(
    `INSERT INTO jobs (id, title, type, location, department, short_description, requirements, content, status, display_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      body.title,
      body.type || null,
      body.location || null,
      body.department || null,
      body.short_description || null,
      JSON.stringify(body.requirements || []),
      body.content || null,
      body.status || 'draft',
      body.display_order ?? 0,
      now,
      now
    )
    .run();

  return c.json({ id }, 201);
});

adminJobs.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const now = new Date().toISOString();

  const existing = await c.env.DB.prepare('SELECT * FROM jobs WHERE id = ?')
    .bind(id)
    .first();
  if (!existing) {
    return c.json({ error: 'Job not found' }, 404);
  }

  await c.env.DB.prepare(
    `UPDATE jobs SET
       title = ?, type = ?, location = ?, department = ?, short_description = ?,
       requirements = ?, content = ?, status = ?, display_order = ?, updated_at = ?
     WHERE id = ?`
  )
    .bind(
      body.title ?? existing.title,
      body.type !== undefined ? body.type : existing.type,
      body.location !== undefined ? body.location : existing.location,
      body.department !== undefined ? body.department : existing.department,
      body.short_description !== undefined
        ? body.short_description
        : existing.short_description,
      body.requirements !== undefined
        ? JSON.stringify(body.requirements)
        : (existing.requirements as string),
      body.content !== undefined ? body.content : existing.content,
      body.status ?? existing.status,
      body.display_order !== undefined
        ? body.display_order
        : existing.display_order,
      now,
      id
    )
    .run();

  return c.json({ success: true });
});

adminJobs.delete('/:id', async (c) => {
  const id = c.req.param('id');

  const existing = await c.env.DB.prepare('SELECT id FROM jobs WHERE id = ?')
    .bind(id)
    .first();
  if (!existing) {
    return c.json({ error: 'Job not found' }, 404);
  }

  await c.env.DB.prepare('DELETE FROM jobs WHERE id = ?').bind(id).run();

  return c.json({ success: true });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseJobRow(row: Record<string, unknown>) {
  return {
    ...row,
    requirements: safeJsonParse(row.requirements as string, []),
  };
}

function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}
