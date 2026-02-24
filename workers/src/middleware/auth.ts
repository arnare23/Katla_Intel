import { Context, Next } from 'hono';
import { verifyJWT } from '../lib/jwt';
import type { AppEnv } from '../types';

export async function requireAuth(c: Context<AppEnv>, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader) {
    return c.json({ error: 'Authorization header required' }, 401);
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return c.json({ error: 'Invalid authorization format. Use: Bearer <token>' }, 401);
  }

  const token = parts[1];

  try {
    const payload = await verifyJWT(token, c.env.JWT_SECRET);
    c.set('user', payload);
    await next();
  } catch {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
}
