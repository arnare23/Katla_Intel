import { Hono } from 'hono';
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
