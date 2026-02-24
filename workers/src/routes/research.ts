import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import type { AppEnv } from '../types';

// ---------------------------------------------------------------------------
// Public routes  (mounted at /api/v1/research)
// ---------------------------------------------------------------------------

export const publicResearch = new Hono<AppEnv>();

publicResearch.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM research WHERE status = ? ORDER BY published_at DESC, created_at DESC'
  )
    .bind('published')
    .all();

  return c.json({ data: (results || []).map(parseResearchRow) });
});

publicResearch.get('/:slug', async (c) => {
  const slug = c.req.param('slug');

  const row = await c.env.DB.prepare(
    'SELECT * FROM research WHERE slug = ? AND status = ?'
  )
    .bind(slug, 'published')
    .first();

  if (!row) {
    return c.json({ error: 'Research paper not found' }, 404);
  }

  return c.json({ data: parseResearchRow(row) });
});

// ---------------------------------------------------------------------------
// Admin routes  (mounted at /api/v1/admin/research)
// ---------------------------------------------------------------------------

export const adminResearch = new Hono<AppEnv>();

adminResearch.use('*', requireAuth);

adminResearch.get('/', async (c) => {
  const status = c.req.query('status');

  let sql = 'SELECT * FROM research';
  const params: string[] = [];

  if (status) {
    sql += ' WHERE status = ?';
    params.push(status);
  }

  sql += ' ORDER BY created_at DESC';

  const { results } = await c.env.DB.prepare(sql).bind(...params).all();

  return c.json({ data: (results || []).map(parseResearchRow) });
});

adminResearch.post('/', async (c) => {
  const body = await c.req.json();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  if (!body.title || !body.slug) {
    return c.json({ error: 'Title and slug are required' }, 400);
  }

  const existing = await c.env.DB.prepare(
    'SELECT id FROM research WHERE slug = ?'
  )
    .bind(body.slug)
    .first();
  if (existing) {
    return c.json(
      { error: 'A research paper with this slug already exists' },
      409
    );
  }

  const publishedAt =
    body.status === 'published'
      ? body.published_at || now
      : body.published_at || null;

  await c.env.DB.prepare(
    `INSERT INTO research (id, title, slug, authors, abstract, content, featured_image, tags, pdf_url, status, published_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      body.title,
      body.slug,
      JSON.stringify(body.authors || []),
      body.abstract || null,
      body.content || null,
      body.featured_image || null,
      JSON.stringify(body.tags || []),
      body.pdf_url || null,
      body.status || 'draft',
      publishedAt,
      now,
      now
    )
    .run();

  return c.json({ id }, 201);
});

adminResearch.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const now = new Date().toISOString();

  const existing = await c.env.DB.prepare(
    'SELECT * FROM research WHERE id = ?'
  )
    .bind(id)
    .first();
  if (!existing) {
    return c.json({ error: 'Research paper not found' }, 404);
  }

  if (body.slug && body.slug !== existing.slug) {
    const slugCheck = await c.env.DB.prepare(
      'SELECT id FROM research WHERE slug = ? AND id != ?'
    )
      .bind(body.slug, id)
      .first();
    if (slugCheck) {
      return c.json(
        { error: 'A research paper with this slug already exists' },
        409
      );
    }
  }

  let publishedAt =
    body.published_at !== undefined
      ? body.published_at
      : existing.published_at;
  if (
    body.status === 'published' &&
    existing.status !== 'published' &&
    !publishedAt
  ) {
    publishedAt = now;
  }

  await c.env.DB.prepare(
    `UPDATE research SET
       title = ?, slug = ?, authors = ?, abstract = ?, content = ?,
       featured_image = ?, tags = ?, pdf_url = ?, status = ?,
       published_at = ?, updated_at = ?
     WHERE id = ?`
  )
    .bind(
      body.title ?? existing.title,
      body.slug ?? existing.slug,
      body.authors !== undefined
        ? JSON.stringify(body.authors)
        : (existing.authors as string),
      body.abstract !== undefined ? body.abstract : existing.abstract,
      body.content !== undefined ? body.content : existing.content,
      body.featured_image !== undefined
        ? body.featured_image
        : existing.featured_image,
      body.tags !== undefined
        ? JSON.stringify(body.tags)
        : (existing.tags as string),
      body.pdf_url !== undefined ? body.pdf_url : existing.pdf_url,
      body.status ?? existing.status,
      publishedAt,
      now,
      id
    )
    .run();

  return c.json({ success: true });
});

adminResearch.delete('/:id', async (c) => {
  const id = c.req.param('id');

  const existing = await c.env.DB.prepare(
    'SELECT id FROM research WHERE id = ?'
  )
    .bind(id)
    .first();
  if (!existing) {
    return c.json({ error: 'Research paper not found' }, 404);
  }

  await c.env.DB.prepare('DELETE FROM research WHERE id = ?').bind(id).run();

  return c.json({ success: true });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseResearchRow(row: Record<string, unknown>) {
  return {
    ...row,
    authors: safeJsonParse(row.authors as string, []),
    tags: safeJsonParse(row.tags as string, []),
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
