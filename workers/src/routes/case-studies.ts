import { Hono } from 'hono';
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
