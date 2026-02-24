import { SignJWT, jwtVerify } from 'jose';

const ALGORITHM = 'HS256';
const EXPIRY = '24h';

function getSecretKey(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

export async function signJWT(
  payload: { sub: string; email: string },
  secret: string
): Promise<string> {
  const key = getSecretKey(secret);

  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .setIssuer('katla-api')
    .sign(key);
}

export async function verifyJWT(
  token: string,
  secret: string
): Promise<{ sub: string; email: string }> {
  const key = getSecretKey(secret);

  const { payload } = await jwtVerify(token, key, {
    issuer: 'katla-api',
    algorithms: [ALGORITHM],
  });

  return {
    sub: payload.sub as string,
    email: payload.email as string,
  };
}
