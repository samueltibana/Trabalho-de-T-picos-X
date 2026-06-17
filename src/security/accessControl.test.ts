import { describe, expect, it } from 'vitest'
import { hasPermission, resolveRole } from './accessControl'

describe('accessControl', () => {
  it('grants game permissions to user role', () => {
    expect(hasPermission('user', 'game:play')).toBe(true)
    expect(hasPermission('user', 'game:save')).toBe(true)
    expect(hasPermission('user', 'admin:manage')).toBe(false)
  })

  it('grants admin permissions to admin role', () => {
    expect(hasPermission('admin', 'admin:manage')).toBe(true)
    expect(hasPermission('admin', 'game:play')).toBe(true)
  })

  it('resolves admin role from allowlist', () => {
    expect(resolveRole('Joao', ['admin', 'joao'])).toBe('admin')
    expect(resolveRole('maria', ['admin'])).toBe('user')
  })
})
