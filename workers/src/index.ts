import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { AppEnv } from './types';

// Route imports
import auth from './routes/auth';
import { publicPosts, adminPosts } from './routes/posts';
import { publicEnquiries, adminEnquiries } from './routes/enquiries';
import { publicCaseStudies, adminCaseStudies } from './routes/case-studies';
import { publicJobs, adminJobs } from './routes/jobs';
import { publicResearch, adminResearch } from './routes/research';
import { publicSubscribers, adminSubscribers } from './routes/subscribers';
import { adminUpload } from './routes/upload';
import { adminStats } from './routes/stats';

const app = new Hono<AppEnv>();

// ---------------------------------------------------------------------------
// Global middleware
// ---------------------------------------------------------------------------

app.use('*', logger());

app.use('*', async (c, next) => {
  const corsMiddleware = cors({
    origin: c.env.CORS_ORIGIN || '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
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
// Auth
// ---------------------------------------------------------------------------

app.route('/api/v1/auth', auth);

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
// Admin routes (auth enforced inside each sub-router via middleware)
// ---------------------------------------------------------------------------

app.route('/api/v1/admin/posts', adminPosts);
app.route('/api/v1/admin/enquiries', adminEnquiries);
app.route('/api/v1/admin/case-studies', adminCaseStudies);
app.route('/api/v1/admin/jobs', adminJobs);
app.route('/api/v1/admin/research', adminResearch);
app.route('/api/v1/admin/subscribers', adminSubscribers);
app.route('/api/v1/admin/upload', adminUpload);
app.route('/api/v1/admin/stats', adminStats);

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
