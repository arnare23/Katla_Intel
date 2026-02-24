import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import type { AppEnv } from '../types';

const stats = new Hono<AppEnv>();

stats.get('/', requireAuth, async (c) => {
  // Run all four COUNT queries in parallel
  const [enquiriesResult, postsResult, caseStudiesResult, jobsResult] =
    await Promise.all([
      c.env.DB.prepare(
        "SELECT COUNT(*) as count FROM enquiries WHERE status = 'new'"
      ).first<{ count: number }>(),
      c.env.DB.prepare(
        "SELECT COUNT(*) as count FROM posts WHERE status = 'published'"
      ).first<{ count: number }>(),
      c.env.DB.prepare(
        "SELECT COUNT(*) as count FROM case_studies WHERE status = 'published'"
      ).first<{ count: number }>(),
      c.env.DB.prepare(
        "SELECT COUNT(*) as count FROM jobs WHERE status = 'published'"
      ).first<{ count: number }>(),
    ]);

  return c.json({
    enquiries: enquiriesResult?.count ?? 0,
    posts: postsResult?.count ?? 0,
    caseStudies: caseStudiesResult?.count ?? 0,
    jobs: jobsResult?.count ?? 0,
  });
});

export default stats;
