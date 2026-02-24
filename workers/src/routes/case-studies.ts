import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import type { AppEnv } from '../types';

// ---------------------------------------------------------------------------
// Public routes  (mounted at /api/v1/case-studies)
// ---------------------------------------------------------------------------

export const publicCaseStudies = new Hono<AppEnv>();

publicCaseStudies.get('/', async (c) => {
  const category = c.req.query('category');

  let sql = 'SELECT * FROM case_studies WHERE status = ?';
  const params: string[] = ['published'];

  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }

  sql += ' ORDER BY display_order ASC, created_at DESC';

  const { results } = await c.env.DB.prepare(sql).bind(...params).all();

  return c.json({ data: (results || []).map(parseCaseStudyRow) });
});

publicCaseStudies.get('/:slug', async (c) => {
  const slug = c.req.param('slug');

  const row = await c.env.DB.prepare(
    'SELECT * FROM case_studies WHERE slug = ? AND status = ?'
  )
    .bind(slug, 'published')
    .first();

  if (!row) {
    return c.json({ error: 'Case study not found' }, 404);
  }

  return c.json({ data: parseCaseStudyRow(row) });
});

// ---------------------------------------------------------------------------
// Admin routes  (mounted at /api/v1/admin/case-studies)
// ---------------------------------------------------------------------------

export const adminCaseStudies = new Hono<AppEnv>();

adminCaseStudies.use('*', requireAuth);

adminCaseStudies.get('/', async (c) => {
  const status = c.req.query('status');

  let sql = 'SELECT * FROM case_studies';
  const params: string[] = [];

  if (status) {
    sql += ' WHERE status = ?';
    params.push(status);
  }

  sql += ' ORDER BY display_order ASC, created_at DESC';

  const { results } = await c.env.DB.prepare(sql).bind(...params).all();

  return c.json({ data: (results || []).map(parseCaseStudyRow) });
});

adminCaseStudies.post('/', async (c) => {
  const body = await c.req.json();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  if (!body.title || !body.slug) {
    return c.json({ error: 'Title and slug are required' }, 400);
  }

  const existing = await c.env.DB.prepare(
    'SELECT id FROM case_studies WHERE slug = ?'
  )
    .bind(body.slug)
    .first();
  if (existing) {
    return c.json(
      { error: 'A case study with this slug already exists' },
      409
    );
  }

  await c.env.DB.prepare(
    `INSERT INTO case_studies (id, title, slug, category, client, description, content, featured_image, metrics, technologies, status, featured, display_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      body.title,
      body.slug,
      body.category || null,
      body.client || null,
      body.description || null,
      body.content || null,
      body.featured_image || null,
      JSON.stringify(body.metrics || []),
      JSON.stringify(body.technologies || []),
      body.status || 'draft',
      body.featured ? 1 : 0,
      body.display_order ?? 0,
      now,
      now
    )
    .run();

  return c.json({ id }, 201);
});

adminCaseStudies.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const now = new Date().toISOString();

  const existing = await c.env.DB.prepare(
    'SELECT * FROM case_studies WHERE id = ?'
  )
    .bind(id)
    .first();
  if (!existing) {
    return c.json({ error: 'Case study not found' }, 404);
  }

  if (body.slug && body.slug !== existing.slug) {
    const slugCheck = await c.env.DB.prepare(
      'SELECT id FROM case_studies WHERE slug = ? AND id != ?'
    )
      .bind(body.slug, id)
      .first();
    if (slugCheck) {
      return c.json(
        { error: 'A case study with this slug already exists' },
        409
      );
    }
  }

  await c.env.DB.prepare(
    `UPDATE case_studies SET
       title = ?, slug = ?, category = ?, client = ?, description = ?, content = ?,
       featured_image = ?, metrics = ?, technologies = ?, status = ?, featured = ?,
       display_order = ?, updated_at = ?
     WHERE id = ?`
  )
    .bind(
      body.title ?? existing.title,
      body.slug ?? existing.slug,
      body.category !== undefined ? body.category : existing.category,
      body.client !== undefined ? body.client : existing.client,
      body.description !== undefined ? body.description : existing.description,
      body.content !== undefined ? body.content : existing.content,
      body.featured_image !== undefined
        ? body.featured_image
        : existing.featured_image,
      body.metrics !== undefined
        ? JSON.stringify(body.metrics)
        : (existing.metrics as string),
      body.technologies !== undefined
        ? JSON.stringify(body.technologies)
        : (existing.technologies as string),
      body.status ?? existing.status,
      body.featured !== undefined ? (body.featured ? 1 : 0) : existing.featured,
      body.display_order !== undefined
        ? body.display_order
        : existing.display_order,
      now,
      id
    )
    .run();

  return c.json({ success: true });
});

adminCaseStudies.delete('/:id', async (c) => {
  const id = c.req.param('id');

  const existing = await c.env.DB.prepare(
    'SELECT id FROM case_studies WHERE id = ?'
  )
    .bind(id)
    .first();
  if (!existing) {
    return c.json({ error: 'Case study not found' }, 404);
  }

  await c.env.DB.prepare('DELETE FROM case_studies WHERE id = ?')
    .bind(id)
    .run();

  return c.json({ success: true });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseCaseStudyRow(row: Record<string, unknown>) {
  return {
    ...row,
    metrics: safeJsonParse(row.metrics as string, []),
    technologies: safeJsonParse(row.technologies as string, []),
    featured: row.featured === 1,
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
