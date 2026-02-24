const ITERATIONS = 100_000;
const KEY_LENGTH = 64;
const HASH_ALGORITHM = 'SHA-256';
const SALT_LENGTH = 16;

function hexToBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer;
}

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function deriveKey(
  password: string,
  salt: ArrayBuffer
): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  return crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: HASH_ALGORITHM,
    },
    keyMaterial,
    KEY_LENGTH * 8
  );
}

export async function hashPassword(password: string): Promise<string> {
  const saltBuffer = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const hash = await deriveKey(password, saltBuffer.buffer);
  const saltHex = bufferToHex(saltBuffer.buffer);
  const hashHex = bufferToHex(hash);
  return `${saltHex}:${hashHex}`;
}

export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const [saltHex, storedHashHex] = stored.split(':');
  if (!saltHex || !storedHashHex) {
    return false;
  }

  const saltBuffer = hexToBuffer(saltHex);
  const hash = await deriveKey(password, saltBuffer);
  const hashHex = bufferToHex(hash);

  // Constant-time comparison to prevent timing attacks
  if (hashHex.length !== storedHashHex.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < hashHex.length; i++) {
    result |= hashHex.charCodeAt(i) ^ storedHashHex.charCodeAt(i);
  }
  return result === 0;
}
