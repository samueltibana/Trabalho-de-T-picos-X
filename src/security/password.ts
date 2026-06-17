const PBKDF2_ITERATIONS = 120_000
const SALT_BYTES = 16
const HASH_BYTES = 32

function bufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

async function deriveKey(password: string, salt: ArrayBuffer): Promise<ArrayBuffer> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  return crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    HASH_BYTES * 8,
  )
}

export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const saltBuffer = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const hashBuffer = await deriveKey(password, saltBuffer.buffer)
  return {
    hash: bufferToBase64(hashBuffer),
    salt: bufferToBase64(saltBuffer.buffer),
  }
}

export async function verifyPassword(
  password: string,
  storedHash: string,
  storedSalt: string,
): Promise<boolean> {
  try {
    const salt = base64ToBuffer(storedSalt)
    const hashBuffer = await deriveKey(password, salt)
    const candidate = bufferToBase64(hashBuffer)
    return timingSafeEqual(candidate, storedHash)
  } catch {
    return false
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}
