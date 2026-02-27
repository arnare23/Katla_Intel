import { Hono } from 'hono';
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
