import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { AppEnv } from './types';

import auth from './routes/auth';
import posts from './routes/posts';
import enquiries from './routes/enquiries';
import caseStudies from './routes/case-studies';
import jobs from './routes/jobs';
import research from './routes/research';
import subscribers from './routes/subscribers';
import upload from './routes/upload';
import stats from './routes/stats';

const app = new Hono<AppEnv>();

// ---------------------------------------------------------------------------
// Global middleware
// ---------------------------------------------------------------------------

app.use('*', logger());

app.use(
  '*',
  async (c, next) => {
    const corsMiddleware = cors({
      origin: c.env.CORS_ORIGIN || '*',
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
      maxAge: 86400,
    });
    return corsMiddleware(c, next);
  }
);

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

// Auth
app.route('/api/v1/auth', auth);

// Posts (public)
app.get('/api/v1/posts', (c) => posts.fetch(c.req.raw, c.env, c.executionCtx));
app.get('/api/v1/posts/:slug', async (c) => {
  // Disambiguate: if slug is a UUID-like or actual slug, route to single post
  return posts.fetch(c.req.raw, c.env, c.executionCtx);
});
app.get('/api/v1/posts/:slug/related', (c) =>
  posts.fetch(c.req.raw, c.env, c.executionCtx)
);

// Case studies (public)
app.get('/api/v1/case-studies', (c) =>
  caseStudies.fetch(c.req.raw, c.env, c.executionCtx)
);
app.get('/api/v1/case-studies/:slug', (c) =>
  caseStudies.fetch(c.req.raw, c.env, c.executionCtx)
);

// Jobs (public)
app.get('/api/v1/jobs', (c) => jobs.fetch(c.req.raw, c.env, c.executionCtx));

// Research (public)
app.get('/api/v1/research', (c) =>
  research.fetch(c.req.raw, c.env, c.executionCtx)
);
app.get('/api/v1/research/:slug', (c) =>
  research.fetch(c.req.raw, c.env, c.executionCtx)
);

// Enquiries (public submit)
app.post('/api/v1/enquiries', (c) =>
  enquiries.fetch(c.req.raw, c.env, c.executionCtx)
);

// Subscribers (public signup)
app.post('/api/v1/subscribers', (c) =>
  subscribers.fetch(c.req.raw, c.env, c.executionCtx)
);

// ---------------------------------------------------------------------------
// Admin routes
// ---------------------------------------------------------------------------

// Admin - Posts
app.get('/api/v1/admin/posts', async (c) => {
  const url = new URL(c.req.url);
  url.pathname = '/admin/list';
  const req = new Request(url.toString(), c.req.raw);
  return posts.fetch(req, c.env, c.executionCtx);
});
app.post('/api/v1/admin/posts', async (c) => {
  const url = new URL(c.req.url);
  url.pathname = '/admin';
  const req = new Request(url.toString(), c.req.raw);
  return posts.fetch(req, c.env, c.executionCtx);
});
app.put('/api/v1/admin/posts/:id', async (c) => {
  const url = new URL(c.req.url);
  url.pathname = `/admin/${c.req.param('id')}`;
  const req = new Request(url.toString(), c.req.raw);
  return posts.fetch(req, c.env, c.executionCtx);
});
app.delete('/api/v1/admin/posts/:id', async (c) => {
  const url = new URL(c.req.url);
  url.pathname = `/admin/${c.req.param('id')}`;
  const req = new Request(url.toString(), c.req.raw);
  return posts.fetch(req, c.env, c.executionCtx);
});

// Admin - Enquiries
app.get('/api/v1/admin/enquiries', async (c) => {
  const url = new URL(c.req.url);
  url.pathname = '/admin/list';
  const req = new Request(url.toString(), c.req.raw);
  return enquiries.fetch(req, c.env, c.executionCtx);
});
app.get('/api/v1/admin/enquiries/:id', async (c) => {
  const url = new URL(c.req.url);
  url.pathname = `/admin/${c.req.param('id')}`;
  const req = new Request(url.toString(), c.req.raw);
  return enquiries.fetch(req, c.env, c.executionCtx);
});
app.put('/api/v1/admin/enquiries/:id', async (c) => {
  const url = new URL(c.req.url);
  url.pathname = `/admin/${c.req.param('id')}`;
  const req = new Request(url.toString(), c.req.raw);
  return enquiries.fetch(req, c.env, c.executionCtx);
});
app.delete('/api/v1/admin/enquiries/:id', async (c) => {
  const url = new URL(c.req.url);
  url.pathname = `/admin/${c.req.param('id')}`;
  const req = new Request(url.toString(), c.req.raw);
  return enquiries.fetch(req, c.env, c.executionCtx);
});

// Admin - Case Studies
app.get('/api/v1/admin/case-studies', async (c) => {
  const url = new URL(c.req.url);
  url.pathname = '/admin/list';
  const req = new Request(url.toString(), c.req.raw);
  return caseStudies.fetch(req, c.env, c.executionCtx);
});
app.post('/api/v1/admin/case-studies', async (c) => {
  const url = new URL(c.req.url);
  url.pathname = '/admin';
  const req = new Request(url.toString(), c.req.raw);
  return caseStudies.fetch(req, c.env, c.executionCtx);
});
app.put('/api/v1/admin/case-studies/:id', async (c) => {
  const url = new URL(c.req.url);
  url.pathname = `/admin/${c.req.param('id')}`;
  const req = new Request(url.toString(), c.req.raw);
  return caseStudies.fetch(req, c.env, c.executionCtx);
});
app.delete('/api/v1/admin/case-studies/:id', async (c) => {
  const url = new URL(c.req.url);
  url.pathname = `/admin/${c.req.param('id')}`;
  const req = new Request(url.toString(), c.req.raw);
  return caseStudies.fetch(req, c.env, c.executionCtx);
});

// Admin - Jobs
app.get('/api/v1/admin/jobs', async (c) => {
  const url = new URL(c.req.url);
  url.pathname = '/admin/list';
  const req = new Request(url.toString(), c.req.raw);
  return jobs.fetch(req, c.env, c.executionCtx);
});
app.post('/api/v1/admin/jobs', async (c) => {
  const url = new URL(c.req.url);
  url.pathname = '/admin';
  const req = new Request(url.toString(), c.req.raw);
  return jobs.fetch(req, c.env, c.executionCtx);
});
app.put('/api/v1/admin/jobs/:id', async (c) => {
  const url = new URL(c.req.url);
  url.pathname = `/admin/${c.req.param('id')}`;
  const req = new Request(url.toString(), c.req.raw);
  return jobs.fetch(req, c.env, c.executionCtx);
});
app.delete('/api/v1/admin/jobs/:id', async (c) => {
  const url = new URL(c.req.url);
  url.pathname = `/admin/${c.req.param('id')}`;
  const req = new Request(url.toString(), c.req.raw);
  return jobs.fetch(req, c.env, c.executionCtx);
});

// Admin - Research
app.get('/api/v1/admin/research', async (c) => {
  const url = new URL(c.req.url);
  url.pathname = '/admin/list';
  const req = new Request(url.toString(), c.req.raw);
  return research.fetch(req, c.env, c.executionCtx);
});
app.post('/api/v1/admin/research', async (c) => {
  const url = new URL(c.req.url);
  url.pathname = '/admin';
  const req = new Request(url.toString(), c.req.raw);
  return research.fetch(req, c.env, c.executionCtx);
});
app.put('/api/v1/admin/research/:id', async (c) => {
  const url = new URL(c.req.url);
  url.pathname = `/admin/${c.req.param('id')}`;
  const req = new Request(url.toString(), c.req.raw);
  return research.fetch(req, c.env, c.executionCtx);
});
app.delete('/api/v1/admin/research/:id', async (c) => {
  const url = new URL(c.req.url);
  url.pathname = `/admin/${c.req.param('id')}`;
  const req = new Request(url.toString(), c.req.raw);
  return research.fetch(req, c.env, c.executionCtx);
});

// Admin - Subscribers
app.get('/api/v1/admin/subscribers', async (c) => {
  const url = new URL(c.req.url);
  url.pathname = '/admin/list';
  const req = new Request(url.toString(), c.req.raw);
  return subscribers.fetch(req, c.env, c.executionCtx);
});
app.delete('/api/v1/admin/subscribers/:id', async (c) => {
  const url = new URL(c.req.url);
  url.pathname = `/admin/${c.req.param('id')}`;
  const req = new Request(url.toString(), c.req.raw);
  return subscribers.fetch(req, c.env, c.executionCtx);
});

// Admin - Upload
app.post('/api/v1/admin/upload/image', async (c) => {
  const url = new URL(c.req.url);
  url.pathname = '/image';
  const req = new Request(url.toString(), c.req.raw);
  return upload.fetch(req, c.env, c.executionCtx);
});
app.post('/api/v1/admin/upload/pdf', async (c) => {
  const url = new URL(c.req.url);
  url.pathname = '/pdf';
  const req = new Request(url.toString(), c.req.raw);
  return upload.fetch(req, c.env, c.executionCtx);
});
app.delete('/api/v1/admin/upload', async (c) => {
  const url = new URL(c.req.url);
  url.pathname = '/';
  const req = new Request(url.toString(), c.req.raw);
  return upload.fetch(req, c.env, c.executionCtx);
});

// Admin - Stats
app.get('/api/v1/admin/stats', async (c) => {
  const url = new URL(c.req.url);
  url.pathname = '/';
  const req = new Request(url.toString(), c.req.raw);
  return stats.fetch(req, c.env, c.executionCtx);
});

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
  return c.json(
    { error: 'Internal server error' },
    500
  );
});

export default app;
