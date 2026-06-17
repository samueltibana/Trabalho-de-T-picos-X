import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createSessionToken, isTokenExpired, validateSessionToken } from './token'

describe('session tokens', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-16T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('creates a token that validates with username and role', async () => {
    const token = await createSessionToken('joao', 'user')
    const payload = await validateSessionToken(token)

    expect(payload).not.toBeNull()
    expect(payload?.username).toBe('joao')
    expect(payload?.role).toBe('user')
    expect(payload!.expiresAt).toBeGreaterThan(Date.now())
  })

  it('rejects tampered tokens', async () => {
    const token = await createSessionToken('joao', 'user')
    const [encoded] = token.split('.')
    const tampered = `${encoded}x.${token.split('.')[1]}`

    expect(await validateSessionToken(tampered)).toBeNull()
    expect(await validateSessionToken('not-a-token')).toBeNull()
  })

  it('rejects expired tokens', async () => {
    const token = await createSessionToken('joao', 'user')

    vi.setSystemTime(new Date('2026-07-20T12:00:00Z'))
    expect(await validateSessionToken(token)).toBeNull()
  })

  it('isTokenExpired reflects expiry', async () => {
    const token = await createSessionToken('joao', 'user')
    const payload = (await validateSessionToken(token))!

    expect(isTokenExpired(payload)).toBe(false)

    vi.setSystemTime(new Date('2026-07-20T12:00:00Z'))
    expect(isTokenExpired(payload)).toBe(true)
  })
})
