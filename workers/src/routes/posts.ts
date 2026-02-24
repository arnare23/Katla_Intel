import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import type { AppEnv } from '../types';

// ---------------------------------------------------------------------------
// Public routes  (mounted at /api/v1/posts)
// ---------------------------------------------------------------------------

export const publicPosts = new Hono<AppEnv>();

publicPosts.get('/', async (c) => {
  const category = c.req.query('category');
  const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 100);
  const offset = parseInt(c.req.query('offset') || '0', 10);
  const featured = c.req.query('featured');

  let sql = 'SELECT * FROM posts WHERE status = ?';
  const params: (string | number)[] = ['published'];

  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }

  if (featured === '1' || featured === 'true') {
    sql += ' AND featured = 1';
  }

  sql += ' ORDER BY published_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const { results } = await c.env.DB.prepare(sql).bind(...params).all();

  const rows = (results || []).map(parsePostRow);

  // Total count for pagination
  let countSql = 'SELECT COUNT(*) as total FROM posts WHERE status = ?';
  const countParams: (string | number)[] = ['published'];
  if (category) {
    countSql += ' AND category = ?';
    countParams.push(category);
  }
  if (featured === '1' || featured === 'true') {
    countSql += ' AND featured = 1';
  }
  const countResult = await c.env.DB.prepare(countSql)
    .bind(...countParams)
    .first<{ total: number }>();

  return c.json({
    data: rows,
    pagination: {
      total: countResult?.total || 0,
      limit,
      offset,
    },
  });
});

publicPosts.get('/:slug', async (c) => {
  const slug = c.req.param('slug');

  const row = await c.env.DB.prepare(
    'SELECT * FROM posts WHERE slug = ? AND status = ?'
  )
    .bind(slug, 'published')
    .first();

  if (!row) {
    return c.json({ error: 'Post not found' }, 404);
  }

  return c.json({ data: parsePostRow(row) });
});

publicPosts.get('/:slug/related', async (c) => {
  const slug = c.req.param('slug');

  const current = await c.env.DB.prepare(
    'SELECT category FROM posts WHERE slug = ? AND status = ?'
  )
    .bind(slug, 'published')
    .first<{ category: string }>();

  if (!current || !current.category) {
    return c.json({ data: [] });
  }

  const { results } = await c.env.DB.prepare(
    'SELECT * FROM posts WHERE category = ? AND slug != ? AND status = ? ORDER BY published_at DESC LIMIT 3'
  )
    .bind(current.category, slug, 'published')
    .all();

  return c.json({ data: (results || []).map(parsePostRow) });
});

// ---------------------------------------------------------------------------
// Admin routes  (mounted at /api/v1/admin/posts)
// ---------------------------------------------------------------------------

export const adminPosts = new Hono<AppEnv>();

adminPosts.use('*', requireAuth);

adminPosts.get('/', async (c) => {
  const status = c.req.query('status');

  let sql = 'SELECT * FROM posts';
  const params: string[] = [];

  if (status) {
    sql += ' WHERE status = ?';
    params.push(status);
  }

  sql += ' ORDER BY created_at DESC';

  const { results } = await c.env.DB.prepare(sql).bind(...params).all();

  return c.json({ data: (results || []).map(parsePostRow) });
});

adminPosts.post('/', async (c) => {
  const body = await c.req.json();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  if (!body.title || !body.slug) {
    return c.json({ error: 'Title and slug are required' }, 400);
  }

  const existing = await c.env.DB.prepare(
    'SELECT id FROM posts WHERE slug = ?'
  )
    .bind(body.slug)
    .first();
  if (existing) {
    return c.json({ error: 'A post with this slug already exists' }, 409);
  }

  const publishedAt =
    body.status === 'published'
      ? body.published_at || now
      : body.published_at || null;

  await c.env.DB.prepare(
    `INSERT INTO posts (id, title, slug, category, author, excerpt, content, featured_image, tags, read_time, status, featured, published_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      body.title,
      body.slug,
      body.category || null,
      body.author || null,
      body.excerpt || null,
      body.content || null,
      body.featured_image || null,
      JSON.stringify(body.tags || []),
      body.read_time || 0,
      body.status || 'draft',
      body.featured ? 1 : 0,
      publishedAt,
      now,
      now
    )
    .run();

  return c.json({ id }, 201);
});

adminPosts.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const now = new Date().toISOString();

  const existing = await c.env.DB.prepare('SELECT * FROM posts WHERE id = ?')
    .bind(id)
    .first();
  if (!existing) {
    return c.json({ error: 'Post not found' }, 404);
  }

  if (body.slug && body.slug !== existing.slug) {
    const slugCheck = await c.env.DB.prepare(
      'SELECT id FROM posts WHERE slug = ? AND id != ?'
    )
      .bind(body.slug, id)
      .first();
    if (slugCheck) {
      return c.json({ error: 'A post with this slug already exists' }, 409);
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
    `UPDATE posts SET
       title = ?, slug = ?, category = ?, author = ?, excerpt = ?, content = ?,
       featured_image = ?, tags = ?, read_time = ?, status = ?, featured = ?,
       published_at = ?, updated_at = ?
     WHERE id = ?`
  )
    .bind(
      body.title ?? existing.title,
      body.slug ?? existing.slug,
      body.category !== undefined ? body.category : existing.category,
      body.author !== undefined ? body.author : existing.author,
      body.excerpt !== undefined ? body.excerpt : existing.excerpt,
      body.content !== undefined ? body.content : existing.content,
      body.featured_image !== undefined
        ? body.featured_image
        : existing.featured_image,
      body.tags !== undefined
        ? JSON.stringify(body.tags)
        : (existing.tags as string),
      body.read_time !== undefined ? body.read_time : existing.read_time,
      body.status ?? existing.status,
      body.featured !== undefined ? (body.featured ? 1 : 0) : existing.featured,
      publishedAt,
      now,
      id
    )
    .run();

  return c.json({ success: true });
});

adminPosts.delete('/:id', async (c) => {
  const id = c.req.param('id');

  const existing = await c.env.DB.prepare('SELECT id FROM posts WHERE id = ?')
    .bind(id)
    .first();
  if (!existing) {
    return c.json({ error: 'Post not found' }, 404);
  }

  await c.env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();

  return c.json({ success: true });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parsePostRow(row: Record<string, unknown>) {
  return {
    ...row,
    tags: safeJsonParse(row.tags as string, []),
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
