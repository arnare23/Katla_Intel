import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { AppEnv } from './types';

// Route imports
import { publicPosts } from './routes/posts';
import { publicEnquiries } from './routes/enquiries';
import { publicCaseStudies } from './routes/case-studies';
import { publicJobs } from './routes/jobs';
import { publicResearch } from './routes/research';
import { publicSubscribers } from './routes/subscribers';

const app = new Hono<AppEnv>();

// ---------------------------------------------------------------------------
// Global middleware
// ---------------------------------------------------------------------------

app.use('*', logger());

app.use('*', async (c, next) => {
  const corsMiddleware = cors({
    origin: c.env.CORS_ORIGIN || '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
    maxAge: 86400,
  });
  return corsMiddleware(c, next);
});

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------

app.get('/api/v1/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// Public routes
// ---------------------------------------------------------------------------

app.route('/api/v1/posts', publicPosts);
app.route('/api/v1/enquiries', publicEnquiries);
app.route('/api/v1/case-studies', publicCaseStudies);
app.route('/api/v1/jobs', publicJobs);
app.route('/api/v1/research', publicResearch);
app.route('/api/v1/subscribers', publicSubscribers);

// ---------------------------------------------------------------------------
// 404 fallback
// ---------------------------------------------------------------------------

app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// ---------------------------------------------------------------------------
// Global error handler
// ---------------------------------------------------------------------------

app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
