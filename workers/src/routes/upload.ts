import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import type { AppEnv } from '../types';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_PDF_SIZE = 20 * 1024 * 1024; // 20 MB

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

// ---------------------------------------------------------------------------
// Admin upload routes  (mounted at /api/v1/admin/upload)
// ---------------------------------------------------------------------------

export const adminUpload = new Hono<AppEnv>();

adminUpload.use('*', requireAuth);

adminUpload.post('/image', async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return c.json({ error: 'No file provided' }, 400);
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return c.json(
      {
        error: `Invalid file type: ${file.type}. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
      },
      400
    );
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return c.json(
      {
        error: `File too large. Maximum size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
      },
      400
    );
  }

  const sanitizedName = sanitizeFilename(file.name);
  const key = `images/${Date.now()}_${sanitizedName}`;

  await c.env.ASSETS.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type,
    },
  });

  return c.json(
    {
      key,
      url: `/assets/${key}`,
      size: file.size,
      type: file.type,
    },
    201
  );
});

adminUpload.post('/pdf', async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return c.json({ error: 'No file provided' }, 400);
  }

  if (file.type !== 'application/pdf') {
    return c.json(
      {
        error: `Invalid file type: ${file.type}. Only application/pdf is allowed`,
      },
      400
    );
  }

  if (file.size > MAX_PDF_SIZE) {
    return c.json(
      {
        error: `File too large. Maximum size is ${MAX_PDF_SIZE / 1024 / 1024}MB`,
      },
      400
    );
  }

  const sanitizedName = sanitizeFilename(file.name);
  const key = `pdfs/${Date.now()}_${sanitizedName}`;

  await c.env.ASSETS.put(key, file.stream(), {
    httpMetadata: {
      contentType: 'application/pdf',
    },
  });

  return c.json(
    {
      key,
      url: `/assets/${key}`,
      size: file.size,
      type: file.type,
    },
    201
  );
});

adminUpload.delete('/', async (c) => {
  const body = await c.req.json<{ key?: string }>();

  if (!body.key) {
    return c.json({ error: 'File key is required' }, 400);
  }

  // Prevent path traversal
  if (body.key.includes('..') || body.key.startsWith('/')) {
    return c.json({ error: 'Invalid file key' }, 400);
  }

  const object = await c.env.ASSETS.head(body.key);
  if (!object) {
    return c.json({ error: 'File not found' }, 404);
  }

  await c.env.ASSETS.delete(body.key);

  return c.json({ success: true });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}
