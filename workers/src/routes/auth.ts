import { Hono } from 'hono';
import { signJWT } from '../lib/jwt';
import { verifyPassword } from '../lib/password';
import type { AppEnv } from '../types';

const auth = new Hono<AppEnv>();

auth.post('/login', async (c) => {
  const body = await c.req.json<{ email?: string; password?: string }>();

  if (!body.email || !body.password) {
    return c.json({ error: 'Email and password are required' }, 400);
  }

  const email = body.email.trim().toLowerCase();

  const user = await c.env.DB.prepare(
    'SELECT id, email, password_hash FROM admin_users WHERE email = ?'
  )
    .bind(email)
    .first<{ id: string; email: string; password_hash: string }>();

  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const valid = await verifyPassword(body.password, user.password_hash);
  if (!valid) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const token = await signJWT(
    { sub: user.id, email: user.email },
    c.env.JWT_SECRET
  );

  return c.json({
    token,
    expiresIn: '24h',
  });
});

export default auth;
