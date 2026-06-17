import { env } from '../config/env'

export type UserRole = 'user' | 'admin'

export interface SessionPayload {
  username: string
  role: UserRole
  issuedAt: number
  expiresAt: number
}

const encoder = new TextEncoder()

async function sign(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(env.sessionSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data))
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
}

async function verify(data: string, signature: string): Promise<boolean> {
  const expected = await sign(data)
  if (expected.length !== signature.length) return false
  let result = 0
  for (let i = 0; i < expected.length; i++) {
    result |= expected.charCodeAt(i) ^ signature.charCodeAt(i)
  }
  return result === 0
}

export async function createSessionToken(
  username: string,
  role: UserRole,
): Promise<string> {
  const now = Date.now()
  const payload: SessionPayload = {
    username,
    role,
    issuedAt: now,
    expiresAt: now + env.sessionTtlHours * 60 * 60 * 1000,
  }
  const encoded = btoa(JSON.stringify(payload))
  const signature = await sign(encoded)
  return `${encoded}.${signature}`
}

export async function validateSessionToken(token: string): Promise<SessionPayload | null> {
  const parts = token.split('.')
  if (parts.length !== 2) return null

  const [encoded, signature] = parts
  if (!(await verify(encoded, signature))) return null

  try {
    const payload = JSON.parse(atob(encoded)) as SessionPayload
    if (
      typeof payload.username !== 'string' ||
      typeof payload.expiresAt !== 'number' ||
      Date.now() > payload.expiresAt
    ) {
      return null
    }
    return payload
  } catch {
    return null
  }
}

export function isTokenExpired(payload: SessionPayload): boolean {
  return Date.now() > payload.expiresAt
}
