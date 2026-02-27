import { Hono } from 'hono';
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
