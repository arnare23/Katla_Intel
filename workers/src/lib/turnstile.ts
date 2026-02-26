const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

interface TurnstileResult {
  success: boolean;
  'error-codes'?: string[];
}

export async function verifyTurnstile(
  token: string,
  secretKey: string,
  remoteIp?: string
): Promise<boolean> {
  const body: Record<string, string> = {
    secret: secretKey,
    response: token,
  };
  if (remoteIp) {
    body.remoteip = remoteIp;
  }

  const res = await fetch(SITEVERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body).toString(),
  });

  const result: TurnstileResult = await res.json();
  return result.success;
}
