import { beforeAll, describe, expect, it } from 'vitest'
import { hashPassword, verifyPassword } from './password'

describe('password hashing', () => {
  let storedHash: string
  let storedSalt: string
  const password = 'secure-pass-123'

  beforeAll(async () => {
    const result = await hashPassword(password)
    storedHash = result.hash
    storedSalt = result.salt
  })

  it('generates distinct salt and hash per call', async () => {
    const second = await hashPassword(password)
    expect(second.hash).not.toBe(storedHash)
    expect(second.salt).not.toBe(storedSalt)
  })

  it('verifies correct password', async () => {
    expect(await verifyPassword(password, storedHash, storedSalt)).toBe(true)
  })

  it('rejects wrong password', async () => {
    expect(await verifyPassword('wrong-password', storedHash, storedSalt)).toBe(false)
  })

  it('rejects tampered hash or salt', async () => {
    expect(await verifyPassword(password, 'invalid', storedSalt)).toBe(false)
    expect(await verifyPassword(password, storedHash, 'invalid')).toBe(false)
  })
})
